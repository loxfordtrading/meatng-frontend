type StatusBadgeProps = {
  status: string;
};

const OrderStatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();

    if (s === "delivered") {
      return "bg-green-500/15 text-green-700 border-green-500/20";
    }

    if (s === "in_transit" || s === "shipped" || s === "in transit") {
      return "bg-blue-500/15 text-blue-700 border-blue-500/20";
    }

    if (s === "processing" || s === "paid") {
      return "bg-yellow-500/15 text-yellow-700 border-yellow-500/20";
    }

    if (s === "cancelled") {
      return "bg-red-500/15 text-red-700 border-red-500/20";
    }

    return "bg-gray-500/15 text-gray-700 border-gray-500/20";
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(
        status
      )}`}
    >
      {status.replace("_", " ")}
    </span>
  );
};

export default OrderStatusBadge;