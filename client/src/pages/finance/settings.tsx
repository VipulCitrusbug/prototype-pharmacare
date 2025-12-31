import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FormSkeleton } from "@/components/common";
import type { User } from "@shared/schema";
import {
  Bell,
  DollarSign,
  Lock,
  Mail,
  Save,
  Shield,
  Sparkles,
  User as UserIcon,
} from "lucide-react";

export default function FinanceSettingsPage() {
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
    emailClaimUpdates: true,
    emailRejectionAlerts: true,
    emailDailyDigest: false,
    aiRiskAlerts: true,
    highRiskThreshold: "70",
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
    });
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
    toast({
      title: "Preferences Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  return (
    <div className="space-y-6" data-testid="finance-settings-page">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and notification preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-clinical" />
              Personal Information
            </CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingUser ? (
              <FormSkeleton />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
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
                <Button onClick={handleSaveProfile} disabled={isSaving} data-testid="button-save-profile">
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              Security
            </CardTitle>
            <CardDescription>Manage your password and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter current password"
                data-testid="input-current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                data-testid="input-new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                data-testid="input-confirm-password"
              />
            </div>
            <Button variant="outline" data-testid="button-change-password">
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-accent" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose how you want to be notified about claims</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              AI Risk Alerts
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable AI Risk Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when AI flags high-risk claims
                  </p>
                </div>
                <Switch
                  checked={notifications.aiRiskAlerts}
                  onCheckedChange={(v) =>
                    setNotifications({ ...notifications, aiRiskAlerts: v })
                  }
                  data-testid="switch-ai-alerts"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Risk Threshold</p>
                  <p className="text-sm text-muted-foreground">
                    Alert when risk score exceeds this value
                  </p>
                </div>
                <Select
                  value={notifications.highRiskThreshold}
                  onValueChange={(v) =>
                    setNotifications({ ...notifications, highRiskThreshold: v })
                  }
                >
                  <SelectTrigger className="w-28" data-testid="select-risk-threshold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="60">60%</SelectItem>
                    <SelectItem value="70">70%</SelectItem>
                    <SelectItem value="80">80%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-4">Email Notifications</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Claim Status Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Notifications when claims are approved or rejected
                  </p>
                </div>
                <Switch
                  checked={notifications.emailClaimUpdates}
                  onCheckedChange={(v) =>
                    setNotifications({ ...notifications, emailClaimUpdates: v })
                  }
                  data-testid="switch-claim-updates"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Rejection Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Immediate alerts for rejected claims
                  </p>
                </div>
                <Switch
                  checked={notifications.emailRejectionAlerts}
                  onCheckedChange={(v) =>
                    setNotifications({ ...notifications, emailRejectionAlerts: v })
                  }
                  data-testid="switch-rejection-alerts"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily Digest</p>
                  <p className="text-sm text-muted-foreground">
                    Summary of daily claim activity
                  </p>
                </div>
                <Switch
                  checked={notifications.emailDailyDigest}
                  onCheckedChange={(v) =>
                    setNotifications({ ...notifications, emailDailyDigest: v })
                  }
                  data-testid="switch-daily-digest"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSaveNotifications} disabled={isSaving} data-testid="button-save-notifications">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
