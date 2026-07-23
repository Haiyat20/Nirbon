import React, { useState, useEffect } from 'react';
import { useDb } from '../../context/DbContext';
import { Order, OrderStatus } from '../../types';
import {
  ShoppingBag,
  Plus,
  Minus,
  Search,
  X,
  CheckCircle2,
  Trash2,
  User as UserIcon,
  Phone,
  Edit3,
  Clock,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EditOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { products, editOrder } = useDb();

  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [status, setStatus] = useState<OrderStatus>('Pending');
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [productSearch, setProductSearch] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setCustomerName(order.customer_name || '');
      setCustomerMobile(order.customer_mobile || '');
      setStatus(order.status || 'Pending');

      const qtyMap: Record<string, number> = {};
      order.items.forEach((item) => {
        qtyMap[item.product_id] = item.quantity;
      });
      setSelectedQuantities(qtyMap);
      setFormError(null);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleQuantityChange = (productId: string, delta: number) => {
    setSelectedQuantities((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const selectedItemsList = Object.entries(selectedQuantities)
    .map(([prodId, qty]) => {
      const prod = products.find((p) => p.id === prodId);
      if (!prod) return null;
      return {
        id: `item-${order.id}-${prod.id}`,
        order_id: order.id,
        product_id: prod.id,
        product_name: prod.name,
        product_photo: prod.photo_url,
        price: prod.price,
        quantity: qty,
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    product_photo: string;
    price: number;
    quantity: number;
  }>;

  const totalAmount = selectedItemsList.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleUpdateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (selectedItemsList.length === 0) {
      setFormError('Please select at least one plant product for this order.');
      return;
    }

    editOrder(order.id, {
      customer_name: customerName.trim() || undefined,
      customer_mobile: customerMobile.trim() || undefined,
      status,
      items: selectedItemsList,
      total_amount: Math.round(totalAmount * 100) / 100,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Edit Order</span>
                  <span className="font-mono text-emerald-400 text-sm">{order.id}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update customer info, order items, quantities, or order status.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdateOrder} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs font-semibold">
                {formError}
              </div>
            )}

            {/* Customer & Status Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Customer Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="e.g. +880 1700-000000"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Order Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Pending">Pending (Processing)</option>
                  <option value="Approved">Approved (Packed & Dispatched)</option>
                </select>
              </div>
            </div>

            {/* Product Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Selectable Products */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Select Plants
                  </h4>
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search plant..."
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-xs focus:bg-white"
                    />
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                  {filteredProducts.map((p) => {
                    const qty = selectedQuantities[p.id] || 0;
                    return (
                      <div key={p.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 p-1.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={p.photo_url}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-xs truncate">{p.name}</p>
                            <p className="text-emerald-700 font-extrabold text-xs">
                              ৳{p.price.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {qty > 0 && (
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(p.id, -1)}
                              className="p-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {qty > 0 && (
                            <span className="w-6 text-center text-xs font-extrabold text-slate-900">
                              {qty}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(p.id, 1)}
                            className={`p-1 rounded-md transition-colors ${
                              qty > 0
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Order Items Summary */}
              <div className="space-y-3 flex flex-col">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Order Items ({selectedItemsList.length})
                </h4>

                <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-3 min-h-[160px] max-h-72 overflow-y-auto space-y-2">
                  {selectedItemsList.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                      <ShoppingBag className="w-8 h-8 mb-2 stroke-1" />
                      <p className="text-xs">No plant products selected.</p>
                    </div>
                  ) : (
                    selectedItemsList.map((item) => (
                      <div
                        key={item.product_id}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={item.product_photo}
                            alt={item.product_name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-md object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{item.product_name}</p>
                            <p className="text-slate-500 text-[11px]">
                              ৳{item.price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-emerald-800">
                            ৳{(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.product_id, -item.quantity)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Total Summary */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Total Order Amount
                  </span>
                  <span className="text-xl font-black text-emerald-700 tracking-tight">
                    ৳{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
