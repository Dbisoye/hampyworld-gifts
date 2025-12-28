import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, total } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Your cart is empty</h1>
          <p className="text-muted-foreground mt-2">Add some gift hampers to get started!</p>
          <Button asChild className="mt-6">
            <Link to="/shop">
              Start Shopping <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-8">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div 
                key={item.product.id}
                className="flex gap-4 bg-card rounded-2xl p-4 border border-border"
              >
                <Link to={`/product/${item.product.id}`} className="shrink-0">
                  <img 
                    src={item.product.image} 
                    alt={item.product.name}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/product/${item.product.id}`}
                    className="font-semibold text-foreground hover:text-accent transition-colors line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.product.category.replace('-', ' ')}
                  </p>
                  <p className="text-lg font-bold text-primary mt-2">
                    ₹{item.product.price.toLocaleString()}
                  </p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-border rounded-lg">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 hover:bg-secondary transition-colors rounded-l-lg"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-medium text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-2 hover:bg-secondary transition-colors rounded-r-lg"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 border border-border sticky top-24">
              <h2 className="text-xl font-semibold text-foreground mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product.name} x{item.quantity}
                    </span>
                    <span className="text-foreground">
                      ₹{(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Cash on Delivery
                </p>
              </div>

              <Button asChild className="w-full" size="lg">
                <Link to="/checkout">
                  Proceed to Checkout <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
