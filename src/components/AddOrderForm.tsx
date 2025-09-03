import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddOrderFormProps {
  onOrderAdded: () => void;
}

export function AddOrderForm({ onOrderAdded }: AddOrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    productId: '',
    productName: '',
    price: '',
    paymentMethod: 'UPI',
    transactionId: ''
  });
  const { toast } = useToast();

  const products = [
    { id: 'complete-pack', name: 'Complete Question Pack', price: 299 },
    { id: 'important-pack', name: 'Important Pack', price: 50 },
    { id: 'guest-pack', name: 'Guest Pack', price: 50 }
  ];

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData(prev => ({
        ...prev,
        productId,
        productName: product.name,
        price: product.price.toString()
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create customer first
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: formData.customerName,
          email: formData.customerEmail,
          is_guest: !formData.customerEmail
        })
        .select()
        .single();

      if (customerError) {
        throw customerError;
      }

      // Generate order number
      const orderNumber = `QWB-${Date.now()}`;

      // Create order
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: customerData.id,
          product_id: formData.productId,
          product_name: formData.productName,
          price: Number(formData.price),
          payment_method: formData.paymentMethod,
          transaction_id: formData.transactionId || null,
          status: 'completed'
        });

      if (orderError) {
        throw orderError;
      }

      toast({
        title: "Order Added Successfully",
        description: `Order ${orderNumber} has been created.`,
      });

      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        productId: '',
        productName: '',
        price: '',
        paymentMethod: 'UPI',
        transactionId: ''
      });

      onOrderAdded();
    } catch (error) {
      console.error('Error adding order:', error);
      toast({
        title: "Error",
        description: "Failed to add order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Add New Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email (Optional)</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="customer@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Product</Label>
            <Select onValueChange={handleProductChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - ₹{product.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0"
                required
                readOnly
              />
            </div>
            
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select 
                value={formData.paymentMethod} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Net Banking">Net Banking</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
            <Input
              id="transactionId"
              value={formData.transactionId}
              onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
              placeholder="Enter transaction ID"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Adding Order...' : 'Add Order'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}