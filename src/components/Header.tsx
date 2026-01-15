import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, Search } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import hampiousLogo from '@/assets/hampious-logo.png';
const Header = () => {
  const {
    itemCount
  } = useCart();
  const {
    user,
    isAdmin
  } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };
  return <header className="glass sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={hampiousLogo} alt="Hampious Logo" className="h-16 w-auto object-contain" loading="eager" fetchPriority="high" />
            <span className="text-2xl font-bold tracking-wide text-[#b89e56]" style={{ fontFamily: '"Cinzel Decorative", serif' }}>
              HAMPIOUS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-accent transition-colors font-medium underline-gold py-1">
              Home
            </Link>
            <Link to="/shop" className="text-foreground hover:text-accent transition-colors font-medium underline-gold py-1">
              Shop
            </Link>
            {isAdmin && <Link to="/admin" className="text-accent hover:text-accent/80 transition-colors font-medium">
                Admin
              </Link>}
            
            {/* Search */}
            {searchOpen ? <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-48 h-9" autoFocus />
                <Button type="submit" size="sm" variant="ghost" className="p-2">
                  <Search className="w-4 h-4" />
                </Button>
                <Button type="button" size="sm" variant="ghost" className="p-2" onClick={() => setSearchOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </form> : <button onClick={() => setSearchOpen(true)} className="p-2 text-foreground hover:text-accent transition-colors">
                <Search className="w-5 h-5" />
              </button>}
            
            <Link to="/cart" className="relative p-2 text-foreground hover:text-accent transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && <span className="absolute -top-1 -right-1 gradient-gold text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm">
                  {itemCount}
                </span>}
            </Link>
            {user ? <Link to="/account">
                <Button variant="outline" size="sm" className="gap-2 border-accent/30 hover:bg-accent/10 hover:border-accent">
                  <User className="w-4 h-4" />
                  My Account
                </Button>
              </Link> : <Link to="/auth">
                <Button variant="outline" size="sm" className="gap-2 border-accent/30 hover:bg-accent/10 hover:border-accent">
                  <User className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-foreground hover:text-accent transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link to="/cart" className="relative p-2 text-foreground">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && <span className="absolute -top-1 -right-1 gradient-gold text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>}
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-foreground">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1" autoFocus />
              <Button type="submit" size="sm">
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>}

        {/* Mobile Navigation */}
        {mobileMenuOpen && <nav className="md:hidden py-6 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-foreground hover:text-accent transition-colors font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/shop" className="text-foreground hover:text-accent transition-colors font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Shop
              </Link>
              {isAdmin && <Link to="/admin" className="text-accent hover:text-accent/80 transition-colors font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                  Admin
                </Link>}
              {user ? <Link to="/account" className="text-foreground hover:text-accent transition-colors font-medium py-2 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <User className="w-4 h-4" />
                  My Account
                </Link> : <Link to="/auth" className="text-foreground hover:text-accent transition-colors font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>}
            </div>
          </nav>}
      </div>
    </header>;
};
export default Header;