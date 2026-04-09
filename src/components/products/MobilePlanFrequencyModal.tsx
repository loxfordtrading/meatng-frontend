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
import { ArrowRight, Calendar, Eye } from 'lucide-react'
import { MobilePlanSummaryModal } from './MobilePlanSummaryModal'
import { useEffect, useState } from 'react'

export const MobilePlanFrequencyModal = ({
  plan,
  frequencies,
  selectedFrequency,
  setSelectedFrequency,
  handleContinue, 
}: {
  plan: any;
  frequencies: any[];
  selectedFrequency: string | null;
  setSelectedFrequency: (id: string) => void;
  handleContinue: () => void;
}) => {

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <Dialog>
      <div>
        <DialogTrigger as-child>
          <Button size="sm" disabled={!plan} className="flex-1 max-w-[200px]" > Continue <ArrowRight className="ml-2 h-4 w-4" /> </Button>
        </DialogTrigger>
        <DialogContent className="lg:max-w-[1024px] max-h-[95%] bg-white overflow-y-auto scrollbar-rounded">
          <DialogHeader>
            <DialogTitle>Select delivery frequency</DialogTitle>
            <DialogDescription>
              Choose how often you'd like your plan to be delivered for {plan?.attributes?.name} plan &middot; {plan?.attributes.weight}{plan?.attributes.weight_unit} - {displayCurrency(plan?.attributes?.price, "NGN") }. 
            </DialogDescription>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {frequencies.map((option) => {
                const selected = option?.id === selectedFrequency;

                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedFrequency(option?.id)}
                    className={`border rounded-2xl p-4 text-left transition ${
                      selected
                        ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                        : "hover:border-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{option.label}</span>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>

                    <p className="text-xs text-primary mt-2">
                      {option.billingNote}
                    </p>
                  </button>
                );
              })}
            </div>
          <DialogFooter className="gap-2 flex-row items-center">
            <DialogClose>
              <Button variant="outline" size='sm'>Close</Button>
            </DialogClose>
            {!isDesktop && (
              <MobilePlanSummaryModal
                plan={plan}
                selectedFrequency={selectedFrequency}
                handleContinue={handleContinue}
              />
            )}
          </DialogFooter>
        </DialogContent>
      </div>
  </Dialog>
  )
}