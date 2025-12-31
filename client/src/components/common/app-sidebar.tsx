import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "./logo";
import { UserAvatar } from "./user-avatar";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Users,
  BarChart3,
  Shield,
  Settings,
  FileText,
  DollarSign,
  AlertTriangle,
  Activity,
  PillBottle,
  Truck,
  Plug,
} from "lucide-react";
import type { UserRoleType } from "@shared/schema";

interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const roleNavigation: Record<UserRoleType, NavGroup[]> = {
  pharmacist: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      label: "Prescriptions",
      items: [
        { title: "Prescription Queue", url: "/queue", icon: ClipboardList },
        { title: "Inventory", url: "/inventory", icon: Package },
      ],
    },
    {
      label: "Records",
      items: [
        { title: "Patients", url: "/patients", icon: Users },
        { title: "Reports", url: "/reports", icon: FileText },
      ],
    },
  ],
  manager: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", url: "/manager", icon: LayoutDashboard },
        { title: "AI Alerts", url: "/manager/alerts", icon: AlertTriangle },
      ],
    },
    {
      label: "Intelligence",
      items: [
        { title: "Inventory", url: "/manager/inventory", icon: Package },
        { title: "Insights", url: "/manager/insights", icon: BarChart3 },
      ],
    },
    {
      label: "Management",
      items: [
        { title: "Staff Signals", url: "/manager/staff", icon: Users },
        { title: "Reports", url: "/manager/reports", icon: FileText },
      ],
    },
  ],
  patient: [
    {
      label: "My Health",
      items: [
        { title: "Dashboard", url: "/patient", icon: LayoutDashboard },
        { title: "My Medications", url: "/patient/medications", icon: PillBottle },
        { title: "Order Status", url: "/patient/orders", icon: Truck },
      ],
    },
    {
      label: "Account",
      items: [
        { title: "Notifications", url: "/patient/notifications", icon: AlertTriangle },
        { title: "Settings", url: "/patient/settings", icon: Settings },
      ],
    },
  ],
  finance: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", url: "/finance", icon: LayoutDashboard },
        { title: "Claims Queue", url: "/finance/claims", icon: ClipboardList },
      ],
    },
    {
      label: "Management",
      items: [
        { title: "Documentation", url: "/finance/documents", icon: FileText },
        { title: "Reports", url: "/finance/reports", icon: BarChart3 },
      ],
    },
    {
      label: "Account",
      items: [
        { title: "Settings", url: "/finance/settings", icon: Settings },
      ],
    },
  ],
  compliance: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", url: "/compliance", icon: LayoutDashboard },
        { title: "AI Monitoring Flags", url: "/compliance/flags", icon: AlertTriangle },
      ],
    },
    {
      label: "Analysis",
      items: [
        { title: "Trend Analysis", url: "/compliance/trends", icon: Activity },
        { title: "Audit Trail", url: "/compliance/audit", icon: Shield },
      ],
    },
    {
      label: "Documentation",
      items: [
        { title: "Reports", url: "/compliance/reports", icon: FileText },
      ],
    },
  ],
  admin: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
        { title: "AI Advisor", url: "/admin/advisor", icon: AlertTriangle },
      ],
    },
    {
      label: "Configuration",
      items: [
        { title: "Pricing Rules", url: "/admin/pricing", icon: DollarSign },
        { title: "Integrations", url: "/admin/integrations", icon: Activity },
      ],
    },
    {
      label: "Governance",
      items: [
        { title: "Reports & Logs", url: "/admin/reports", icon: FileText },
      ],
    },
  ],
};

interface AppSidebarProps {
  userRole: UserRoleType;
  userName?: string;
  userAvatar?: string | null;
}

export function AppSidebar({ userRole, userName, userAvatar }: AppSidebarProps) {
  const [location] = useLocation();
  const navigation = roleNavigation[userRole] || roleNavigation.patient;

  return (
    <Sidebar data-testid="app-sidebar">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Logo size="md" />
      </SidebarHeader>

      <SidebarContent className="px-2">
        {navigation.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={userName || "User"}
            image={userAvatar}
            role={userRole}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {userName || "User"}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
