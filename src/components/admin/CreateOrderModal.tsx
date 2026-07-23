import React, { useState } from 'react';
import { useDb } from '../../context/DbContext';
import { generateNextOrderId, generateNextCustomerId } from '../../lib/storage';
import {
  ShoppingBag,
  Plus,
  Minus,
  Search,
  X,
  CheckCircle2,
  Trash2,
  Clock,
  User as UserIcon,
  Phone,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessOrderCreated?: (orderId: string) => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccessOrderCreated,
}) => {
  const { products, addOrder } = useDb();

  // Generated metadata
  const [orderId] = useState(() => generateNextOrderId());
  const [customerId, setCustomerId] = useState(() => generateNextCustomerId());
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');

  // Product Selection Map: product_id -> quantity
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [productSearch, setProductSearch] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const availableProducts = products.filter(p => p.status !== 'out_of_stock');
  const filteredProducts = availableProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleQuantityChange = (productId: string, delta: number) => {
    setSelectedQuantities(prev => {
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

  // Selected items calculations
  const selectedItemsList = Object.entries(selectedQuantities)
    .map(([prodId, qty]) => {
      const prod = products.find(p => p.id === prodId);
      if (!prod) return null;
      return {
        product_id: prod.id,
        product_name: prod.name,
        product_photo: prod.photo_url,
        price: prod.price,
        quantity: qty,
      };
    })
    .filter(Boolean) as Array<{
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

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (selectedItemsList.length === 0) {
      setFormError('Please select at least one plant product for this order.');
      return;
    }

    const createdOrder = addOrder({
      customer_id: customerId.trim(),
      customer_name: customerName.trim(),
      customer_mobile: customerMobile.trim(),
      items: selectedItemsList,
    });

    onClose();
    if (onSuccessOrderCreated) {
      onSuccessOrderCreated(createdOrder.id);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-emerald-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300 font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>Create Plant Order</span>
                  <span className="text-xs font-mono font-bold bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-md border border-emerald-700">
                    {orderId}
                  </span>
                </h3>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  Order Date: {new Date().toLocaleDateString()} • Initial Status:
                  <span className="ml-1 text-red-300 font-bold uppercase tracking-wider">
                    Pending
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content - Scrollable */}
          <form onSubmit={handleSaveOrder} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {formError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <X className="w-4 h-4 text-red-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Customer Information Fields */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-emerald-600" />
                <span>Customer Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Customer ID
                  </label>
                  <input
                    type="text"
                    required
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Customer Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Alice Green"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Customer Mobile <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="e.g. +1 555-0199"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Product Selection Section */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Select Products for Order</span>
                </h4>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search plants..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Product Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1 bg-slate-50/50 rounded-xl border border-slate-200/80">
                {filteredProducts.map((p) => {
                  const qty = selectedQuantities[p.id] || 0;
                  const isSelected = qty > 0;
                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 bg-white ${
                        isSelected
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={p.photo_url}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs truncate">{p.name}</p>
                          <p className="text-emerald-700 font-extrabold text-xs">
                            ৳{p.price.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controller (+ / -) */}
                      <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(p.id, -1)}
                          disabled={qty === 0}
                          className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-extrabold text-slate-900">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(p.id, 1)}
                          className="w-6 h-6 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Items Summary Table */}
            {selectedItemsList.length > 0 && (
              <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/80 space-y-3">
                <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Selected Products ({selectedItemsList.length})</span>
                  <span className="text-xs font-normal text-emerald-700">Unlimited products allowed</span>
                </h4>

                <div className="divide-y divide-emerald-100">
                  {selectedItemsList.map((item) => (
                    <div key={item.product_id} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.product_photo}
                          alt={item.product_name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-md object-cover border border-emerald-200"
                        />
                        <span className="font-bold text-slate-900">{item.product_name}</span>
                        <span className="text-slate-500 font-semibold">x {item.quantity}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-emerald-800">
                          ৳{(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.product_id, -item.quantity)}
                          className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                          title="Remove product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* Modal Footer with Total & Save */}
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Total Order Amount
              </span>
              <span className="text-2xl font-black text-emerald-700 tracking-tight">
                ৳{totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOrder}
                className="flex-1 sm:flex-none py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                Save Order (Set as Pending)
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
