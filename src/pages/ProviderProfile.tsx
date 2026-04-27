import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  User, Camera, Briefcase, Award, Shield, Mail, Phone, 
  Fingerprint, ScanFace, Settings, MapPin, DollarSign, 
  CheckCircle, XCircle, AlertCircle, Save
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface ProviderProfile {
  _id: string;
  fullName: string;
  serviceType: string;
  city: string;
  phone: string;
  description: string | null;
  experienceYears: number | null;
  hourlyRate: string | null;
  isVerified: boolean | null;
  serviceRadius: number;
}

interface KYCStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  aadhaarVerified: boolean;
  selfieVerified: boolean;
  isFullyVerified: boolean;
}

const serviceCategories = [
  "Plumber", "Electrician", "Cleaner", "Painter", "Doctor", "Carpenter", "Emergency Services"
];

const ProviderProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [description, setDescription] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);
  const [hourlyRate, setHourlyRate] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [city, setCity] = useState("");
  const [serviceRadius, setServiceRadius] = useState(10);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      const [profileRes, kycRes] = await Promise.all([
        api.getProviderProfile().catch(() => null),
        api.getKyc().catch(() => null),
      ]);

      if (profileRes) {
        setProfile(profileRes as any);
        setFullName(profileRes.fullName || '');
        setDescription(profileRes.description || '');
        setExperienceYears(profileRes.experienceYears || 0);
        setHourlyRate(profileRes.hourlyRate || '');
        setServiceType(profileRes.serviceType || '');
        setCity(profileRes.city || '');
        setServiceRadius(profileRes.serviceRadius || 10);
      }

      if (kycRes) {
        setKycStatus(kycRes as any);
      }

      setLoading(false);
    };
    
    fetchData();
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) return;
    
    setSaving(true);
    try {
      await api.updateProviderProfile({
        fullName,
        description,
        experienceYears,
        hourlyRate,
        serviceType,
        city,
        serviceRadius,
      });
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to save profile');
    }
  };

  const getInitials = () => {
    if (!fullName) return "P";
    return fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const VerificationItem = ({ 
    label, 
    verified, 
    icon: Icon 
  }: { 
    label: string; 
    verified: boolean; 
    icon: React.ElementType;
  }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${verified ? "bg-emerald-500/20" : "bg-muted"}`}>
          <Icon className={`w-4 h-4 ${verified ? "text-emerald-600" : "text-muted-foreground"}`} />
        </div>
        <span className="font-medium text-sm">{label}</span>
      </div>
      {verified ? (
        <Badge className="bg-emerald-500/20 text-emerald-700 border-0">
          <CheckCircle className="w-3 h-3 mr-1" /> Verified
        </Badge>
      ) : (
        <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 border-0">
          <AlertCircle className="w-3 h-3 mr-1" /> Pending
        </Badge>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-4xl space-y-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid gap-6">
              <Skeleton className="h-[300px]" />
              <Skeleton className="h-[200px]" />
              <Skeleton className="h-[250px]" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Profile Management</h1>
                <p className="text-muted-foreground">Manage your professional profile and settings</p>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            {/* Profile Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Profile Details
                </CardTitle>
                <CardDescription>Your professional information visible to customers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold">Profile Photo</h3>
                    <p className="text-sm text-muted-foreground">Upload a professional photo</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>

                  {/* Experience */}
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience (Years)</Label>
                    <Input 
                      id="experience" 
                      type="number"
                      value={experienceYears} 
                      onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                      placeholder="Years of experience"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Your city"
                    />
                  </div>

                  {/* Hourly Rate */}
                  <div className="space-y-2">
                    <Label htmlFor="rate">Hourly Rate (₹)</Label>
                    <Input 
                      id="rate" 
                      value={hourlyRate} 
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="e.g., 500-1000"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Bio / Description</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell customers about your skills and experience..."
                    rows={4}
                  />
                </div>

                {/* Skills & Certifications Placeholder */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-center">
                    <Briefcase className="w-8 h-8 text-muted-foreground/50 mb-2" />
                    <span className="text-sm font-medium text-muted-foreground">Skills</span>
                    <span className="text-xs text-muted-foreground/70">Coming soon</span>
                  </div>
                  <div className="p-4 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-center">
                    <Award className="w-8 h-8 text-muted-foreground/50 mb-2" />
                    <span className="text-sm font-medium text-muted-foreground">Certifications</span>
                    <span className="text-xs text-muted-foreground/70">Coming soon</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KYC Verification Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      KYC Verification
                    </CardTitle>
                    <CardDescription>Complete verification to build trust with customers</CardDescription>
                  </div>
                  {kycStatus?.isFullyVerified ? (
                    <Badge className="bg-emerald-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" /> Fully Verified
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => navigate("/kyc-verification")}>
                      Complete KYC
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <VerificationItem label="Email Verification" verified={kycStatus?.emailVerified ?? false} icon={Mail} />
                <VerificationItem label="Phone Verification" verified={kycStatus?.phoneVerified ?? false} icon={Phone} />
                <VerificationItem label="Aadhaar Verification" verified={kycStatus?.aadhaarVerified ?? false} icon={Fingerprint} />
                <VerificationItem label="Selfie Verification" verified={kycStatus?.selfieVerified ?? false} icon={ScanFace} />
              </CardContent>
            </Card>

            {/* Service Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Service Settings
                </CardTitle>
                <CardDescription>Configure your service preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service Category */}
                <div className="space-y-2">
                  <Label>Service Category</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your service category" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Hourly Rate
                  </Label>
                  <Input 
                    value={hourlyRate} 
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="e.g., ₹500 - ₹1000"
                  />
                </div>

                {/* Service Radius */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Service Radius
                    </Label>
                    <span className="text-lg font-bold text-primary">{serviceRadius} km</span>
                  </div>
                  <Slider
                    value={[serviceRadius]}
                    onValueChange={(v) => setServiceRadius(v[0])}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>1 km</span>
                    <span>50 km</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProviderProfile;
