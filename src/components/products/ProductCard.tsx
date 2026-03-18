import { Link } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "@/hooks/use-toast";
import { formatPrice } from "@/data/plans";

interface ProductCardProps {
  product: Product;
  showAddToBox?: boolean;
  showAddToCart?: boolean;
}

const ProductCard = ({ product, showAddToBox = false, showAddToCart = false }: ProductCardProps) => {
  const subscription = useSubscription();
  const cart = useCart();
  const categoryLabel = product.category.replace(/-/g, " ");

  const handleAddToBox = () => {
    if (subscription.isBoxFull) {
      toast({
        title: "Box is full",
        description: "Your box is full — remove an item to make room.",
        variant: "destructive",
      });
      return;
    }
    subscription.addBoxItem({
      productId: product.id,
      name: product.name,
      category: product.category,
      weightG: product.weightG,
      price: product.addOnPrice,
      quantity: 1,
    });
    toast({
      title: "Added to box",
      description: `${product.name} added to your box.`,
    });
  };

  const currentQuantity = subscription.state.boxItems.find(
    (item) => item.productId === product.id
  )?.quantity || 0;

  const handleRemoveFromBox = () => {
    if (currentQuantity <= 0) return;
    subscription.removeBoxItem(product.id);
    toast({
      title: "Removed from box",
      description: `${product.name} removed from your box.`,
    });
  };

  const handleAddToCart = () => {
    cart.addProduct(product, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} added for one-time purchase.`,
    });
  };

  const cartItemId = `product-${product.id}`;
  const currentCartQuantity = cart.items.find((item) => item.id === cartItemId)?.quantity || 0;

  const handleRemoveFromCart = () => {
    if (currentCartQuantity <= 0) return;
    cart.updateQuantity(cartItemId, currentCartQuantity - 1);
    toast({
      title: "Removed from cart",
      description: `${product.name} removed from one-time cart.`,
    });
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg border border-border/80 bg-card">
      <div className="relative aspect-square w-full overflow-hidden bg-muted/30 p-3">
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.isPremiumDrop && (
            <Badge className="bg-accent text-accent-foreground font-semibold">Premium</Badge>
          )}
        </div>

        <Link to={`/product/${product.id}`}>
          <img
            src={product?.image}
            alt={product?.name}
            className="h-full w-full rounded-md object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>

      <CardContent className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-card-foreground mb-1 line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          {categoryLabel}
        </p>

        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{product.packSize}</p>
          <p className="text-sm font-semibold text-primary">{formatPrice(product.addOnPrice)}</p>
        </div>

        <div className="flex items-center justify-between">
          {(showAddToBox || showAddToCart) && (
            <div className="flex items-center gap-2 flex-wrap">
              {showAddToBox && currentQuantity > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {currentQuantity} in box
                </Badge>
              )}
              {showAddToBox && currentQuantity > 0 && (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleRemoveFromBox}
                  className="h-9 w-9 rounded-xl border-primary text-destructive hover:text-destructive"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
              {showAddToBox && (
                <Button
                  size="sm"
                  onClick={handleAddToBox}
                  disabled={subscription.isBoxFull && currentQuantity === 0}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              )}
              {showAddToCart && (
                <>
                  {currentCartQuantity > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {currentCartQuantity} in cart
                    </Badge>
                  )}
                  {currentCartQuantity > 0 && (
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleRemoveFromCart}
                      className="h-9 w-9 rounded-xl text-destructive hover:text-destructive"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={handleAddToCart}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
