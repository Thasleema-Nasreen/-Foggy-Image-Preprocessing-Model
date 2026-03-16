// src/pages/dashboard.tsx
import { Image, CheckCircle2, TrendingUp, Zap, Activity, Award } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { RecentAnalyses } from "@/components/RecentAnalyses";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchStats } from "@/services/dashboard";
import type { DashboardStats } from "@/types/dashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchStats()
      .then((data) => mounted && setStats(data))
      .catch((e) => mounted && setErr(e.message || "Failed to load stats"));
    // Optional: poll every 20s
    const id = setInterval(() => {
      fetchStats().then((d) => mounted && setStats(d)).catch(() => {});
    }, 20000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-8 text-white shadow-glow">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome to Adaptive Fog</h1>
          <p className="text-white/90 mb-6 max-w-2xl">
            AI/ML-powered fog detection and dehazing system. Analyze images, track performance,
            and improve visibility with state-of-the-art deep learning.
          </p>
          <Button
            onClick={() => navigate("/analyze")}
            size="lg"
            className="bg-white text-black hover:bg-white/90 font-semibold"
          >
            <Zap className="h-4 w-4 mr-2 text-black" />
            Analyze New Image
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </div>

      {err && <div className="text-sm text-red-500">{err}</div>}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Images Dehazed"
          value={stats ? stats.totalImages.toLocaleString() : "—"}
          change={stats ? `+${stats.todayAnalyses} today` : "—"}
          changeType="positive"
          icon={Image}
        />
        <StatCard
          title="Success Rate"
          value={stats ? `${stats.successRate}%` : "—"}
          change={stats ? stats.weekGrowth : "—"}
          changeType="positive"
          icon={CheckCircle2}
        />
        <StatCard
          title="Avg. Confidence"
          value={stats ? `${stats.avgConfidence}%` : "—"}
          change="+2.1% this week"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          title="Processing Time"
          value={stats ? (stats.avgProcessingMs ? `${stats.avgProcessingMs} ms avg` : stats.totalProcessingTime) : "—"}
          change="-8% faster"
          changeType="positive"
          icon={Activity}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Analyses */}
        <div className="lg:col-span-2">
          <RecentAnalyses />
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Model Performance (kept static) */}
          <Card className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-accent" />
              <h3 className="font-semibold">Model Performance</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">High (ResNet50)</span>
                  <span className="text-sm font-semibold">96.2%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-accent w-[96.2%]" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Medium (MobileNetV2)</span>
                  <span className="text-sm font-semibold">91.8%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-accent w-[91.8%]" />
                </div>
              </div>
            </div>
          </Card>

          {/* Fog Type Distribution (live) */}
          <Card className="glass-card p-6">
            <h3 className="font-semibold mb-4">Fog Type Distribution</h3>
            <div className="space-y-3">
              {[
                { type: "Homogeneous", key: "homogeneous", color: "bg-blue-500" },
                { type: "Inhomogeneous", key: "inhomogeneous", color: "bg-purple-500" },
                { type: "Dark", key: "dark", color: "bg-indigo-500" },
                { type: "Sky", key: "sky", color: "bg-cyan-500" },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm flex-1">{item.type}</span>
                  <span className="text-sm font-semibold">
                    {stats ? stats.distribution[item.key as keyof DashboardStats["distribution"]] : 0}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/analyze")}
              >
                <Image className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/history")}
              >
                <Activity className="h-4 w-4 mr-2" />
                View History
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
