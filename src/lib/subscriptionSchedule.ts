import type { Frequency } from "@/data/plans";

export const getNextBillingDate = (frequency: Frequency, fromDate: Date = new Date()): Date => {
  const next = new Date(fromDate);

  switch (frequency) {
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "bi-weekly":
      next.setDate(next.getDate() + 14);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
  }

  next.setHours(9, 0, 0, 0);
  return next;
};

export const getCutoffDateTime = (billingDate: Date): Date => {
  const cutoff = new Date(billingDate);
  cutoff.setDate(cutoff.getDate() - 1);
  cutoff.setHours(23, 59, 0, 0);
  return cutoff;
};

export const getEstimatedDeliveryWindow = (billingDate: Date): string => {
  const delivery = new Date(billingDate);
  delivery.setDate(delivery.getDate() + 1);

  const dayLabel = delivery.toLocaleDateString("en-NG", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return `${dayLabel}, 10:00 AM - 6:00 PM`;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-NG", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleDateString("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};
