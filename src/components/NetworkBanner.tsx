import { useState } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { X } from "lucide-react";

export const NetworkBanner = () => {
  const isOnline = useNetworkStatus();
  const [closed, setClosed] = useState(false);

  if (isOnline || closed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white flex items-center justify-between px-4 py-2 z-50">
      <span className="font-semibold">⚠️ No Internet Connection</span>

      <button
        onClick={() => setClosed(true)}
        className="text-white font-bold text-lg"
      >
        <X/>
      </button>
    </div>
  );
};