import {
    Package,
    History,
    ChevronRight,
    Calendar,
    Truck,
    Edit3,
    Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/data/plans";
import { ROUTES } from "@/lib/routes";
import { useEffect, useState } from "react";
import { axiosClient } from "@/GlobalApi";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { useAuthStore } from "@/store/AuthStore";
import { LoadingData } from "../LoadingData";
import { getFrequencyWeeksString } from "@/utils/conversion";
import displayCurrency from "@/utils/displayCurrency";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa6";

type OverviewProps = {
  handleNavClick: (tab: string) => void;
};

type statType = {
    active_plan_name: string
    active_plan_status: string
    frequency: number
    total_orders: string
    next_delivery_date: Date
    member_since: Date
    membership?: {
        member_id: string;
        status: string;
        joined_at: Date;
        whatsapp_community_url: string;
    };
    price: number
    weight: string
    weight_unit: string
    next_billing_date: Date
    next_cutoff_at: Date
}

const Overview = ({ handleNavClick }: OverviewProps) => {

    const userInfo = useAuthStore(state => state.userInfo)
    const [stat, setStat] = useState<statType | null>(null)
    const [loading, setLoading] = useState(true)
    const navigate= useNavigate()

    useEffect(() => {
        getStats()
    }, [])

    const getStats = async () => {
        try {
            const res = await axiosClient.get(`/stats/me`);

            const formattedStat = {
                active_plan_name: res.data?.data?.attributes?.summary?.active_plan?.plan_name,
                active_plan_status: res.data?.data?.attributes?.summary?.active_plan?.status,
                frequency: res.data?.data?.attributes?.summary?.active_plan?.frequency,
                price: res.data?.data?.attributes?.summary?.active_plan?.price,
                weight: res.data?.data?.attributes?.summary?.active_plan?.weight,
                weight_unit: res.data?.data?.attributes?.summary?.active_plan?.weight_unit,
                total_orders: res.data?.data?.attributes?.summary?.total_orders,
                next_delivery_date: res.data?.data?.attributes?.summary?.next_delivery_date,
                member_since: res.data?.data?.attributes?.summary?.member_since,
                membership: res.data?.data?.attributes?.summary?.membership,
                next_billing_date: res.data?.data?.attributes?.summary?.next_billing_date,
                next_cutoff_at: res.data?.data?.attributes?.summary?.next_cutoff_at,
            }

            setStat(formattedStat);

        } catch (err: any) {
            toast.error(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

   return (
        <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">
            <div>
                <h2 className="text-2xl font-display font-bold text-foreground">
                    Welcome back, {userInfo?.first_name}! 👋
                </h2>
                <p className="text-muted-foreground mt-1">Here's a snapshot of your account.</p>
            </div>
            {loading ? (
                <LoadingData/>
            ) : (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Active Plan", value: stat?.active_plan_name || "None", icon: Package, tone: "emerald" },
                            { label: "Total Orders", value: stat?.total_orders, icon: History, tone: "blue" },
                            { label: "Next Delivery", value: stat?.next_delivery_date ? format(stat?.next_delivery_date, "MMM dd") : "None", icon: Truck, tone: "amber" },
                            { label: "Member Since", value: stat?.member_since ? format(stat?.member_since, "MMM yyyy") : "None", icon: Calendar, tone: "slate" },
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
                    <Card className="admin-card overflow-hidden border border-primary/20">
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    {stat?.active_plan_status == "active" && (
                                        <Badge className="bg-primary/15 text-primary border-primary/20 mb-2">{stat?.active_plan_status == "active" ? "Active" : "Inactive"} Subscription</Badge>
                                    )}
                                    {stat?.active_plan_name ? <h3 className="text-xl font-bold text-foreground">{stat?.active_plan_name} Plan</h3> : <h3 className="text-xl font-bold text-foreground">No Plan</h3>}
                                    <p className="text-muted-foreground text-sm mt-1">
                                        {stat?.weight}{stat?.weight_unit} • {getFrequencyWeeksString(stat?.frequency)} delivery
                                    </p>
                                </div>
                                {stat?.price && (
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-primary">
                                            {displayCurrency(stat?.price, "NGN")}
                                        </p>
                                        <p className="text-xs text-muted-foreground">per cycle</p>
                                    </div>
                                )}
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
                                        <p className="text-sm font-semibold">{stat?.next_billing_date ? format(stat?.next_billing_date, "MMM dd, yyyy") : "None"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <Truck className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Next Delivery</p>
                                        <p className="text-sm font-semibold">{stat?.next_delivery_date ? format(stat?.next_delivery_date, "MMM dd, yyyy") : "None"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Edit Cutoff</p>
                                        <p className="text-sm font-semibold">{stat?.next_cutoff_at? format(stat?.next_cutoff_at, "MMM dd, yyyy HH:mm a") : "None"}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex flex-wrap gap-2">
                                <Button size="sm" 
                                    onClick={() => handleNavClick("subscription")}
                                >
                                    <Edit3 className="mr-2 h-3.5 w-3.5" />
                                    Manage Subscription
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => navigate(ROUTES.buildBox)}>
                                    Edit Box
                                </Button>
                                {stat?.membership?.whatsapp_community_url && (stat?.membership?.status == "active") && (
                                    <a href={stat?.membership?.whatsapp_community_url}>
                                        <Button
                                            size="sm"
                                            className="shadow-lg shadow-primary/20"
                                        >
                                            <FaWhatsapp className="h-4 w-4" />
                                            Join Our Whatsapp Community
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            // { label: "Edit Next Box", description: "Customize your upcoming delivery", action: () => navigate(ROUTES.buildBox), icon: Package },
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
            )}
        </div>
)}

export default Overview