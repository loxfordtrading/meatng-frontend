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
import { GiftboxType } from '@/types/admin'
import displayCurrency from '@/utils/displayCurrency'
import { format } from 'date-fns'

export const ViewGift = ({giftbox}: {giftbox: GiftboxType}) => {
  return (
    <Dialog>
      <div>
        <DialogTrigger as-child>
          <Button variant="outline" size="sm">
            View
          </Button>
        </DialogTrigger>
        <DialogContent className="lg:max-w-[1024px] max-h-[95%] bg-white overflow-y-auto scrollbar-rounded">
          <DialogHeader>
            <DialogTitle>{giftbox?.name}</DialogTitle>
          </DialogHeader>
          <div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Description:</h2>
                  <h2 className='font-semibold'>{giftbox?.description}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Weight:</h2>
                  <h2 className='font-semibold'>{giftbox?.weight}{giftbox?.weight_unit}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Weight Unit:</h2>
                  <h2 className='font-semibold'>{giftbox?.weight_unit}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Status:</h2>
                  <h2 className='font-semibold'>{giftbox?.is_active ? "Active" : "Inactive"}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Date created:</h2>
                  <h2 className='font-semibold'>{giftbox?.createdAt ? format(new Date(giftbox?.createdAt), "dd MMM yyyy") : "N/A"}</h2>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-gray-600 font-medium">Last Updated:</h2>
                  <h2 className='font-semibold'>{giftbox?.updatedAt ? format(new Date(giftbox?.updatedAt), "dd MMM yyyy") : "N/A"}</h2>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-6">
              <div className="grid gap-2">
                <h3 className="font-semibold text-sm">Gift Products</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {giftbox?.products?.map((item) => {

                    return (
                      <div
                        key={item?.product_id?.id}
                        className={`rounded-2xl border p-4 transition border-border`}
                      >
                        {/* <img
                          src={item?.image}
                          alt={item.name}
                          className="mb-3 h-32 w-full rounded-xl object-cover"
                        /> */}
                        <div className="mb-2 flex flex-1 items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">{item?.product_id?.name}</p>
                            <p className="text-sm font-semibold">{displayCurrency(item?.product_id?.price, "NGN")}</p>
                            <p className="text-sm font-semibold">{item?.product_id?.formattedWeight}</p>
                            <p className="text-sm font-semibold">Qty: {item?.quantity}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {giftbox?.products?.length <= 0 && <p className="text-sm text-muted-foreground">No product added on this giftbox.</p>}
                </div>
              </div>
              <div className="grid gap-2">
                <h3 className="font-semibold text-sm">Gift Thumbnail</h3>
                <div className='max-w-80'>
                  <img
                    src={giftbox?.image}
                    alt={giftbox?.name}
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