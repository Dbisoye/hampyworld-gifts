import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gift, Heart, Package, Truck, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types/product';

// Map category slugs to colorful emojis
const getCategoryEmoji = (slug: string) => {
  switch (slug) {
    case 'birthday':
      return '🎂';
    case 'love':
      return '❤️';
    case 'sorry':
      return '💔';
    case 'period-care':
      return '🩸';
    default:
      return '🎁';
  }
};
const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      const [productsRes, categoriesRes] = await Promise.all([supabase.from('products').select('*, categories(*)').eq('is_active', true).order('created_at', {
        ascending: false
      }).limit(4), supabase.from('categories').select('*').order('name')]);
      if (!productsRes.error && productsRes.data) {
        setProducts(productsRes.data);
      }
      if (!categoriesRes.error && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);
  return <Layout>
      {/* Hero Section */}
      <section className="relative py-24 md:py-40 overflow-hidden">
        <div className="absolute inset-0 gradient-luxury" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-accent/30 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_1s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl animate-[float_10s_ease-in-out_infinite_0.5s]" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-accent/20 px-5 py-2.5 rounded-full text-sm font-medium mb-8 backdrop-blur-sm animate-fade-in bg-muted text-pink-800">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Delivered with Love, Curated with Care  
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight tracking-tight animate-fade-in [animation-delay:200ms]" style={{
            fontFamily: '"Dancing Script", cursive'
          }}>
              Gift Hampers for{' '}
              <span className="text-gradient-gold">Every Moment</span>
            </h1>
            <p className="text-lg md:text-xl mt-8 max-w-2xl mx-auto leading-relaxed animate-fade-in [animation-delay:400ms] font-serif text-pink-800">At Hampious, gifting is a love language. Every hamper is thoughtfully curated to feel personal, comforting, and beautifully memorable—made to turn meaningful moments into lasting smiles.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 animate-fade-in [animation-delay:600ms]">
              <Button asChild size="lg" className="text-lg px-10 h-14 gradient-gold border-0 shadow-gold btn-glow hover:scale-105 transition-transform">
                <Link to="/shop">
                  Explore Collection <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-10 h-14 border-accent/30 hover:bg-accent/10 hover:border-accent hover:scale-105 transition-transform">
                <Link to="/shop?category=love">
                  <Heart className="mr-2 w-5 h-5 text-accent" /> Love Hampers
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
            icon: Package,
            title: 'Premium Selection',
            desc: 'Hand-picked luxury items'
          }, {
            icon: Truck,
            title: 'Express Delivery',
            desc: 'Cash on delivery available'
          }, {
            icon: Star,
            title: 'Exceptional Quality',
            desc: 'Crafted with perfection'
          }].map((feature, index) => <div key={index} className="flex items-center gap-5 justify-center md:justify-start p-6 rounded-2xl hover:bg-secondary/50 transition-all duration-300 hover:scale-105 animate-fade-in" style={{
            animationDelay: `${index * 150}ms`
          }}>
                <div className="w-16 h-16 gradient-gold rounded-2xl flex items-center justify-center shadow-gold shrink-0 group-hover:shadow-lg transition-shadow">
                  <feature.icon className="w-8 h-8 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-accent text-sm font-medium uppercase tracking-widest animate-fade-in">Explore</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-2 animate-fade-in [animation-delay:100ms]">
              Shop by Occasion
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto animate-fade-in [animation-delay:200ms]">
              Discover the perfect hamper tailored for every special moment in life
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {categories.map((category, index) => {
            const emoji = getCategoryEmoji(category.slug);
            return <Link key={category.id} to={`/shop?category=${category.slug}`} className="group card-luxury p-8 hover-lift text-center animate-fade-in hover:scale-105 transition-transform duration-300" style={{
              animationDelay: `${index * 100}ms`
            }}>
                  <div className="text-5xl mb-5 group-hover:scale-110 transition-transform">
                    {emoji}
                  </div>
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-accent transition-colors">
                    {category.name}
                  </h3>
                </Link>;
          })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-14">
            <div>
              <span className="text-accent text-sm font-medium uppercase tracking-widest">Featured</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-2">
                Bestselling Hampers
              </h2>
              <p className="text-muted-foreground mt-3">Our most loved gift selections, curated for excellence</p>
            </div>
            <Button asChild variant="outline" className="mt-6 md:mt-0 border-accent/30 hover:bg-accent/10 hover:border-accent">
              <Link to="/shop">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="animate-pulse bg-card rounded-xl h-80" />)}
            </div> : products.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => <div key={product.id} className="animate-fade-in-up" style={{
            animationDelay: `${index * 100}ms`
          }}>
                  <ProductCard product={product} />
                </div>)}
            </div> : <div className="text-center py-12">
              <p className="text-muted-foreground">No products available yet.</p>
            </div>}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-gray-600 rounded-3xl p-16 text-center text-white relative overflow-hidden hover:scale-[1.02] transition-transform duration-500">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_1s]" />
            </div>
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-display font-bold animate-fade-in">
                Ready to Spread Joy?
              </h2>
              <p className="mt-6 text-white/80 max-w-xl mx-auto text-lg leading-relaxed animate-fade-in [animation-delay:200ms]">
                Browse our exclusive collection of thoughtfully curated gift hampers and make someone’s day truly extraordinary.


Made with care. Wrapped in love
              </p>
            <Button asChild size="lg" className="mt-10 text-lg px-10 h-14 bg-white border-2 border-pink-500 text-pink-500 hover:bg-pink-50 hover:scale-105 transition-transform animate-fade-in [animation-delay:400ms]">
                <Link to="/shop">
                  Explore All Hampers <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>;
};
export default Index;