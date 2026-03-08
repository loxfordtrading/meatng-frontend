import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MapPin, Minus, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useCart } from "@/contexts/CartContext";
import { getDisplayFrequency, getPlanById, formatPrice as formatPlanPrice, formatWeight } from "@/data/plans";
import { getProductById } from "@/data/products";
import { lagosAreas, findLagosZoneByArea, deliveryStates, getDeliveryState } from "@/data/deliveryZones";
import { ROUTES } from "@/lib/routes";
import { listAddresses, createCheckoutSession, addCartItem, clearCart, loadIdMaps, resolveProductId, resolvePlanId } from "@/lib/api/customer";
import type { Address } from "@/lib/api/customer/addresses";
import { getErrorMessage } from "@/lib/api/errors";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import {
  formatDate,
  formatDateTime,
  getCutoffDateTime,
  getEstimatedDeliveryWindow,
  getNextBillingDate,
} from "@/lib/subscriptionSchedule";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useCartStore } from "@/store/cartStore";
import { axiosClient } from "@/GlobalApi";
import displayCurrency from "@/utils/displayCurrency";

type PaymentMethod = "paystack" | "bank-transfer";

type cartType = {
  type: string,
  id: string,
  attributes: {
      userId: string,
      planId: string,
      items: {
        productId: {
          _id: string,
          name: string,
          sku: string,
          price: number,
          formattedWeight: string,
          id: string
        },
        quantity: number,
        priceAtAddition: number,
        item_type: string
      }[]
      totalPrice: number,
      totalItems: number,
      addonTotal: number,
      planUnitPrice: number,
      maxItems: number,
      prefilledCount: number,
      createdAt: string,
      updatedAt: string
  },
  links: {
    self: string
  }
}

const Checkout = () => {
  const navigate = useNavigate();
  const subscription = useSubscription();
  const cart = useCart();
  const { state } = subscription;

  const { subInfo } = useSubscriptionStore();
    const { items, add, setQty, totalItems } = useCartStore();
    const [cartItems, setCartItems] = useState<cartType | null>(null)

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [city, setCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paystack");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paystackInitLoading, setPaystackInitLoading] = useState(false);
  const [paystackError, setPaystackError] = useState("");

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [addressesLoaded, setAddressesLoaded] = useState(false);

  const [paymentReference, setPaymentReference] = useState(() => {
    const suffix = Math.floor(100000 + Math.random() * 900000).toString();
    return `MN-${suffix}`;
  });

  const isSubscriptionCheckout = !!state.plan && !!state.frequency && state.boxItems.length > 0;
  const isOneTimeCheckout = !isSubscriptionCheckout && cart.items.length > 0;
  const token = tokenStorage.getCustomerToken();

  // Fetch saved addresses and auto-fill default on mount
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const fetchAddresses = async () => {
      try {
        const addresses = await listAddresses(token);
        if (cancelled) return;
        setSavedAddresses(addresses);
        setAddressesLoaded(true);

        // Pre-fill user profile info
        const user = subscription.state.user;
        if (user) {
          const parts = (user.name || "").trim().split(/\s+/);
          if (parts.length >= 2) {
            setFirstName(parts[0]);
            setLastName(parts.slice(1).join(" "));
          } else if (parts[0]) {
            setFirstName(parts[0]);
          }
          if (user.email) setEmail(user.email);
        }

        // Auto-fill from default address (or first if only one)
        const defaultAddr = addresses.find((a) => a.isDefault) || (addresses.length === 1 ? addresses[0] : null);
        if (defaultAddr) {
          applyAddress(defaultAddr);
          setSelectedAddressId(defaultAddr.id);
        }
      } catch {
        if (!cancelled) setAddressesLoaded(true);
      }
    };
    void fetchAddresses();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyAddress = (addr: Address) => {
    if (addr.streetAddress) setStreetAddress(addr.streetAddress);
    if (addr.apartmentSuite) setApartment(addr.apartmentSuite);
    if (addr.state) {
      setSelectedState(addr.state);
      setSelectedArea("");
      setCity("");
      // If address has a city, set it (for non-Lagos states)
      if (addr.city) setCity(addr.city);
    }
  };
  const userEmail = email || subscription.state.user?.email || "";

  const handleSelectSavedAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    if (addressId === "") return; // "Enter manually" selected
    const addr = savedAddresses.find((a) => a.id === addressId);
    if (addr) applyAddress(addr);
  };

  // if (!isSubscriptionCheckout && !isOneTimeCheckout) {
  //   return <Navigate to={ROUTES.cart} replace />;
  // }

  // Auth guard: require login before checkout
  if (!subscription.state.user && !token) {
    if (isSubscriptionCheckout) {
      return <Navigate to={ROUTES.authSignUp} replace />;
    }
    return <Navigate to={ROUTES.authSignIn} replace />;
  }

  const plan = isSubscriptionCheckout && state.plan ? getPlanById(state.plan) : null;
  const billingDate = isSubscriptionCheckout && state.frequency ? getNextBillingDate(state.frequency) : null;
  const cutoffDate = billingDate ? getCutoffDateTime(billingDate) : null;
  const deliveryWindow = billingDate ? getEstimatedDeliveryWindow(billingDate) : null;

  const boxLineItems = isSubscriptionCheckout
    ? state.boxItems
        .map((item) => ({ ...item, product: getProductById(item.productId) }))
    : [];

  const addOnLineItems = isSubscriptionCheckout
    ? state.addOns
        .map((item) => ({ ...item, product: getProductById(item.productId) }))
        .filter((item) => item.product)
    : [];

  const selectedWeightLabel = state.planWeightG > 0 ? formatWeight(state.planWeightG) : (plan ? `${plan.weightKg}kg` : "-");

  const stateInfo = getDeliveryState(selectedState);
  const isLagos = stateInfo?.hasZones ?? false;
  const lagosZoneInfo = isLagos ? findLagosZoneByArea(selectedArea) : null;

  const deliveryFee = isLagos
    ? (lagosZoneInfo?.fee ?? 0)
    : (stateInfo?.flatFee ?? 0);

  const deliveryResolved = isLagos ? !!lagosZoneInfo : !!stateInfo;

  const hasDeliveryInfo =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    phone.trim() &&
    streetAddress.trim() &&
    !!selectedState &&
    (isLagos ? !!selectedArea : !!city.trim());

  const totalDue = (isSubscriptionCheckout ? subscription.grandTotal : cart.subtotal) + deliveryFee;
  const checkoutTitle = isSubscriptionCheckout ? "Checkout" : "One-time Checkout";
  const checkoutSubtitle = isSubscriptionCheckout
    ? "Complete your subscription and activate your member dashboard."
    : "Complete your one-time order without selecting a subscription plan.";

  const handleCompletePayment = () => {
    if (!hasDeliveryInfo) return;
    setShowSuccessModal(true);
  };

  const handlePaystackCheckout = async () => {
    if (!hasDeliveryInfo) return;
    setPaystackError("");
    setPaystackInitLoading(true);
    try {
      // const token = tokenStorage.getCustomerToken();
      // const userEmail = email || subscription.state.user?.email || "";

      // Load backend ID maps (products & plans name→ObjectId)
      // const idMaps = await loadIdMaps(token);
      // const backendPlanId = isSubscriptionCheckout
      //   ? resolvePlanId(state.plan || "", idMaps) || ""
      //   : "";

      // // Sync items to server-side cart before checkout
      // try { await clearCart(token); } catch { /* ignore if no cart yet */ }

      // const skipped: string[] = [];
      // let syncedItems = 0;

      // if (isSubscriptionCheckout) {
      //   // Collect all base items into a deduplicated map (productId → quantity)
      //   // so multiple frontend items that map to the same backend product are merged.
      //   const baseItems = new Map<string, number>();
      //   const addOnItems = new Map<string, number>();

      //   const addToMap = (map: Map<string, number>, name: string, qty: number) => {
      //     const pid = resolveProductId(name, idMaps);
      //     if (pid) {
      //       map.set(pid, (map.get(pid) ?? 0) + qty);
      //     } else {
      //       skipped.push(name);
      //     }
      //   };

      //   // Box items (mandatory cuts)
      //   for (const item of state.boxItems) {
      //     addToMap(baseItems, item.productId || item.name, item.quantity);
      //   }
      //   // Selected offals — only sync if they resolve to a UNIQUE product ID
      //   // (many frontend offals map to the same backend product, which inflates
      //   // cart weight and triggers the backend's weight validation).
      //   if (plan?.offalSelection && state.selectedOffals.length > 0) {
      //     for (const offalName of state.selectedOffals) {
      //       const pid = resolveProductId(offalName, idMaps);
      //       if (pid && !baseItems.has(pid)) {
      //         baseItems.set(pid, 1);
      //       }
      //       // Skip duplicates silently — they're part of the plan's weight allocation
      //     }
      //   }
      //   // Build-your-box selections
      //   for (const item of state.buildSelections.filter((b) => b.quantity > 0)) {
      //     addToMap(baseItems, item?.productId || item.name, item.quantity);
      //   }
      //   // Add-ons (kept separate so backend can distinguish)
      //   for (const item of state.addOns) {
      //     addToMap(addOnItems, item?.productId || item?.name, item.quantity);
      //   }

      //   // Send deduplicated base items
      //   for (const [pid, qty] of baseItems) {
      //     await addCartItem({ email: userEmail, planId: backendPlanId, productId: pid, quantity: qty }, token);
      //     syncedItems += 1;
      //   }
      //   // Send deduplicated add-on items
      //   for (const [pid, qty] of addOnItems) {
      //     await addCartItem({ email: userEmail, planId: backendPlanId, productId: pid, quantity: qty }, token);
      //     syncedItems += 1;
      //   }
      // } else {
      //   // One-time purchase: add cart items.
      //   // Gift boxes are expanded into their underlying products because backend cart accepts product lines.
      //   for (const item of cart.items) {
      //     if (item.type === "gift-box" && Array.isArray(item.items) && item.items.length > 0) {
      //       for (const giftLine of item.items) {
      //         const pid = resolveProductId(giftLine.productId, idMaps);
      //         if (pid) {
      //           await addCartItem({
      //             email: userEmail,
      //             planId: "",
      //             productId: pid,
      //             quantity: giftLine.quantity * item.quantity,
      //           }, token);
      //           syncedItems += 1;
      //         } else {
      //           skipped.push(`${item.name}: ${giftLine.productId}`);
      //         }
      //       }
      //       continue;
      //     }

      //     const rawId = item.productId || item.boxId || "";
      //     const pid = resolveProductId(rawId || item.name, idMaps);
      //     if (pid) {
      //       await addCartItem({ email: userEmail, planId: "", productId: pid, quantity: item.quantity }, token);
      //       syncedItems += 1;
      //     } else {
      //       skipped.push(item.name);
      //     }

      //   }
      // }

      // if (skipped.length > 0) {
      //   console.warn("[Checkout] Could not resolve backend IDs for:", skipped);
      // }

      // if (syncedItems === 0) {
      //   throw new Error("No cart items could be synced to checkout. Please refresh your cart and try again.");
      // }

      const result = await axiosClient.post("",
        {
          autoSubscribe: isSubscriptionCheckout,
          frequency: isSubscriptionCheckout ? state.frequency : null,
          enableAutoDebit: true,
        }
      );

      if (result.reference) {
        setPaymentReference(result.reference);
      }

      if (result.authorizationUrl) {
        window.location.assign(result.authorizationUrl);
        return;
      }

      throw new Error("Payment gateway did not return a checkout URL. Please try again or contact support.");
    } catch (error) {
      // Log full error details for debugging server-side failures
      if (error && typeof error === "object" && "details" in error) {
        console.error("[Checkout] Server response details:", (error as { details: unknown }).details);
      }
      console.error("[Checkout] Payment error:", error);

      // Surface more helpful message for 500 errors
      let msg = getErrorMessage(error, "Unable to initialize checkout payment. Please try again.");
      if (error instanceof Error && msg === "Request failed (500)") {
        msg = "Payment gateway error. The server could not process your checkout. This may be a temporary issue — please try again in a moment.";
      }
      setPaystackError(msg);
    } finally {
      setPaystackInitLoading(false);
    }
  };

  const handleSuccessContinue = () => {
    if (isOneTimeCheckout) {
      cart.clearCart();
    }
    navigate(ROUTES.confirmation, {
      state: {
        paymentReference,
        paymentMethod,
        nextBillingDate: billingDate?.toISOString(),
        cutoffDate: cutoffDate?.toISOString(),
        deliveryWindow,
      },
    });
  };

  useEffect(() => {
    getCartItems()
  }, [])

  const getCartItems = async () => {
    try {
      const res = await axiosClient.get("/carts/my-cart");

      setCartItems(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-primary/80 py-10">
        <div className="container">
          <p className="text-sm text-primary-foreground/80">{isSubscriptionCheckout ? "Subscription order" : "One-time order"}</p>
          <h1 className="mt-1 text-3xl md:text-4xl font-display font-bold text-primary-foreground">{checkoutTitle}</h1>
          <p className="mt-2 text-primary-foreground/85">{checkoutSubtitle}</p>
        </div>
      </div>

      <div className="container py-6 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <Button variant="ghost" asChild>
            <Link to={isSubscriptionCheckout ? ROUTES.cartReview : ROUTES.cart}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {isSubscriptionCheckout ? "Back to Cart Review" : "Back to Cart"}
            </Link>
          </Button>
        </div>

        {/* Mobile order summary (collapsed at top) */}
        <div className="lg:hidden mb-6">
          <details className="rounded-2xl border bg-muted/30 overflow-hidden">
            <summary className="flex items-center justify-between p-4 cursor-pointer">
              <span className="text-sm font-semibold">Order Summary</span>
              <span className="text-lg font-bold text-primary">{formatPlanPrice(totalDue)}</span>
            </summary>
            <div className="px-4 pb-4 space-y-2 text-sm border-t pt-3">
              {isSubscriptionCheckout && (
                <>
                  <p className="flex justify-between"><span className="text-muted-foreground">Plan</span><span>{subInfo?.subscription?.attributes?.name}</span></p>
                  <p className="flex justify-between"><span className="text-muted-foreground">Weight</span><span>{subInfo?.subscription?.attributes?.weight}{subInfo?.subscription?.attributes?.weight_unit}</span></p>
                  <p className="flex justify-between"><span className="text-muted-foreground">Plan price</span><span>{displayCurrency(cartItems?.attributes?.planUnitPrice, "NGN")}</span></p>
                  {cartItems?.attributes?.addonTotal > 0 && (
                    <p className="flex justify-between"><span className="text-muted-foreground">Add-ons</span><span>{displayCurrency(cartItems?.attributes?.addonTotal, "NGN")}</span></p>
                  )}
                </>
              )}
              {/* {isOneTimeCheckout && (
                <p className="flex justify-between"><span className="text-muted-foreground">Items</span><span>{cart.itemCount}</span></p>
              )} */}
              {/* <p className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>{deliveryResolved ? formatPlanPrice(deliveryFee) : "—"}</span>
              </p> */}
            </div>
          </details>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Saved address selector */}
                {addressesLoaded && savedAddresses.length > 0 && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="saved-address">Use a saved address</Label>
                    <select
                      id="saved-address"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={selectedAddressId}
                      onChange={(e) => handleSelectSavedAddress(e.target.value)}
                    >
                      <option value="">Enter address manually</option>
                      {savedAddresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.label || addr.streetAddress || "Saved address"}{addr.isDefault ? " (Default)" : ""} — {addr.city || addr.state || ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="first-name">First name <span className="text-destructive">*</span></Label>
                  <Input id="first-name" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name <span className="text-destructive">*</span></Label>
                  <Input id="last-name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                  <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone">Phone number <span className="text-destructive">*</span></Label>
                  <Input id="phone" placeholder="08012345678" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>

                {/* State picker */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="delivery-state">State <span className="text-destructive">*</span></Label>
                  <select
                    id="delivery-state"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedArea("");
                      setCity("");
                    }}
                  >
                    <option value="">Select your state</option>
                    {deliveryStates.map((s) => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Lagos: area dropdown */}
                {isLagos && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="area-select">Delivery area</Label>
                    <select
                      id="area-select"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                    >
                      <option value="">Select your area</option>
                      {lagosAreas.map((item) => (
                        <option key={`${item.zoneId}-${item.area}`} value={item.area}>
                          {item.area} — {formatPlanPrice(item.fee)}
                        </option>
                      ))}
                    </select>
                    {lagosZoneInfo && (
                      <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/[0.03] p-3">
                        <MapPin className="h-5 w-5 shrink-0 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{selectedArea}</p>
                          <p className="text-xs text-muted-foreground">Lagos</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">{formatPlanPrice(deliveryFee)}</p>
                          <p className="text-[10px] text-muted-foreground">delivery fee</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Other states: city input + flat rate display */}
                {selectedState && !isLagos && (
                  <>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="city">City / Town <span className="text-destructive">*</span></Label>
                      <Input
                        id="city"
                        placeholder={`Enter your city in ${selectedState}`}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/[0.03] p-3">
                        <Truck className="h-5 w-5 shrink-0 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{selectedState} delivery</p>
                          <p className="text-xs text-muted-foreground">Flat rate — statewide</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">{formatPlanPrice(deliveryFee)}</p>
                          <p className="text-[10px] text-muted-foreground">delivery fee</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="street-address">Street address <span className="text-destructive">*</span></Label>
                  <Input id="street-address" placeholder="12 Adeniyi Jones Avenue" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Note (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value.slice(0, 300))}
                  placeholder="Gate code, call instructions, or preferred drop-off note."
                  rows={4}
                />
              </CardContent>
            </Card>

            {isSubscriptionCheckout && billingDate && cutoffDate && deliveryWindow && (
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Schedule Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="flex items-center justify-between"><span className="text-muted-foreground">Frequency</span><span>{subInfo?.selectedFrequency}</span></p>
                  {/* <p className="flex items-center justify-between"><span className="text-muted-foreground">Next billing date</span><span>{formatDate(billingDate)}</span></p>
                  <p className="flex items-center justify-between"><span className="text-muted-foreground">Estimated delivery window</span><span>{deliveryWindow}</span></p>
                  <p className="flex items-center justify-between"><span className="text-muted-foreground">Edit cutoff</span><span>{formatDateTime(cutoffDate)}</span></p> */}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
               
                {/* paymentMethod === "paystack" info box removed */}
                {/* {paymentMethod === "bank-transfer" && (
                  <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
                    <p><strong>Bank:</strong> Example Bank</p>
                    <p><strong>Account:</strong> MeatNG Foods Ltd</p>
                    <p><strong>Account Number:</strong> 0123456789</p>
                    <p><strong>Amount:</strong> {formatPlanPrice(totalDue)}</p>
                    <p><strong>Reference:</strong> {paymentReference}</p>
                  </div>
                )} */}
                {!hasDeliveryInfo && (
                  <p className="text-sm text-muted-foreground">Complete delivery information before payment.</p>
                )}
                {paystackError && <p className="text-sm text-destructive">{paystackError}</p>}
                <Button
                  type="button"
                  disabled={!hasDeliveryInfo || paystackInitLoading}
                  onClick={paymentMethod === "paystack" ? handlePaystackCheckout : handleCompletePayment}
                >
                  {paymentMethod === "paystack"
                    ? (paystackInitLoading ? "Initializing payment..." : "Pay")
                    : "I Have Made Transfer"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {subInfo?.subscription && (
                  <>
                    {cartItems?.attributes?.prefilledCount > 0 && (
                      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Mandatory cuts
                        </p>
                        {cartItems?.attributes?.items.map((item) => (
                          <div key={item?.productId?.id} className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-foreground">{item?.productId?.name}</span>
                            <span className="text-xs text-muted-foreground">{item?.productId?.formattedWeight}</span>
                          </div>
                        ))}

                        {/* Offal selections */}
                        {/* {plan?.offalSelection && state.selectedOffals.length > 0 && (
                          <>
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary pt-1">Your offal picks</p>
                            {state.selectedOffals.map((name) => {
                              const opt = plan.offalSelection!.options.find((o) => o.name === name);
                              return opt ? (
                                <div key={name} className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-medium text-foreground">{opt.name}</span>
                                  <span className="text-xs text-muted-foreground">{formatWeight(opt.weightG)}</span>
                                </div>
                              ) : null;
                            })}
                          </>
                        )} */}

                        {/* Build-your-box selections */}
                        {cartItems?.attributes?.items.filter((s) => s.item_type === 'base').length > 0 && (
                          <>
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary pt-1">Your custom picks</p>
                            {cartItems?.attributes?.items.filter((s) => s.item_type === 'base').map((sel) => (
                              <div key={sel?.productId?.id} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">{sel?.productId?.name}</span>
                                  {sel.quantity > 1 && <Badge variant="secondary" className="text-xs">{sel?.quantity}x</Badge>}
                                </div>
                                <span className="text-xs text-muted-foreground">{sel?.productId?.formattedWeight}</span>
                              </div>
                            ))}
                          </>
                        )}

                        <Button variant="link" className="h-auto p-0 text-primary" asChild>
                          <Link to={ROUTES.buildBox}>Edit full box</Link>
                        </Button>
                      </div>
                    )}

                    {cartItems?.attributes?.addonTotal > 0 && (
                      <div className="rounded-lg border border-border bg-background p-3 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add-ons</p>
                        {cartItems?.attributes?.items.filter((s) => s.item_type === 'base').map((item) => (
                          <div key={item?.productId?.id} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{item?.productId?.name}</span>
                              <Badge variant="outline" className="text-xs">{item?.quantity}x</Badge>
                            </div>
                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => subscription.removeAddon(item?.productId?.id)}>
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {/* <Button variant="link" className="h-auto p-0 text-primary" asChild>
                          <Link to={ROUTES.cartReview}>Manage add-ons</Link>
                        </Button> */}
                      </div>
                    )}

                    <p className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Plan</span><span>{subInfo?.subscription?.attributes?.name}</span></p>
                    <p className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Weight</span><span>{subInfo?.subscription?.attributes?.weight}</span></p>
                    <p className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Frequency</span><span>{subInfo?.selectedFrequency}</span></p>
                    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 space-y-2">
                      <p className="text-xs text-muted-foreground">Need to adjust your selection?</p>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" size="sm" variant="outline" asChild>
                          <Link to={ROUTES.plans}>Change Plan / Frequency</Link>
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <p className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Plan price</span><span>{displayCurrency(cartItems?.attributes?.planUnitPrice, "NGN")}</span></p>
                    <p className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Add-ons</span><span>{displayCurrency(cartItems?.attributes?.addonTotal, "NGN")}</span></p>
                  </>
                )}

                {/* {isOneTimeCheckout && (
                  <>
                    <Badge variant="secondary" className="w-full justify-center">One-time order</Badge>
                    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                      {cart.items.map((item) => (
                        <div key={item.id} className="space-y-1 border-b border-border/50 pb-2 last:border-b-0 last:pb-0">
                          <div className="flex items-center justify-between gap-2 text-sm">
                            <span className="truncate">{item.name} x{item.quantity}</span>
                            <span>{formatPlanPrice(item.price * item.quantity)}</span>
                          </div>
                          {item.type === "gift-box" && item.giftDetails?.recipientName && (
                            <p className="text-xs text-muted-foreground">
                              For {item.giftDetails.recipientName}
                              {item.giftDetails.occasion ? ` • ${item.giftDetails.occasion}` : ""}
                            </p>
                          )}
                          {item.type === "gift-box" && item.giftDetails?.message && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              Card: \"{item.giftDetails.message}\"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Order type</span><span>One-time</span></p>
                    <p className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Items</span><span>{cart.itemCount}</span></p>
                  </>
                )} */}

                {/* <p className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Truck className="h-3.5 w-3.5" /> Delivery
                  </span>
                  <span>{deliveryResolved ? formatPlanPrice(deliveryFee) : "Select location"}</span>
                </p> */}
                <Separator />
                <p className="flex items-center justify-between text-lg font-bold">
                  <span>Total due now</span>
                  <span className="text-primary">{displayCurrency(cartItems?.attributes?.totalPrice, "NGN")}</span>
                </p>
                {/* <Badge variant="outline" className="w-full justify-center">Ref: {paymentReference}</Badge> */}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-6 w-6" />
              <h2 className="text-2xl font-display font-bold">{isSubscriptionCheckout ? "Payment Successful" : "Order Received"}</h2>
            </div>
            <p className="text-muted-foreground">
              {isSubscriptionCheckout ? "Subscription activated. Membership is now active." : "Your one-time order has been placed."}
            </p>
            <div className="mt-4 space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
              {isSubscriptionCheckout && (
                <>
                  <p><strong>Plan:</strong> {plan?.name}</p>
                  <p><strong>Weight:</strong> {selectedWeightLabel}</p>
                  <p><strong>Frequency:</strong> {state.frequency ? getDisplayFrequency(state.frequency) : "-"}</p>
                  {billingDate && <p><strong>Next billing:</strong> {formatDate(billingDate)}</p>}
                  {deliveryWindow && <p><strong>Delivery window:</strong> {deliveryWindow}</p>}
                  {cutoffDate && <p><strong>Edit cutoff:</strong> {formatDateTime(cutoffDate)}</p>}
                </>
              )}
              {isOneTimeCheckout && <p><strong>Order type:</strong> One-time purchase</p>}
              <p><strong>Payment reference:</strong> {paymentReference}</p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {isSubscriptionCheckout ? (
                <Button asChild><Link to={ROUTES.dashboard}>Go to My Account</Link></Button>
              ) : (
                <Button onClick={handleSuccessContinue}>View Confirmation Page</Button>
              )}
              <Button variant="outline" onClick={() => navigate(ROUTES.home)}>Continue Browsing</Button>
              {isSubscriptionCheckout && (
                <Button variant="secondary" className="sm:col-span-2" onClick={handleSuccessContinue}>
                  View Confirmation Page
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
