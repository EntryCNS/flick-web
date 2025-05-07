import { OrderStatus } from "@/types/order";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = {
    PENDING: {
      label: "대기중",
      className: "bg-yellow-100 text-yellow-800",
    },
    PAID: {
      label: "결제완료",
      className: "bg-green-100 text-green-800",
    },
    CANCELLED: {
      label: "취소됨",
      className: "bg-red-100 text-red-800",
    },
    EXPIRED: {
      label: "만료됨",
      className: "bg-gray-100 text-gray-800",
    },
  };

  const { label, className } = config[status];

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
