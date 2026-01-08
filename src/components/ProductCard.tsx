import { Link } from 'react-router-dom';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const categoryName = product.categories?.name || 'Gift';

  return (
    <Link 
      to={`/product/${product.id}`}
      className="group card-luxury overflow-hidden hover-lift"
    >
      <div className="aspect-square overflow-hidden bg-muted relative img-overlay">
        <img 
          src={product.image_url || '/placeholder.svg'} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 bg-accent/90 text-accent-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
            <Sparkles className="w-3 h-3" />
            {categoryName}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm mt-2 line-clamp-2 leading-relaxed">
          {product.description || 'A beautiful gift hamper'}
        </p>
        <div className="flex items-center justify-between mt-5 pt-5 border-t border-border/50">
          <div>
            <span className="text-xs text-muted-foreground">Price</span>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-foreground">
                ₹{product.price.toLocaleString()}
              </p>
              {product.original_price && product.original_price > product.price && (
                <p className="text-sm text-muted-foreground line-through">
                  ₹{product.original_price.toLocaleString()}
                </p>
              )}
            </div>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs text-green-600 font-medium">
                {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% off
              </span>
            )}
          </div>
          <Button 
            size="sm" 
            onClick={handleAddToCart}
            className="gap-2 gradient-gold border-0 shadow-sm hover:shadow-gold"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;