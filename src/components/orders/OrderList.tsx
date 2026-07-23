import React, { useState } from 'react';
import { useDb } from '../../context/DbContext';
import { Order, OrderStatus, StatusFilter, DateFilter } from '../../types';
import {
  ShoppingBag,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Clock,
  CheckCircle2,
  Calendar,
  Eye,
  User as UserIcon,
  Phone,
  ArrowUpDown,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { OrderDetailModal } from './OrderDetailModal';

interface OrderListProps {
  titleOverride?: string;
  defaultStatusFilter?: StatusFilter;
  onOpenCreateOrder?: () => void;
  isAdmin?: boolean;
}

export const OrderList: React.FC<OrderListProps> = ({
  titleOverride,
  defaultStatusFilter = 'all',
  onOpenCreateOrder,
  isAdmin = false,
}) => {
  const {
    orders,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    getFilteredOrders,
  } = useDb();

  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = getFilteredOrders();

  const getStatusBadge = (st: OrderStatus) => {
    if (st === 'Pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-red-100 text-red-800 border border-red-200/80 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-red-600" />
          <span>Pending</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200/80 shadow-2xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Approved</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-600" />
            <span>{titleOverride || 'Plant Orders'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search orders by Order ID or Customer ID, update status, and inspect product details.
          </p>
        </div>

        {isAdmin && onOpenCreateOrder && (
          <button
            type="button"
            onClick={onOpenCreateOrder}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-98 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Order</span>
          </button>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        {/* Row 1: Search + View Mode */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID or Customer ID..."
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Row 2: Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Status Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Status:</span>
            </span>

            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Status
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('Pending')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'Pending'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Pending Only
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('Approved')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'Approved'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Approved Only
            </button>
          </div>

          {/* Date Range Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Timeframe:</span>
            </span>

            <button
              type="button"
              onClick={() => setDateFilter('all')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Time
            </button>

            <button
              type="button"
              onClick={() => setDateFilter('today')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => setDateFilter('this_week')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'this_week'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              This Week
            </button>

            <button
              type="button"
              onClick={() => setDateFilter('this_month')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'this_month'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Orders List Rendering */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">No Orders Found</p>
          <p className="text-xs text-slate-500 mt-1">
            No orders match your current search query or active filter settings.
          </p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const totalItemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="font-mono text-base font-extrabold text-slate-900 block">
                        {order.id}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 font-mono">
                        Cust ID: {order.customer_id}
                      </span>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  {/* Customer & Date */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1 mb-4">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-bold">{order.customer_name || 'Walk-in Customer'}</span>
                      {order.customer_mobile && (
                        <span className="text-slate-500">{order.customer_mobile}</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Order Date: {new Date(order.order_date).toLocaleString()}
                    </div>
                  </div>

                  {/* Product List Snippet */}
                  <div className="space-y-2 mb-4">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Product Items ({totalItemsCount})
                    </p>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={item.product_photo}
                              alt={item.product_name}
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <span className="font-medium text-slate-800 truncate">
                              {item.product_name}
                            </span>
                          </div>
                          <span className="font-extrabold text-slate-900 shrink-0 ml-2">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer with Amount & Details Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total Amount
                    </span>
                    <span className="text-lg font-black text-emerald-700">
                      ৳{order.total_amount.toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View & Packing</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Order ID</th>
                  <th className="py-3.5 px-4">Customer ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-extrabold text-slate-900">
                      {order.id}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">
                      {order.customer_id}
                    </td>

                    <td className="py-3.5 px-4 text-xs font-medium text-slate-500">
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-emerald-700">
                      ৳{order.total_amount.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail & Packing Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};
