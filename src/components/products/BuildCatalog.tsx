import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, PackagePlus, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import displayCurrency from "@/utils/displayCurrency";
import { useCartStore } from "@/store/cartStore";
import { formatWeight, toGrams } from "@/utils/conversion";
import { useSubscriptionStore } from "@/store/subscriptionStore";

const CATEGORY_COLORS = [
  "bg-red-100 text-red-700",
  "bg-green-100 text-green-700",
  "bg-blue-100 text-blue-700",
  "bg-yellow-100 text-yellow-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
];
      
export default function BuildCatalog({ products}: {products: any}) {

  const { items, add, setQty, totalItems, totalGramWeight } = useCartStore();
  const { subInfo } = useSubscriptionStore();
  const total = totalItems();
  const totalGransInCart = totalGramWeight()

  const remainingWeightG = toGrams(subInfo?.subscription?.attributes?.remaining_weight, subInfo?.subscription?.attributes?.weight_unit as "kg" | "g")

  const progress = remainingWeightG
  ? (totalGransInCart / remainingWeightG) * 100
  : 0;

  // const cantAdd = total >= products?.max_items;
  // const cantIncrease = total >= products?.max_items;

  const categoryColorMap = (() => {
    const map: Record<string, string> = {};
    let colorIndex = 0;

    products.forEach((item: any) => {
      if (!map[item.category]) {
        map[item.category] =
          CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length];
        colorIndex++;
      }
    });

    return map;
  })();

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardContent className="p-4 sm:p-6">
        {/* <div className="mb-1 flex items-center gap-2">
          <PackagePlus className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-bold sm:text-xl">Build Your Box</h2>
        </div> */}
        {subInfo?.subscription?.attributes?.category_rules?.[0]?.category_name ? (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <PackagePlus className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground">Choose Your Offals</h2>
              <Badge variant={totalGransInCart < remainingWeightG  ? "outline" : "default"} className={`ml-auto text-xs ${totalGransInCart === remainingWeightG? "bg-green-600" : "border-amber-400 text-amber-600"}`}>
                {totalGransInCart == remainingWeightG
                  ? "Complete!"
                  : `${formatWeight(totalGransInCart)} / ${formatWeight(remainingWeightG)}`}
              </Badge>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              Choose your offals and mix until <span className="font-semibold text-foreground">{formatWeight(remainingWeightG)}</span> is filled.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-1 flex flex-col md:flex-row items-start justify-between gap-2">
              <div className="flex items-center gap-1">
                <PackagePlus className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-bold sm:text-xl">Build Your Box</h2>
              </div>
              <Badge variant={totalGransInCart < remainingWeightG  ? "outline" : "default"} className={`ml-auto text-xs ${totalGransInCart === remainingWeightG? "bg-green-600" : "border-amber-400 text-amber-600"}`}>
                {totalGransInCart == remainingWeightG
                  ? "Complete!"
                  : `${formatWeight(totalGransInCart)} / ${formatWeight(remainingWeightG)}`}
              </Badge>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Fill the remaining <span className="font-semibold text-foreground">{formatWeight(remainingWeightG)}</span> from this catalog.
            </p>
          </div>
        )}

        <div className="mb-5 rounded-xl border bg-muted/30 p-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold">
              {formatWeight(totalGransInCart)} / {formatWeight(remainingWeightG)} filled
            </span>
            <span className={products?.max_items <= 0 ? "font-semibold text-green-600" : "text-muted-foreground"}>
              {totalGransInCart < remainingWeightG ? `${formatWeight(remainingWeightG - totalGransInCart)} left` : "Complete!"}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {products.map((item) => {

            const cartItem = items.find((i) => i.id === item.id);
            const qty = cartItem?.qty || 0;

            return (
              <div
                key={item.id}
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
                    <p className="text-sm font-semibold">{item.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{item?.weight}{item?.weight_unit}</span>
                      <Badge variant="secondary" className={`px-1.5 py-0 text-[10px] ${categoryColorMap[item.category]}`}>
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-primary">{displayCurrency(item.price, "NGN")}</p>
                </div>

                {qty === 0 ? (
                  <Button size="sm" variant="outline" className="mt-1 w-full" disabled={item?.stock <= 0 || !item?.isActive} onClick={() => add(item, 1, "base")}>
                    <Plus className="mr-1 h-3 w-3" /> Add
                  </Button>
                ) : (
                  <div className="mt-1 flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setQty(item, qty - 1)}>
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="flex-1 text-center text-sm font-semibold">{qty}</span>
                    <Button size="sm" className={`h-8 w-8 p-0 ${(totalGransInCart === remainingWeightG) && "opacity-50 cursor-not-allowed"}`} onClick={() => setQty(item, qty + 1)} disabled={item?.stock <= 0 || !item?.isActive}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
          {products?.length <= 0 && <p className="text-sm text-muted-foreground">No product found.</p>}
        </div>
      </CardContent>
    </Card>
  );
}