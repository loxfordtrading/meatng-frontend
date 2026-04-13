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
import displayCurrency from '@/utils/displayCurrency'
import { ArrowRight, Calendar, CheckCircle2, Eye } from 'lucide-react'

export const MobilePlanSummaryModal = ({
  plan,
  selectedFrequency,
  handleContinue, 
}: {
  plan: any;
  selectedFrequency: string | null;
  handleContinue: () => void;
}) => {
  return (
    <Dialog>
      <div className='lg:hidden'>
        <DialogTrigger as-child>
          <Button disabled={!plan || !selectedFrequency} className="flex-1 w-full" > Continue <ArrowRight className="ml-2 h-4 w-4" /> </Button>
        </DialogTrigger>
        <DialogContent className="lg:max-w-[1024px] max-h-[95%] bg-white overflow-y-auto scrollbar-rounded">
          <DialogHeader>
            <DialogTitle>Summary</DialogTitle>
          </DialogHeader>
          <div>
              {plan && (
                <>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Plan</span>
                      <span>{plan?.attributes?.name}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Weight</span>
                      <span>{plan?.attributes.weight}{plan?.attributes.weight_unit}</span>
                    </div>

                    {selectedFrequency && (
                      <div className="flex justify-between">
                        <span>Delivery Frequency</span>
                        <span>{selectedFrequency}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Price</span>
                      <span className="text-primary font-bold">
                        {displayCurrency(plan?.attributes?.price, "NGN") }
                      </span>
                    </div>
                  </div>

                  {plan?.attributes?.prefilled_items?.length > 0 && (
                    <div className="rounded-xl border border-border p-4 space-y-2 mt-4">
                      <p className="text-sm font-semibold">What's included</p>
                      
                      {plan?.attributes?.prefilled_items?.map((item) => ( 
                        <p key={item?.product_id} className="text-xs text-muted-foreground">{item?.name} — {item?.weight}{item?.weight_unit}</p>
                      ))}
                      <p className="text-xs text-primary font-medium pt-1"> + Pick the remaining {plan?.attributes?.remaining_weight}{plan?.attributes?.weight_unit}</p>
                    </div>
                  )}

                  {/* Benefits */} 
                  <div className="space-y-1 mt-4">
                    {plan?.attributes?.highlights?.length > 0 && (
                      plan?.attributes?.highlights?.map((item) => (
                        <p key={item?.product_id}  className="text-xs flex items-start gap-2"> 
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /> 
                          <span>{item}</span> 
                        </p>
                      ))
                    )
                    }
                  </div>
                </>
              )}
            </div>
          <DialogFooter className="gap-4">
            <Button
              className="w-full mt-6"
              disabled={!selectedFrequency || !plan}
              onClick={handleContinue}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </div>
  </Dialog>
  )
}