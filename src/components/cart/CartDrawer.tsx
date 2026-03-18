import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/data/products";
import { ROUTES } from "@/lib/routes";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FREE_DELIVERY_THRESHOLD = 50000;

const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const deliveryProgress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-primary text-xl font-display">YOUR CART</SheetTitle>
        </SheetHeader>

{/*        
        <div className="py-4 border-b">
          <Progress value={deliveryProgress} className="h-2 mb-2" />
        {amountToFreeDelivery > 0 ? (
            <p className="text-sm text-center text-primary">
              You are <span className="font-bold">{formatPrice(amountToFreeDelivery)}</span> away from Free Delivery
            </p>
          ) : (
            <p className="text-sm text-center font-medium text-primary">
              🎉 You qualify for Free Delivery!
            </p>
          )}
          <p className="text-xs text-center text-muted-foreground mt-1">
            Spend {formatPrice(FREE_DELIVERY_THRESHOLD)} or more for free delivery!
          </p>
        </div> */}

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button asChild className="mt-4" onClick={() => onOpenChange(false)}>
                <Link to={ROUTES.products}>Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                  <img
                    src={item?.image}
                    alt={item?.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                    {item.type !== "product" && (
                      <p className="text-xs text-muted-foreground">{item.type === "gift-box" ? "Gift Box" : "Add-on"}</p>
                    )}
                    {item.type === "gift-box" && item.giftDetails?.recipientName && (
                      <p className="text-xs text-muted-foreground">For {item.giftDetails.recipientName}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded bg-background border hover:bg-muted transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded bg-background border hover:bg-muted transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart footer */}
        {items.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
              <span className="font-bold text-lg">{formatPrice(subtotal)}</span>
            </div>
            <Button
              asChild
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
              onClick={() => onOpenChange(false)}
            >
              <Link to={ROUTES.checkout}>Checkout</Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
