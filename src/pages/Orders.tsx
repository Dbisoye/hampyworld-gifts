import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, MapPin, Clock, CheckCircle, ExternalLink, Search, ShoppingBag } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Order {
  id: string;
  created_at: string;
  status: string;
  payment_status: string;
  total: number;
  customer_name: string;
  customer_address: string;
  tracking_number: string | null;
  tracking_url: string | null;
  shiprocket_shipment_id: string | null;
  order_items?: Array<{
    id: string;
    product_name: string;
    product_price: number;
    quantity: number;
  }>;
}

interface TrackingInfo {
  current_status: string;
  shipment_track: Array<{
    date: string;
    status: string;
    activity: string;
    location: string;
  }>;
  track_url?: string;
}

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [guestPhone, setGuestPhone] = useState('');
  const [guestOrders, setGuestOrders] = useState<Order[]>([]);
  const [searchingGuest, setSearchingGuest] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, status, payment_status, total, customer_name, customer_address, tracking_number, tracking_url, shiprocket_shipment_id, order_items ( id, product_name, product_price, quantity )')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data as unknown as Order[]) || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load your orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchGuestOrders = async () => {
    if (!guestPhone || guestPhone.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setSearchingGuest(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, status, payment_status, total, customer_name, customer_address, tracking_number, tracking_url, shiprocket_shipment_id, order_items ( id, product_name, product_price, quantity )')
        .eq('customer_phone', guestPhone)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGuestOrders((data as unknown as Order[]) || []);

      if (data?.length === 0) {
        toast({
          title: "No orders found",
          description: "No orders found for this phone number",
        });
      }
    } catch (error) {
      console.error('Error searching orders:', error);
      toast({
        title: "Error",
        description: "Failed to search orders",
        variant: "destructive",
      });
    } finally {
      setSearchingGuest(false);
    }
  };

  const trackOrder = async (order: Order) => {
    // Reset previous modal state
    setTrackingInfo(null);

    // Tracking only becomes available after a shipment is created
    if (!order.shiprocket_shipment_id && !order.tracking_number) {
      return;
    }

    setTrackingLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('shiprocket-track', {
        body: {
          shipment_id: order.shiprocket_shipment_id,
          awb_code: order.tracking_number,
        },
      });

      if (error) throw error;

      if (data?.success && data?.data?.tracking_data) {
        setTrackingInfo({
          current_status: data.data.tracking_data.shipment_status_desc || 'In Transit',
          shipment_track: data.data.tracking_data.shipment_track || [],
          track_url: data.data.tracking_data.track_url,
        });
      } else {
        throw new Error('Invalid tracking data');
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      toast({
        title: "Tracking Error",
        description: "Unable to fetch tracking information. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setTrackingLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'shipped':
      case 'in_transit':
        return <Truck className="w-5 h-5 text-accent" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return <Package className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped':
      case 'in_transit':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'processing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const displayOrders = user ? orders : guestOrders;

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="hover-lift border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(order.status)}
            <div>
              <CardTitle className="text-lg font-semibold">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {order.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="line-clamp-2">{order.customer_address}</span>
        </div>

        <div className="rounded-lg bg-secondary/40 p-3">
          <p className="text-sm font-medium text-foreground mb-2">Order Details</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span className="text-foreground font-medium">
                {order.payment_status?.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Items</span>
              <span className="text-foreground font-medium">
                {order.order_items?.length ? order.order_items.length : 0}
              </span>
            </div>
          </div>

          {order.order_items?.length ? (
            <ul className="mt-3 space-y-1">
              {order.order_items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {item.product_name} × {item.quantity}
                  </span>
                  <span className="text-foreground">
                    ₹{(item.product_price * item.quantity).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              Items may be missing for older test orders. New orders will show full item details.
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-xl font-bold text-foreground">₹{order.total.toLocaleString()}</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => trackOrder(order)}
                className="gap-2"
              >
                <Truck className="w-4 h-4" />
                Track Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-accent" />
                  Track Your Order
                </DialogTitle>
              </DialogHeader>
              
              {trackingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                </div>
              ) : trackingInfo ? (
                <div className="space-y-4">
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Current Status</p>
                    <p className="text-lg font-semibold text-accent">{trackingInfo.current_status}</p>
                  </div>
                  
                  {trackingInfo.shipment_track.length > 0 && (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {trackingInfo.shipment_track.map((track, index) => (
                        <div 
                          key={index}
                          className="flex gap-3 p-3 bg-secondary/50 rounded-lg"
                        >
                          <div className={`w-2 h-2 rounded-full mt-2 ${index === 0 ? 'bg-accent' : 'bg-muted-foreground'}`} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{track.activity}</p>
                            <p className="text-xs text-muted-foreground">{track.location}</p>
                            <p className="text-xs text-muted-foreground">{track.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {trackingInfo.track_url && (
                    <Button asChild variant="outline" className="w-full gap-2">
                      <a href={trackingInfo.track_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                        View Full Tracking
                      </a>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Tracking not available yet</p>
                  <p className="text-sm mt-1">Tracking starts after the shipment is created from Admin.</p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
        
        {order.tracking_number && (
          <p className="text-xs text-muted-foreground">
            AWB: {order.tracking_number}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading your orders...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              Your Orders
            </h1>
            <p className="text-muted-foreground">
              Track and manage your gift hamper orders
            </p>
          </div>

          {!user && (
            <Card className="mb-8 border-accent/30 bg-accent/5">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Track Guest Order</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your phone number to find your orders
                    </p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Input
                      placeholder="Enter phone number"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full md:w-48"
                    />
                    <Button onClick={searchGuestOrders} disabled={searchingGuest} className="gap-2">
                      <Search className="w-4 h-4" />
                      {searchingGuest ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {displayOrders.length > 0 ? (
            <div className="grid gap-4">
              {displayOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">
                {user 
                  ? "You haven't placed any orders yet. Start shopping!" 
                  : "Sign in to view your orders or search with your phone number"}
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link to="/shop">Start Shopping</Link>
                </Button>
                {!user && (
                  <Button asChild variant="outline">
                    <Link to="/auth">Sign In</Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Orders;