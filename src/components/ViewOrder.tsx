import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FormattedOrderType } from "@/types/types";
import displayCurrency from "@/utils/displayCurrency";
import { format } from "date-fns";

type Props = {
  order: FormattedOrderType
};

const ViewOrder = ({ order }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className={`px-2 py-1 text-xs font-medium rounded-md border`}>View</button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] lg:max-w-[800px] max-h-[95%] overflow-y-auto scrollbar-rounded">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <Label className="text-gray-500 font-semibold">Plan</Label>
                    <h2 className="font-semibold">{order?.id}</h2>
                </div>

                <div>
                    <Label className="text-gray-500 font-semibold">Plan</Label>
                    <h2 className="font-semibold">{order?.plan?.name}</h2>
                </div>

                <div>
                    <Label className="text-gray-500 font-semibold">Status</Label>
                    <h2 className="font-semibold">{order?.status}</h2>
                </div>

                <div>
                    <Label className="text-gray-500 font-semibold">Total Amount</Label>
                    <h2 className="font-semibold">{displayCurrency(order?.totalAmount, "NGN")}</h2>
                </div>

                <div>
                    <Label className="text-gray-500 font-semibold">Date Created</Label>
                    <h2 className="font-semibold">
                    {order?.createdAt ? format(new Date(order?.createdAt), "dd MMM yyyy") : "N/A"}
                    </h2>
                </div>
            </div>

          <div>
            <Label className="text-gray-500 font-semibold">item{order?.items?.length > 1 ? "s" : ""} ({order?.items?.length}) </Label>
            <div className="space-y-1">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between px-2 py-1 border rounded-md bg-gray-50/10"
                >
                  <span>{item?.name}</span>
                  <span>
                    {item.quantity} x {displayCurrency(item?.unitPrice, "NGN")} ({item?.itemType})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewOrder;