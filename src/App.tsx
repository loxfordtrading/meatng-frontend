import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import { ProductCatalogProvider } from "@/contexts/ProductCatalogContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdminLayout from "@/components/admin/AdminLayout";
import { ROUTES } from "@/lib/routes";
import { ToastContainer } from 'react-toastify';

// Customer Pages
import Index from "@/pages/Index";
import Plans from "@/pages/Plans";
import PlanSize from "@/pages/PlanSize";
import PlanFrequency from "@/pages/PlanFrequency";
import BuildBox from "@/pages/BuildBox";
import CartReview from "@/pages/CartReview";
import Checkout from "@/pages/Checkout";
import Confirmation from "@/pages/Confirmation";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import About from "@/pages/About";
import Club from "@/pages/Club";
import Contact from "@/pages/Contact";
import Faqs from "@/pages/Faqs";
import Gifts from "@/pages/Gifts";
import HowItWorks from "@/pages/HowItWorks";
import Reviews from "@/pages/Reviews";
import Sourcing from "@/pages/Sourcing";
import ComingSoon from "@/pages/ComingSoon";
import Auth from "@/pages/Auth";
import AuthSignup from "@/pages/AuthSignup";
import AuthVerifyEmail from "@/pages/AuthVerifyEmail";
import AuthResetPassword from "@/pages/AuthResetPassword";
import AuthAcceptInvitation from "@/pages/AuthAcceptInvitation";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";

// Admin Pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminSubscriptions from "@/pages/admin/AdminSubscriptions";
import AdminDeliveries from "@/pages/admin/AdminDeliveries";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminSettings from "@/pages/admin/AdminSettings";
import VerifyPayment from "./pages/VerifyPayment";
import VerificationEmailSent from "./pages/VerificationEmailSent";
import UserGuard from "./protect/UserGuard";
import { useAuthStore } from "./store/AuthStore";
import AdminGuard from "./protect/AdminGuard";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminInvitationSetup from "./pages/admin/AdminInvitationSetup";
import { AddPlan } from "./pages/admin/AddPlan";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <SubscriptionProvider>
          <ProductCatalogProvider>
          <AdminProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                {/* ─── Admin Routes (no Header/Footer) ─── */}
                <Route path={ROUTES.adminLogin} element={<AdminLogin />} />
                <Route path={ROUTES.adminInvitationSetup} element={<AdminInvitationSetup />} />
                <Route path={ROUTES.admin} element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                <Route path={ROUTES.adminOrders} element={<AdminGuard><AdminOrders /></AdminGuard>} />
                <Route path={ROUTES.adminCustomers} element={<AdminGuard><AdminCustomers /></AdminGuard>} />
                <Route path={ROUTES.adminPlans} element={<AdminGuard><AdminPlans /></AdminGuard>} />
                <Route path={ROUTES.addPlan} element={<AdminGuard><AddPlan /></AdminGuard>} />
                <Route path={ROUTES.adminProducts} element={<AdminGuard><AdminProducts /></AdminGuard>} />
                <Route path={ROUTES.adminSubscriptions} element={<AdminGuard><AdminSubscriptions /></AdminGuard>} />
                <Route path={ROUTES.adminDeliveries} element={<AdminGuard><AdminDeliveries /></AdminGuard>} />
                <Route path={ROUTES.adminAnalytics} element={<AdminGuard><AdminAnalytics /></AdminGuard>} />
                <Route path={ROUTES.adminSettings} element={<AdminGuard><AdminSettings /></AdminGuard>} />

                {/* ─── Customer Routes (with Header/Footer) ─── */}
                <Route path="*" element={
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <Routes>

                        <Route element={<UserGuard />}>
                          <Route path={ROUTES.checkout} element={<Checkout />} />
                          <Route path={ROUTES.dashboard} element={<Dashboard />} />
                        </Route>


                        <Route path={ROUTES.home} element={<Index />} />
                        <Route path={ROUTES.plans} element={<Plans />} />
                        <Route path={ROUTES.planSize} element={<PlanSize />} />
                        <Route path={ROUTES.planFrequency} element={<PlanFrequency />} />
                        <Route path={ROUTES.buildBox} element={<BuildBox />} />
                        <Route path={ROUTES.cartReview} element={<CartReview />} />
                        <Route path={ROUTES.verifyPayment} element={<VerifyPayment />} />
                        <Route path={ROUTES.verificationEmailSent} element={<VerificationEmailSent />} />
                        <Route path={ROUTES.confirmation} element={<Confirmation />} />
                        <Route path={ROUTES.products} element={<Products />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path={ROUTES.howItWorks} element={<HowItWorks />} />
                        <Route path={ROUTES.sourcing} element={<Sourcing />} />
                        <Route path={ROUTES.farmLocator} element={<ComingSoon title="Farm Locator" />} />
                        <Route path={ROUTES.faqs} element={<Faqs />} />
                        <Route path={ROUTES.club} element={<Club />} />
                        <Route path={ROUTES.about} element={<About />} />
                        <Route path={ROUTES.contact} element={<Contact />} />
                        <Route path={ROUTES.reviews} element={<Reviews />} />
                        <Route path={ROUTES.gifts} element={<Gifts />} />
                        <Route path={ROUTES.giftCards} element={<ComingSoon title="Gift Cards" />} />
                        <Route path={ROUTES.corporateGifting} element={<ComingSoon title="Corporate Gifting" />} />
                        <Route path="/auth" element={<Navigate to={ROUTES.authSignIn} replace />} />
                        <Route path={ROUTES.login} element={<Auth />} />
                        <Route path={ROUTES.authSignIn} element={<Auth />} />
                        <Route path={ROUTES.authSignUp} element={<AuthSignup />} />
                        <Route path={ROUTES.authVerifyEmail} element={<AuthVerifyEmail />} />
                        <Route path={ROUTES.authResetPassword} element={<AuthResetPassword />} />
                        <Route path={ROUTES.authAcceptInvitation} element={<AuthAcceptInvitation />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                } />
              </Routes>
            </BrowserRouter>
          </AdminProvider>
          </ProductCatalogProvider>
        </SubscriptionProvider>
      </CartProvider>
    </TooltipProvider>
    <ToastContainer />
  </QueryClientProvider>
);

export default App;
