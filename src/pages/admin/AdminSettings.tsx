import { useState } from "react";
import { Save, Plus, Shield, Clock, Bell, Building2, Truck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAdmin } from "@/contexts/AdminContext";

type SettingsTab = "business" | "delivery" | "notifications" | "admins";

const AdminSettings = () => {
    const [tab, setTab] = useState<SettingsTab>("business");
    const { admin } = useAdmin();
    const [adminUsers, setAdminUsers] = useState([]);

    const tabs: { id: SettingsTab; label: string; icon: typeof Building2 }[] = [
        { id: "business", label: "Business", icon: Building2 },
        { id: "delivery", label: "Delivery", icon: Truck },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "admins", label: "Admin Users", icon: Users },
    ];

    const mockAdminUsers = [
        { name: "Bamidele Tewogbade", email: "admin@meatng.com", role: "Super Admin", status: "Active" },
        { name: "Chioma Eze", email: "manager@meatng.com", role: "Manager", status: "Active" },
        { name: "David Okafor", email: "david@meatng.com", role: "Admin", status: "Invited" },
    ];

    const notificationTypes = [
        { id: "new_order", label: "New Order Placed", description: "When a customer places a new order", enabled: true },
        { id: "subscription_cancel", label: "Subscription Cancelled", description: "When a customer cancels their subscription", enabled: true },
        { id: "low_stock", label: "Low Stock Alert", description: "When product stock falls below threshold", enabled: false },
        { id: "new_customer", label: "New Customer Signup", description: "When a new customer creates an account", enabled: true },
        { id: "delivery_issue", label: "Delivery Issues", description: "When a delivery encounters problems", enabled: true },
    ];

    const [notifications, setNotifications] = useState(notificationTypes);

    const toggleNotification = (id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)));
    };

    return (
        <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">
            <div>
                <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground text-sm mt-1">Configure your business and admin preferences.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted/60 rounded-xl p-1 overflow-x-auto">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <t.icon className="h-4 w-4" /> {t.label}
                    </button>
                ))}
            </div>

            {/* Business */}
            {tab === "business" && (
                <Card className="admin-card admin-animate-up" style={{ animationDelay: "120ms" }}>
                    <CardHeader>
                        <CardTitle className="text-base">Business Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 max-w-xl">
                        <div className="space-y-2">
                            <Label>Business Name</Label>
                            <Input defaultValue="MeatNG" className="h-10 rounded-xl" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Contact Email</Label>
                                <Input defaultValue="foodingmeatng@gmail.com" className="h-10 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label>Contact Phone</Label>
                                <Input defaultValue="+234 708 644 4603" className="h-10 rounded-xl" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Business Address</Label>
                            <Input defaultValue="25 Admiralty Way, Lekki Phase 1, Lagos" className="h-10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label>Website</Label>
                            <Input defaultValue="https://meatng.com" className="h-10 rounded-xl" />
                        </div>
                        <Button size="sm">
                            <Save className="mr-2 h-3.5 w-3.5" /> Save Changes
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Delivery */}
            {tab === "delivery" && (
                <Card className="admin-card admin-animate-up" style={{ animationDelay: "120ms" }}>
                    <CardHeader>
                        <CardTitle className="text-base">Delivery Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 max-w-xl">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Order Cutoff Time</Label>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <Input defaultValue="Wednesday 12:00pm" className="h-10 rounded-xl" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Delivery Window</Label>
                                <Input defaultValue="Friday - Saturday" className="h-10 rounded-xl" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Default Delivery Fee</Label>
                                <Input defaultValue="2500" className="h-10 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label>Free Delivery Threshold</Label>
                                <Input defaultValue="50000" className="h-10 rounded-xl" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Delivery Instructions (default)</Label>
                            <textarea
                                defaultValue="Please ensure someone is available to receive the package. Deliveries require a signature."
                                rows={3}
                                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none"
                            />
                        </div>
                        <Button size="sm">
                            <Save className="mr-2 h-3.5 w-3.5" /> Save Changes
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Notifications */}
            {tab === "notifications" && (
                <Card className="admin-card admin-animate-up" style={{ animationDelay: "120ms" }}>
                    <CardHeader>
                        <CardTitle className="text-base">Notification Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y divide-border">
                        {notifications.map((n) => (
                            <div key={n.id} className="flex items-center justify-between py-4">
                                <div>
                                    <p className="text-sm font-medium">{n.label}</p>
                                    <p className="text-xs text-muted-foreground">{n.description}</p>
                                </div>
                                <button
                                    onClick={() => toggleNotification(n.id)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${n.enabled ? "bg-primary" : "bg-muted"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${n.enabled ? "translate-x-6" : "translate-x-1"
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Admin Users */}
            {tab === "admins" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{mockAdminUsers.length} admin users</p>
                        <Button size="sm">
                            <Plus className="mr-2 h-3.5 w-3.5" /> Invite Admin
                        </Button>
                    </div>
                    <Card className="admin-card admin-animate-up" style={{ animationDelay: "120ms" }}>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {mockAdminUsers.map((user) => (
                                    <div key={user.email} className="flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary">
                                                {user.name.split(" ").map((n) => n[0]).join("")}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <Shield className="h-3 w-3" /> {user.role}
                                            </Badge>
                                            <Badge variant={user.status === "Active" ? "default" : "outline"}>
                                                {user.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminSettings;
