import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { ROUTES } from "@/lib/routes";
import { signupWithEmail, resendVerification } from "@/lib/api/customer";
import z from "zod";
import { toast } from "react-toastify"
import { debounce } from "lodash"
import { axiosClient } from "@/GlobalApi";

const registerSchema = z.object({
  first_name: z.string().min(1, "first name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z
    .string()
    .regex(/^\d+$/, "Phone number must contain only digits")
    .refine((val) => {
      if (val.startsWith("0")) return val.length === 11;
      return val.length === 10;
    }, {
      message: "Phone number must be 11 digits if it starts with 0, otherwise 10 digits",
    })
    .transform((val) => (val.startsWith("0") ? val.slice(1) : val)),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>

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
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormValues, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterFormValues, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const subscription = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bypassFlow = useMemo(() => searchParams.get("bypass") === "1", [searchParams]);

  // useEffect(() => {
  //   if (subscription.state.user) {
  //     navigate(ROUTES.dashboard, { replace: true });
  //   }
  // }, [subscription.state.user, navigate]);

  // if (!hasCheckoutReadySubscription && !bypassFlow) {
  //   return <Navigate to={ROUTES.plans} replace />;
  // }

  const validation = registerSchema.safeParse(form);

  const canSubmit = validation.success;

  // Debounced validation
  const validateForm = debounce((updatedForm: RegisterFormValues) => {
    const result = registerSchema.safeParse(updatedForm)
    if (!result.success) {
      const fieldErrors: typeof errors = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof RegisterFormValues
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const result = registerSchema.safeParse(form)

    if (!result.success) {
      const fieldErrors: typeof errors = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof RegisterFormValues
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      setTouched({
        first_name: true,
        last_name: true,
        email: true,
        password: true,
        confirmPassword: true
      })
      return
    }

    setErrors({})
    
    try {

      setIsSubmitting(true)
      
      const { first_name, last_name, ...rest } = form;

      const newForm = {
        ...rest,
        firstName: first_name,
        lastName: last_name,
      };

      const result = await axiosClient.post("/auth/signup", newForm)
      toast.success(result.data?.data?.attributes?.message);

      setEmail(result.data?.data?.attributes?.data?.user?.email)
      setForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      })

      setErrors({})
      setTouched({})

      setVerificationSent(true)

    } catch (error: any) {
      toast.error(error.response?.data?.message);

      if(error.response.data.message === "User already exists"){
        navigate("/login")
      }

    } finally {
      setIsSubmitting(false)
    } 
  }

  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setResendLoading(true)
      setResendMessage("")
      const result = await axiosClient.post("/auth/resend-verification", {
        email: email
      })
      setResendMessage("Verification email resent.");
    } catch (error){
      toast.error(error.response?.data?.message);
      setResendMessage(error.response?.data?.message || "Could not resend. Please try again later.");
    } finally {
      setResendLoading(false)
    }

  }


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
                    onClick={handleResendEmail}
                  >
                    {resendLoading ? "Resending..." : "Resend verification email"}
                  </Button>
                  {resendMessage && <p className="text-xs text-muted-foreground">{resendMessage}</p>}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">First Name</Label>
                    <Input
                      id="signup-firstname"
                      value={form.first_name} 
                      onChange={(e: any) => setForm({ ...form, first_name: e.target.value})} 
                      onBlur={() => setTouched((prev) => ({ ...prev, first_name: true }))}
                      placeholder="Adebola"
                      className="h-12 rounded-xl bg-white w-full"
                    />
                    {touched.first_name && errors.first_name && (
                      <p className="text-xs text-destructive">{errors.first_name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-lastname">Last Name</Label>
                    <Input
                      id="signup-lastname"
                      value={form.last_name} 
                      onChange={(e: any) => setForm({ ...form, last_name: e.target.value})} 
                      onBlur={() => setTouched((prev) => ({ ...prev, last_name: true }))}
                      placeholder="Okonkwo"
                      className="h-12 rounded-xl bg-white w-full"
                    />
                    {touched.last_name && errors.last_name && (
                      <p className="text-xs text-destructive">{errors.last_name}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email Address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={form.email} 
                    onChange={(e: any) => setForm({ ...form, email: e.target.value})} 
                    onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                    placeholder="you@example.com"
                    className="h-12 rounded-xl bg-white"
                  />
                  {touched.email && errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone No</Label>
                  <Input
                    id="phone"
                    type="number"
                    value={form.phone} 
                    onChange={(e: any) => setForm({ ...form, phone: e.target.value})} 
                    onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                    placeholder="E.g 08123456789"
                    className="h-12 rounded-xl bg-white appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  {touched.phone && errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
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
                    <p className="text-xs text-destructive">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword} 
                      onChange={(e: any) => setForm({ ...form, confirmPassword: e.target.value})} 
                      onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
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
                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword}</p>
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
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? (
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
