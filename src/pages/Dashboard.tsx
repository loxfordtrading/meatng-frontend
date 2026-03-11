import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    History,
    MapPin,
    Settings as SettingIcon,
    LogOut,
    ChevronRight,
    Calendar,
    Truck,
    Edit3,
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
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useCart } from "@/contexts/CartContext";
import { getPlanById, formatPrice } from "@/data/plans";
import { ROUTES } from "@/lib/routes";
import { getErrorMessage } from "@/lib/api/errors";
import {
    Address,
    getUserById,
    getCurrentUser,
    listAddresses,
    listMyOrders,
} from "@/lib/api/customer";
import type { CustomerOrder } from "@/lib/api/customer/orders";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import Subscription from "@/components/dashboard/Subscription";
import OrderHistory from "@/components/dashboard/OrderHistory";
import Settings from "@/components/dashboard/Settings";
import Addresses from "@/components/dashboard/Addresses";
import Overview from "@/components/dashboard/Overview";

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
    { id: "settings", label: "Settings", icon: SettingIcon },
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
    const [settingsError, setSettingsError] = useState("");
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [addressError, setAddressError] = useState("");
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
    const [orders, setOrders] = useState<CustomerOrder[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [isUsingMockOrders, setIsUsingMockOrders] = useState(false);
    const subscription = useSubscription();
    const { clearCart } = useCart();
    const navigate = useNavigate();

    const { state } = subscription;
    const user = state.user;

    // useEffect(() => {
    //     if (!user) return;
    //     setSettingsFullName(user.name || "");
    //     setSettingsEmail(user.email || "");
    //     setSettingsPhone(user.phone || "");
    // }, [user]);

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

                // const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() || user.name;
                subscription.login({
                    id: profile.id || user.id,
                    name: "",
                    email: profile.email,
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

    const plan = state.plan ? getPlanById(state.plan) : null;

    // const referralCode = `MEAT-${user.name.split(" ")[0].toUpperCase().slice(0, 4)}${Math.floor(1000 + Math.random() * 9000)}`;

    const handleLogout = () => {
        subscription.logout();
        clearCart();
        navigate(ROUTES.home);
    };


    const handleNavClick = (section: DashboardSection) => {
        setActiveSection(section);
        setIsMobileSidebarOpen(false);
    };

    // ─── OVERVIEW SECTION ────────────────────────────────────────

    // ─── SUBSCRIPTION SECTION ────────────────────────────────────
   

    // ─── ORDERS SECTION ──────────────────────────────────────────
    const formatOrderStatus = (status: string) => {
        const s = status.toLowerCase().replace(/_/g, " ");
        return s.charAt(0).toUpperCase() + s.slice(1);
    };
    

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
                            {/* {referralCode} */}
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            // onClick={() => navigator.clipboard?.writeText(referralCode)}
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
            case "overview": return <Overview/>;
            case "subscription": return <Subscription/>
            case "orders": return <OrderHistory/>
            case "addresses": return <Addresses/>
            case "settings": return <Settings/>
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
                        {/* {initials} */}
                    </div>
                    <div className={`min-w-0 ${collapsed ? "hidden" : "block"}`}>
                        {/* <p className="text-sm font-semibold text-foreground truncate">{user.name}</p> */}
                        {/* <p className="text-xs text-muted-foreground truncate">{user.email}</p> */}
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
