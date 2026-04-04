import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";
import { useState } from "react";
import { ROUTES } from "@/lib/routes";
import { toast } from "react-toastify";
import { axiosClient } from "@/GlobalApi";
import { FaWhatsapp } from "react-icons/fa6";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!email){
      return toast.error("Please enter your email")
    }
    try {
      setLoading(true)
      const response = await axiosClient.post("/newsletter/subscribe", { email })
      setEmail("");
      toast.success("Thank you for subscribing to our newsletter")
    } catch (error) {
      toast.error(error.response.data?.message || "Please try again later")
    } finally {
      setLoading(false)
    }
  };

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Newsletter */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-display font-bold text-primary mb-4">Join and Subscribe</h2>
            <p className="text-secondary-foreground/80 mb-6 max-w-md">
              Premium meat, delivered. Manage your plan anytime.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-sm">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary-foreground/10 border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/50"
              />
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {loading ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Mail className="h-4 w-4" />}
              </Button>
            </form>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-primary">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to={ROUTES.howItWorks} className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to={ROUTES.plans} className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  Plans
                </Link>
              </li>
              <li>
                <Link to={ROUTES.club} className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  Meat Lovers Club
                </Link>
              </li>
              <li>
                <Link to={ROUTES.sourcing} className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  Sourcing
                </Link>
              </li>
              <li>
                <Link to={ROUTES.faqs} className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to={ROUTES.about} className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to={ROUTES.contact} className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-primary">Contact</h3>
            <ul className="space-y-2 text-secondary-foreground/80">
              <li>+234 7086444603</li>
              <li>themeatng@gmail.com</li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a href="https://www.instagram.com/meat_ng?igsh=a3RlMGM2ZGE5azRm" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://wa.me/qr/26J2C2ZHVPCXM1" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                <FaWhatsapp className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center text-secondary-foreground/60 text-sm space-y-2">
          <p>&copy; {new Date().getFullYear()} MeatNG. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-secondary-foreground/60">
            <a href="/MeatNG_Terms_and_Conditions.pdf" className="hover:text-primary transition-colors">Terms of Service</a>
            <span className="text-secondary-foreground/20">|</span>
            <a href="/MeatNG_Privacy_Policy.pdf" className="hover:text-primary transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
