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
import { FormattedSubscriptionType, MetaType } from "@/types/types";
import { getFrequencyWeeksString } from "@/utils/conversion";
import { useNavigate, useSearchParams } from "react-router-dom";
import displayCurrency from "@/utils/displayCurrency";
import { format } from "date-fns";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";

const Subscription = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate()
    const userInfo = useAuthStore(state => state.userInfo)
    const [subscriptions, setSubscriptions] = useState<FormattedSubscriptionType[]>([]);
    const [loading, setLoading] = useState(true)
     const [meta, setMeta] = useState<MetaType | null>(null);
    const [pausingId, setPausingId] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const currentPage = Number(searchParams.get("page")) || 1;

    const changePage = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", page.toString());

        setSearchParams(params);
    };

    useEffect(() => {
        getSubscriptions()
    }, [currentPage])

    const getSubscriptions = async () => {
        try {
            setLoading(true)
            let url = `/subscriptions/by-user/${userInfo.userId}?page=${currentPage}&limit=20`;

            const res = await axiosClient.get(url);

            const subs = res.data.data || [];

            const formattedSubscriptions: FormattedSubscriptionType[] = subs.map((sub: any) => ({
                id: sub.id,
                ...sub.attributes
            }));

            setSubscriptions(formattedSubscriptions);
            setMeta(res.data?.meta);

        } catch (err: any) {
            toast.error(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const cancelSubscription = async (subscriptionId: string) => {
        if (!confirm("Cancel this subscription? This cannot be undone.")) return;
        try {
            setCancellingId(subscriptionId)
            const res = await axiosClient.patch(`/subscriptions/${subscriptionId}/cancel`);
            getSubscriptions()
            toast.success("Subscription cancelled");
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setCancellingId(null)
        }
    }

    const pauseSubscription = async (subscriptionId: string) => {
        try {
            setPausingId(subscriptionId)
            const res = await axiosClient.patch(`/subscriptions/${subscriptionId}/pause`);
            getSubscriptions()
            toast.success("Subscription paused");
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setPausingId(null)
        }
    }

     const resumeSubscription = async (subscriptionId: string) => {
        try {
            setPausingId(subscriptionId)
            const res = await axiosClient.patch(`/subscriptions/${subscriptionId}/resume`);
            getSubscriptions()
            toast.success("Subscription resumed");
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setPausingId(null)
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
                <h2 className="text-2xl font-display font-bold text-foreground">My Subscriptions</h2>
                <p className="text-muted-foreground mt-1">Manage your plan, size, and delivery preferences.</p>
            </div>

            {subscriptions?.length > 0 ? (
                subscriptions.map((sub) => (
                    <Card key={sub.id} className="admin-card">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                            <CardTitle className="capitalize">{sub?.status} Plan</CardTitle>
                            <Badge variant={sub.status === 'paused' ? "destructive" : "default"}>
                                {sub.status === 'paused' ? "Paused" : "Active"}
                            </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="rounded-xl border border-border p-4">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Plan</p>
                                <p className="text-lg font-bold mt-1">{sub.plan_name}</p>
                            </div>

                            <div className="rounded-xl border border-border p-4">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Weight</p>
                                <p className="text-lg font-bold mt-1">{sub.box_weight}</p>
                            </div>

                            <div className="rounded-xl border border-border p-4">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Frequency</p>
                                <p className="text-lg font-bold mt-1 capitalize">
                                {getFrequencyWeeksString(sub.frequency)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                {displayCurrency(sub?.monthly_value, "NGN")}/cycle
                                </p>
                            </div>
                            </div>

                            <Separator />

                            <div>
                                <h2 className="font-semibold">Next Billing At: <span className="text-primary">{sub?.next_billing_at ? format(new Date(sub?.next_billing_at), "dd MMM yyyy") : "N/A"}</span></h2>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.plans)}>
                                    <Edit3 className="mr-2 h-3.5 w-3.5" /> Change Plan
                                </Button>

                                {sub.status === "paused" ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => resumeSubscription(sub.id)}
                                        disabled={pausingId == sub?.id}
                                    >
                                        {pausingId == sub?.id ? "Resuming..." : "Resume"}
                                    </Button>
                                ) : sub.status === "active" ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => pauseSubscription(sub.id)}
                                        disabled={pausingId == sub?.id}
                                    >
                                        {pausingId == sub?.id ? "Pausing..." : "Pause"}
                                    </Button>
                                ) : null}

                                {sub.status !== "cancelled" ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive"
                                        onClick={() => cancelSubscription(sub.id)}
                                        disabled={cancellingId == sub?.id}
                                    >
                                        {cancellingId == sub?.id ? "Cancelling..." : "Cancel Subscription"}
                                    </Button>
                                ) : (
                                    <span className="text-destructive">
                                        Subscription Cancelled
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    ))
                ) : (
                <Card className="admin-card">
                    <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No Active Subscription</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                        Start your first subscription to get premium meat delivered.
                    </p>
                    <Button className="mt-4" onClick={() => navigate(ROUTES.plans)}>
                        Choose a Plan <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    </CardContent>
                </Card>
            )}

             {meta?.totalPages > 1 && !loading && subscriptions?.length > 0 && (
                <Pagination className="mt-8">
                    <PaginationContent className="flex-wrap justify-center gap-2">

                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => currentPage > 1 && changePage(currentPage - 1)}
                        />
                    </PaginationItem>

                    {Array.from({ length: Number(meta?.totalPages) }).map((_, i) => {
                        const page = i + 1;

                        return (
                        <PaginationItem key={page}>
                            <PaginationLink
                                isActive={currentPage === page}
                                onClick={() => changePage(page)}
                            >
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                        );
                    })}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() =>
                                currentPage < meta?.totalPages && changePage(currentPage + 1)
                            }
                        />
                    </PaginationItem>

                    </PaginationContent>
                </Pagination>
            )}
        </div>
    )
}

export default Subscription