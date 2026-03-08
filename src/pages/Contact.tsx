import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, PhoneCall, MessageSquare, Clock3, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ROUTES } from "@/lib/routes";

const contactChannels = [
  {
    title: "Email support",
    detail: "foodingmeatng@gmail.com",
    note: "Best for order updates and account issues.",
    icon: Mail,
  },
  {
    title: "Call center",
    detail: "+234 708 644 4603",
    note: "Available Mon-Fri, 8am-6pm.",
    icon: PhoneCall,
  },
  {
    title: "Live chat",
    detail: "In-app support desk",
    note: "Fastest response for active members.",
    icon: MessageSquare,
  },
];

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !email || !message) {
      toast({
        title: "Missing details",
        description: "Please add your name, email, and message.",
      });
      return;
    }

    toast({
      title: "Message sent",
      description: "Thanks for reaching out. We will reply soon.",
    });

    setName("");
    setEmail("");
    setOrder("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(33,130,37,0.14),_transparent_56%)] py-12 sm:py-20">
        <div className="absolute -top-20 left-14 h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-float-soft" />
        <div className="absolute bottom-0 right-8 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl animate-float-soft" />

        <div className="container relative z-10 grid gap-8 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="animate-fade-in">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Contact</p>
            <h1 className="mt-4 text-4xl md:text-6xl font-display font-bold leading-tight">Real support from a real team.</h1>
            <p className="mt-5 text-lg text-foreground/80 max-w-xl">
              Questions about your box, payment, or delivery? Reach out and we will get you sorted quickly.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm font-medium backdrop-blur-xl">
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary" />
                  24h average response
                </span>
              </div>
              <div className="rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm font-medium backdrop-blur-xl">
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Priority for active members
                </span>
              </div>
            </div>
          </div>

          <Card
            className="hidden sm:block rounded-[32px] border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.5)] animate-fade-in"
            style={{ animationDelay: "120ms" }}
          >
            <CardContent className="p-5">
              <img
                src="/46.jpg"
                alt="Customer support visual"
                className="h-64 w-full rounded-3xl object-cover"
                loading="lazy"
              />
              <div className="mt-4 rounded-2xl bg-white p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Support hours</p>
                <p className="mt-2 text-base font-semibold">Mon - Fri, 8am - 6pm WAT</p>
                <p className="text-sm text-muted-foreground">Weekend messages are handled the next business day.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-4">
          {contactChannels.map((channel) => (
            <Card
              key={channel.title}
              className="rounded-[26px] border-white/40 bg-white/70 backdrop-blur-xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <CardContent className="p-5">
                <span className="icon-chip">
                  <channel.icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-lg font-semibold">{channel.title}</h2>
                <p className="mt-1 text-sm font-medium text-primary">{channel.detail}</p>
                <p className="mt-1 text-sm text-muted-foreground">{channel.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="container grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          <Card className="rounded-[32px] border-white/40 bg-white/70 backdrop-blur-xl shadow-lg">
            <CardContent className="p-7">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">Send us a message</p>
                <h2 className="mt-2 text-3xl font-display font-bold">Tell us what you need</h2>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="rounded-xl bg-background/80"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="rounded-xl bg-background/80"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Order # (optional)</Label>
                  <Input
                    id="order"
                    value={order}
                    onChange={(event) => setOrder(event.target.value)}
                    className="rounded-xl bg-background/80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="rounded-2xl bg-background/80"
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl">
                  Send message
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="rounded-[28px] border-white/40 bg-white/70 backdrop-blur-xl shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <span className="icon-chip">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">Visit our operations hub</h3>
                    <p className="text-sm text-muted-foreground">Lagos, Nigeria</p>
                    <p className="text-sm text-muted-foreground">By appointment for partner and B2B requests.</p>
                  </div>
                </div>
                {/* <img
                  src="/generated/contact-hub.svg"
                  alt="Meatng operations visual"
                  className="mt-4 h-36 w-full rounded-2xl object-cover"
                  loading="lazy"
                /> */}
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-primary/20 bg-primary/10 shadow-md">
              <CardContent className="p-5">
                <h3 className="text-lg font-semibold">Need answers right now?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start with our FAQ page for common questions on delivery, billing, and sourcing.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <Button asChild variant="outline">
                    <Link to={ROUTES.faqs}>Go to FAQs</Link>
                  </Button>
                  <Button asChild>
                    <Link to={ROUTES.plans}>Explore plans</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
