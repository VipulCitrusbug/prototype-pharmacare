import { useState } from "react";
import { Link } from "wouter";
import {
  Plug,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ExternalLink,
  Activity,
  Database,
  CreditCard,
  FileText,
  Shield,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: "payment" | "database" | "reporting" | "compliance" | "core";
  status: "healthy" | "degraded" | "error" | "maintenance";
  uptime: number;
  lastSync: string;
  lastError: string | null;
  responseTime: number;
  requestsToday: number;
  errorRate: number;
}

const mockIntegrations: Integration[] = [
  {
    id: "int-001",
    name: "Payment Gateway",
    description: "Primary payment processing service",
    category: "payment",
    status: "healthy",
    uptime: 99.98,
    lastSync: "2025-12-31T13:45:00Z",
    lastError: null,
    responseTime: 145,
    requestsToday: 1234,
    errorRate: 0.02,
  },
  {
    id: "int-002",
    name: "Insurance Claims API",
    description: "Third-party insurance claim submission",
    category: "payment",
    status: "healthy",
    uptime: 99.95,
    lastSync: "2025-12-31T13:42:00Z",
    lastError: null,
    responseTime: 320,
    requestsToday: 567,
    errorRate: 0.05,
  },
  {
    id: "int-003",
    name: "Drug Database",
    description: "FDA drug information database",
    category: "database",
    status: "healthy",
    uptime: 100,
    lastSync: "2025-12-31T13:30:00Z",
    lastError: null,
    responseTime: 85,
    requestsToday: 2890,
    errorRate: 0,
  },
  {
    id: "int-004",
    name: "State PDMP System",
    description: "Prescription Drug Monitoring Program",
    category: "compliance",
    status: "degraded",
    uptime: 98.5,
    lastSync: "2025-12-31T12:15:00Z",
    lastError: "Timeout on batch request at 11:45 AM",
    responseTime: 890,
    requestsToday: 345,
    errorRate: 1.5,
  },
  {
    id: "int-005",
    name: "Reporting Analytics",
    description: "Business intelligence and reporting",
    category: "reporting",
    status: "healthy",
    uptime: 99.99,
    lastSync: "2025-12-31T13:00:00Z",
    lastError: null,
    responseTime: 210,
    requestsToday: 156,
    errorRate: 0.01,
  },
  {
    id: "int-006",
    name: "Inventory Management",
    description: "Real-time inventory tracking system",
    category: "core",
    status: "healthy",
    uptime: 99.97,
    lastSync: "2025-12-31T13:44:00Z",
    lastError: null,
    responseTime: 78,
    requestsToday: 4567,
    errorRate: 0.03,
  },
];

export default function AdminIntegrationsPage() {
  const { toast } = useToast();
  const [integrations] = useState(mockIntegrations);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "healthy":
        return { color: "text-success", bg: "bg-success/10", icon: CheckCircle2, label: "Healthy" };
      case "degraded":
        return { color: "text-amber-600 dark:text-amber-500", bg: "bg-amber-500/10", icon: AlertTriangle, label: "Degraded" };
      case "error":
        return { color: "text-danger", bg: "bg-danger/10", icon: XCircle, label: "Error" };
      case "maintenance":
        return { color: "text-info", bg: "bg-info/10", icon: Clock, label: "Maintenance" };
      default:
        return { color: "text-muted-foreground", bg: "bg-muted", icon: Activity, label: "Unknown" };
    }
  };

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case "payment":
        return { icon: CreditCard, label: "Payment" };
      case "database":
        return { icon: Database, label: "Database" };
      case "reporting":
        return { icon: FileText, label: "Reporting" };
      case "compliance":
        return { icon: Shield, label: "Compliance" };
      case "core":
        return { icon: Server, label: "Core" };
      default:
        return { icon: Plug, label: "Other" };
    }
  };

  const healthyCount = integrations.filter(i => i.status === "healthy").length;
  const degradedCount = integrations.filter(i => i.status === "degraded" || i.status === "error").length;
  const avgUptime = (integrations.reduce((sum, i) => sum + i.uptime, 0) / integrations.length).toFixed(2);

  return (
    <div className="space-y-6" data-testid="admin-integrations-page">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/admin">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Integration Status</h1>
            <p className="text-muted-foreground">
              Monitor connected system health and performance (read-only)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-healthy-count">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Healthy Systems</p>
                <p className="text-2xl font-bold text-success" data-testid="text-healthy-count">{healthyCount}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-issues-count">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Systems with Issues</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-500" data-testid="text-issues-count">{degradedCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-avg-uptime">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Average Uptime</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-avg-uptime">{avgUptime}%</p>
              </div>
              <Activity className="w-8 h-8 text-clinical" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Connected Systems</CardTitle>
              <CardDescription>
                Real-time status of all integrated services
              </CardDescription>
            </div>
            <Badge variant="outline">
              {integrations.length} integrations
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => {
              const statusConfig = getStatusConfig(integration.status);
              const categoryConfig = getCategoryConfig(integration.category);
              const StatusIcon = statusConfig.icon;
              const CategoryIcon = categoryConfig.icon;

              return (
                <div
                  key={integration.id}
                  className="p-4 rounded-lg border border-border"
                  data-testid={`integration-${integration.id}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                        <CategoryIcon className={`w-5 h-5 ${statusConfig.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{integration.name}</span>
                          <Badge variant="secondary" className={`text-xs ${statusConfig.bg} ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {categoryConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{integration.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Uptime</p>
                      <p className="font-medium">{integration.uptime}%</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Response Time</p>
                      <p className="font-medium">{integration.responseTime}ms</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Requests Today</p>
                      <p className="font-medium">{integration.requestsToday.toLocaleString()}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Error Rate</p>
                      <p className={`font-medium ${integration.errorRate > 1 ? "text-danger" : "text-success"}`}>
                        {integration.errorRate}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-muted-foreground">System Health</span>
                      <span className="text-muted-foreground">{integration.uptime}%</span>
                    </div>
                    <Progress 
                      value={integration.uptime} 
                      className={`h-2 ${integration.status === "healthy" ? "[&>div]:bg-success" : "[&>div]:bg-amber-500"}`}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last sync: {new Date(integration.lastSync).toLocaleString()}
                    </span>
                    {integration.lastError && (
                      <span className="flex items-center gap-1 text-danger">
                        <AlertTriangle className="w-3 h-3" />
                        {integration.lastError}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              This page is read-only. To modify integration configurations, please contact your system administrator.
              All integration activity is logged for audit purposes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
