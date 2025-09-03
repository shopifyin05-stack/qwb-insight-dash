import React from 'react';
import { AddOrderForm } from '@/components/AddOrderForm';
import { useOrders } from '@/hooks/useOrders';
import Dashboard from './Dashboard';

export default function SuperAdminDashboard() {
  const { refetch } = useOrders();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
      </div>
      
      <AddOrderForm onOrderAdded={refetch} />
      
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-6">Analytics Overview</h2>
        <Dashboard />
      </div>
    </div>
  );
}