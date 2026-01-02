import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const phoneSchema = z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Please enter a valid phone number');

const Auth = () => {
  const navigate = useNavigate();
  const { user, signUp, signIn, isLoading } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    otp: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateEmail = (email: string) => {
    const result = emailSchema.safeParse(email);
    return result.success ? '' : result.error.errors[0].message;
  };

  const validatePassword = (password: string) => {
    const result = passwordSchema.safeParse(password);
    return result.success ? '' : result.error.errors[0].message;
  };

  const validatePhone = (phone: string) => {
    if (!phone) return '';
    const result = phoneSchema.safeParse(phone);
    return result.success ? '' : result.error.errors[0].message;
  };

  const handleSendOtp = async (type: 'email' | 'phone') => {
    const identifier = type === 'email' ? formData.email : formData.phone;
    
    if (type === 'email') {
      const error = validateEmail(identifier);
      if (error) {
        setErrors(prev => ({ ...prev, email: error }));
        return;
      }
    } else {
      const error = validatePhone(identifier);
      if (error) {
        setErrors(prev => ({ ...prev, phone: error }));
        return;
      }
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { identifier, type },
      });

      if (error) throw error;

      setOtpSent(true);
      toast({
        title: 'OTP Sent!',
        description: `Verification code sent to your ${type}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send OTP',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (type: 'email' | 'phone') => {
    const identifier = type === 'email' ? formData.email : formData.phone;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { identifier, otp: formData.otp, type },
      });

      if (error) throw error;

      setOtpVerified(true);
      toast({
        title: 'Verified!',
        description: 'Your account has been verified',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Invalid OTP',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    
    if (emailError || passwordError) {
      setErrors({ ...errors, email: emailError, password: passwordError });
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        
        toast({
          title: 'Welcome back!',
          description: 'You have been signed in successfully',
        });
        navigate('/');
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) throw error;
        
        toast({
          title: 'Account created!',
          description: 'You have been signed up successfully',
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Authentication failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? 'Sign in to continue shopping' : 'Join HampyWorld today'}
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-soft border border-border">
            <Tabs defaultValue="email" className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone OTP</TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="pl-10"
                          placeholder="John Doe"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          setErrors({ ...errors, email: '' });
                        }}
                        className="pl-10"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          setErrors({ ...errors, password: '' });
                        }}
                        className="pl-10 pr-10"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                  </div>

                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    {loading ? (
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                      <>
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="phone">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          setErrors({ ...errors, phone: '' });
                        }}
                        className="pl-10"
                        placeholder="+91 9876543210"
                        disabled={otpSent}
                      />
                    </div>
                    {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                  </div>

                  {!otpSent ? (
                    <Button 
                      type="button" 
                      className="w-full gap-2"
                      onClick={() => handleSendOtp('phone')}
                      disabled={loading || !formData.phone}
                    >
                      {loading ? (
                        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                      ) : (
                        <>
                          Send OTP
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="otp">Enter OTP</Label>
                        <Input
                          id="otp"
                          type="text"
                          value={formData.otp}
                          onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          disabled={otpVerified}
                        />
                      </div>
                      
                      <Button 
                        type="button" 
                        className="w-full gap-2"
                        onClick={() => handleVerifyOtp('phone')}
                        disabled={loading || formData.otp.length !== 6 || otpVerified}
                      >
                        {loading ? (
                          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                        ) : otpVerified ? (
                          'Verified ✓'
                        ) : (
                          'Verify OTP'
                        )}
                      </Button>

                      {otpVerified && (
                        <p className="text-sm text-muted-foreground text-center">
                          Now complete signup with email & password above
                        </p>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setOtpSent(false);
                  setOtpVerified(false);
                  setFormData({ email: '', password: '', fullName: '', phone: '', otp: '' });
                  setErrors({ email: '', password: '', phone: '' });
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
