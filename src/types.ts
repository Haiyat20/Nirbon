export type UserRole = 'admin' | 'employee';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  full_name: string;
  username: string;
  password?: string;
  mobile_number: string;
  status: UserStatus;
  role: UserRole;
  created_at: string;
}

export type ProductStatus = 'available' | 'out_of_stock' | 'limited';

export interface Product {
  id: string;
  name: string;
  photo_url: string;
  price: number;
  status: ProductStatus;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  product_photo: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Approved';

export interface Order {
  id: string; // Order ID e.g. ORD-10042
  customer_id: string; // Customer ID e.g. CUST-5832
  customer_name?: string;
  customer_mobile?: string;
  total_amount: number;
  order_date: string; // Automatic ISO date
  status: OrderStatus;
  items: OrderItem[];
  created_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  previous_status: OrderStatus;
  new_status: OrderStatus;
  employee_name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  created_at: string;
}

export type DateFilter = 'all' | 'today' | 'this_week' | 'this_month';
export type StatusFilter = 'all' | 'Pending' | 'Approved';

export interface DashboardStats {
  todayOrdersCount: number;
  todayPendingCount: number;
  todayApprovedCount: number;
  weeklyOrdersCount: number;
  monthlyOrdersCount: number;
}
