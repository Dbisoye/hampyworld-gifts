import { Gift, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6" />
            <span className="text-xl font-display font-bold">HampyWorld</span>
          </div>
          <p className="text-primary-foreground/80 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-accent fill-accent" /> for special moments
          </p>
          <p className="text-primary-foreground/60 text-sm">
            © 2024 HampyWorld. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
