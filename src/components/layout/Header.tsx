import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import CartDrawer from "@/components/cart/CartDrawer";
import { ROUTES } from "@/lib/routes";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { itemCount, clearCart } = useCart();
  const subscription = useSubscription();
  const navigate = useNavigate();

  const subscriptionCount =
    subscription.state.boxItems.reduce((sum, item) => sum + item.quantity, 0) +
    subscription.state.addOns.reduce((sum, addon) => sum + addon.quantity, 0);
  const totalCount = itemCount + subscriptionCount;

  const navLinks = [
    { href: ROUTES.home, label: "Home" },
    { href: ROUTES.howItWorks, label: "How It Works" },
    { href: ROUTES.plans, label: "Plans" },
    { href: ROUTES.gifts, label: "Gifts" },
    { href: ROUTES.sourcing, label: "Sourcing" },
    { href: ROUTES.faqs, label: "FAQs" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center">
          <div className="flex flex-1 items-center gap-3">
            <Link to={ROUTES.home} className="flex items-center gap-3">
              <img
                src="/Fooding_Meat_Logo.png"
                alt="MeatNG"
                className="h-8 w-auto sm:h-9"
              />
            </Link>
          </div>

          <nav className="relative z-20 hidden lg:flex flex-1 items-center justify-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium text-foreground transition-colors hover:text-primary whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}

            <Link
              to={ROUTES.contact}
              className="text-sm font-medium text-foreground transition-colors hover:text-primary whitespace-nowrap"
            >
              Contact
            </Link>
          </nav>

          <div className="flex flex-1 items-center justify-end gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-foreground hover:bg-muted hover:text-foreground"
              onClick={() => {
                if (itemCount > 0) {
                  setIsCartOpen(true);
                  return;
                }
                if (subscriptionCount > 0) {
                  navigate(ROUTES.cartReview);
                  return;
                }
                setIsCartOpen(true);
              }}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {totalCount > 99 ? "99+" : totalCount}
                </span>
              )}
            </Button>

            {subscription.state.user ? (
              <div className="hidden sm:block relative group">
                <button className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs font-bold text-white">
                    {subscription.state.user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </span>
                  <span className="max-w-[100px] truncate">{subscription.state.user.name.split(" ")[0]}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-border bg-background shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <Link
                      to={ROUTES.dashboard}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      <User className="h-4 w-4" /> My Dashboard
                    </Link>
                    <Link
                      to={ROUTES.buildBox}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      <ShoppingCart className="h-4 w-4" /> My Box
                    </Link>
                  </div>
                  <div className="border-t border-border p-2">
                    <button
                      onClick={() => {
                        subscription.logout();
                        clearCart();
                        navigate(ROUTES.home);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Button size="sm" asChild className="hidden sm:flex">
                <Link to={ROUTES.auth}>
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-muted hover:text-foreground lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="relative z-10 lg:hidden border-t border-border bg-background">
            <nav className="container flex flex-col py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="py-3 text-sm font-medium text-foreground transition-colors hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to={ROUTES.contact}
                className="py-3 text-sm font-medium text-foreground transition-colors hover:text-primary border-t border-border mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-4 border-t border-border flex flex-col gap-2">
                {subscription.state.user ? (
                  <>
                    <Button asChild onClick={() => setIsMobileMenuOpen(false)}>
                      <Link to={ROUTES.dashboard}>My Dashboard</Link>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        subscription.logout();
                        navigate(ROUTES.home);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Log Out
                    </Button>
                  </>
                ) : (
                  <Button asChild onClick={() => setIsMobileMenuOpen(false)}>
                    <Link to={ROUTES.auth}>Sign In</Link>
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
};

export default Header;
