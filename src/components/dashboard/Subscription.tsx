import {
    Package,
    ChevronRight,
    Edit3,
    Pause,
    Play,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {  formatPrice, formatWeight } from "@/data/plans";
import { getProductById } from "@/data/products";
import { ROUTES } from "@/lib/routes";
import { axiosClient } from "@/GlobalApi";
import { useAuthStore } from "@/store/AuthStore";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FormattedSubscriptionType } from "@/types/types";
import { getFrequencyWeeksString } from "@/utils/conversion";
import { useNavigate } from "react-router-dom";
import displayCurrency from "@/utils/displayCurrency";

const Subscription = () => {

    const navigate = useNavigate()
    const userInfo = useAuthStore(state => state.userInfo)
    const [subscriptions, setSubscriptions] = useState<FormattedSubscriptionType[]>([]);
    const [loading, setLoading] = useState(true)
    const [isCancelling, setIsCancelling] = useState(false)
    const [isPausing, setIsPausing] = useState(false)
    const [isResuming, setIsResuming] = useState(false)

    const currentSubscription = subscriptions[0] || null;

    useEffect(() => {
        getSubscriptions()
    }, [])

    const getSubscriptions = async () => {
        try {
            const res = await axiosClient.get(`/subscriptions/by-user/${userInfo.userId}`);

            const subs = res.data.data || [];

            const formattedSubscriptions: FormattedSubscriptionType[] = subs.map((sub: any) => ({
                id: sub.id,
                userId: sub.attributes.user_id,
                planId: sub.attributes.plan_id,
                status: sub.attributes.status,
                frequency: sub.attributes.frequency,
                startDate: sub.attributes.start_date,
                nextDeliveryDate: sub.attributes.next_delivery_date,
                nextBillingAt: sub.attributes.next_billing_at,
                autoDebitEnabled: sub.attributes.auto_debit_enabled,
                lockedForBilling: sub.attributes.locked_for_billing,
                nextCutoffAt: sub.attributes.next_cutoff_at,
                items: sub.attributes.items,
                plan: {
                    id: sub.relationships?.planDetails?.data?.id,
                    name: sub.relationships?.planDetails?.data?.attributes?.name,
                    description: sub.relationships?.planDetails?.data?.attributes?.description,
                    price: sub.relationships?.planDetails?.data?.attributes?.price,
                    weight: sub.relationships?.planDetails?.data?.attributes?.weight,
                    weight_unit: sub.relationships?.planDetails?.data?.attributes?.weight_unit,
                    is_active: sub.relationships?.planDetails?.data?.attributes?.is_active,
                },
            }));

            setSubscriptions(formattedSubscriptions);

        } catch (err: any) {
            toast.error(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const cancelSubscription = async (subscriptionId: string) => {
        try {
            setIsCancelling(true)
            const res = await axiosClient.patch(`/subscriptions/${subscriptionId}/cancel`);
            getSubscriptions()
            toast.success("Subscription cancelled");
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setIsCancelling(false)
        }
    }

    const pauseSubscription = async (subscriptionId: string) => {
        try {
            setIsPausing(true)
            const res = await axiosClient.patch(`/subscriptions/${subscriptionId}/pause`);
            getSubscriptions()
            toast.success("Subscription paused");
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setIsPausing(false)
        }
    }

     const resumeSubscription = async (subscriptionId: string) => {
        try {
            setIsResuming(true)
            const res = await axiosClient.patch(`/subscriptions/${subscriptionId}/resume`);
            getSubscriptions()
            toast.success("Subscription resumed");
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setIsResuming(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 admin-page-bg rounded-3xl">
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">
            <div>
                <h2 className="text-2xl font-display font-bold text-foreground">My Subscription</h2>
                <p className="text-muted-foreground mt-1">Manage your plan, size, and delivery preferences.</p>
            </div>

            {subscriptions?.length > 0 ? (
                <>
                    <Card className="admin-card">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Current Plan</CardTitle>
                                <Badge variant={currentSubscription?.status === 'paused' ? "destructive" : "default"}>
                                    {currentSubscription?.status === 'paused'? "Paused" : "Active"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="rounded-xl border border-border p-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Plan</p>
                                    <p className="text-lg font-bold mt-1">{currentSubscription?.plan?.name}</p>
                                    {/* <p className="text-xs text-muted-foreground">{plan.tagline}</p> */}
                                </div>
                                <div className="rounded-xl border border-border p-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Weight</p>
                                    <p className="text-lg font-bold mt-1">{currentSubscription?.plan?.weight}{currentSubscription?.plan?.weight_unit}</p>
                                    {/* <p className="text-xs text-muted-foreground">Fixed plan weight</p> */}
                                </div>
                                <div className="rounded-xl border border-border p-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Frequency</p>
                                    <p className="text-lg font-bold mt-1 capitalize">{getFrequencyWeeksString(currentSubscription?.frequency)}</p>
                                    <p className="text-xs text-muted-foreground">{displayCurrency(currentSubscription?.plan?.price, "NGN")}/cycle</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex flex-wrap items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.plans)}>
                                    <Edit3 className="mr-2 h-3.5 w-3.5" /> Change Plan
                                </Button>

                                 {currentSubscription?.status == "paused" || currentSubscription?.status == "active" ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={loading || isCancelling || isPausing || isCancelling} 
                                        onClick={() => pauseSubscription(currentSubscription?.id)}
                                    >
                                        <Play className="mr-2 h-3.5 w-3.5" />
                                        {isPausing? "Pausing..." : "Resume"}
                                    </Button>
                                ) : currentSubscription?.status == "resume" || currentSubscription?.status == "active" ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={loading || isCancelling || isPausing || isCancelling} 
                                        onClick={() => resumeSubscription(currentSubscription?.id)}
                                    >
                                        <Pause className="mr-2 h-3.5 w-3.5" />
                                        {isResuming ? "Resuming..." : "Pause"}
                                    </Button>
                                ) : ""}

                                {currentSubscription?.status != "cancelled" ? (
                                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" disabled={loading || isCancelling || isPausing || isCancelling} onClick={() => cancelSubscription(currentSubscription?.id)}>
                                        {isCancelling ? "Cancelling..." : "Cancel Subscription"}
                                    </Button>
                                ) : currentSubscription?.status == "cancelled" ? (
                                    <span className="text-destructive hover:text-destructive">
                                        Subscription Cancelled
                                    </span>
                                ) : ""}
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
                            {currentSubscription?.items?.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No items in your box yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {currentSubscription?.items?.map((item) => {
                                        // const product = getProductById(item.productId);
                                        return (
                                            <div key={item?.product_id?.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                                                <div>
                                                    <p className="font-medium text-sm">{item?.product_id?.name}</p>
                                                    <p className="text-xs text-muted-foreground">{item?.product_id?.formattedWeight}</p>
                                                </div>
                                                <Badge variant="secondary">{item.quantity}x</Badge>
                                            </div>
                                        );
                                    })}
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-muted-foreground">Box fill</span>
                                            {/* <span className="font-medium">{formatWeight(subscription.totalWeightG)}/{formatWeight(subscription.state.planWeightG)}</span> */}
                                        </div>
                                        <Progress value={100} className="h-2" />
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
    )
}

export default Subscription