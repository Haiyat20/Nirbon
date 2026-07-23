import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Product, Order, OrderStatusHistory, OrderStatus, DashboardStats, DateFilter, StatusFilter } from '../types';
import * as storage from '../lib/storage';
import {
  fetchUsersFromSupabase,
  insertUserToSupabase,
  updateUserInSupabase,
  deleteUserInSupabase,
  fetchProductsFromSupabase,
  insertProductToSupabase,
  updateProductInSupabase,
  deleteProductInSupabase,
  fetchOrdersFromSupabase,
  insertOrderToSupabase,
  updateOrderStatusInSupabase,
  updateOrderInSupabase,
  fetchOrderHistoryFromSupabase,
  insertOrderHistoryToSupabase,
  autoSeedSupabaseIfEmpty,
} from '../lib/supabase';

interface DbContextType {
  users: User[];
  products: Product[];
  orders: Order[];
  orderHistory: OrderStatusHistory[];
  stats: DashboardStats;
  isSupabaseSyncing: boolean;

  // Refresh & Reset
  refreshAll: () => Promise<void>;
  resetData: () => Promise<void>;

  // Employee CRUD
  addEmployee: (data: Omit<User, 'id' | 'created_at' | 'role'>) => User;
  editEmployee: (id: string, updates: Partial<User>) => void;
  removeEmployee: (id: string) => void;
  toggleEmployeeActive: (id: string) => void;
  resetPassword: (id: string, newPass: string) => void;

  // Product CRUD
  addProduct: (data: Omit<Product, 'id' | 'created_at'>) => Product;
  editProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;

  // Order CRUD & Status
  addOrder: (data: {
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
  }) => Order;
  editOrder: (orderId: string, updates: Partial<Order>) => void;
  changeOrderStatus: (orderId: string, newStatus: OrderStatus, employeeName: string) => boolean;

  // Filters & Search State
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (sf: StatusFilter) => void;
  dateFilter: DateFilter;
  setDateFilter: (df: DateFilter) => void;

  // Filtered Orders Helper
  getFilteredOrders: () => Order[];
}

const DbContext = createContext<DbContextType | undefined>(undefined);

export const DbProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderStatusHistory[]>([]);
  const [isSupabaseSyncing, setIsSupabaseSyncing] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const refreshAll = useCallback(async () => {
    setIsSupabaseSyncing(true);

    // 1. Try fetching from Supabase
    const [sbUsers, sbProducts, sbOrders, sbHistory] = await Promise.all([
      fetchUsersFromSupabase(),
      fetchProductsFromSupabase(),
      fetchOrdersFromSupabase(),
      fetchOrderHistoryFromSupabase(),
    ]);

    let finalUsers = sbUsers;
    let finalProducts = sbProducts;
    let finalOrders = sbOrders;
    let finalHistory = sbHistory;

    // If Supabase returned empty results, trigger auto seed
    if (!sbUsers || !sbProducts || !sbOrders || !sbHistory) {
      await autoSeedSupabaseIfEmpty();

      // Refetch after seed attempt
      finalUsers = (await fetchUsersFromSupabase()) || storage.getUsers();
      finalProducts = (await fetchProductsFromSupabase()) || storage.getProducts();
      finalOrders = (await fetchOrdersFromSupabase()) || storage.getOrders();
      finalHistory = (await fetchOrderHistoryFromSupabase()) || storage.getOrderHistory();
    }

    setUsers(finalUsers || []);
    setProducts(finalProducts || []);
    setOrders(finalOrders || []);
    setOrderHistory(finalHistory || []);

    // Sync to local cache
    if (finalUsers) storage.saveUsers(finalUsers);
    if (finalProducts) storage.saveProducts(finalProducts);
    if (finalOrders) storage.saveOrders(finalOrders);
    if (finalHistory) storage.saveOrderHistory(finalHistory);

    setIsSupabaseSyncing(false);
  }, []);

  useEffect(() => {
    storage.initStorage();
    refreshAll();
  }, [refreshAll]);

  const resetData = async () => {
    storage.resetStorageToDefault();
    await refreshAll();
  };

  // Employees
  const addEmployee = (data: Omit<User, 'id' | 'created_at' | 'role'>) => {
    const newEmp = storage.createEmployee(data);
    setUsers((prev) => [newEmp, ...prev]);
    insertUserToSupabase(newEmp);
    return newEmp;
  };

  const editEmployee = (id: string, updates: Partial<User>) => {
    storage.updateEmployee(id, updates);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    updateUserInSupabase(id, updates);
  };

  const removeEmployee = (id: string) => {
    storage.deleteEmployee(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    deleteUserInSupabase(id);
  };

  const toggleEmployeeActive = (id: string) => {
    const updated = storage.toggleEmployeeStatus(id);
    if (updated) {
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      updateUserInSupabase(id, { status: updated.status });
    }
  };

  const resetPassword = (id: string, newPass: string) => {
    storage.resetEmployeePassword(id, newPass);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, password: newPass } : u)));
    updateUserInSupabase(id, { password: newPass });
  };

  // Products
  const addProduct = (data: Omit<Product, 'id' | 'created_at'>) => {
    const prod = storage.createProduct(data);
    setProducts((prev) => [prod, ...prev]);
    insertProductToSupabase(prod);
    return prod;
  };

  const editProduct = (id: string, updates: Partial<Product>) => {
    storage.updateProduct(id, updates);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    updateProductInSupabase(id, updates);
  };

  const removeProduct = (id: string) => {
    storage.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteProductInSupabase(id);
  };

  // Orders
  const addOrder = (data: {
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
  }) => {
    const order = storage.createOrder(data);
    setOrders((prev) => [order, ...prev]);
    insertOrderToSupabase(order);
    return order;
  };

  const editOrder = (orderId: string, updates: Partial<Order>) => {
    const updated = storage.updateOrder(orderId, updates);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      updateOrderInSupabase(orderId, updated);
    }
  };

  const changeOrderStatus = (orderId: string, newStatus: OrderStatus, employeeName: string) => {
    const res = storage.updateOrderStatus(orderId, newStatus, employeeName);
    if (res) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      setOrderHistory((prev) => [res.historyRecord, ...prev]);

      updateOrderStatusInSupabase(orderId, newStatus);
      insertOrderHistoryToSupabase(res.historyRecord);
      return true;
    }
    return false;
  };

  // Calculate Dashboard Count Stats
  const calculateStats = (): DashboardStats => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const todayOrders = orders.filter((o) => {
      const oDateStr = new Date(o.order_date).toISOString().split('T')[0];
      return oDateStr === todayStr;
    });

    const todayOrdersCount = todayOrders.length;
    const todayPendingCount = todayOrders.filter((o) => o.status === 'Pending').length;
    const todayApprovedCount = todayOrders.filter((o) => o.status === 'Approved').length;

    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const weeklyOrdersCount = orders.filter((o) => new Date(o.order_date) >= sevenDaysAgo).length;

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyOrdersCount = orders.filter((o) => new Date(o.order_date) >= startOfMonth).length;

    return {
      todayOrdersCount,
      todayPendingCount,
      todayApprovedCount,
      weeklyOrdersCount,
      monthlyOrdersCount,
    };
  };

  const stats = calculateStats();

  // Filter helper for orders
  const getFilteredOrders = (): Order[] => {
    return orders.filter((order) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesOrderId = order.id.toLowerCase().includes(q);
        const matchesCustId = order.customer_id.toLowerCase().includes(q);
        const matchesCustName = order.customer_name?.toLowerCase().includes(q);
        const matchesItems = order.items.some((item) =>
          item.product_name.toLowerCase().includes(q)
        );
        if (!matchesOrderId && !matchesCustId && !matchesCustName && !matchesItems) {
          return false;
        }
      }

      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      if (dateFilter !== 'all') {
        const now = new Date();
        const oDate = new Date(order.order_date);
        const todayStr = now.toISOString().split('T')[0];
        const oDateStr = oDate.toISOString().split('T')[0];

        if (dateFilter === 'today') {
          if (oDateStr !== todayStr) return false;
        } else if (dateFilter === 'this_week') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
          if (oDate < sevenDaysAgo) return false;
        } else if (dateFilter === 'this_month') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          if (oDate < startOfMonth) return false;
        }
      }

      return true;
    });
  };

  return (
    <DbContext.Provider
      value={{
        users,
        products,
        orders,
        orderHistory,
        stats,
        isSupabaseSyncing,
        refreshAll,
        resetData,
        addEmployee,
        editEmployee,
        removeEmployee,
        toggleEmployeeActive,
        resetPassword,
        addProduct,
        editProduct,
        removeProduct,
        addOrder,
        editOrder,
        changeOrderStatus,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        dateFilter,
        setDateFilter,
        getFilteredOrders,
      }}
    >
      {children}
    </DbContext.Provider>
  );
};

export const useDb = (): DbContextType => {
  const context = useContext(DbContext);
  if (!context) {
    throw new Error('useDb must be used within a DbProvider');
  }
  return context;
};
