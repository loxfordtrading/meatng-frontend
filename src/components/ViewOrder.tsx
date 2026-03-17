// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { FormattedOrderType } from "@/types/types";
// import displayCurrency from "@/utils/displayCurrency";
// import { format } from "date-fns";

// type Props = {
//   order: FormattedOrderType
// };

// const ViewOrder = ({ order }: Props) => {
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <button className={`px-2 py-1 text-xs font-medium rounded-md border`}>View</button>
//       </DialogTrigger>

//       <DialogContent className="sm:max-w-[425px] lg:max-w-[900px] max-h-[95%] overflow-y-auto scrollbar-rounded">
//         <DialogHeader>
//           <DialogTitle>Order Details</DialogTitle>
//         </DialogHeader>

//         <div className="grid gap-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 <div>
//                     <Label className="text-gray-500 font-semibold">Plan</Label>
//                     <h2 className="font-semibold">{order?.id}</h2>
//                 </div>

//                 <div>
//                     <Label className="text-gray-500 font-semibold">Plan</Label>
//                     <h2 className="font-semibold">{order?.plan?.name}</h2>
//                 </div>

//                 <div>
//                     <Label className="text-gray-500 font-semibold">Status</Label>
//                     <h2 className="font-semibold">{order?.status}</h2>
//                 </div>

//                 <div>
//                     <Label className="text-gray-500 font-semibold">Total Amount</Label>
//                     <h2 className="font-semibold">{displayCurrency(order?.totalAmount, "NGN")}</h2>
//                 </div>

//                 <div>
//                     <Label className="text-gray-500 font-semibold">Date Created</Label>
//                     <h2 className="font-semibold">
//                     {order?.createdAt ? format(new Date(order?.createdAt), "dd MMM yyyy") : "N/A"}
//                     </h2>
//                 </div>
//             </div>

//           <div>
//             <Label className="text-lg font-semibold">item{order?.items?.length > 1 ? "s" : ""} ({order?.items?.length}) </Label>
//             <div className="space-y-1 mt-2">
//               <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
//                   {order?.items?.map((item) => {

//                     return (
//                       <div
//                         key={item?.productId}
//                         className={`rounded-2xl border p-4 transition border-border`}
//                       >
//                         <img
//                           src={item?.image_url}
//                           alt={item.name}
//                           className="mb-3 h-32 w-full rounded-xl object-cover"
//                         />
//                         <div className="mb-2 flex flex-1 items-start justify-between gap-2">
//                           <div>
//                             <p className="text-sm font-semibold">{item?.name}</p>
//                             <p className="text-sm font-semibold">{displayCurrency(item?.unitPrice, "NGN")}</p>
//                             <p className="text-sm font-semibold">{item?.itemType}</p>
//                             {item?.isPrefilled && <p className="text-sm font-semibold">Prefilled</p>}
//                             {/* <p className="text-sm font-semibold">{item?.product_id?.formattedWeight}</p> */}
//                             <p className="text-sm font-semibold">Qty: {item?.quantity}</p>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                   {order?.items?.length <= 0 && <p className="text-sm text-muted-foreground">No product added on this plan.</p>}
//                 </div>
//               {/* {order.items.map((item, idx) => (
//                 <div
//                   key={idx}
//                   className="flex justify-between px-2 py-1 border rounded-md bg-gray-50/10"
//                 >
//                   <span>{item?.name}</span>
//                   <span>
//                     {item.quantity} x {displayCurrency(item?.unitPrice, "NGN")} ({item?.itemType})
//                   </span>
//                 </div>
//               ))} */}
//             </div>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default ViewOrder;

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
import { OrderType, PlanType } from '@/types/admin'
import { FormattedOrderType } from '@/types/types'
import displayCurrency from '@/utils/displayCurrency'
import { format } from 'date-fns'
import { Eye } from 'lucide-react'

export const ViewOrder = ({order}: {order: FormattedOrderType }) => {
  return (
    <Dialog>
      <div>
        <DialogTrigger as-child>
          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg border border-border/70 p-0">
              <Eye className="h-3.5 w-3.5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="lg:max-w-[1024px] max-h-[95%] bg-white overflow-y-auto scrollbar-rounded">
          <DialogHeader>
            <DialogTitle>Order Type: {order?.order_type}</DialogTitle>
          </DialogHeader>
          <div className='space-y-6'>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Plan:</h2>
                  <h2 className='font-semibold'>{order?.plan?.name}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Plan ID:</h2>
                  <h2 className='font-semibold'>{order?.plan_id}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Gift Box ID:</h2>
                  <h2 className='font-semibold'>{order?.gift_box_id}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">is Gift:</h2>
                  <h2 className='font-semibold'>{order?.is_gift ? "True" : "False"}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Delivery Fee:</h2>
                  <h2 className='font-semibold'>{displayCurrency(order?.delivery_fee, "NGN")}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Total Ampunt:</h2>
                  <h2 className='font-semibold'>{displayCurrency(order?.total_amount, "NGN")}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Status:</h2>
                  <h2 className='font-semibold'>{order?.status}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Date created:</h2>
                  <h2 className='font-semibold'>{order?.createdAt ? format(new Date(order?.createdAt), "dd MMM yyyy") : "N/A"}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Last Updated:</h2>
                  <h2 className='font-semibold'>{order?.updatedAt ? format(new Date(order?.updatedAt), "dd MMM yyyy") : "N/A"}</h2>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-6">
              <div className="grid gap-2">
                <h3 className="font-semibold text-lg">Products</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {order?.items?.map((item) => {

                    return (
                      <div
                        key={item?.product_id}
                        className={`rounded-2xl border p-4 transition border-border`}
                      >
                        <img
                          src={item?.image_url}
                          alt={item.name}
                          className="mb-3 h-32 w-full rounded-xl object-cover"
                        />
                        <div className="mb-2 flex flex-1 items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">{item?.name}</p>
                            <p className="text-sm font-semibold">item type: {item?.item_type}</p>
                            <p className="text-sm font-semibold">{item?.weight}{item?.weight_unit}</p>
                            {item?.is_prefilled && <p className="text-sm font-semibold text-primary">Prefilled</p>}
                            <p className="text-sm font-semibold">{displayCurrency(item?.unit_price, "NGN")}</p>
                            <p className="text-sm font-semibold">Qty: {item?.quantity}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {order?.items?.length <= 0 && <p className="text-sm text-muted-foreground">No prefilled items added on this order.</p>}
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Gift Information</h3>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Gift Box Name:</h2>
                    <h2 className='font-semibold'>{order?.giftBoxDetails?.name}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Price:</h2>
                    <h2 className='font-semibold'>{displayCurrency(order?.giftBoxDetails?.price)}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Status:</h2>
                    <h2 className='font-semibold'>{order?.giftBoxDetails?.is_active ? "Active" : "Inactive"}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Sender Name:</h2>
                    <h2 className='font-semibold'>{order?.giftFormDetails?.sender_name}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Sender Email:</h2>
                    <h2 className='font-semibold'>{order?.giftFormDetails?.sender_email}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Recipient Name:</h2>
                    <h2 className='font-semibold'>{order?.giftFormDetails?.recipient_name}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Recipient Phone no:</h2>
                    <h2 className='font-semibold'>{order?.giftFormDetails?.recipient_phone}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Occasion:</h2>
                    <h2 className='font-semibold'>{order?.giftFormDetails?.occasion}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Delivery Date:</h2>
                    <h2 className='font-semibold'>{order?.giftFormDetails?.delivery_date ? format(new Date(order?.giftFormDetails?.delivery_date), "dd MMM yyyy") : "N/A"}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Delivery Window:</h2>
                    <h2 className='font-semibold'>{order?.giftFormDetails?.delivery_window_label}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Status:</h2>
                    <h2 className='font-semibold'>{order?.giftFormDetails?.status}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Order ID:</h2>
                    <h2 className='font-semibold'>{order?.giftFormDetails?.order_id}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">message:</h2>
                    <h2 className='font-semibold'>{order?.giftFormDetails?.message ? order?.giftFormDetails?.message : "None"}</h2>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Delivery Address</h3>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Name:</h2>
                    <h2 className='font-semibold'>{order?.delivery_address_snapshot?.first_name} {order?.delivery_address_snapshot?.last_name}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Email:</h2>
                    <h2 className='font-semibold'>{order?.delivery_address_snapshot?.email}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Phone no:</h2>
                    <h2 className='font-semibold'>{order?.delivery_address_snapshot?.phone}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Apartment Suite:</h2>
                    <h2 className='font-semibold'>{order?.delivery_address_snapshot?.apartment_suite}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Street Address:</h2>
                    <h2 className='font-semibold'>{order?.delivery_address_snapshot?.street_address}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">City:</h2>
                    <h2 className='font-semibold'>{order?.delivery_address_snapshot?.city}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">State:</h2>
                    <h2 className='font-semibold'>{order?.delivery_address_snapshot?.state}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Zip code:</h2>
                    <h2 className='font-semibold'>{order?.delivery_address_snapshot?.zip_code}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Delivery Note:</h2>
                    <h2 className='font-semibold'>{order?.delivery_note}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Country:</h2>
                    <h2 className='font-semibold'>{order?.delivery_address_snapshot?.country}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Delivery Didtance (km):</h2>
                    <h2 className='font-semibold'>{order?.delivery_distance_km}km</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Latitude:</h2>
                    <h2 className='font-semibold'>{order?.delivery_address_snapshot?.latitude}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Longitude:</h2>
                    <h2 className='font-semibold'>{order?.delivery_address_snapshot?.longitude}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Address Type:</h2>
                    <h2 className='font-semibold'>{order?.delivery_address_snapshot?.address_type}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Address Label:</h2>
                    <h2 className='font-semibold'>{order?.delivery_address_snapshot?.label}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Delivery Date:</h2>
                    <h2 className='font-semibold'>{order?.delivery_date ? format(new Date(order?.delivery_date), "dd MMM yyyy") : "N/A"}</h2>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-gray-600 font-medium">Delivery Window:</h2>
                    <h2 className='font-semibold'>{order?.delivery_window_label}</h2>
                  </div>
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