import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Minus, Plus, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { Product } from '@/types/product';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-4" />
            <div className="h-4 bg-muted rounded w-32 mx-auto" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Product not found</h1>
          <Button asChild className="mt-6">
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: "Added to cart!",
      description: `${quantity}x ${product.name} has been added to your cart.`,
    });
  };

  const categoryName = product.categories?.name || 'Gift';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-square rounded-3xl overflow-hidden bg-muted">
            <img 
              src={product.image_url || '/placeholder.svg'} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              {categoryName} Gift Hamper
            </span>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-primary mt-4">
              ₹{product.price.toLocaleString()}
            </p>
            <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
              {product.description || 'A beautiful gift hamper'}
            </p>

            {/* Features */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-foreground">
                <Check className="w-5 h-5 text-accent" />
                <span>Premium quality products</span>
              </div>
              <div className="flex items-center gap-3 text-foreground">
                <Check className="w-5 h-5 text-accent" />
                <span>Beautifully packaged</span>
              </div>
              <div className="flex items-center gap-3 text-foreground">
                <Check className="w-5 h-5 text-accent" />
                <span>Cash on delivery available</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mt-8">
              <label className="text-sm font-medium text-foreground mb-3 block">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-secondary transition-colors rounded-l-lg"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-3 font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-secondary transition-colors rounded-r-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button size="lg" onClick={handleAddToCart} className="flex-1 gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </Button>
              </div>
            </div>

            {/* Total */}
            <div className="mt-6 p-4 bg-secondary rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total</span>
                <span className="text-2xl font-bold text-foreground">
                  ₹{(product.price * quantity).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;