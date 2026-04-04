import { useState, useMemo, useEffect } from "react";
import { Search, Eye, ChevronDown, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingData } from "@/components/LoadingData";
import { toast } from "react-toastify";
import { axiosClient } from "@/GlobalApi";
import { ContactStatus, ContactType, OrdersMetaType } from "@/types/admin";
import { format } from "date-fns";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";
import { useSearchParams } from "react-router-dom";
import { formatEnums } from "@/utils/formatEnums";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Viewcontact } from "@/components/admin/ViewContact";

const statusColors: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-700 bcontact-amber-500/20",
    in_progress: "bg-blue-500/15 text-blue-700 bcontact-blue-500/20",
    resolved: "bg-emerald-500/15 text-emerald-700 bcontact-emerald-500/20",
}

const statusTabs: (ContactStatus | "all")[] = ["all", "pending", "in_progress", "resolved"];

const AdminContacts = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState("");
    const [Contacts, setContacts] = useState<ContactType[]>([]);
    const [meta, setMeta] = useState<OrdersMetaType | null>(null);
    const [loading, setLoading] = useState(true)
    const [disablingId, setDisablingId] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);

    const currentPage = Number(searchParams.get("page")) || 1;
    const activeStatus = searchParams.get("status") || "all";
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            setDisablingId(id);
            setStatus(status)

            await axiosClient.patch(`/contact/${id}`, { status });
            toast.success(`contact marked as ${status}`)

            getContacts()
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setDisablingId(null);
            setStatus(null)
        }
    };

    const changePage = (page: number) => {
        setSearchParams({
            page: page.toString(),
            status: activeStatus,
        });
    };

    const changeStatus = (status: string) => {
        const params = new URLSearchParams(searchParams);

        params.set("page", "1");

        if (status === "all") {
            params.delete("status");
        } else {
            params.set("status", status);
        }

        setSearchParams(params);
    };

    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        params.set("page", "1");

        if (debouncedSearch) {
            params.set("email", debouncedSearch);
        } else {
            params.delete("email");
        }

        setSearchParams(params);
    }, [debouncedSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        getContacts()
    }, [currentPage, activeStatus, debouncedSearch])

    const getContacts = async () => {
        try {
            setLoading(true)

            let url = `/contact?page=${currentPage}&limit=20`;

            if (activeStatus && activeStatus !== "all") {
                url += `&status=${activeStatus}`;
            }
            
            if (debouncedSearch) {
                url += `&email=${encodeURIComponent(debouncedSearch)}`;
            }

            const res = await axiosClient.get(url);

            const Contacts = res.data.data || [];

            const flattenedContacts = Contacts.map((contact: any) => ({
                id: contact.id,
                ...contact.attributes,
                status: contact.attributes.status
            }));

            setContacts(flattenedContacts);
            setMeta(res.data.meta);  

        } catch (err: any) {
            toast.error(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">
            <div>
                <h1 className="text-2xl font-display font-bold text-foreground">Contacts</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    View, track, and manage all contacts.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by email..."
                        className="pl-9 h-10 rounded-xl"
                    />
                </div>
                <div className="flex gap-1 flex-wrap bg-muted/60 rounded-xl p-1">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab}
                            disabled={loading}
                            onClick={() => changeStatus(tab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${activeStatus === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            {tab === "all" ? "All" : formatEnums(tab)}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <LoadingData/>
            ) : (
                <>
                    {/* Table */}
                    <Card className="admin-card admin-animate-up" style={{ animationDelay: "160ms" }}>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto overflow-y-visible">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bcontact-b bcontact-bcontact bg-muted/40">
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Email</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Order ID</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Priority</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Date Created</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Contacts.map((contact) => (
                                            <tr key={contact?.id} className="bcontact-b bcontact-bcontact/50 hover:bg-muted/20 transition-colors">
                                                <td className="px-4 py-3 font-mono font-medium">{contact?.name}</td>
                                                <td className="px-4 py-3 font-mono font-medium">{contact?.email}</td>
                                                <td className="px-4 py-3">{contact?.orderNumber ? contact?.orderNumber : "-"}</td>
                                                <td className="px-4 py-3"><Badge variant="secondary">{contact?.isHighPriority ? "Yes" : "No"}</Badge></td>
                                                <td className="px-4 py-3 text-muted-foreground">{contact?.createdAt ? format(contact?.createdAt, "MMM dd, yyyy hh:mm a") : "None"}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full bcontact px-2.5 py-0.5 text-xs font-semibold ${statusColors[contact?.status]}`}>
                                                        {contact?.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1">
                                                        <Viewcontact contact={contact} />
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg border border-border/70 p-0">
                                                                <ChevronDown className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>

                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem disabled={disablingId === contact?.id} onSelect={(e) => {
                                                                    e.preventDefault();
                                                                    handleUpdateStatus(contact.id, "pending")
                                                                }}>
                                                                    {(disablingId === contact?.id) && (status == "pending") ? (
                                                                        "Updating..."
                                                                    ) : (
                                                                        "→ Pending"
                                                                    )}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem disabled={disablingId === contact?.id} onSelect={(e) => {
                                                                    e.preventDefault();
                                                                    handleUpdateStatus(contact.id, "in_progress")
                                                                }}>
                                                                    {(disablingId === contact?.id) && (status == "in_progress") ? (
                                                                        "Updating..."
                                                                    ) : (
                                                                        "→ In Progress"
                                                                    )}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem disabled={disablingId === contact?.id} onSelect={(e) => {
                                                                    e.preventDefault();
                                                                    handleUpdateStatus(contact.id, "resolved")
                                                                }}>
                                                                    {(disablingId === contact?.id) && (status == "resolved") ? (
                                                                        "Updating..."
                                                                    ) : (
                                                                        "→ Resolved"
                                                                    )}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {Contacts?.length <= 0 && (
                                    <div className="flex items-center justify-center py-12 text-muted-foreground">No Contacts yet.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {meta?.totalPages > 1 && !loading && Contacts?.length > 0 && (
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
                </>
            )}
        </div>
    );
};

export default AdminContacts;
