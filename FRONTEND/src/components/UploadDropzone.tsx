import { useCallback, useRef, useState } from "react";
import { Upload, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function UploadDropzone({ onFileSelected, disabled }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      setFileName(file.name);
      setFileSize(formatFileSize(file.size));
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // allow re-selecting the same file later
      e.currentTarget.value = "";
    },
    [handleFile]
  );

  const handleClear = useCallback(() => {
    setPreview(null);
    setFileName(null);
    setFileSize(null);
  }, []);

  const openPicker = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!disabled) fileInputRef.current?.click();
  };

  const openCamera = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!disabled) cameraInputRef.current?.click();
  };

  if (preview) {
    return (
      <Card className="p-6 shadow-card">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">Original</h3>
              <p className="text-sm text-muted-foreground">
                {fileName} • {fileSize}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              disabled={disabled}
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
            <img
              src={preview}
              alt="Uploaded preview"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`p-8 shadow-card transition-all ${
        isDragging
          ? "border-accent bg-accent/5"
          : "border-dashed hover:border-accent/50 hover:bg-accent/5"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={openPicker}  // click anywhere opens picker
      role="button"
      aria-disabled={disabled}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-accent/10 p-6">
          <Upload className="h-8 w-8 text-accent" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-lg">Upload an image</h3>
          <p className="text-sm text-muted-foreground">
            Drag and drop or click to browse
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={(e) => openPicker(e)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose File
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={(e) => openCamera(e)}
          >
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </Button>
        </div>

        {/* Hidden gallery picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
          aria-label="Upload image"
        />
        {/* Hidden camera capture (mobile) */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
          aria-label="Capture from camera"
        />
      </div>
    </Card>
  );
}
