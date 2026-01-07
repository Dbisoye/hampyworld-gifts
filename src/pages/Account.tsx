import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, HelpCircle, User, MapPin, CreditCard, ChevronRight, LogOut, Mail, Phone, Edit2, Save, X } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

const Account = () => {
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      fetchProfile();
    }
  }, [user, isLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...formData } : null);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const menuItems = [
    {
      icon: Package,
      title: 'My Orders',
      description: 'View and track your orders',
      link: '/orders',
    },
    {
      icon: HelpCircle,
      title: 'Help Centre',
      description: 'Get help with your queries',
      link: '/help',
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">
          My Account
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - Quick Links */}
          <div className="lg:col-span-1 space-y-4">
            {/* User Info Card */}
            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center">
                    <User className="w-8 h-8 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {profile?.full_name || 'User'}
                    </h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="glass border-border/50">
              <CardContent className="p-0">
                {menuItems.map((item, index) => (
                  <Link
                    key={item.title}
                    to={item.link}
                    className={`flex items-center justify-between p-4 hover:bg-accent/10 transition-colors ${
                      index !== menuItems.length - 1 ? 'border-b border-border/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-accent" />
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Logout Button */}
            <Button
              variant="outline"
              className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="profile">Edit Profile</TabsTrigger>
                <TabsTrigger value="address">Saved Address</TabsTrigger>
                <TabsTrigger value="payments">Saved Payments</TabsTrigger>
              </TabsList>

              {/* Edit Profile Tab */}
              <TabsContent value="profile">
                <Card className="glass border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Profile Information</CardTitle>
                    {!editing ? (
                      <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <User className="w-4 h-4 text-accent" />
                          Full Name
                        </Label>
                        {editing ? (
                          <Input
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <p className="text-foreground py-2">{profile?.full_name || 'Not set'}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-accent" />
                          Email Address
                        </Label>
                        <p className="text-foreground py-2">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-accent" />
                          Phone Number
                        </Label>
                        {editing ? (
                          <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Enter your phone number"
                          />
                        ) : (
                          <p className="text-foreground py-2">{profile?.phone || 'Not set'}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Saved Address Tab */}
              <TabsContent value="address">
                <Card className="glass border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-accent" />
                      Saved Address
                    </CardTitle>
                    {!editing ? (
                      <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {editing ? (
                      <div className="space-y-2">
                        <Label>Delivery Address</Label>
                        <Textarea
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Enter your full address including city, state, and pincode"
                          rows={4}
                        />
                      </div>
                    ) : (
                      <>
                        {profile?.address ? (
                          <div className="p-4 bg-secondary/30 rounded-lg">
                            <p className="text-foreground whitespace-pre-line">{profile.address}</p>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">No address saved yet</p>
                            <Button variant="outline" onClick={() => setEditing(true)}>
                              Add Address
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Saved Payments Tab */}
              <TabsContent value="payments">
                <Card className="glass border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-accent" />
                      Saved Payment Methods
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">No payment methods saved</p>
                      <p className="text-sm text-muted-foreground">
                        Payment methods will be saved automatically when you make a purchase
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Account;
