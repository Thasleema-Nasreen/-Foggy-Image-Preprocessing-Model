import { Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ModelVariant } from "@/types/api";

interface OptionsBarProps {
  variant: ModelVariant;
  onVariantChange: (variant: ModelVariant) => void;
  onAnalyze: () => void;
  disabled: boolean;
  loading?: boolean;
}

export function OptionsBar({
  variant,
  onVariantChange,
  onAnalyze,
  disabled,
  loading,
}: OptionsBarProps) {
  return (
    <Card className="p-6 shadow-card">
      <div className="flex flex-col md:flex-row md:items-end gap-6">
        {/* Model Selection */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Label className="font-semibold">Model Accuracy</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    <strong>High:</strong> ResNet50 - More accurate, slightly slower
                    <br />
                    <strong>Medium:</strong> MobileNetV2 - Faster, good accuracy
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <RadioGroup
            value={variant}
            onValueChange={(value) => onVariantChange(value as ModelVariant)}
            className="flex gap-4"
            disabled={loading}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="high" />
              <Label htmlFor="high" className="cursor-pointer font-normal">
                High (ResNet50)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium" className="cursor-pointer font-normal">
                Medium (MobileNetV2)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Analyze Button */}
        <Button
          onClick={onAnalyze}
          disabled={disabled || loading}
          variant="accent"
          size="lg"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {loading ? "Analyzing..." : "Analyze Image"}
        </Button>
      </div>
    </Card>
  );
}
