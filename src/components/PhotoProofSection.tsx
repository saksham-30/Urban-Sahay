import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle2, Image as ImageIcon, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PhotoProof {
  id: string;
  url: string;
  label: string;
  timestamp: string;
}

interface PhotoProofSectionProps {
  photos?: PhotoProof[];
  canUpload?: boolean;
  onUpload?: (file: File, label: string) => void;
}

const mockPhotos: PhotoProof[] = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
    label: "Before — Leaking pipe",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop",
    label: "After — Pipe fixed",
    timestamp: "11:45 AM",
  },
];

const PhotoProofSection = ({
  photos = mockPhotos,
  canUpload = false,
  onUpload,
}: PhotoProofSectionProps) => {
  const [previewPhoto, setPreviewPhoto] = useState<PhotoProof | null>(null);

  return (
    <>
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Camera className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Photo Proof</h4>
              <p className="text-[10px] text-muted-foreground">Before & after documentation</p>
            </div>
          </div>
          {photos.length > 0 && (
            <div className="flex items-center gap-1 text-primary text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {photos.length} photos
            </div>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-6 bg-muted/30 rounded-lg border border-dashed border-border">
            <ImageIcon className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              No photos uploaded yet
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              Provider will upload before/after photos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {photos.map((photo, i) => (
              <motion.button
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setPreviewPhoto(photo)}
                className="group relative rounded-lg overflow-hidden border border-border aspect-[4/3]"
              >
                <img
                  src={photo.url}
                  alt={photo.label}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <ZoomIn className="w-4 h-4 text-white absolute top-2 right-2" />
                  <p className="text-[10px] text-white font-medium">{photo.label}</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 group-hover:hidden">
                  <p className="text-[10px] text-white truncate">{photo.label}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {canUpload && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3 text-xs"
            onClick={() => {
              // Trigger file input for photo upload
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.capture = "environment";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file && onUpload) {
                  onUpload(file, `Photo ${photos.length + 1}`);
                }
              };
              input.click();
            }}
          >
            <Camera className="w-3.5 h-3.5 mr-1" />
            Upload Photo Proof
          </Button>
        )}
      </div>

      {/* Full-size Preview Dialog */}
      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="text-sm">{previewPhoto?.label}</DialogTitle>
          </DialogHeader>
          {previewPhoto && (
            <div className="px-4 pb-4">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.label}
                className="w-full rounded-lg"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Uploaded at {previewPhoto.timestamp}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoProofSection;
