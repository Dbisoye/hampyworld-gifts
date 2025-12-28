import { Link } from 'react-router-dom';
import { ArrowRight, Gift, Heart, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { getProducts, categories } from '@/data/store';

const Index = () => {
  const products = getProducts();
  const featuredProducts = products.slice(0, 4);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary via-background to-accent/10 py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Gift className="w-4 h-4" />
              Handcrafted with Love
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight">
              Gift Hampers for{' '}
              <span className="text-accent">Every Moment</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto">
              Celebrate life's special moments with beautifully curated gift hampers. 
              From birthdays to apologies, we have the perfect gift for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/shop">
                  Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/shop?category=love">
                  Love Hampers <Heart className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center">
                <Package className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Curated Selection</h3>
                <p className="text-sm text-muted-foreground">Handpicked premium items</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center">
                <Truck className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">Cash on delivery available</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center">
                <Heart className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Made with Love</h3>
                <p className="text-sm text-muted-foreground">Each hamper is special</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Shop by Occasion
            </h2>
            <p className="text-muted-foreground mt-3">Find the perfect hamper for any moment</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.filter(c => c.id !== 'all').map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                className="group bg-gradient-to-br from-card to-secondary p-6 rounded-2xl border border-border hover:border-accent/50 hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <Gift className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Featured Hampers
              </h2>
              <p className="text-muted-foreground mt-2">Our most loved gift selections</p>
            </div>
            <Button asChild variant="outline" className="mt-4 md:mt-0">
              <Link to="/shop">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-12 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Ready to Spread Joy?
            </h2>
            <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
              Browse our collection of thoughtfully curated gift hampers and make someone's day special.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link to="/shop">
                Explore All Hampers <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
