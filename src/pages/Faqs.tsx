import { Link } from "react-router-dom";
import { MessageCircleQuestion, Truck, ShieldCheck, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";
import { BackButton } from "@/components/BackButton";

const generalFaqs = [
  {
    question: "How much does a subscription cost?",
    answer: "Pricing varies by plan, box size, and delivery frequency. You will see exact pricing before checkout.",
  },
  {
    question: "Can I skip or pause a delivery?",
    answer: "Yes. You can skip, pause, or change your cadence directly from your account dashboard.",
  },
  {
    question: "Do I have to sign a long-term contract?",
    answer: "No lock-in. You can cancel your subscription at any time.",
  },
];

const shippingFaqs = [
  {
    question: "Do you deliver nationwide?",
    answer: "Delivery is only available in Lagos and Ogun state.",
  },
  {
    question: "How is meat kept fresh during delivery?",
    answer: "Orders are packed in insulated boxes with cold-chain handling and sealed portions.",
  },
  {
    question: "Can I track my order?",
    answer: "Yes. Every active delivery includes tracking updates so you know when to expect your box.",
  },
];

const clubFaqs = [
  {
    question: "Is Meat Lovers Club included in every plan?",
    answer: "Yes. Every active subscription includes automatic club access at no extra charge.",
  },
  {
    question: "What does the club include?",
    answer: "Members get recipes, cooking tips, exclusive drops, and community challenges.",
  },
  {
    question: "Can I join the club without a subscription?",
    answer: "Currently, club access is tied to active subscription plans.",
  },
];

const categories = [
  { title: "General", icon: MessageCircleQuestion, count: generalFaqs.length },
  { title: "Delivery", icon: Truck, count: shippingFaqs.length },
  { title: "Club", icon: Sparkles, count: clubFaqs.length },
];

const Faqs = () => {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(33,130,37,0.14),_transparent_56%)] py-12 sm:py-20">
        <div className="absolute -top-20 left-1/4 h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-float-soft" />
        <div className="absolute bottom-0 right-8 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl animate-float-soft" />

        <div className="container relative z-10 grid gap-8 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="animate-fade-in">
            <BackButton />
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">FAQs</p>
            <h1 className="mt-4 text-4xl md:text-6xl font-display font-bold leading-tight">Questions answered clearly.</h1>
            <p className="mt-5 text-lg text-foreground/80 max-w-xl">
              Everything you need to know about plans, delivery, sourcing, and membership in one place.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link to={ROUTES.contact}>Contact support</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to={ROUTES.plans}>View plans</Link>
              </Button>
            </div>
          </div>

          <Card
            className="hidden sm:block rounded-[32px] border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.5)] animate-fade-in"
            style={{ animationDelay: "120ms" }}
          >
            <CardContent className="p-5">
              <img
                src="/45.jpg"
                alt="FAQ and support visual"
                className="h-64 w-full rounded-3xl object-cover"
                loading="lazy"
              />
              <div className="mt-4 grid grid-cols-3 gap-3">
                {categories.map((category) => (
                  <div key={category.title} className="rounded-2xl bg-white p-3 text-center">
                    <span className="icon-chip mx-auto">
                      <category.icon className="h-4 w-4" />
                    </span>
                    <p className="mt-2 text-xs font-semibold">{category.title}</p>
                    <p className="text-xs text-muted-foreground">{category.count} answers</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.title} className="rounded-[26px] border-white/40 bg-white/70 backdrop-blur-xl shadow-md">
                <CardContent className="p-5">
                  <span className="icon-chip">
                    <category.icon className="h-5 w-5" />
                  </span>
                  <h2 className="mt-3 text-lg font-semibold">{category.title}</h2>
                  <p className="text-sm text-muted-foreground">{category.count} common questions answered.</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl space-y-8">
          <Card className="rounded-[30px] border-white/40 bg-white/70 backdrop-blur-xl shadow-md">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="icon-chip">
                  <MessageCircleQuestion className="h-5 w-5" />
                </span>
                <h2 className="text-2xl font-display font-bold">General questions</h2>
              </div>
              <Accordion type="single" collapsible className="space-y-3">
                {generalFaqs.map((faq) => (
                  <AccordionItem
                    key={faq.question}
                    value={faq.question}
                    className="rounded-2xl border border-border/60 bg-background/80 px-4"
                  >
                    <AccordionTrigger className="py-4 text-left font-semibold hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border-white/40 bg-white/70 backdrop-blur-xl shadow-md">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="icon-chip">
                  <Truck className="h-5 w-5" />
                </span>
                <h2 className="text-2xl font-display font-bold">Shipping and delivery</h2>
              </div>
              <Accordion type="single" collapsible className="space-y-3">
                {shippingFaqs.map((faq) => (
                  <AccordionItem
                    key={faq.question}
                    value={faq.question}
                    className="rounded-2xl border border-border/60 bg-background/80 px-4"
                  >
                    <AccordionTrigger className="py-4 text-left font-semibold hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border-white/40 bg-white/70 backdrop-blur-xl shadow-md">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="icon-chip">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h2 className="text-2xl font-display font-bold">Meat Lovers Club</h2>
              </div>
              <Accordion type="single" collapsible className="space-y-3">
                {clubFaqs.map((faq) => (
                  <AccordionItem
                    key={faq.question}
                    value={faq.question}
                    className="rounded-2xl border border-border/60 bg-background/80 px-4"
                  >
                    <AccordionTrigger className="py-4 text-left font-semibold hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="container">
          <div className="rounded-[32px] border border-primary/20 bg-primary/10 p-10 text-center">
            <h2 className="text-3xl font-display font-bold">Still have questions?</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Our team usually replies within 24 business hours with practical support and next steps.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
              <Button asChild size="lg">
                <Link to={ROUTES.contact}>Contact us</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={ROUTES.howItWorks}>How it works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Faqs;
