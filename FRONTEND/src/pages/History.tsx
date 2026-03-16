import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search, Filter, Calendar, Download, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import type { Analysis } from "@/types/dashboard";
import { fetchRecent } from "@/services/dashboard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// ------- helpers -------
const withBase = (path: string) => {
  const base = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};
const urlsFromRun = (id: string) => ({
  original: withBase(`/files/run_${id}/original.png`),
  dehazed: withBase(`/files/run_${id}/dehazed.png`),
  dark: withBase(`/files/run_${id}/dark.png`),
});

const History = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Modal state
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Analysis | null>(null);

  // Load from API
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchRecent(60)
      .then((data) => { if (mounted) { setItems(data); setErr(null); } })
      .catch((e) => { if (mounted) setErr(e.message || "Failed to load history"); })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  // Filter/search
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((it) => {
      const matchesSearch = (it.file_name || "").toLowerCase().includes(q);
      const matchesFilter =
        filterType === "all" ||
        (filterType === "detected" && it.fog_detected) ||
        (filterType === "not-detected" && !it.fog_detected);
      return matchesSearch && matchesFilter;
    });
  }, [items, searchQuery, filterType]);

  const exportCsv = () => {
    const headers = [
      "id","file_name","fog_detected","fog_class","confidence",
      "processing_ms","variant","ts","original_url","dehazed_url","dark_url"
    ];
    const rows = items.map((it) => {
      const u = urlsFromRun(it.id);
      return [
        it.id, it.file_name ?? "", it.fog_detected, it.fog_class, it.confidence,
        it.processing_ms, (it as any).variant ?? "", it.ts, u.original, u.dehazed, u.dark
      ];
    });
    const csv =
      headers.join(",") + "\n" +
      rows.map(r =>
        r.map(v => {
          const s = String(v ?? "");
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        }).join(",")
      ).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "analysis_history.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Open modal
  const openModal = (it: Analysis) => {
    setSelected(it);
    setOpen(true);
  };

  // Downloads inside modal
  const downloadImage = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Analysis History</h1>
          <p className="text-muted-foreground">View and manage past analyses</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportCsv} disabled={loading || items.length === 0}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="detected">Fog Detected</SelectItem>
              <SelectItem value="not-detected">No Fog</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        {loading ? (
          <span>Loading…</span>
        ) : err ? (
          <span className="text-red-500">{err}</span>
        ) : (
          <span>Showing {filtered.length} of {items.length} results</span>
        )}
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const u = urlsFromRun(item.id);
          const modelLabel = (item as any).variant ?? "High ResNet50";
          return (
            <Card
              key={item.id}
              className="glass-card p-4 hover-glow transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              onClick={() => openModal(item)}
              title="View details"
            >
              <div className="space-y-3">
                {/* Image preview */}
                <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                  <img
                    src={u.dehazed}
                    alt={item.file_name || "analysis"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = u.original;
                    }}
                  />
                  <div className="absolute bottom-2 right-2 rounded-md bg-background/80 px-2 py-1 text-[10px] flex items-center gap-1 border">
                    <Maximize2 className="h-3 w-3" /> Preview
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <h3 className="font-semibold truncate">{item.file_name || item.id}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.ts).toLocaleString()}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={
                        item.fog_detected
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {item.fog_detected ? "Fog Detected" : "No Fog"}
                    </Badge>
                    {item.fog_detected && (
                      <Badge variant="outline" className="text-xs">
                        {item.fog_class}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {(item.confidence * 100).toFixed(1)}% confidence
                    </span>
                    <span className="text-muted-foreground capitalize">
                      {modelLabel} model
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {!loading && !err && filtered.length === 0 && (
        <Card className="glass-card p-12 text-center">
          <p className="text-muted-foreground">No results found</p>
        </Card>
      )}

      {/* ---- MODAL: Triptych view ---- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Analysis Preview</DialogTitle>
            <DialogDescription>
              Original vs Dehazed vs Dark Channel
            </DialogDescription>
          </DialogHeader>

          {selected && (() => {
            const u = urlsFromRun(selected.id);
            const modelLabel = (selected as any).variant ?? "—";
            return (
              <div className="space-y-4">
                {/* Meta row */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <div className="truncate">
                    <span className="font-medium text-foreground">{selected.file_name || selected.id}</span>
                    {" • "}
                    <span>{new Date(selected.ts).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-3">
                    <span>Confidence: {(selected.confidence * 100).toFixed(1)}%</span>
                    <span className="capitalize">Model: {modelLabel}</span>
                  </div>
                </div>

                {/* Triptych */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-lg overflow-hidden border bg-muted">
                    <div className="p-2 text-xs text-muted-foreground">Original</div>
                    <img src={u.original} className="w-full h-60 object-contain bg-background" />
                  </div>
                  <div className="rounded-lg overflow-hidden border bg-muted">
                    <div className="p-2 text-xs text-muted-foreground">Dehazed</div>
                    <img
                      src={u.dehazed}
                      className="w-full h-60 object-contain bg-background"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = u.original; }}
                    />
                  </div>
                  <div className="rounded-lg overflow-hidden border bg-muted">
                    <div className="p-2 text-xs text-muted-foreground">Dark Channel</div>
                    <img src={u.dark} className="w-full h-60 object-contain bg-background" />
                  </div>
                </div>

                {/* Actions */}
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <div className="text-xs text-muted-foreground">
                    Run ID: <span className="font-mono">{selected.id}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => downloadImage(u.original, "original.png")}>
                      Download Original
                    </Button>
                    <Button variant="outline" onClick={() => downloadImage(u.dark, "dark_channel.png")}>
                      Download Dark Channel
                    </Button>
                    <Button onClick={() => downloadImage(u.dehazed, "dehazed.png")}>
                      Download Dehazed
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
