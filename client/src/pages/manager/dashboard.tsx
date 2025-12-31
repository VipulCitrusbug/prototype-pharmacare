import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MetricCard,
  EmptyState,
  ErrorState,
} from "@/components/common";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  Clock,
  Package,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import type { DashboardMetric } from "@shared/schema";

const mockManagerMetrics: DashboardMetric[] = [
  {
    id: "workload",
    title: "Current Workload",
    value: 156,
    change: 8,
    changeType: "increase",
    icon: "activity",
    color: "clinical",
  },
  {
    id: "refill-rate",
    title: "Refill Completion",
    value: "94%",
    change: 2,
    changeType: "increase",
    icon: "refresh",
    color: "success",
  },
  {
    id: "turnaround",
    title: "Avg Turnaround",
    value: "18 min",
    change: -3,
    changeType: "decrease",
    icon: "clock",
    color: "mint",
  },
  {
    id: "inventory-health",
    title: "Inventory Health",
    value: "87%",
    change: -2,
    changeType: "decrease",
    icon: "package",
    color: "amber",
  },
];

const mockAlerts = [
  {
    id: "alert-1",
    type: "warning",
    title: "Rising Refill Backlog",
    description: "Refill requests increased 23% in the last 2 hours",
    impact: "12 prescriptions affected",
    time: "15 min ago",
  },
  {
    id: "alert-2",
    type: "critical",
    title: "High Expiry Risk",
    description: "3 medications approaching expiry within 30 days",
    impact: "$2,400 inventory at risk",
    time: "1 hour ago",
  },
  {
    id: "alert-3",
    type: "info",
    title: "Peak Hour Approaching",
    description: "Historical data suggests 40% volume increase at 2 PM",
    impact: "Staff allocation recommended",
    time: "2 hours ago",
  },
];

export default function ManagerDashboardPage() {
  const [, setLocation] = useLocation();

  const metricsQuery = useQuery<DashboardMetric[]>({
    queryKey: ["/api/manager/metrics"],
    staleTime: 30000,
  });

  const metrics = metricsQuery.data || mockManagerMetrics;

  if (metricsQuery.error) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message="We couldn't load your operations data. Please try again."
        onRetry={() => metricsQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6" data-testid="manager-dashboard-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Operations Overview</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            AI-powered pharmacy management insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" data-testid="button-refresh">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">AI Proactive Alerts</CardTitle>
              <Badge variant="secondary" className="text-xs">
                <Brain className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/manager/alerts")}
              data-testid="button-view-all-alerts"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover-elevate cursor-pointer"
                  onClick={() => setLocation("/manager/alerts")}
                  data-testid={`alert-card-${alert.id}`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      alert.type === "critical"
                        ? "bg-danger/10 text-danger"
                        : alert.type === "warning"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-info/10 text-info"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">{alert.title}</p>
                      <Badge
                        variant={
                          alert.type === "critical"
                            ? "destructive"
                            : alert.type === "warning"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {alert.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.impact}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {alert.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => setLocation("/manager/inventory")}
                data-testid="button-inventory-intel"
              >
                <Package className="w-6 h-6 text-accent" />
                <span className="text-sm font-medium">Inventory Intelligence</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => setLocation("/manager/insights")}
                data-testid="button-operational-insights"
              >
                <BarChart3 className="w-6 h-6 text-info" />
                <span className="text-sm font-medium">Operational Insights</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => setLocation("/manager/staff")}
                data-testid="button-staff-signals"
              >
                <Users className="w-6 h-6 text-clinical" />
                <span className="text-sm font-medium">Staff Performance</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => setLocation("/manager/reports")}
                data-testid="button-reports-export"
              >
                <TrendingUp className="w-6 h-6 text-success" />
                <span className="text-sm font-medium">Reports & Export</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-clinical" />
              Workflow Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Intake Processing</span>
                <span className="font-medium">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Validation Queue</span>
                <span className="font-medium">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Dispensing</span>
                <span className="font-medium">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Turnaround Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Intake to Review</span>
              <Badge variant="secondary">4 min</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Review to Dispensing</span>
              <Badge variant="secondary">8 min</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Dispensing to Complete</span>
              <Badge variant="secondary">6 min</Badge>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Average</span>
                <Badge variant="outline" className="font-semibold">18 min</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-accent" />
              Inventory Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-danger/5 rounded-lg">
              <div>
                <p className="text-sm font-medium text-danger">Low Stock</p>
                <p className="text-xs text-muted-foreground">5 items critical</p>
              </div>
              <Badge variant="destructive">5</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-500/5 rounded-lg">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Expiry Risk</p>
                <p className="text-xs text-muted-foreground">3 items within 30 days</p>
              </div>
              <Badge className="bg-amber-500 text-white">3</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-info/5 rounded-lg">
              <div>
                <p className="text-sm font-medium text-info">Reorder Suggested</p>
                <p className="text-xs text-muted-foreground">8 items recommended</p>
              </div>
              <Badge variant="secondary">8</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
