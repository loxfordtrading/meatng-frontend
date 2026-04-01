import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, PackagePlus, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import displayCurrency from "@/utils/displayCurrency";
import { useCartStore } from "@/store/cartStore";
import { useAddonStore } from "@/store/addonStore";

export default function Addons({ products}: {products: any}) {

  const { addonItems, addAddon, setAddonQty, totalAddonItems } = useAddonStore();

  const total = totalAddonItems();

  // const cantAdd = total >= products?.max_items;
  // const cantIncrease = total >= products?.max_items;

  return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {products.map((item) => {

            const cartItem = addonItems.find((i) => i.id === item.id);
            const qty = cartItem?.qty || 0;

            return (
              <div
                key={item?.name}
                className={`rounded-2xl border p-4 transition ${
                  qty > 0 ? "border-primary/40 bg-primary/[0.03] ring-1 ring-primary/20" : "border-border"
                }
                `}
              >
                <img
                  src={item?.image}
                  alt={item.name}
                  className="mb-3 h-32 w-full rounded-xl object-cover"
                />
                <div className="mb-2 flex flex-1 items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{item?.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{item?.weight}{item?.weight_unit}</span>
                      <Badge variant="secondary" className={`px-1.5 py-0 text-[10px]}`}>
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-primary">{displayCurrency(item.price, "NGN")}</p>
                </div>

                {qty === 0 ? (
                  <Button size="sm" variant="outline" className="mt-1 w-full" disabled={item?.stock <= 0 || !item?.isActive} onClick={() => addAddon(item, 1, "addon")}>
                    <Plus className="mr-1 h-3 w-3" /> Add
                  </Button>
                ) : (
                  <div className="mt-1 flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setAddonQty(item, qty - 1)}>
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="flex-1 text-center text-sm font-semibold">{qty}</span>
                    <Button size="sm" className="h-8 w-8 p-0" disabled={item?.stock <= 0 || !item?.isActive} onClick={() => setAddonQty(item, qty + 1)}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
  );
}