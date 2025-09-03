import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  product_id: string;
  product_name: string;
  price: number;
  bikram_share: number;
  owner_share: number;
  status: 'completed' | 'pending' | 'refunded';
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
  customers?: {
    name?: string;
    email?: string;
    is_guest: boolean;
  };
}

export interface OrdersStats {
  totalRevenue: number;
  totalOrders: number;
  todayOrders: number;
  monthOrders: number;
  bikramShare: number;
  ownerShare: number;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrdersStats>({
    totalRevenue: 0,
    totalOrders: 0,
    todayOrders: 0,
    monthOrders: 0,
    bikramShare: 0,
    ownerShare: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (
            name,
            email,
            is_guest
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      const typedOrders = (ordersData || []) as Order[];
      setOrders(typedOrders);
      calculateStats(typedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData: Order[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedOrders = ordersData.filter(order => order.status === 'completed');
    
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.price, 0);
    const totalOrders = completedOrders.length;
    
    const todayOrders = completedOrders.filter(order => 
      new Date(order.created_at) >= today
    ).length;
    
    const monthOrders = completedOrders.filter(order => 
      new Date(order.created_at) >= monthStart
    ).length;

    const bikramShare = completedOrders.reduce((sum, order) => sum + order.bikram_share, 0);
    const ownerShare = completedOrders.reduce((sum, order) => sum + order.owner_share, 0);

    setStats({
      totalRevenue,
      totalOrders,
      todayOrders,
      monthOrders,
      bikramShare,
      ownerShare,
    });
  };

  return { orders, stats, loading, refetch: fetchOrders };
}