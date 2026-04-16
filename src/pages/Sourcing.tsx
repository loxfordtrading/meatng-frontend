import { Link } from "react-router-dom";
import { BadgeCheck, Leaf, ShieldCheck, Sprout, Truck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";
import { BackButton } from "@/components/BackButton";

const sourcingPrinciples = [
  {
    title: "Humane handling standards",
    description: "Animal welfare protocols are applied before processing begins.",
    icon: ShieldCheck,
  },
  {
    title: "Traceable supply chain",
    description: "Each batch follows strict documentation from source to dispatch.",
    icon: BadgeCheck,
  },
  {
    title: "Clean processing",
    description: "Facility-level hygiene controls keep quality consistent at scale.",
    icon: Leaf,
  },
  {
    title: "Cold-chain logistics",
    description: "Temperature-managed packing and transport protect freshness.",
    icon: Truck,
  },
];

const qualityPromises = [
  "Rich flavor and natural tenderness",
  "Reliable quality across every delivery",
  "Safe processing with strict quality checkpoints",
  "Cuts portioned for both daily meals and occasions",
];

const sustainabilityPromises = [
  "Lower environmental impact practices",
  "Responsible producer partnerships",
  "Respect for land, animals, and local communities",
  "Continuous improvement of sourcing standards",
];

const Sourcing = () => {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(33,130,37,0.14),_transparent_56%)] py-12 sm:py-20">
        <div className="absolute -top-20 left-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-float-soft" />
        <div className="absolute bottom-2 right-10 h-52 w-52 rounded-full bg-emerald-400/15 blur-3xl animate-float-soft" />

        <div className="container relative z-10 grid gap-8 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="animate-fade-in">
            <BackButton />
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Sourcing</p>
            <h1 className="mt-4 text-4xl md:text-6xl font-display font-bold leading-tight">From trusted source to table.</h1>
            <p className="mt-5 text-lg text-foreground/80 max-w-xl">
              Meatng owns and operates its own abattoir facility, giving us control over hygiene, consistency, and
              quality from processing to final dispatch.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                <Link to={ROUTES.plans}>Join Meatng</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to={ROUTES.faqs}>Read sourcing FAQs</Link>
              </Button>
            </div>
          </div>

          <Card
            className="hidden sm:block rounded-[32px] border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.5)] animate-fade-in"
            style={{ animationDelay: "120ms" }}
          >
            <CardContent className="p-5">
              <img
                src="/44.jpg"
                alt="Sourcing workflow visual"
                className="h-64 w-full rounded-3xl object-cover"
                loading="lazy"
              />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Control points</p>
                  <p className="mt-2 text-2xl font-bold">12+</p>
                  <p className="text-sm text-muted-foreground">Quality checks per batch</p>
                </div>
                <img
                  src="/42.jpg"
                  alt="Clean processing visual"
                  className="h-32 w-full rounded-2xl object-cover"
                  loading="lazy"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="container">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Our standards</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold">What drives every sourcing decision</h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {sourcingPrinciples.map((item) => (
              <Card
                key={item.title}
                className="rounded-[30px] border-white/40 bg-white/70 backdrop-blur-xl shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <CardContent className="p-6">
                  <div className="icon-chip">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-[30px] border-white/40 bg-white/70 backdrop-blur-xl shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <span className="icon-chip">
                  <BadgeCheck className="h-5 w-5" />
                </span>
                <h3 className="text-xl font-semibold">Quality you can taste</h3>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Great meals start with trusted sourcing and disciplined processing before the meat reaches your kitchen.
              </p>
              <ul className="mt-5 space-y-3">
                {qualityPromises.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {/* <img
                src="/generated/sourcing-quality.svg"
                alt="Quality sourcing visual"
                className="mt-5 h-40 w-full rounded-2xl object-cover"
                loading="lazy"
              /> */}
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border-white/40 bg-white/70 backdrop-blur-xl shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <span className="icon-chip">
                  <Sprout className="h-5 w-5" />
                </span>
                <h3 className="text-xl font-semibold">Sustainability commitment</h3>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Responsible sourcing means balancing quality, consistency, and long-term ecological stewardship.
              </p>
              <ul className="mt-5 space-y-3">
                {sustainabilityPromises.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {/* <img
                src="/generated/sourcing-sustainability.svg"
                alt="Sustainability visual"
                className="mt-5 h-40 w-full rounded-2xl object-cover"
                loading="lazy"
              /> */}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="container">
          <div className="rounded-[34px] border border-primary/20 bg-primary/10 px-8 py-10 text-center">
            <h2 className="text-3xl font-display font-bold">Choose better meat with confidence</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Better sourcing means better meals, safer preparation, and a stronger connection to what goes on your plate.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
              <Button asChild size="lg">
                <Link to={ROUTES.plans}>Explore plans</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={ROUTES.contact}>Talk to our team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sourcing;
