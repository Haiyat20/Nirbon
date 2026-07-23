import React, { useState } from 'react';
import { useDb } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';
import { Order, OrderStatus } from '../../types';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  X,
  User as UserIcon,
  Phone,
  Calendar,
  AlertCircle,
  History,
  ArrowRight,
  ShieldCheck,
  Check,
  Edit3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EditOrderModal } from '../admin/EditOrderModal';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  const { changeOrderStatus, orderHistory } = useDb();
  const { currentUser, isAdmin } = useAuth();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState<OrderStatus>('Approved');
  const [isEditingOrder, setIsEditingOrder] = useState(false);

  if (!order) return null;

  // Filter history logs for this specific order
  const orderLogs = orderHistory.filter(h => h.order_id === order.id);

  const isPending = order.status === 'Pending';
  const isApproved = order.status === 'Approved';

  const handleInitiateStatusChange = (newStatus: OrderStatus) => {
    setTargetStatus(newStatus);
    setShowConfirmModal(true);
  };

  const handleConfirmStatusChange = () => {
    if (!currentUser) return;
    const employeeName = currentUser.full_name || currentUser.username;
    changeOrderStatus(order.id, targetStatus, employeeName);
    setShowConfirmModal(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white font-mono">
                    {order.id}
                  </h3>
                  {isPending ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-red-500/20 text-red-300 border border-red-500/30">
                      Pending
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-green-500/20 text-green-300 border border-green-500/30">
                      Approved
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customer ID: <span className="font-mono font-bold text-slate-200">{order.customer_id}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsEditingOrder(true)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Order</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Details Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Customer Details</span>
                </p>
                <p className="font-bold text-slate-900 text-sm">
                  {order.customer_name || 'Walk-in Customer'}
                </p>
                {order.customer_mobile && (
                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.customer_mobile}</span>
                  </p>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Order Timestamp</span>
                </p>
                <p className="font-bold text-slate-900 text-sm">
                  {new Date(order.order_date).toLocaleString()}
                </p>
                <p className="text-xs text-emerald-700 font-extrabold">
                  Total Amount: ৳{order.total_amount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Plant Products List */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Ordered Plant Items ({order.items.length})
              </h4>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div key={item.id} className="p-3 sm:p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product_photo}
                        alt={item.product_name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{item.product_name}</p>
                        <p className="text-xs text-slate-500">
                          Unit Price: ৳{item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-600">
                        Qty: <strong className="text-slate-900 text-sm">{item.quantity}</strong>
                      </p>
                      <p className="text-xs font-extrabold text-emerald-700 mt-0.5">
                        ৳{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Change Controls */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Update Order Status
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Employees can transition status between Pending and Approved.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                {isPending ? (
                  <button
                    type="button"
                    onClick={() => handleInitiateStatusChange('Approved')}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Order (Packed & Dispatched)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleInitiateStatusChange('Pending')}
                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Revert Status to Pending (Correction Needed)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Order Status History Audit Trail */}
            {orderLogs.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-emerald-600" />
                  <span>Status Change Audit Logs</span>
                </h4>

                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden text-xs">
                  <div className="divide-y divide-slate-200/80">
                    {orderLogs.map((log) => (
                      <div key={log.id} className="p-3 flex items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-900">
                            Changed by: {log.employee_name}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Date: {log.date} at {log.time}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 font-semibold">
                          <span
                            className={
                              log.previous_status === 'Pending'
                                ? 'text-red-600'
                                : 'text-green-600'
                            }
                          >
                            {log.previous_status}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span
                            className={
                              log.new_status === 'Approved' ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            {log.new_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Required Prompt Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center"
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 mb-2">
              Dispatch Confirmation
            </h3>

            <p className="text-sm font-semibold text-slate-800 mb-6 bg-emerald-50 p-3.5 rounded-xl border border-emerald-200/80 leading-relaxed">
              "Have you packed and dispatched all plants?"
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                NO
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                YES
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Admin Edit Order Modal */}
      <EditOrderModal
        order={order}
        isOpen={isEditingOrder}
        onClose={() => setIsEditingOrder(false)}
      />
    </AnimatePresence>
  );
};
