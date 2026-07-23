import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DbProvider, useDb } from './context/DbContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/common/Header';
import { Sidebar, ActiveTab } from './components/common/Sidebar';
import { AccessDeniedModal } from './components/common/AccessDeniedModal';
import { StatsDashboard } from './components/dashboard/StatsDashboard';
import { EmployeeManagement } from './components/admin/EmployeeManagement';
import { ProductManagement } from './components/admin/ProductManagement';
import { CreateOrderModal } from './components/admin/CreateOrderModal';
import { OrderList } from './components/orders/OrderList';
import { OrderStatusHistoryList } from './components/orders/OrderStatusHistoryList';
import { SupabaseSchemaModal } from './components/admin/SupabaseSchemaModal';

const AppContent: React.FC = () => {
  const { currentUser, isAdmin, isEmployee } = useAuth();
  const { setStatusFilter } = useDb();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [accessDeniedAction, setAccessDeniedAction] = useState<string | null>(null);

  // Sync tab status filter automatically
  useEffect(() => {
    if (activeTab === 'pending') {
      setStatusFilter('Pending');
    } else if (activeTab === 'approved') {
      setStatusFilter('Approved');
    } else if (activeTab === 'orders') {
      setStatusFilter('all');
    }
  }, [activeTab, setStatusFilter]);

  if (!currentUser) {
    return <LoginPage />;
  }

  const handleTabChange = (tab: ActiveTab) => {
    if (isEmployee && tab === 'employees') {
      setAccessDeniedAction('Manage Employee Accounts');
      return;
    }
    setActiveTab(tab);
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <StatsDashboard />;

      case 'pending':
        return (
          <OrderList
            titleOverride="Pending Orders"
            defaultStatusFilter="Pending"
            isAdmin={isAdmin}
            onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
          />
        );

      case 'approved':
        return (
          <OrderList
            titleOverride="Approved Orders"
            defaultStatusFilter="Approved"
            isAdmin={isAdmin}
            onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
          />
        );

      case 'orders':
        return (
          <OrderList
            titleOverride="All Plant Orders"
            defaultStatusFilter="all"
            isAdmin={isAdmin}
            onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
          />
        );

      case 'products':
        return (
          <ProductManagement
            onAttemptRestrictedAction={(action) => setAccessDeniedAction(action)}
          />
        );

      case 'employees':
        if (!isAdmin) {
          return (
            <div className="bg-white p-8 rounded-2xl border border-red-200 text-center">
              <p className="text-lg font-bold text-red-600">Access Denied</p>
              <p className="text-xs text-slate-500 mt-1">
                Employees cannot access Employee Management settings.
              </p>
            </div>
          );
        }
        return <EmployeeManagement />;

      case 'history':
        return <OrderStatusHistoryList />;

      default:
        return <StatsDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 font-sans flex flex-col antialiased">
      <Header
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onOpenDatabaseModal={() => setIsDbModalOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
          onAttemptRestrictedAction={(action) => setAccessDeniedAction(action)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {renderActiveTabContent()}
        </main>
      </div>

      {/* Admin Create Order Modal */}
      {isAdmin && (
        <CreateOrderModal
          isOpen={isCreateOrderOpen}
          onClose={() => setIsCreateOrderOpen(false)}
          onSuccessOrderCreated={() => {
            setActiveTab('orders');
          }}
        />
      )}

      {/* Access Denied Modal */}
      <AccessDeniedModal
        isOpen={Boolean(accessDeniedAction)}
        onClose={() => setAccessDeniedAction(null)}
        actionAttempted={accessDeniedAction || 'perform this restricted action'}
      />

      {/* Supabase Schema / Database Info Modal */}
      <SupabaseSchemaModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DbProvider>
        <AppContent />
      </DbProvider>
    </AuthProvider>
  );
}
