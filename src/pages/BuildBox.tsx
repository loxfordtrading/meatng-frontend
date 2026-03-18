import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams} from "react-router-dom";
import { ArrowLeft, Lock, Minus, PackagePlus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/lib/routes";
import { axiosClient } from "@/GlobalApi";
import displayCurrency from "@/utils/displayCurrency";
import BuildCatalog from "@/components/products/BuildCatalog";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useCartStore } from "@/store/cartStore";
import { formatWeight, toGrams } from "@/utils/conversion";
import { LoadingData } from "@/components/LoadingData";
import Skeleton from "@/components/Skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";
import { ProductType } from "@/types/admin";

// const PRODUCT_IMAGES: Record<string, string> = {
//   "Boneless Beef": "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200",
//   "Bone-in Beef": "https://images.unsplash.com/photo-1588347818036-558601350947?w=200",
//   "Bone in Beef": "https://images.unsplash.com/photo-1588347818036-558601350947?w=200",
//   "Agemawo (Beef + Skin)": "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=200",
//   "Plain Beef": "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200",
//   "Torso Beef": "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200",
//   "Minced Meat": "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200",
//   Shin: "https://images.unsplash.com/photo-1588347818036-558601350947?w=200",
//   "Whole Chicken": "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=200",
//   Breast: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=200",
//   Thigh: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=200",
//   Drumstick: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=200",
//   Wings: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=200",
//   "Minced Chicken": "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=200",
//   Gizzard: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=200",
//   "Cut 4": "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=200",
//   "Laps (Thigh & Drumstick)": "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=200",
//   Sausages: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=200",
//   Liver: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200",
//   "Cow Skin (Ponmo)": "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200",
//   "Ponmo (White & Brown)": "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200",
//   Shaki: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200",
//   Roundabout: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200",
//   "Roundabout (Small Intestine)": "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200",
//   Lungs: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200",
//   "Fuku (Lungs)": "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200",
//   Abodi: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200",
//   "Abodi (Large Intestine)": "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200",
//   "Cow Leg": "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200",
//   Kidney: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200",
//   "Tail (Oxtail)": "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200",
//   Tongue: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200",
// };

// const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
//   beef: { label: "Beef", color: "bg-red-100 text-red-700" },
//   chicken: { label: "Chicken", color: "bg-amber-100 text-amber-700" },
//   offals: { label: "Offals", color: "bg-violet-100 text-violet-700" },
// };

const BuildBox = () => {

  const { subInfo } = useSubscriptionStore();
  const { items, totalItems, totalGramWeight } = useCartStore();
  const storePlan = {
    id: subInfo?.subscription?.id,
    name: subInfo?.subscription?.attributes.name,
    description: subInfo?.subscription?.attributes.description,
    price: subInfo?.subscription?.attributes.price,
    max_items: subInfo?.subscription?.attributes.max_items,
    weight: subInfo?.subscription?.attributes.weight,
    weight_unit: subInfo?.subscription?.attributes.weight_unit,
    categoryRules: subInfo?.subscription?.attributes.category_rules,
    image: subInfo?.subscription?.attributes.image,
    prefilled_items: subInfo?.subscription?.attributes.prefilled_items
  };
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductType[]>([])
  const [categories, setCategories] = useState([]);
  const [plan, setPlan] = useState(storePlan || null)
  // const [activeCategory, setActiveCategory] = useState("all")
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingPlan, setLoadingPlan] = useState(true)
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const activeCategory = searchParams.get("slug") || "all";
  const [totalPages, setTotalPages] = useState(1);

  const categoryId = searchParams.get("categoryId");
  
  if (!subInfo?.subscription || !subInfo?.selectedFrequency) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Please complete previous steps</h1>
          <Button asChild>
            <Link to={ROUTES.plans}>Start Over</Link>
          </Button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!subInfo) {
      navigate(ROUTES.plans, { replace: true });
    }
  }, [subInfo, navigate]);

  const changePage = (page: number) => {
    setSearchParams({
      page: page.toString(),
      slug: activeCategory,
    });
  };

  const changeCategory = (category: string) => {
    if (category === "all") {
      // reset to fetch all products
      setSearchParams({ page: "1" });
    } else {
      setSearchParams({ page: "1", slug: category });
    }
  };

   const totalGransInCart = totalGramWeight()

    const mainWeightG = toGrams(
      subInfo?.subscription?.attributes?.weight ?? 0,
      subInfo?.subscription?.attributes?.weight_unit as "kg" | "g"
    );
    
    const prefilledWeightG = toGrams(subInfo?.subscription?.attributes?.prefilled_items_total_weight, subInfo?.subscription?.attributes?.weight_unit as "kg" | "g")
    const totalFilled = prefilledWeightG + totalGransInCart
    
    const remainingWeightG = toGrams(subInfo?.subscription?.attributes?.remaining_weight, subInfo?.subscription?.attributes?.weight_unit as "kg" | "g")

    const progress = mainWeightG
    ? (totalFilled / mainWeightG) * 100
    : 0;

    const buildProgress = remainingWeightG
    ? (totalGransInCart / remainingWeightG) * 100
    : 0;
    
    let error = "";
    
    if (totalGransInCart !== remainingWeightG) {
      const remainingWeight = remainingWeightG - totalGransInCart;
  
      error = `Fill remaining ${formatWeight(remainingWeight)} of ${formatWeight(remainingWeightG)} to continue`;
    }

  const location = useLocation();

  // Parse query params
  const params = new URLSearchParams(location.search);
  const planId = params.get("planId") || subInfo?.subscription?.id;

  useEffect(() => {
    getProducts();
  }, [currentPage, activeCategory]);

  useEffect(() => {
    const loadData = async () => {

      await Promise.all([
        getCategories(),
        getPlan(),
      ]);

      setLoading(false);
    };

    if (planId) {
      loadData();
    }else{
      navigate(ROUTES.plans, { replace: true })
    }
  }, [planId]);

  const getProducts = async () => {
    try {
      setLoadingProducts(true);

      let url = `/products?page=${currentPage}&limit=30`;

      if (activeCategory && activeCategory !== "all") {
        url += `&slug=${activeCategory}`;
      }

      if (categoryId) {
        url += `&categoryId=${categoryId}`;
      }

      const res = await axiosClient.get(url);

      const productInfo = res.data.data || []

      const formattedProducts = productInfo.map((item: any) => ({
        id: item.id,
        name: item.attributes.name,
        nameSlug: item.attributes.slug,
        description: item.attributes.description,
        status: item.attributes.status,
        isActive: item.attributes.is_active,
        image: item.attributes.image,
        sku: item.attributes.sku,
        isBestSelling: item.attributes.isBestSeller,
        displayType: item.attributes.displayType,
        price: item.attributes.price,
        weight: item.attributes.mainValue,
        weight_unit: item.attributes.unit,
        formatted_weight: item.attributes.formattedWeight,
        categoryId: item.relationships?.categoryDetails?.data?.[0]?.id || "other",
        category: item.relationships?.categoryDetails?.data?.[0]?.attributes?.name || "other",
        categorySlug: item.relationships?.categoryDetails?.data?.[0]?.attributes?.slug || "other",
        stock: item.attributes.stockQuantity,
      }));

      setProducts(formattedProducts);
      setTotalPages(Math.ceil(Number(res.data.meta.totalPages)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const getPlan = async () => {
    try {
      const res = await axiosClient.get(`/plans/${planId}`);

      const planData = res.data.data;

      const formattedPlan = {
        id: planData.id,
        name: planData.attributes.name,
        description: planData.attributes.description,
        price: planData.attributes.price,
        max_items: planData.attributes.max_items,
        weight: planData.attributes.weight,
        weight_unit: planData.attributes.weight_unit,
        categoryRules: planData.attributes.category_rules,
        image: planData.attributes.image,
        prefilled_items: planData.attributes.prefilled_items
      };

      setPlan(formattedPlan);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlan(false)
    }
  };

  const getCategories = async () => {
    try {
      
      const res = await axiosClient.get("/product-categories/root");

      const catInfo = res.data.data || []

      const formattedCategories = catInfo.map((item: any) => ({
        id: item.id,
        name: item.attributes.name,
        slug: item.attributes.slug,
      }));

      setCategories(formattedCategories);
    } catch (err) {
      console.error(err);
    } finally{
      setLoadingCategories(false)
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-primary/80 py-6 sm:py-8">
        <div className="container flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-primary-foreground hover:bg-white/20"
              onClick={() => navigate(ROUTES.planFrequency)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              {plan && (
                <p className="mb-1 text-xs text-primary-foreground/80 sm:text-sm">
                  {plan?.name} ● {plan?.weight}{plan?.weight_unit} ● {subInfo?.selectedFrequency}
                </p>
              )}
              <h1 className="font-display text-2xl font-bold text-primary-foreground sm:text-3xl">Build Your Box</h1>
            </div>
          </div>
          <div className="text-right text-primary-foreground">
            <p className="text-xs opacity-80 sm:text-sm">Total</p>
            <p className="text-xl font-bold sm:text-2xl">{displayCurrency(plan?.price, "NGN")}</p>
          </div>
        </div>
      </div>

      <div className="container pb-28 pt-5 sm:pt-6 lg:pb-8">

        <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
          <button
            onClick={() => changeCategory("all")}
            className={`px-4 py-1 rounded-full ${
              activeCategory === "all" ? "bg-primary text-white" : "bg-muted"
            }`}
          >
          All
          </button>

          {categories.map((cat) => (
            <button
              key={cat?.id}
              onClick={() => changeCategory(cat.slug)}
              className={`px-4 py-1 rounded-full ${
                activeCategory === cat.slug ? "bg-primary text-white" : "bg-muted"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[250px_minmax(0,1fr)_320px] lg:gap-4">
          <div className="hidden lg:block">
            <Card className="sticky top-24 border-border/70 shadow-sm">
              <CardContent className="space-y-5 p-4">
                <div>
                  <p className="mb-2 text-sm font-semibold">Categories</p>
                  {loadingCategories && (
                    <Skeleton/>
                  )}
                  {!loadingCategories && categories?.length > 0 && (
                    <div className="space-y-2">
                      <button
                        onClick={() => changeCategory("all")}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                          activeCategory === "all" ? "bg-green-700 font-semibold text-white" : "text-foreground hover:bg-muted/50"
                        }`}
                      >
                        All
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => changeCategory(cat.slug)}
                          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                            activeCategory === cat?.slug
                              ? "bg-green-700 font-semibold text-white"
                              : "text-foreground hover:bg-muted/50"
                          }`}
                        >
                          <span>{cat === "all" ? "All" : cat?.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Build Budget
                  </p>
                    
                  <div className="space-y-3">
                    <div className="space-y-3">
                      {subInfo?.subscription?.attributes?.prefilled_items.length > 0 && (
                        <div>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span>Prefilled</span>
                          <span>{subInfo?.subscription?.attributes?.prefilled_items_total_weight}{subInfo?.subscription?.attributes?.weight_unit} / {subInfo?.subscription?.attributes?.prefilled_items_total_weight}{subInfo?.subscription?.attributes?.weight_unit}</span>
                        </div>
                          <Progress value={100} className="h-1.5" />
                        </div>
                      )}
                      {subInfo?.subscription?.attributes?.product_rules?.length > 0 &&
                        subInfo?.subscription?.attributes?.product_rules?.map((item) => {

                          const maxWeightG = toGrams(
                            item?.max_weight,
                            item?.weight_unit as "kg" | "g"
                          );

                          // weight of this specific product in cart
                          const specificItemInCartG = items
                            .filter((cartItem) => cartItem.id === item.product_id)
                            .reduce(
                              (acc, cartItem) => acc + cartItem.gram_weight * cartItem.qty,
                              0
                          );

                          const progress = (specificItemInCartG / maxWeightG) * 100;

                          return (
                            <div key={item?.product_id}>
                              <div className="mb-1 flex items-center justify-between text-xs">
                                <span>{item?.label || "Build selections"}</span>

                                <span>
                                  {formatWeight(specificItemInCartG)} / {formatWeight(maxWeightG)}
                                </span>
                              </div>

                              <Progress value={progress} className="h-1.5" />
                            </div>
                          );
                        })}

                      {subInfo?.subscription?.attributes?.remaining_weight && (
                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span>Build selections</span>

                            <span>
                              {formatWeight(totalGransInCart)} / {formatWeight(remainingWeightG)}
                            </span>
                          </div>

                          <Progress value={buildProgress} className="h-1.5" />
                        </div>
                      )}
                        
                    </div>
                  </div>
               </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* ── Section 1: Pre-built Items ─────────────────────── */}
            {subInfo?.subscription?.attributes?.prefilled_items?.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-display text-lg font-bold text-foreground">Pre-built in Your Box</h2>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {subInfo?.subscription?.attributes?.prefilled_items?.length} item{subInfo?.subscription?.attributes?.prefilled_items?.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  These cuts come included with your {subInfo?.subscription?.attributes?.name}. They can't be removed.
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {subInfo?.subscription?.attributes?.prefilled_items?.map((item) => (
                    <Card key={item.product_id} className="overflow-hidden border-green-200 shadow-sm">
                      <img
                        src={item?.image_url}
                        alt={item.name}
                        className="h-28 w-full object-cover"
                      />
                      <CardContent className="space-y-2 p-3">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{item.name}</p>
                          <Badge variant="secondary" className={`px-1.5 py-0 text-[10px] bg-green-200`}>
                            {item?.category}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{item?.weight}{item?.weight_unit}</span>
                          {/* <span className="font-semibold text-foreground">{displayCurrency(item?.price, "NGN")}</span> */}
                        </div>
                        <Button size="sm" className="w-full bg-rose-500 text-white hover:bg-rose-600" disabled>
                          <Lock className="mr-1 h-3 w-3" /> {item?.quantity} Included
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ── Section 2: Choose Your Picks ───────────────────── */}
            {products.length > 0 && (
              // <div>
              //   <div className="mb-3 flex items-center gap-2">
              //     <PackagePlus className="h-4 w-4 text-primary" />
              //     <h2 className="font-display text-lg font-bold text-foreground">Choose Your Offals</h2>
              //     <Badge variant={currentOffalWeightG < offalBudgetG ? "outline" : "default"} className={`ml-auto text-xs ${currentOffalWeightG >= offalBudgetG ? "bg-green-600" : "border-amber-400 text-amber-600"}`}>
              //       {currentOffalWeightG >= offalBudgetG
              //         ? "Complete!"
              //         : `${formatWeight(currentOffalWeightG)} / ${formatWeight(offalBudgetG)}`}
              //     </Badge>
              //   </div>
              //   <p className="mb-3 text-sm text-muted-foreground">
              //     Choose your offals and mix until {formatWeight(offalBudgetG)} is filled.
              //   </p>
              //   <div className="mb-4 rounded-xl border bg-muted/30 p-4">
              //     <div className="mb-2 flex justify-between text-sm">
              //       <span className="font-semibold">
              //         {formatWeight(currentOffalWeightG)} / {formatWeight(offalBudgetG)} filled
              //       </span>
              //       <span className={currentOffalWeightG >= offalBudgetG ? "font-semibold text-green-600" : "text-muted-foreground"}>
              //         {currentOffalWeightG >= offalBudgetG ? "Complete!" : `${formatWeight(offalBudgetG - currentOffalWeightG)} left`}
              //       </span>
              //     </div>
              //     <Progress value={Math.min((currentOffalWeightG / offalBudgetG) * 100, 100)} className="h-2" />
              //   </div>
              //   <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              //     {plan.offalSelection.options.map((opt) => {
              //       const qty = selectedOffalCounts[opt.name] ?? 0;
              //       const itemMax = opt.maxQty ?? Infinity;
              //       const canIncrease =
              //         qty < itemMax &&
              //         currentOffalWeightG + opt.weightG <= offalBudgetG;

              //       return (
              //         <Card key={opt.name} className={`overflow-hidden shadow-sm ${qty > 0 ? "border-primary/50 ring-1 ring-primary/20" : "border-border"}`}>
              //           <img
              //             src={PRODUCT_IMAGES[opt.name] ?? "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400"}
              //             alt={opt.name}
              //             className="h-28 w-full object-cover"
              //           />
              //           <CardContent className="space-y-2 p-3">
              //             <div className="flex items-center justify-between">
              //               <p className="font-semibold">{opt.name}</p>
              //               <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-violet-100 text-violet-700">Offals</Badge>
              //             </div>
              //             <div className="flex items-center justify-between text-xs text-muted-foreground">
              //               <span>
              //                 {formatWeight(opt.weightG)}
              //                 {opt.maxQty ? ` · max ${opt.maxQty}` : ""}
              //               </span>
              //               <span className="font-semibold text-foreground">{formatPrice(opt.price)}</span>
              //             </div>
              //             {qty === 0 ? (
              //               <Button size="sm" variant="outline" className="w-full" disabled={!canIncrease} onClick={() => handleIncreaseOffal(opt.name)}>
              //                 <Plus className="mr-1 h-3 w-3" /> Add
              //               </Button>
              //             ) : (
              //               <div className="flex items-center gap-2">
              //                 <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleDecreaseOffal(opt.name)}>
              //                   <Minus className="h-3.5 w-3.5" />
              //                 </Button>
              //                 <span className="flex-1 text-center text-sm font-semibold">{qty}</span>
              //                 <Button size="sm" className="h-8 w-8 p-0" disabled={!canIncrease} onClick={() => handleIncreaseOffal(opt.name)}>
              //                   <Plus className="h-3.5 w-3.5" />
              //                 </Button>
              //               </div>
              //             )}
              //           </CardContent>
              //         </Card>
              //       );
              //     })}
              //   </div>
              // </div>
              <div>

              </div>
            )}

            {loadingProducts && (
              <LoadingData />
            )}

            {!loadingProducts && products.length <= 0 && (
              <h2 className="text-muted-foreground font-semibold text-2xl py-20 text-center">No Product Found</h2>
            )}

            {products.length > 0 && !loadingProducts && (
              <BuildCatalog products={products}/>
            )}

            {totalPages > 1 && !loadingProducts && products?.length > 0 && (
              <Pagination className="mt-8">
                <PaginationContent className="flex-wrap justify-center gap-2">

                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && changePage(currentPage - 1)}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={currentPage === page}
                          onClick={() => changePage(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        currentPage < totalPages && changePage(currentPage + 1)
                      }
                    />
                  </PaginationItem>

                </PaginationContent>
              </Pagination>
            )}
          </div>

          <div className="hidden lg:block">
            <Card className="sticky top-24 border-border/70 shadow-sm">
              {loadingPlan && (
                <div className="p-4 w-full">
                  <Skeleton />
                </div>
              )}
              
              {!loadingPlan && Object.keys(plan).length > 0 && (
                <CardContent className="p-4">
                  <h3 className="mb-4 font-semibold">Your Box</h3>

                  <div className="mb-4 border-b pb-4 text-sm">
                    <div className="mb-2 flex justify-between">
                      <span className="text-muted-foreground">Total weight</span>
                      <span className="font-medium">
                        {formatWeight(totalFilled)} / {subInfo?.subscription?.attributes?.weight}{subInfo?.subscription?.attributes?.weight_unit}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="mt-3 space-y-1">
                      <p>
                        <span className="text-muted-foreground">Plan:</span> <span className="font-medium">{plan?.name}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Frequency:</span> <span className="font-medium">{subInfo?.selectedFrequency}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 space-y-2 pb-2">

                    {plan?.prefilled_items.length > 0 && (
                      <div className="border-b pb-4 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In your box</p>

                        {plan?.prefilled_items.map((item) => (
                          <div key={item.productId} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{item?.name}</span>
                            <span>{item?.weight}{item?.weight_unit} 
                              {/* · {displayCurrency(item.price, "NGN")} */}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {items.length > 0 && (
                      <div className="border-b pb-4 space-y-2">
                        <p className="pt-1 text-[10px] font-semibold uppercase tracking-wider text-primary">Your picks</p>
                        {items.map((item) => (
                          <div key={item.name} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              {item.name} {item.qty > 1 ? `x ${item.qty}` : ""}
                            </span>
                            <span className="text-right">
                              {item?.weight * item.qty}{item?.weight_unit} 
                              {/* · {displayCurrency(item.price * item.qty, "NGN")} */}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Plan price</span>
                      <span className="font-medium">{displayCurrency(plan?.price, "NGN")}</span>
                    </div>
                    {/* {addOnsTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Add-ons</span>
                        <span className="font-medium">{formatPrice(addOnsTotal)}</span>
                      </div>
                    )} */}
                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{displayCurrency(plan?.price, "NGN")}</span>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" onClick={() => navigate(ROUTES.cartReview)} disabled={!products || (totalGransInCart != remainingWeightG)}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Review Cart
                  </Button>
                  {error && (
                    <p className="text-xs text-center text-amber-600 mt-2">
                      {error}
                    </p>
                  )}

                  {/* {!canProceed && hasOffalSelection && (
                    <p className="mt-2 text-center text-xs text-amber-600">
                      Fill remaining {formatWeight(offalBudgetG - currentOffalWeightG)} of offals to continue
                    </p>
                  )}
                  {!canProceed && hasBuildYourBox && plan?.buildYourBox && (
                    <p className="mt-2 text-center text-xs text-amber-600">
                      Fill remaining {formatWeight(plan.buildYourBox.remainingWeightG - buildWeightG)} to continue
                    </p>
                  )} */}
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-4 backdrop-blur-lg lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">
              {formatWeight(fullBoxWeightG)} / {formatWeight((plan?.weightKg ?? 0) * 1000)}
            </p>
            <p className="text-lg font-bold text-primary">{formatPrice(grandTotal)}</p>
          </div>
          <Button size="lg" onClick={() => navigate(ROUTES.cartReview)} disabled={!canProceed} className="max-w-[200px] flex-1">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Review Cart
          </Button>
        </div>
        {!canProceed && hasOffalSelection && (
          <p className="mt-2 text-center text-xs text-amber-600">
            Fill remaining {formatWeight(offalBudgetG - currentOffalWeightG)} of offals
          </p>
        )}
        {!canProceed && hasBuildYourBox && plan?.buildYourBox && (
          <p className="mt-2 text-center text-xs text-amber-600">
            Fill remaining {formatWeight(plan.buildYourBox.remainingWeightG - buildWeightG)} to continue
          </p>
        )}
      </div> */}
    </div>
  );
};

export default BuildBox;
