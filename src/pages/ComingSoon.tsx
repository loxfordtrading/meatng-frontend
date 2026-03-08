import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

interface ComingSoonProps {
  title: string;
}

const ComingSoon = ({ title }: ComingSoonProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">In progress</p>
          <h1 className="mt-3 text-4xl font-display font-bold text-foreground">{title}</h1>
          <p className="mt-4 text-muted-foreground">
            This page is being built as part of the PRD rollout. Continue through plans to start a subscription.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to={ROUTES.plans}>
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to={ROUTES.home}>Back Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
