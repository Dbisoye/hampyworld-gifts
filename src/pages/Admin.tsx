import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Package, ShoppingBag, Tag, Ticket, 
  Upload, Video, Image, Truck, RefreshCw, Eye 
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
}

interface ProductVideo {
  id: string;
  product_id: string;
  video_url: string;
  display_order: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  image_url: string | null;
  video_url: string | null;
  stock: number;
  is_active: boolean;
  categories?: Category;
  product_images?: ProductImage[];
  product_videos?: ProductVideo[];
}

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_email: string | null;
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  shiprocket_order_id: string | null;
  shiprocket_shipment_id: string | null;
  tracking_number: string | null;
  created_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    product_price: number;
    quantity: number;
  }>;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category_id: '',
    image_url: '',
    video_url: '',
    stock: '0',
    is_active: true,
  });

  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [additionalVideos, setAdditionalVideos] = useState<string[]>([]);
  const [uploadingAdditionalMedia, setUploadingAdditionalMedia] = useState(false);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '0',
    max_uses: '',
    expires_at: '',
    is_active: true,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    } else if (!isLoading && user && !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [user, isAdmin, isLoading, navigate]);

  const fetchData = useCallback(async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const [productsRes, categoriesRes, couponsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('*, categories(*), product_images(*), product_videos(*)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('coupons').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
      ]);

      if (productsRes.data) setProducts(productsRes.data as any);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (couponsRes.data) setCoupons(couponsRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, fetchData]);

  const handleFileUpload = async (file: File, type: 'image' | 'video', isAdditional = false) => {
    if (isAdditional) setUploadingAdditionalMedia(true);
    else if (type === 'image') setUploadingImage(true);
    else setUploadingVideo(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-media')
        .getPublicUrl(filePath);

      if (isAdditional) {
        if (type === 'image') {
          setAdditionalImages(prev => [...prev, publicUrl]);
        } else {
          setAdditionalVideos(prev => [...prev, publicUrl]);
        }
      } else {
        if (type === 'image') {
          setProductForm(prev => ({ ...prev, image_url: publicUrl }));
        } else {
          setProductForm(prev => ({ ...prev, video_url: publicUrl }));
        }
      }

      toast({ title: `${type === 'image' ? 'Image' : 'Video'} uploaded successfully!` });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      if (isAdditional) setUploadingAdditionalMedia(false);
      else if (type === 'image') setUploadingImage(false);
      else setUploadingVideo(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: parseFloat(productForm.price),
      original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
      category_id: productForm.category_id || null,
      image_url: productForm.image_url || null,
      video_url: productForm.video_url || null,
      stock: parseInt(productForm.stock),
      is_active: productForm.is_active,
    };

    try {
      let productId = editingProduct?.id;
      
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(data)
          .eq('id', editingProduct.id);
        if (error) throw error;
        
        // Delete existing additional images and videos
        await supabase.from('product_images').delete().eq('product_id', editingProduct.id);
        await supabase.from('product_videos').delete().eq('product_id', editingProduct.id);
      } else {
        const { data: newProduct, error } = await supabase.from('products').insert(data).select().single();
        if (error) throw error;
        productId = newProduct.id;
      }

      // Insert additional images
      if (additionalImages.length > 0 && productId) {
        const imageInserts = additionalImages.map((url, idx) => ({
          product_id: productId,
          image_url: url,
          display_order: idx,
        }));
        await supabase.from('product_images').insert(imageInserts);
      }

      // Insert additional videos
      if (additionalVideos.length > 0 && productId) {
        const videoInserts = additionalVideos.map((url, idx) => ({
          product_id: productId,
          video_url: url,
          display_order: idx,
        }));
        await supabase.from('product_videos').insert(videoInserts);
      }

      toast({ title: editingProduct ? 'Product updated!' : 'Product added!' });
      setProductDialogOpen(false);
      resetProductForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: categoryForm.name.trim(),
      slug: categoryForm.slug.trim().toLowerCase().replace(/\s+/g, '-'),
      description: categoryForm.description.trim() || null,
    };

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(data)
          .eq('id', editingCategory.id);
        if (error) throw error;
        toast({ title: 'Category updated!' });
      } else {
        const { error } = await supabase.from('categories').insert(data);
        if (error) throw error;
        toast({ title: 'Category added!' });
      }

      setCategoryDialogOpen(false);
      resetCategoryForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      code: couponForm.code.trim().toUpperCase(),
      discount_type: couponForm.discount_type,
      discount_value: parseFloat(couponForm.discount_value),
      min_order_amount: parseFloat(couponForm.min_order_amount) || 0,
      max_uses: couponForm.max_uses ? parseInt(couponForm.max_uses) : null,
      expires_at: couponForm.expires_at || null,
      is_active: couponForm.is_active,
    };

    try {
      if (editingCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(data)
          .eq('id', editingCoupon.id);
        if (error) throw error;
        toast({ title: 'Coupon updated!' });
      } else {
        const { error } = await supabase.from('coupons').insert(data);
        if (error) throw error;
        toast({ title: 'Coupon created!' });
      }

      setCouponDialogOpen(false);
      resetCouponForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Product deleted!' });
      fetchData();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Category deleted!' });
      fetchData();
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Coupon deleted!' });
      fetchData();
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Order status updated to ${status}` });
      fetchData();
    }
  };

  const handleCreateShipment = async (order: Order) => {
    try {
      const { data, error } = await supabase.functions.invoke('shiprocket-create-order', {
        body: {
          order_id: order.id,
          order_date: new Date(order.created_at).toISOString().split('T')[0],
          pickup_location: 'Primary',
          billing_customer_name: order.customer_name,
          billing_address: order.customer_address,
          billing_city: 'City',
          billing_pincode: '000000',
          billing_state: 'State',
          billing_country: 'India',
          billing_email: order.customer_email || 'customer@example.com',
          billing_phone: order.customer_phone,
          shipping_is_billing: true,
          order_items: order.order_items.map(item => ({
            name: item.product_name,
            sku: item.id,
            units: item.quantity,
            selling_price: item.product_price,
          })),
          payment_method: order.payment_method === 'cod' ? 'COD' : 'Prepaid',
          sub_total: order.total,
          length: 10,
          breadth: 10,
          height: 10,
          weight: 0.5,
        },
      });

      if (error) throw error;

      toast({ title: 'Shipment created successfully!' });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error creating shipment',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleTrackOrder = async (order: Order) => {
    setSelectedOrder(order);
    setTrackingDialogOpen(true);
    setTrackingInfo(null);

    if (order.shiprocket_shipment_id) {
      try {
        const { data, error } = await supabase.functions.invoke('shiprocket-track', {
          body: { shipment_id: order.shiprocket_shipment_id },
        });

        if (error) throw error;
        setTrackingInfo(data.data);
      } catch (error: any) {
        toast({
          title: 'Error fetching tracking',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '', description: '', price: '', original_price: '', category_id: '',
      image_url: '', video_url: '', stock: '0', is_active: true,
    });
    setAdditionalImages([]);
    setAdditionalVideos([]);
    setEditingProduct(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', slug: '', description: '' });
    setEditingCategory(null);
  };

  const resetCouponForm = () => {
    setCouponForm({
      code: '', discount_type: 'percentage', discount_value: '',
      min_order_amount: '0', max_uses: '', expires_at: '', is_active: true,
    });
    setEditingCoupon(null);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      category_id: product.category_id || '',
      image_url: product.image_url || '',
      video_url: product.video_url || '',
      stock: product.stock.toString(),
      is_active: product.is_active,
    });
    setAdditionalImages(product.product_images?.map(img => img.image_url) || []);
    setAdditionalVideos(product.product_videos?.map(vid => vid.video_url) || []);
    setProductDialogOpen(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
    setCategoryDialogOpen(true);
  };

  const openEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_amount: coupon.min_order_amount.toString(),
      max_uses: coupon.max_uses?.toString() || '',
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
      is_active: coupon.is_active,
    });
    setCouponDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Admin Panel</h1>
          <Button variant="outline" onClick={fetchData} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Tag className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="coupons" className="gap-2">
              <Ticket className="w-4 h-4" />
              Coupons
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Products ({products.length})</h2>
              <Dialog open={productDialogOpen} onOpenChange={(open) => {
                setProductDialogOpen(open);
                if (!open) resetProductForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? 'Edit' : 'Add'} Product</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleProductSubmit} className="space-y-4 mt-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} required />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Original Price (₹) <span className="text-xs text-muted-foreground">(optional - for showing discount)</span></Label>
                        <Input type="number" value={productForm.original_price} onChange={(e) => setProductForm({...productForm, original_price: e.target.value})} placeholder="MRP" />
                      </div>
                      <div>
                        <Label>Sale Price (₹) *</Label>
                        <Input type="number" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Stock</Label>
                        <Input type="number" value={productForm.stock} onChange={(e) => setProductForm({...productForm, stock: e.target.value})} />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select value={productForm.category_id} onValueChange={(v) => setProductForm({...productForm, category_id: v})}>
                          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Main Product Image</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={productForm.image_url} 
                          onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                          placeholder="Image URL or upload"
                        />
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')}
                          />
                          <Button type="button" variant="outline" size="icon" disabled={uploadingImage} asChild>
                            <span>{uploadingImage ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}</span>
                          </Button>
                        </label>
                      </div>
                      {productForm.image_url && (
                        <img src={productForm.image_url} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded" />
                      )}
                    </div>

                    <div>
                      <Label>Additional Images</Label>
                      <div className="flex gap-2 mb-2">
                        <label className="cursor-pointer flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image', true)}
                          />
                          <Button type="button" variant="outline" className="w-full gap-2" disabled={uploadingAdditionalMedia} asChild>
                            <span>{uploadingAdditionalMedia ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" />Add Image</>}</span>
                          </Button>
                        </label>
                      </div>
                      {additionalImages.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {additionalImages.map((url, idx) => (
                            <div key={idx} className="relative">
                              <img src={url} alt={`Additional ${idx + 1}`} className="w-16 h-16 object-cover rounded" />
                              <button
                                type="button"
                                onClick={() => setAdditionalImages(prev => prev.filter((_, i) => i !== idx))}
                                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Main Product Video</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={productForm.video_url} 
                          onChange={(e) => setProductForm({...productForm, video_url: e.target.value})}
                          placeholder="Video URL or upload"
                        />
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')}
                          />
                          <Button type="button" variant="outline" size="icon" disabled={uploadingVideo} asChild>
                            <span>{uploadingVideo ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}</span>
                          </Button>
                        </label>
                      </div>
                    </div>

                    <div>
                      <Label>Additional Videos</Label>
                      <div className="flex gap-2 mb-2">
                        <label className="cursor-pointer flex-1">
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video', true)}
                          />
                          <Button type="button" variant="outline" className="w-full gap-2" disabled={uploadingAdditionalMedia} asChild>
                            <span>{uploadingAdditionalMedia ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" />Add Video</>}</span>
                          </Button>
                        </label>
                      </div>
                      {additionalVideos.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {additionalVideos.map((url, idx) => (
                            <div key={idx} className="relative bg-muted rounded p-2 text-xs flex items-center gap-2">
                              <Video className="w-4 h-4" />
                              <span>Video {idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => setAdditionalVideos(prev => prev.filter((_, i) => i !== idx))}
                                className="bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs ml-1"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch checked={productForm.is_active} onCheckedChange={(c) => setProductForm({...productForm, is_active: c})} />
                      <Label>Active</Label>
                    </div>

                    <Button type="submit" className="w-full">{editingProduct ? 'Update' : 'Add'} Product</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {products.map(product => (
                <div key={product.id} className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{product.name}</h3>
                      {!product.is_active && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{product.categories?.name || 'No category'}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                  <p className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEditProduct(product)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteProduct(product.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Categories ({categories.length})</h2>
              <Dialog open={categoryDialogOpen} onOpenChange={(open) => {
                setCategoryDialogOpen(open);
                if (!open) resetCategoryForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="w-4 h-4" />Add Category</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCategory ? 'Edit' : 'Add'} Category</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCategorySubmit} className="space-y-4 mt-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={categoryForm.name} onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})} required />
                    </div>
                    <div>
                      <Label>Slug</Label>
                      <Input value={categoryForm.slug} onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})} required placeholder="e.g., birthday-gifts" />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})} />
                    </div>
                    <Button type="submit" className="w-full">{editingCategory ? 'Update' : 'Add'} Category</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border">
                  <div className="flex-1">
                    <h3 className="font-semibold">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">/{cat.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEditCategory(cat)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteCategory(cat.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Coupons ({coupons.length})</h2>
              <Dialog open={couponDialogOpen} onOpenChange={(open) => {
                setCouponDialogOpen(open);
                if (!open) resetCouponForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="w-4 h-4" />Add Coupon</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCoupon ? 'Edit' : 'Add'} Coupon</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCouponSubmit} className="space-y-4 mt-4">
                    <div>
                      <Label>Code</Label>
                      <Input value={couponForm.code} onChange={(e) => setCouponForm({...couponForm, code: e.target.value})} required placeholder="e.g., WELCOME10" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Type</Label>
                        <Select value={couponForm.discount_type} onValueChange={(v) => setCouponForm({...couponForm, discount_type: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Value</Label>
                        <Input type="number" value={couponForm.discount_value} onChange={(e) => setCouponForm({...couponForm, discount_value: e.target.value})} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Min Order (₹)</Label>
                        <Input type="number" value={couponForm.min_order_amount} onChange={(e) => setCouponForm({...couponForm, min_order_amount: e.target.value})} />
                      </div>
                      <div>
                        <Label>Max Uses</Label>
                        <Input type="number" value={couponForm.max_uses} onChange={(e) => setCouponForm({...couponForm, max_uses: e.target.value})} placeholder="Unlimited" />
                      </div>
                    </div>
                    <div>
                      <Label>Expires At</Label>
                      <Input type="date" value={couponForm.expires_at} onChange={(e) => setCouponForm({...couponForm, expires_at: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={couponForm.is_active} onCheckedChange={(c) => setCouponForm({...couponForm, is_active: c})} />
                      <Label>Active</Label>
                    </div>
                    <Button type="submit" className="w-full">{editingCoupon ? 'Update' : 'Add'} Coupon</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {coupons.map(coupon => (
                <div key={coupon.id} className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-mono font-bold text-lg">{coupon.code}</h3>
                      {!coupon.is_active && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% off` : `₹${coupon.discount_value} off`}
                      {coupon.min_order_amount > 0 && ` on orders above ₹${coupon.min_order_amount}`}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">Used: {coupon.used_count}{coupon.max_uses && `/${coupon.max_uses}`}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEditCoupon(coupon)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteCoupon(coupon.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <h2 className="text-xl font-semibold mb-6">Orders ({orders.length})</h2>

            {orders.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-card rounded-xl p-6 border border-border">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Order ID</p>
                        <p className="font-mono font-bold">#{order.id.slice(0, 8)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Customer</p>
                        <p className="font-medium">{order.customer_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{order.customer_phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-bold text-primary">₹{order.total.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment</p>
                        <Badge className={order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {order.payment_status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Status</p>
                        <Select value={order.status} onValueChange={(v) => handleOrderStatusChange(order.id, v)}>
                          <SelectTrigger className={`w-32 ${getStatusColor(order.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-4">
                      {!order.shiprocket_order_id && order.status === 'confirmed' && (
                        <Button size="sm" variant="outline" onClick={() => handleCreateShipment(order)} className="gap-2">
                          <Truck className="w-4 h-4" />
                          Create Shipment
                        </Button>
                      )}
                      {order.shiprocket_shipment_id && (
                        <Button size="sm" variant="outline" onClick={() => handleTrackOrder(order)} className="gap-2">
                          <Eye className="w-4 h-4" />
                          Track Order
                        </Button>
                      )}
                    </div>

                    <div className="border-t border-border pt-4">
                      <p className="text-sm text-muted-foreground mb-2">Address</p>
                      <p className="text-sm">{order.customer_address}</p>
                    </div>

                    <div className="border-t border-border pt-4 mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Items</p>
                      <div className="space-y-2">
                        {order.order_items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.product_name} x{item.quantity}</span>
                            <span>₹{(item.product_price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tracking Dialog */}
            <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Order Tracking</DialogTitle>
                </DialogHeader>
                {selectedOrder && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Order: #{selectedOrder.id.slice(0, 8)}</p>
                    {selectedOrder.shiprocket_shipment_id && (
                      <p className="text-sm">Shipment ID: {selectedOrder.shiprocket_shipment_id}</p>
                    )}
                    {trackingInfo ? (
                      <div className="space-y-2">
                        <p className="font-semibold">Tracking Status:</p>
                        <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-60">
                          {JSON.stringify(trackingInfo, null, 2)}
                        </pre>
                      </div>
                    ) : selectedOrder.shiprocket_shipment_id ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No shipment created yet</p>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
