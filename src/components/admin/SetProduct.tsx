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
import { paginationType, PlanType, ProductType } from '@/types/admin'
import displayCurrency from '@/utils/displayCurrency'
import { Badge } from '../ui/badge'
import { Plus, Search } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Input } from '../ui/input'
import { LoadingData } from '../LoadingData'

export const SetProduct = ({products, addProduct, loading, meta, search, onSearch}: {products: ProductType[]; addProduct: (product: ProductType) => void; loading: boolean; meta: paginationType | null, search: string; onSearch: (value: string) => void;}) => {

    const [open, setOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get("page")) || 1;

    const changePage = (page: number) => {
      setSearchParams({
        page: page.toString()
      });
    };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div>
        <DialogTrigger as-child className='flex-1 w-full'>
          <Button variant="outline" type='button' className='flex-1 w-full'>
            Add Product
          </Button>
        </DialogTrigger>
        <DialogContent className="lg:max-w-[1024px] min-h-[95%] max-h-[95%] bg-white overflow-y-auto scrollbar-rounded">
          <DialogHeader>
            <DialogTitle>Products</DialogTitle>
            <DialogDescription>Add a prefilled product to your plan</DialogDescription>
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  value={search}
                  onChange={(e) => {
                    const value = e.target.value;
                    onSearch(value);
                  }} placeholder="Search products..." className="pl-9 h-10 rounded-xl" />
            </div>
          </DialogHeader>
          <div>
            {loading ? (
              <LoadingData/>
            ) : (
              <div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {products.map((item) => {

                        return (
                        <div
                            key={item.id}
                            className={`rounded-2xl border p-4 transitio border-border`}
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
                                <Badge variant="secondary" className={`px-1.5 py-0 text-[10px]}`}>
                                    {item.category}
                                </Badge>
                                </div>
                            </div>
                            <p className="text-sm font-semibold text-primary">{displayCurrency(item.price, "NGN")}</p>
                            </div>

                            <Button size="sm" variant="outline" onClick={() => { addProduct(item); setOpen(false)}} className="mt-1 w-full" disabled={item?.stock <= 0 || !item?.isActive}>
                                <Plus className="mr-1 h-3 w-3" /> Add
                            </Button>

                        </div>
                        );
                    })}
                </div>
                {products?.length === 0 && <p className="text-center text-xl text-muted-foreground">No product found.</p>}
                {meta?.total > 1 && !loading && products?.length > 0 && (
                  <Pagination className="mt-8">
                    <PaginationContent className="flex-wrap justify-center gap-2">

                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && changePage(currentPage - 1)}
                        />
                      </PaginationItem>

                      {Array.from({ length: meta?.totalPages }).map((_, i) => {
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
                            currentPage < meta?.totalPages && changePage(currentPage + 1)
                          }
                        />
                      </PaginationItem>

                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="gap-4 mt-auto">
            <DialogClose>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </div>
  </Dialog>
  )
}