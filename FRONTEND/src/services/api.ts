import type { InferResponse, ModelVariant } from "@/types/api";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/**
 * Sends an image to the backend for fog detection and dehazing
 * @param file - Image file to analyze
 * @param variant - Model variant: "high" (ResNet50) or "medium" (MobileNetV2)
 * @returns Promise with fog detection results and dehazed image URLs
 */
export async function inferImage(
  file: File,
  variant: ModelVariant = "high"
): Promise<InferResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("variant", variant);

  const res = await fetch(`${BASE}/api/infer`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Request failed: ${res.status}`);
  }

  return res.json();
}

/**
 * Health check endpoint to verify backend connectivity
 */
export async function checkHealth(): Promise<{ ok: boolean }> {
  const res = await fetch(`${BASE}/health`);
  return res.json();
}
