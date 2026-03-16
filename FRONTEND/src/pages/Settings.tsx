import { ArrowLeft, Moon, Sun, Bell, Database, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

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
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6 max-w-3xl">
        {/* Appearance */}
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            {theme === "dark" ? (
              <Moon className="h-5 w-5 text-accent" />
            ) : (
              <Sun className="h-5 w-5 text-accent" />
            )}
            <h2 className="text-xl font-semibold">Appearance</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analysis Complete</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when image analysis is complete
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Error Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts when analysis fails
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        {/* Data & Storage */}
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold">Data & Storage</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Save Analysis History</Label>
                <p className="text-sm text-muted-foreground">
                  Store analysis results locally
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-cleanup</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically delete old results after 30 days
                </p>
              </div>
              <Switch />
            </div>

            <Separator />

            <Button variant="outline" className="w-full text-destructive">
              Clear All History
            </Button>
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold">Privacy & Security</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Anonymous Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Help improve the service with anonymous usage data
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>API Configuration</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Backend URL: {import.meta.env.VITE_API_BASE_URL || "Same origin"}
              </p>
              <Button variant="outline" className="w-full">
                Update API Settings
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
