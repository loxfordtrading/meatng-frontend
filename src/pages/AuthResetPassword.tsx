import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound, CheckCircle2 } from "lucide-react";
import { z } from "zod";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { ROUTES } from "@/lib/routes";
import { axiosClient } from "@/GlobalApi";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

type Status = "idle" | "loading" | "success" | "error";

const AuthResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState<ResetPasswordForm>({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] =
    useState<Partial<Record<keyof ResetPasswordForm, string>>>({});

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { requestId, token } = useMemo(() => {
    const params = new URLSearchParams(location.search);

    return {
      requestId: params.get("requestId") || params.get("request_id") || "",
      token: params.get("token") || "",
    };
  }, [location.search]);

  const tokenMissing = !requestId || !token;

  const canSubmit = resetPasswordSchema.safeParse(form).success;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validation = resetPasswordSchema.safeParse(form);

    if (!validation.success) {
      const fieldErrors: typeof errors = {};

      validation.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ResetPasswordForm;
        fieldErrors[field] = err.message;
      });

      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    try {
      setStatus("loading");

      await axiosClient.post(`/auth/reset-password?=requestId=${requestId}&token?=${token}`, form);

      setStatus("success");
      setMessage("Password reset successful. Redirecting to login...");

      setTimeout(() => {
        navigate(ROUTES.login, { replace: true });
      }, 2000);

    } catch (err: any) {
      setStatus("error");
      setMessage(
        err?.response?.data?.message ||
          "Unable to reset password. Please request a new reset link."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardContent className="p-8 space-y-6">

          <div className="text-center">
            {status === "success" ? (
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            ) : (
              <KeyRound className="mx-auto h-10 w-10 text-primary" />
            )}

            <h1 className="mt-4 text-2xl font-bold">
              Reset your password
            </h1>

            <p className="text-sm text-muted-foreground">
              Set a new password for your account.
            </p>
          </div>

          {tokenMissing ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              Reset link is invalid or incomplete.
            </div>
          ) : status === "success" ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 text-center">
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Password */}
              <div className="space-y-2">
                <Label>New Password</Label>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Enter new password"
                    className="pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label>Confirm Password</Label>

                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm password"
                    className="pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {status === "error" && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={!canSubmit || status === "loading"}
              >
                {status === "loading"
                  ? "Resetting..."
                  : "Reset Password"}
              </Button>

            </form>
          )}

          <Button variant="outline" asChild className="w-full">
            <Link to={ROUTES.login}>Back to Sign In</Link>
          </Button>

        </CardContent>
      </Card>
    </div>
  );
};

export default AuthResetPassword;