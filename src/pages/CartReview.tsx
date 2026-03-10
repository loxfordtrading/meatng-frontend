import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Minus, PackagePlus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getDisplayFrequency, formatPrice, formatWeight } from "@/data/plans";
import { formatPrice as formatProductPrice } from "@/data/products";
import { useProductCatalog } from "@/contexts/ProductCatalogContext";
import { ROUTES } from "@/lib/routes";
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
import { useEffect, useState } from "react";
import Addons from "@/components/products/Addons";
import displayCurrency from "@/utils/displayCurrency";
import { useAddonStore } from "@/store/addonStore";
import { toGrams } from "@/utils/conversion";
import { useAuthStore } from "@/store/AuthStore";
import { toast } from "react-toastify";

const CartReview = () => {
  const subscription = useSubscription();
  const {
    state,
    currentPlan,
    totalWeightG,
    categoryWeightUsed,
    getCategoryBudget,
    // addAddon,
    removeAddon,
    setSelectedOffals,
    setBuildSelections,
    addOnsTotal,
    grandTotal,
  } = subscription;

  const navigate = useNavigate()
  const { subInfo } = useSubscriptionStore();
  const { items, add, setQty, totalItems, totalGramWeight } = useCartStore();
  const { addonItems, addAddon, setAddonQty, totalAddonItems, totalAddonPrice } = useAddonStore();
  const addonTotal = totalAddonPrice();
  const [products, setProducts] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false)
  const { userInfo } = useAuthStore();

  const totalGransInCart = totalGramWeight()
  
  if (!subInfo?.subscription || !subInfo?.selectedFrequency) {
    return <Navigate to={ROUTES.plans} replace />;
  }

  const subscriptionWeightG = toGrams(
    subInfo?.subscription?.attributes?.weight ?? 0,
    subInfo?.subscription?.attributes?.weight_unit as "kg" | "g"
  );

  let error = "";

  if (totalGransInCart !== subscriptionWeightG) {
    const remainingWeight = subscriptionWeightG - totalGransInCart;

    error = `Your box needs ${formatWeight(remainingWeight)} to reach ${subInfo?.subscription?.attributes?.weight}${subInfo?.subscription?.attributes?.weight_unit}`;
  }

  const progress = subscriptionWeightG
  ? (totalGransInCart / subscriptionWeightG) * 100
  : 0;


  const billingDate = getNextBillingDate(state.frequency);

  const totalBudgetG = currentPlan ? currentPlan.weightKg * 1000 : 0;
  const offalWeightG = currentPlan?.offalSelection
    ? state.selectedOffals.reduce((sum, name) => {
        const opt = currentPlan.offalSelection!.options.find((o) => o.name === name);
        return sum + (opt?.weightG ?? 0);
      }, 0)
    : 0;
  const buildWeightG = state.buildSelections.reduce((sum, s) => sum + s.weightG * s.quantity, 0);
  const fullBoxWeightG = totalWeightG + offalWeightG + buildWeightG;
  

  useEffect(() => {
    getProducts()
  }, []);

  const getProducts = async () => {
    try {
      const res = await axiosClient.get("/products");

      const formattedProducts = res.data.data.map((item: any) => ({
        id: item.id,
        name: item.attributes.name,
        price: item.attributes.price,
        weight: item.attributes.mainValue,
        weight_unit: item.attributes.unit,
        formatted_weight: item.attributes.formattedWeight,
        category: item.relationships?.categoryDetails?.data?.[0]?.attributes?.slug || "other",
      }));

      setProducts(formattedProducts);
    } catch (err) {
      console.error(err);
    }
  };

  const cartItems = [
    ...items,
    ...addonItems
  ].map((item) => ({
    productId: item.id,
    quantity: item.qty,
    itemType: item.item_type,
  }));

  const addToRemoteCart = async () => {
    
    if(!userInfo){
      localStorage.setItem("current-page", "true")
      navigate(ROUTES.authSignIn)
      return
    }

    try {
      setAddingToCart(true)
      const res = await axiosClient.post("/carts/items", {
        email: userInfo?.email,
        planId: subInfo.subscription.id,
        items: cartItems
      });
      navigate(ROUTES.checkout)
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-primary/80 py-10">
        <div className="container">
          <p className="text-sm text-primary-foreground/80">Review your box</p>
          <h1 className="mt-1 text-3xl md:text-4xl font-display font-bold text-primary-foreground">
            Review Cart &amp; Add Optional Extras
          </h1>
          <p className="mt-2 text-primary-foreground/85">
            Confirm your subscription box and add paid extras for this cycle.
          </p>
        </div>
      </div>

      <div className="container py-6 sm:py-8 pb-28 lg:pb-8">
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" asChild>
            <Link to={ROUTES.buildBox}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Your Box
            </Link>
          </Button>
          {items.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{subInfo?.subscription?.attributes?.name}</Badge>
              <Badge variant="secondary">{subInfo?.subscription?.attributes?.weight}{subInfo?.subscription?.attributes?.weight_unit}</Badge>
              <Badge variant="secondary">{subInfo?.selectedFrequency}</Badge>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left: box contents + add-ons */}
            <div className="space-y-6 lg:col-span-2">
              {/* Box contents grouped by category */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Box Contents</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {formatWeight(totalGransInCart)} / {subInfo?.subscription?.attributes?.weight}{subInfo?.subscription?.attributes?.weight_unit}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2 mt-2" />
                </CardHeader>
                <CardContent>
                  {!subInfo.subscription ? (
                    <p className="text-sm text-muted-foreground">No items selected yet.</p>
                  ) : (
                    <div className="space-y-5">
                      {/* Mandatory / pre-packed items */}
                      {subInfo?.subscription?.attributes?.prefilled_items.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold mb-2">
                            Mandatory Cuts
                          </h3>
                          <div className="space-y-2">
                            {subInfo?.subscription?.attributes?.prefilled_items.map((item) => (
                              <div key={item?.product_id} className="flex items-center justify-between rounded-lg border border-border p-3">
                                <div>
                                  <p className="font-medium text-foreground">{item?.name}</p>
                                  <p className="text-xs text-muted-foreground">{item?.weight}{item?.weight_unit}</p>
                                </div>
                                <Badge variant="outline">{item.quantity}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Offal selections (Value/Essential) */}
                      {/* {currentPlan?.offalSelection && state.selectedOffals.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold mb-2 text-primary">Your Offal Picks</h3>
                          <div className="space-y-2">
                            {Object.entries(selectedOffalCounts).map(([name, quantity]) => {
                              const opt = currentPlan.offalSelection!.options.find((o) => o.name === name);
                              if (!opt) return null;
                              const maxQty = opt.maxQty ?? Number.POSITIVE_INFINITY;
                              const canIncrease =
                                quantity < maxQty && offalWeightG + opt.weightG <= (getCategoryBudget("offals") || 0);
                              return (
                                <div key={name} className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/[0.03] p-3">
                                  <div>
                                    <p className="font-medium text-foreground">{opt.name}</p>
                                    <p className="text-xs text-muted-foreground">{formatWeight(opt.weightG * quantity)}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => handleDecreaseOffal(name)}>
                                      <Minus className="h-3.5 w-3.5" />
                                    </Button>
                                    <Badge variant="outline">{quantity}x</Badge>
                                    <Button size="icon" className="h-7 w-7" disabled={!canIncrease} onClick={() => handleIncreaseOffal(name)}>
                                      <Plus className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )} */}

                      {/* Build-your-box selections (Signature/Premium) */}
                      {items.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold mb-2 text-primary">Your Custom Picks</h3>
                          <div className="space-y-2">
                            {error && (
                              <p className="text-xs text-right text-amber-600 mt-2">
                                {error}
                              </p>
                            )}
                            {items.map((sel) => (
                              <div key={sel?.id} className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/[0.03] p-3">
                                <div>
                                  <p className="font-medium text-foreground">{sel?.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {sel?.weight * sel.qty}{sel?.weight_unit}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7"
                                    onClick={() => setQty(sel, sel?.qty - 1)}
                                  >
                                    <Minus className="h-3.5 w-3.5" />
                                  </Button>
                                  <Badge variant="outline">{sel?.qty}x</Badge>
                                  <Button
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setQty(sel, sel?.qty + 1)}
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add-ons */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PackagePlus className="h-5 w-5 text-primary" />
                    Complete Your Box with Add-ons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* <div> */}
                    <Addons products={products}/>
                    {/* {addOnCandidates.map((product) => {
                      const quantity = state.addOns.find((a) => a.productId === product.id)?.quantity || 0;
                      return (
                        <div key={product.id} className="rounded-xl border border-border p-4">
                          <p className="text-sm font-semibold text-foreground">{product.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground"> {formatWeight(product.weightG)}</p>
                          <p className="mt-1 text-xs text-primary">Optional extra</p>
                          <p className="mt-3 text-lg font-bold text-primary">{formatProductPrice(product.addOnPrice)}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <Button size="sm" onClick={() => addAddon(product.id, product.addOnPrice)}>Add</Button>
                            <Button size="sm" variant="outline" onClick={() => removeAddon(product.id)} disabled={quantity === 0}>
                              Remove
                            </Button>
                            {quantity > 0 && (
                              <Badge variant="secondary" className="ml-auto">{quantity} added</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })} */}
                  {/* </div> */}
                </CardContent>
              </Card>
            </div>

            {/* Right: order summary (hidden on mobile, sticky bottom bar shown instead) */}
            <div className="hidden lg:block lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Plan price </span>
                      <span className="font-medium">{displayCurrency(subInfo?.subscription?.attributes?.price,"NGN")}</span>
                    </div>
                    {addonItems?.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Add-ons total</span>
                        <span className="font-medium">{displayCurrency(addonTotal,"NGN")}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total due </span>
                    <span className="text-primary">{displayCurrency(subInfo?.subscription?.attributes?.price + addonTotal, "NGN")}</span>
                  </div>

                  {/* {billingDate && cutoffDate && (
                    <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
                      <p className="flex items-start gap-2">
                        <Calendar className="mt-0.5 h-4 w-4 text-primary" />
                        <span><strong>Next billing:</strong> {formatDate(billingDate)}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <Clock className="mt-0.5 h-4 w-4 text-primary" />
                        <span><strong>Edit cutoff:</strong> {formatDateTime(cutoffDate)}</span>
                      </p>
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">Estimated delivery:</strong> {deliveryWindow}
                      </p>
                    </div>
                  )} */}

                  {items.length > 0 ? (
                    <Button className="w-full" size="lg" asChild onClick={addToRemoteCart} disabled={addingToCart}>
                      {
                        addingToCart ? (
                          <span className="flex items-center gap-2 cursor-pointer">
                            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                              Loading...
                          </span>
                        ) : (
                          <span className="cursor-pointer">
                            Continue to Checkout
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </span>
                        )
                      }
                    </Button>
                  ) : (
                    <>
                      <Button className="w-full" size="lg" disabled>
                        Continue to Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {error && (
                    <p className="text-xs text-center text-amber-600 mt-2">
                      {error}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky bottom bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur-lg p-4 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">
                {formatWeight(totalGransInCart)} / {subInfo?.subscription?.attributes?.weight}{subInfo?.subscription?.attributes?.weight_unit}
              </p>
              <p className="text-lg font-bold text-primary">{displayCurrency(subInfo?.subscription?.attributes?.price + addonTotal, "NGN")}</p>
            </div>
            {items.length > 0 ? (
              <Button size="lg" asChild className="flex-1 max-w-[200px]" onClick={addToRemoteCart} disabled={addingToCart}>
                {
                  addingToCart ? (
                    <span className="flex items-center gap-2 cursor-pointer">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Loading...
                    </span>
                  ) : (
                    <span className="cursor-pointer">
                      Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )
                }
              </Button>
            ) : (
              <Button size="lg" disabled className="flex-1 max-w-[200px]">
                Checkout
              </Button>
            )}
          </div>
        </div>
      )}

      {items.length <= 0 && (
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-2xl font-display font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Add products for a one-time order or start a subscription to build a recurring box.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/products">
                Shop Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/plans">Start Subscription</Link>
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CartReview;
