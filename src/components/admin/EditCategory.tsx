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
import { Dispatch, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { axiosClient } from '@/GlobalApi'
import { Edit3, Plus } from 'lucide-react'

const EditCategory = ({ category, setGetCategory, getProducts}: {category: any; setGetCategory: Dispatch<React.SetStateAction<boolean>>; getProducts: () => void}) => {

    const [open, setOpen] = useState(false);
    const [catForm, setCatForm] = useState<{ name: string; slug: string; description: string }>({ 
        name: category?.name || "", 
        slug: category?.slug || "", 
        description: category?.description || ""
    });
    const [isSavingCategory, setIsSavingCategory] = useState(false)

    const autoSlug = (name: string) =>
    name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") 
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    const handleCatEdit = async () => {
        if (!catForm.name) return;

        try {
            setGetCategory(true)
            setIsSavingCategory(true)
            const res = await axiosClient.put(`/product-categories/${category?.id}`, catForm)
            toast.success("Category updated successfully")
            getProducts()
            setOpen(false)
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setIsSavingCategory(false)
            setGetCategory(false)
        }
    };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <form>
        <DialogTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
                <Edit3 className="h-3.5 w-3.5" />
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] max-h-[95%] overflow-y-auto scrollbar-rounded">
            <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription className="text-gray-500">Edit an existing category</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
                <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                        value={catForm.name}
                        onChange={(e) => {
                            const name = e.target.value;
                            setCatForm((f) => ({
                                ...f,
                                name,
                                // slug: editingCategory ? f.slug : autoSlug(name),
                                slug: autoSlug(name),
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
                        onChange={(e) => setCatForm((f) => ({ ...f, slug: autoSlug(e.target.value) }))}
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
            </div>
            <DialogFooter className="gap-4">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleCatEdit}
                    disabled={isSavingCategory || !catForm.name}
                >
                    {isSavingCategory ? "Updating..." : "Update Category"}
                </Button>
            </DialogFooter>
        </DialogContent>
        </form>
    </Dialog>
  )
}

export default EditCategory
