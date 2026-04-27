import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Mail, Lock, User, Phone, Briefcase, Building2, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const serviceTypes = [
  'Plumber',
  'Electrician',
  'Doctor',
  'Cleaner',
  'Painter',
  'Carpenter',
  'Mechanic',
  'Salon & Spa',
  'Other',
];

const cities = [
  'Bangalore',
  'Mumbai',
  'Delhi',
  'Chennai',
  'Hyderabad',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Other',
];

// Validation schemas
const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const phoneSchema = z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number').optional().or(z.literal(''));
const requiredPhoneSchema = z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

type SignupType = 'user' | 'service_provider';

const Auth = () => {
  const navigate = useNavigate();
  const { user, signUp, signIn, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [signupType, setSignupType] = useState<SignupType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const validateField = (field: string, value: string) => {
    try {
      switch (field) {
        case 'email':
          emailSchema.parse(value);
          break;
        case 'password':
          passwordSchema.parse(value);
          break;
        case 'phone':
          if (signupType === 'service_provider') {
            requiredPhoneSchema.parse(value);
          } else {
            phoneSchema.parse(value);
          }
          break;
        case 'fullName':
          nameSchema.parse(value);
          break;
      }
      setErrors((prev) => ({ ...prev, [field]: '' }));
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: err.errors[0].message }));
      }
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const emailValid = validateField('email', email);
    const passwordValid = validateField('password', password);

    if (!emailValid || !passwordValid) {
      setIsSubmitting(false);
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Signed in successfully!');
      navigate('/');
    }

    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const emailValid = validateField('email', email);
    const passwordValid = validateField('password', password);
    const nameValid = validateField('fullName', fullName);

    if (!emailValid || !passwordValid || !nameValid) {
      setIsSubmitting(false);
      return;
    }

    if (signupType === 'service_provider') {
      const phoneValid = validateField('phone', phone);
      if (!phoneValid || !serviceType || !city) {
        if (!serviceType) setErrors((prev) => ({ ...prev, serviceType: 'Please select a service type' }));
        if (!city) setErrors((prev) => ({ ...prev, city: 'Please select a city' }));
        setIsSubmitting(false);
        return;
      }
    }

    const profileData = signupType === 'user'
      ? { full_name: fullName, phone: phone || undefined }
      : {
          full_name: fullName,
          service_type: serviceType,
          city,
          phone,
          description: description || undefined,
          experience_years: experienceYears ? parseInt(experienceYears) : undefined,
          hourly_rate: hourlyRate || undefined,
        };

    const { error } = await signUp(email, password, signupType!, profileData);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Please check your email to verify your account.');
      resetForm();
      setActiveTab('signin');
    }

    setIsSubmitting(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setServiceType('');
    setCity('');
    setDescription('');
    setExperienceYears('');
    setHourlyRate('');
    setErrors({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
          <a href="/" className="flex items-center gap-2 mb-12">
            <img src="/urban-sahay-logo.png" alt="Urban Sahay" className="w-12 h-12 rounded-xl object-cover" />
            <span className="text-2xl font-bold">UrbanSahay</span>
          </a>
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Find Trusted Professionals
            <br />
            In Your Neighborhood
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Whether you're looking for help or offering your services, 
            Urban Sahay connects you with the right people in your city.
          </p>
        </div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-48 h-48 bg-primary-foreground/10 rounded-full blur-3xl" />
      </div>

      {/* Right side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <a href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/urban-sahay-logo.png" alt="Urban Sahay" className="w-10 h-10 rounded-xl object-cover" />
            <span className="text-xl font-bold text-foreground">
              Urban<span className="text-primary">Sahay</span>
            </span>
          </a>

          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'signin' | 'signup'); setSignupType(null); resetForm(); }}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In Form */}
            <TabsContent value="signin">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back</h2>
                <p className="text-muted-foreground mb-6">Sign in to your account to continue</p>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </motion.div>
            </TabsContent>

            {/* Sign Up Flow */}
            <TabsContent value="signup">
              <AnimatePresence mode="wait">
                {!signupType ? (
                  <motion.div
                    key="type-selection"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-foreground mb-2">Create an account</h2>
                    <p className="text-muted-foreground mb-6">How would you like to join Urban Sahay?</p>

                    <div className="space-y-4">
                      <button
                        onClick={() => setSignupType('user')}
                        className="w-full p-6 rounded-xl border-2 border-border hover:border-primary bg-card hover:bg-secondary/50 transition-all duration-200 text-left group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">I need services</h3>
                            <p className="text-sm text-muted-foreground">
                              Find and connect with verified professionals in your area
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setSignupType('service_provider')}
                        className="w-full p-6 rounded-xl border-2 border-border hover:border-accent bg-card hover:bg-accent/5 transition-all duration-200 text-left group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                            <Briefcase className="w-6 h-6 text-accent" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">I provide services</h3>
                            <p className="text-sm text-muted-foreground">
                              Join as a professional and grow your business
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                ) : signupType === 'user' ? (
                  <motion.div
                    key="user-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button
                      onClick={() => { setSignupType(null); resetForm(); }}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>

                    <h2 className="text-2xl font-bold text-foreground mb-2">Create your account</h2>
                    <p className="text-muted-foreground mb-6">Fill in your details to get started</p>

                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div>
                        <Label htmlFor="user-name">Full Name</Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="user-name"
                            type="text"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                        {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
                      </div>

                      <div>
                        <Label htmlFor="user-email">Email</Label>
                        <div className="relative mt-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="user-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <Label htmlFor="user-phone">Phone (optional)</Label>
                        <div className="relative mt-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="user-phone"
                            type="tel"
                            placeholder="9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <Label htmlFor="user-password">Password</Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="user-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                        {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                      </div>

                      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating account...' : 'Create Account'}
                      </Button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="sp-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button
                      onClick={() => { setSignupType(null); resetForm(); }}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>

                    <h2 className="text-2xl font-bold text-foreground mb-2">Join as a Professional</h2>
                    <p className="text-muted-foreground mb-6">Tell us about your services</p>

                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="sp-name">Full Name</Label>
                          <div className="relative mt-1">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="sp-name"
                              type="text"
                              placeholder="Your name"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                          {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
                        </div>

                        <div>
                          <Label htmlFor="sp-phone">Phone</Label>
                          <div className="relative mt-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="sp-phone"
                              type="tel"
                              placeholder="9876543210"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                          {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="sp-email">Email</Label>
                        <div className="relative mt-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="sp-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Service Type</Label>
                          <Select value={serviceType} onValueChange={setServiceType}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                              {serviceTypes.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.serviceType && <p className="text-sm text-destructive mt-1">{errors.serviceType}</p>}
                        </div>

                        <div>
                          <Label>City</Label>
                          <Select value={city} onValueChange={setCity}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent>
                              {cities.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="sp-experience">Experience (years)</Label>
                          <Input
                            id="sp-experience"
                            type="number"
                            placeholder="5"
                            value={experienceYears}
                            onChange={(e) => setExperienceYears(e.target.value)}
                            className="mt-1"
                            min="0"
                          />
                        </div>

                        <div>
                          <Label htmlFor="sp-rate">Hourly Rate</Label>
                          <Input
                            id="sp-rate"
                            type="text"
                            placeholder="₹300/hr"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="sp-description">About You (optional)</Label>
                        <Textarea
                          id="sp-description"
                          placeholder="Tell customers about your experience and skills..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="mt-1 resize-none"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="sp-password">Password</Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="sp-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                        {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                      </div>

                      <Button type="submit" variant="accent" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating account...' : 'Join as Professional'}
                      </Button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;