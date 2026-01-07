// Product types for Supabase integration

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  is_active?: boolean | null;
  stock?: number | null;
  categories?: Category | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}