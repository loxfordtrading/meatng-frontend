import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Edit3, Trash2, Grid3X3, List, Package, Loader2, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { axiosClient } from "@/GlobalApi";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { paginationType, ProductType } from "@/types/admin";
import displayCurrency from "@/utils/displayCurrency";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";
import AddProduct from "@/components/admin/AddProduct";
import EditProduct from "@/components/admin/EditProduct";
import AddCategory from "@/components/admin/AddCategory";
import EditCategory from "@/components/admin/EditCategory";

interface UiProduct {
    id: string;
    name: string;
    image: string;
    slug: string;
    mainValue: number;
    unit: string;
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

const AdminProducts = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const initialSearch = searchParams.get("search") || "";
    const [search, setSearch] = useState(initialSearch);
    const [createForm, setCreateForm] = useState<Partial<UiProduct>>({});
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [activeTab, setActiveTab] = useState<"products" | "categories">("products");

    const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
    const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
    const [disablingId, setDisablingId] = useState<string | null>(null);
    const [categories, setCategories] = useState([]);
    const [getCategory, setGetCategory] = useState(true)
    const [loadingProducts, setLoadingProducts] = useState(true)
    const [products, setProducts] = useState<ProductType[]>([])
    const [meta, setMeta] = useState<paginationType | null>(null);
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    const currentPage = Number(searchParams.get("page")) || 1;
    const activeCategory = searchParams.get("categorySlug") || "all";

    const handleActive = async (id: string) => {
        try {
            setDisablingId(id);

            const product = products.find((p) => p.id === id);
            if (!product) return;

            if (product.isActive) {
                await axiosClient.post(`/products/${id}/deactivate`);
                toast.success("Product deactivated")
            } else {
                await axiosClient.post(`/products/${id}/activate`);
                toast.success("Product activated")
            }

            getProducts()
        } catch (error) {
            console.error(error);
        } finally {
            setDisablingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this product? This cannot be undone.")) return;
        try {
            setDeletingProductId(id);
            const res = await axiosClient.delete(`/products/${id}`)
            toast.success("Product deleted successfully")
            getProducts()
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setDeletingProductId(null);
        }
    };

    useEffect(() => {
        if (createForm.name) {
            setCreateForm(f => ({ ...f, slug: autoSlug(f.name) }));
        }
    }, [createForm.name]);

    const handleCatDelete = async (id: string) => {
        if (!confirm("Delete this category? Products in it will lose their category.")) return;
        try {
            setGetCategory(true)
            setDeletingCategoryId(id);
            const res = await axiosClient.delete(`/product-categories/${id}`)
            toast.success("Category deleted successfully")
            getProducts()
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setDeletingCategoryId(null);
            setGetCategory(false)
        }
    };

    const autoSlug = (name: string) =>
    name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") 
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    const changePage = (page: number) => {
        setSearchParams({
            page: page.toString(),
            categorySlug: activeCategory,
        });
    };

    useEffect(() => {
        const params: any = { page: "1" };

        if (activeCategory && activeCategory !== "all") {
            params.categorySlug = activeCategory;
        }

        if (debouncedSearch) {
            params.search = debouncedSearch;
        }

        setSearchParams(params);
    }, [debouncedSearch]);

    const changeCategory = (category: string) => {
        if (category === "all") {
            // reset to fetch all products
            setSearchParams({ page: "1" });
        } else {
            setSearchParams({ page: "1", categorySlug: category });
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        getProducts();
    }, [currentPage, activeCategory, debouncedSearch]);

      const getProducts = async () => {
        try {
            setLoadingProducts(true);
        
            let url = `/products?page=${currentPage}&limit=28`;
        
            if (activeCategory && activeCategory !== "all") {
                url += `&categorySlug=${activeCategory}`;
            }
            
            if (debouncedSearch) {
                url += `&search=${encodeURIComponent(debouncedSearch)}`;
            }

            const res = await axiosClient.get(url);

            const productInfo = res.data.data || []
    
            const formattedProducts = productInfo.map((item: any) => ({
                id: item.id,
                name: item.attributes.name,
                nameSlug: item.attributes.slug,
                description: item.attributes.description,
                status: item.attributes.status,
                isActive: item.attributes.is_active,
                image: item.attributes.image,
                sku: item.attributes.sku,
                isBestSelling: item.attributes.isBestSeller,
                displayType: item.attributes.displayType,
                price: item.attributes.price,
                weight: item.attributes.mainValue,
                weight_unit: item.attributes.unit,
                formatted_weight: item.attributes.formattedWeight,
                categoryId: item.relationships?.categoryDetails?.data?.[0]?.id || "other",
                category: item.relationships?.categoryDetails?.data?.[0]?.attributes?.name || "other",
                categorySlug: item.relationships?.categoryDetails?.data?.[0]?.attributes?.slug || "other",
                stock: item.attributes.stockQuantity,
            }));
    
            setProducts(formattedProducts);
            setMeta(res.data.meta);  

            if(getCategory){
                const res = await axiosClient.get("/product-categories/root");

                const catInfo = res.data.data || []

                const formattedCategories = catInfo.map((item: any) => ({
                    id: item.id,
                    name: item.attributes.name,
                    slug: item.attributes.slug,
                    description: item.attributes.description,
                    status: item.attributes.status,
                    isActive: item.attributes.is_active,
                }));

                setCategories(formattedCategories);
                setGetCategory(false)
            }

        } catch (err) {
          toast.error(err.response?.data?.message);
        } finally {
          setLoadingProducts(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Product Catalog</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {products?.length} products across {categories?.length} categories
                    </p>
                </div>
                {activeTab === "products" ? (
                    <AddProduct categories={categories} getProducts={getProducts}/>
                ) : (
                    <AddCategory setGetCategory={setGetCategory} getProducts={getProducts}/>
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

            {/* Filters */}
            {activeTab === "products" && (
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="pl-9 h-10 rounded-xl" />
                    </div>
                    <select
                        value={activeCategory}
                        onChange={(e) => changeCategory(e.target.value)}
                        className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-medium"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((c) => (
                            <option key={c?.id} value={c?.slug}>{c?.name}</option>
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
            )}

            {loadingProducts ? (
                <div className="flex items-center justify-center py-24 admin-page-bg rounded-3xl">
                    <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    {/* UI products and categories */}
                    {activeTab === "products" && <>

                        {/* Grid View */}
                        {viewMode === "grid" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {products?.map((product) => (
                                    <Card key={product?.id} className="admin-card overflow-hidden group transition-all">
                                        <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                                            <img src={product?.image} alt={product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            {product?.isBestSelling && (
                                                <Badge className="absolute top-2 left-2 bg-amber-500 text-white border-0">Best selling</Badge>
                                            )}
                                            {product?.stock <= 0 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="text-white font-bold">Out of Stock</span>
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-4">
                                            <p className="font-semibold text-sm truncate">{product?.name}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{product?.formatted_weight} • {product?.category}</p>
                                            <p className="text-sm font-bold text-primary mt-2">{displayCurrency(product?.price, "NGN")}</p>
                                            <Badge variant={product.isActive ? "default" : "destructive"}>
                                                {product?.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                            <div className="flex gap-1.5 mt-3">
                                                <EditProduct categories={categories} product={product} type="grid" getProducts={getProducts}/>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs"
                                                    onClick={() => handleActive(product?.id)}
                                                    disabled={disablingId === product?.id}
                                                >
                                                    {disablingId === product?.id
                                                        ? product.isActive
                                                        ? "Disabling..."
                                                        : "Enabling..."
                                                        : product.isActive
                                                        ? "Disable"
                                                        : "Enable"}
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
                                                {products.map((product) => (
                                                    <tr key={product.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <img src={product?.image} alt={product?.name} className="h-10 w-10 rounded-lg object-cover" />
                                                                <div>
                                                                    <p className="font-medium">{product?.name}</p>
                                                                    {product?.isBestSelling && <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/20 text-[10px]">Best selling</Badge>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 capitalize text-muted-foreground">{product?.category}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">{product?.formatted_weight}</td>
                                                        <td className="px-4 py-3 font-semibold">{displayCurrency(product.price, "NGN")}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">{product?.stock <= 0 ? "Out of stock" : "In stock"}</td>
                                                        <td className="px-4 py-3">
                                                            <Badge variant={product.isActive ? "default" : "destructive"}>
                                                                {product?.isActive ? "Active" : "Inactive"}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex gap-1">
                                                                <EditProduct categories={categories} product={product} type="list" getProducts={getProducts}/>
                                                                <Button variant="ghost" size="sm" onClick={() => handleActive(product?.id)} disabled={disablingId === product?.id}>
                                                                    {disablingId === product?.id
                                                                        ? product.isActive
                                                                        ? "Disabling..."
                                                                        : "Enabling..."
                                                                        : product.isActive
                                                                        ? "Disable"
                                                                        : "Enable"
                                                                    }
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-destructive hover:text-destructive"
                                                                    onClick={() => handleDelete(product?.id)}
                                                                    disabled={deletingProductId === product?.id}
                                                                >
                                                                    {deletingProductId === product?.id ? (
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
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {meta?.totalPages > 1 && !loadingProducts && products?.length > 0 && (
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

                        {products?.length <= 0 && (
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
                                            {categories?.map((cat) => (
                                                <tr key={cat?.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                                    <td className="px-4 py-3 font-medium">{cat?.name}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{cat?.slug ?? "—"}</td>
                                                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{cat?.description ?? "—"}</td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant={cat?.isActive ? "default" : "destructive"}>
                                                            {cat?.isActive ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-1">
                                                            <EditCategory category={cat} setGetCategory={setGetCategory} getProducts={getProducts}/>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() => handleCatDelete(cat?.id)}
                                                                disabled={deletingCategoryId === cat?.id}
                                                            >
                                                                {deletingCategoryId === cat?.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                                ) : (
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(categories.length <= 0) && !loadingProducts && (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                                                        <Tag className="h-10 w-10 mx-auto mb-3 opacity-40" />
                                                        <p>No categories found.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminProducts;
