import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import QuantitySelector from "@/components/products/QuantitySelector";
import ProductCard from "@/components/products/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, products } from "@/data/products";

const Cart = () => {
  const {
    items,
    subtotal,
    removeItem,
    updateQuantity,
  } = useCart();

  // Get first 4 products as recommendations
  const recommendedProducts = products.slice(0, 4);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-16">
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-display font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Add products for a one-time order or start a subscription to build a recurring box.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {/* <Button asChild size="lg">
                <Link to="/products">
                  Shop Products <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button> */}
              <Button asChild size="lg" variant="outline">
                <Link to="/plans">Start Subscription</Link>
              </Button>
            </div>
          </div>

          {/* Recommendations */}
          <section className="mt-16">
            <h2 className="text-2xl font-display font-bold mb-6 text-center">
              Popular Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-secondary py-8">
        <div className="container">
          <h1 className="text-3xl font-display font-bold text-secondary-foreground">
            Shopping Cart
          </h1>
          <p className="text-secondary-foreground/80 mt-1">
            Gift boxes and add-on purchases
          </p>
        </div>
      </div>

      <div className="container py-6 sm:py-8 pb-28 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/plans">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Start a Subscription
              </Link>
            </Button>

            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item?.image}
                        alt={item?.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {item.type.replace("-", " ")}
                          </p>
                          {item.type === "gift-box" && item.giftDetails?.recipientName && (
                            <p className="text-xs text-muted-foreground mt-1">
                              For {item.giftDetails.recipientName}
                              {item.giftDetails.occasion ? ` • ${item.giftDetails.occasion}` : ""}
                            </p>
                          )}
                          {item.type === "gift-box" && item.giftDetails?.preferredDeliveryDate && (
                            <p className="text-xs text-muted-foreground">
                              Preferred delivery: {item.giftDetails.preferredDeliveryDate}
                              {item.giftDetails.preferredDeliveryWindow ? ` (${item.giftDetails.preferredDeliveryWindow})` : ""}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <QuantitySelector
                          quantity={item.quantity}
                          onQuantityChange={(q) => updateQuantity(item.id, q)}
                        />
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary (hidden on mobile, sticky bottom bar shown instead) */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-xl font-display font-bold">Order Summary</h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-muted-foreground">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(subtotal)}</span>
                  </div>
                </div>

                <Button size="lg" className="w-full" asChild>
                  <Link to="/checkout">
                    Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommendations */}
        <section className="mt-16">
          <h2 className="text-2xl font-display font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur-lg p-4 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</p>
            <p className="text-lg font-bold text-primary">{formatPrice(subtotal)}</p>
          </div>
          <Button size="lg" asChild className="flex-1 max-w-[200px]">
            <Link to="/checkout">
              Checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
