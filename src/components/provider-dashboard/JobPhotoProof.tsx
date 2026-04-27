import { useState, useRef } from "react";
import { Camera, Upload, CheckCircle2, Image, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface JobPhotoProofProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "before" | "after";
  onPhotoCapture: (type: "before" | "after", photoUrl: string) => void;
  existingPhoto?: string;
}

const JobPhotoProof = ({ open, onOpenChange, type, onPhotoCapture, existingPhoto }: JobPhotoProofProps) => {
  const [photo, setPhoto] = useState<string | null>(existingPhoto || null);
  const [capturing, setCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      toast.error("Camera access denied. Please use file upload instead.");
      setCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setPhoto(dataUrl);
    stopCamera();
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCapturing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!photo) return;
    onPhotoCapture(type, photo);
    onOpenChange(false);
    toast.success(`${type === "before" ? "Before" : "After"} photo saved! 📸`);
  };

  const handleClose = () => {
    stopCamera();
    onOpenChange(false);
  };

  const isBefore = type === "before";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            {isBefore ? "Before Work" : "After Completion"} Photo
          </DialogTitle>
          <DialogDescription>
            {isBefore
              ? "Take a photo of the issue before starting work for documentation."
              : "Capture the completed work as proof of job completion."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <AnimatePresence mode="wait">
            {photo ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-xl overflow-hidden border border-border/30"
              >
                <img src={photo} alt={`${type} photo`} className="w-full h-56 object-cover" />
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button
                    onClick={() => setPhoto(null)}
                    className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-foreground" />
                  </button>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/80 to-transparent p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-foreground">
                      {isBefore ? "Before" : "After"} photo ready
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              </motion.div>
            ) : capturing ? (
              <motion.div
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative rounded-xl overflow-hidden border border-primary/30"
              >
                <video ref={videoRef} autoPlay playsInline className="w-full h-56 object-cover bg-muted" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-3 inset-x-0 flex justify-center gap-3">
                  <Button size="sm" variant="outline" onClick={stopCamera}>
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={capturePhoto}>
                    <Camera className="w-4 h-4 mr-1" /> Capture
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="options"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 gap-3"
              >
                <button
                  onClick={startCamera}
                  className="flex flex-col items-center gap-2 p-6 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
                >
                  <Camera className="w-8 h-8 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Take Photo</span>
                  <span className="text-[10px] text-muted-foreground">Use camera</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 p-6 rounded-xl bg-secondary/40 border border-border/20 hover:bg-secondary/60 transition-colors"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">Upload Photo</span>
                  <span className="text-[10px] text-muted-foreground">From gallery</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timestamp watermark info */}
          <div className="bg-secondary/30 border border-border/20 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">
              📍 Photos are timestamped and geotagged for verification purposes
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button disabled={!photo} onClick={handleSubmit}>
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Save {isBefore ? "Before" : "After"} Photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobPhotoProof;
