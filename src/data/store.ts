export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'period-care' | 'love' | 'sorry' | 'birthday';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  total: number;
  status: 'pending' | 'confirmed' | 'delivered';
  createdAt: Date;
}

// In-memory data store
let products: Product[] = [
  {
    id: '1',
    name: 'Comfort & Care Hamper',
    description: 'A thoughtful collection of comfort items including heating pad, chocolates, herbal tea, and cozy socks.',
    price: 1499,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop',
    category: 'period-care'
  },
  {
    id: '2',
    name: 'Self-Care Essentials',
    description: 'Pamper set with bath bombs, scented candles, face masks, and relaxation essentials.',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
    category: 'period-care'
  },
  {
    id: '3',
    name: 'Romantic Rose Collection',
    description: 'Beautiful red roses with premium chocolates, love letter kit, and scented candles.',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=400&fit=crop',
    category: 'love'
  },
  {
    id: '4',
    name: 'Forever Yours Hamper',
    description: 'Luxury gift box with jewelry, perfume samples, gourmet treats, and a personalized card.',
    price: 3999,
    image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=400&h=400&fit=crop',
    category: 'love'
  },
  {
    id: '5',
    name: 'Heartfelt Apology Box',
    description: 'Sincere gesture with flowers, chocolates, handwritten card supplies, and comfort treats.',
    price: 1799,
    image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=400&fit=crop',
    category: 'sorry'
  },
  {
    id: '6',
    name: 'Peace Offering Hamper',
    description: 'Make amends with gourmet cookies, tea selection, cozy blanket, and heartfelt gifts.',
    price: 2199,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    category: 'sorry'
  },
  {
    id: '7',
    name: 'Birthday Celebration Box',
    description: 'Party in a box with confetti, balloons, cake decorations, and sweet treats.',
    price: 1999,
    image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400&h=400&fit=crop',
    category: 'birthday'
  },
  {
    id: '8',
    name: 'Premium Birthday Hamper',
    description: 'Luxurious celebration with champagne glasses, gourmet snacks, party accessories, and gifts.',
    price: 3499,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=400&fit=crop',
    category: 'birthday'
  }
];

let orders: Order[] = [];
let cart: CartItem[] = [];

// Product functions
export const getProducts = () => [...products];
export const getProductById = (id: string) => products.find(p => p.id === id);
export const getProductsByCategory = (category: string) => 
  category === 'all' ? products : products.filter(p => p.category === category);

export const addProduct = (product: Omit<Product, 'id'>) => {
  const newProduct = { ...product, id: Date.now().toString() };
  products.push(newProduct);
  return newProduct;
};

export const updateProduct = (id: string, updates: Partial<Product>) => {
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    return products[index];
  }
  return null;
};

export const deleteProduct = (id: string) => {
  products = products.filter(p => p.id !== id);
};

// Cart functions
export const getCart = () => [...cart];
export const addToCart = (product: Product, quantity = 1) => {
  const existing = cart.find(item => item.product.id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  return [...cart];
};

export const updateCartQuantity = (productId: string, quantity: number) => {
  if (quantity <= 0) {
    cart = cart.filter(item => item.product.id !== productId);
  } else {
    const item = cart.find(item => item.product.id === productId);
    if (item) item.quantity = quantity;
  }
  return [...cart];
};

export const removeFromCart = (productId: string) => {
  cart = cart.filter(item => item.product.id !== productId);
  return [...cart];
};

export const clearCart = () => {
  cart = [];
  return [];
};

export const getCartTotal = () => 
  cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

// Order functions
export const getOrders = () => [...orders];
export const createOrder = (customer: Order['customer']) => {
  const order: Order = {
    id: Date.now().toString(),
    items: [...cart],
    customer,
    total: getCartTotal(),
    status: 'pending',
    createdAt: new Date()
  };
  orders.push(order);
  clearCart();
  return order;
};

export const updateOrderStatus = (id: string, status: Order['status']) => {
  const order = orders.find(o => o.id === id);
  if (order) order.status = status;
  return order;
};

export const categories = [
  { id: 'all', name: 'All Hampers' },
  { id: 'period-care', name: 'Period Care' },
  { id: 'love', name: 'I Love You' },
  { id: 'sorry', name: 'Sorry' },
  { id: 'birthday', name: 'Birthday' }
];
