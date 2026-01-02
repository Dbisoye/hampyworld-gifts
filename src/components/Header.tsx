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
    <header className="bg-card shadow-sm sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <Gift className="w-8 h-8 text-accent" />
            <span className="text-2xl font-display font-bold">HampyWorld</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-accent transition-colors font-medium">
              Home
            </Link>
            <Link to="/shop" className="text-foreground hover:text-accent transition-colors font-medium">
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
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
            {user ? (
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="gap-2">
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
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
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
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-foreground hover:text-accent transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/shop" className="text-foreground hover:text-accent transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                Shop
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-accent hover:text-accent/80 transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Admin
                </Link>
              )}
              {user ? (
                <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="text-left text-foreground hover:text-accent transition-colors font-medium">
                  Logout
                </button>
              ) : (
                <Link to="/auth" className="text-foreground hover:text-accent transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
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
