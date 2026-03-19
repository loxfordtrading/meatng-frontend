import { FormEvent, useEffect, useState } from "react";
import { Save, Plus, Shield, Clock, Bell, Building2, Truck, Users, Warehouse, Loader2, Trash2, Edit3, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAdmin } from "@/contexts/AdminContext";
import { axiosClient } from "@/GlobalApi";
import { toast } from "react-toastify";
import { CustomerType } from "@/types/admin";
import { LoadingData } from "@/components/LoadingData";
import { AddAdmin } from "@/components/admin/AddAdmin";
import z from "zod";
import displayCurrency from "@/utils/displayCurrency";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import EditDeliveryFee from "@/components/admin/EditDeliveryFee";
import EditWarehouse from "@/components/admin/EditWarehouse";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";
import { useSearchParams } from "react-router-dom";

type SettingsTab = "business" | "delivery" | "notifications" | "admins" | "warehouse";

const feeSchema = z.object({
  name: z.string().min(1, "Fee name is required"),
  rate_per_km: z.string().min(1, "Delivery rate (fee) is required"),
  is_active: z.boolean()
});

const warehouseSchema = z.object({
  name: z.string().nonempty("Warehouse name is required"),

  street_address: z
    .string()
    .nonempty("Street address is required"),

  apartment_suite: z
    .string()
    .optional(),

  city: z
    .string()
    .nonempty("City is required"),

  state: z
    .string()
    .nonempty("State is required"),

  zip_code: z
    .string()
    .nonempty("Zip code is required"),

  country: z
    .string()
    .nonempty("Country is required"),

  is_active: z.boolean()
});

type FeeFormValues = z.infer<typeof feeSchema>

type WarehouseFormValues = z.infer<typeof warehouseSchema>

const AdminSettings = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const [tab, setTab] = useState<SettingsTab>("admins");
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmittingWarehouse, setIsSubmittingWarehouse] = useState(false)
    const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);
    const currentPage = Number(searchParams.get("page")) || 1;

    const [admins, setAdmins] = useState<CustomerType[]>([]);
    const [fees, setFees] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [meta, setMeta] = useState(null);
    const [feeMeta, setFeeMeta] = useState(null);
    const [warehouseMeta, setWarehouseMeta] = useState(null);
    const [loading, setLoading] = useState(true)
    const [deletingFeeId, setDeletingFeeId] = useState(null)
    const [form, setForm] = useState({
      name: '',
      rate_per_km: '',
      is_active: true
    })
    const [warehouseForm, setWarehouseForm] = useState({
        name: "",
        street_address: "",
        apartment_suite: "",
        city: "",
        state: "",
        zip_code: "",
        country: "Nigeria",
        is_active: true
    })

    const tabs: { id: SettingsTab; label: string; icon: typeof Building2 }[] = [
        { id: "admins", label: "Admin Users", icon: Users },
        { id: "delivery", label: "Delivery", icon: Truck },
        { id: "warehouse", label: "Warehouse", icon: Warehouse },
    ];

    const changePage = (page: number) => {
        setSearchParams({
            page: page.toString(),
        });
    };

    useEffect(() => {
        getAdmins()
    }, [currentPage])

    useEffect(() => {
        getFees()
        getWarehouses()
    }, [])

    const handleFeeSubmit = async (e: FormEvent) => {
        e.preventDefault()
    
        const result = feeSchema.safeParse(form)
    
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof FeeFormValues, string>> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof FeeFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }
        
        try {
    
          setIsSubmitting(true)
          
    
          const newForm = {
            name: form.name,
            rate_per_km: Number(form.rate_per_km),
            is_active: form.is_active
          };
    
          const result = await axiosClient.post("/delivery/pricing", newForm)
          toast.success("Fee added successfully");
          getFees()
    
          setForm({
            name: "",
            rate_per_km: "",
            is_active: true
          })
    
        } catch (error: any) {
          toast.error(error.response?.data?.message);
        } finally {
          setIsSubmitting(false)
        } 
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this fee? This cannot be undone.")) return;
        try {
            setDeletingFeeId(id);
            const res = await axiosClient.delete(`/delivery/pricing/${id}`)
            toast.success("Fee deleted successfully")
            getFees()
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setDeletingFeeId(null);
        }
    };

    const handleDeleteWarehouse = async (id: string) => {
        if (!confirm("Delete this warehouse? This cannot be undone.")) return;
        try {
            setLoadingDeleteId(id);
            await axiosClient.delete(`/delivery/warehouses/${id}`);
            toast.success("Warehouse Deleted")
            getWarehouses();
        } catch (error){
            toast.error(error.response?.data?.message);
        } finally {
            setLoadingDeleteId(null);
        }
    };

    const handleWarehouseSubmit = async (e: FormEvent) => {
        e.preventDefault()
    
        const result = warehouseSchema.safeParse(warehouseForm)
    
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof WarehouseFormValues, string>> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof WarehouseFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }
        
        try {
    
          setIsSubmittingWarehouse(true)
          
    
          const result = await axiosClient.post("/delivery/warehouses", warehouseForm)
          toast.success("Warehouse added successfully");
    
          setWarehouseForm({
            name: "",
            street_address: "",
            apartment_suite: "",
            city: "",
            state: "",
            zip_code: "",
            country: "Nigeria",
            is_active: true
          })
    
        } catch (error: any) {
          toast.error(error.response?.data?.message);
        } finally {
          setIsSubmittingWarehouse(false)
        } 
    }

    const getAdmins = async () => {
        try {
            setLoading(true)
            let url = `/users/admins?page=${currentPage}&limit=20`;

            const res = await axiosClient.get(url);

            const admins = res.data.data || [];

            const flattenedAdmins = admins.map((customer: any) => ({
                id: customer.id,
                ...customer.attributes,
            }));

            setAdmins(flattenedAdmins);
            setMeta(res.data.meta);  

        } catch (err: any) {
            toast.error(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const getFees = async () => {
        try {
            setLoading(true)
            const res = await axiosClient.get(`/delivery/pricing`);

            const feesData = res.data.data || [];

            const flattenedFees = feesData.map((fee: any) => ({
                id: fee.id,
                ...fee.attributes,
            }));

            setFees(flattenedFees);
            setFeeMeta(res.data.meta);  

        } catch (err: any) {
            toast.error(err.response?.data?.message);
        } finally {
            setLoading(false)
        }
    };

    const getWarehouses = async () => {
        try {
            setLoading(true)
            const res = await axiosClient.get(`/delivery/warehouses`);

            const warehousesData = res.data.data || [];

            const flattenedWarehouses = warehousesData.map((fee: any) => ({
                id: fee.id,
                ...fee.attributes,
            }));

            setWarehouses(flattenedWarehouses);
            setWarehouseMeta(res.data.meta);  

        } catch (err: any) {
            toast.error(err.response?.data?.message);
        } finally {
            setLoading(false);
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

               {/* Admin Users */}
            {tab === "admins" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{meta?.total || 0} admin users</p>
                        <AddAdmin getAdmins={getAdmins}/>
                    </div>
                    <Card className="admin-card admin-animate-up" style={{ animationDelay: "120ms" }}>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {admins.map((user) => (
                                    <div key={user?.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary">
                                                {user?.first_name[0]}{user?.last_name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <Shield className="h-3 w-3" /> {user?.role}
                                            </Badge>
                                            <Badge variant={user?.is_active ? "default" : "outline"}>
                                                {user?.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {meta?.totalPages > 1 && !loading && admins?.length > 0 && (
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
            )}

            {/* Delivery */}
            {tab === "delivery" && (
                <div className="space-y-8">
                    {/* Table */}
                    <Card className="admin-card admin-animate-up" style={{ animationDelay: "160ms" }}>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/40">
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Label</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Rate per Km</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Created On</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Last Updated</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fees?.map((fee) => (
                                            <tr key={fee?.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                                <td className="px-4 py-3 font-mono font-medium">{fee?.name}</td>
                                                <td className="px-4 py-3 font-semibold">{displayCurrency(fee?.rate_per_km, "NGN")}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{fee?.createdAt ? format(fee?.createdAt, "MMM dd, yyyy") : "None"}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{fee?.updatedAt ? format(fee?.updatedAt, "MMM dd, yyyy") : "None"}</td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={fee?.is_active ? "default" : "destructive"}>
                                                        {fee?.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 flex gap-2 items-center">
                                                    <div className="flex gap-1">
                                                        <EditDeliveryFee delivery={fee} getFees={getFees}/>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => handleDelete(fee?.id)}
                                                            disabled={deletingFeeId === fee?.id}
                                                        >
                                                            {deletingFeeId === fee?.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                            ) : (
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {fees?.length <= 0 && (
                                    <div className="flex items-center justify-center py-12 text-muted-foreground">No fee found.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="admin-card admin-animate-up" style={{ animationDelay: "120ms" }}>
                        <CardHeader>
                            <CardTitle className="text-base">Add New Delivery Fee</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 max-w-xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input placeholder="Enter fee label" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value})}  className="h-10 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rate Per Km (Naira)</Label>
                                    <Input className="h-10 rounded-xl" type="number" value={form.rate_per_km} onChange={(e: any) => setForm({ ...form, rate_per_km: e.target.value})}  placeholder="Enter Fee"/>
                                </div>
                                <div className="space-y-2 flex flex-col">
                                    <Label>
                                        Status:{" "}
                                        <span className={form.is_active ? "text-green-600" : "text-gray-500"}>
                                            {form.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </Label>
                                    <Switch
                                        checked={form.is_active}
                                        onCheckedChange={(value) =>
                                            setForm((f) => ({
                                                ...f,
                                                is_active: value
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                            <Button size="sm" onClick={handleFeeSubmit} disabled={isSubmitting}>
                                <Save className="mr-2 h-3.5 w-3.5" /> {isSubmitting ? "submitting..." : "Save Changes"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

             {tab === "warehouse" && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {warehouses.map((warehouse) => (
                            <Card key={warehouse?.id}>
                                <CardContent className="p-5">

                                    <div className="flex justify-between mb-3">

                                        <div className="flex gap-2 items-center">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <span className="font-semibold">
                                                {warehouse?.name}
                                            </span>
                                        </div>

                                        {warehouse?.is_active ? (
                                            <Badge variant="secondary">Active</Badge>
                                        ) : (
                                           <Badge variant="destructive">Inactive</Badge> 
                                        )}

                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                        {warehouse?.street_address}
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        {warehouse?.apartment_suite}
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        {[warehouse?.city, warehouse?.state, warehouse?.country, warehouse?.zip_code]
                                        .filter(Boolean)
                                        .join(", ")}
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        Date created: {warehouse?.createdAt ? format(warehouse?.createdAt, "MMM dd, yyyy") : "None"}
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        Last updated: {warehouse?.updatedAt ? format(warehouse?.updatedAt, "MMM dd, yyyy") : "None"}
                                    </p>

                                    <div className="mt-4 flex gap-2">

                                        <EditWarehouse warehouse={warehouse} getWarehouses={getWarehouses}/>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-destructive"
                                            disabled={(loadingDeleteId === warehouse?.id) || loading}
                                            onClick={() => handleDeleteWarehouse(warehouse?.id)}
                                        >
                                        <Trash2 className="mr-1 h-3 w-3" />
                                            {loadingDeleteId === warehouse.id ? "Deleting..." : "Delete"}
                                        </Button>

                                    </div>

                                </CardContent>
                            </Card>
                        ))}

                    </div>
                    {warehouses?.length <= 0 && (
                        <div className="flex items-center justify-center py-12 text-muted-foreground">No Warehouse found.</div>
                    )}

                    <Card className="admin-card admin-animate-up" style={{ animationDelay: "120ms" }}>
                        <CardHeader>
                            <CardTitle className="text-base">Add a New Warehouse</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 max-w-xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input placeholder="Enter warehouse label" value={warehouseForm.name} onChange={(e: any) => setWarehouseForm({ ...warehouseForm, name: e.target.value})}  className="h-10 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label>State</Label>
                                    <Input className="h-10 rounded-xl" value={warehouseForm.state} onChange={(e: any) => setWarehouseForm({ ...warehouseForm, state: e.target.value})}  placeholder="Enter State"/>
                                </div>
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Input className="h-10 rounded-xl" value={warehouseForm.city} onChange={(e: any) => setWarehouseForm({ ...warehouseForm, city: e.target.value})}  placeholder="Enter City"/>
                                </div>
                                <div className="space-y-2">
                                    <Label>Zip Code</Label>
                                    <Input className="h-10 rounded-xl" value={warehouseForm.zip_code} onChange={(e: any) => setWarehouseForm({ ...warehouseForm, zip_code: e.target.value})}  placeholder="Enter Zip Code"/>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label>Stree Address</Label>
                                    <Input placeholder="Enter street address" value={warehouseForm.street_address} onChange={(e: any) => setWarehouseForm({ ...warehouseForm, street_address: e.target.value})}  className="h-10 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Appartment Suite</Label>
                                    <Input className="h-10 rounded-xl" value={warehouseForm.apartment_suite} onChange={(e: any) => setWarehouseForm({ ...warehouseForm, apartment_suite: e.target.value})}  placeholder="Enter apartment"/>
                                </div>
                                <div className="space-y-2 flex flex-col">
                                    <Label>
                                        Status:{" "}
                                        <span className={warehouseForm.is_active ? "text-green-600" : "text-gray-500"}>
                                            {warehouseForm.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </Label>
                                    <Switch
                                        checked={warehouseForm.is_active}
                                        onCheckedChange={(value) =>
                                            setWarehouseForm((f) => ({
                                                ...f,
                                                is_active: value
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                            <Button size="sm" onClick={handleWarehouseSubmit} disabled={isSubmittingWarehouse}>
                                <Save className="mr-2 h-3.5 w-3.5" /> {isSubmittingWarehouse ? "Submitting..." : "Save Changes"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

        </div>
    );
};

export default AdminSettings;
