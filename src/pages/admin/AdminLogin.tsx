import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdmin } from "@/contexts/AdminContext";
import z from "zod";
import { toast } from "react-toastify";
import { axiosClient } from "@/GlobalApi";
import { useAuthStore } from "@/store/AuthStore";
import { ROUTES } from "@/lib/routes";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(2, "Invalid Password"),
})

type LoginFormValues = z.infer<typeof loginSchema>

const AdminLogin = () => {

    const setUserInfo = useAuthStore(state => state.setUserInfo)
    const [form, setForm] = useState<LoginFormValues>({
        email: '',
        password: ''
    })
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated, login } = useAdmin();
    const navigate = useNavigate();

    // useEffect(() => {
    //     if (isAuthenticated) navigate("/admin", { replace: true });
    // }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError("")

        const result = loginSchema.safeParse(form)

        if (!result.success) {
            const fieldErrors: any = {}
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof LoginFormValues
                fieldErrors[field] = err.message
            })
            setError(fieldErrors)
            return
        }

        setError("")

        try {

            setIsLoading(true);
        
            const response = await axiosClient.post("/admin/login", form)

            setUserInfo({
                access: response.data?.data?.attributes?.token?.accessToken,
                refresh: response.data?.data?.attributes?.token?.refreshToken,
                first_name: response.data?.data?.relationships?.user?.data?.attributes?.first_name,
                last_name: response.data?.data?.relationships?.user?.data?.attributes?.last_name,
                userId: response.data?.data?.relationships?.user?.data?.id,
                email: response.data?.data?.relationships?.user?.data?.attributes?.email
            });

            toast.success("Login Succcessful")

            setForm({
                email: '',
                password: ''
            })

            navigate(ROUTES.admin);

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
                        src="/Fooding_Meat_Logo.png"
                        alt="MeatNG"
                        className="h-12 w-auto mx-auto mb-4 brightness-[2] contrast-125"
                    />
                    <h1 className="text-2xl font-display font-bold text-secondary-foreground">Admin Panel</h1>
                    <p className="text-secondary-foreground/60 text-sm mt-1">Sign in to access the admin panel</p>
                </div>

                {/* Card */}
                <div className="rounded-2xl bg-secondary-foreground/5 backdrop-blur-xl border border-secondary-foreground/10 p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="admin-email" className="text-secondary-foreground/80">Email</Label>
                            <Input
                                id="admin-email"
                                type="email"
                                value={form.email} 
                                onChange={(e: any) => setForm({ ...form, email: e.target.value})} 
                                placeholder="admin@meatng.com"
                                className="h-11 rounded-xl bg-secondary border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/40 focus:border-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="admin-password" className="text-secondary-foreground/80">Password</Label>
                            <Input
                                id="admin-password"
                                type="password"
                                value={form.password} 
                                onChange={(e: any) => setForm({ ...form, password: e.target.value})} 
                                placeholder="••••••••"
                                className="h-11 rounded-xl bg-secondary border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/40 focus:border-primary"
                            />
                        </div>

                        {error && (
                            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11 rounded-xl font-semibold" disabled={!form.email || !form.password || isLoading}>
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Lock className="h-4 w-4" /> Sign In <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Demo hint */}
                    {/* <div className="mt-6 rounded-xl bg-secondary border border-secondary-foreground/10 p-4">
                        <p className="text-xs text-secondary-foreground/60 font-medium mb-2">Demo Credentials:</p>
                        <div className="space-y-1 text-xs text-secondary-foreground/50">
                            <p><span className="text-secondary-foreground/80">Admin:</span> admin@meatng.com / admin123</p>
                            <p><span className="text-secondary-foreground/80">Manager:</span> manager@meatng.com / manager123</p>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
