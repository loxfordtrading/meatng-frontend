import { Link } from "react-router-dom";
import { Quote, Star, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

const reviews = [
  {
    quote: "Best steaks we have had and the club community is awesome.",
    name: "Ada",
    location: "Lagos",
    highlight: "Steak quality",
  },
  {
    quote: "Every box feels curated. The quality difference is obvious.",
    name: "Kene",
    location: "Abuja",
    highlight: "Consistent quality",
  },
  {
    quote: "Flexible delivery and amazing cuts. We are hooked.",
    name: "Bisi",
    location: "Port Harcourt",
    highlight: "Delivery control",
  },
  {
    quote: "The ribeye was restaurant quality and delivery was seamless.",
    name: "Tunde",
    location: "Ibadan",
    highlight: "Premium cuts",
  },
  {
    quote: "Love the recipes and community challenges every week.",
    name: "Maya",
    location: "Enugu",
    highlight: "Club access",
  },
  {
    quote: "Everything arrives perfectly packed and freezer ready.",
    name: "Zainab",
    location: "Kano",
    highlight: "Clean packaging",
  },
];

const trustSignals = [
  {
    icon: ShieldCheck,
    title: "Hygienic processing",
    description: "Members repeatedly mention clean preparation and packaging standards.",
  },
  {
    icon: Truck,
    title: "Reliable delivery",
    description: "Tracked deliveries and predictable windows keep planning easy.",
  },
  {
    icon: Sparkles,
    title: "Club experience",
    description: "Recipes, events, and drops create ongoing value beyond the box.",
  },
];

const Reviews = () => {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(33,130,37,0.14),_transparent_56%)] py-12 sm:py-20">
        <div className="absolute -top-20 left-12 h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-float-soft" />
        <div className="absolute bottom-0 right-8 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl animate-float-soft" />

        <div className="container relative z-10 grid gap-8 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="animate-fade-in">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Reviews</p>
            <h1 className="mt-4 text-4xl md:text-6xl font-display font-bold leading-tight">
              Loved by Meat Lovers nationwide.
            </h1>
            <p className="mt-5 text-lg text-foreground/80 max-w-xl">
              Real members sharing how Meatng improved their weekly cooking routine, quality expectations, and delivery
              experience.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link to={ROUTES.plans}>Choose your box</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={ROUTES.club}>Explore the club</Link>
              </Button>
            </div>
          </div>

          <Card
            className="hidden sm:block rounded-[32px] border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.5)] animate-fade-in"
            style={{ animationDelay: "120ms" }}
          >
            <CardContent className="p-5">
              <img
                src="/25.jpg"
                alt="Member testimonials visual"
                className="h-64 w-full rounded-3xl object-cover"
                loading="lazy"
              />
              <div className="mt-4 rounded-2xl bg-white p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Average member sentiment</p>
                <div className="mt-2 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                  <span className="ml-2 text-sm font-semibold text-foreground">4.9/5</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Based on active subscriber feedback and post-delivery surveys.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="container">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Testimonials</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold">What members are saying</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <Card
                key={`${review.name}-${review.location}`}
                className="rounded-[28px] border-white/40 bg-white/70 backdrop-blur-xl shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="icon-chip h-9 w-9 rounded-xl">
                      <Quote className="h-4 w-4" />
                    </span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{review.highlight}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">"{review.quote}"</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-white text-sm font-semibold text-primary">
                      {review.name.slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trustSignals.map((signal) => (
              <Card key={signal.title} className="rounded-[26px] border-white/40 bg-white/70 backdrop-blur-xl shadow-md">
                <CardContent className="p-6">
                  <div className="icon-chip">
                    <signal.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{signal.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{signal.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="container">
          <div className="rounded-[32px] border border-primary/20 bg-primary/10 p-10 text-center">
            <h2 className="text-3xl font-display font-bold">Ready to experience it yourself?</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Join thousands of members already enjoying premium cuts, clean packaging, and flexible delivery.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
              <Button asChild size="lg">
                <Link to={ROUTES.plans}>Choose your box</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={ROUTES.contact}>Talk to support</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reviews;
