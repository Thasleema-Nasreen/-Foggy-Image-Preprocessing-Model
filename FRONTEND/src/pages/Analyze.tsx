import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { UploadDropzone } from "@/components/UploadDropzone";
import { OptionsBar } from "@/components/OptionsBar";
import { ResultsPanel } from "@/components/ResultsPanel/ResultsPanel";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { inferImage } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { ModelVariant, InferResponse } from "@/types/api";

const Analyze = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [variant, setVariant] = useState<ModelVariant>("high");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState<InferResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 300);

    try {
      const result = await inferImage(file, variant);
      setProgress(100);
      setData(result);

      toast({
        title: "Analysis complete",
        description: `Fog ${result.fog_detected ? "detected" : "not detected"}`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);

      toast({
        title: "Analysis failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
      setProgress(0);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFilePreview(null);
    setData(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="hover:bg-accent/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Analyze Image</h1>
          <p className="text-muted-foreground">
            Upload an image to detect and remove fog
          </p>
        </div>
      </div>

      {!data ? (
        <div className="space-y-6">
          {/* Upload Section */}
          <UploadDropzone onFileSelected={handleFileSelected} disabled={loading} />

          {/* Options Section */}
          {file && (
            <OptionsBar
              variant={variant}
              onVariantChange={setVariant}
              onAnalyze={handleAnalyze}
              disabled={!file}
              loading={loading}
            />
          )}

          {/* Loading State */}
          {loading && (
            <Card className="glass-card p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Analyzing image...</span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Processing with {variant === "high" ? "ResNet50" : "MobileNetV2"} model
                </p>
              </div>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Analysis Error</AlertTitle>
              <AlertDescription>
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAnalyze}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      ) : (
        <ResultsPanel
          data={data}
          originalPreview={filePreview || ""}
          onReset={handleReset}
        />
      )}
    </div>
  );
};

export default Analyze;
