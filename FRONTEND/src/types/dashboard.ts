export interface DashboardStats {
  avgProcessingMs: any;
  totalImages: number;
  successRate: number;     // %
  avgConfidence: number;   // %
  totalProcessingTime: string; // "2.4h", "35m", "42s"
  todayAnalyses: number;
  weekGrowth: string;      // "+12.5%"
  distribution: {
    homogeneous: number;
    inhomogeneous: number;
    dark: number;
    sky: number;
  };
}

export interface Analysis {
  id: string;
  file_name: string;
  fog_detected: boolean;
  fog_class: "homogeneous" | "inhomogeneous" | "dark" | "sky";
  confidence: number;   // 0..1
  processing_ms: number;
  ts: string;           // ISO string
}
