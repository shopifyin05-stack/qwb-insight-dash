import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/LoginForm';
import { DashboardLayout } from '@/components/DashboardLayout';
import Dashboard from './Dashboard';
import SuperAdminDashboard from './SuperAdminDashboard';

const Index = () => {
  const { user, loading, isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <DashboardLayout>
      {isSuperAdmin ? <SuperAdminDashboard /> : <Dashboard />}
    </DashboardLayout>
  );
};

export default Index;
