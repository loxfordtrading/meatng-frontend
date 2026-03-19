import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, ChevronDown, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingData } from "@/components/LoadingData";
import { toast } from "react-toastify";
import { axiosClient } from "@/GlobalApi";
import { OrderStatus, OrderType, OrdersMetaType, PlanType } from "@/types/admin";
import displayCurrency from "@/utils/displayCurrency";
import { format } from "date-fns";
import { ViewPlan } from "@/components/admin/ViewPlan";
import { Link, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";

const AdminPlans = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const [plans, setPlans] = useState<PlanType[]>([]);
    const [meta, setMeta] = useState<OrdersMetaType | null>(null);
    const [loading, setLoading] = useState(true)
    const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
    const currentPage = Number(searchParams.get("page")) || 1;

    const changePage = (page: number) => {
        setSearchParams({
            page: page.toString(),
            // slug: activeCategory,
        });
    };

    useEffect(() => {
        getPlans()
    }, [currentPage])

    const getPlans = async () => {
        try {
            setLoading(true)
            let url = `/plans?page=${currentPage}&limit=20`;

            const res = await axiosClient.get(url);

            const plans = res.data?.data || [];

            const flattenedPlans = plans.map((plan: any) => ({
            id: plan.id,
            ...plan.attributes,
            }));

            setPlans(flattenedPlans);
            setMeta(res.data.meta);  

        } catch (err: any) {
            toast.error(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this plan? This cannot be undone.")) return;
        try {
            setDeletingPlanId(id);
            const res = await axiosClient.delete(`/plans/${id}`)
            toast.success("Plan deleted successfully")
            getPlans()
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setDeletingPlanId(null);
        }
    };

    if (loading) {
        return (
            <LoadingData/>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">
            <div>
                <h1 className="text-2xl font-display font-bold text-foreground">Plan Management</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    View, track, create and manage all plans.
                </p>
                <div className="mt-3">
                    <Link to={ROUTES.addPlan}>
                        <Button size="sm">
                            Add plan
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Table */}
            <Card className="admin-card admin-animate-up" style={{ animationDelay: "160ms" }}>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/40">
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Plan name</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Price</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Total Weight</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">to be filled</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Unit</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plans?.map((plan) => (
                                    <tr key={plan?.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3 font-mono font-medium">{plan?.name}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{plan?.pricing_model === "sum_of_items" ? "-" : displayCurrency(plan?.price,"NGN")}</p>
                                            <p className="text-xs text-muted-foreground">{plan?.pricing_model}</p>
                                        </td>
                                        <td className="px-4 py-3 font-semibold">{plan?.total_weight}{plan?.weight_unit}</td>
                                        <td className="px-4 py-3 font-semibold">{plan?.remaining_weight}{plan?.weight_unit}</td>
                                        <td className="px-4 py-3 font-semibold">{plan?.weight_unit}</td>
                                        {/* <td className="px-4 py-3 text-muted-foreground">{order?.createdAt ? format(order?.createdAt, "MMM dd, yyyy") : "None"}</td> */}
                                        <td className="px-4 py-3">
                                            <Badge variant={plan?.is_active ? "default" : "destructive"}>
                                                {plan?.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 flex gap-2 items-center">
                                            <ViewPlan plan={plan} />
                                            <Link to={`/admin/edit-plan/${plan?.id}`}>
                                                <Button variant="outline" size="sm">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(plan?.id)}
                                                disabled={deletingPlanId === plan?.id}
                                            >
                                                {deletingPlanId === plan?.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                ) : (
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {plans?.length <= 0 && (
                            <div className="flex items-center justify-center py-12 text-muted-foreground">No plans found.</div>
                        )}
                    </div>
                </CardContent>
            </Card>

             {meta?.totalPages > 1 && !loading && plans?.length > 0 && (
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
    );
};

export default AdminPlans;
