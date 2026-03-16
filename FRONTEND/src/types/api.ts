export type ModelVariant = "high" | "medium";

export type FogClass = "homogeneous" | "inhomogeneous" | "dark" | "sky";

export interface InferResponse {
  fog_detected: boolean;
  fog_class: FogClass;
  confidence: number; // 0..1
  original_url?: string; // optional; frontend can use local preview if missing
  dehazed_url: string; // server URL to dehazed PNG
  dark_channel_url: string; // server URL to dark channel PNG
  download_url?: string; // if different from dehazed_url
}
