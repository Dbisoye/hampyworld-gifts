import { useState } from 'react';
import { Plus, Edit2, Trash2, Package, ShoppingBag } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getProducts, 
  getOrders, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  updateOrderStatus,
  Product,
  Order,
  categories
} from '@/data/store';
import { toast } from '@/hooks/use-toast';

const Admin = () => {
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [orders, setOrders] = useState<Order[]>(getOrders());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'birthday' as Product['category']
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'birthday'
    });
    setEditingProduct(null);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        image: product.image,
        category: product.category
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      image: formData.image.trim() || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop',
      category: formData.category
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      toast({ title: "Product updated successfully!" });
    } else {
      addProduct(productData);
      toast({ title: "Product added successfully!" });
    }

    setProducts(getProducts());
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
      setProducts(getProducts());
      toast({ title: "Product deleted successfully!" });
    }
  };

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
    setOrders(getOrders());
    toast({ title: `Order status updated to ${status}` });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-8">
          Admin Panel
        </h1>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Manage Products ({products.length})
              </h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(value: Product['category']) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.filter(c => c.id !== 'all').map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="image">Image URL</Label>
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border"
                >
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category.replace('-', ' ')}</p>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    ₹{product.price.toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleOpenDialog(product)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Orders ({orders.length})
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order.id}
                    className="bg-card rounded-xl p-6 border border-border"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Order ID</p>
                        <p className="font-mono font-bold">#{order.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Customer</p>
                        <p className="font-medium">{order.customer.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{order.customer.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-bold text-primary">₹{order.total.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Status</p>
                        <Select 
                          value={order.status} 
                          onValueChange={(value: Order['status']) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="border-t border-border pt-4">
                      <p className="text-sm text-muted-foreground mb-2">Address</p>
                      <p className="text-sm">{order.customer.address}</p>
                    </div>

                    <div className="border-t border-border pt-4 mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Items</p>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.product.id} className="flex justify-between text-sm">
                            <span>{item.product.name} x{item.quantity}</span>
                            <span>₹{(item.product.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
