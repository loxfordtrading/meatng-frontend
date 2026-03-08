import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, MailWarning } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/lib/api/customer";
import { getErrorMessage } from "@/lib/api/errors";
import { ROUTES } from "@/lib/routes";

const AuthVerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  const { requestId, token } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      requestId: params.get("requestId") || params.get("request_id") || "",
      token: params.get("token") || "",
    };
  }, [location.search]);

  useEffect(() => {
    if (!requestId || !token) {
      setStatus("error");
      setError("Verification link is invalid or incomplete.");
      return;
    }

    let mounted = true;
    const run = async () => {
      try {
        await verifyEmail({ requestId, token });
        if (!mounted) return;
        setStatus("success");
        setTimeout(() => navigate(ROUTES.login, { replace: true }), 3000);
      } catch (e) {
        if (!mounted) return;
        setStatus("error");
        setError(getErrorMessage(e, "Unable to verify email. Please request a new verification link."));
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, [requestId, token, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-16">
        <Card className="mx-auto max-w-lg">
          <CardContent className="p-8 text-center">
            {status === "loading" && (
              <>
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                <h1 className="mt-4 text-3xl font-display font-bold">Verifying your email</h1>
                <p className="mt-2 text-muted-foreground">Please wait while we confirm your account.</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
                <h1 className="mt-4 text-3xl font-display font-bold">Email verified</h1>
                <p className="mt-2 text-muted-foreground">Your account is now verified. You can sign in now.</p>
                <div className="mt-6 flex justify-center">
                  <Button asChild>
                    <Link to={ROUTES.login}>Continue to Sign In</Link>
                  </Button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Redirecting automatically in a few seconds...</p>
              </>
            )}

            {status === "error" && (
              <>
                <MailWarning className="mx-auto h-10 w-10 text-destructive" />
                <h1 className="mt-4 text-3xl font-display font-bold">Verification failed</h1>
                <p className="mt-2 text-sm text-destructive">{error}</p>
                <div className="mt-6 flex justify-center">
                  <Button asChild>
                    <Link to={ROUTES.login}>Go to Sign In</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthVerifyEmail;
