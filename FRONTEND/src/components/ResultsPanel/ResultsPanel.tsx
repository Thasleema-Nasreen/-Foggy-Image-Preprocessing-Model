import { Download, RefreshCw, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatBadge } from "./StatBadge";
import { ImageTriptych } from "./ImageTriptych";
import type { InferResponse } from "@/types/api";
import { useState } from "react";

interface ResultsPanelProps {
  data: InferResponse;
  originalPreview: string;
  onReset: () => void;
}

export function ResultsPanel({ data, originalPreview, onReset }: ResultsPanelProps) {
  const [showJson, setShowJson] = useState(false);

  const handleDownload = () => {
    const downloadUrl = data.download_url || data.dehazed_url;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "dehazed.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <Card className="p-6 shadow-card">
        <h2 className="text-xl font-bold mb-6">Analysis Results</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatBadge
            label="Fog Detected"
            value={data.fog_detected}
            type="boolean"
          />
          <StatBadge
            label="Fog Class"
            value={data.fog_class}
            type="class"
          />
          <StatBadge
            label="Confidence"
            value={data.confidence}
            type="confidence"
          />
        </div>
      </Card>

      {/* Images Card */}
      <Card className="p-6 shadow-card">
        <h2 className="text-xl font-bold mb-6">Image Comparison</h2>
        <ImageTriptych
          originalSrc={data.original_url || originalPreview}
          dehazedSrc={data.dehazed_url}
          darkChannelSrc={data.dark_channel_url}
        />
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleDownload}
          variant="accent"
          className="flex-1"
          size="lg"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Dehazed
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Run New Image
        </Button>
      </div>

      {/* Debug JSON */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowJson(!showJson)}
          className="text-muted-foreground"
        >
          <Code className="h-4 w-4 mr-2" />
          {showJson ? "Hide" : "View"} JSON Response
        </Button>
        {showJson && (
          <Card className="p-4 bg-muted">
            <pre className="text-xs overflow-auto max-h-64">
              {JSON.stringify(data, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
}
