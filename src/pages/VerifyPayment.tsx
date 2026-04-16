import { useEffect, useState } from "react";
import { axiosClient } from "@/GlobalApi";
import { Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Lottie from "lottie-react";
import { ROUTES } from "@/lib/routes";
import paymentCheck from "@/assets/payment-check.json"
import paymentError from "@/assets/payment-error.json"
import { useCartStore } from "@/store/cartStore";
import { useAddonStore } from "@/store/addonStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";

const VerifyPayment = () => {

  const { clearCart } = useCartStore();
  const { clearAddon } = useAddonStore();
  const { clearSubInfo } = useSubscriptionStore();
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({
    msg: '',
    status: false
  })

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();


    // Redirect if no reference
    useEffect(() => {
        const reference = searchParams.get("reference");

        if (!reference) {
            navigate("/cart-review", { replace: true });
            return;
        }

        verifyPayment(reference);
    }, [searchParams, navigate]);

    const verifyPayment = async (reference: string) => {
        try {
            const response = await axiosClient.get(
                `/payment/verify?reference=${reference}`
            );

            const paymentStatus = response.data?.data?.attributes?.payment_status

            if(paymentStatus === "fulfilled"){
                setMessage({
                    msg: "Payment successful",
                    status: true,
                });
                // localStorage.removeItem("cart");
                // localStorage.removeItem("cart-addon");
                clearCart()
                clearAddon()
                clearSubInfo()

                setTimeout(() => {
                    navigate(ROUTES.dashboard, { replace: true });
                }, 4000);
            }else{
                setMessage({
                    msg: "Payment not successful",
                    status: false,
                });

                setTimeout(() => {
                    navigate(ROUTES.cartReview, { replace: true });
                }, 4000);
            }

        } catch (error: any) {
            console.log("VERIFY ERROR", error);

            setMessage({
                msg: error.response?.data?.message || "Something went wrong",
                status: false,
            });

            setTimeout(() => {
                navigate(ROUTES.cartReview, { replace: true });
            }, 4000);

        } finally {
            setLoading(false);
        }
    };

  if(loading) {
    return (
        <div className="w-full flex justify-center items-center h-[70vh] p-4">
            <div className='items-center justify-center'>
                <Loader2 className="animate-spin size-10 text-primary mx-auto" />
                <h2 className='font-bold mx-auto'>Please wait...</h2>
            </div>
        </div>
    )
  }

  return (
    <div className="w-full flex justify-center items-center h-[70vh] p-4">
        {message.status ? (
            <div className='items-center justify-center'>
                <div className='w-[150px] h-[150px] mx-auto'>
                    <Lottie animationData={paymentCheck} loop={true} />
                </div>
                <h2 className='font-bold mx-auto text-center mb-2'>{message.msg}</h2>
                <p className='font-bold text-sm mx-auto text-center'>Redirecting to Dashboard...</p>
                <Loader2 className="animate-spin size-6 text-green-600 mx-auto" />
            </div>
        ) : (
            <div className='items-center justify-center'>
                <div className='w-[150px] h-[150px] mx-auto'>
                    <Lottie animationData={paymentError} loop={true} />
                </div>
                <h2 className='font-bold mx-auto text-center mb-2'>{message.msg}</h2>
                <p className='font-bold text-sm mx-auto text-center'>Redirecting to cart...</p>
                <Loader2 className="animate-spin size-6 text-red-600 mx-auto" />
            </div>
        )}
        
    </div>
  )
}

export default VerifyPayment