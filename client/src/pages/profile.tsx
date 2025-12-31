import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserAvatar, PageLoader } from "@/components/common";
import { Camera, Mail, Phone, Building, Calendar, Shield } from "lucide-react";
import type { User } from "@shared/schema";

export default function ProfilePage() {
  const userQuery = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    staleTime: Infinity,
  });

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
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full"
                data-testid="button-change-avatar"
              >
                <Camera className="w-4 h-4" />
              </Button>
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
            <Button variant="outline" data-testid="button-edit-profile">
              Edit Profile
            </Button>
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
                  value={user.firstName || ""}
                  readOnly
                  className="bg-muted"
                  data-testid="input-firstname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={user.lastName || ""}
                  readOnly
                  className="bg-muted"
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
                  value={user.email || ""}
                  readOnly
                  className="bg-muted pl-9"
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
                  value="(555) 123-4567"
                  readOnly
                  className="bg-muted pl-9"
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
    </div>
  );
}
