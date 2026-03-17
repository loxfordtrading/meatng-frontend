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
            <DialogTitle>{delivery?.name}</DialogTitle>
          </DialogHeader>
          <div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <h2 className="text-gray-600 font-medium">Description:</h2>
                <h2 className='font-semibold'>{delivery?.description}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Total Weight:</h2>
                  <h2 className='font-semibold'>{delivery?.total_weight}{delivery?.weight_unit}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Prefilled Total Weight:</h2>
                  <h2 className='font-semibold'>{delivery?.prefilled_items_total_weight}{delivery?.weight_unit}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Remaining Weight to fill:</h2>
                  <h2 className='font-semibold'>{delivery?.remaining_weight}{delivery?.weight_unit}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Weight Unit:</h2>
                  <h2 className='font-semibold'>{delivery?.weight_unit}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Price:</h2>
                  <h2 className='font-semibold'>{delivery?.pricing_model === "sum_of_items" ? "-" : displayCurrency(delivery?.price,"NGN")}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Pricing Model:</h2>
                  <h2 className='font-semibold'>{delivery?.pricing_model}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Pricing Model:</h2>
                  <h2 className='font-semibold'>{delivery?.delivery_type}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Status:</h2>
                  <h2 className='font-semibold'>{delivery?.is_active ? "Active" : "Inactive"}</h2>
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
            <div className="mt-4 grid gap-6">
              <div className="grid gap-2">
                <h3 className="font-semibold text-sm">Prefilled Products</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {delivery?.prefilled_items?.map((item) => {

                    return (
                      <div
                        key={item?.product_id}
                        className={`rounded-2xl bdelivery p-4 transition bdelivery-bdelivery`}
                      >
                        <img
                          src={item?.image}
                          alt={item.name}
                          className="mb-3 h-32 w-full rounded-xl object-cover"
                        />
                        <div className="mb-2 flex flex-1 items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">{item?.name}</p>
                            <p className="text-sm font-semibold">Qty: {item?.quantity}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{item?.weight}{item?.weight_unit}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {delivery?.prefilled_items?.length <= 0 && <p className="text-sm text-muted-foreground">No prefilled items added on this delivery.</p>}
                </div>
              </div>
              <div className="grid gap-2">
                <h3 className="font-semibold text-sm">Category Rules</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {delivery?.category_rules?.map((item) => {

                    return (
                      <div
                        key={item?.category_id}
                        className={`rounded-2xl bdelivery p-4 transition bdelivery-bdelivery`}
                      >
                        <div className="mb-2 flex flex-1 items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">customers must choose {item?.weight_required}{item?.weight_unit} in product category <span className='font-bold'>{item?.category_name}</span> for this delivery</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {delivery?.category_rules?.length <= 0 && <p className="text-sm text-muted-foreground">No category rules added on this delivery.</p>}
                </div>
              </div>
              <div className="grid gap-2">
                <h3 className="font-semibold text-sm">Product Rules</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {delivery?.product_rules?.map((item) => {

                    return (
                      <div
                        key={item?.product_id}
                        className={`rounded-2xl bdelivery p-4 transition bdelivery-bdelivery`}
                      >
                        <div className="mb-2 flex flex-1 items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">customers must choose {item?.max_weight}{item?.weight_unit} of <span className='font-bold'>{item?.product_name}</span> for this delivery</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {delivery?.product_rules?.length <= 0 && <p className="text-sm text-muted-foreground">No Product rules added on this delivery.</p>}
                </div>
              </div>
              <div className="grid gap-2">
                <h3 className="font-semibold text-sm">Highlights</h3>
                <div className="grid gap-2">
                  {delivery?.highlights?.map((highlight, index) => {

                    return (
                      <div
                        key={index}
                        className={`transition`}
                      >
                        <p className="text-sm font-medium">{highlight}</p>
                      </div>
                    );
                  })}
                  {delivery?.highlights?.length <= 0 && <p className="text-sm text-muted-foreground">No Highlights was added on this delivery.</p>}
                </div>
              </div>
              <div className="grid gap-2">
                <h3 className="font-semibold text-sm">Plan Thumbnail</h3>
                <div className='max-w-80'>
                  <img
                    src={delivery?.image}
                    alt={delivery?.name}
                    className="mb-3 h-48 w-full rounded-xl object-cover"
                  />
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