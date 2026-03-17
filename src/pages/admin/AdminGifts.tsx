import { useState, useMemo, useEffect } from "react";
import { Search, Eye, ChevronDown, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingData } from "@/components/LoadingData";
import { toast } from "react-toastify";
import { axiosClient } from "@/GlobalApi";
import { GiftboxType, OrderStatus, OrderType, OrdersMetaType, PlanType } from "@/types/admin";
import displayCurrency from "@/utils/displayCurrency";
import { format } from "date-fns";
import { ViewPlan } from "@/components/admin/ViewPlan";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import { ViewGift } from "@/components/admin/ViewGift";

const AdminGifts = () => {

    const [giftBoxes, setGiftBoxes] = useState<GiftboxType[]>([]);
    const [meta, setMeta] = useState<OrdersMetaType | null>(null);
    const [loading, setLoading] = useState(true)
    const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

    useEffect(() => {
        getGiftboxes()
    }, [])

    const getGiftboxes = async () => {
        try {
            setLoading(true)
            const res = await axiosClient.get(`/giftboxes`);

            const gifts = res.data?.data || [];

            const flattenedPlans = gifts.map((giftbox: any) => ({
            id: giftbox.id,
            ...giftbox.attributes,
            }));

            setGiftBoxes(flattenedPlans);
            setMeta(res.data.meta);  

        } catch (err: any) {
            toast.error(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this giftbox? This cannot be undone.")) return;
        try {
            setDeletingPlanId(id);
            const res = await axiosClient.delete(`/giftboxes/${id}`)
            toast.success("Giftbox deleted successfully")
            getGiftboxes()
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
                <h1 className="text-2xl font-display font-bold text-foreground">Gift Management</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    View, track, create and manage all gifts.
                </p>
                <div className="mt-3">
                    <Link to={ROUTES.addGift}>
                        <Button size="sm">
                            Add gift Box
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
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Gift name</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Price</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Weight</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Unit</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Created on</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {giftBoxes?.map((giftbox) => (
                                    <tr key={giftbox?.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3 font-mono font-medium">{giftbox?.name}</td>
                                        <td className="px-4 py-3 font-semibold">{displayCurrency(giftbox?.price,"NGN")}</td>
                                        <td className="px-4 py-3 font-semibold">{giftbox?.weight}{giftbox?.weight_unit}</td>
                                        <td className="px-4 py-3 font-semibold">{giftbox?.weight_unit}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{giftbox?.createdAt ? format(giftbox?.createdAt, "MMM dd, yyyy") : "None"}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={giftbox?.is_active ? "default" : "destructive"}>
                                                {giftbox?.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 flex gap-2 items-center">
                                            <ViewGift giftbox={giftbox} />
                                            <Link to={`/admin/edit-gift/${giftbox?.id}`}>
                                                <Button variant="outline" size="sm">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(giftbox?.id)}
                                                disabled={deletingPlanId === giftbox?.id}
                                            >
                                                {deletingPlanId === giftbox?.id ? (
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
                        {giftBoxes?.length <= 0 && (
                            <div className="flex items-center justify-center py-12 text-muted-foreground">No giftboxes found.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminGifts
