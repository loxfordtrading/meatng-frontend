import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Beef,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAdmin } from "@/contexts/AdminContext";
import { ROUTES } from "@/lib/routes";
import { loginWithEmail, forgotPassword } from "@/lib/api/customer";
import { getErrorMessage } from "@/lib/api/errors";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import z from "zod";
import { useAuthStore } from "@/store/AuthStore";
import { debounce } from "lodash"
import { axiosClient } from "@/GlobalApi";
import { toast } from "react-toastify";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(2, "Invalid Password"),
})

type LoginFormValues = z.infer<typeof loginSchema>


const benefits = [
  { icon: Beef, text: "Premium cuts selected for your routine" },
  { icon: Truck, text: "Flexible delivery schedule and cut swaps" },
  { icon: ShieldCheck, text: "Full dashboard control for every order" },
  { icon: Sparkles, text: "Club perks and limited drops included" },
];

const trustStats = [
  { label: "Active members", value: "2,400+" },
  { label: "Avg delivery window", value: "48h" },
  { label: "Customer rating", value: "4.9/5" },
];

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof LoginFormValues, boolean>>>({})
  const [form, setForm] = useState<LoginFormValues>({
    email: '',
    password: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate();
  const {userInfo, setUserInfo } = useAuthStore()

  useEffect(() => {
    if (userInfo && userInfo?.access) {
      navigate(ROUTES.home, { replace: true });
    }
  }, [userInfo, navigate]);


  const validation = loginSchema.safeParse(form);

  const canSubmit = validation.success;

  // Debounced validation
  const validateForm = debounce((updatedForm: LoginFormValues) => {
    const result = loginSchema.safeParse(updatedForm)
    if (!result.success) {
      const fieldErrors: typeof errors = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof LoginFormValues
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
    } else {
      setErrors({})
    }
  }, 300)

  useEffect(() => {
    validateForm(form)
    return () => validateForm.cancel()
  }, [form])

  useEffect(() => {
    if (userInfo) { // user just logged in
      const redirectOption = localStorage.getItem("current-page");
      if (redirectOption === "true") {
        localStorage.removeItem("current-page");
        navigate(ROUTES.cartReview, { replace: true });
      } else {
        navigate(ROUTES.home, { replace: true });
      }
    }
  }, [userInfo, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setResendMessage("")
    
    const result = loginSchema.safeParse(form)

    if (!result.success) {
      const fieldErrors: typeof errors = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof LoginFormValues
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      setTouched({
        email: true,
        password: true,
      })
      return
    }

    setErrors({})

      try {

      setIsSubmitting(true)
      
      const response = await axiosClient.post("/auth/login", form)

      setUserInfo({
        access: response.data?.data?.attributes?.token?.accessToken,
        refresh: response.data?.data?.attributes?.token?.refreshToken,
        first_name: response.data?.data?.attributes?.user?.first_name,
        last_name: response.data?.data?.attributes?.user?.last_name,
        userId: response.data?.data?.attributes?.user?.id,
        email: response.data?.data?.attributes?.user?.email
      });

      toast.success("Login Succcessful")
      // const redirectOption = localStorage.getItem("current-page")
      // if(redirectOption === "true"){
      //   localStorage.removeItem("current-page");
      //   navigate(ROUTES.cartReview, { replace: true });
      // }else{
      //   navigate(ROUTES.home)
      // }
      setForm({
        email: '',
        password: ''
      })

    } catch (error: any) {
      setError(error.response?.data?.message)

      if(error.response?.data?.message === "Please verify your email before signing in"){
        try {
          const response = await axiosClient.post("/auth/resend-verification", { email: form.email })

          toast.success("Verification email resent")
          setResendMessage(response.data?.data?.attributes?.message);
        } catch (error: any) {
          setResendMessage(error.response?.data?.message);
        }
        
      }

    } finally {
      setIsSubmitting(false)
    } 
    
  }

  // const ADMIN_DOMAIN = "@loxfordtrading.com";
  // const ADMIN_ROLES = ["admin", "super_admin", "manager"];

  // const isAdminUser = (email: string, role?: string) =>
  //   email.toLowerCase().endsWith(ADMIN_DOMAIN) ||
  //   (!!role && ADMIN_ROLES.includes(role.toLowerCase()));

  // useEffect(() => {
  //   if (subscription.state.user) {
  //     navigate(ROUTES.dashboard, { replace: true });
  //   }
  // }, [subscription.state.user, navigate]);

  // const canSubmit = email.trim().length > 0 && password.trim().length >= 6;

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!canSubmit) return;

  //   setError("");
  //   setIsLoading(true);

  //   try {
  //     const result = await loginWithEmail({ email, password });

  //     if (isAdminUser(result.user.email || email, result.user.role)) {
  //       // Staff account — hand off to admin context and redirect to admin panel
  //       admin.loginWithResult(
  //         { ...result.user, email: result.user.email || email },
  //         result.token,
  //       );
  //       navigate(ROUTES.admin, { replace: true });
  //       return;
  //     }

  //     subscription.login({ id: result.user.id, name: result.user.name, email: result.user.email || email });
  //     if (result.token) tokenStorage.setCustomerToken(result.token);

  //     if (subscription.state.boxItems.length > 0) {
  //       navigate(ROUTES.checkout);
  //       return;
  //     }
  //     navigate(ROUTES.dashboard);
  //   } catch (error) {
  //     setError(getErrorMessage(error, "Unable to sign in right now. Please try again."));
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute -top-20 left-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float-soft" />
      <div className="absolute top-1/3 right-10 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl animate-float-soft" />
      <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-primary/15 blur-3xl animate-float-soft" />

      <div className="container relative z-10 py-8 md:py-12">
        <div className="flex items-center justify-between">
          {/* <Link to={ROUTES.home} className="inline-flex items-center">
            <img src="/Fooding_Meat_Logo.png" alt="MeatNG" className="h-9 w-auto" />
          </Link> */}
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.home}>Back to home</Link>
          </Button>
        </div>

        <div className="mt-6 sm:mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] items-stretch">
          <Card className="order-2 lg:order-1 hidden sm:flex rounded-[34px] border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in">
            <CardContent className="p-5 md:p-7 h-full flex flex-col">
              <div className="relative overflow-hidden rounded-3xl">
                <img
                  src="/meat-people.jpg"
                  alt="MeatNG member showcase"
                  className="h-56 md:h-64 w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/75">Member access</p>
                  <h1 className="mt-2 text-2xl md:text-3xl font-display font-bold text-white leading-tight">
                    Sign in and manage
                    <br />
                    every part of your subscription.
                  </h1>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {benefits.map((benefit) => (
                  <div
                    key={benefit.text}
                    className="rounded-2xl border border-border/60 bg-white/80 px-4 py-3 text-sm"
                  >
                    <span className="inline-flex items-start gap-2">
                      <span className="icon-chip h-8 w-8 rounded-lg">
                        <benefit.icon className="h-4 w-4" />
                      </span>
                      <span className="leading-snug">{benefit.text}</span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {trustStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-primary/15 bg-primary/10 px-3 py-3 text-center"
                  >
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card
            className="order-1 lg:order-2 rounded-[24px] sm:rounded-[34px] border-white/40 bg-white/80 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.45)] animate-fade-in"
            style={{ animationDelay: "90ms" }}
          >
            <CardContent className="p-5 md:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                  Welcome back
                </p>
                <h2 className="mt-2 text-3xl font-display font-bold text-foreground">
                  Sign in to MeatNG
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Access your delivery schedule, plan controls, and order history.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="auth-email">Email Address</Label>
                  <Input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    value={form.email} 
                    onChange={(e: any) => setForm({ ...form, email: e.target.value})} 
                    onBlur={() => setTouched((prev) => ({ ...prev, email: true }))} 
                    placeholder="you@example.com"
                    className="h-12 rounded-xl bg-white"
                  />
                  {touched.email && errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auth-password">Password</Label>
                    <button
                      type="button"
                      onClick={() => { setShowForgotPassword(true); setForgotEmail(email); setForgotMessage(""); setForgotError(""); }}
                      className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={form.password} 
                      onChange={(e: any) => setForm({ ...form, password: e.target.value})} 
                      onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
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
                  {touched.password && errors.password && (
                    <p className="text-xs text-red-500">{errors.password}</p>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                {resendMessage && <p className="text-xs text-muted-foreground">{resendMessage}</p>}

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Not a member yet?{" "}
                <Link
                  to={ROUTES.authSignUp}
                  className="font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Sign Up
                </Link>
              </p>

              {/* <p className="mt-2 text-center text-xs text-muted-foreground/80">
                Membership starts after your first subscription checkout.
              </p> */}

              <p className="mt-6 text-center text-xs text-muted-foreground/70">
                By continuing, you agree to our{" "}
                <span className="underline cursor-pointer">Terms of Service</span> and{" "}
                <span className="underline cursor-pointer">Privacy Policy</span>.
              </p>
            </CardContent>
          </Card>
        </div>
      <ForgotPasswordModal
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        forgotEmail={forgotEmail}
        setForgotEmail={setForgotEmail}
        forgotLoading={forgotLoading}
        setForgotLoading={setForgotLoading}
        forgotMessage={forgotMessage}
        setForgotMessage={setForgotMessage}
        forgotError={forgotError}
        setForgotError={setForgotError}
      />
      </div>
    </div>
  );
};

const ForgotPasswordModal = ({
  open,
  onClose,
  forgotEmail,
  setForgotEmail,
  forgotLoading,
  setForgotLoading,
  forgotMessage,
  setForgotMessage,
  forgotError,
  setForgotError,
}: {
  open: boolean;
  onClose: () => void;
  forgotEmail: string;
  setForgotEmail: (v: string) => void;
  forgotLoading: boolean;
  setForgotLoading: (v: boolean) => void;
  forgotMessage: string;
  setForgotMessage: (v: string) => void;
  forgotError: string;
  setForgotError: (v: string) => void;
}) => {
  if (!open) return null;

    const handleForgotEmail = async (e: FormEvent) => {
      e.preventDefault()

      if(!forgotEmail.trim()) return;

      try {
        setForgotLoading(true)
        setForgotError("");
        setForgotMessage("");
        const response = await axiosClient.post("/auth/forgot-password", { email: forgotEmail})
        console.log("email=",response.data)
        setForgotMessage(response.data?.data?.attributes?.message)
        setForgotEmail("")
      } catch (error) {
        toast.error(error.response?.data?.message)
        setForgotError(error.response?.data?.message)
      } finally {
        setForgotLoading(false)
      }
    }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <Card className="relative z-10 max-w-sm w-full rounded-2xl shadow-2xl animate-fade-in">
        <CardContent className="p-6">
          <h2 className="text-xl font-display font-bold">Reset your password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email and we'll send you a reset link.
          </p>
          <form onSubmit={handleForgotEmail} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 rounded-xl"
              />
            </div>
            {forgotError && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {forgotError}
              </div>
            )}
            {forgotMessage && (
              <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
                {forgotMessage}
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={forgotLoading || !forgotEmail.trim()}>
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
