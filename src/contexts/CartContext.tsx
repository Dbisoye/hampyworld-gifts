import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  CartItem, 
  Product, 
  getCart, 
  addToCart as addToCartStore, 
  updateCartQuantity as updateQuantityStore,
  removeFromCart as removeFromCartStore,
  clearCart as clearCartStore,
  getCartTotal 
} from '@/data/store';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(getCart());

  const addToCart = (product: Product, quantity = 1) => {
    const updated = addToCartStore(product, quantity);
    setItems(updated);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const updated = updateQuantityStore(productId, quantity);
    setItems(updated);
  };

  const removeFromCart = (productId: string) => {
    const updated = removeFromCartStore(productId);
    setItems(updated);
  };

  const clearCart = () => {
    clearCartStore();
    setItems([]);
  };

  const total = getCartTotal();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      clearCart, 
      total,
      itemCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
