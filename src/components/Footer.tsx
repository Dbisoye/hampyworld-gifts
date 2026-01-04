import { Gift, Heart, Instagram, Facebook, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="gradient-dark text-primary-foreground py-16 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
                <Gift className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="text-2xl font-display font-bold tracking-luxe">HampyWorld</span>
            </div>
            <p className="text-primary-foreground/70 max-w-sm leading-relaxed">
              Curating moments of joy through our exquisite collection of premium gift hampers. 
              Every gift tells a story of love and thoughtfulness.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 tracking-luxe">Quick Links</h4>
            <ul className="space-y-3 text-primary-foreground/70">
              <li><Link to="/shop" className="hover:text-accent transition-colors">Shop All</Link></li>
              <li><Link to="/orders" className="hover:text-accent transition-colors">Track Order</Link></li>
              <li><Link to="/auth" className="hover:text-accent transition-colors">My Account</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4 tracking-luxe">Contact</h4>
            <ul className="space-y-3 text-primary-foreground/70">
              <li>support@hampyworld.com</li>
              <li>+91 98765 43210</li>
              <li>Mon - Sat: 10AM - 7PM</li>
            </ul>
          </div>
        </div>

        <div className="divider-gold my-10" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/50 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-accent fill-accent" /> for special moments
          </p>
          <p className="text-primary-foreground/50 text-sm">
            © 2024 HampyWorld. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
