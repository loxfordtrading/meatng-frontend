import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, MailWarning } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { axiosClient } from "@/GlobalApi";

type Status = "loading" | "success" | "error";

const AuthVerifyEmail = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>("loading");
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
      setError("Invalid verification link.");
      return;
    }

    const verify = async () => {
      try {
        await axiosClient.post("/auth/verify-email", {
          requestId,
          token,
        });

        setStatus("success");

        setTimeout(() => {
          navigate(ROUTES.login, { replace: true });
        }, 3000);

      } catch (err: any) {
        setStatus("error");
        setError(
          err?.response?.data?.message ||
          "Unable to verify your email. Please request a new verification link."
        );
      }
    };

    verify();
  }, [requestId, token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardContent className="p-8 text-center space-y-4">

          {/* Loading */}
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />

              <h1 className="text-2xl font-bold">
                Verifying your email
              </h1>

              <p className="text-sm text-muted-foreground">
                Please wait while we confirm your account.
              </p>
            </>
          )}

          {/* Success */}
          {status === "success" && (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />

              <h1 className="text-2xl font-bold">
                Email Verified 🎉
              </h1>

              <p className="text-sm text-muted-foreground">
                Your account has been verified successfully.
              </p>

              <Button asChild className="w-full mt-4">
                <Link to={ROUTES.login}>
                  Continue to Sign In
                </Link>
              </Button>

              <p className="text-xs text-muted-foreground">
                Redirecting automatically...
              </p>
            </>
          )}

          {/* Error */}
          {status === "error" && (
            <>
              <MailWarning className="mx-auto h-12 w-12 text-destructive" />

              <h1 className="text-2xl font-bold">
                Verification Failed
              </h1>

              <p className="text-sm text-destructive">
                {error}
              </p>

              <Button asChild className="w-full mt-4">
                <Link to={ROUTES.login}>
                  Go to Sign In
                </Link>
              </Button>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default AuthVerifyEmail;