import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { UserAvatar, PageLoader } from "@/components/common";
import { Mail, Phone, Building, Calendar, Shield, Bell, Lock, Save, X } from "lucide-react";
import type { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    prescriptionAlerts: true,
    inventoryAlerts: true,
    weeklyReport: false,
  });

  const userQuery = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    staleTime: Infinity,
  });

  useEffect(() => {
    if (userQuery.data) {
      setFormData({
        firstName: userQuery.data.firstName || "",
        lastName: userQuery.data.lastName || "",
        email: userQuery.data.email || "",
        phone: userQuery.data.phone || "",
      });
    }
  }, [userQuery.data]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("PATCH", "/api/auth/me", data);
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/auth/me"], updatedUser);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userQuery.data) {
      setFormData({
        firstName: userQuery.data.firstName || "",
        lastName: userQuery.data.lastName || "",
        email: userQuery.data.email || "",
        phone: userQuery.data.phone || "",
      });
    }
  };

  if (userQuery.isLoading) {
    return <PageLoader text="Loading profile..." />;
  }

  const user = userQuery.data;
  if (!user) {
    return null;
  }

  const displayName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username;
  const joinDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="page-profile">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <UserAvatar
                name={displayName}
                image={user.avatar}
                role={user.role as any}
                size="xl"
              />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold">{displayName}</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                <Badge variant="default" className="capitalize">{user.role}</Badge>
                <span className="text-sm text-muted-foreground">@{user.username}</span>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {joinDate}
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Active
                </span>
              </div>
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel} disabled={updateProfileMutation.isPending}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)} data-testid="button-edit-profile">
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  data-testid="input-firstname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  data-testid="input-lastname"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={user.username}
                readOnly
                className="bg-muted"
                data-testid="input-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={user.role?.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()) || ""}
                readOnly
                className="bg-muted capitalize"
                data-testid="input-role"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  readOnly={!isEditing}
                  className={`pl-9 ${!isEditing ? "bg-muted" : ""}`}
                  data-testid="input-email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  readOnly={!isEditing}
                  className={`pl-9 ${!isEditing ? "bg-muted" : ""}`}
                  data-testid="input-phone"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="department"
                  value="Pharmacy Operations"
                  readOnly
                  className="bg-muted pl-9"
                  data-testid="input-department"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>Manage your account security</CardDescription>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                data-testid="input-confirm-password"
              />
            </div>
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Configure how you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotif">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch
              id="emailNotif"
              checked={notifications.email}
              onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
              data-testid="switch-email-notifications"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pushNotif">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive browser notifications</p>
            </div>
            <Switch
              id="pushNotif"
              checked={notifications.push}
              onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
              data-testid="switch-push-notifications"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="rxAlerts">Prescription Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified about new prescriptions</p>
            </div>
            <Switch
              id="rxAlerts"
              checked={notifications.prescriptionAlerts}
              onCheckedChange={(checked) => setNotifications({ ...notifications, prescriptionAlerts: checked })}
              data-testid="switch-prescription-alerts"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="invAlerts">Inventory Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified about low stock</p>
            </div>
            <Switch
              id="invAlerts"
              checked={notifications.inventoryAlerts}
              onCheckedChange={(checked) => setNotifications({ ...notifications, inventoryAlerts: checked })}
              data-testid="switch-inventory-alerts"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weeklyReport">Weekly Summary Report</Label>
              <p className="text-sm text-muted-foreground">Receive weekly performance summary</p>
            </div>
            <Switch
              id="weeklyReport"
              checked={notifications.weeklyReport}
              onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
              data-testid="switch-weekly-report"
            />
          </div>
        </CardContent>
      </Card>

      {user.role === "pharmacist" && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">156</p>
                <p className="text-sm text-muted-foreground">Prescriptions Processed</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-success">98.2%</p>
                <p className="text-sm text-muted-foreground">Accuracy Rate</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-info">3.5 min</p>
                <p className="text-sm text-muted-foreground">Avg. Processing Time</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-accent">42</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
