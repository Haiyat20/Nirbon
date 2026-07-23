import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  History,
  Clock,
  CheckCircle2,
  Lock,
  PlusCircle,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'orders'
  | 'pending'
  | 'approved'
  | 'products'
  | 'employees'
  | 'history';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenCreateOrder?: () => void;
  onAttemptRestrictedAction?: (action: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
  onOpenCreateOrder,
  onAttemptRestrictedAction,
}) => {
  const { isAdmin, isEmployee } = useAuth();
  const { stats } = useDb();

  const handleTabClick = (tab: ActiveTab) => {
    if (isEmployee && tab === 'employees') {
      if (onAttemptRestrictedAction) {
        onAttemptRestrictedAction('Manage Employee Accounts');
      }
      return;
    }
    setActiveTab(tab);
    onCloseMobile();
  };

  const navItemClass = (tab: ActiveTab) =>
    `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
      activeTab === tab
        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const renderNavContent = () => (
    <div className="flex flex-col h-full py-4 px-3 space-y-6">
      {/* Admin Action: Create Order */}
      {isAdmin && onOpenCreateOrder && (
        <button
          type="button"
          onClick={() => {
            onOpenCreateOrder();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-98"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Order</span>
        </button>
      )}

      {/* Primary Section */}
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
          Overview
        </p>
        <button
          type="button"
          onClick={() => handleTabClick('dashboard')}
          className={navItemClass('dashboard')}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Stats</span>
          </div>
        </button>
      </div>

      {/* Orders Section */}
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
          Order Management
        </p>

        <button
          type="button"
          onClick={() => handleTabClick('pending')}
          className={navItemClass('pending')}
        >
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-red-500" />
            <span>Pending Orders</span>
          </div>
          {stats.todayPendingCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {stats.todayPendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('approved')}
          className={navItemClass('approved')}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Approved Orders</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('orders')}
          className={navItemClass('orders')}
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4" />
            <span>All Orders</span>
          </div>
        </button>
      </div>

      {/* Inventory & Staff */}
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
          Catalog & Users
        </p>

        <button
          type="button"
          onClick={() => handleTabClick('products')}
          className={navItemClass('products')}
        >
          <div className="flex items-center gap-2.5">
            <Package className="w-4 h-4" />
            <span>Products {isEmployee ? '(View Only)' : ''}</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('employees')}
          className={navItemClass('employees')}
        >
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4" />
            <span>Employee Management</span>
          </div>
          {isEmployee && (
            <Lock className="w-3.5 h-3.5 text-slate-400" title="Restricted for Employees" />
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('history')}
          className={navItemClass('history')}
        >
          <div className="flex items-center gap-2.5">
            <History className="w-4 h-4" />
            <span>Status History Logs</span>
          </div>
        </button>
      </div>

      {/* Role Badge Footer */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3">
          <p className="text-[11px] font-bold text-slate-800">
            {isAdmin ? 'Admin Portal' : 'Employee Portal'}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
            {isAdmin
              ? 'Full management & order creation privileges.'
              : 'Status change & order packing access only.'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)]">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 overflow-y-auto">
            {renderNavContent()}
          </div>
        </div>
      )}
    </>
  );
};
