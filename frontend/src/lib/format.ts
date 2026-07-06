export const formatPrice = (amount: number) =>
  `৳${amount.toLocaleString("en-IN")}`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const ORDER_STATUS_LABELS: Record<string, { label: string; labelBn: string; color: string }> = {
  PENDING: { label: "Pending", labelBn: "অপেক্ষমাণ", color: "bg-amber-100 text-amber-800" },
  CONFIRMED: { label: "Confirmed", labelBn: "নিশ্চিত", color: "bg-blue-100 text-blue-800" },
  IN_PRODUCTION: { label: "In Production", labelBn: "তৈরি হচ্ছে", color: "bg-purple-100 text-purple-800" },
  SHIPPED: { label: "Shipped", labelBn: "পাঠানো হয়েছে", color: "bg-cyan-100 text-cyan-800" },
  DELIVERED: { label: "Delivered", labelBn: "ডেলিভারি সম্পন্ন", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelled", labelBn: "বাতিল", color: "bg-red-100 text-red-800" },
};

export const DESIGN_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  SUBMITTED: { label: "Submitted", color: "bg-blue-100 text-blue-800" },
  REVIEWED: { label: "Reviewed", color: "bg-purple-100 text-purple-800" },
  ORDERED: { label: "Ordered", color: "bg-green-100 text-green-800" },
};
