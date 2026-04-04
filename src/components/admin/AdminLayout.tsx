import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Package,
    Repeat,
    MapPin,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronRight,
    PanelLeft,
    Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/contexts/AdminContext";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/AuthStore";

interface SidebarLink {
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
}

const sidebarLinks: SidebarLink[] = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/subscriptions", label: "Subscriptions", icon: Repeat },
    { href: "/admin/deliveries", label: "Deliveries", icon: MapPin },
    { href: "/admin/plans", label: "Plans", icon: Repeat },
    { href: "/admin/gifts", label: "GiftBoxes", icon: Gift },
    { href: "/admin/contacts", label: "Contacts", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
    const { admin, logout } = useAdmin();
    const navigate = useNavigate();
    const location = useLocation();
    const userInfo = useAuthStore(state => state.userInfo)

    // const initials = admin?.name
    //     .split(" ")
    //     .map((n) => n[0])
    //     .join("")
    //     .toUpperCase()
    //     .slice(0, 2) || "AD";

    const handleLogout = () => {
        logout();
        navigate("/admin/login");
    };

    const isActive = (href: string) =>
        href === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(href);

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
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}
                    >
                        <PanelLeft className="h-4 w-4" />
                        {!collapsed && <span className="ml-2">Collapse Sidebar</span>}
                    </Button>
                </div>
            )}

            {/* Brand */}
            <div className="p-5 border-b border-border/60">
                <Link to="/admin" className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
                    <img
                        src="/Meatng_logo.png"
                        alt="MeatNG"
                        className="h-4 w-auto"
                    />
                    <div className={cn("border-l border-border pl-3", collapsed && "hidden")}>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Admin</p>
                    </div>
                </Link>
            </div>

            {/* User */}
            <div className="p-4 border-b border-border/60">
                <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
                    <div className="h-10 w-10 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shadow-sm">
                        {userInfo?.first_name[0]}{userInfo?.last_name[0]}
                    </div>
                    <div className={cn("min-w-0", collapsed && "hidden")}>
                        <p className="text-sm font-semibold text-foreground truncate">{userInfo?.first_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">Admin</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {sidebarLinks.map((link) => (
                    <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                            isActive(link.href)
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                            collapsed && "justify-center px-2",
                        )}
                        title={collapsed ? link.label : undefined}
                    >
                        <span
                            className={cn(
                                "inline-flex h-7 w-7 items-center justify-center rounded-lg border transition-colors",
                                isActive(link.href)
                                    ? "border-primary-foreground/30 bg-white/15 text-primary-foreground"
                                    : "border-border bg-background text-muted-foreground group-hover:text-foreground",
                            )}
                        >
                            <link.icon className="h-4 w-4" />
                        </span>
                        {!collapsed && link.label}
                        {!collapsed && isActive(link.href) && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />}
                    </Link>
                ))}
            </nav>

            {/* Logout */}
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
        <div className="min-h-screen admin-page-bg">
            {/* Top bar (mobile) */}
            <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur px-4 py-3 shadow-sm">
                <Button variant="ghost" size="sm" onClick={() => setMobileOpen(true)}>
                    <Menu className="h-5 w-5 mr-2" /> Menu
                </Button>
                <div className="flex items-center gap-2">
                    <img src="/Meatng_logo.png" alt="MeatNG" className="h-4 w-auto" />
                    <span className="text-sm font-bold">Admin</span>
                </div>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
                </Button>
            </div>

            <div className="flex">
                {/* Desktop Sidebar */}
                <aside className={cn("hidden lg:block lg:shrink-0", isDesktopSidebarCollapsed ? "lg:w-20" : "lg:w-64")}>
                    <div className="sticky top-0 h-screen flex flex-col bg-background/90 backdrop-blur-xl border-r border-border/60">
                        <SidebarContent
                            collapsed={isDesktopSidebarCollapsed}
                            onToggleDesktop={() => setIsDesktopSidebarCollapsed((prev) => !prev)}
                        />
                    </div>
                </aside>

                {/* Mobile Sidebar Overlay */}
                {mobileOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
                        <div className="absolute left-0 top-0 bottom-0 w-64 bg-background shadow-2xl flex flex-col animate-slide-in-left">
                            <div className="flex items-center justify-end p-3">
                                <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <SidebarContent />
                        </div>
                    </div>
                )}

                {/* Main */}
                <main className="flex-1 min-w-0">
                    <div className="p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
