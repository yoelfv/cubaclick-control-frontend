export interface StrapiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface StrapiProduct {
  documentId: string;
  nombre: string;
  precio: number;
  disponible: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

export interface StrapiOrderItem {
  documentId: string;
  quantity: number;
  unitPrice: number;
  product: StrapiProduct;
}

export interface StrapiCustomer {
  documentId: string;
  name: string;
  phone: string;
}

export interface StrapiSalesRep {
  documentId: string;
  name: string;
  initials: string;
  active: boolean;
}

export interface StrapiOrder {
  documentId: string;
  code: string;
  sequenceNumber: number;
  date: string;
  customer: StrapiCustomer;
  salesRep: StrapiSalesRep;
  recipientName: string;
  recipientPhone: string;
  remittance: number;
  total: number;
  paymentStatus: "paid" | "pending";
  cancelled: boolean;
  orderItems: StrapiOrderItem[];
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
}

export interface SalesRep {
  id: string;
  name: string;
  initials: string;
  active: boolean;
}

export interface Order {
  id: string;
  code: string;
  sequenceNumber: number;
  date: string;
  customer: Customer;
  salesRep: SalesRep;
  recipientName: string;
  recipientPhone: string;
  remittance: number;
  total: number;
  paymentStatus: "paid" | "pending";
  cancelled: boolean;
  orderItems: OrderItem[];
}

export interface DailyStat {
  date: string; // YYYY-MM-DD
  orders: number;
  total: number;
  paid: number;
  pending: number;
}

export interface StatisticsSummary {
  totalOrders: number;
  totalAmount: number;
  paidOrders: number;
  paidAmount: number;
  pendingOrders: number;
  pendingAmount: number;
}

export interface StatisticsResponse {
  summary: StatisticsSummary;
  daily: DailyStat[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}
