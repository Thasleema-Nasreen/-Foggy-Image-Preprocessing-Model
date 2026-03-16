import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatBadgeProps {
  label: string;
  value: string | boolean | number;
  type?: "boolean" | "class" | "confidence";
}

export function StatBadge({ label, value, type = "class" }: StatBadgeProps) {
  const renderValue = () => {
    if (type === "boolean") {
      const isTrue = value === true;
      return (
        <div className="flex items-center gap-2">
          {isTrue ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <XCircle className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={isTrue ? "text-success font-semibold" : "text-muted-foreground"}>
            {isTrue ? "Yes" : "No"}
          </span>
        </div>
      );
    }

    if (type === "confidence") {
      const numValue = typeof value === "number" ? value : parseFloat(value as string);
      const percentage = (numValue * 100).toFixed(1);
      let colorClass = "bg-muted text-muted-foreground";
      
      if (numValue > 0.85) {
        colorClass = "bg-success/10 text-success border-success/20";
      } else if (numValue > 0.6) {
        colorClass = "bg-warning/10 text-warning border-warning/20";
      }

      return (
        <Badge variant="outline" className={`${colorClass} font-semibold`}>
          {percentage}%
        </Badge>
      );
    }

    // class type
    const displayValue = String(value).charAt(0).toUpperCase() + String(value).slice(1);
    return (
      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 font-semibold">
        {displayValue}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      {renderValue()}
    </div>
  );
}
