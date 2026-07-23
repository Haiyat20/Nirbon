import React from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionAttempted?: string;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({
  isOpen,
  onClose,
  actionAttempted = 'access this restricted section',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-100"
          >
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <ShieldAlert className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                You do not have permission to <strong className="text-slate-900 font-semibold">{actionAttempted}</strong>.
                Employee permissions are restricted to viewing orders and updating packing status.
              </p>
              <div className="bg-red-50/80 rounded-xl p-3 text-left border border-red-100 mb-6">
                <p className="text-xs font-semibold text-red-800 uppercase tracking-wider mb-1">
                  Employee Restricted Actions:
                </p>
                <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                  <li>Create, Edit, or Delete Orders</li>
                  <li>Add, Edit, or Delete Products & Prices</li>
                  <li>Manage Employee Accounts</li>
                  <li>Modify System Settings</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-sm transition-colors shadow-sm focus:outline-hidden focus:ring-2 focus:ring-slate-400"
              >
                Understand & Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
