import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { CustomerType, GiftboxType, PlanType } from '@/types/admin'
import displayCurrency from '@/utils/displayCurrency'
import { format } from 'date-fns'
import { Card } from '../ui/card'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { axiosClient } from '@/GlobalApi'

export const ViewCustomer = ({customer, getCustomers }: { customer: CustomerType, getCustomers: () => void}) => {

  const [deactivatingCustomerId, setDeactivatingCustomerId] = useState<string | null>(null);
  const [open, setOpen] = useState(false); 

  const handleActivationstatus = async (id: string, status: string) => {
    if (!confirm(`${status === "deactivate" ? "Deactivate" : "Activate"} this customer?`)) return;

    try {
      setDeactivatingCustomerId(id);

      await axiosClient.patch(`/users/${status}-user/${id}`);

      toast.success(`Customer ${status}d successfully`);

      getCustomers();

      setOpen(false);

    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    } finally {
      setDeactivatingCustomerId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div>
        <DialogTrigger as-child>
          <Button variant="outline" size="sm">
            View
          </Button>
        </DialogTrigger>
        <DialogContent className="lg:max-w-[1024px] max-h-[95%] bg-white overflow-y-auto scrollbar-rounded">
          <DialogHeader>
            <DialogTitle>{customer?.first_name} {customer?.last_name}</DialogTitle>
          </DialogHeader>
          <div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">first Name:</h2>
                  <h2 className='font-semibold'>{customer?.first_name}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Last Name:</h2>
                  <h2 className='font-semibold'>{customer?.last_name}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Display Name:</h2>
                  <h2 className='font-semibold'>{customer?.display_name}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Email:</h2>
                  <h2 className='font-semibold'>{customer?.email}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Phone no:</h2>
                  <h2 className='font-semibold'>{customer?.phone}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Role:</h2>
                  <h2 className='font-semibold'>{customer?.role}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Email Verified:</h2>
                  <h2 className='font-semibold'>{customer?.is_email_verified ? "Yes" : "No"}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Status:</h2>
                  <h2 className='font-semibold'>{customer?.is_active ? "Active" : "Inactive"}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Is deleted:</h2>
                  <h2 className='font-semibold'>{customer?.is_deleted ? "Yes" : "No"}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Total orders:</h2>
                  <h2 className='font-semibold'>{customer?.total_orders}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Total spent:</h2>
                  <h2 className='font-semibold'>{displayCurrency(customer?.total_spent, "NGN")}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Plan Name:</h2>
                  <h2 className='font-semibold'>{customer?.plan_name}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Subscription status:</h2>
                  <h2 className='font-semibold'>{customer?.subscription_status}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Next delivery date:</h2>
                  <h2 className='font-semibold'>{customer?.next_delivery_date ? format(new Date(customer?.next_delivery_date), "dd MMM yyyy") : "N/A"}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Member status:</h2>
                  <h2 className='font-semibold'>{customer?.member_status}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Member since:</h2>
                  <h2 className='font-semibold'>{customer?.member_since? format(new Date(customer?.member_since), "dd MMM yyyy") : "N/A"}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Date created:</h2>
                  <h2 className='font-semibold'>{customer?.createdAt ? format(new Date(customer?.createdAt), "dd MMM yyyy") : "N/A"}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Last Updated:</h2>
                  <h2 className='font-semibold'>{customer?.updatedAt ? format(new Date(customer?.updatedAt), "dd MMM yyyy") : "N/A"}</h2>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-4">
            {customer?.is_active ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline" className="text-destructive hover:text-destructive"
                  onClick={() => handleActivationstatus(customer.id, "deactivate")}
                  disabled={deactivatingCustomerId === customer?.id}
                >
                  {deactivatingCustomerId === customer?.id ? "Deactivating..." : "Deactivate"}
                </Button>
                <DialogClose>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline" className="text-destructive hover:text-destructive"
                  onClick={() => handleActivationstatus(customer.id, "activate")}
                  disabled={deactivatingCustomerId === customer?.id}
                >
                  {deactivatingCustomerId === customer?.id ? "Activating..." : "Activate"}
                </Button>
                <DialogClose>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </div>
  </Dialog>
  )
}