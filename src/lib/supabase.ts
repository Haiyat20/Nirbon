/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import { User, Product, Order, OrderStatusHistory, OrderStatus } from '../types';
import { INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_ORDER_HISTORY } from '../data/initialData';

const DEFAULT_SUPABASE_URL = 'https://ljfjezfqajanjhjytild.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_sWuCLYqyza2MAgRM-J5f0g_Z_0gYuLK';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- SUPABASE CRUD OPERATIONS FOR APPLICATION DATA ---

// 1. Users / Employees
export async function fetchUsersFromSupabase(): Promise<User[] | null> {
  try {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase fetchUsers error:', error.message);
      return null;
    }
    if (data && data.length > 0) {
      return data as User[];
    }
    return null;
  } catch (err) {
    console.error('Failed to query users from Supabase:', err);
    return null;
  }
}

export async function insertUserToSupabase(user: User): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').insert([{
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      password: user.password || 'password123',
      mobile_number: user.mobile_number,
      status: user.status,
      role: user.role,
      created_at: user.created_at || new Date().toISOString(),
    }]);
    if (error) console.warn('Supabase insertUser error:', error.message);
    return !error;
  } catch (err) {
    console.error('Failed to insert user to Supabase:', err);
    return false;
  }
}

export async function updateUserInSupabase(id: string, updates: Partial<User>): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').update(updates).eq('id', id);
    if (error) console.warn('Supabase updateUser error:', error.message);
    return !error;
  } catch (err) {
    console.error('Failed to update user in Supabase:', err);
    return false;
  }
}

export async function deleteUserInSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) console.warn('Supabase deleteUser error:', error.message);
    return !error;
  } catch (err) {
    console.error('Failed to delete user in Supabase:', err);
    return false;
  }
}

// 2. Products
export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase fetchProducts error:', error.message);
      return null;
    }
    if (data && data.length > 0) {
      return data as Product[];
    }
    return null;
  } catch (err) {
    console.error('Failed to query products from Supabase:', err);
    return null;
  }
}

export async function insertProductToSupabase(product: Product): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').insert([{
      id: product.id,
      name: product.name,
      photo_url: product.photo_url,
      price: product.price,
      status: product.status,
      created_at: product.created_at || new Date().toISOString(),
    }]);
    if (error) console.warn('Supabase insertProduct error:', error.message);
    return !error;
  } catch (err) {
    console.error('Failed to insert product to Supabase:', err);
    return false;
  }
}

export async function updateProductInSupabase(id: string, updates: Partial<Product>): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (error) console.warn('Supabase updateProduct error:', error.message);
    return !error;
  } catch (err) {
    console.error('Failed to update product in Supabase:', err);
    return false;
  }
}

export async function deleteProductInSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) console.warn('Supabase deleteProduct error:', error.message);
    return !error;
  } catch (err) {
    console.error('Failed to delete product in Supabase:', err);
    return false;
  }
}

// 3. Orders & Order Items
export async function fetchOrdersFromSupabase(): Promise<Order[] | null> {
  try {
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError || !ordersData || ordersData.length === 0) {
      if (ordersError) console.warn('Supabase fetchOrders error:', ordersError.message);
      return null;
    }

    const { data: itemsData } = await supabase.from('order_items').select('*');

    const mappedOrders: Order[] = ordersData.map((ord) => {
      const matchedItems = itemsData
        ? itemsData.filter((i) => i.order_id === ord.id)
        : [];
      return {
        id: ord.id,
        customer_id: ord.customer_id,
        customer_name: ord.customer_name,
        customer_mobile: ord.customer_mobile,
        total_amount: Number(ord.total_amount),
        order_date: ord.order_date || ord.created_at,
        status: ord.status as OrderStatus,
        items: matchedItems.map((mi) => ({
          id: mi.id,
          order_id: mi.order_id,
          product_id: mi.product_id,
          product_name: mi.product_name,
          product_photo: mi.product_photo,
          price: Number(mi.price),
          quantity: Number(mi.quantity),
        })),
        created_at: ord.created_at,
      };
    });

    return mappedOrders;
  } catch (err) {
    console.error('Failed to query orders from Supabase:', err);
    return null;
  }
}

export async function insertOrderToSupabase(order: Order): Promise<boolean> {
  try {
    const { error: orderErr } = await supabase.from('orders').insert([{
      id: order.id,
      customer_id: order.customer_id,
      customer_name: order.customer_name,
      customer_mobile: order.customer_mobile,
      total_amount: order.total_amount,
      order_date: order.order_date,
      status: order.status,
      created_at: order.created_at,
    }]);

    if (orderErr) {
      console.warn('Supabase insertOrder error:', orderErr.message);
      return false;
    }

    if (order.items && order.items.length > 0) {
      const itemsToInsert = order.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_photo: item.product_photo,
        price: item.price,
        quantity: item.quantity,
      }));
      await supabase.from('order_items').insert(itemsToInsert);
    }

    return true;
  } catch (err) {
    console.error('Failed to insert order to Supabase:', err);
    return false;
  }
}

export async function updateOrderStatusInSupabase(orderId: string, newStatus: OrderStatus): Promise<boolean> {
  try {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) console.warn('Supabase updateOrderStatus error:', error.message);
    return !error;
  } catch (err) {
    console.error('Failed to update order status in Supabase:', err);
    return false;
  }
}

export async function updateOrderInSupabase(orderId: string, updatedOrder: Order): Promise<boolean> {
  try {
    const { error: orderErr } = await supabase.from('orders').update({
      customer_name: updatedOrder.customer_name,
      customer_mobile: updatedOrder.customer_mobile,
      total_amount: updatedOrder.total_amount,
      status: updatedOrder.status,
    }).eq('id', orderId);

    if (orderErr) {
      console.warn('Supabase updateOrder error:', orderErr.message);
      return false;
    }

    if (updatedOrder.items) {
      await supabase.from('order_items').delete().eq('order_id', orderId);

      if (updatedOrder.items.length > 0) {
        const itemsToInsert = updatedOrder.items.map((item) => ({
          order_id: orderId,
          product_id: item.product_id,
          product_name: item.product_name,
          product_photo: item.product_photo,
          price: item.price,
          quantity: item.quantity,
        }));
        await supabase.from('order_items').insert(itemsToInsert);
      }
    }

    return true;
  } catch (err) {
    console.error('Failed to update order in Supabase:', err);
    return false;
  }
}

// 4. Order Status History
export async function fetchOrderHistoryFromSupabase(): Promise<OrderStatusHistory[] | null> {
  try {
    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      if (error) console.warn('Supabase fetchOrderHistory error:', error.message);
      return null;
    }
    return data as OrderStatusHistory[];
  } catch (err) {
    console.error('Failed to query order history from Supabase:', err);
    return null;
  }
}

export async function insertOrderHistoryToSupabase(log: OrderStatusHistory): Promise<boolean> {
  try {
    const { error } = await supabase.from('order_status_history').insert([{
      order_id: log.order_id,
      previous_status: log.previous_status,
      new_status: log.new_status,
      employee_name: log.employee_name,
      date: log.date,
      time: log.time,
      created_at: log.created_at || new Date().toISOString(),
    }]);
    if (error) console.warn('Supabase insertOrderHistory error:', error.message);
    return !error;
  } catch (err) {
    console.error('Failed to insert order history to Supabase:', err);
    return false;
  }
}

// Helper: Seed Supabase if empty tables exist
export async function autoSeedSupabaseIfEmpty(): Promise<void> {
  try {
    // Seed users if empty
    const users = await fetchUsersFromSupabase();
    if (!users) {
      for (const u of INITIAL_USERS) {
        await insertUserToSupabase(u);
      }
    }

    // Seed products if empty
    const products = await fetchProductsFromSupabase();
    if (!products) {
      for (const p of INITIAL_PRODUCTS) {
        await insertProductToSupabase(p);
      }
    }

    // Seed orders if empty
    const orders = await fetchOrdersFromSupabase();
    if (!orders) {
      for (const o of INITIAL_ORDERS) {
        await insertOrderToSupabase(o);
      }
    }

    // Seed history if empty
    const history = await fetchOrderHistoryFromSupabase();
    if (!history) {
      for (const h of INITIAL_ORDER_HISTORY) {
        await insertOrderHistoryToSupabase(h);
      }
    }
  } catch (err) {
    console.error('Auto seed Supabase error:', err);
  }
}

// SQL Schema for manual Supabase setup or verification
export const SUPABASE_SQL_SCHEMA = `-- Plant Order Management Supabase Schema
-- Copy and paste this into your Supabase SQL Editor:

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'out_of_stock', 'limited')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  customer_name TEXT,
  customer_mobile TEXT,
  total_amount NUMERIC(10, 2) NOT NULL,
  order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  product_photo TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- 5. Order Status History Table
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Allow public access for client app operations
CREATE POLICY "Public Users Access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Products Access" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Orders Access" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Items Access" ON order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public History Access" ON order_status_history FOR ALL USING (true) WITH CHECK (true);
`;
