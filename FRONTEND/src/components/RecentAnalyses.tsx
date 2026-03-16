// src/components/RecentAnalyses.tsx
import { Image, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { fetchRecent } from "@/services/dashboard";
import type { Analysis } from "@/types/dashboard";

function timeAgo(iso: string) {
  const now = new Date().getTime();
  const t = new Date(iso).getTime();
  const diff = Math.max(0, Math.round((now - t) / 1000)); // seconds
  if (diff < 60) return `${diff}s ago`;
  const m = Math.round(diff / 60);
  if (m < 60) return `${m} minutes ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hours ago`;
  const d = Math.round(h / 24);
  return `${d} days ago`;
}

export function RecentAnalyses() {
  const [items, setItems] = useState<Analysis[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchRecent(20)
      .then((data) => mounted && setItems(data))
      .catch((e) => mounted && setErr(e.message || "Failed to load"));
    return () => { mounted = false; };
  }, []);

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Recent Analyses</h3>
        <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
          {items ? items.length : 0} total
        </Badge>
      </div>

      {err && <div className="text-sm text-red-500 mb-2">{err}</div>}

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {!items && (
            <div className="text-sm text-muted-foreground">Loading…</div>
          )}
          {items && items.length === 0 && (
            <div className="text-sm text-muted-foreground">No analyses yet.</div>
          )}
          {items?.map((analysis) => (
            <div
              key={analysis.id}
              className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border/50"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-accent/10 p-2">
                  <Image className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm truncate">
                      {analysis.file_name}
                    </p>
                    {analysis.fog_detected ? (
                      <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{timeAgo(analysis.ts)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {analysis.fog_class}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {(analysis.confidence * 100).toFixed(1)}% confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
