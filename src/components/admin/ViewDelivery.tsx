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
import { DeliveryType, OrderType, PlanType } from '@/types/admin'
import displayCurrency from '@/utils/displayCurrency'
import { format } from 'date-fns'
import { Card } from '../ui/card'
import { Eye } from 'lucide-react'

export const ViewDelivery = ({ delivery}: { delivery: DeliveryType}) => {
  return (
    <Dialog>
      <div>
        <DialogTrigger as-child>
          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg bdelivery bdelivery-bdelivery/70 p-0">
              <Eye className="h-3.5 w-3.5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="lg:max-w-[1024px] max-h-[95%] bg-white overflow-y-auto scrollbar-rounded">
          <DialogHeader>
            <DialogTitle>Order ID: {delivery?.order_id}</DialogTitle>
          </DialogHeader>
          <div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <h2 className="text-gray-600 font-medium">First Name:</h2>
                <h2 className='font-semibold'>{delivery?.first_name}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Last Name:</h2>
                  <h2 className='font-semibold'>{delivery?.last_name}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Email:</h2>
                  <h2 className='font-semibold'>{delivery?.email}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Phone no:</h2>
                  <h2 className='font-semibold'>{delivery?.phone_number}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">State:</h2>
                  <h2 className='font-semibold'>{delivery?.state}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">City:</h2>
                  <h2 className='font-semibold'>{delivery?.city}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Street Address:</h2>
                  <h2 className='font-semibold'>{delivery?.street_address}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Apartment Suite:</h2>
                  <h2 className='font-semibold'>{delivery?.apartment_suite}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Country:</h2>
                  <h2 className='font-semibold'>{delivery?.country}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Zip Code:</h2>
                  <h2 className='font-semibold'>{delivery?.zip_code}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Status:</h2>
                  <h2 className='font-semibold'>{delivery?.status}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Delivery Fee:</h2>
                  <h2 className='font-semibold'>{displayCurrency(delivery?.delivery_fee, "NGN")}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Delivery Note:</h2>
                  <h2 className='font-semibold'>{delivery?.delivery_note}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Delivery Distance (km):</h2>
                  <h2 className='font-semibold'>{delivery?.delivery_distance_km}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Latitude:</h2>
                  <h2 className='font-semibold'>{delivery?.customer_latitude}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Longitude:</h2>
                  <h2 className='font-semibold'>{delivery?.customer_longitude}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Date created:</h2>
                  <h2 className='font-semibold'>{delivery?.createdAt ? format(new Date(delivery?.createdAt), "dd MMM yyyy") : "N/A"}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Last Updated:</h2>
                  <h2 className='font-semibold'>{delivery?.updatedAt ? format(new Date(delivery?.updatedAt), "dd MMM yyyy") : "N/A"}</h2>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-4">
            <DialogClose>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </div>
  </Dialog>
  )
}