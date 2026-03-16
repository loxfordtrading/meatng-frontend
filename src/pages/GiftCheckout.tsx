import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
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
import { GiftboxType } from "@/types/types";

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

const GiftCheckout = () => {

  const navigate = useNavigate();
  const subscription = useSubscription();
  const cart = useCart();
  const { state } = subscription;
  
  const [searchParams] = useSearchParams();
  
    const boxId = searchParams.get("boxId");
  const [giftBox, setGiftBox] = useState<GiftboxType | null>(null)

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
  const [loadingBox, setLoadingBox] = useState(true)
  const [paystackError, setPaystackError] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [addressesLoaded, setAddressesLoaded] = useState(false);
  const [addresses, setAddresses] = useState([])
  const [loadingAddress, setLoadingAddress] = useState(true)
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
    const [deliveryLoading, setDeliveryLoading] = useState(false);

   const stateInfo = getDeliveryState(selectedState);
  const isLagos = stateInfo?.hasZones ?? false;
  const lagosZoneInfo = isLagos ? findLagosZoneByArea(selectedArea) : null;
    // const deliveryFee = isLagos
    // ? (lagosZoneInfo?.fee ?? 0)
    // : (stateInfo?.flatFee ?? 0);

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

    useEffect(() => {
        const giftInfo = localStorage.getItem("gift");

        if (!giftInfo) {
            navigate(ROUTES.gifts, { replace: true });
            return;
        }

        try {
            JSON.parse(giftInfo); // validate stored data
        } catch {
            localStorage.removeItem("gift");
            navigate(ROUTES.gifts, { replace: true });
        }
    }, [navigate]);

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
  }, [])

  useEffect(() => {
    getGiftBox()
  }, [boxId])

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

      const sendInfo = localStorage.getItem("gift");

        let basePayload: any = {};

        if (sendInfo) {
            basePayload = JSON.parse(sendInfo);
        }

      try {

        basePayload.delivery_note = deliveryNote

        basePayload.address_id = selectedAddressId;

        const response = await axiosClient.post("/gifts", basePayload);

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

    useEffect(() => {
        if (!selectedState) return;

        if (isLagos && !selectedArea) return;
        if (!isLagos && !city) return;

        getDeliveryFee();
    }, [selectedState, selectedArea, city, apartment, streetAddress]);

  const getDeliveryFee = async () => {
    if (!validateForm()) return;
    setDeliveryFee(0)
    try {
        setDeliveryLoading(true);

        let addressId = selectedAddressId;

        // If user did NOT select saved address → create one
        if (!selectedAddressId) {
            const address = {
                address_type: "shipping",
                label: "Gift Delivery",
                first_name: firstName,
                last_name: lastName,
                email,
                phone,
                street_address: streetAddress,
                apartment_suite: apartment,
                city: city || selectedArea,
                state: selectedState,
                zip_code: zipCode,
                country: "Nigeria",
                is_default: false,
            };

            const addressRes = await axiosClient.post("/addresses", address);

            addressId = addressRes.data?.data?.id;
            setSelectedAddressId(addressId)
        }

        // Use the correct address id
        const res = await axiosClient.post("/delivery/quote", {
            address_id: addressId,
        });

        setDeliveryFee(res.data?.data?.attributes?.delivery_fee || 0);
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to fetch delivery fee");
    } finally {
        setDeliveryLoading(false);
    }
    };

  const getGiftBox = async () => {
    try {
      const res = await axiosClient.get(`/giftboxes/${boxId}`);

      const item = res.data.data || null

      const formatGiftboxes = {
        id: item.id,
        name: item.attributes.name,
        description: item.attributes.description,
        price: item.attributes.price,
        is_active: item.attributes.is_active,
        weight: item.attributes.weight,
        weight_unit: item.attributes.weight_unit,
        image: item.attributes.image,
        createdAt: item.attributes.createdAt,
        updatedAt: item.attributes.updatedAt,

        products: item.attributes.products.map((p: any) => ({
          id: p.product_id._id,
          name: p.product_id.name,
          price: p.product_id.price,
          weight:  p.product_id.mainValue,
          weight_unit:  p.product_id.unit,
          formatted_weight:  p.product_id.formattedWeight,
          description: p.product_id.description,
          is_active: p.product_id.is_active,
          quantity:  p.quantity
        })),
      };

      setGiftBox(formatGiftboxes);
    } catch (err) {
      console.error(err);
    } finally{
      setLoadingBox(false)
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-primary/80 py-10">
        <div className="container">
          <p className="text-sm text-primary-foreground/80">Gift box order</p>
          <h1 className="mt-1 text-3xl md:text-4xl font-display font-bold text-primary-foreground">Checkout</h1>
          <p className="mt-2 text-primary-foreground/85">Complete your gift box order</p>
        </div>
      </div>

      <div className="container py-6 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <Button variant="ghost" asChild>
            <Link to={ROUTES.gifts}>
              <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Gifts
            </Link>
          </Button>
        </div>

        {/* Mobile order summary (collapsed at top) */}
        <div className="lg:hidden mb-6">
          <details className="rounded-2xl border bg-muted/30 overflow-hidden">
            <summary className="flex items-center justify-between p-4 cursor-pointer">
              <span className="text-sm font-semibold">Order Summary</span>
              <span className="text-lg font-bold text-primary">{displayCurrency(giftBox?.price, "NGN")}</span>
            </summary>
            <div className="px-4 pb-4 space-y-2 text-sm border-t pt-3">
              <>
                <p className="flex justify-between"><span className="text-muted-foreground">Box</span><span>{giftBox?.name}</span></p>
                <p className="flex justify-between"><span className="text-muted-foreground">Weight</span><span>{giftBox?.weight}{giftBox?.weight_unit}</span></p>
                <p className="flex justify-between"><span className="text-muted-foreground">Price</span><span>{displayCurrency(giftBox?.price, "NGN")}</span></p>
              </>
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
                          {item.area} {deliveryFee &&  `— ${displayCurrency(deliveryFee)}`}
                        </option>
                      ))}
                    </select>
                    {formErrors.city && (
                      <p className="text-sm text-destructive">{formErrors.city}</p>
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
                    {/* <div className="md:col-span-2">
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
                    </div> */}
                  </>
                )}


                <div className="flex items-center space-x-2">
                  <Switch id="airplane-mode" checked={isDefaultAddresss} onCheckedChange={handleSetAddressAsDefault}/>
                  <Label htmlFor="airplane-mode">Set as default address</Label>
                </div>

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

                    {(selectedArea || city) && selectedState && (
                        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/[0.03] p-3">
                            <MapPin className="h-5 w-5 shrink-0 text-primary" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold">{selectedArea || city}</p>
                                <p className="text-xs text-muted-foreground">{selectedState}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-primary">
                                    {deliveryLoading ? "Calculating..." : displayCurrency(deliveryFee, "NGN")}
                                </p>
                                <p className="text-[10px] text-muted-foreground">delivery fee</p>
                            </div>
                        </div>
                    )}
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

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  disabled={!canSubmit || !giftBox || !deliveryFee || !selectedAddressId || paystackInitLoading}
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
              {loadingBox && (
                <div className="p-6">
                  <Skeleton/>
                </div>
              )}

              {!loadingBox && !giftBox && (
                <div className="px-6 py-16">
                  <p className="text-xs font-semibold text-center text-muted-foreground">
                    Unable to fetch your box, Please try refreshing again
                  </p>
                </div>
              )}

              {!loadingBox && giftBox && (
                <CardContent className="space-y-3">
                  {giftBox && (
                    <>
                      {/* Build-your-box selections */}
                      {giftBox?.products?.length > 0 && (
                        <div className="border-b pb-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-primary py-1">Included</p>
                          {giftBox?.products?.map((sel) => (
                            <div key={sel?.id} className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">{sel?.name}</span>
                                {sel?.quantity > 1 && <Badge variant="secondary" className="text-xs">{sel?.quantity}x</Badge>}
                              </div>
                              <span className="text-xs text-muted-foreground">{sel?.weight}{sel?.weight_unit}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Box</span><span>{giftBox?.name}</span></p>
                      <p className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Weight</span><span>{giftBox?.weight}{giftBox?.weight_unit}</span></p>
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

                  <p className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      Box Price
                    </span>
                    <span>{deliveryFee ? displayCurrency(giftBox?.price, "NGN") : "Select location"}</span>
                  </p>
                  <p className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Truck className="h-3.5 w-3.5" /> Delivery Fee
                    </span>
                    <span>{deliveryFee ? displayCurrency(deliveryFee, "NGN") : "Select location"}</span>
                  </p>
                  <Separator />
                  <p className="flex items-center justify-between text-lg font-bold">
                    <span>Total due now</span>
                    <span className="text-primary">
                        {displayCurrency((giftBox?.price || 0) + deliveryFee, "NGN")}
                    </span>
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

export default GiftCheckout;
