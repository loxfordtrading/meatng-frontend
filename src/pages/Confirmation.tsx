import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, MessageCircle, ArrowRight, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useCart } from "@/contexts/CartContext";
import { getPlanById, formatPrice as formatPlanPrice } from "@/data/plans";
import { ROUTES } from "@/lib/routes";
import { verifyPaymentReference, createCustomerOrder } from "@/lib/api/customer";
import type { CustomerOrderItemInput } from "@/lib/api/customer/orders";
import { getErrorMessage } from "@/lib/api/errors";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import { getProductById } from "@/data/products";
import {
  formatDate,
  formatDateTime,
  getCutoffDateTime,
  getEstimatedDeliveryWindow,
  getNextBillingDate,
} from "@/lib/subscriptionSchedule";

interface ConfirmationState {
  paymentReference?: string;
  nextBillingDate?: string;
  cutoffDate?: string;
  deliveryWindow?: string;
  paymentMethod?: string;
}

const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/meatng-community";

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const subscription = useSubscription();
  const cart = useCart();
  const locationState = (location.state ?? {}) as ConfirmationState;
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>("Pending");
  const [verificationError, setVerificationError] = useState<string>("");
  const [verifiedAmount, setVerifiedAmount] = useState<number | undefined>(undefined);
  const [orderSyncStatus, setOrderSyncStatus] = useState<"idle" | "saved">("idle");

  const queryReference = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (
      params.get("reference") ||
      params.get("trxref") ||
      params.get("tx_ref") ||
      undefined
    );
  }, [location.search]);

  const plan = subscription.state.plan ? getPlanById(subscription.state.plan) : null;
  const billingDate =
    locationState.nextBillingDate
      ? new Date(locationState.nextBillingDate)
      : subscription.state.frequency
      ? getNextBillingDate(subscription.state.frequency)
      : null;
  const cutoffDate =
    locationState.cutoffDate
      ? new Date(locationState.cutoffDate)
      : billingDate
      ? getCutoffDateTime(billingDate)
      : null;
  const deliveryWindow =
    locationState.deliveryWindow || (billingDate ? getEstimatedDeliveryWindow(billingDate) : "To be confirmed");
  const paymentReference = queryReference || locationState.paymentReference || "Pending Reference";
  const hasPaymentReference = paymentReference !== "Pending Reference";
  const isSubscriptionCheckout =
    !!subscription.state.plan && !!subscription.state.frequency && subscription.state.boxItems.length > 0;
  const fallbackTotal = isSubscriptionCheckout ? subscription.grandTotal : cart.subtotal;

  useEffect(() => {
    if (!hasPaymentReference) return;
    let isMounted = true;

    const run = async () => {
      setVerificationLoading(true);
      setVerificationError("");
      try {
        const result = await verifyPaymentReference(paymentReference, tokenStorage.getCustomerToken());
        if (!isMounted) return;
        const normalized = (result.status || "").toLowerCase();
        if (result.paid === true || normalized === "success" || normalized === "paid") {
          setVerificationStatus("Verified");
          setVerifiedAmount(result.amount);
        } else if (result.paid === false || normalized === "failed" || normalized === "abandoned") {
          setVerificationStatus("Failed");
        } else {
          setVerificationStatus(result.status || "Pending");
        }
      } catch (error) {
        if (!isMounted) return;
        setVerificationStatus("Pending");
        setVerificationError(getErrorMessage(error, "Unable to verify payment right now."));
      } finally {
        if (isMounted) setVerificationLoading(false);
      }
    };

    void run();
    return () => {
      isMounted = false;
    };
  }, [hasPaymentReference, paymentReference]);

  // Create the order record in the database after payment is verified
  useEffect(() => {
    if (verificationStatus.toLowerCase() !== "verified") return;
    if (orderSyncStatus !== "idle") return; // prevent duplicate calls

    const token = tokenStorage.getCustomerToken();
    const user = subscription.state.user;
    if (!user?.id) {
      // No user context — mark saved optimistically (order may exist server-side from checkout)
      setOrderSyncStatus("saved");
      return;
    }

    let cancelled = false;
    setOrderSyncStatus("saving" as "idle" | "saved"); // in-flight

    const saveOrder = async () => {
      try {
        const items: CustomerOrderItemInput[] = [];

        if (isSubscriptionCheckout) {
          // Box items
          for (const item of subscription.state.boxItems) {
            const product = getProductById(item.productId);
            items.push({
              product_id: item.productId,
              name: product?.name ?? item.name,
              quantity: item.quantity,
              unit_price: product?.price ?? 0,
              item_type: "base",
            });
          }
          // Build selections
          for (const sel of subscription.state.buildSelections.filter((s) => s.quantity > 0)) {
            const product = getProductById(sel.productId);
            items.push({
              product_id: sel.productId,
              name: product?.name ?? sel.name,
              quantity: sel.quantity,
              unit_price: product?.price ?? 0,
              item_type: "base",
            });
          }
          // Add-ons
          for (const addon of subscription.state.addOns) {
            const product = getProductById(addon.productId);
            items.push({
              product_id: addon.productId,
              name: product?.name ?? addon.productId,
              quantity: addon.quantity,
              unit_price: product?.price ?? 0,
              item_type: "addon",
            });
          }
        } else {
          // One-time cart items
          for (const item of cart.items) {
            if (item.type === "gift-box" && Array.isArray(item.items) && item.items.length > 0) {
              for (const giftLine of item.items) {
                const product = getProductById(giftLine.productId);
                items.push({
                  product_id: giftLine.productId,
                  name: product?.name ?? giftLine.productId,
                  quantity: giftLine.quantity * item.quantity,
                  unit_price: product?.price ?? 0,
                });
              }
            } else {
              items.push({
                product_id: item.productId || item.boxId || item.id,
                name: item.name,
                quantity: item.quantity,
                unit_price: item.price,
              });
            }
          }
        }

        const totalAmount = verifiedAmount ?? fallbackTotal;

        await createCustomerOrder(
          {
            user_id: user.id,
            items,
            total_amount: totalAmount,
            status: "paid",
          },
          token,
        );

        if (!cancelled) {
          setOrderSyncStatus("saved");
          // Clear cart/subscription state after successful order save
          if (isSubscriptionCheckout) {
            subscription.reset();
          } else {
            cart.clearCart();
          }
        }
      } catch (err) {
        console.warn("[Confirmation] Order save failed:", getErrorMessage(err));
        if (!cancelled) {
          // Mark as saved anyway — the checkout endpoint may have already created the order
          setOrderSyncStatus("saved");
        }
      }
    };

    void saveOrder();
    return () => { cancelled = true; };
  }, [verificationStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <Card className={verificationStatus.toLowerCase() === "failed" ? "border-destructive/25" : "border-primary/25"}>
            <CardContent className="p-8 text-center">
              {verificationStatus.toLowerCase() === "failed" ? (
                <>
                  <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                  <h1 className="mt-4 text-4xl font-display font-bold">Payment Failed</h1>
                  <p className="mt-2 text-muted-foreground">
                    Your payment could not be completed. Please try again.
                  </p>
                  <Button className="mt-4" onClick={() => navigate(ROUTES.checkout)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </>
              ) : verificationStatus.toLowerCase() === "verified" ? (
                <>
                  <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
                  <h1 className="mt-4 text-4xl font-display font-bold">
                    {isSubscriptionCheckout ? "Subscription Activated" : "Order Confirmed"}
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    {isSubscriptionCheckout
                      ? "Membership is active. Your next delivery cycle is now scheduled."
                      : "Your order has been placed successfully."}
                  </p>
                </>
              ) : !hasPaymentReference ? (
                <>
                  <AlertTriangle className="mx-auto h-12 w-12 text-amber-600" />
                  <h1 className="mt-4 text-4xl font-display font-bold">Missing Payment Reference</h1>
                  <p className="mt-2 text-muted-foreground">
                    We could not read a payment reference from the callback. Please retry checkout.
                  </p>
                  <Button className="mt-4" onClick={() => navigate(ROUTES.checkout)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Return to Checkout
                  </Button>
                </>
              ) : (
                <>
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
                  <h1 className="mt-4 text-4xl font-display font-bold">Verifying Payment</h1>
                  <p className="mt-2 text-muted-foreground">
                    Please wait while we confirm your payment...
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order and Membership Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span>{plan?.name ?? "Not set"}</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-muted-foreground">Weight</span>
                <span>{subscription.state.planWeightG > 0 ? `${(subscription.state.planWeightG / 1000).toFixed(0)}kg` : "Not set"}</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-muted-foreground">Frequency</span>
                <span className="capitalize">{subscription.state.frequency ?? "Not set"}</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-muted-foreground">Next billing date</span>
                <span>{billingDate ? formatDate(billingDate) : "Not set"}</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-muted-foreground">Delivery window</span>
                <span>{deliveryWindow}</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-muted-foreground">Edit cutoff</span>
                <span>{cutoffDate ? formatDateTime(cutoffDate) : "Not set"}</span>
              </p>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment reference</span>
                <Badge variant="outline">{paymentReference}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment status</span>
                <span className="inline-flex items-center gap-2">
                  {verificationLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                  <Badge
                    variant={
                      verificationStatus.toLowerCase() === "verified"
                        ? "default"
                        : verificationStatus.toLowerCase() === "failed"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {verificationLoading ? "Verifying..." : verificationStatus}
                  </Badge>
                </span>
              </div>
              {verificationError && (
                <p className="text-xs text-amber-600">{verificationError}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Order sync</span>
                <Badge variant={orderSyncStatus === "saved" ? "default" : "secondary"}>
                  {orderSyncStatus === "saved" ? "Saved" : "Pending"}
                </Badge>
              </div>
              <p className="flex items-center justify-between">
                <span className="text-muted-foreground">Total due this cycle</span>
                <span className="font-semibold text-primary">{formatPlanPrice(verifiedAmount ?? fallbackTotal)}</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Join Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Join the MeatNG WhatsApp community for updates, tips, and support.
              </p>
              <Button className="mt-4" asChild>
                <a href={WHATSAPP_COMMUNITY_URL} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Join WhatsApp Community
                </a>
              </Button>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1">
              <Link to={ROUTES.dashboard}>
                Go to My Account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to={ROUTES.home}>Continue Browsing</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
