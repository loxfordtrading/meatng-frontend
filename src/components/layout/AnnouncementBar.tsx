import { Truck, MapPin, MessageCircle } from "lucide-react";

const AnnouncementBar = () => {
  return (
    <div className="bg-primary text-primary-foreground py-2 text-sm">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          <span className="hidden sm:inline">Free Delivery in Lagos on orders over ₦50,000</span>
          <span className="sm:hidden">Free delivery over ₦50,000</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <button className="flex items-center gap-1.5 hover:text-primary-foreground/80 transition-colors">
            <MapPin className="h-4 w-4" />
            <span>Check Delivery Area</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-primary-foreground/80 transition-colors">
            <MessageCircle className="h-4 w-4" />
            <span>Need Help?</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
