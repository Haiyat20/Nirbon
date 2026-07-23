import React from 'react';
import { useDb } from '../../context/DbContext';
import { ShoppingBag, Clock, CheckCircle2, Calendar, CalendarDays, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export const StatsDashboard: React.FC = () => {
  const { stats } = useDb();

  const cards = [
    {
      id: 'today-orders',
      title: "Today's Orders",
      value: stats.todayOrdersCount,
      badgeText: 'Total Created Today',
      icon: ShoppingBag,
      color: 'bg-emerald-500',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-100',
    },
    {
      id: 'today-pending',
      title: "Today's Pending Orders",
      value: stats.todayPendingCount,
      badgeText: 'Requires Dispatch',
      icon: Clock,
      color: 'bg-red-500',
      lightBg: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-100',
    },
    {
      id: 'today-approved',
      title: "Today's Approved Orders",
      value: stats.todayApprovedCount,
      badgeText: 'Packed & Dispatched',
      icon: CheckCircle2,
      color: 'bg-green-600',
      lightBg: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-100',
    },
    {
      id: 'weekly-orders',
      title: 'Weekly Orders',
      value: stats.weeklyOrdersCount,
      badgeText: 'Last 7 Days',
      icon: Calendar,
      color: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-100',
    },
    {
      id: 'monthly-orders',
      title: 'Monthly Orders',
      value: stats.monthlyOrdersCount,
      badgeText: 'Current Month',
      icon: CalendarDays,
      color: 'bg-purple-500',
      lightBg: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-semibold mb-3 backdrop-blur-xs border border-emerald-600/40">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Real-time Order Volume Tracker</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Order Statistics Overview
          </h2>
          <p className="mt-2 text-emerald-100/90 text-sm leading-relaxed">
            Monitor daily order counts, pending dispatches, and monthly plant fulfillment metrics across your organization.
          </p>
        </div>
      </div>

      {/* Grid of 5 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.2 }}
              className={`bg-white rounded-2xl p-5 border ${card.borderColor} shadow-md shadow-slate-100 hover:shadow-lg transition-all duration-200 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-bold uppercase tracking-wider ${card.textColor} px-2.5 py-1 rounded-full ${card.lightBg}`}>
                    {card.badgeText}
                  </span>
                  <div className={`w-10 h-10 rounded-xl ${card.color} text-white flex items-center justify-center shadow-md`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-slate-600 mb-1">
                  {card.title}
                </h3>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {card.value}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {card.value === 1 ? 'Order' : 'Orders'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Updated Live</span>
                <span className="font-semibold text-slate-600">Count Metric</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
