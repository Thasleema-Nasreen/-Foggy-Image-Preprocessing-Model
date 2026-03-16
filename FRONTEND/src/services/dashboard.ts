import type { Analysis, DashboardStats } from "@/types/dashboard";

const BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function withBase(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return `${BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch(withBase("/api/stats"));
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchRecent(limit = 20): Promise<Analysis[]> {
  const res = await fetch(withBase(`/api/recent?limit=${limit}`));
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.items as Analysis[];
}
