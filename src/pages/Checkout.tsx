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
import type { Address } from "@/lib/api/customer/addresses";
import { getErrorMessage } from "@/lib/api/errors";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useCartStore } from "@/store/cartStore";
import { axiosClient } from "@/GlobalApi";
import displayCurrency from "@/utils/displayCurrency";
import { getFrequencyWeeks } from "@/utils/conversion";
import { useAddonStore } from "@/store/addonStore";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { useAuthStore } from "@/store/AuthStore";
import Skeleton from "@/components/Skeleton";
import { toast } from "react-toastify";

export const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  apartment: z.string().min(1, "Apartment is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),

  // optional fields
  zipCode: z.string().optional(),
  deliveryNote: z.string().optional(),
});
// .superRefine((data, ctx) => {
//   const isLagos = data.state?.toLowerCase() === "lagos";

//   if (isLagos && !data.selectedArea) {
//     ctx.addIssue({
//       path: ["selectedArea"],
//       code: z.ZodIssueCode.custom,
//       message: "Delivery area is required for Lagos",
//     });
//   } else if (!isLagos && !data.city) {
//     ctx.addIssue({
//       path: ["city"],
//       code: z.ZodIssueCode.custom,
//       message: "City is required",
//     });
//   }
// });

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
  const { addonItems, setAddonQty, totalAddonPrice } = useAddonStore();
  const { userInfo } = useAuthStore();
  const addonTotal = totalAddonPrice(); 
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
  const [zipCode, setZipCode] = useState("")
  const [deliveryNote, setDeliveryNote] = useState("");
  const [isDefaultAddresss, setIsDefaultAddress] = useState(false);
  const [autoSubscribe, setAutoSubscribe] = useState(false);
  const [autoDebit, setAutoDebit] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paystack");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paystackInitLoading, setPaystackInitLoading] = useState(false);
  const [loadingCart, setLoadingCart] = useState(true)
  const [paystackError, setPaystackError] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [addressesLoaded, setAddressesLoaded] = useState(false);
  const [addresses, setAddresses] = useState([])
  const [loadingAddress, setLoadingAddress] = useState(true)

   const stateInfo = getDeliveryState(selectedState);
  const isLagos = stateInfo?.hasZones ?? false;
  const lagosZoneInfo = isLagos ? findLagosZoneByArea(selectedArea) : null;
    const deliveryFee = isLagos
    ? (lagosZoneInfo?.fee ?? 0)
    : (stateInfo?.flatFee ?? 0);

  const [paymentReference, setPaymentReference] = useState(() => {
    const suffix = Math.floor(100000 + Math.random() * 900000).toString();
    return `MN-${suffix}`;
  });

  const normalize = (v: string) => v?.trim().toLowerCase();

  const isSameAddress = (addr: any, payload: any) => {
    const attr = addr.attributes;

    return (
      normalize(attr.first_name) === normalize(payload.first_name) &&
      normalize(attr.last_name) === normalize(payload.last_name) &&
      normalize(attr.email) === normalize(payload.email) &&
      normalize(attr.phone) === normalize(payload.phone) &&
      normalize(attr.street_address) === normalize(payload.street_address) &&
      normalize(attr.apartment_suite) === normalize(payload.apartment_suite) &&
      normalize(attr.city) === normalize(payload.city) &&
      normalize(attr.state) === normalize(payload.state) &&
      normalize(attr.zip_code) === normalize(payload.zip_code)
    );
  };

  const handleSetAddressAsDefault = () => {

    const addressPayload = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      street_address: streetAddress,
      apartment_suite: apartment,
      city: city || selectedArea,
      state: selectedState,
      zip_code: zipCode
    };

    const sameAddress = addresses.find((addr) =>
      isSameAddress(addr, addressPayload)
    );

    if (sameAddress) {
      toast.error("Address already exists. Set it as default from your dashboard.");
      return;
    }

    setIsDefaultAddress(!isDefaultAddresss);
  };

  const handleSelectSavedAddress = (id: string) => {
    setSelectedAddressId(id)

    if (!id) {
      setFirstName("")
      setLastName("")
      setEmail("")
      setPhone("")
      setStreetAddress("")
      setApartment("")
      setCity("")
      setSelectedArea("")
      setSelectedState("")
      setZipCode("")
      return
    }

    const selected = addresses.find((addr) => addr.id === id)

    if (!selected) return

    const attr = selected.attributes

    setFirstName(attr.first_name || "")
    setLastName(attr.last_name || "")
    setEmail(attr.email || "")
    setPhone(attr.phone || "")
    setStreetAddress(attr.street_address || "")
    setApartment(attr.apartment_suite || "")
    setSelectedState(attr.state || "")
    setZipCode(attr.zip_code || "")
    if(attr.state == "Lagos"){
      setSelectedArea(attr.city)
    }else{
      setCity(attr.city || "")
    }
  }

  // useEffect(() => {
  //   const defaultAddress = addresses.find(a => a.attributes.is_default)
  //   if(defaultAddress){
  //     handleSelectSavedAddress(defaultAddress.id)
  //   }
  // }, [addresses])

  const validateForm = () => {
    const result = checkoutSchema.safeParse({
      firstName,
      lastName,
      email,
      phone,
      streetAddress,
      apartment,
      state: selectedState,
      city: city || selectedArea,
      zipCode,
      deliveryNote,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        errors[field] = issue.message;
      });

      setFormErrors(errors);
      return false;
    }

    setFormErrors({});
    return true;
  };

  useEffect(() => {
    getAddresses()
    getCartItems()
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setAutoSubscribe(false);
        setAutoDebit(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const validation = checkoutSchema.safeParse({
      firstName,
      lastName,
      email,
      phone,
      streetAddress,
      apartment,
      state: selectedState,
      city: city || selectedArea,
      zipCode,
      deliveryNote,
    });

  const canSubmit = validation.success;

  const handlePaystackCheckout = async () => {
      if (!validateForm()) return;

      setPaystackError("");
      setPaystackInitLoading(true);

      try {
        const basePayload: any = {
          auto_subscribe: autoSubscribe,
        };

        // send address_id if it exists
        if (selectedAddressId) {
          basePayload.address_id = selectedAddressId;
        } else {
          // otherwise send full address
          basePayload.shipping_address = {
            address_type: "shipping",
            label: "Home",
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,
            street_address: streetAddress,
            apartment_suite: apartment,
            city: city || selectedArea,
            state: selectedState,
            zip_code: zipCode,
            country: "Nigeria",
            is_default: isDefaultAddresss,
          };
        }

        // add auto-subscription fields
        if (autoSubscribe) {
          basePayload.frequency_weeks = getFrequencyWeeks(
            subInfo?.selectedFrequency
          );
          basePayload.enable_auto_debit = autoDebit;
        }

        const response = await axiosClient.post("/checkout", basePayload);

        const reference = response.data?.data?.attributes?.payment?.reference;

        const paymentLink = response.data?.data?.attributes?.payment?.authorization_url;

        if (reference) {
          setPaymentReference(reference);
        }

        if (paymentLink) {
          window.location.assign(paymentLink);
        }
      } catch (error: any) {
        let msg = ""

        if (error instanceof Error && msg === "Request failed (500)") {
          msg = "Payment gateway error. The server could not process your checkout. This may be a temporary issue — please try again in a moment.";
        }

        if (error?.response?.data?.message) {
          msg = error.response.data.message;
        }

        setPaystackError(msg);
        toast.error(error.response.data?.message)
      } finally {
        setPaystackInitLoading(false);
      }
    };

  const getAddresses = async () => {
    try {
      const response = await axiosClient.get("/addresses")
      setAddresses(response.data?.data || [])
    } catch (error) {
      toast.error(error.response.data?.message)
    } finally {
      setLoadingAddress(false)
    }
  }

  // const handleSuccessContinue = () => {
  //   if (isOneTimeCheckout) {
  //     cart.clearCart();
  //   }
  //   navigate(ROUTES.confirmation, {
  //     state: {
  //       paymentReference,
  //       paymentMethod,
  //       nextBillingDate: billingDate?.toISOString(),
  //       cutoffDate: cutoffDate?.toISOString(),
  //       deliveryWindow,
  //     },
  //   });
  // };

  const getCartItems = async () => {
    try {
      const res = await axiosClient.get("/carts/my-cart");

      setCartItems(res.data.data);
    } catch (err) {
      console.error(err);
    } finally{
      setLoadingCart(false)
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-primary/80 py-10">
        <div className="container">
          <p className="text-sm text-primary-foreground/80">Subscription order</p>
          <h1 className="mt-1 text-3xl md:text-4xl font-display font-bold text-primary-foreground">Checkout</h1>
          <p className="mt-2 text-primary-foreground/85">Complete your {subInfo?.subscription?.attributes?.name} subcription plan and order</p>
        </div>
      </div>

      <div className="container py-6 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <Button variant="ghost" asChild>
            <Link to={ROUTES.cartReview}>
              <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cart Review
            </Link>
          </Button>
        </div>

        {/* Mobile order summary (collapsed at top) */}
        <div className="lg:hidden mb-6">
          <details className="rounded-2xl border bg-muted/30 overflow-hidden">
            <summary className="flex items-center justify-between p-4 cursor-pointer">
              <span className="text-sm font-semibold">Order Summary</span>
              <span className="text-lg font-bold text-primary">{displayCurrency(cartItems?.attributes?.totalPrice, "NGN")}</span>
            </summary>
            <div className="px-4 pb-4 space-y-2 text-sm border-t pt-3">
              <>
                <p className="flex justify-between"><span className="text-muted-foreground">Plan</span><span>{subInfo?.subscription?.attributes?.name}</span></p>
                <p className="flex justify-between"><span className="text-muted-foreground">Weight</span><span>{subInfo?.subscription?.attributes?.weight}{subInfo?.subscription?.attributes?.weight_unit}</span></p>
                <p className="flex justify-between"><span className="text-muted-foreground">Plan price</span><span>{displayCurrency(cartItems?.attributes?.planUnitPrice, "NGN")}</span></p>
                {cartItems?.attributes?.addonTotal > 0 && (
                  <p className="flex justify-between"><span className="text-muted-foreground">Add-ons</span><span>{displayCurrency(cartItems?.attributes?.addonTotal, "NGN")}</span></p>
                )}
              </>
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
                {loadingAddress && (
                  <div className="w-full space-y-2 col-span-2">
                    <Label htmlFor="saved-address">Getting saved addresses</Label>
                    <p className='capitalize p-5 bg-gray-200 animate-pulse rounded-md'></p>
                  </div>
                )}
                {!loadingAddress && addresses.length <= 0 &&(
                  <div className="w-full space-y-2 col-span-2">
                    <Label htmlFor="saved-address">You have no saved address</Label>
                  </div>
                )}
                {!loadingAddress && addresses.length > 0 && (
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="saved-address">Use a saved address</Label>
                    <select
                      id="saved-address"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={selectedAddressId}
                      onChange={(e) => handleSelectSavedAddress(e.target.value)}
                    >
                      <option value="" disabled>
                        Select a saved address
                      </option>
                      <option value="">Enter address manually</option>
                      {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr?.attributes?.label || addr?.attributes?.street_address || ""}
                          {addr?.attributes?.is_default ? " (Default)" : ""} —  
                          {addr?.attributes?.city || addr?.attributes?.state || ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="first-name">First name <span className="text-destructive">*</span></Label>
                  <Input id="first-name" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={!!selectedAddressId} readOnly={!!selectedAddressId}/>
                  {formErrors.firstName && (
                    <p className="text-sm text-destructive">{formErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name <span className="text-destructive">*</span></Label>
                  <Input id="last-name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!!selectedAddressId} readOnly={!!selectedAddressId}/>
                  {formErrors.lastName && (
                    <p className="text-sm text-destructive">{formErrors.lastName}</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                  <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!selectedAddressId} readOnly={!!selectedAddressId}/>
                  {formErrors.email && (
                    <p className="text-sm text-destructive">{formErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone">Phone number <span className="text-destructive">*</span></Label>
                  <Input id="phone" placeholder="08012345678" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!!selectedAddressId} readOnly={!!selectedAddressId}/>
                  {formErrors.phone && (
                    <p className="text-sm text-destructive">{formErrors.phone}</p>
                  )}
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
                    disabled={!!selectedAddressId}
                  >
                    <option value="">Select your state</option>
                    {deliveryStates.map((s) => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                  {formErrors.state && (
                    <p className="text-sm text-destructive">{formErrors.state}</p>
                  )}
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
                      disabled={!!selectedAddressId}
                    >
                      <option value="">Select your area</option>
                      {lagosAreas.map((item) => (
                        <option key={`${item.zoneId}-${item.area}`} value={item.area}>
                          {item.area} — {formatPlanPrice(item.fee)}
                        </option>
                      ))}
                    </select>
                    {formErrors.city && (
                      <p className="text-sm text-destructive">{formErrors.city}</p>
                    )}
                    {lagosZoneInfo && (
                      <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/[0.03] p-3">
                        <MapPin className="h-5 w-5 shrink-0 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{selectedArea}</p>
                          <p className="text-xs text-muted-foreground">Lagos</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">{displayCurrency(deliveryFee, "NGN")}</p>
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
                        disabled={!!selectedAddressId} readOnly={!!selectedAddressId}
                      />
                      {formErrors.city && (
                        <p className="text-sm text-destructive">{formErrors.city}</p>
                      )}
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
                  <Input id="street-address" placeholder="12 Adeniyi Jones Avenue" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} disabled={!!selectedAddressId} readOnly={!!selectedAddressId}/>
                  {formErrors.streetAddress && (
                    <p className="text-sm text-destructive">{formErrors.streetAddress}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="apartment">Apartment<span className="text-destructive">*</span></Label>
                  <Input id="apartment" placeholder="e.g First Floor, Room 10" value={apartment} onChange={(e) => setApartment(e.target.value)} disabled={!!selectedAddressId} readOnly={!!selectedAddressId}/>
                  {formErrors.apartment && (
                    <p className="text-sm text-destructive">{formErrors.apartment}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="zip-code">Zip Code (optional)</Label>
                  <Input id="zip-code" placeholder="102045" value={zipCode} onChange={(e) => setZipCode(e.target.value)} disabled={!!selectedAddressId} readOnly={!!selectedAddressId}/>
                  {formErrors.zipCode && (
                    <p className="text-sm text-destructive">{formErrors.zipCode}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Label htmlFor="airplane-mode">Set as default address</Label>
                  <Switch id="airplane-mode" checked={isDefaultAddresss} onCheckedChange={handleSetAddressAsDefault}/>
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

            {subInfo?.selectedFrequency && (
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Schedule Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p className="flex items-center justify-between">
                    <span className="text-muted-foreground">Frequency</span>
                    <span>{subInfo?.selectedFrequency}</span>
                  </p>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="airplane-mode">Enable Auto Subscribe</Label>
                    <Switch id="airplane-mode" checked={autoSubscribe} onCheckedChange={setAutoSubscribe}/>
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="airplane-mode">Enable Auto Debit</Label>
                    <Switch id="airplane-mode" checked={autoDebit} onCheckedChange={setAutoDebit}/>
                  </div>
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
                {Object.keys(formErrors).length > 0 && (
                  <div className="text-sm text-destructive space-y-1">
                    {Object.values(formErrors).map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </div>
                )}
                {Object.keys(formErrors).length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Please fix the highlighted fields.
                  </p>
                )}
                <p className="text-sm text-muted-foreground">Make sure you complete delivery information before payment.</p>
                {paystackError && <p className="text-sm text-destructive">{paystackError}</p>}
                <Button
                  type="button"
                  disabled={!canSubmit || !cartItems || paystackInitLoading}
                  onClick={handlePaystackCheckout}
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
              {loadingCart && (
                <div className="p-6">
                  <Skeleton/>
                </div>
              )}

              {!loadingCart && !cartItems && (
                <div className="px-6 py-16">
                  <p className="text-xs font-semibold text-center text-muted-foreground">
                    Unable to fetch your cart, Please try refreshing again
                  </p>
                </div>
              )}

              {!loadingCart && cartItems && (
                <CardContent className="space-y-3">
                  {subInfo?.subscription && (
                    <>
                      {subInfo?.subscription?.attributes?.prefilled_items?.length > 0 && (
                        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Mandatory cuts
                          </p>
                          {subInfo?.subscription?.attributes?.prefilled_items?.map((item) => (
                            <div key={item?.product_id} className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-foreground">{item?.name}</span>
                              <span className="text-xs text-muted-foreground">{item?.weight}{item?.weight_unit}</span>
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

                          <Button variant="link" className="h-auto p-0 text-primary" asChild>
                            <Link to={ROUTES.buildBox}>Edit full box</Link>
                          </Button>
                        </div>
                      )}

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

                      {cartItems?.attributes?.items.filter((s) => s.item_type === 'addon').length > 0 && (
                        <div className="rounded-lg border border-border bg-background p-3 space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add-ons</p>
                          {cartItems?.attributes?.items.filter((s) => s.item_type === 'addon').map((item) => (
                            <div key={item?.productId?.id} className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">{item?.productId?.name}</span>
                                  <Badge variant="outline" className="text-xs">{item?.quantity}x</Badge>
                                </div>
                                <span className="text-xs text-right text-muted-foreground">{item?.productId?.formattedWeight}</span>
                            </div>
                          ))}
                          {/* <Button variant="link" className="h-auto p-0 text-primary" asChild>
                            <Link to={ROUTES.cartReview}>Manage add-ons</Link>
                          </Button> */}
                        </div>
                      )}
                      
                      {/* {cartItems?.attributes?.items.filter((s) => s.item_type === 'addon').length > 0 && (
                        <div className="rounded-lg border border-border bg-background p-3 space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add-ons</p>
                          {cartItems?.attributes?.items.filter((s) => s.item_type === 'addon').map((item) => (
                            <div key={item?.productId?.id} className="flex items-start justify-between gap-2">
                              <div className="leading-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">{item?.productId?.name}</span>
                                  <Badge variant="outline" className="text-xs">{item?.quantity}x</Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">{item?.productId?.formattedWeight}</span>
                              </div>
                              <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => setAddonQty(item, item?.quantity - 1)}>
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button variant="link" className="h-auto p-0 text-primary" asChild>
                            <Link to={ROUTES.cartReview}>Manage add-ons</Link>
                          </Button>
                        </div>
                      )} */}

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
                      {cartItems?.attributes?.addonTotal && <p className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Add-ons</span><span>{displayCurrency(cartItems?.attributes?.addonTotal, "NGN")}</span></p>}
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
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* {showSuccessModal && (
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
      )} */}

    </div>
  );
};

export default Checkout;
