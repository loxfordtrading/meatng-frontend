import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";

const values = [
  "Transparency in sourcing",
  "Premium quality in every cut",
  "A welcoming community for meat lovers",
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-muted/50 py-16">
        <div className="container text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Our Story</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-display font-bold">Meatng, built for honest meals</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Meatng was born from a simple idea: meat should be honest, flavorful, and responsibly sourced. We work
            directly with ethical farms and ranches to bring you protein you can feel good about cooking. More than a
            subscription, we are a community built by people who love great food and great company.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 items-start">
            <div>
              <h2 className="text-3xl font-display font-bold">Core values</h2>
              <p className="mt-3 text-muted-foreground">
                We keep our standards high so every delivery feels like an occasion.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {values.map((value) => (
                  <li key={value} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="border-border/60 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Want to learn more?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore how we partner with responsible farms and producers to deliver premium cuts.
                </p>
                <Button asChild className="w-full">
                  <Link to={ROUTES.sourcing}>Learn About Our Farms</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
