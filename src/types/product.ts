// Product types for Supabase integration

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
}

export interface ProductVideo {
  id: string;
  product_id: string;
  video_url: string;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price?: number | null;
  image_url: string | null;
  video_url?: string | null;
  category_id: string | null;
  is_active?: boolean | null;
  stock?: number | null;
  categories?: Category | null;
  product_images?: ProductImage[];
  product_videos?: ProductVideo[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}