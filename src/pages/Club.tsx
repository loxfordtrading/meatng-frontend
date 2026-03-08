import { Link } from "react-router-dom";
import { ChefHat, Flame, Users, Sparkles, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";

const clubBenefits = [
  {
    icon: ChefHat,
    title: "Pro chef recipes",
    description: "Step-by-step guides, prep notes, and video tips for every cut.",
  },
  {
    icon: Flame,
    title: "Weekly grill challenges",
    description: "Fresh prompts and practical rewards that keep members engaged.",
  },
  {
    icon: Users,
    title: "Private member forum",
    description: "Share ideas, ask questions, and learn from passionate cooks.",
  },
  {
    icon: Sparkles,
    title: "Early access drops",
    description: "Members see seasonal and limited cuts before everyone else.",
  },
];

const clubFlow = [
  {
    step: "01",
    icon: MessageCircle,
    title: "Set your profile",
    description: "Tell us your household size, favorite proteins, and cooking style.",
  },
  {
    step: "02",
    icon: ShieldCheck,
    title: "Get tailored content",
    description: "Receive practical recipes and prep guides based on your preferences.",
  },
  {
    step: "03",
    icon: Sparkles,
    title: "Join member moments",
    description: "Participate in challenges, discussions, and exclusive drop alerts.",
  },
];

const clubMoments = [
  {
    title: "Weekend grill circle",
    subtitle: "Char, smoke, and crowd favorites",
    image: "/meat-lover.jpg",
  },
  {
    title: "Family meal prep",
    subtitle: "Easy plans for busy weeks",
    image: "/bg2.jpg",
  },
  {
    title: "Chef technique sessions",
    subtitle: "Cut handling and flavor layering",
    image: "/bg3.jpg",
  },
  {
    title: "Member spotlight",
    subtitle: "Real kitchens, real wins",
    image: "/family1.jpg",
  },
];

const Club = () => {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(33,130,37,0.14),_transparent_56%)] py-12 sm:py-20">
        <div className="absolute -top-20 left-14 h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-float-soft" />
        <div className="absolute bottom-0 right-8 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl animate-float-soft" />

        <div className="container relative z-10 grid gap-8 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="animate-fade-in">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Meat Lovers Club</p>
            <h1 className="mt-4 text-4xl md:text-6xl font-display font-bold leading-tight">
              Where better cooks level up fast.
            </h1>
            <p className="mt-5 text-lg text-foreground/80 max-w-xl">
              Included with every subscription. Learn from chef-backed recipes, join practical challenges, and access
              member-only drops.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link to={ROUTES.plans}>Join the club</Link>
              </Button>
              <Button size="lg" asChild variant="outline">
                <Link to={ROUTES.auth}>Member sign in</Link>
              </Button>
            </div>
          </div>

          <Card
            className="hidden sm:block rounded-[32px] border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.5)] animate-fade-in"
            style={{ animationDelay: "120ms" }}
          >
            <CardContent className="p-5">
              <img
                src="/meat-people.jpg"
                alt="Meat Lovers Club showcase"
                className="h-64 w-full rounded-3xl object-cover"
                loading="lazy"
              />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <img src="/meat-club.jpg" alt="Club cooking moment" className="h-28 w-full rounded-2xl object-cover" loading="lazy" />
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Active members</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">2,400+</p>
                  <p className="text-sm text-muted-foreground">Growing every month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="container">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Benefits</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold">Everything inside your membership</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Practical perks designed for people who cook often and care about quality.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clubBenefits.map((benefit) => (
              <Card
                key={benefit.title}
                className="rounded-[28px] border-white/40 bg-white/70 backdrop-blur-xl shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <CardContent className="p-6">
                  <div className="icon-chip">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{benefit.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">How it works</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold">Three simple onboarding steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clubFlow.map((item) => (
              <Card
                key={item.step}
                className="rounded-[28px] border-white/40 bg-white/70 backdrop-blur-xl shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Step {item.step}</span>
                    <span className="icon-chip h-9 w-9 rounded-xl">
                      <item.icon className="h-4 w-4" />
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Community moments</p>
              <h2 className="mt-3 text-3xl font-display font-bold">A club built around real kitchens</h2>
              <p className="mt-2 text-muted-foreground max-w-xl">
                Member stories, challenge highlights, and practical wins from weekly cooking routines.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to={ROUTES.reviews}>See member feedback</Link>
            </Button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {clubMoments.map((item) => (
              <div
                key={item.title}
                className="group relative min-w-[240px] md:min-w-[320px] snap-start overflow-hidden rounded-3xl"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-white/75">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="rounded-[32px] border border-primary/20 bg-primary/10 px-8 py-10 text-center">
            <h2 className="text-3xl font-display font-bold">Ready to activate your club perks?</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Start your plan, complete onboarding, and unlock recipes, discussions, and member-only drops.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
              <Button size="lg" asChild>
                <Link to={ROUTES.plans}>Choose a plan</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={ROUTES.auth}>Member sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Club;
