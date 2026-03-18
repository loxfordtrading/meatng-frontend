import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Snowflake, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/products/ProductCard";
import { formatPrice } from "@/data/products";
import { useProductCatalog } from "@/contexts/ProductCatalogContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { ROUTES } from "@/lib/routes";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const subscription = useSubscription();
  const cart = useCart();
  const { getProductById, getProductsByCategory, categories } = useProductCatalog();

  const product = id ? getProductById(id) : undefined;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button asChild>
            <Link to={ROUTES.plans}>View Plans</Link>
          </Button>
        </div>
      </div>
    );
  }

  const relatedProducts = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);
  const categoryLabel = categories.find((category) => category.id === product.category)?.name ?? product.category;

  const handleAddToBox = () => {
    if (!subscription.state.plan) {
      toast({
        title: "No plan selected",
        description: "Please select a subscription plan first.",
        variant: "destructive",
      });
      return;
    }
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
      description: `${product.name} has been added to your box.`,
    });
  };

  const currentQuantity = subscription.state.boxItems.find(
    (item) => item.productId === product.id
  )?.quantity || 0;

  const isEligible = product.eligiblePlans.includes(subscription.state.plan || "value-pack");

  const handleAddToCart = () => {
    cart.addProduct(product, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} added for one-time purchase.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Breadcrumb */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to={subscription.state.plan ? ROUTES.buildBox : ROUTES.plans}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {subscription.state.plan ? "Back to Box Builder" : "View Plans"}
          </Link>
        </Button>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={product?.image}
                alt={product?.name}
                className="h-full w-full object-contain bg-white p-3"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-2 uppercase">
                {categoryLabel}
              </Badge>
              {product.isPremiumDrop && (
                <Badge className="ml-2 bg-accent text-accent-foreground">Premium Only</Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-display font-bold mt-2">
                {product.name}
              </h1>
              <p className="text-muted-foreground mt-1">{product.packSize}</p>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Best For */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 flex items-start gap-3">
                <ChefHat className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Best For</h4>
                  <p className="text-sm text-muted-foreground">{product.bestFor.join(", ")}</p>
                </div>
              </CardContent>
            </Card>

            {/* Storage Info */}
            <Card className="bg-muted/50">
              <CardContent className="p-4 flex items-start gap-3">
                <Snowflake className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Storage Guidance</h4>
                  <p className="text-sm text-muted-foreground">{product.storageGuidance}</p>
                </div>
              </CardContent>
            </Card>

            {/* Plan Eligibility */}
            <div className="p-4 rounded-lg border border-border">
              <h4 className="font-semibold mb-2">Available in plans:</h4>
              <div className="flex flex-wrap gap-2">
                {product.eligiblePlans.map((plan) => (
                  <Badge key={plan} variant="secondary" className="capitalize">
                    {plan}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Add to Box */}
            {subscription.state.plan && (
              <div className="space-y-3">
                {currentQuantity > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Currently in your box: {currentQuantity}
                  </p>
                )}
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={handleAddToBox}
                    disabled={!isEligible || subscription.isBoxFull}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Box
                  </Button>
                  <Button variant="outline" size="lg" asChild className="flex-1">
                    <Link to={ROUTES.buildBox}>View My Box</Link>
                  </Button>
                </div>
                {!isEligible && (
                  <p className="text-sm text-destructive">
                    This product is not available on your current plan. 
                    <Link to={ROUTES.plans} className="underline ml-1">Upgrade your plan</Link>
                  </p>
                )}
              </div>
            )}

            {!subscription.state.plan && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button size="lg" onClick={handleAddToCart}>
                  <Plus className="mr-2 h-4 w-4" />
                  Buy One-time
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to={ROUTES.plans}>Start Subscription</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-display font-bold mb-6">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} showAddToCart />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
