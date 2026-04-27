import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  Mail, Phone, Shield, Camera, CheckCircle2, Circle, Loader2, ArrowRight, ArrowLeft, BadgeCheck, Upload, Video
} from 'lucide-react';

type Step = 'email' | 'phone' | 'aadhaar' | 'selfie' | 'complete';

interface KYCData {
  emailVerified: boolean;
  phoneVerified: boolean;
  phoneNumber: string | null;
  aadhaarNumber: string | null;
  aadhaarVerified: boolean;
  selfieUrl: string | null;
  selfieVerified: boolean;
  isFullyVerified: boolean;
}

const STEPS: { key: Step; label: string; icon: typeof Mail }[] = [
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'phone', label: 'Phone', icon: Phone },
  { key: 'aadhaar', label: 'Aadhaar', icon: Shield },
  { key: 'selfie', label: 'Selfie', icon: Camera },
];

const KYCVerificationFlow = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Step states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (user) fetchKYCData();
  }, [user]);

  // Cleanup camera on unmount or step change
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraStream]);

  const fetchKYCData = async () => {
    if (!user) return;
    try {
      // Reset KYC for demo - then set to blank slate
      await api.resetKyc();
    } catch {
      // ignore if not found
    }
    setKycData({
      emailVerified: false, phoneVerified: false, phoneNumber: null,
      aadhaarNumber: null, aadhaarVerified: false,
      selfieUrl: null, selfieVerified: false, isFullyVerified: false,
    });
    setCurrentStep('email');
    setLoading(false);
  };

  const updateKYC = async (updates: Partial<KYCData>) => {
    if (!user) return;
    const allVerified = { ...kycData, ...updates };
    const isFullyVerified = !!(allVerified.emailVerified && allVerified.phoneVerified && allVerified.selfieVerified);
    const payload: Record<string, unknown> = { ...updates, isFullyVerified };
    await api.updateKyc(payload as any);
    setKycData(prev => prev ? { ...prev, ...updates, isFullyVerified } : prev);
    return isFullyVerified;
  };

  // Email verification - since auto-confirm is on, email is verified
  const handleEmailVerify = async () => {
    setSubmitting(true);
    const isComplete = await updateKYC({ emailVerified: true });
    toast.success('Email verified successfully!');
    if (isComplete) setCurrentStep('complete');
    else setCurrentStep('phone');
    setSubmitting(false);
  };

  // Phone OTP - simulated
  const handleSendOtp = () => {
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(otp);
    setOtpSent(true);
    toast.success(`OTP sent! (Simulated OTP: ${otp})`);
  };

  const handleVerifyOtp = async () => {
    if (phoneOtp !== generatedOtp) {
      toast.error('Invalid OTP. Please try again.');
      return;
    }
    setSubmitting(true);
    const isComplete = await updateKYC({ phoneVerified: true, phoneNumber: phoneNumber });
    toast.success('Phone number verified!');
    if (isComplete) setCurrentStep('complete');
    else setCurrentStep('aadhaar');
    setSubmitting(false);
  };

  // Aadhaar verification
  const handleAadhaarVerify = async () => {
    const cleaned = aadhaarNumber.replace(/\s/g, '');
    if (!/^[0-9]{12}$/.test(cleaned)) {
      toast.error('Please enter a valid 12-digit Aadhaar number');
      return;
    }
    setSubmitting(true);
    // Simulate verification delay
    await new Promise(r => setTimeout(r, 1500));
    const isComplete = await updateKYC({ aadhaarVerified: true, aadhaarNumber: cleaned.slice(-4) });
    toast.success('Aadhaar verified successfully!');
    if (isComplete) setCurrentStep('complete');
    else setCurrentStep('selfie');
    setSubmitting(false);
  };

  // Selfie upload from file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large. Max 5MB.');
        return;
      }
      stopCamera();
      setSelfieFile(file);
      setSelfiePreview(URL.createObjectURL(file));
    }
  };

  // Live camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      setCameraStream(stream);
      setCameraActive(true);
      // Wait for ref to be available
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      toast.error('Unable to access camera. Please allow camera access or upload a photo instead.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Mirror the image for selfie
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelfieFile(file);
        setSelfiePreview(URL.createObjectURL(blob));
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const handleSelfieUpload = async () => {
    if (!selfieFile || !user) return;
    setSubmitting(true);
    // Store selfie as base64 data URL (no cloud storage needed)
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      await updateKYC({ selfieVerified: true, selfieUrl: dataUrl });
      toast.success('Selfie uploaded and verified!');
      setCurrentStep('complete');
      setSubmitting(false);
    };
    reader.readAsDataURL(selfieFile);
  };

  const isStepComplete = (step: Step) => {
    if (!kycData) return false;
    switch (step) {
      case 'email': return kycData.emailVerified;
      case 'phone': return kycData.phoneVerified;
      case 'aadhaar': return kycData.aadhaarVerified;
      case 'selfie': return kycData.selfieVerified;
      default: return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (currentStep === 'complete' && kycData?.isFullyVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 space-y-6"
      >
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <BadgeCheck className="w-12 h-12 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">You're Verified!</h2>
          <p className="text-muted-foreground mt-2">Your e-KYC verification is complete. You can now access all services.</p>
        </div>
        <Badge className="bg-primary text-primary-foreground text-sm px-4 py-1.5">
          <BadgeCheck className="w-4 h-4 mr-1.5" /> Verified User
        </Badge>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const complete = isStepComplete(step.key);
          const active = currentStep === step.key;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex items-center flex-1">
              <button
                onClick={() => complete || active ? setCurrentStep(step.key) : null}
                className={`flex flex-col items-center gap-1.5 transition-all ${
                  active ? 'scale-110' : ''
                } ${complete || active ? 'cursor-pointer' : 'cursor-default opacity-50'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  complete ? 'bg-primary text-primary-foreground' : active ? 'bg-primary/20 text-primary border-2 border-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {complete ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${complete ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-card rounded-xl border border-border p-6 space-y-5"
        >
          {/* EMAIL STEP */}
          {currentStep === 'email' && (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Email Verification</h3>
                  <p className="text-sm text-muted-foreground">Confirm your email address</p>
                </div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-foreground">Your email: <span className="font-medium">{user?.email}</span></p>
                <p className="text-xs text-muted-foreground mt-1">Your email has been verified during sign-up.</p>
              </div>
              <Button onClick={handleEmailVerify} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirm & Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {/* PHONE STEP */}
          {currentStep === 'phone' && (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Phone Verification</h3>
                  <p className="text-sm text-muted-foreground">Verify your phone number via OTP</p>
                </div>
              </div>

              {!otpSent ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="kyc-phone">Phone Number</Label>
                    <div className="flex gap-2 mt-1">
                      <span className="flex items-center px-3 bg-muted rounded-lg text-sm text-muted-foreground">+91</span>
                      <Input
                        id="kyc-phone"
                        placeholder="9876543210"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSendOtp} className="w-full">
                    Send OTP <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Enter the 4-digit OTP sent to +91 {phoneNumber}</p>
                  <div className="flex justify-center">
                    <InputOTP maxLength={4} value={phoneOtp} onChange={setPhoneOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setOtpSent(false); setPhoneOtp(''); }} className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Change Number
                    </Button>
                    <Button onClick={handleVerifyOtp} disabled={phoneOtp.length !== 4 || submitting} className="flex-1">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Verify
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* AADHAAR STEP */}
          {currentStep === 'aadhaar' && (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Aadhaar Verification <span className="text-xs font-normal text-muted-foreground">(Optional)</span></h3>
                  <p className="text-sm text-muted-foreground">Enter your 12-digit Aadhaar number for extra verification</p>
                </div>
              </div>
              <div>
                <Label htmlFor="kyc-aadhaar">Aadhaar Number</Label>
                <Input
                  id="kyc-aadhaar"
                  placeholder="XXXX XXXX XXXX"
                  value={aadhaarNumber}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                    setAadhaarNumber(val.replace(/(.{4})/g, '$1 ').trim());
                  }}
                  maxLength={14}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Only the last 4 digits are stored for security.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep('selfie')} className="flex-1">
                  Skip for now
                </Button>
                <Button onClick={handleAadhaarVerify} disabled={submitting} className="flex-1">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Verify Aadhaar
                </Button>
              </div>
            </>
          )}

          {/* SELFIE STEP */}
          {currentStep === 'selfie' && (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Selfie Verification</h3>
                  <p className="text-sm text-muted-foreground">Take a live photo or upload one</p>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <canvas ref={canvasRef} className="hidden" />

              {selfiePreview ? (
                <div className="space-y-3">
                  <div className="relative w-48 h-48 mx-auto rounded-xl overflow-hidden border-2 border-primary/30">
                    <img src={selfiePreview} alt="Selfie preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setSelfiePreview(null); setSelfieFile(null); startCamera(); }} className="flex-1">
                      <Camera className="w-4 h-4 mr-1" /> Retake
                    </Button>
                    <Button onClick={handleSelfieUpload} disabled={submitting} className="flex-1">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Upload & Verify
                    </Button>
                  </div>
                </div>
              ) : cameraActive ? (
                <div className="space-y-3">
                  <div className="relative w-full aspect-[4/3] mx-auto rounded-xl overflow-hidden border-2 border-primary/30 bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                    {/* Face guide overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-40 h-52 border-2 border-dashed border-primary-foreground/50 rounded-full" />
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Position your face within the oval guide</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={stopCamera} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={capturePhoto} className="flex-1">
                      <Camera className="w-4 h-4 mr-2" /> Capture Photo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={startCamera}
                    className="w-full py-10 border-2 border-dashed border-primary/40 rounded-xl flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <Video className="w-8 h-8 text-primary" />
                    <span className="text-sm font-medium text-primary">Take a Live Photo</span>
                    <span className="text-xs text-muted-foreground">Uses your device camera</span>
                  </button>
                  <div className="relative flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-6 border-2 border-dashed border-border rounded-xl flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-secondary/30 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload a photo instead</span>
                    <span className="text-xs text-muted-foreground">Max 5MB • JPG, PNG</span>
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default KYCVerificationFlow;
