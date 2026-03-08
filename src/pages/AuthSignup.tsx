import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { ROUTES } from "@/lib/routes";
import { signupWithEmail, resendVerification } from "@/lib/api/customer";
import { getErrorMessage } from "@/lib/api/errors";
import { tokenStorage } from "@/lib/auth/tokenStorage";

const AuthSignup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const subscription = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bypassFlow = useMemo(() => searchParams.get("bypass") === "1", [searchParams]);

  const hasCheckoutReadySubscription =
    !!subscription.state.plan &&
    !!subscription.state.frequency &&
    subscription.state.boxItems.length > 0;

  useEffect(() => {
    if (subscription.state.user) {
      navigate(ROUTES.dashboard, { replace: true });
    }
  }, [subscription.state.user, navigate]);

  if (!hasCheckoutReadySubscription && !bypassFlow) {
    return <Navigate to={ROUTES.plans} replace />;
  }

  const passwordsMatch = password === confirmPassword;
  const canSubmit =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length >= 6 &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError("");
    setIsLoading(true);

    try {
      const result = await signupWithEmail({ fullName, email, password, confirmPassword });
      subscription.login({ id: result.user.id, name: result.user.name || fullName, email: result.user.email || email });
      if (result.token) tokenStorage.setCustomerToken(result.token);

      // Show verification notice briefly, then navigate
      setVerificationSent(true);
      setTimeout(() => navigate(bypassFlow ? ROUTES.dashboard : ROUTES.checkout), 2500);
    } catch (error) {
      setError(getErrorMessage(error, "Unable to create account right now. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute -top-20 left-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float-soft" />
      <div className="absolute top-1/3 right-10 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl animate-float-soft" />

      <div className="container relative z-10 py-10 md:py-14">
        <div className="mx-auto w-full max-w-xl">
          <Card className="rounded-[34px] border-white/40 bg-white/80 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.45)] animate-fade-in">
            <CardContent className="p-6 md:p-9">
              {/* <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Subscription flow detected
              </p> */}
              <h1 className="mt-4 text-3xl font-display font-bold">Create your member account</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {bypassFlow
                  ? "Test mode enabled. Create account and continue to dashboard."
                  : "Finish account setup, then continue to checkout to activate membership."}
              </p>

              {verificationSent && (
                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <Mail className="h-4 w-4" />
                    Account created successfully!
                  </div>
                  <p className="text-muted-foreground">
                    Check your email for a verification link. You can continue while we redirect you.
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    disabled={resendLoading}
                    onClick={async () => {
                      setResendLoading(true);
                      setResendMessage("");
                      try {
                        await resendVerification(email);
                        setResendMessage("Verification email resent.");
                      } catch {
                        setResendMessage("Could not resend. Please try again later.");
                      } finally {
                        setResendLoading(false);
                      }
                    }}
                  >
                    {resendLoading ? "Resending..." : "Resend verification email"}
                  </Button>
                  {resendMessage && <p className="text-xs text-muted-foreground">{resendMessage}</p>}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Adebola Okonkwo"
                    className="h-12 rounded-xl bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email Address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 rounded-xl bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="h-12 rounded-xl pr-11 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="h-12 rounded-xl pr-11 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-destructive">Passwords do not match.</p>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20"
                  disabled={!canSubmit || isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to={ROUTES.authSignIn} className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthSignup;
