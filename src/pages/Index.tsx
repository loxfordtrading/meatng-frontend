import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Box,
  Check,
  X,
  HelpCircle,
  Sparkles,
  Leaf,
  Flame,
  Star,
  Truck,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { plans } from "@/data/plans";
import { ROUTES } from "@/lib/routes";
import { axiosClient } from "@/GlobalApi";
import { LoadingData } from "@/components/LoadingData";

const heroHighlights = [
  "Chef-grade cuts curated for flavor",
  "Flexible monthly boxes you control",
  "Meat Lovers Club access included",
];

const heroBadges = [
  { label: "Grass-fed", icon: Leaf },
  { label: "48h delivery", icon: Truck },
  { label: "Chef curated", icon: Flame },
];

const valueProps = [
  {
    title: "Ethical sourcing",
    description: "Pasture-raised proteins with transparent sourcing and welfare standards.",
    icon: Leaf,
  },
  {
    title: "Cold-chain delivery",
    description: "Insulated, chilled, and tracked from butcher to doorstep.",
    icon: Truck,
  },
  {
    title: "Butcher-checked",
    description: "Hand-trimmed and portioned to keep every cut consistent.",
    icon: Shield,
  },
  {
    title: "Club community",
    description: "Challenges, recipes, and tips from the Meat Lovers Club.",
    icon: Users,
  },
];

const steps = [
  {
    step: "1",
    title: "Pick your box",
    description: "Choose your size and the cuts you love most.",
    icon: Box,
  },
  {
    step: "2",
    title: "Customize delivery",
    description: "Set your cadence, skip weeks, or swap proteins anytime.",
    icon: Truck,
  },
  {
    step: "3",
    title: "We pack and deliver",
    description: "Vacuum sealed, iced, and carefully packed to stay fresh.",
    icon: Shield,
  },
  {
    step: "4",
    title: "Enjoy and explore",
    description: "Cook with confidence, share recipes, join the community.",
    icon: Sparkles,
  },
];

const highlights = [
  {
    title: "Grass-fed Ribeye",
    description: "Rich marbling and bold flavor for steak night.",
    image: "/bg17.jpg",
    tag: "Steakhouse",
  },
  {
    title: "Prime Beef Ribs",
    description: "Slow-cook, grill, or smoke with deep, meaty flavor.",
    image: "/19.jpg",
    tag: "Low & Slow",
  },
  {
    title: "Free-range Chicken Thighs",
    description: "Versatile, juicy, and weeknight ready.",
    image: "/20.jpg",
    tag: "Everyday",
  },
];

const gallery = [
  {
    title: "Sunday roast spread",
    subtitle: "Comfort food, elevated",
    image: "/21.jpg",
  },

  {
    title: "Market fresh prep",
    subtitle: "Clean trims and cuts",
    image: "/24.jpg",
  },
  {
    title: "Grill night favorites",
    subtitle: "Char, smoke, and sizzle",
    image: "/22.jpg",
  },
  {
    title: "Family dinner table",
    subtitle: "Shared plates, big flavors",
    image: "/bg1.jpg",
  },
];

const clubDrops = [
  {
    title: "Grill Master Pack",
    detail: "Smoky cuts curated for outdoor weekends and family cookouts.",
    icon: Flame,
  },
  {
    title: "Lean Protein Mix",
    detail: "Balanced chicken and beef picks for everyday meal prep.",
    icon: Leaf,
  },
  {
    title: "Chef Reserve Selections",
    detail: "Limited premium cuts released first to club members.",
    icon: Shield,
  },
];

const testimonials = [
  {
    quote: "Best steaks we have had - and the club community is awesome.",
    name: "Ada",
    location: "Lagos",
  },
  {
    quote: "Every box feels curated. The quality difference is obvious.",
    name: "Kene",
    location: "Abuja",
  },
  {
    quote: "Flexible delivery and amazing cuts. We are hooked.",
    name: "Bisi",
    location: "Port Harcourt",
  },
];

type ComparisonValue = "yes" | "no" | "maybe";

const comparisonColumns = [
  { id: "meatng", label: "Meatng", featured: true },
  { id: "open", label: "Open Market" },
  { id: "supermarket", label: "Supermarket" },
  { id: "online", label: "Online Butchers" },
] as const;

type ComparisonColumnId = (typeof comparisonColumns)[number]["id"];

type ComparisonRow = {
  label: string;
  values: Record<ComparisonColumnId, ComparisonValue>;
};

const comparisonRows: ComparisonRow[] = [
  {
    label: "Hygienic processing and packaging",
    values: { meatng: "yes", open: "no", supermarket: "no", online: "maybe" },
  },
  {
    label: "Fixed plan pricing",
    values: { meatng: "yes", open: "no", supermarket: "maybe", online: "maybe" },
  },
  {
    label: "Customizable box within plan rules",
    values: { meatng: "yes", open: "no", supermarket: "no", online: "maybe" },
  },
  {
    label: "Scheduled recurring delivery",
    values: { meatng: "yes", open: "no", supermarket: "no", online: "maybe" },
  },
  {
    label: "Dashboard control (skip, pause, cancel)",
    values: { meatng: "yes", open: "no", supermarket: "no", online: "maybe" },
  },
];

const Index = () => {

  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState([])

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const renderIndicator = (value: ComparisonValue) => {
    if (value === "yes") {
      return <Check className="h-5 w-5 text-primary" />;
    }
    if (value === "no") {
      return <X className="h-5 w-5 text-destructive" />;
    }
    return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
  };

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await axiosClient.get("/plans")
      setPlans(response.data.data || [])
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] sm:min-h-[90vh] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(33,130,37,0.14),_transparent_56%)]">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl animate-float-soft" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl animate-float-soft" />

        <div className="relative z-10 container py-12 sm:py-20">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="text-left animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-foreground backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-primary" /> Premium membership boxes
              </div>
              <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-tight">
                Premium Meat Delivered.
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-foreground/80 max-w-xl">
                Easy monthly boxes of chef-grade beef, chicken, goat and more - plus exclusive access to the Meat Lovers
                Club.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="text-lg px-8 py-6 shadow-lg shadow-primary/20">
                  <Link to={ROUTES.plans}>
                    Choose Your Box <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-primary/40 text-primary hover:bg-primary/10 text-lg px-8 py-6"
                >
                  <a href="#whats-inside">See What's Inside</a>
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {heroBadges.map((badge) => (
                  <div
                    key={badge.label}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm font-semibold text-foreground backdrop-blur"
                  >
                    <span className="icon-chip h-9 w-9 rounded-xl">
                      <badge.icon className="h-4 w-4" />
                    </span>
                    {badge.label}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-2 text-sm text-foreground/80">
                {heroHighlights.map((highlight) => (
                  <span key={highlight} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> {highlight}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative hidden sm:block animate-fade-in" style={{ animationDelay: "120ms" }}>
              <div className="absolute -top-10 -left-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
              <div className="absolute -bottom-12 right-6 h-28 w-28 rounded-full bg-emerald-400/20 blur-2xl" />
              <div className="relative rounded-[32px] border border-white/40 bg-white/70 p-4 sm:p-6 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="/hero-meat-box.svg" alt="MeatNG box icon" className="h-10 w-10" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Sourcing standard</p>
                      <p className="text-base font-semibold text-foreground">Ethically Sourced. Halal. Hygienically Packed.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  {["/bg6.jpg", "/bg11.jpg"].map((image) => (
                    <div key={image} className="group relative overflow-hidden rounded-2xl">
                      <img
                        src={image}
                        alt="Featured meat cut"
                        className="h-36 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                    </div>
                  ))}
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl">
                  <img
                    src="/bg12.jpg"
                    alt="Assorted premium cuts"
                    className="h-40 w-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  {["Ethical farms", "Hygienic prep", "Clean packaging"].map((item) => (
                    <div key={item} className="rounded-full bg-white px-3 py-2 text-center">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              {/* 
              <div className="absolute -bottom-10 -right-8 hidden md:flex items-center gap-3 rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm font-semibold text-foreground backdrop-blur">
                <Sparkles className="h-4 w-4 text-primary" /> 4.9 average member rating
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Why Meatng */}
      <section data-reveal className="reveal-section reveal-left relative py-20 bg-muted/40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(33,130,37,0.12),_transparent_55%)]" />
        <div className="container relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="lg:order-2">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Why Meatng</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold">
              Real Meat. Real Quality. Zero Compromise.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl">
              At Meatng, we believe every meal should feel like an occasion. That is why we source only the highest
              welfare, pasture-raised, grass-fed proteins you can trust. Each box is curated for taste, sustainability,
              and value and delivered straight to your door.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {valueProps.map((item) => (
                <Card
                  key={item.title}
                  className="border-white/40 bg-white/60 backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <CardContent className="p-5">
                    <div className="mb-4 icon-chip h-11 w-11">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8">
              <Button asChild>
                <Link to={ROUTES.club}>Learn About The Club</Link>
              </Button>
            </div>
          </div>

          <div className="relative lg:order-1">
            <div className="absolute -top-8 -left-10 h-28 w-28 rounded-full bg-primary/30 blur-2xl" />
            <div className="absolute -bottom-10 right-0 h-24 w-24 rounded-full bg-emerald-400/30 blur-2xl" />
            <div className="relative rounded-[32px] border border-white/30 bg-white/30 p-4 backdrop-blur-xl shadow-[0_25px_70px_-40px_rgba(0,0,0,0.55)]">
              <img
                src="/bg13.jpg"
                alt="Butcher preparing premium cuts"
                className="h-72 w-full rounded-3xl object-cover"
              />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <img src="/bg14.jpg" alt="Meat assortment" className="h-28 w-full rounded-2xl object-cover" />
                <div className="flex flex-col justify-between rounded-2xl border border-white/40 bg-white/70 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Members</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">400+</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Boxes delivered monthly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section data-reveal className="reveal-section reveal-up py-16 bg-background">
        <div className="container">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">How it works</p>
            <h2 className="mt-3 text-3xl font-display font-bold">From farm to flame in four steps</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <Card
                key={step.step}
                className="border-white/40 bg-white/60 backdrop-blur-xl shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Step {step.step}</span>
                    <span className="icon-chip">
                      <step.icon className="h-5 w-5" />
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button size="lg" asChild className="px-8">
              <Link to={ROUTES.plans}>Start Your Subscription</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Plans Preview */}
      <section data-reveal className="reveal-section reveal-up relative py-16 bg-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(33,130,37,0.1),_transparent_55%)]" />
        <div className="container relative">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Plans</p>
            <h2 className="text-3xl font-display font-bold mb-4">Choose Your Box</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Flexible plans that fit your appetite and lifestyle.
            </p>
          </div>

          {loading ? (
              <LoadingData />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative overflow-hidden border-white/40 bg-white/60 backdrop-blur-xl shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${plan.isPopular ? "ring-2 ring-primary" : ""
                      }`}
                  >
                    {plan?.isPopular && (
                      <div className="absolute top-4 right-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                        Most Popular
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-display font-bold mb-1">{plan?.attributes?.name}</h3>
                      <p className="text-sm text-primary font-medium mb-3">{plan.attributes?.plan_type}</p>
                      <p className="text-muted-foreground text-sm mb-4">{plan?.attributes?.description}</p>
                      <ul className="space-y-2 mb-6">
                        {plan?.attributes?.highlights?.slice(0, 6).map((rule, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>
                              {rule}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <Button asChild className="w-full" variant={plan?.isPopular ? "default" : "outline"}>
                        <Link to={ROUTES.plans}>Get Started</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          }

          <div className="text-center mt-4">
            <Button asChild size="lg">
              <Link to={ROUTES.plans}>
                View All Plans and Pricing <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Weekly Drops */}
      {/* <section data-reveal className="reveal-section reveal-right py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Weekly drops</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold">Fresh club picks every week</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Instead of a static box preview, each week features curated cut packs tailored to cooking moments and member requests.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
            <Card className="border-white/30 bg-white/70 backdrop-blur-xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <img src="/bg15.jpg" alt="Weekly drop showcase" className="h-64 md:h-full w-full object-cover" loading="lazy" />
                <div className="p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">This week</p>
                  <h3 className="mt-2 text-2xl font-display font-bold">Chef's Grill Value Pack</h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    A focused drop featuring steak cuts, ribs, and supporting proteins designed for weekend grill menus.
                  </p>
                  <div className="mt-5 space-y-2 text-sm text-foreground/80">
                    <div className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> Member-first access
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> Limited availability
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> Auto-notify before release
                    </div>
                  </div>
                  <Button asChild className="mt-6 w-full">
                    <Link to={ROUTES.club}>See This Week's Drop</Link>
                  </Button>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              {clubDrops.map((drop) => (
                <Card key={drop.title} className="rounded-3xl border border-border/60 bg-white/70 shadow-lg backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <span className="icon-chip h-11 w-11">
                        <drop.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{drop.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{drop.detail}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button asChild size="lg" variant="outline" className="w-full">
                <Link to={ROUTES.plans}>Choose a Plan to Access Drops</Link>
              </Button>
            </div>
          </div>
        </div>
      </section> */}

      {/* Featured Products */}
      <section data-reveal id="whats-inside" className="reveal-section reveal-up py-16 bg-muted/40">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">What's inside</p>
            <h2 className="mt-3 text-3xl font-display font-bold mb-3">A peek into this season's box</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">A few curated highlights from this season's cuts.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((item) => (
              <Card
                key={item.title}
                className="group overflow-hidden border-white/40 bg-white/60 backdrop-blur-xl shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-foreground">
                    {item.tag}
                  </span>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button variant="outline" asChild>
              <Link to={ROUTES.products}>Full Cut List</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section data-reveal className="reveal-section reveal-right py-16 bg-background">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Club moments</p>
              <h2 className="mt-3 text-3xl font-display font-bold">Meat Lovers Club in motion</h2>
              <p className="mt-2 text-muted-foreground max-w-xl">
                Recipes, cook-alongs, and community moments from members across the country.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to={ROUTES.club}>See Club Stories</Link>
            </Button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {gallery.map((item) => (
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
                  <p className="text-xs text-white/70">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section data-reveal className="reveal-section reveal-left py-16 bg-muted/40">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Testimonials</p>
            <h2 className="mt-3 text-3xl font-display font-bold mb-3">Loved by Meat Lovers Nationwide</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Real members. Real meals. Real feedback.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <Card key={item.name} className="border-white/40 bg-white/60 backdrop-blur-xl shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">"{item.quote}"</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-white text-sm font-semibold text-primary">
                      {item.name.slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button variant="outline" asChild>
              <Link to={ROUTES.reviews}>Read More Reviews</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section data-reveal className="reveal-section reveal-right py-16 bg-muted/40">
        <div className="container">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Comparison</p>
            <h2 className="text-3xl font-display font-bold mb-3">Meatng vs Others</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A quick comparison against common alternatives for sourcing meat.
            </p>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <div className="min-w-[780px] overflow-hidden rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-lg">
              <div className="grid grid-cols-[1.2fr_repeat(4,1fr)] border-b border-white/40">
                <div className="p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Criteria</div>
                {comparisonColumns.map((column) => (
                  <div
                    key={column.id}
                    className={`p-4 text-center text-sm font-semibold uppercase tracking-wider ${column.featured ? "bg-primary text-primary-foreground" : "bg-muted/40"
                      }`}
                  >
                    {column.label}
                  </div>
                ))}
              </div>
              {comparisonRows.map((row, index) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-[1.2fr_repeat(4,1fr)] ${index !== comparisonRows.length - 1 ? "border-b border-white/30" : ""
                    }`}
                >
                  <div className="p-4 text-sm font-medium">{row.label}</div>
                  {comparisonColumns.map((column) => (
                    <div
                      key={column.id}
                      className={`flex items-center justify-center p-4 ${column.featured ? "bg-primary/10" : ""}`}
                    >
                      {renderIndicator(row.values[column.id])}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section data-reveal className="reveal-section reveal-up relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "url('/meatbg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/80 to-emerald-900/90" />
        <div className="container relative text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            Ready to choose your box?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Premium cuts, flexible delivery, and the Meat Lovers Club - all in one subscription.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8">
            <Link to={ROUTES.plans}>
              Choose Your Box <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
