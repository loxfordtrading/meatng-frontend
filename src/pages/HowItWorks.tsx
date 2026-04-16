import { Link } from "react-router-dom";
import { Box, Calendar, Truck, Users, CheckCircle2, Flame, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";
import { BackButton } from "@/components/BackButton";

const steps = [
  {
    id: "01",
    icon: Box,
    title: "Choose your box",
    description: "Pick a plan and exact box weight that matches how you cook.",
    image: "/30.jpg",
  },
  {
    id: "02",
    icon: Calendar,
    title: "Set your schedule",
    description: "Choose weekly, bi-weekly, or monthly delivery with full control.",
    image: "/31.jpg",
  },
  {
    id: "03",
    icon: Truck,
    title: "Packed and delivered",
    description: "Each cut is chilled, sealed, and dispatched with live tracking.",
    image: "/34.jpg",
  },
  {
    id: "04",
    icon: Users,
    title: "Cook and share",
    description: "Unlock recipes, member perks, and challenges in the Meat Lovers Club.",
    image: "/35.jpg",
  },
];

const planBenefits = [
  "No lock-in contracts",
  "Skip, pause, or cancel anytime",
  "Flexible cut swaps before each delivery",
  "Club access included in every active plan",
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(33,130,37,0.14),_transparent_56%)] py-12 sm:py-20">
        <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float-soft" />
        <div className="absolute -bottom-16 right-10 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl animate-float-soft" />

        <div className="container relative z-10 grid gap-8 sm:gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="animate-fade-in">
            <BackButton />
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">How it works</p>
            <h1 className="mt-4 text-4xl md:text-6xl font-display font-bold leading-tight">
              Your premium meat routine, redesigned.
            </h1>
            <p className="mt-5 text-lg text-foreground/80 max-w-xl">
              Meatng turns weekly shopping into a cleaner, smarter flow. Choose a plan, tune your cadence, and receive
              chef-grade cuts right when you need them.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                <Link to={ROUTES.plans}>Start now</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={ROUTES.sourcing}>See how we source</Link>
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Tracked delivery", icon: Truck },
                { label: "Club included", icon: Sparkles },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm font-medium backdrop-blur-xl"
                >
                  <span className="inline-flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden sm:block animate-fade-in" style={{ animationDelay: "120ms" }}>
            <div className="absolute -top-8 -right-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
            <Card className="rounded-[32px] border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.5)]">
              <CardContent className="p-5">
                <img
                  src="/27.jpg"
                  alt="Delivery workflow visual"
                  className="h-64 w-full rounded-3xl object-cover"
                  loading="lazy"
                />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <img
                    src="/29.jpg"
                    alt="Subscription prep visual"
                    className="h-28 w-full rounded-2xl object-cover"
                    loading="lazy"
                  />
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Average delivery</p>
                    <p className="mt-2 text-2xl font-bold">48h</p>
                    <p className="text-sm text-muted-foreground">From packhouse to door</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="container">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Step by step</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold">From order to plate in 4 clear steps</h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step) => (
              <Card
                key={step.id}
                className="group rounded-[30px] border-white/40 bg-white/70 backdrop-blur-xl shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <CardContent className="p-5">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img
                      src={step?.image}
                      alt={step?.title}
                      className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-foreground">
                      Step {step.id}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <span className="icon-chip">
                      <step.icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          <div className="rounded-[34px] border border-border/50 bg-white/80 p-8 shadow-lg backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">Built for real life</p>
            <h2 className="mt-3 text-3xl font-display font-bold">Flexible enough for busy weeks</h2>
            <p className="mt-4 text-muted-foreground">
              Designed for families, foodies, and home cooks who want predictable quality without rigid subscriptions.
            </p>
            <ul className="mt-6 space-y-3">
              {planBenefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link to={ROUTES.plans}>Choose a plan</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={ROUTES.faqs}>Read FAQs</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <img
              src="/36.jpg"
              alt="Dispatch visual"
              className="h-52 w-full rounded-[26px] object-cover shadow-lg animate-float-soft"
              loading="lazy"
            />
            <img
              src="/37.jpg"
              alt="Meal prep visual"
              className="mt-10 h-52 w-full rounded-[26px] object-cover shadow-lg animate-float-soft"
              loading="lazy"
            />
            <div className="col-span-2 rounded-[26px] border border-primary/20 bg-primary/10 p-5">
              <div className="icon-chip">
                <Flame className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold">Fresh prep reminders and cooking tips in your member dashboard.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
