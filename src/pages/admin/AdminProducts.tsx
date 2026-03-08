import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Edit3, Trash2, Grid3X3, List, Package, Loader2, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { products as mockProducts, categories as mockLocalCategories } from "@/data/products";
import { formatPrice } from "@/data/plans";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import {
    addCategoryToProduct,
    listProducts,
    createProduct,
    updateProduct,
    updateProductStock,
    deleteProduct,
    getProductById,
    getProductCategoryById,
    getRootProductCategories,
    listProductCategories,
    removeCategoryFromProduct,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory,
    type Product as ApiProduct,
    type ProductCategory as ApiCategory,
} from "@/lib/api/admin";

interface UiProduct {
    id: string;
    name: string;
    image: string;
    packSize: string;
    category: string;
    categoryId?: string;
    addOnPrice: number;
    isPremiumDrop: boolean;
    description: string;
    isActive: boolean;
    sku?: string;
    stock?: number;
}

interface UiCategory {
    id: string;
    name: string;
}

const mapApiToUi = (p: ApiProduct, cats: UiCategory[]): UiProduct => {
    const raw = p.raw ?? {};
    const catId = p.categoryIds?.[0];
    const catName = catId ? (cats.find((c) => c.id === catId)?.name ?? catId) : String(raw.category ?? "");
    return {
        id: p.id,
        name: p.name ?? String(raw.name ?? "Unnamed"),
        image: p.images?.[0] ?? String(raw.imageUrl ?? raw.image ?? "/placeholder.svg"),
        packSize: String(raw.packSize ?? raw.pack_size ?? raw.weight ?? p.sku ?? "—"),
        category: catName,
        categoryId: catId,
        addOnPrice: p.price ?? 0,
        isPremiumDrop: Boolean(raw.isPremiumDrop ?? raw.is_premium_drop ?? false),
        description: p.description ?? String(raw.description ?? ""),
        isActive: p.isActive ?? true,
        sku: p.sku,
        stock: p.stock,
    };
};

const AdminProducts = () => {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [editingProduct, setEditingProduct] = useState<UiProduct | null>(null);
    const [editForm, setEditForm] = useState<Partial<UiProduct>>({});
    const [creatingProduct, setCreatingProduct] = useState(false);
    const [createForm, setCreateForm] = useState<Partial<UiProduct>>({});
    const [activeTab, setActiveTab] = useState<"products" | "categories">("products");
    const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(null);
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [catForm, setCatForm] = useState<{ name: string; slug: string; description: string }>({ name: "", slug: "", description: "" });

    const token = tokenStorage.getAdminToken();
    const queryClient = useQueryClient();

    const { data: apiCategories } = useQuery({
        queryKey: ["admin-product-categories"],
        queryFn: async () => {
            try { return await listProductCategories(token); } catch { return null; }
        },
        staleTime: 300_000,
    });
    const { data: rootCategories } = useQuery({
        queryKey: ["admin-root-product-categories"],
        queryFn: async () => {
            try { return await getRootProductCategories(token); } catch { return null; }
        },
        staleTime: 300_000,
    });

    const categories: UiCategory[] = useMemo(() => {
        if (apiCategories) return apiCategories.map((c) => ({ id: c.id, name: c.name ?? c.id }));
        return []
        // return mockLocalCategories.map((c) => ({ id: c.id, name: c.name }));
    }, [apiCategories]);

    const { data: apiProducts, isLoading } = useQuery({
        queryKey: ["admin-products"],
        queryFn: async () => {
            try { return await listProducts(token); } catch { return null; }
        },
        staleTime: 60_000,
    });

    const products: UiProduct[] = useMemo(() => {
        if (apiProducts) return apiProducts.map((p) => mapApiToUi(p, categories));
        return [];
        // return mockProducts.map((p) => ({
        //     id: p.id, name: p.name, image: p.image, packSize: p.packSize,
        //     category: p.category, addOnPrice: p.addOnPrice, isPremiumDrop: p.isPremiumDrop,
        //     description: p.description, isActive: true,
        // }));
    }, [apiProducts, categories]);

    // const usingMock = !apiProducts;

    const toggleMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            updateProduct(id, { isActive }, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            queryClient.invalidateQueries({ queryKey: ["catalog-products"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteProduct(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            queryClient.invalidateQueries({ queryKey: ["catalog-products"] });
        },
    });

    const saveMutation = useMutation({
        mutationFn: async ({ id, form, original }: { id: string; form: Partial<UiProduct>; original: UiProduct }) => {
            const nextCategoryId = form.categoryId || undefined;
            const previousCategoryId = original.categoryId || undefined;
            const nextStock = typeof form.stock === "number" ? form.stock : undefined;

            const updated = await updateProduct(id, {
                name: form.name,
                description: form.description,
                price: form.addOnPrice,
                stock: form.stock,
                sku: form.sku,
                images: form.image ? [form.image] : undefined,
                categoryIds: nextCategoryId ? [nextCategoryId] : undefined,
            }, token);

            if (previousCategoryId && previousCategoryId !== nextCategoryId) {
                void removeCategoryFromProduct(id, previousCategoryId, token).catch(() => undefined);
            }
            if (nextCategoryId && previousCategoryId !== nextCategoryId) {
                void addCategoryToProduct(id, nextCategoryId, token).catch(() => undefined);
            }
            if (typeof nextStock === "number" && nextStock !== (original.stock ?? 0)) {
                void updateProductStock(id, nextStock, token).catch(() => undefined);
            }

            return updated;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            queryClient.invalidateQueries({ queryKey: ["catalog-products"] });
            setEditingProduct(null);
        },
    });

    const createMutation = useMutation({
        mutationFn: (form: Partial<UiProduct>) =>
            createProduct({
                name: form.name,
                description: form.description,
                price: form.addOnPrice,
                stock: form.stock,
                sku: form.sku,
                isActive: true,
                images: form.image ? [form.image] : undefined,
                categoryIds: form.categoryId ? [form.categoryId] : undefined,
            }, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            queryClient.invalidateQueries({ queryKey: ["catalog-products"] });
            setCreatingProduct(false);
            setCreateForm({});
        },
    });

    const createCatMutation = useMutation({
        mutationFn: (form: { name: string; slug: string; description: string }) =>
            createProductCategory({ name: form.name, slug: form.slug, description: form.description, isActive: true }, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-product-categories"] });
            queryClient.invalidateQueries({ queryKey: ["catalog-categories"] });
            setCreatingCategory(false);
            setCatForm({ name: "", slug: "", description: "" });
        },
    });

    const updateCatMutation = useMutation({
        mutationFn: ({ id, form }: { id: string; form: { name: string; slug: string; description: string } }) =>
            updateProductCategory(id, { name: form.name, slug: form.slug, description: form.description }, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-product-categories"] });
            queryClient.invalidateQueries({ queryKey: ["catalog-categories"] });
            setEditingCategory(null);
        },
    });

    const deleteCatMutation = useMutation({
        mutationFn: (id: string) => deleteProductCategory(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-product-categories"] });
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            queryClient.invalidateQueries({ queryKey: ["catalog-categories"] });
            queryClient.invalidateQueries({ queryKey: ["catalog-products"] });
        },
    });

    const openEdit = async (product: UiProduct) => {
        setEditingProduct(product);
        setEditForm({ ...product });
        // if (usingMock) return;
        try {
            const refreshed = await getProductById(product.id, token);
            setEditForm({ ...mapApiToUi(refreshed, categories) });
        } catch {
            // Keep table payload if detail fetch fails.
        }
    };

    const toggleStock = (product: UiProduct) => {
        // if (!usingMock) 
        toggleMutation.mutate({ id: product.id, isActive: !product.isActive });
    };

    const handleDelete = (id: string) => {
        if (!confirm("Delete this product? This cannot be undone.")) return;
        // if (!usingMock) 
        deleteMutation.mutate(id);
    };

    const handleSave = () => {
        if (!editingProduct) return;
        // if (!usingMock) {
            saveMutation.mutate({ id: editingProduct.id, form: editForm, original: editingProduct });
        // } else {
        //     setEditingProduct(null);
        // }
    };

    const handleCreate = () => {
        if (!createForm.name) return;
        createMutation.mutate(createForm);
    };

    const openCreate = () => {
        setCreatingProduct(true);
        setCreateForm({ isActive: true });
    };

    const openCatCreate = () => {
        setCreatingCategory(true);
        setCatForm({ name: "", slug: "", description: "" });
    };

    const openCatEdit = async (cat: ApiCategory) => {
        setEditingCategory(cat);
        setCatForm({ name: cat.name ?? "", slug: cat.slug ?? "", description: cat.description ?? "" });
        try {
            const detailed = await getProductCategoryById(cat.id, token);
            setEditingCategory(detailed);
            setCatForm({
                name: detailed.name ?? "",
                slug: detailed.slug ?? "",
                description: detailed.description ?? "",
            });
        } catch {
            // Keep list payload if detail fetch fails.
        }
    };

    const handleCatSave = () => {
        if (!catForm.name) return;
        if (editingCategory) {
            updateCatMutation.mutate({ id: editingCategory.id, form: catForm });
        } else {
            createCatMutation.mutate(catForm);
        }
    };

    const handleCatDelete = (id: string) => {
        if (!confirm("Delete this category? Products in it will lose their category.")) return;
        deleteCatMutation.mutate(id);
    };

    const autoSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const filtered = products.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = categoryFilter === "all" || p.category === categoryFilter || p.categoryId === categoryFilter;
        return matchSearch && matchCategory;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24 admin-page-bg rounded-3xl">
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Product Catalog</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {products.length} products across {categories.length} categories
                        {
                            // !usingMock && 
                        rootCategories ? ` (${rootCategories.length} root)` : ""}.
                        {/* {usingMock && <span className="ml-1 text-xs text-amber-600">(demo data)</span>} */}
                    </p>
                </div>
                {activeTab === "products" ? (
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="mr-2 h-3.5 w-3.5" /> Add Product
                    </Button>
                ) : (
                    <Button size="sm" onClick={openCatCreate}>
                        <Plus className="mr-2 h-3.5 w-3.5" /> Add Category
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex rounded-lg border border-input overflow-hidden w-fit">
                <button
                    onClick={() => setActiveTab("products")}
                    className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === "products" ? "bg-primary text-white" : "hover:bg-muted"}`}
                >
                    <Package className="h-4 w-4" /> Products
                </button>
                <button
                    onClick={() => setActiveTab("categories")}
                    className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === "categories" ? "bg-primary text-white" : "hover:bg-muted"}`}
                >
                    <Tag className="h-4 w-4" /> Categories
                </button>
            </div>

            {activeTab === "products" && <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="pl-9 h-10 rounded-xl" />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-medium"
                >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <div className="flex rounded-lg border border-input overflow-hidden">
                    <button onClick={() => setViewMode("grid")} className={`px-3 py-2 ${viewMode === "grid" ? "bg-primary text-white" : "hover:bg-muted"}`}>
                        <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => setViewMode("list")} className={`px-3 py-2 ${viewMode === "list" ? "bg-primary text-white" : "hover:bg-muted"}`}>
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((product) => (
                        <Card key={product.id} className="admin-card overflow-hidden group transition-all">
                            <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                {product.isPremiumDrop && (
                                    <Badge className="absolute top-2 left-2 bg-amber-500 text-white border-0">Premium</Badge>
                                )}
                                {!product.isActive && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="text-white font-bold">Out of Stock</span>
                                    </div>
                                )}
                            </div>
                            <CardContent className="p-4">
                                <p className="font-semibold text-sm truncate">{product.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{product.packSize} • {product.category}</p>
                                <p className="text-sm font-bold text-primary mt-2">{formatPrice(product.addOnPrice)}</p>
                                <div className="flex gap-1.5 mt-3">
                                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => openEdit(product)}>
                                        <Edit3 className="mr-1 h-3 w-3" /> Edit
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-xs" onClick={() => toggleStock(product)} disabled={toggleMutation.isPending}>
                                        {product.isActive ? "Disable" : "Enable"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="admin-card admin-animate-up" style={{ animationDelay: "160ms" }}>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/40">
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Product</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Category</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Pack Size</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Price</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Stock</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((product) => (
                                        <tr key={product.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                                                    <div>
                                                        <p className="font-medium">{product.name}</p>
                                                        {product.isPremiumDrop && <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/20 text-[10px]">Premium</Badge>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 capitalize text-muted-foreground">{product.category}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{product.packSize}</td>
                                            <td className="px-4 py-3 font-semibold">{formatPrice(product.addOnPrice)}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{product.stock ?? "—"}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={product.isActive ? "default" : "destructive"}>
                                                    {product.isActive ? "In Stock" : "Out of Stock"}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => openEdit(product)}>
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => toggleStock(product)} disabled={toggleMutation.isPending}>
                                                        {product.isActive ? "Disable" : "Enable"}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(product.id)}
                                                        disabled={deleteMutation.isPending}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Edit Modal */}
            {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setEditingProduct(null)} />
                    <Card className="admin-card relative z-10 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-fade-in">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Edit Product</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setEditingProduct(null)}>✕</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    value={editForm.name ?? ""}
                                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                                    className="h-10 rounded-xl"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <select
                                        value={editForm.categoryId ?? ""}
                                        onChange={(e) => setEditForm((f) => ({
                                            ...f,
                                            categoryId: e.target.value,
                                            category: categories.find((c) => c.id === e.target.value)?.name ?? e.target.value,
                                        }))}
                                        className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Pack Size</Label>
                                    <Input
                                        value={editForm.packSize ?? ""}
                                        onChange={(e) => setEditForm((f) => ({ ...f, packSize: e.target.value }))}
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Price (₦)</Label>
                                    <Input
                                        type="number"
                                        value={editForm.addOnPrice ?? 0}
                                        onChange={(e) => setEditForm((f) => ({ ...f, addOnPrice: parseFloat(e.target.value) || 0 }))}
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Stock</Label>
                                    <Input
                                        type="number"
                                        value={editForm.stock ?? 0}
                                        onChange={(e) => setEditForm((f) => ({ ...f, stock: parseInt(e.target.value) || 0 }))}
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>SKU</Label>
                                    <Input
                                        value={editForm.sku ?? ""}
                                        onChange={(e) => setEditForm((f) => ({ ...f, sku: e.target.value }))}
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <textarea
                                    value={editForm.description ?? ""}
                                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Image URL</Label>
                                <Input
                                    value={editForm.image ?? ""}
                                    onChange={(e) => setEditForm((f) => ({ ...f, image: e.target.value }))}
                                    className="h-10 rounded-xl"
                                />
                            </div>
                            {saveMutation.isError && (
                                <p className="text-sm text-destructive">Failed to save. Please try again.</p>
                            )}
                            <div className="flex gap-2 pt-2">
                                <Button size="sm" className="flex-1" onClick={handleSave} disabled={saveMutation.isPending}>
                                    {saveMutation.isPending ? "Saving..." : "Save Changes"}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Create Modal */}
            {creatingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setCreatingProduct(false)} />
                    <Card className="admin-card relative z-10 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-fade-in">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Add Product</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setCreatingProduct(false)}>✕</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Name *</Label>
                                <Input
                                    value={createForm.name ?? ""}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Whole Chicken"
                                    className="h-10 rounded-xl"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <select
                                        value={createForm.categoryId ?? ""}
                                        onChange={(e) => setCreateForm((f) => ({
                                            ...f,
                                            categoryId: e.target.value,
                                            category: categories.find((c) => c.id === e.target.value)?.name ?? e.target.value,
                                        }))}
                                        className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Pack Size</Label>
                                    <Input
                                        value={createForm.packSize ?? ""}
                                        onChange={(e) => setCreateForm((f) => ({ ...f, packSize: e.target.value }))}
                                        placeholder="e.g. 1.5-2kg"
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Price (₦)</Label>
                                    <Input
                                        type="number"
                                        value={createForm.addOnPrice ?? ""}
                                        onChange={(e) => setCreateForm((f) => ({ ...f, addOnPrice: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0"
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Stock</Label>
                                    <Input
                                        type="number"
                                        value={createForm.stock ?? ""}
                                        onChange={(e) => setCreateForm((f) => ({ ...f, stock: parseInt(e.target.value) || 0 }))}
                                        placeholder="0"
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>SKU</Label>
                                    <Input
                                        value={createForm.sku ?? ""}
                                        onChange={(e) => setCreateForm((f) => ({ ...f, sku: e.target.value }))}
                                        placeholder="e.g. CHK-001"
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <textarea
                                    value={createForm.description ?? ""}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                    placeholder="Product description..."
                                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Image URL</Label>
                                <Input
                                    value={createForm.image ?? ""}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, image: e.target.value }))}
                                    placeholder="https://..."
                                    className="h-10 rounded-xl"
                                />
                            </div>
                            {createMutation.isError && (
                                <p className="text-sm text-destructive">Failed to create product. Please try again.</p>
                            )}
                            <div className="flex gap-2 pt-2">
                                <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={handleCreate}
                                    disabled={createMutation.isPending || !createForm.name}
                                >
                                    {createMutation.isPending ? "Creating..." : "Create Product"}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setCreatingProduct(false)}>Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Package className="h-12 w-12 mb-4" />
                    <p>No products found.</p>
                </div>
            )}
            </>}

            {/* ── Categories Tab ─────────────────────────────────── */}
            {activeTab === "categories" && (
                <Card className="admin-card admin-animate-up">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/40">
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Slug</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Description</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(apiCategories ?? []).map((cat) => (
                                        <tr key={cat.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3 font-medium">{cat.name ?? cat.id}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{cat.slug ?? "—"}</td>
                                            <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{cat.description ?? "—"}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={cat.isActive !== false ? "default" : "destructive"}>
                                                    {cat.isActive !== false ? "Active" : "Inactive"}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => openCatEdit(cat)}>
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleCatDelete(cat.id)}
                                                        disabled={deleteCatMutation.isPending}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!apiCategories || apiCategories.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                                                <Tag className="h-10 w-10 mx-auto mb-3 opacity-40" />
                                                <p>No categories found. {!apiCategories && "(demo data)"}</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Category Create / Edit Modal ──────────────────── */}
            {(creatingCategory || editingCategory) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => { setCreatingCategory(false); setEditingCategory(null); }} />
                    <Card className="admin-card relative z-10 max-w-md w-full animate-fade-in">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{editingCategory ? "Edit Category" : "Add Category"}</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => { setCreatingCategory(false); setEditingCategory(null); }}>✕</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Name *</Label>
                                <Input
                                    value={catForm.name}
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        setCatForm((f) => ({
                                            ...f,
                                            name,
                                            slug: editingCategory ? f.slug : autoSlug(name),
                                        }));
                                    }}
                                    placeholder="e.g. Chicken"
                                    className="h-10 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug</Label>
                                <Input
                                    value={catForm.slug}
                                    onChange={(e) => setCatForm((f) => ({ ...f, slug: e.target.value }))}
                                    placeholder="e.g. chicken"
                                    className="h-10 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <textarea
                                    value={catForm.description}
                                    onChange={(e) => setCatForm((f) => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                    placeholder="Category description..."
                                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none"
                                />
                            </div>
                            {(createCatMutation.isError || updateCatMutation.isError) && (
                                <p className="text-sm text-destructive">Failed to save category. Please try again.</p>
                            )}
                            <div className="flex gap-2 pt-2">
                                <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={handleCatSave}
                                    disabled={createCatMutation.isPending || updateCatMutation.isPending || !catForm.name}
                                >
                                    {(createCatMutation.isPending || updateCatMutation.isPending) ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => { setCreatingCategory(false); setEditingCategory(null); }}>Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
