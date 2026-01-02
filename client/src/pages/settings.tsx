import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme, FormSkeleton } from "@/components/common";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";
import { Bell, Lock, Palette, Globe, Shield, Save, User as UserIcon, Mail } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    prescriptionAlerts: true,
    inventoryAlerts: true,
    weeklyReport: false,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="page-settings">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your application preferences</p>
        </div>
        <Button onClick={handleSave} data-testid="button-save-settings">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            <CardTitle>Personal Information</CardTitle>
          </div>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingUser ? (
            <FormSkeleton />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    data-testid="input-last-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="pl-9"
                    data-testid="input-email"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>Customize how the application looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <p className="text-sm text-muted-foreground">Select your preferred color scheme</p>
            </div>
            <Select value={theme} onValueChange={(value: "light" | "dark" | "system") => setTheme(value)}>
              <SelectTrigger className="w-[140px]" data-testid="select-theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compactMode">Compact Mode</Label>
              <p className="text-sm text-muted-foreground">Use denser spacing for more content</p>
            </div>
            <Switch id="compactMode" data-testid="switch-compact-mode" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <CardTitle>Regional Settings</CardTitle>
          </div>
          <CardDescription>Configure language and timezone</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="language">Language</Label>
              <p className="text-sm text-muted-foreground">Select your preferred language</p>
            </div>
            <Select defaultValue="en">
              <SelectTrigger className="w-[180px]" data-testid="select-language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (US)</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <p className="text-sm text-muted-foreground">Set your local timezone</p>
            </div>
            <Select defaultValue="est">
              <SelectTrigger className="w-[180px]" data-testid="select-timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="est">Eastern Time (EST)</SelectItem>
                <SelectItem value="cst">Central Time (CST)</SelectItem>
                <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                <SelectItem value="pst">Pacific Time (PST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
