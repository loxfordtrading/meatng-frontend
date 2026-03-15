import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreatePlanType } from "@/types/admin";
import { axiosClient } from "@/GlobalApi";
import { toast } from "react-toastify";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/lib/routes";

const prefilledItemSchema = z.object({
  product_id: z.string().nonempty("Product is required"),
  name: z.string().nonempty("Name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  weight: z.number().min(0.0001, "Weight must be greater than 0"),
  weight_unit: z.enum(["g", "kg"]),
});

const categoryRuleSchema = z.object({
  category_id: z.string().optional(),
  category_name: z.string().optional(),
  label: z.string().nonempty("Label is required"),
  weight_required: z.number().min(0.0001, "Weight required must be greater than 0"),
  weight_unit: z.enum(["g", "kg"]),
});

const productRuleSchema = z.object({
  product_id: z.string().nonempty("Product is required"),
  product_name: z.string().nonempty("Product name is required"),
  label: z.string().nonempty("Label is required"),
  max_weight: z.number().min(0.0001, "Max weight must be greater than 0"),
  weight_unit: z.enum(["g", "kg"]),
});

export const createPlanSchema = z.object({
  name: z.string().nonempty("Name is required"),
  description: z.string().optional(),
  price: z.number().min(0.01, "Price must be greater than 0"),
  max_items: z.number().min(1, "Max items must be at least 1"),
  weight: z.number().min(0.0001, "Weight must be greater than 0"),
  weight_unit: z.enum(["g", "kg"]),
  temp_image_id: z.string().nonempty("Image is required"),
  is_active: z.boolean(),
  plan_type: z.enum(["standard", "premium", "custom"]),
  pricing_model: z.enum(["fixed", "variable"]),
  category_rules: z.array(categoryRuleSchema).optional(),
  product_rules: z.array(productRuleSchema).optional(),
  prefilled_items: z.array(prefilledItemSchema).optional(),
});

type CreatePlanFormValues = z.infer<typeof createPlanSchema>

export const AddPlan = () => {

  const [file, setFile] = useState<File | null>(null);
  const [imageInfo, setImageInfo] = useState(null)
  const [form, setForm] = useState<CreatePlanType>({
    name: "",
    description: "",
    price: 0,
    max_items: 1,
    weight: 0,
    weight_unit: "kg",
    temp_image_id: imageInfo?.temp_id || "",
    is_active: true,
    plan_type: "standard",
    pricing_model: "fixed",
    category_rules: [],
    product_rules: [],
    prefilled_items: [],
  });
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const navigate = useNavigate()

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
            setForm((f) => ({ ...f, temp_image_id: imagedata.temp_id }));
            toast.success("Image uploaded!");
        } catch (err) {
            toast.error(err.response?.data?.message);
        } finally {
            setIsUploading(false)
        }
    };


    const handleSubmit = async (e: FormEvent) => {

        e.preventDefault()

        const result = createPlanSchema.safeParse(form)

       if (!result.success) {
            const firstError = result.error.errors[0];
            const field = firstError.path.join(".");
            toast.error(`${firstError.message} for input: ${field}`);
            return;
        }

        try {
            setLoading(true);
            const response = await axiosClient.post("/plans",form);

            toast.success("Plan created successfully");
            navigate(ROUTES.adminPlans)

        } catch (err: any) {
            toast.error(err?.response?.data?.message)

        } finally {
            setLoading(false);
        }
    };


  return (
    <div className="space-y-8 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-6 max-w-6xl mx-auto">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Add Plan</h1>
        <p className="text-muted-foreground text-sm">
          Create a subscription plan for customers
        </p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>

        {/* BASIC INFO */}
        <div className="grid gap-4">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                    value={form.name}
                    onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    />
                </div>
                <div className="space-y-2">
                    <Label>Plan Type *</Label>
                    <select
                        value={form.plan_type}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                plan_type: e.target.value as "standard" | "premium" | "custom",
                            }))
                        }
                        className="w-full border rounded-xl px-3 h-10"
                    >
                        <option value="standard">Standard</option>
                        {/* <option value="premium">Premium</option>
                        <option value="custom">Custom</option> */}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label>Pricing Model *</Label>
                    <select
                        value={form.pricing_model}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                pricing_model: e.target.value as "fixed" | "variable",
                            }))
                        }
                        className="w-full border rounded-xl px-3 h-10"
                    >
                    <option value="fixed">Fixed</option>
                    {/* <option value="variable">Variable</option> */}
                    </select>
                </div>
            </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              className="w-full rounded-xl border border-input px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    price: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Weight</Label>
              <Input
                type="number"
                value={form.weight}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    weight: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Weight Unit</Label>
              <select
                value={form.weight_unit}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    weight_unit: e.target.value as "g" | "kg",
                  }))
                }
                className="w-full h-10 rounded-xl border border-input px-3 text-sm"
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
              </select>
            </div>

          </div>

            <div className="space-y-2">
                <Label>Upload plan image</Label>

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
                        setForm((f) => ({
                            ...f,
                            is_active: e.target.value === "active",
                        }))
                        }
                        className="w-full border rounded-xl px-3 h-10"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

            </div>

        </div>

        {/* PREFILLED ITEMS */}
        <div className="space-y-4">

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <Label className="text-base font-semibold">Prefilled Items</Label>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  prefilled_items: [
                    ...f.prefilled_items,
                    {
                      product_id: "",
                      name: "",
                      quantity: 1,
                      weight: 0,
                      weight_unit: "g",
                    },
                  ],
                }))
              }
            >
              Add Item
            </Button>
          </div>

          {form.prefilled_items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
            >

                {/* <select value={item.product_id} onChange={(e) => { const product = products.find((p) => p.id === e.target.value); const updated = [...form.prefilled_items]; updated[index].product_id = product?.id || ""; updated[index].name = product?.name || ""; setForm((f) => ({ ...f, prefilled_items: updated })); }} className="border rounded-xl px-2 h-10" > <option value="">Select Product</option> {products.map((p) => ( <option key={p.id} value={p.id}> {p.name} </option> ))} </select> */}

              <Input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => {
                  const updated = [...form.prefilled_items];
                  updated[index].quantity = Number(e.target.value);
                  setForm((f) => ({ ...f, prefilled_items: updated }));
                }}
              />

              <Input
                type="number"
                placeholder="Weight"
                value={item.weight}
                onChange={(e) => {
                  const updated = [...form.prefilled_items];
                  updated[index].weight = Number(e.target.value);
                  setForm((f) => ({ ...f, prefilled_items: updated }));
                }}
              />

              <select
                value={item.weight_unit}
                onChange={(e) => {
                  const updated = [...form.prefilled_items];
                  updated[index].weight_unit = e.target.value as "g" | "kg";
                  setForm((f) => ({ ...f, prefilled_items: updated }));
                }}
                className="border rounded-xl px-2 h-10"
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
              </select>

              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    prefilled_items: f.prefilled_items.filter((_, i) => i !== index),
                  }))
                }
              >
                Remove
              </Button>

            </div>
          ))}

        </div>

        {/* CATEGORY RULES */}
        <div className="space-y-4">

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <Label className="text-base font-semibold">Category Rules</Label>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  category_rules: [
                    ...f.category_rules,
                    {
                      category_id: "",
                      category_name: "",
                      label: "",
                      weight_required: 0,
                      weight_unit: "g",
                    },
                  ],
                }))
              }
            >
              Add Category Rule
            </Button>
          </div>

          {form.category_rules.map((rule, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
            >

                {/* <select value={rule.category_id} onChange={(e) => { const category = categories.find((c) => c.id === e.target.value); const updated = [...form.category_rules]; updated[index].category_id = category?.id || ""; updated[index].category_name = category?.name || ""; setForm((f) => ({ ...f, category_rules: updated })); }} className="border rounded-xl px-2 h-10" > <option value="">Select Category</option> {categories.map((c) => ( <option key={c.id} value={c.id}> {c.name} </option> ))} </select> */}

              <Input
                placeholder="Label"
                value={rule.label}
                onChange={(e) => {
                  const updated = [...form.category_rules];
                  updated[index].label = e.target.value;
                  setForm((f) => ({ ...f, category_rules: updated }));
                }}
              />

              <Input
                type="number"
                placeholder="Weight Required"
                value={rule.weight_required}
                onChange={(e) => {
                  const updated = [...form.category_rules];
                  updated[index].weight_required = Number(e.target.value);
                  setForm((f) => ({ ...f, category_rules: updated }));
                }}
              />

              <select
                value={rule.weight_unit}
                onChange={(e) => {
                  const updated = [...form.category_rules];
                  updated[index].weight_unit = e.target.value as "g" | "kg";
                  setForm((f) => ({ ...f, category_rules: updated }));
                }}
                className="border rounded-xl px-2 h-10"
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
              </select>

              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    category_rules: f.category_rules.filter((_, i) => i !== index),
                  }))
                }
              >
                Remove
              </Button>

            </div>
          ))}

        </div>

        {/* PRODUCT RULES */}
        <div className="space-y-4">

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <Label className="text-base font-semibold">Product Rules</Label>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  product_rules: [
                    ...f.product_rules,
                    {
                      product_id: "",
                      product_name: "",
                      max_weight: 0,
                      weight_unit: "g",
                      label: "",
                    },
                  ],
                }))
              }
            >
              Add Product Rule
            </Button>
          </div>

          {form.product_rules.map((rule, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
            >

                {/* <select value={rule.product_id} onChange={(e) => { const product = products.find((p) => p.id === e.target.value); const updated = [...form.product_rules]; updated[index].product_id = product?.id || ""; updated[index].product_name = product?.name || ""; setForm((f) => ({ ...f, product_rules: updated })); }} className="border rounded-xl px-2 h-10" > <option value="">Select Product</option> {products.map((p) => ( <option key={p.id} value={p.id}> {p.name} </option> ))} </select> */}

              <Input
                placeholder="Label"
                value={rule.label}
                onChange={(e) => {
                  const updated = [...form.product_rules];
                  updated[index].label = e.target.value;
                  setForm((f) => ({ ...f, product_rules: updated }));
                }}
              />

              <Input
                type="number"
                placeholder="Max Weight"
                value={rule.max_weight}
                onChange={(e) => {
                  const updated = [...form.product_rules];
                  updated[index].max_weight = Number(e.target.value);
                  setForm((f) => ({ ...f, product_rules: updated }));
                }}
              />

              <select
                value={rule.weight_unit}
                onChange={(e) => {
                  const updated = [...form.product_rules];
                  updated[index].weight_unit = e.target.value as "g" | "kg";
                  setForm((f) => ({ ...f, product_rules: updated }));
                }}
                className="border rounded-xl px-2 h-10"
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
              </select>

              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    product_rules: f.product_rules.filter((_, i) => i !== index),
                  }))
                }
              >
                Remove
              </Button>

            </div>
          ))}

        </div>

        {/* SUBMIT */}
        <Button
          type="submit"
          className="w-full h-12 text-base"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Plan"}
        </Button>

      </form>
    </div>
  );
};
