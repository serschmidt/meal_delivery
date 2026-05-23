import { apiGet, apiPatch } from "./api";

export type SupplierOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARED"
  | "DELIVERED"
  | "CANCELLED";

export type SupplierOrderItem = {
  id: string;
  line_total: number;
  price: number;
  quantity: number;
  unit_price: number;
  order_id: string;
  weekly_menu_entry_id: string;
  meal_name: string;
  meal_description: string;
  menu_date: string;
  day_of_week: string;
};

export type SupplierOrderCustomer = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
};

export type SupplierOrderAddress = {
  id: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
};

export type SupplierOrder = {
  id: string;
  created_at: string;
  status: SupplierOrderStatus;
  total_price: number;
  billing_address_id: string;
  customer_id: string;
  delivery_address_id: string;
  supplier_id: string;
  weekly_menu_id: string;
  customer: SupplierOrderCustomer;
  delivery_address: SupplierOrderAddress;
  billing_address: SupplierOrderAddress;
  items: SupplierOrderItem[];
};

export type SupplierOrdersPagination = {
  limit: number;
  offset: number;
  count: number;
  total: number;
  has_more: boolean;
};

export type SupplierOrdersResponse = {
  items: SupplierOrder[];
  pagination: SupplierOrdersPagination;
};

export type SupplierOrdersQuery = {
  status?: SupplierOrderStatus | "ALL";
  limit?: number;
  offset?: number;
};

export async function getSupplierOrders(
  query: SupplierOrdersQuery = {},
): Promise<SupplierOrdersResponse> {
  const queryParams: Record<string, string | number | undefined> = {
    limit: query.limit ?? 10,
    offset: query.offset ?? 0,
  };

  if (query.status && query.status !== "ALL") {
    queryParams.status = query.status;
  }

  return apiGet<SupplierOrdersResponse>("supplier/orders", queryParams);
}

export async function getSupplierOrderById(orderId: string): Promise<SupplierOrder> {
  return apiGet<SupplierOrder>(`supplier/orders/${orderId}`);
}

export async function updateSupplierOrderStatus(
  orderId: string,
  status: SupplierOrderStatus,
): Promise<SupplierOrder> {
  return apiPatch<SupplierOrder, { status: SupplierOrderStatus }>(
    `supplier/orders/${orderId}/status`,
    { status },
  );
}