import { Heart, Instagram, Facebook, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import hampiousLogo from '@/assets/hampious-logo.png';
const Footer = () => {
  return <footer className="text-white py-16 mt-auto bg-gray-600">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={hampiousLogo} alt="Hampious Logo" className="h-16 w-auto object-contain" />
            </div>
            <p className="text-white/80 max-w-sm leading-relaxed">
              Curating moments of joy through our exquisite collection of premium gift hampers. 
              Every gift tells a story of love and thoughtfulness.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 tracking-luxe text-white">Quick Links</h4>
            <ul className="space-y-3 text-white/80">
              <li><Link to="/shop" className="hover:text-white transition-colors">Shop All</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/auth" className="hover:text-white transition-colors">My Account</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4 tracking-luxe text-white">Contact</h4>
            <ul className="space-y-3 text-white/80">
              <li>support@hampious.com</li>
              <li>+91 7428601664</li>
              <li>Mon - Sun: 10AM - 7PM</li>
            </ul>
          </div>
        </div>

        {/* Return Policy */}
        <div className="bg-white/10 rounded-xl p-6 my-8">
          <h4 className="font-semibold text-lg mb-2 tracking-luxe text-white">Return Policy</h4>
          <p className="text-white/80 text-sm">
            We offer a <span className="text-white font-semibold">3-day return policy</span> for damaged products. 
            If you receive a damaged item, please contact us within 3 days of delivery with photos of the damage. 
            We'll arrange a replacement or full refund.
          </p>
        </div>

        <div className="border-t border-white/20 my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/70 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-white fill-white" /> for special moments
          </p>
          <p className="text-white/70 text-sm">
            © 2024 Hampious. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;