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

const feeSchema = z.object({
  name: z.string().min(1, "Fee name is required"),
  rate_per_km: z.string().min(1, "Delivery rate (fee) is required"),
  is_active: z.boolean()
});

type FeeFormValues = z.infer<typeof feeSchema>

const EditDeliveryFee = ({ delivery, getFees}: { delivery: any; getFees: () => void}) => {

    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ 
      name: delivery.name || '',
      rate_per_km: String(delivery.rate_per_km || ''),
      is_active: delivery.is_active
    });
    const [isSavingFee, setIsSavingFee] = useState(false)

    const handleFeeEdit = async () => {
            
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
            setIsSavingFee(true)

            const newForm = {
                name: form.name,
                rate_per_km: Number(form.rate_per_km),
                is_active: form.is_active
            };

            const res = await axiosClient.patch(`/delivery/pricing/${delivery?.id}`, newForm)
            toast.success("Fee updated successfully")
            getFees()
            setOpen(false)
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setIsSavingFee(false)
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
                <DialogTitle>Edit Delivery Fee</DialogTitle>
                <DialogDescription className="text-gray-500">Update an existing delivery fee</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
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
            <DialogFooter className="gap-4">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleFeeEdit}
                    disabled={isSavingFee}
                >
                    {isSavingFee ? "Updating..." : "Update Fee"}
                </Button>
            </DialogFooter>
        </DialogContent>
        </form>
    </Dialog>
  )
}

export default EditDeliveryFee
