import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { axiosClient } from '@/GlobalApi'
import { Plus } from 'lucide-react'


interface UiProduct {
    id: string;
    name: string;
    image: string;
    slug: string;
    mainValue: number;
    unit: string;
    packSize: number;
    category: string;
    categoryId?: string;
    addOnPrice: number;
    isPremiumDrop: boolean;
    description: string;
    isActive: boolean;
    sku?: string;
    stock?: number;
}

const AddProduct = ({ categories, getProducts}: {categories: any; getProducts: () => void}) => {

    const [open, setOpen] = useState(false);
    const [createForm, setCreateForm] = useState<Partial<UiProduct>>({});
    const [addingProduct, setAddingProduct] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [imageInfo, setImageInfo] = useState(null)

    const autoSlug = (name: string) =>
    name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") 
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    useEffect(() => {
        if (createForm.name) {
            setCreateForm(f => ({ ...f, slug: autoSlug(f.name) }));
        }
    }, [createForm.name]);

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

            const result = await axiosClient.post("/upload?type=PRODUCT", formData)
            const imagedata = {
                url: result.data?.data?.attributes?.url,
                temp_id: result.data?.data?.attributes?.temp_id
            }
            setImageInfo(imagedata)
            toast.success("Image uploaded!");
        } catch (err) {
            toast.error(err.response?.data?.message);
        } finally {
            setIsUploading(false)
        }
    };

      const handleCreate = async () => {
        if (!createForm.name || !createForm.categoryId || !createForm.packSize || !createForm.addOnPrice || !createForm.unit) {
            toast.error("Some fields are missing");
            return;
        }

        if (!imageInfo) {
            toast.error("Upload an image");
            return;
        }

        try {
            setAddingProduct(true)

            const payload = {
                name: createForm.name,
                slug: createForm.slug,
                price: createForm.addOnPrice,
                isBestSeller: false,
                displayType: "total_weight",
                mainValue: createForm.packSize,
                unit: createForm.unit,
                stockQuantity: createForm.stock,
                description: createForm.description,
                categories: [createForm.categoryId],
                temp_id: imageInfo?.temp_id
            };

            const response = await axiosClient.post("/products",payload);

            toast.success("Product created successfully");
            setOpen(false);
            getProducts()
        } catch (error: any) {
            toast.error(error.response?.data?.message);
        } finally {
            setAddingProduct(false)
        }
    };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <form>
        <DialogTrigger asChild>
            <Button size="sm" onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-3.5 w-3.5" /> Add Product
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[95%] overflow-y-auto scrollbar-rounded">
            <DialogHeader>
                <DialogTitle>Add Product</DialogTitle>
                <DialogDescription className="text-gray-300">Create a new product</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
                <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                        value={createForm.name || ""}
                        onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Whole Chicken"
                        className="h-10 rounded-xl"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input
                        value={createForm.slug}
                        onChange={(e) => setCreateForm((f) => ({ ...f, slug: autoSlug(e.target.value) }))}
                        placeholder="e.g. chicken"
                        className="h-10 rounded-xl"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <select
                            value={createForm.categoryId || ""}
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
                            type="number"
                            value={createForm.packSize ?? ""}
                            onChange={(e) => setCreateForm((f) => ({ ...f, packSize: parseInt(e.target.value) || 0 }))}
                            placeholder="3"
                            className="h-10 rounded-xl"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Unit</Label>
                        <select
                            value={createForm.unit || ""}
                            onChange={(e) => setCreateForm((f) => ({ ...f, unit: e.target.value }))}
                            className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm"
                        >
                            <option value="g">Select unit</option>
                            <option value="g">g (grams)</option>
                            <option value="kg">kg (kilograms)</option>
                        </select>
                    </div>
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
                    <Label>Upload product image</Label>

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
                <div className="space-y-2">
                    <Label>Image URL {imageInfo?.temp_id && `(id: ${imageInfo?.temp_id})`}</Label>
                    <Input
                        value={imageInfo?.url || ""}
                        placeholder="https://..."
                        className="h-10 rounded-xl"
                        disabled
                        readOnly
                    />
                </div>
                {/* {createMutation.isError && (
                    <p className="text-sm text-destructive">Failed to create product. Please try again.</p>
                )} */}
            </div>
            <DialogFooter className="gap-4">
                <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleCreate}
                    disabled={addingProduct || !createForm.name}
                >
                    {addingProduct ? "Creating..." : "Create Product"}
                </Button>
            </DialogFooter>
        </DialogContent>
        </form>
    </Dialog>
  )
}

export default AddProduct
