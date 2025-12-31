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
  Home,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Truck,
  User as UserIcon,
} from "lucide-react";

interface Address {
  id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

const mockAddresses: Address[] = [
  {
    id: "addr-1",
    label: "Home",
    address: "123 Main Street, Apt 4B",
    city: "San Francisco",
    state: "CA",
    zip: "94102",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Work",
    address: "456 Office Park Drive",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    isDefault: false,
  },
];

const mockNotificationSettings = {
  emailRefillReminders: true,
  smsRefillReminders: true,
  emailOrderUpdates: true,
  smsOrderUpdates: true,
  aiRefillPredictions: true,
  reminderFrequency: "3_days",
};

export default function PatientSettingsPage() {
  const { toast } = useToast();
  
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [addresses, setAddresses] = useState(mockAddresses);
  const [notifications, setNotifications] = useState(mockNotificationSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: "",
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

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
    toast({
      title: "Default Address Updated",
      description: "Your default delivery address has been changed.",
    });
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    toast({
      title: "Address Removed",
      description: "The address has been deleted from your account.",
    });
  };

  return (
    <div className="space-y-6" data-testid="patient-settings-page">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, addresses, and notification preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-clinical" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your contact details</CardDescription>
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
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      placeholder="Add phone number"
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="pl-9"
                      data-testid="input-phone"
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-info" />
                Delivery Addresses
              </CardTitle>
              <CardDescription>Manage your delivery locations</CardDescription>
            </div>
            <Button variant="outline" size="sm" data-testid="button-add-address">
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex items-start justify-between p-4 rounded-lg border border-border"
                data-testid={`address-card-${addr.id}`}
              >
                <div className="flex items-start gap-3">
                  {addr.label === "Home" ? (
                    <Home className="w-5 h-5 text-clinical mt-0.5" />
                  ) : (
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{addr.label}</p>
                      {addr.isDefault && (
                        <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {addr.address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {addr.city}, {addr.state} {addr.zip}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!addr.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDefaultAddress(addr.id)}
                      data-testid={`button-set-default-${addr.id}`}
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAddress(addr.id)}
                    data-testid={`button-delete-address-${addr.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-danger" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-accent" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              AI Refill Reminders
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable AI Predictions</p>
                  <p className="text-sm text-muted-foreground">
                    Get smart reminders based on your refill patterns
                  </p>
                </div>
                <Switch
                  checked={notifications.aiRefillPredictions}
                  onCheckedChange={(v) =>
                    setNotifications({ ...notifications, aiRefillPredictions: v })
                  }
                  data-testid="switch-ai-predictions"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Reminder Timing</p>
                  <p className="text-sm text-muted-foreground">
                    How early to remind you before refill is due
                  </p>
                </div>
                <Select
                  value={notifications.reminderFrequency}
                  onValueChange={(v) =>
                    setNotifications({ ...notifications, reminderFrequency: v })
                  }
                >
                  <SelectTrigger className="w-36" data-testid="button-select-reminder-timing">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1_day" data-testid="option-1-day">1 day before</SelectItem>
                    <SelectItem value="3_days" data-testid="option-3-days">3 days before</SelectItem>
                    <SelectItem value="1_week" data-testid="option-1-week">1 week before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-4">Refill Reminders</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive refill reminders via email
                  </p>
                </div>
                <Switch
                  checked={notifications.emailRefillReminders}
                  onCheckedChange={(v) =>
                    setNotifications({ ...notifications, emailRefillReminders: v })
                  }
                  data-testid="switch-email-refill"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive refill reminders via text message
                  </p>
                </div>
                <Switch
                  checked={notifications.smsRefillReminders}
                  onCheckedChange={(v) =>
                    setNotifications({ ...notifications, smsRefillReminders: v })
                  }
                  data-testid="switch-sms-refill"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-4">Order Updates</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive order status updates via email
                  </p>
                </div>
                <Switch
                  checked={notifications.emailOrderUpdates}
                  onCheckedChange={(v) =>
                    setNotifications({ ...notifications, emailOrderUpdates: v })
                  }
                  data-testid="switch-email-orders"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive order status updates via text message
                  </p>
                </div>
                <Switch
                  checked={notifications.smsOrderUpdates}
                  onCheckedChange={(v) =>
                    setNotifications({ ...notifications, smsOrderUpdates: v })
                  }
                  data-testid="switch-sms-orders"
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
