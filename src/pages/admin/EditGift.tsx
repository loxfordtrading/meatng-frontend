import { FormEvent, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { axiosClient } from "@/GlobalApi";
import { toast } from "react-toastify";
import { z } from "zod";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import { SetProduct } from "@/components/admin/SetProduct";
import { paginationType, ProductType } from "@/types/admin";
import { LoadingData } from "@/components/LoadingData";

const giftboxSchema = z.object({
  name: z.string().nonempty("Name is required"),
  description: z.string().optional(),
  price: z.number().min(0.01, "Price must be greater than 0"),
  weight: z.number().min(0.0001, "Weight must be greater than 0"),
  weight_unit: z.enum(["g", "kg"]),
  temp_id: z.string().optional(),
  is_active: z.boolean(),
  products: z
    .array(
      z.object({
        product_id: z.string().nonempty("Product is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one product is required"),
});

export const EditGift = () => {

  const { giftId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    weight: 0,
    weight_unit: "kg" as "g" | "kg",
    temp_id: "",
    is_active: true,
    products: [] as { product_id: string; name?: string; quantity: number }[],
  });

  const [search, setSearch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true)
    const [products, setProducts] = useState<ProductType[]>([])
    const [categories, setCategories] = useState([]);
    const [meta, setMeta] = useState<paginationType | null>(null);
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get("page")) || 1;
    const activeCategory = searchParams.get("slug") || "all";

    useEffect(() => {
        if (giftId) {
           getGiftbox();
        }
    }, [giftId]);

    const getGiftbox = async () => {
        try {
            setLoading(true);

            const res = await axiosClient.get(`/giftboxes/${giftId}`);

            const data = res.data?.data;
            const attributes = data?.attributes;

            const formattedProducts =
            attributes?.products?.map((item: any) => ({
                product_id: item.product_id?.id || item.product_id?._id || "",
                name: item.product_id?.name || "",
                quantity: item.quantity || 1,
            })) || [];

            setForm({
                name: attributes?.name || "",
                description: attributes?.description || "",
                price: attributes?.price || 0,
                weight: attributes?.weight || 0,
                weight_unit: attributes?.weight_unit || "kg",
                temp_id: attributes?.temp_id || "",
                is_active: attributes?.is_active ?? true,
                products: formattedProducts,
            });

            setImageInfo({
                url: attributes?.image,
                temp_id: attributes?.temp_id || "",
            });

            setPreview(attributes?.image);
        } catch (err: any) {
            toast.error(err?.response?.data?.message);
        } finally {
            setLoading(false);
        }
        };

    const handleFile = (selected: File) => {
        setFile(selected);
        const reader = new FileReader();
        reader.onloadend = () => {
        setPreview(reader.result as string);
        };
        reader.readAsDataURL(selected);
    };

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        handleFile(e.target.files[0]);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!e.dataTransfer.files) return;
        handleFile(e.dataTransfer.files[0]);
    };

  const handleUpload = async () => {
        if (!file) return;

        try {
            setIsUploading(true)
            const formData = new FormData();
            formData.append("image", file);

            const result = await axiosClient.post("/upload?type=BOX", formData)
            const imagedata = {
                url: result.data?.data?.attributes?.url,
                temp_id: result.data?.data?.attributes?.temp_id
            }
            setImageInfo(imagedata)
            setForm((f) => ({ ...f, temp_id: imagedata.temp_id }));
            toast.success("Image uploaded!");
        } catch (err) {
            toast.error(err.response?.data?.message);
        } finally {
            setIsUploading(false)
        }
    };

  const getProducts = async () => {
        try {
            setLoadingProducts(true);
        
            let url = `/products?page=${currentPage}&limit=28`;
        
            if (activeCategory && activeCategory !== "all") {
                url += `&slug=${activeCategory}`;
            }
            
            if (debouncedSearch) {
                url += `&search=${debouncedSearch}`;
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

        } catch (err) {
            toast.error(err.response?.data?.message);
        } finally {
            setLoadingProducts(false);
        }
    };

  useEffect(() => {
    getProducts();
  }, []);

    const handleSubmit = async (e: FormEvent) => {
  
        e.preventDefault()
  
        const result = giftboxSchema.safeParse(form);

        if (!result.success) {
            toast.error(result.error.errors[0].message);
            return;
        }
  
        try {
            setIsUpdating(true);

            const { temp_id, ...rest } = form;

            const payload = {
                ...rest,
                products: form.products.map(({ product_id, quantity }) => ({
                    product_id,
                    quantity,
                })),
            };
            
            const response = await axiosClient.put(`/giftboxes/${giftId}`, payload);

            toast.success("Gift Box updated successfully");
            navigate(ROUTES.adminGifts)

        } catch (err: any) {
            const message = err?.response?.data?.message;

            if (Array.isArray(message)) {
                message.forEach((msg, i) => toast.error(msg));
            } else {
                toast.error(message);
            }

        } finally {
            setIsUpdating(false);
        }
      };

    if (loading) {
        return (
            <LoadingData/>
        );
    }
      
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Edit Gift Box</h1>
        <p className="text-muted-foreground text-sm">
          Edit a gift box for customers
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BASIC */}
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <textarea
              className="w-full border rounded p-2"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label>Price</Label>
                <Input
                    type="number"
                    placeholder="Price"
                    value={form.price}
                    onChange={(e) =>
                        setForm({ ...form, price: Number(e.target.value) })
                    }
                />
            </div>

            <div className="space-y-2">
                <Label>Weight</Label>
                <Input
                    type="number"
                    placeholder="Weight"
                    value={form.weight}
                    onChange={(e) =>
                        setForm({ ...form, weight: Number(e.target.value) })
                    }
                />
            </div>

            <div className="space-y-2">
                <Label>Weight Unit</Label>
                <select
                    value={form.weight_unit}
                    onChange={(e) =>
                        setForm({
                        ...form,
                        weight_unit: e.target.value as "g" | "kg",
                        })
                    }
                    className="w-full border rounded-xl px-3 h-10"
                >
                <option value="g">g</option>
                <option value="kg">kg</option>
                </select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
            <Label>Upload gift image</Label>

            <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50"
            >

                {/* TOP RIGHT BUTTONS */}
                {preview && (
                    <div className="absolute top-2 right-2 flex gap-2">
                        <label
                        htmlFor="imageUpload"
                        className="bg-white px-2 py-1 text-xs rounded shadow cursor-pointer"
                        >
                        Change
                        </label>

                        <button
                            onClick={handleUpload}
                            className="bg-green-600 text-white px-2 py-1 text-xs rounded shadow"
                            disabled={isUploading}
                        >
                            {isUploading ? "Uploading..." : "Upload"}
                        </button>
                    </div>
                )}

                {preview ? (
                <img
                    src={preview}
                    className="mx-auto h-40 object-contain rounded-lg"
                />
                ) : (
                <label htmlFor="imageUpload" className="space-y-2 block">
                    <p className="text-sm text-gray-600">
                    Click to Upload image
                    </p>
                    <p className="text-xs text-gray-400">
                    Max Size ≤ 5MB
                    </p>
                </label>
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                    id="imageUpload"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
                <Label>Image URL</Label>
                <Input
                    value={imageInfo?.url}
                    placeholder="https://..."
                    className="h-10 rounded-xl"
                    disabled
                    readOnly
                />
            </div>

            <div className="space-y-2">
                <Label>Status</Label>
                <select
                    value={form.is_active ? "active" : "inactive"}
                    onChange={(e) =>
                        setForm({ ...form, is_active: e.target.value === "active" })
                    }
                    className="w-full border rounded-xl px-3 h-10"
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
        </div>


        {/* PRODUCTS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Products</Label>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  products: [...f.products, { product_id: "", quantity: 1 }],
                }))
              }
            >
              Add
            </Button>
          </div>

            {form.products.map((item, index) => (
                <div key={index}>
                    <h2 className="text-sm text-primary font-semibold mb-2">
                        {item?.name || "No product selected"}
                    </h2>
                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end"
                    >
                        <div className="space-y-1">
                            <Label className="text-xs">Select</Label>
                            <SetProduct
                                meta={meta}
                                products={products}
                                loading={loadingProducts}
                                addProduct={(p) => {
                                    const updated = [...form.products];
                                    updated[index] = {
                                        ...updated[index],
                                        product_id: p.id,
                                        name: p.name,
                                    };
                                    setForm({ ...form, products: updated });
                                }}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Quantity</Label>
                            <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                const updated = [...form.products];
                                updated[index].quantity = Number(e.target.value);
                                setForm({ ...form, products: updated });
                                }}
                            />
                        </div>

                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() =>
                            setForm({
                                ...form,
                                products: form.products.filter((_, i) => i !== index),
                            })
                            }
                        >
                            Remove
                        </Button>
                    </div>
                </div>
            ))}
        </div>

        <Button type="submit" disabled={isUpdating} className="w-full">
          {isUpdating ? "Updating..." : "Update Gift Box"}
        </Button>
      </form>
    </div>
  );
};