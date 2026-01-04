import { Link } from 'react-router-dom';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { Product } from '@/data/store';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

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

  return (
    <Link 
      to={`/product/${product.id}`}
      className="group card-luxury overflow-hidden hover-lift"
    >
      <div className="aspect-square overflow-hidden bg-muted relative img-overlay">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 bg-accent/90 text-accent-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
            <Sparkles className="w-3 h-3" />
            {product.category.replace('-', ' ')}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm mt-2 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-5 pt-5 border-t border-border/50">
          <div>
            <span className="text-xs text-muted-foreground">Price</span>
            <p className="text-xl font-bold text-foreground">
              ₹{product.price.toLocaleString()}
            </p>
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
