import { apiFetch } from "./client";
import type {
  Order,
  StrapiOrder,
  StrapiResponse,
  DailyStat,
  StatisticsSummary,
  StatisticsResponse,
  BankAccount,
  StrapiBankAccount,
} from "./types";

function mapOrder(order: StrapiOrder): Order {
  return {
    id: order.documentId,
    code: order.code,
    sequenceNumber: order.sequenceNumber,
    date: order.date,
    customer: {
      id: order.customer.documentId,
      name: order.customer.name,
      phone: order.customer.phone,
    },
    salesRep: {
      id: order.salesRep.documentId,
      name: order.salesRep.name,
      initials: order.salesRep.initials,
      active: order.salesRep.active,
    },
    recipientName: order.recipientName,
    recipientPhone: order.recipientPhone,
    remittance: order.remittance,
    total: order.total,
    paymentStatus: order.paymentStatus,
    cancelled: order.cancelled,
    orderItems: (order.orderItems ?? []).map((item) => ({
      id: item.documentId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      product: item.product
        ? {
            id: item.product.documentId,
            name: item.product.nombre,
            price: item.product.precio,
            available: item.product.disponible,
            categoria: null,
          }
        : {
            id: "",
            name: "Producto desconocido",
            price: 0,
            available: false,
            categoria: null,
          },
    })),
    bankAccount: order.bankAccount
      ? {
          id: order.bankAccount.documentId,
          name: order.bankAccount.name,
          active: order.bankAccount.active,
        }
      : null,
  };
}

export async function getOrders(
  dateFrom?: string,
  dateTo?: string,
): Promise<Order[]> {
  const params = new URLSearchParams({
    "populate[customer]": "true",
    "populate[salesRep]": "true",
    "populate[orderItems][populate][product]": "true",
    "populate[bankAccount]": "true",
  });

  if (dateFrom && dateTo) {
    params.set("filters[date][$gte]", dateFrom);
    params.set("filters[date][$lte]", dateTo);
  } else if (dateFrom) {
    params.set("filters[date][$eq]", dateFrom);
  }

  const response = await apiFetch<StrapiResponse<StrapiOrder[]>>(
    `/orders?${params.toString()}`,
  );

  return response.data.map(mapOrder);
}

export async function getOrdersByCustomer(
  customerId: string,
): Promise<Order[]> {
  const params = new URLSearchParams({
    "filters[customer][documentId][$eq]": customerId,
    "populate[customer]": "true",
    "populate[salesRep]": "true",
    "populate[orderItems][populate][product]": "true",
    "populate[bankAccount]": "true",
  });

  const response = await apiFetch<StrapiResponse<StrapiOrder[]>>(
    `/orders?${params.toString()}`,
  );

  return response.data.map(mapOrder);
}

export interface CustomerOrdersPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface CustomerOrdersSummary {
  totalOrders: number;
  totalAmount: number;
  paidOrders: number;
  paidAmount: number;
  pendingOrders: number;
  pendingAmount: number;
}

export interface CustomerOrdersResponse {
  data: Order[];
  pagination: CustomerOrdersPagination;
  summary: CustomerOrdersSummary;
}

export interface SalesRepOrdersResponse {
  data: Order[];
  pagination: CustomerOrdersPagination;
  summary: CustomerOrdersSummary;
}

export async function getCustomerOrders(
  customerId: string,
  options: {
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<CustomerOrdersResponse> {
  const params = new URLSearchParams();

  if (options.dateFrom) {
    params.set("dateFrom", options.dateFrom);
  }

  if (options.dateTo) {
    params.set("dateTo", options.dateTo);
  }

  if (options.page !== undefined) {
    params.set("page", String(options.page));
  }

  if (options.pageSize !== undefined) {
    params.set("pageSize", String(options.pageSize));
  }

  const queryString = params.toString();

  const response = await apiFetch<{
    data: StrapiOrder[];
    meta: {
      pagination: CustomerOrdersPagination;
      summary: CustomerOrdersSummary;
    };
  }>(
    `/orders/by-customer/${customerId}${queryString ? `?${queryString}` : ""}`,
  );

  return {
    data: response.data.map(mapOrder),
    pagination: response.meta.pagination,
    summary: response.meta.summary,
  };
}

export async function getOrdersBySalesRep(
  salesRepId: string,
): Promise<Order[]> {
  const params = new URLSearchParams({
    "filters[salesRep][documentId][$eq]": salesRepId,
    "populate[customer]": "true",
    "populate[salesRep]": "true",
    "populate[orderItems][populate][product]": "true",
    "populate[bankAccount]": "true",
  });

  const response = await apiFetch<StrapiResponse<StrapiOrder[]>>(
    `/orders?${params.toString()}`,
  );

  return response.data.map(mapOrder);
}

export async function getSalesRepOrders(
  salesRepId: string,
  options: {
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<SalesRepOrdersResponse> {
  const params = new URLSearchParams();

  if (options.dateFrom) params.set("dateFrom", options.dateFrom);
  if (options.dateTo) params.set("dateTo", options.dateTo);
  if (options.page !== undefined) {
    params.set("page", String(options.page));
  }
  if (options.pageSize !== undefined) {
    params.set("pageSize", String(options.pageSize));
  }

  const queryString = params.toString();

  const response = await apiFetch<{
    data: StrapiOrder[];
    meta: {
      pagination: CustomerOrdersPagination;
      summary: CustomerOrdersSummary;
    };
  }>(
    `/orders/by-sales-rep/${salesRepId}${queryString ? `?${queryString}` : ""}`,
  );

  return {
    data: response.data.map(mapOrder),
    pagination: response.meta.pagination,
    summary: response.meta.summary,
  };
}

export async function getRecentOrders(limit: number): Promise<Order[]> {
  const params = new URLSearchParams({
    "filters[cancelled][$eq]": "false",
    "sort[0]": "createdAt:desc",
    "pagination[pageSize]": String(limit),
    "populate[customer]": "true",
    "populate[salesRep]": "true",
    "populate[orderItems][populate][product]": "true",
    "populate[bankAccount]": "true",
  });

  const response = await apiFetch<StrapiResponse<StrapiOrder[]>>(
    `/orders?${params.toString()}`,
  );

  return response.data.map(mapOrder);
}

export async function getOrderById(id: string): Promise<Order> {
  const response = await apiFetch<StrapiResponse<StrapiOrder>>(
    `/orders/${id}?populate[customer]=true&populate[salesRep]=true&populate[orderItems][populate][product]=true&populate[bankAccount]=true`,
  );

  return mapOrder(response.data);
}

export interface UpdateOrderItemInput {
  product: string;
  quantity: number;
}

export interface UpdateOrderInput {
  customer: string;
  recipientName: string;
  recipientPhone: string;
  remittance: number;
  bankAccount?: string | null;
  items: UpdateOrderItemInput[];
}

export interface UpdateOrderResponse {
  documentId: string;
  code: string;
  sequenceNumber: number;
  date: string;
  total: number;
  productsTotal: number;
  remittance: number;
  paymentStatus: "paid" | "pending";
}

export async function updateOrder(
  id: string,
  data: UpdateOrderInput,
): Promise<UpdateOrderResponse> {
  return apiFetch<UpdateOrderResponse>(`/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export interface CreateOrderItemInput {
  product: string;
  quantity: number;
}

export interface CreateOrderInput {
  date: string;
  salesRep: string;
  customer: string;
  recipientName: string;
  recipientPhone: string;
  remittance: number;
  bankAccount?: string | null;
  items: CreateOrderItemInput[];
}

export interface CreateOrderResponse {
  documentId: string;
  code: string;
  sequenceNumber: number;
  total: number;
  productsTotal: number;
  remittance: number;
  paymentStatus: "paid" | "pending";
}

export async function createOrder(
  data: CreateOrderInput,
): Promise<CreateOrderResponse> {
  return apiFetch<CreateOrderResponse>("/orders/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface CancelOrderResponse {
  documentId: string;
  code: string;
  cancelled: boolean;
}

export async function cancelOrder(id: string): Promise<CancelOrderResponse> {
  return apiFetch<CancelOrderResponse>(`/orders/${id}/cancel`, {
    method: "PUT",
  });
}

export async function getStatistics(
  options: {
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<StatisticsResponse> {
  const params = new URLSearchParams();

  if (options.dateFrom) params.set("dateFrom", options.dateFrom);
  if (options.dateTo) params.set("dateTo", options.dateTo);
  if (options.page !== undefined) params.set("page", String(options.page));
  if (options.pageSize !== undefined) {
    params.set("pageSize", String(options.pageSize));
  }

  const queryString = params.toString();

  const response = await apiFetch<{
    data: {
      summary: StatisticsSummary;
      daily: DailyStat[];
    };
    meta: {
      pagination: StatisticsResponse["pagination"];
    };
  }>(`/orders/statistics${queryString ? `?${queryString}` : ""}`);

  return {
    summary: response.data.summary,
    daily: response.data.daily,
    pagination: response.meta.pagination,
  };
}

export interface BankAccountOrdersResponse {
  bankAccount: BankAccount;
  summary: {
    totalOrders: number;
    totalAmount: number;
  };
  data: Order[];
  pagination: CustomerOrdersPagination;
}

export async function getBankAccountOrders(
  bankAccountId: string,
  options: {
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<BankAccountOrdersResponse> {
  const params = new URLSearchParams();

  if (options.dateFrom) params.set("dateFrom", options.dateFrom);
  if (options.dateTo) params.set("dateTo", options.dateTo);
  if (options.page !== undefined) params.set("page", String(options.page));
  if (options.pageSize !== undefined) {
    params.set("pageSize", String(options.pageSize));
  }

  const queryString = params.toString();

  const response = await apiFetch<{
    bankAccount: StrapiBankAccount;
    summary: {
      totalOrders: number;
      totalAmount: number;
    };
    data: StrapiOrder[];
    pagination: CustomerOrdersPagination;
  }>(
    `/orders/by-bank-account/${bankAccountId}${queryString ? `?${queryString}` : ""}`,
  );

  return {
    bankAccount: {
      id: response.bankAccount.documentId,
      name: response.bankAccount.name,
      active: response.bankAccount.active,
    },
    summary: response.summary,
    data: response.data.map(mapOrder),
    pagination: response.pagination,
  };
}
