import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gift, Sparkles, Building2, Heart, Truck, CheckCircle2, CalendarDays, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { giftBoxes, getProductById, formatPrice } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { ROUTES } from "@/lib/routes";
import { axiosClient } from "@/GlobalApi";
import { toast } from "react-toastify";
import { LoadingData } from "@/components/LoadingData";
import { useGiftStore } from "@/store/giftStore";
import { useGiftPlanStore } from "@/store/giftPlanState";
import { GiftboxType } from "@/types/types";
import displayCurrency from "@/utils/displayCurrency";
import { useAuthStore } from "@/store/AuthStore";
import { z } from "zod";

export const giftSchema = z.object({
  sender_name: z
    .string()
    .min(2, "Sender name is required"),

  sender_email: z
    .string()
    .email("Invalid sender email")
    .optional()
    .or(z.literal("")),

  recipient_name: z
    .string()
    .min(2, "Recipient name is required"),

  recipient_phone: z
    .string()
    .min(7, "Recipient phone is required"),

  recipient_email: z
    .string()
    .email("Invalid recipient email")
    .optional()
    .or(z.literal("")),

  occasion: z.string().min(1),

  gift_box_id: z
    .string()
    .min(1, "Please select a gift box"),

  delivery_date: z
    .string()
    .min(1, "Please select delivery date"),

  delivery_window_label: z
    .string()
    .min(1),

  message: z
    .string()
    .max(240, "Message must be less than 240 characters")
    .optional()
    .or(z.literal("")),
});

const giftingOptions = [
  {
    title: "The Classic Box",
    description: "2.5kg mixed cuts (beef + offals), packed and ready to gift.",
    price: "N15,000",
    image: "/41.jpg",
    icon: Gift,
  },
  {
    title: "Entertainer Box",
    description: "4kg mixed cuts (beef + chicken + offals) for hosting and shared meals.",
    price: "N25,000",
    image: "/44.jpg",
    icon: Sparkles,
  },
  {
    title: "Grand Celebration Box",
    description: "6kg mixed cuts (customizable beef, chicken, offal) for major occasions.",
    price: "N40,000",
    image: "/45.jpg",
    icon: Building2,
  },
];

const occasions = [
  { title: "Birthdays", image: "/family.jpg" },
  { title: "Wedding gifts", image: "/gift1.jpg" },
  { title: "Holiday hosting", image: "/meat-people.jpg" },
  { title: "Client appreciation", image: "/meat-club.jpg" },
];

const process = [
  "Choose a gift box tier",
  "Add recipient details and message card",
  "Pick a preferred delivery date/window",
  "We pack, brand, and deliver your gift box",
];

const deliveryWindows = ["8 AM - 12 PM", "12 PM - 4 PM", "4 PM - 8 PM"];

const giftBoxImageOverrides: Record<string, string> = {
  "gift-classic": "/gift3.jpg",
  "gift-entertainer": "/gift4.jpg",
  "gift-grand-celebration": "/gift5.jpg",
};

const getGiftBoxImage = (boxId: string): string => giftBoxImageOverrides[boxId] ?? "/placeholder.svg";

const Gifts = () => {

  const userInfo = useAuthStore(state => state.userInfo)
  const navigate = useNavigate();
  const [giftBoxes, setGiftBoxes] = useState<GiftboxType[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null)
  const [selectedGiftBoxId, setSelectedGiftBoxId] = useState<string>(giftBoxes[0]?.id ?? "");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [recipientEmail, setRecipientemail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [occasion, setOccasion] = useState("Birthday");
  const [message, setMessage] = useState("");
  const [preferredDeliveryDate, setPreferredDeliveryDate] = useState("");
  const [preferredDeliveryWindow, setPreferredDeliveryWindow] = useState(deliveryWindows[0]);

  const selectedGiftBox = useMemo(
    () => giftBoxes.find((box) => box.id === selectedGiftBoxId) ?? giftBoxes[0],
    [selectedGiftBoxId]
  );

  const canContinue = !!selectedGiftBox && recipientName.trim().length > 0 && senderName.trim().length > 0;

   useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axiosClient.get("/giftboxes/active")

      const data = response.data.data || [

      ]
      const formatGiftboxes = data.map((item: any) => ({
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
      }));

      setGiftBoxes(formatGiftboxes )

      if (response.data.data) {
        setSelectedGiftBoxId(response.data.data[0].id);
      }
      setMeta(response.data.meta)
    } catch (err) {
      toast.error(err.response.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const addGiftToCart = async () => {
    const data = {
      sender_name: senderName,
      sender_email: senderEmail,
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      occasion: occasion,
      gift_box_id: selectedGiftBoxId,
      message: message,
      delivery_date: preferredDeliveryDate,
      delivery_window_label: preferredDeliveryWindow
    }

    const result = giftSchema.safeParse(data);

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    localStorage.setItem("gift", JSON.stringify(data))

    if(userInfo.access){
      navigate(`${ROUTES.giftCheckout}?boxId=${selectedGiftBoxId}`)
    }else{
      navigate(ROUTES.login)
    }

  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(33,130,37,0.14),_transparent_56%)] py-12 sm:py-20">
        <div className="absolute -top-20 left-12 h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-float-soft" />
        <div className="absolute bottom-2 right-8 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl animate-float-soft" />

        <div className="container relative z-10 grid gap-8 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="animate-fade-in">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Gifts</p>
            <h1 className="mt-4 text-4xl md:text-6xl font-display font-bold leading-tight">Send a gift worth sharing.</h1>
            <p className="mt-5 text-lg text-foreground/80 max-w-xl">
              Premium meat gift boxes for families, celebrations, and corporate appreciation. Choose a box, add recipient
              details, and send it through our one-time checkout flow.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <a href="#gift-builder">Build a gift order</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={ROUTES.products}>Shop all products</Link>
              </Button>
            </div>
          </div>

          <Card className="hidden sm:block rounded-[32px] border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.5)] animate-fade-in" style={{ animationDelay: "120ms" }}>
            <CardContent className="p-5">
              <img src="/40.jpg" alt="Gift-ready premium box visual" className="h-64 w-full rounded-3xl object-cover" loading="lazy" />
              <div className="mt-4 rounded-2xl bg-white p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Gift promise</p>
                <p className="mt-2 text-base font-semibold">Cleanly packed, temperature managed, and delivered on time.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {loading && (
        <div className="my-48">
          <LoadingData/>
        </div>
      )}

      {/* Main */}
      {!loading && giftBoxes.length > 0 && (
        <section id="gift-builder" className="py-10 sm:py-16 bg-muted/30">
          <div className="container grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start pb-28 lg:pb-0">
            <div className="space-y-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Gift builder</p>
                <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold">Create your gift order</h2>
                <p className="mt-3 text-muted-foreground">
                  Choose a gift box, add a message card, and send it to cart or straight to checkout.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">1. Choose a gift box</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {giftBoxes.map((box) => {
                    const selected = selectedGiftBox?.id === box.id;
                    return (
                      <button
                        key={box.id}
                        type="button"
                        onClick={() => setSelectedGiftBoxId(box.id)}
                        className={`text-left rounded-2xl border bg-background transition overflow-hidden ${selected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"}`}
                      >
                        <img src={box?.image} alt={box?.name} className="h-36 w-full object-cover" loading="lazy" />
                        <div className="p-4">
                          <p className="font-semibold">{box?.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {box?.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{box?.weight}{box?.weight_unit}</p>
                          <p className="text-sm text-primary font-semibold mt-2">{displayCurrency(box?.price, "NGN")}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="sender-name">Sender name</Label>
                  <Input id="sender-name" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender-email">Sender email</Label>
                  <Input id="sender-email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="Your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient-name">Recipient name</Label>
                  <Input id="recipient-name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Who is receiving this?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient-phone">Recipient phone</Label>
                  <Input id="recipient-phone" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="For delivery coordination" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient-email">Recipient email</Label>
                  <Input id="recipient-email" value={recipientEmail} onChange={(e) => setRecipientemail(e.target.value)} placeholder="Recipient email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occasion">Occasion</Label>
                  <select id="occasion" className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
                    <option value="Birthday">Birthday</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="wedding gift">Wedding Gift</option>
                    <option value="Holiday hosting">Holiday Hosting</option>
                    <option value="thank you">Thank You</option>
                    <option value="Corporate Appreciation">Corporate Appreciation</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery-date">Preferred delivery date</Label>
                  <Input id="delivery-date" type="date" value={preferredDeliveryDate} onChange={(e) => setPreferredDeliveryDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery-window">Preferred delivery window</Label>
                  <select id="delivery-window" className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={preferredDeliveryWindow} onChange={(e) => setPreferredDeliveryWindow(e.target.value)}>
                    {deliveryWindows.map((window) => (
                      <option key={window} value={window}>{window}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="gift-message">Message card (Optional)</Label>
                  <Textarea
                    id="gift-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 240))}
                    placeholder="Write a short gift note for the recipient"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">{message?.length}/240 characters</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <Card className="sticky top-24 rounded-2xl">
                <CardContent className="p-6 space-y-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Summary</p>
                    <h3 className="mt-2 text-2xl font-display font-bold">Gift order preview</h3>
                  </div>

                  {selectedGiftBox && (
                    <>
                      <div className="rounded-xl border border-border overflow-hidden bg-background">
                        <img
                          src={selectedGiftBox?.image}
                          alt={selectedGiftBox?.name}
                          className="h-40 w-full object-cover"
                          loading="lazy"
                        />

                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold">{selectedGiftBox?.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {selectedGiftBox?.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {selectedGiftBox?.weight}{selectedGiftBox?.weight_unit}
                              </p>
                            </div>

                            <Badge variant="secondary">Gift box</Badge>
                          </div>

                          <p className="mt-2 text-sm font-semibold text-primary">
                            {displayCurrency(selectedGiftBox?.price, "NGN")}
                          </p>
                        </div>
                      </div>

                      {selectedGiftBox?.products?.length > 0 && (
                        <div className="rounded-xl border border-border p-4 space-y-2">
                          <p className="text-sm font-semibold flex items-center gap-2">
                            <Package2 className="h-4 w-4 text-primary" />
                            Included cuts
                          </p>

                          <div className="space-y-1">
                            {selectedGiftBox.products.map((line) => (
                              <p
                                key={line?.id}
                                className="text-xs text-muted-foreground flex items-center justify-between gap-2"
                              >
                                <span>{line?.name} - {line?.weight}{line?.weight_unit}</span>
                                <span>{line?.quantity}x</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="rounded-xl border border-dashed border-border p-4 space-y-2 text-sm">
                    <p className="font-medium">Recipient</p>
                    <p className="text-muted-foreground">{recipientName || "Add recipient name"}</p>
                    <p className="text-muted-foreground">{recipientPhone || "Add recipient phone number"}</p>
                    <p className="text-muted-foreground">From {senderName || "Add sender name"}</p>
                    <p className="text-muted-foreground">Occasion: {occasion}</p>
                    {preferredDeliveryDate && (
                      <p className="text-muted-foreground flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {preferredDeliveryDate} - {preferredDeliveryWindow}</p>
                    )}
                    {message && <p className="text-foreground text-xs">{message}</p>}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <Button size="lg" disabled={!canContinue} 
                      onClick={addGiftToCart}
                    >
                      Buy Gift Now
                    </Button>
                    {/* <Button size="lg" variant="outline" disabled={!canContinue} 
                      // onClick={() => addGiftToCart(false)}
                    >
                      Add Gift to Cart
                    </Button> */}
                  </div>

                  <p className="text-xs text-muted-foreground">Gift orders checkout through the one-time order flow. You can add regular products before payment.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-muted/40">
        <div className="container">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Gift options</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold">Choose your gifting style</h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {giftingOptions.map((option) => (
              <Card key={option.title} className="group rounded-[30px] border-white/40 bg-white/70 backdrop-blur-xl shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                <div className="relative overflow-hidden rounded-t-[30px]">
                  <img src={option.image} alt={option.title} className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                </div>
                <CardContent className="p-6">
                  <span className="icon-chip"><option.icon className="h-5 w-5" /></span>
                  <h3 className="mt-4 text-xl font-semibold">{option.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{option.description}</p>
                  <p className="mt-4 text-sm font-semibold text-primary">{option.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <div className="rounded-[34px] border border-white/40 bg-white/70 p-8 shadow-lg backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">Occasions</p>
            <h2 className="mt-3 text-3xl font-display font-bold">Perfect for personal and corporate gifting</h2>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {occasions.map((occasion) => (
                <div key={occasion.title} className="group relative overflow-hidden rounded-[22px]">
                  <img src={occasion.image} alt={occasion.title} className="h-36 w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  <p className="absolute bottom-3 left-3 text-sm font-semibold text-white">{occasion.title}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="rounded-[32px] border-white/40 bg-white/70 backdrop-blur-xl shadow-lg">
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">How gifting works</p>
              <h3 className="mt-2 text-2xl font-display font-bold">Simple 4-step flow</h3>
              <ul className="mt-6 space-y-4">
                {process.map((step) => (
                  <li key={step} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-2xl bg-primary/10 p-4">
                <div className="icon-chip"><Heart className="h-5 w-5" /></div>
                <p className="mt-3 text-sm font-medium">Include a message card and delivery note at no extra charge.</p>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <Button asChild><Link to={ROUTES.contact}>Corporate / custom gifting help</Link></Button>
                <Button asChild variant="outline"><Link to={ROUTES.corporateGifting}>Corporate gifting</Link></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="container">
          <div className="rounded-[32px] border border-primary/20 bg-primary/10 p-10 text-center">
            <div className="mx-auto icon-chip h-12 w-12 rounded-2xl"><Truck className="h-6 w-6" /></div>
            <h2 className="mt-4 text-3xl font-display font-bold">Ready to send one?</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              You can now get a gift order on this page, then continue through checkout. For bulk gifting, contact the team.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
              <Button asChild size="lg"><a href="#gift-builder">Build Gift Order</a></Button>
              <Button asChild size="lg" variant="outline"><Link to={ROUTES.giftCards}>Gift cards</Link></Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile sticky bottom bar for gift builder */}
      <div className="fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur-lg p-4 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{selectedGiftBox?.name}</p>
            <p className="text-lg font-bold text-primary">{selectedGiftBox ? formatPrice(selectedGiftBox.price) : "-"}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" disabled={!canContinue} 
              onClick={addGiftToCart}
            >
              Buy Now
            </Button>
            {/* <Button size="sm" variant="outline" disabled={!canContinue} 
              // onClick={() => addGiftToCart(false)}
            >
              Add to Cart
            </Button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gifts;

