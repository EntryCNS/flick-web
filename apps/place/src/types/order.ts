export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "EXPIRED";

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface Order {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  paymentCode: string;
  expiresAt: string;
  paidAt: string | null;
  createdAt: string;
}

export interface OrderDetailResponse {
  orderId: number;
  status: OrderStatus;
  totalAmount: number;
  paymentCode: string;
  expiresAt: string;
  paidAt: string | null;
  paidBy: number | null;
  items: OrderItem[];
  createdAt: string;
}

export interface PageResponseOrderResponse {
  content: Order[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
