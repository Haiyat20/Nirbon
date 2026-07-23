import { User, Product, Order, OrderStatusHistory, OrderStatus } from '../types';
import { INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_ORDER_HISTORY } from '../data/initialData';

const USERS_KEY = 'plant_app_users_v1';
const PRODUCTS_KEY = 'plant_app_products_v1';
const ORDERS_KEY = 'plant_app_orders_v1';
const HISTORY_KEY = 'plant_app_history_v1';

// Initialize storage if empty
export function initStorage(): void {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(ORDERS_KEY)) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem(HISTORY_KEY)) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(INITIAL_ORDER_HISTORY));
  }
}

// Reset Storage to initial defaults
export function resetStorageToDefault(): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(HISTORY_KEY, JSON.stringify(INITIAL_ORDER_HISTORY));
}

// --- USERS / EMPLOYEES ---
export function getUsers(): User[] {
  initStorage();
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : INITIAL_USERS;
  } catch (err) {
    console.error('Error reading users from storage:', err);
    return INITIAL_USERS;
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function createEmployee(data: Omit<User, 'id' | 'created_at' | 'role'>): User {
  const users = getUsers();
  const newEmp: User = {
    ...data,
    id: `user-emp-${Date.now()}`,
    role: 'employee',
    created_at: new Date().toISOString(),
  };
  users.push(newEmp);
  saveUsers(users);
  return newEmp;
}

export function updateEmployee(id: string, updates: Partial<User>): User | null {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;

  users[index] = { ...users[index], ...updates };
  saveUsers(users);
  return users[index];
}

export function deleteEmployee(id: string): boolean {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== id);
  if (filtered.length === users.length) return false;
  saveUsers(filtered);
  return true;
}

export function toggleEmployeeStatus(id: string): User | null {
  const users = getUsers();
  const user = users.find(u => u.id === id);
  if (!user) return null;
  const newStatus = user.status === 'active' ? 'inactive' : 'active';
  return updateEmployee(id, { status: newStatus });
}

export function resetEmployeePassword(id: string, newPass: string): boolean {
  const updated = updateEmployee(id, { password: newPass });
  return updated !== null;
}

// --- PRODUCTS ---
export function getProducts(): Product[] {
  initStorage();
  try {
    const data = localStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : INITIAL_PRODUCTS;
  } catch (err) {
    console.error('Error reading products from storage:', err);
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function createProduct(data: Omit<Product, 'id' | 'created_at'>): Product {
  const products = getProducts();
  const newProduct: Product = {
    ...data,
    id: `prod-${Date.now().toString().slice(-5)}`,
    created_at: new Date().toISOString(),
  };
  products.unshift(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;

  products[index] = { ...products[index], ...updates };
  saveProducts(products);
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  saveProducts(filtered);
  return true;
}

// --- ORDERS ---
export function getOrders(): Order[] {
  initStorage();
  try {
    const data = localStorage.getItem(ORDERS_KEY);
    return data ? JSON.parse(data) : INITIAL_ORDERS;
  } catch (err) {
    console.error('Error reading orders from storage:', err);
    return INITIAL_ORDERS;
  }
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function generateNextOrderId(): string {
  const orders = getOrders();
  const numbers = orders.map(o => {
    const match = o.id.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  });
  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 800;
  return `ORD-${maxNum + 1}`;
}

export function generateNextCustomerId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `CUST-${num}`;
}

export function createOrder(data: {
  customer_id?: string;
  customer_name?: string;
  customer_mobile?: string;
  items: Array<{
    product_id: string;
    product_name: string;
    product_photo: string;
    price: number;
    quantity: number;
  }>;
}): Order {
  const orders = getOrders();
  const orderId = generateNextOrderId();
  const customerId = data.customer_id && data.customer_id.trim() ? data.customer_id.trim() : generateNextCustomerId();
  const totalAmount = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const now = new Date();

  const newOrder: Order = {
    id: orderId,
    customer_id: customerId,
    customer_name: data.customer_name?.trim() || undefined,
    customer_mobile: data.customer_mobile?.trim() || undefined,
    total_amount: Math.round(totalAmount * 100) / 100,
    order_date: now.toISOString(),
    status: 'Pending', // Default status per prompt requirement
    items: data.items.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product_name,
      product_photo: item.product_photo,
      price: item.price,
      quantity: item.quantity,
    })),
    created_at: now.toISOString(),
  };

  orders.unshift(newOrder);
  saveOrders(orders);
  return newOrder;
}

export function updateOrder(orderId: string, updates: Partial<Order>): Order | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const current = orders[index];
  const items = updates.items || current.items;
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updated: Order = {
    ...current,
    ...updates,
    items,
    total_amount: Math.round(totalAmount * 100) / 100,
  };

  orders[index] = updated;
  saveOrders(orders);
  return updated;
}

// --- ORDER STATUS HISTORY ---
export function getOrderHistory(): OrderStatusHistory[] {
  initStorage();
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : INITIAL_ORDER_HISTORY;
  } catch (err) {
    console.error('Error reading order history:', err);
    return INITIAL_ORDER_HISTORY;
  }
}

export function saveOrderHistory(history: OrderStatusHistory[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  employeeName: string
): { order: Order; historyRecord: OrderStatusHistory } | null {
  const orders = getOrders();
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) return null;

  const order = orders[orderIndex];
  const previousStatus = order.status;

  // Don't duplicate if status is already same
  if (previousStatus === newStatus) return null;

  // Update order status
  order.status = newStatus;
  orders[orderIndex] = order;
  saveOrders(orders);

  // Record history
  const historyList = getOrderHistory();
  const now = new Date();
  const historyRecord: OrderStatusHistory = {
    id: `hist-${Date.now()}`,
    order_id: orderId,
    previous_status: previousStatus,
    new_status: newStatus,
    employee_name: employeeName,
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().split(' ')[0],
    created_at: now.toISOString(),
  };

  historyList.unshift(historyRecord);
  saveOrderHistory(historyList);

  return { order, historyRecord };
}
