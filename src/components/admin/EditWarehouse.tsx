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
import { useState } from 'react'
import { toast } from 'react-toastify'
import { axiosClient } from '@/GlobalApi'
import { Edit3, Plus } from 'lucide-react'
import z from 'zod'
import { Switch } from '../ui/switch'

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

type WarehouseFormValues = z.infer<typeof warehouseSchema>

const EditWarehouse = ({ warehouse, getWarehouses}: { warehouse: any; getWarehouses: () => void}) => {

    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ 
        name: warehouse?.name || "", 
        street_address: warehouse?.street_address || "",
        apartment_suite: warehouse?.apartment_suite || "",
        city: warehouse?.city || "",
        state: warehouse?.state || "",
        zip_code: warehouse?.zip_code || "",
        country: "Nigeria",
        is_active: warehouse?.is_active
    });
    const [isSavingWarehouse, setIsSavingWarehouse] = useState(false)

    const handleWarehouseEdit = async () => {
            
        const result = warehouseSchema.safeParse(form)
            
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
            setIsSavingWarehouse(true)

            const res = await axiosClient.patch(`/delivery/warehouses/${warehouse?.id}`, form)
            toast.success("Warehouse updated successfully")
            getWarehouses()
            setOpen(false)

        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setIsSavingWarehouse(false)
        }
    };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <form>
        <DialogTrigger asChild>
            <Button
                size="sm"
                variant="outline"
                onClick={() => setOpen(true)}
            >
                <Edit3 className="mr-1 h-3 w-3" />
                Edit
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] max-h-[95%] overflow-y-auto scrollbar-rounded">
            <DialogHeader>
                <DialogTitle>Edit Warehouse</DialogTitle>
                <DialogDescription className="text-gray-500">Update an existing warehouse</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input placeholder="Enter warehouse label" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value})}  className="h-10 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label>State</Label>
                        <Input className="h-10 rounded-xl" value={form.state} onChange={(e: any) => setForm({ ...form, state: e.target.value})}  placeholder="Enter State"/>
                    </div>
                    <div className="space-y-2">
                        <Label>City</Label>
                        <Input className="h-10 rounded-xl" value={form.city} onChange={(e: any) => setForm({ ...form, city: e.target.value})}  placeholder="Enter City"/>
                    </div>
                    <div className="space-y-2">
                        <Label>Zip Code</Label>
                        <Input className="h-10 rounded-xl" value={form.zip_code} onChange={(e: any) => setForm({ ...form, zip_code: e.target.value})}  placeholder="Enter Zip Code"/>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label>Stree Address</Label>
                        <Input placeholder="Enter street address" value={form.street_address} onChange={(e: any) => setForm({ ...form, street_address: e.target.value})}  className="h-10 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label>Appartment Suite</Label>
                        <Input className="h-10 rounded-xl" value={form.apartment_suite} onChange={(e: any) => setForm({ ...form, apartment_suite: e.target.value})}  placeholder="Enter apartment"/>
                    </div>
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
            <DialogFooter className="gap-4">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleWarehouseEdit}
                    disabled={isSavingWarehouse}
                >
                    {isSavingWarehouse ? "Updating..." : "Update Warehouse"}
                </Button>
            </DialogFooter>
        </DialogContent>
        </form>
    </Dialog>
  )
}

export default EditWarehouse
