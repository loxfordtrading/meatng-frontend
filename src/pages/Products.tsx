import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "@/components/products/ProductCard";
import { useProductCatalog } from "@/contexts/ProductCatalogContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "name" | "price-low" | "price-high";

const Products = () => {
  const { products, categories } = useProductCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string | "all">(
    initialCategory || "all"
  );
  const [sortBy, setSortBy] = useState<SortOption>("name");

  const filteredAndSortedProducts = useMemo(() => {
    let filtered =
      selectedCategory === "all"
        ? products
        : products.filter((p) => p.category === selectedCategory);

    switch (sortBy) {
      case "name":
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      case "price-low":
        return [...filtered].sort((a, b) => a.addOnPrice - b.addOnPrice);
      case "price-high":
        return [...filtered].sort((a, b) => b.addOnPrice - a.addOnPrice);
      default:
        return filtered;
    }
  }, [selectedCategory, sortBy]);

  const groupedProducts = useMemo(() => {
    if (selectedCategory !== "all") return [];

    return categories
      .map((category) => ({
        category,
        products: filteredAndSortedProducts.filter((product) => product.category === category.id),
      }))
      .filter((group) => group.products.length > 0);
  }, [selectedCategory, filteredAndSortedProducts]);

  const handleCategoryChange = (category: string | "all") => {
    setSelectedCategory(category);
    if (category === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-secondary py-12">
        <div className="container">
          <h1 className="text-4xl font-display font-bold text-secondary-foreground mb-2">
            Our Products
          </h1>
          <p className="text-secondary-foreground/80">
            Premium quality meats, sourced from trusted Nigerian farms. Shop one-time or add them to a subscription.
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange("all")}
            >
              All Products
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product Listing */}
        {selectedCategory === "all" ? (
          <div className="space-y-10">
            {groupedProducts.map((group) => (
              <section key={group.category.id}>
                <div className="mb-4">
                  <h2 className="text-2xl font-display font-bold">{group.category.name}</h2>
                  <div className="mt-2 h-1 w-14 rounded-full bg-primary/40" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {group.products.map((product) => (
                    <ProductCard key={product.id} product={product} showAddToCart />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} showAddToCart />
            ))}
          </div>
        )}

        {filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
