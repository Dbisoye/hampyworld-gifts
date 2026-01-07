import { Link } from 'react-router-dom';
import { ShoppingCart, Gift, Menu, X, User, LogOut } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { itemCount } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center shadow-gold">
              <Gift className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-2xl font-display font-bold text-foreground tracking-luxe">
              HampyWorld
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-accent transition-colors font-medium underline-gold py-1">
              Home
            </Link>
            <Link to="/shop" className="text-foreground hover:text-accent transition-colors font-medium underline-gold py-1">
              Shop
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-accent hover:text-accent/80 transition-colors font-medium">
                Admin
              </Link>
            )}
            <Link to="/cart" className="relative p-2 text-foreground hover:text-accent transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 gradient-gold text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>
            {user ? (
              <Link to="/account">
                <Button variant="outline" size="sm" className="gap-2 border-accent/30 hover:bg-accent/10 hover:border-accent">
                  <User className="w-4 h-4" />
                  My Account
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="gap-2 border-accent/30 hover:bg-accent/10 hover:border-accent">
                  <User className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-4">
            <Link to="/cart" className="relative p-2 text-foreground">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 gradient-gold text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-foreground">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-6 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-foreground hover:text-accent transition-colors font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/shop" className="text-foreground hover:text-accent transition-colors font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Shop
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-accent hover:text-accent/80 transition-colors font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                  Admin
                </Link>
              )}
              {user ? (
                <Link to="/account" className="text-foreground hover:text-accent transition-colors font-medium py-2 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <User className="w-4 h-4" />
                  My Account
                </Link>
              ) : (
                <Link to="/auth" className="text-foreground hover:text-accent transition-colors font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
