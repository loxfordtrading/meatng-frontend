import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { acceptInvitation } from "@/lib/api/customer";
import { getErrorMessage } from "@/lib/api/errors";
import { ROUTES } from "@/lib/routes";

const AuthAcceptInvitation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const { requestId, token } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      requestId: params.get("requestId") || params.get("request_id") || "",
      token: params.get("token") || "",
    };
  }, [location.search]);

  const tokenMissing = !requestId || !token;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (tokenMissing || loading) return;

    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await acceptInvitation({ requestId, token, password, confirmPassword });
      setSuccess("Invitation accepted. Redirecting to sign in...");
      setTimeout(() => navigate(ROUTES.login, { replace: true }), 1500);
    } catch (e) {
      setError(getErrorMessage(e, "Unable to accept invitation. Please contact support."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-16">
        <Card className="mx-auto max-w-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <UserPlus className="mx-auto h-10 w-10 text-primary" />
              <h1 className="mt-4 text-3xl font-display font-bold">Welcome to MEATNG</h1>
              <p className="mt-2 text-sm text-muted-foreground">Set your password to accept your invitation.</p>
            </div>

            {tokenMissing ? (
              <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                Invitation link is invalid or incomplete.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="invite-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-confirm-password">Confirm password</Label>
                  <div className="relative">
                    <Input
                      id="invite-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
                    {success}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : "Accept Invitation"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Button variant="outline" asChild>
                <Link to={ROUTES.login}>Back to Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthAcceptInvitation;
