import React, { useState } from 'react';
import { useDb } from '../../context/DbContext';
import { History, Search, ArrowRight, UserCheck, Calendar, Clock, ShieldCheck } from 'lucide-react';

export const OrderStatusHistoryList: React.FC = () => {
  const { orderHistory } = useDb();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = orderHistory.filter(
    h =>
      h.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.previous_status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.new_status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-600" />
            <span>Order Status History Logs</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete audit trail of all order status transitions recorded with employee signatures and exact timestamps.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search logs by Order ID, Employee Name..."
          className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs"
        />
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">No History Records Found</p>
            <p className="text-xs text-slate-500 mt-1">
              Order status changes will automatically appear here as employees process dispatches.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Order ID</th>
                  <th className="py-3.5 px-4">Employee Name</th>
                  <th className="py-3.5 px-4">Status Transition</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono font-black text-slate-900">
                      {log.order_id}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                          <UserCheck className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">
                          {log.employee_name}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-2 font-bold text-xs bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                        <span
                          className={
                            log.previous_status === 'Pending'
                              ? 'text-red-600'
                              : 'text-emerald-600'
                          }
                        >
                          {log.previous_status}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span
                          className={
                            log.new_status === 'Approved'
                              ? 'text-emerald-600 font-black'
                              : 'text-red-600 font-black'
                          }
                        >
                          {log.new_status}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs font-semibold text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.date}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs font-mono font-medium text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.time}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
