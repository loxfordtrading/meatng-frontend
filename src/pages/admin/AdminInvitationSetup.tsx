import { useState, useEffect, FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowRight, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import z from "zod";
import { toast } from "react-toastify";
import { axiosClient } from "@/GlobalApi";
import { ROUTES } from "@/lib/routes";
import { debounce } from "lodash"

const registerSchema = z.object({
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

const AdminInvitationSetup = () => {

    const [form, setForm] = useState<RegisterFormValues>({
        password: '',
        confirmPassword: ''
    })
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormValues, string>>>({})
    const [touched, setTouched] = useState<Partial<Record<keyof RegisterFormValues, boolean>>>({})
    const [ searchParams ] = useSearchParams();
    
    const requestId = searchParams.get("requestId");
    const token = searchParams.get("token");

    useEffect(() => {
        if (!requestId || !token) {
            navigate("/", { replace: true });
        }
    }, [requestId, token, navigate]);

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
        setError("")

        const result = registerSchema.safeParse(form)

        if (!result.success) {
            const fieldErrors: any = {}
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof RegisterFormValues
                fieldErrors[field] = err.message
            })
            setError(fieldErrors)
            return
        }

        setError("")
        setErrors({})

        try {

            setIsLoading(true);
        
            const response = await axiosClient.post(`/auth/accept-invitation?requestId=${requestId}&token=${token}`, form)

            toast.success("Setup Succcessful")

            setForm({
                password: '',
                confirmPassword: ''
            })

            setErrors({})
            setTouched({})

            navigate(ROUTES.adminLogin);

        } catch (error: any) {
            setError(error.response?.data?.message)
        } finally {
            setIsLoading(false);
        } 
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}
            />

            <div className="relative z-10 w-full max-w-md px-6 animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img
                        src="/Meatng_logo.png"
                        alt="MeatNG"
                        className="h-9 w-auto mx-auto mb-4 brightness-[2] contrast-125"
                    />
                    <h1 className="text-2xl font-display font-bold text-secondary-foreground">Admin Panel</h1>
                    <p className="text-secondary-foreground/60 text-sm mt-1">Set up your admin panel Password</p>
                </div>

                {/* Card */}
                <div className="rounded-2xl bg-secondary-foreground/5 backdrop-blur-xl border border-secondary-foreground/10 p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                            <Input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                value={form.password} 
                                onChange={(e: any) => setForm({ ...form, password: e.target.value})} 
                                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                                placeholder="••••••••"
                                className="h-11 rounded-xl bg-secondary border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/40 focus:border-primary"
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
                      placeholder="••••••••"
                      className="h-11 rounded-xl bg-secondary border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/40 focus:border-primary"
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
                            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11 rounded-xl font-semibold" disabled={!form.password || !form.confirmPassword || isLoading}>
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Setting Up...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Lock className="h-4 w-4" /> Submit <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminInvitationSetup
