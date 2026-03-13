import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Layers3,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { axiosClient } from "@/GlobalApi";
import { ROUTES } from "@/lib/routes";
import { frequencies } from "@/data/plans";
import displayCurrency from "@/utils/displayCurrency";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useCartStore } from "@/store/cartStore";
import { useAddonStore } from "@/store/addonStore";
import { LoadingData } from "@/components/LoadingData";

const planIcons: Record<string, any> = {
  "value-pack": Layers3,
  essential: Package,
  signature: Sparkles,
  premium: ShieldCheck,
};

const Plans = () => {

  const navigate = useNavigate();
  const { setSubInfo } = useSubscriptionStore();
   const { clearCart } = useCartStore();
   const { clearAddon } = useAddonStore();

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<string | null>(
    null
  );

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const allowedFrequencies = frequencies;

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axiosClient.get("/plans")
      setPlans(response.data.data || [])

      if (response.data.data) {
        setSelectedPlanId(response.data.data[2].id);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!selectedPlan || !selectedFrequency) return;

    clearCart()
    clearAddon()
    
    setSubInfo({
      subscription: selectedPlan,
      selectedFrequency,
    });

    navigate(`${ROUTES.buildBox}?planId=${selectedPlan?.id}&categoryId=${selectedPlan?.attributes?.category_rules[0]?.category_id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(33,130,37,0.14),_transparent_56%)] py-10 sm:py-16">
        <div className="container relative z-10 grid gap-6 lg:gap-8 lg:grid-cols-[1.05fr_0.95fr] items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Subscription</p>
            <h1 className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-6xl font-display font-bold leading-tight">
              Pick a plan, build your box.
            </h1>
            <p className="mt-4 text-lg text-foreground/80 max-w-xl">
              Each plan comes pre-packed with quality cuts. Choose your delivery frequency,
              then add optional extras on the next step.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link to={ROUTES.products}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Shop One-time (No Subscription)
                </Link>
              </Button>
            </div>
          </div>

          <Card className="hidden sm:block rounded-[28px] border-white/40 bg-white/70 backdrop-blur-xl shadow-lg">
            <CardContent className="p-5">
              <img src="/41.jpg" alt="Subscription setup" className="h-52 w-full rounded-2xl object-cover" loading="lazy" />
              <div className="mt-4 space-y-2 text-sm">
                <p className="font-semibold">How it works</p>
                <p className="text-muted-foreground">
                  Pick a plan with fixed weight &amp; price. Your box comes pre-packed with curated cuts.
                  Add optional extras if you want more.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {loading && (
        <LoadingData/>
      )}

      {/* Main */}
      {!loading && plans.length > 0 && (
        <div className="container grid lg:grid-cols-[1.2fr_0.8fr] gap-8 pb-24">
          <div>
            {/* Plans */}
            <h2 className="text-xl font-bold mb-4">1. Select a plan</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {plans.map((plan) => {
                const selected = plan.id === selectedPlanId;
                const Icon = planIcons[plan.plan_type] || Package;

                return (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    icon={Icon}
                    selected={selected}
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      setSelectedFrequency(null);
                    }}
                  />
                );
              })}
            </div>

            {/* Frequency */}
            <h2 className="text-xl font-bold mt-10 mb-4">
              2. Delivery frequency
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allowedFrequencies.map((option) => {
                const selected = option.id === selectedFrequency;

                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedFrequency(option.id)}
                    className={`border rounded-2xl p-4 text-left transition ${
                      selected
                        ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                        : "hover:border-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{option.label}</span>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>

                    <p className="text-xs text-primary mt-2">
                      {option.billingNote}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <Card className="sticky top-24 h-fit hidden lg:block">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Summary</h2>

              {selectedPlan && (
                <>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Plan</span>
                      <span>{selectedPlan?.attributes?.name}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Weight</span>
                      <span>{selectedPlan?.attributes.weight}{selectedPlan?.attributes.weight_unit}</span>
                    </div>

                    {selectedFrequency && (
                      <div className="flex justify-between">
                        <span>Delivery Frequency</span>
                        <span>{selectedFrequency}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Price</span>
                      <span className="text-primary font-bold">
                        {displayCurrency(selectedPlan?.attributes?.price, "NGN") }
                      </span>
                    </div>
                  </div>

                  {selectedPlan?.attributes?.prefilled_items?.length > 0 && (
                    <div className="rounded-xl border border-border p-4 space-y-2 mt-4">
                      <p className="text-sm font-semibold">What's included</p>
                      
                      {/* {selectedPlan.mandatoryItems.map((item) => ( 
                        <p key={item.name} className="text-xs text-muted-foreground">Boneless Beef — 1.5kg</p> 
                      ))}  */}
                      {selectedPlan?.attributes?.prefilled_items?.map((item) => ( 
                        <p key={item?.product_id} className="text-xs text-muted-foreground">{item?.name} — {item?.weight}{item?.weight_unit}</p>
                      ))} 
                      {selectedPlan?.attributes?.category_rules?.map((item) => ( 
                        <p key={item?.category_id} className="text-xs text-primary font-medium pt-1"> + Pick {item?.weight_required}{item?.weight_unit} of {item?.label}  </p>
                      ))} 
                    </div>
                  )}

                  {/* Benefits */} 
                  {/* <div className="space-y-1"> 
                    {selectedPlan.benefits.map((benefit) => ( 
                      <p key={benefit} className="text-xs flex items-start gap-2"> 
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /> 
                        <span>{benefit}</span> 
                      </p> 
                    ))} 
                  </div> */}

                  {/* Benefits */} 
                  <div className="space-y-1 mt-4">
                    {selectedPlan?.attributes?.product_rules.length > 0 && (
                      selectedPlan?.attributes?.product_rules?.map((item) => (
                        <p key={item?.product_id}  className="text-xs flex items-start gap-2"> 
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /> 
                          <span>+ Pick {item?.max_weight}{item?.weight_unit} of {item?.label}</span> 
                        </p>
                      ))
                    )
                    }
                      <p className="text-xs flex items-start gap-2"> 
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /> 
                        <span>Dashboard control (edit/skip/pause)</span> 
                      </p>
                      <p className="text-xs flex items-start gap-2"> 
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /> 
                        <span>Flexible delivery scheduling</span> 
                      </p>
                  </div>

                  <Button
                    className="w-full mt-6"
                    disabled={!selectedFrequency || !selectedPlan}
                    onClick={handleContinue}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <div className="fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur-lg p-4 lg:hidden"> 
            <div className="flex items-center justify-between gap-4"> 
              <div> 
                <p className="text-xs text-muted-foreground">{selectedPlan?.attributes?.name} &middot; {selectedPlan?.attributes.weight}{selectedPlan?.attributes.weight_unit}</p> 
                <p className="text-lg font-bold text-primary">{displayCurrency(selectedPlan?.attributes?.price, "NGN") }</p> 
              </div> 
              <Button size="lg" disabled={!selectedFrequency || !selectedPlan} onClick={handleContinue} className="flex-1 max-w-[200px]" > Continue <ArrowRight className="ml-2 h-4 w-4" /> 
              </Button> 
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;

/* ---------------- Plan Card ---------------- */

function PlanCard({ plan, selected, icon: Icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`border rounded-2xl p-4 text-left transition ${
        selected
          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
          : "hover:border-primary"
      }`}
    >
      <img
        src={plan?.attributes?.image}
        className="h-28 w-full object-cover rounded-xl mb-3"
      />

      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">{plan?.attributes?.name}</h3>
        <Icon className="h-4 w-4 text-primary" />
      </div>

      <p className="text-xs text-primary mt-1">{plan.attributes?.plan_type}</p>

      <p className="text-sm text-muted-foreground mt-1">{plan?.attributes?.description}</p>

      <div className="mt-3 flex items-baseline gap-2"> <span className="text-2xl font-bold">{displayCurrency(plan?.attributes?.price, "NGN") }</span> <span className="text-xs text-muted-foreground">/cycle</span> </div>

      <div className="text-xs text-primary mt-1">{plan?.attributes?.weight}{plan?.attributes?.weight_unit} box</div>

      <div className="mt-2 text-[11px] text-muted-foreground"><span>{plan?.attributes?.prefilled_items_total_weight}{plan?.attributes?.weight_unit} fixed + build {plan?.attributes?.remaining_weight}{plan?.attributes?.weight_unit}</span></div>

    </button>
  );
}