import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    History,
    MapPin,
    Settings,
    Gift,
    LogOut,
    ChevronRight,
    Calendar,
    Truck,
    CreditCard,
    Edit3,
    Pause,
    Play,
    Plus,
    Trash2,
    Copy,
    Share2,
    Menu,
    X,
    Bell,
    PanelLeft,
    Clock,
    TrendingUp,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useCart } from "@/contexts/CartContext";
import { getPlanById, formatPrice, formatWeight } from "@/data/plans";
import { getProductById } from "@/data/products";
import { ROUTES } from "@/lib/routes";
import { getErrorMessage } from "@/lib/api/errors";
import {
    Address,
    changePassword,
    createAddress,
    deleteAddress,
    getUserById,
    getCurrentUser,
    listAddresses,
    listMyOrders,
    setDefaultAddress,
    updateAddress,
    updateUserById,
    updateCurrentUser,
} from "@/lib/api/customer";
import type { CustomerOrder } from "@/lib/api/customer/orders";
import { tokenStorage } from "@/lib/auth/tokenStorage";

type DashboardSection = "overview" | "subscription" | "orders" | "addresses" | "settings";

interface SidebarItem {
    id: DashboardSection;
    label: string;
    icon: typeof LayoutDashboard;
}

const sidebarItems: SidebarItem[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "subscription", label: "My Subscription", icon: Package },
    { id: "orders", label: "Order History", icon: History },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "settings", label: "Settings", icon: Settings },
    // Temporarily disabled: referrals feature
    // { id: "referrals", label: "Referrals", icon: Gift },
];

// Fallback mock data (shown when API returns nothing)
const mockOrders = [
    { id: "MN-482917", date: "Feb 10, 2026", items: 8, total: 55000, status: "Delivered" as const },
    { id: "MN-381204", date: "Jan 27, 2026", items: 8, total: 55000, status: "Delivered" as const },
    { id: "MN-293847", date: "Jan 13, 2026", items: 10, total: 62000, status: "Delivered" as const },
    { id: "MN-184729", date: "Dec 30, 2025", items: 8, total: 55000, status: "Delivered" as const },
];

const addressTypeOptions = ["shipping", "billing"];

const statusColors: Record<string, string> = {
    Delivered: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
    "In Transit": "bg-blue-500/15 text-blue-700 border-blue-500/20",
    Processing: "bg-amber-500/15 text-amber-700 border-amber-500/20",
};

const Dashboard = () => {
    const [activeSection, setActiveSection] = useState<DashboardSection>("overview");
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [settingsFullName, setSettingsFullName] = useState("");
    const [settingsEmail, setSettingsEmail] = useState("");
    const [settingsPhone, setSettingsPhone] = useState("");
    const [settingsError, setSettingsError] = useState("");
    const [settingsSuccess, setSettingsSuccess] = useState("");
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [addressError, setAddressError] = useState("");
    const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [addressForm, setAddressForm] = useState({
        label: "",
        addressType: "shipping",
        streetAddress: "",
        apartmentSuite: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        isDefault: false,
    });
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [orders, setOrders] = useState<CustomerOrder[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [isUsingMockOrders, setIsUsingMockOrders] = useState(false);
    const subscription = useSubscription();
    const { clearCart } = useCart();
    const navigate = useNavigate();

    const { state } = subscription;
    const user = state.user;

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate(ROUTES.auth, { replace: true });
        }
    }, [user, navigate]);

    useEffect(() => {
        if (!user) return;
        setSettingsFullName(user.name || "");
        setSettingsEmail(user.email || "");
        setSettingsPhone(user.phone || "");
    }, [user]);

    useEffect(() => {
        let cancelled = false;

        const syncProfile = async () => {
            if (!user?.id) return;
            setIsLoadingProfile(true);
            setSettingsError("");
            try {
                const token = tokenStorage.getCustomerToken();
                const profile = await getUserById(user.id, token).catch(() => getCurrentUser(token));
                if (cancelled) return;

                const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() || user.name;
                subscription.login({
                    id: profile.id || user.id,
                    name: fullName,
                    email: profile.email || user.email,
                    phone: profile.phone,
                });
            } catch {
                // Keep local state if profile sync fails.
            } finally {
                if (!cancelled) setIsLoadingProfile(false);
            }
        };

        void syncProfile();
        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    // Fetch real order history
    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        const loadOrders = async () => {
            setIsLoadingOrders(true);
            try {
                const token = tokenStorage.getCustomerToken();
                const result = await listMyOrders(token);
                if (cancelled) return;
                if (result.length > 0) {
                    setOrders(result);
                    setIsUsingMockOrders(false);
                } else {
                    setIsUsingMockOrders(true);
                }
            } catch {
                if (!cancelled) setIsUsingMockOrders(true);
            } finally {
                if (!cancelled) setIsLoadingOrders(false);
            }
        };
        void loadOrders();
        return () => { cancelled = true; };
    }, [user?.id]);

    useEffect(() => {
        let cancelled = false;

        const loadAddresses = async () => {
            if (!user) return;
            setIsLoadingAddresses(true);
            setAddressError("");
            try {
                const result = await listAddresses(tokenStorage.getCustomerToken());
                if (!cancelled) setAddresses(result);
            } catch (error) {
                if (!cancelled) {
                    setAddressError(getErrorMessage(error, "Unable to load addresses right now."));
                }
            } finally {
                if (!cancelled) setIsLoadingAddresses(false);
            }
        };

        void loadAddresses();
        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    if (!user) return null;

    const plan = state.plan ? getPlanById(state.plan) : null;
    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const referralCode = `MEAT-${user.name.split(" ")[0].toUpperCase().slice(0, 4)}${Math.floor(1000 + Math.random() * 9000)}`;

    const handleLogout = () => {
        subscription.logout();
        clearCart();
        navigate(ROUTES.home);
    };

    const resetAddressForm = () => {
        setAddressForm({
            label: "",
            addressType: "shipping",
            streetAddress: "",
            apartmentSuite: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
            isDefault: false,
        });
        setEditingAddressId(null);
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddressId(address.id);
        setAddressForm({
            label: address.label || "",
            addressType: address.addressType || "shipping",
            streetAddress: address.streetAddress || "",
            apartmentSuite: address.apartmentSuite || "",
            city: address.city || "",
            state: address.state || "",
            zipCode: address.zipCode || "",
            country: address.country || "",
            isDefault: !!address.isDefault,
        });
        setIsAddressFormOpen(true);
    };

    const handleSaveAddress = async () => {
        if (!user?.id) {
            setAddressError("Please sign in again to manage addresses.");
            return;
        }

        if (!addressForm.label.trim() || !addressForm.streetAddress.trim() || !addressForm.city.trim()) {
            setAddressError("Label, street address, and city are required.");
            return;
        }

        setIsSavingAddress(true);
        setAddressError("");

        try {
            const payload = {
                label: addressForm.label.trim(),
                addressType: addressForm.addressType,
                streetAddress: addressForm.streetAddress.trim(),
                apartmentSuite: addressForm.apartmentSuite.trim() || undefined,
                city: addressForm.city.trim(),
                state: addressForm.state.trim() || undefined,
                zipCode: addressForm.zipCode.trim() || undefined,
                country: addressForm.country.trim() || undefined,
                isDefault: addressForm.isDefault,
            };

            let saved: Address;
            if (editingAddressId) {
                saved = await updateAddress(editingAddressId, payload, tokenStorage.getCustomerToken());
            } else {
                saved = await createAddress(payload, tokenStorage.getCustomerToken());
            }

            if (addressForm.isDefault && saved.id) {
                try {
                    saved = await setDefaultAddress(saved.id, tokenStorage.getCustomerToken());
                } catch (error) {
                    setAddressError(getErrorMessage(error, "Address saved, but default setting failed."));
                }
            }

            setAddresses((prev) => {
                const next = editingAddressId
                    ? prev.map((item) => (item.id === saved.id ? saved : item))
                    : [saved, ...prev];
                if (saved.isDefault) {
                    return next.map((item) =>
                        item.id === saved.id ? { ...item, isDefault: true } : { ...item, isDefault: false }
                    );
                }
                return next;
            });

            resetAddressForm();
            setIsAddressFormOpen(false);
        } catch (error) {
            setAddressError(getErrorMessage(error, "Unable to save address right now."));
        } finally {
            setIsSavingAddress(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        setAddressError("");
        try {
            await deleteAddress(id, tokenStorage.getCustomerToken());
            setAddresses((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            setAddressError(getErrorMessage(error, "Unable to delete address right now."));
        }
    };

    const handleSetDefault = async (id: string) => {
        setAddressError("");
        try {
            const updated = await setDefaultAddress(id, tokenStorage.getCustomerToken());
            setAddresses((prev) =>
                prev.map((item) =>
                    item.id === updated.id ? { ...item, isDefault: true } : { ...item, isDefault: false }
                )
            );
        } catch (error) {
            setAddressError(getErrorMessage(error, "Unable to set default address right now."));
        }
    };

    const handleChangePassword = async () => {
        setPasswordError("");
        setPasswordSuccess("");

        if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            setPasswordError("All password fields are required.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New password and confirmation do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters.");
            return;
        }

        setIsSavingPassword(true);
        try {
            await changePassword(
                {
                    currentPassword: currentPassword.trim(),
                    newPassword: newPassword.trim(),
                    confirmPassword: confirmPassword.trim(),
                },
                tokenStorage.getCustomerToken(),
            );
            setPasswordSuccess("Password updated successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            setPasswordError(getErrorMessage(error, "Unable to update password right now."));
        } finally {
            setIsSavingPassword(false);
        }
    };

    const handleNavClick = (section: DashboardSection) => {
        setActiveSection(section);
        setIsMobileSidebarOpen(false);
    };

    const handleSaveSettings = async () => {
        if (!user.id) {
            setSettingsError("Unable to update profile right now. Please sign in again.");
            setSettingsSuccess("");
            return;
        }

        const fullName = settingsFullName.trim();
        if (!fullName) {
            setSettingsError("Full name is required.");
            setSettingsSuccess("");
            return;
        }

        const tokens = fullName.split(/\s+/);
        const firstName = tokens[0] || "";
        const lastName = tokens.slice(1).join(" ");

        setIsSavingSettings(true);
        setSettingsError("");
        setSettingsSuccess("");

        try {
            const token = tokenStorage.getCustomerToken();
            const updates = {
                firstName,
                lastName,
                phone: settingsPhone.trim() || undefined,
            };
            const profile = await updateUserById(user.id, updates, token).catch(() =>
                updateCurrentUser(updates, token),
            );

            const updatedFullName =
                [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() || fullName;
            const updatedEmail = profile.email || settingsEmail || user.email;
            subscription.login({
                id: profile.id || user.id,
                name: updatedFullName,
                email: updatedEmail,
                phone: profile.phone || settingsPhone.trim() || undefined,
            });

            setSettingsFullName(updatedFullName);
            setSettingsEmail(updatedEmail);
            setSettingsPhone(profile.phone || settingsPhone.trim());
            setSettingsSuccess("Profile updated successfully.");
        } catch (error) {
            setSettingsError(getErrorMessage(error, "Unable to update profile right now."));
        } finally {
            setIsSavingSettings(false);
        }
    };

    // ─── OVERVIEW SECTION ────────────────────────────────────────
    const renderOverview = () => (
        <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">
            <div>
                <h2 className="text-2xl font-display font-bold text-foreground">
                    Welcome back, {user.name.split(" ")[0]}! 👋
                </h2>
                <p className="text-muted-foreground mt-1">Here's a snapshot of your account.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Active Plan", value: plan?.name || "None", icon: Package, tone: "emerald" },
                    { label: "Total Orders", value: mockOrders.length.toString(), icon: History, tone: "blue" },
                    { label: "Next Delivery", value: "Feb 17", icon: Truck, tone: "amber" },
                    { label: "Member Since", value: "Dec 2025", icon: Calendar, tone: "slate" },
                ].map((stat, index) => (
                    <Card key={stat.label} className="admin-card admin-animate-up" style={{ animationDelay: `${index * 70}ms` }}>
                        <CardContent className="p-4">
                            <div className="admin-stat-icon" data-tone={stat.tone}>
                                <stat.icon />
                            </div>
                            <p className="mt-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                            <p className="text-xl font-bold text-foreground mt-1">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Active Subscription Card */}
            {plan && (
                <Card className="admin-card overflow-hidden border border-primary/20">
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <Badge className="bg-primary/15 text-primary border-primary/20 mb-2">Active Subscription</Badge>
                                <h3 className="text-xl font-bold text-foreground">{plan.name} Plan</h3>
                                <p className="text-muted-foreground text-sm mt-1">
                                    {subscription.currentPlan?.weightKg}kg • {state.frequency} delivery
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-primary">
                                    {formatPrice(state.planPrice)}
                                </p>
                                <p className="text-xs text-muted-foreground">per cycle</p>
                            </div>
                        </div>
                    </div>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Next Billing</p>
                                    <p className="text-sm font-semibold">Feb 17, 2026</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <Truck className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Next Delivery</p>
                                    <p className="text-sm font-semibold">Feb 18–19</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Edit Cutoff</p>
                                    <p className="text-sm font-semibold">Feb 15, 6pm</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button size="sm" onClick={() => handleNavClick("subscription")}>
                                <Edit3 className="mr-2 h-3.5 w-3.5" />
                                Manage Subscription
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => navigate(ROUTES.buildBox)}>
                                Edit Box
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Edit Next Box", description: "Customize your upcoming delivery", action: () => navigate(ROUTES.buildBox), icon: Package },
                    // Temporarily disabled: referrals feature
                    // { label: "Refer a Friend", description: "Earn ₦2,000 credit per referral", action: () => handleNavClick("referrals"), icon: Users },
                    { label: "View Orders", description: "Track past and upcoming orders", action: () => handleNavClick("orders"), icon: History },
                ].map((action) => (
                    <Card
                        key={action.label}
                        className="admin-card cursor-pointer group"
                        onClick={action.action}
                    >
                        <CardContent className="p-5">
                            <action.icon className="h-8 w-8 text-primary mb-3 transition-transform group-hover:scale-110" />
                            <h4 className="font-semibold text-foreground">{action.label}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                            <ChevronRight className="h-4 w-4 text-muted-foreground mt-3 transition-transform group-hover:translate-x-1" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    // ─── SUBSCRIPTION SECTION ────────────────────────────────────
    const renderSubscription = () => (
        <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">
            <div>
                <h2 className="text-2xl font-display font-bold text-foreground">My Subscription</h2>
                <p className="text-muted-foreground mt-1">Manage your plan, size, and delivery preferences.</p>
            </div>

            {plan ? (
                <>
                    <Card className="admin-card">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Current Plan</CardTitle>
                                <Badge variant={isPaused ? "destructive" : "default"}>
                                    {isPaused ? "Paused" : "Active"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="rounded-xl border border-border p-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Plan</p>
                                    <p className="text-lg font-bold mt-1">{plan.name}</p>
                                    <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                                </div>
                                <div className="rounded-xl border border-border p-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Weight</p>
                                    <p className="text-lg font-bold mt-1">{subscription.currentPlan?.weightKg}kg</p>
                                    <p className="text-xs text-muted-foreground">Fixed plan weight</p>
                                </div>
                                <div className="rounded-xl border border-border p-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Frequency</p>
                                    <p className="text-lg font-bold mt-1 capitalize">{state.frequency}</p>
                                    <p className="text-xs text-muted-foreground">{formatPrice(state.planPrice)}/cycle</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.plans)}>
                                    <Edit3 className="mr-2 h-3.5 w-3.5" /> Change Plan
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsPaused(!isPaused)}
                                >
                                    {isPaused ? <Play className="mr-2 h-3.5 w-3.5" /> : <Pause className="mr-2 h-3.5 w-3.5" />}
                                    {isPaused ? "Resume" : "Pause"}
                                </Button>
                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                    Cancel Subscription
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Box Contents */}
                    <Card className="admin-card">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Box Contents</CardTitle>
                                <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.buildBox)}>
                                    <Edit3 className="mr-2 h-3.5 w-3.5" /> Edit Box
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {state.boxItems.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No items in your box yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {state.boxItems.map((item) => {
                                        const product = getProductById(item.productId);
                                        return (
                                            <div key={item.productId} className="flex items-center justify-between rounded-lg border border-border p-3">
                                                <div>
                                                    <p className="font-medium text-sm">{product?.name}</p>
                                                    <p className="text-xs text-muted-foreground">{product?.packSize}</p>
                                                </div>
                                                <Badge variant="secondary">{item.quantity}x</Badge>
                                            </div>
                                        );
                                    })}
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-muted-foreground">Box fill</span>
                                            <span className="font-medium">{formatWeight(subscription.totalWeightG)}/{formatWeight(subscription.state.planWeightG)}</span>
                                        </div>
                                        <Progress value={subscription.state.planWeightG > 0 ? (subscription.totalWeightG / subscription.state.planWeightG) * 100 : 0} className="h-2" />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            ) : (
                <Card className="admin-card">
                    <CardContent className="p-8 text-center">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">No Active Subscription</h3>
                        <p className="text-sm text-muted-foreground mt-2">Start your first subscription to get premium meat delivered.</p>
                        <Button className="mt-4" onClick={() => navigate(ROUTES.plans)}>
                            Choose a Plan <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    // ─── ORDERS SECTION ──────────────────────────────────────────
    const formatOrderStatus = (status: string) => {
        const s = status.toLowerCase().replace(/_/g, " ");
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s === "delivered") return statusColors["Delivered"];
        if (s === "in_transit" || s === "shipped" || s === "in transit") return statusColors["In Transit"];
        if (s === "processing" || s === "paid") return statusColors["Processing"];
        if (s === "cancelled") return "bg-red-500/15 text-red-700 border-red-500/20";
        return "bg-gray-500/15 text-gray-700 border-gray-500/20";
    };

    const displayOrders = isUsingMockOrders
        ? mockOrders.map((o) => ({ id: o.id, date: o.date, items: o.items, total: o.total, status: o.status }))
        : orders.map((o) => ({
            id: o.reference || o.id.slice(-8).toUpperCase(),
            date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }) : "—",
            items: o.itemsCount,
            total: o.totalAmount,
            status: formatOrderStatus(o.status),
        }));

    const renderOrders = () => (
        <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">
            <div>
                <h2 className="text-2xl font-display font-bold text-foreground">Order History</h2>
                <p className="text-muted-foreground mt-1">
                    Track your past and upcoming deliveries.
                    {isUsingMockOrders && <span className="ml-2 text-xs text-amber-600">(demo data)</span>}
                </p>
            </div>

            {isLoadingOrders ? (
                <div className="flex justify-center py-12">
                    <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : displayOrders.length === 0 ? (
                <Card className="admin-card">
                    <CardContent className="py-12 text-center">
                        <Package className="mx-auto h-10 w-10 text-muted-foreground/50" />
                        <p className="mt-3 text-muted-foreground">No orders yet. Start your first subscription!</p>
                        <Button className="mt-4" onClick={() => navigate(ROUTES.plans)}>
                            Browse Plans <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card className="admin-card">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/40">
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Reference</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Date</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Items</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Total</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayOrders.map((order) => (
                                        <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3 font-mono font-medium text-foreground">{order.id}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{order.date}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{order.items} items</td>
                                            <td className="px-4 py-3 font-semibold">{formatPrice(order.total)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    // ─── ADDRESSES SECTION ───────────────────────────────────────
    const renderAddresses = () => (
        <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">Delivery Addresses</h2>
                    <p className="text-muted-foreground mt-1">Manage your saved delivery locations.</p>
                </div>
                <Button size="sm" onClick={() => setIsAddressFormOpen((prev) => !prev)}>
                    <Plus className="mr-2 h-3.5 w-3.5" /> {isAddressFormOpen ? "Close" : "Add Address"}
                </Button>
            </div>

            {isAddressFormOpen && (
                <Card className="admin-card">
                    <CardHeader>
                        <CardTitle>{editingAddressId ? "Edit Address" : "Add Address"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Label</Label>
                                <Input
                                    value={addressForm.label}
                                    onChange={(event) => setAddressForm((prev) => ({ ...prev, label: event.target.value }))}
                                    placeholder="Home"
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Address Type</Label>
                                <div className="flex gap-2">
                                    {addressTypeOptions.map((type) => (
                                        <Button
                                            key={type}
                                            type="button"
                                            variant={addressForm.addressType === type ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setAddressForm((prev) => ({ ...prev, addressType: type }))}
                                        >
                                            {type}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Street Address</Label>
                                <Input
                                    value={addressForm.streetAddress}
                                    onChange={(event) => setAddressForm((prev) => ({ ...prev, streetAddress: event.target.value }))}
                                    placeholder="123 Main St"
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Apartment / Suite</Label>
                                <Input
                                    value={addressForm.apartmentSuite}
                                    onChange={(event) => setAddressForm((prev) => ({ ...prev, apartmentSuite: event.target.value }))}
                                    placeholder="Apt 4B"
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>City</Label>
                                <Input
                                    value={addressForm.city}
                                    onChange={(event) => setAddressForm((prev) => ({ ...prev, city: event.target.value }))}
                                    placeholder="Lagos"
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>State</Label>
                                <Input
                                    value={addressForm.state}
                                    onChange={(event) => setAddressForm((prev) => ({ ...prev, state: event.target.value }))}
                                    placeholder="Lagos"
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Zip Code</Label>
                                <Input
                                    value={addressForm.zipCode}
                                    onChange={(event) => setAddressForm((prev) => ({ ...prev, zipCode: event.target.value }))}
                                    placeholder="100001"
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Country</Label>
                                <Input
                                    value={addressForm.country}
                                    onChange={(event) => setAddressForm((prev) => ({ ...prev, country: event.target.value }))}
                                    placeholder="Ghana"
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    id="address-default"
                                    type="checkbox"
                                    checked={addressForm.isDefault}
                                    onChange={(event) =>
                                        setAddressForm((prev) => ({ ...prev, isDefault: event.target.checked }))
                                    }
                                />
                                <Label htmlFor="address-default">Set as default</Label>
                            </div>
                        </div>
                        {addressError && <p className="text-sm text-destructive">{addressError}</p>}
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" onClick={handleSaveAddress} disabled={isSavingAddress}>
                                {isSavingAddress ? "Saving..." : editingAddressId ? "Update Address" : "Save Address"}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    resetAddressForm();
                                    setIsAddressFormOpen(false);
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isLoadingAddresses && <p className="text-sm text-muted-foreground">Loading addresses...</p>}

            {addressError && !isAddressFormOpen && (
                <p className="text-sm text-destructive">{addressError}</p>
            )}

            {!isLoadingAddresses && addresses.length === 0 && (
                <Card className="admin-card">
                    <CardContent className="p-5 text-sm text-muted-foreground">
                        No addresses yet. Add one to get started.
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                    <Card
                        key={address.id}
                        className={`admin-card relative ${address.isDefault ? "border-primary/30 bg-primary/[0.02]" : ""}`}
                    >
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    <span className="font-semibold">{address.label || "Address"}</span>
                                </div>
                                {address.isDefault && (
                                    <Badge variant="secondary" className="text-xs">Default</Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">{address.streetAddress}</p>
                            {address.apartmentSuite && (
                                <p className="text-sm text-muted-foreground">{address.apartmentSuite}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                {[address.city, address.state, address.zipCode].filter(Boolean).join(", ")}
                            </p>
                            {address.country && (
                                <p className="text-sm text-muted-foreground">{address.country}</p>
                            )}
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditAddress(address)}>
                                    <Edit3 className="mr-1.5 h-3 w-3" /> Edit
                                </Button>
                                {!address.isDefault && (
                                    <Button variant="outline" size="sm" onClick={() => handleSetDefault(address.id)}>
                                        Set Default
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteAddress(address.id)}
                                >
                                    <Trash2 className="mr-1.5 h-3 w-3" /> Remove
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    // ─── SETTINGS SECTION ────────────────────────────────────────
    const renderSettings = () => (
        <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">
            <div>
                <h2 className="text-2xl font-display font-bold text-foreground">Account Settings</h2>
                <p className="text-muted-foreground mt-1">Update your personal information and preferences.</p>
            </div>

            <Card className="admin-card">
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                                value={settingsFullName}
                                onChange={(event) => setSettingsFullName(event.target.value)}
                                className="h-11 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={settingsEmail} type="email" className="h-11 rounded-xl" readOnly />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input
                                value={settingsPhone}
                                onChange={(event) => setSettingsPhone(event.target.value)}
                                placeholder="+234..."
                                className="h-11 rounded-xl"
                            />
                        </div>
                    </div>
                    {settingsError && <p className="text-sm text-destructive">{settingsError}</p>}
                    {settingsSuccess && <p className="text-sm text-emerald-600">{settingsSuccess}</p>}
                    <Button size="sm" onClick={handleSaveSettings} disabled={isSavingSettings || isLoadingProfile}>
                        {isSavingSettings ? "Saving..." : isLoadingProfile ? "Syncing..." : "Save Changes"}
                    </Button>
                </CardContent>
            </Card>

            <Card className="admin-card">
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Current Password</Label>
                            <Input
                                type="password"
                                className="h-11 rounded-xl"
                                value={currentPassword}
                                onChange={(event) => setCurrentPassword(event.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>New Password</Label>
                            <Input
                                type="password"
                                className="h-11 rounded-xl"
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Confirm Password</Label>
                            <Input
                                type="password"
                                className="h-11 rounded-xl"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                            />
                        </div>
                    </div>
                    {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                    {passwordSuccess && <p className="text-sm text-emerald-600">{passwordSuccess}</p>}
                    <Button size="sm" variant="outline" onClick={handleChangePassword} disabled={isSavingPassword}>
                        {isSavingPassword ? "Updating..." : "Update Password"}
                    </Button>
                </CardContent>
            </Card>

        </div>
    );

    // ─── REFERRALS SECTION ───────────────────────────────────────
    const renderReferrals = () => (
        <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">
            <div>
                <h2 className="text-2xl font-display font-bold text-foreground">Referral Program</h2>
                <p className="text-muted-foreground mt-1">Invite friends and earn ₦2,000 credit for every signup.</p>
            </div>

            <Card className="admin-card overflow-hidden border-0">
                <div className="bg-gradient-to-r from-primary via-emerald-600 to-emerald-700 p-6 text-white">
                    <h3 className="text-xl font-bold">Share your code, earn rewards</h3>
                    <p className="text-white/80 text-sm mt-1">
                        When a friend signs up with your code, you both get ₦2,000 credit.
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                        <div className="flex-1 rounded-xl bg-white/15 backdrop-blur-sm px-4 py-3 font-mono font-bold text-lg tracking-wider">
                            {referralCode}
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigator.clipboard?.writeText(referralCode)}
                        >
                            <Copy className="mr-2 h-3.5 w-3.5" /> Copy
                        </Button>
                        <Button variant="secondary" size="sm">
                            <Share2 className="mr-2 h-3.5 w-3.5" /> Share
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Referral Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Total Referrals", value: "3", icon: Users, color: "text-emerald-600" },
                    { label: "Pending", value: "1", icon: Clock, color: "text-amber-600" },
                    { label: "Earned", value: "₦6,000", icon: TrendingUp, color: "text-blue-600" },
                ].map((stat) => (
                    <Card key={stat.label} className="admin-card">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Referral History */}
            <Card className="admin-card">
                <CardHeader>
                    <CardTitle>Referral History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            { name: "Tunde A.", date: "Feb 5, 2026", status: "Confirmed", amount: "₦2,000" },
                            { name: "Bisola K.", date: "Jan 20, 2026", status: "Confirmed", amount: "₦2,000" },
                            { name: "Emeka O.", date: "Jan 8, 2026", status: "Confirmed", amount: "₦2,000" },
                        ].map((ref, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary">
                                        {ref.name.split(" ").map(n => n[0]).join("")}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{ref.name}</p>
                                        <p className="text-xs text-muted-foreground">{ref.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant="secondary" className="text-xs">{ref.status}</Badge>
                                    <p className="text-sm font-semibold text-primary mt-1">{ref.amount}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case "overview": return renderOverview();
            case "subscription": return renderSubscription();
            case "orders": return renderOrders();
            case "addresses": return renderAddresses();
            case "settings": return renderSettings();
            // Temporarily disabled: referrals feature
            // case "referrals": return renderReferrals();
        }
    };

    const SidebarContent = ({
        collapsed = false,
        onToggleDesktop,
    }: {
        collapsed?: boolean;
        onToggleDesktop?: () => void;
    }) => (
        <>
            {onToggleDesktop && (
                <div className="p-3 border-b border-border/60">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleDesktop}
                        className={`w-full ${collapsed ? "justify-center px-2" : "justify-start"}`}
                    >
                        <PanelLeft className="h-4 w-4" />
                        {!collapsed && <span className="ml-2">Collapse Sidebar</span>}
                    </Button>
                </div>
            )}

            <div className="p-4 border-b border-border/60">
                <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
                    <div className="h-10 w-10 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shadow-sm">
                        {initials}
                    </div>
                    <div className={`min-w-0 ${collapsed ? "hidden" : "block"}`}>
                        <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${isActive
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                                } ${collapsed ? "justify-center px-2" : ""}`}
                            title={collapsed ? item.label : undefined}
                        >
                            <span
                                className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${isActive
                                    ? "border-primary-foreground/30 bg-white/15 text-primary-foreground"
                                    : "border-border bg-background text-muted-foreground group-hover:text-foreground"
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                            </span>
                            {!collapsed && item.label}
                            {!collapsed && isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />}
                        </button>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-border/60">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                    title={collapsed ? "Log Out" : undefined}
                >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background">
                        <LogOut className="h-4 w-4" />
                    </span>
                    {!collapsed && "Log Out"}
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile header */}
            <div className="lg:hidden sticky top-16 z-40 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur px-4 py-3 shadow-sm">
                <Button variant="ghost" size="sm" onClick={() => setIsMobileSidebarOpen(true)}>
                    <Menu className="h-5 w-5 mr-2" />
                    Menu
                </Button>
                <span className="text-sm font-semibold capitalize">{activeSection}</span>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
                </Button>
            </div>

            <div className="flex">
                {/* Sidebar - Desktop */}
                <aside className={`hidden lg:block lg:shrink-0 ${isDesktopSidebarCollapsed ? "lg:w-20" : "lg:w-64"}`}>
                    <div className="sticky top-16 h-[calc(100vh-4rem)] flex flex-col bg-background/90 backdrop-blur-xl border-r border-border/60">
                        <SidebarContent
                            collapsed={isDesktopSidebarCollapsed}
                            onToggleDesktop={() => setIsDesktopSidebarCollapsed((prev) => !prev)}
                        />
                    </div>
                </aside>

                {/* Mobile Sidebar Overlay */}
                {isMobileSidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileSidebarOpen(false)} />
                        <div className="absolute left-0 top-0 bottom-0 w-64 bg-background shadow-2xl flex flex-col animate-slide-in-left">
                            <div className="flex items-center justify-end p-3">
                                <button onClick={() => setIsMobileSidebarOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <SidebarContent />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-10">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
