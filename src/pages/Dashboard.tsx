import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { MetricCard } from '@/components/MetricCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  IndianRupee, 
  ShoppingCart, 
  TrendingUp, 
  Calendar,
  Users,
  Package
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user, isBikram } = useAuth();
  const { orders, stats, loading } = useOrders();

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const displayStats = isBikram ? {
    totalRevenue: stats.bikramShare,
    totalOrders: stats.totalOrders,
    todayOrders: stats.todayOrders,
    monthOrders: stats.monthOrders,
  } : stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {isBikram 
              ? "Here's your 30% revenue share overview" 
              : "Here's your business overview"}
          </p>
        </div>
        {isBikram && (
          <Badge variant="secondary" className="bg-primary-light text-primary">
            Partner View (30% Share)
          </Badge>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title={isBikram ? "Your Revenue Share" : "Total Revenue"}
          value={formatCurrency(displayStats.totalRevenue)}
          icon={IndianRupee}
          subtitle={isBikram ? "30% of total revenue" : "All completed orders"}
          trend={{ value: "12%", positive: true }}
        />
        
        <MetricCard
          title="Total Orders"
          value={displayStats.totalOrders}
          icon={ShoppingCart}
          subtitle="Completed orders"
          trend={{ value: "8%", positive: true }}
        />
        
        <MetricCard
          title="Today's Orders"
          value={displayStats.todayOrders}
          icon={Calendar}
          subtitle="Orders placed today"
        />
        
        <MetricCard
          title="This Month"
          value={displayStats.monthOrders}
          icon={TrendingUp}
          subtitle="Orders this month"
          trend={{ value: "23%", positive: true }}
        />

        {!isBikram && (
          <>
            <MetricCard
              title="Bikram's Share (30%)"
              value={formatCurrency(stats.bikramShare)}
              icon={Users}
              subtitle="Partner revenue share"
              className="border-amber-200 bg-amber-50"
            />
            
            <MetricCard
              title="Your Share (70%)"
              value={formatCurrency(stats.ownerShare)}
              icon={Package}
              subtitle="Your revenue share"
              className="border-green-200 bg-green-50"
            />
          </>
        )}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Latest {isBikram ? "orders affecting your share" : "customer orders"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div 
                key={order.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary-light p-2 rounded-lg">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customers?.name || 'Guest User'} • {order.product_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {formatCurrency(isBikram ? order.bikram_share : order.price)}
                  </p>
                  <Badge 
                    variant={order.status === 'completed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}