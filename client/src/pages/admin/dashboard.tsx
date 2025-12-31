import { useState } from "react";
import { Link } from "wouter";
import {
  Settings,
  Sparkles,
  RefreshCw,
  ArrowRight,
  DollarSign,
  ListChecks,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Activity,
  Clock,
  Shield,
  Plug,
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
import { MetricCard, AIAssistBadge } from "@/components/common";
import type { DashboardMetric } from "@shared/schema";

const mockMetrics: DashboardMetric[] = [
  {
    id: "1",
    title: "Active Pricing Rules",
    value: 24,
    change: 2,
    changeType: "increase",
    icon: "DollarSign",
    color: "clinical",
  },
  {
    id: "2",
    title: "AI Recommendations",
    value: 7,
    change: 3,
    changeType: "increase",
    icon: "Lightbulb",
    color: "mint",
  },
  {
    id: "3",
    title: "Config Changes (30d)",
    value: 18,
    change: -5,
    changeType: "decrease",
    icon: "Activity",
    color: "info",
  },
  {
    id: "4",
    title: "Integration Health",
    value: "98%",
    change: 2,
    changeType: "increase",
    icon: "Plug",
    color: "success",
  },
];

const mockRecommendations = [
  {
    id: "rec-001",
    title: "Consolidate Senior Discount Rules",
    description: "3 overlapping senior discount rules can be merged into 1 unified rule",
    impact: "high",
    category: "pricing",
    confidence: 92,
    createdAt: "2025-12-31T08:00:00Z",
  },
  {
    id: "rec-002",
    title: "Remove Unused Holiday Discount",
    description: "2023 Holiday Promo rule has not been triggered in 12 months",
    impact: "low",
    category: "cleanup",
    confidence: 98,
    createdAt: "2025-12-30T14:30:00Z",
  },
  {
    id: "rec-003",
    title: "Update Insurance Tier Thresholds",
    description: "Current thresholds may cause checkout friction based on usage patterns",
    impact: "medium",
    category: "pricing",
    confidence: 85,
    createdAt: "2025-12-29T10:15:00Z",
  },
];

const mockRecentChanges = [
  {
    id: "chg-001",
    action: "Pricing Rule Updated",
    target: "Generic Medication Discount",
    user: "Admin Sarah",
    timestamp: "2025-12-31T11:30:00Z",
  },
  {
    id: "chg-002",
    action: "Rule Disabled",
    target: "Seasonal Promo Q4",
    user: "Admin John",
    timestamp: "2025-12-30T16:45:00Z",
  },
  {
    id: "chg-003",
    action: "New Rule Created",
    target: "Loyalty Program Tier 3",
    user: "Admin Sarah",
    timestamp: "2025-12-29T09:20:00Z",
  },
];

export default function AdminDashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getImpactConfig = (impact: string) => {
    switch (impact) {
      case "high":
        return { color: "text-danger", bg: "bg-danger/10", label: "High Impact" };
      case "medium":
        return { color: "text-amber-600 dark:text-amber-500", bg: "bg-amber-500/10", label: "Medium Impact" };
      case "low":
        return { color: "text-info", bg: "bg-info/10", label: "Low Impact" };
      default:
        return { color: "text-muted-foreground", bg: "bg-muted", label: "Unknown" };
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-dashboard-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            System configuration and governance center
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            data-testid="button-refresh"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-accent" />
                  AI Configuration Advisor
                </CardTitle>
                <CardDescription>
                  Optimization recommendations based on usage patterns
                </CardDescription>
              </div>
              <AIAssistBadge confidence={91} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecommendations.map((rec) => {
                const impactConfig = getImpactConfig(rec.impact);
                return (
                  <div
                    key={rec.id}
                    className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border hover-elevate"
                    data-testid={`recommendation-${rec.id}`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{rec.title}</span>
                        <Badge variant="secondary" className={`text-xs ${impactConfig.bg} ${impactConfig.color}`}>
                          {impactConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-accent" />
                          {rec.confidence}% confidence
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(rec.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      data-testid={`button-review-${rec.id}`}
                    >
                      <Link href={`/admin/advisor`}>Review</Link>
                    </Button>
                  </div>
                );
              })}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4"
              asChild
              data-testid="button-view-all-recommendations"
            >
              <Link href="/admin/advisor">
                View All Recommendations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-clinical" />
                  Recent Configuration Changes
                </CardTitle>
                <CardDescription>
                  Latest modifications to system settings
                </CardDescription>
              </div>
              <Badge variant="outline">{mockRecentChanges.length} changes</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentChanges.map((change) => (
                <div
                  key={change.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border"
                  data-testid={`change-${change.id}`}
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{change.action}</p>
                    <p className="text-sm text-muted-foreground">{change.target}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {change.user}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(change.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4"
              asChild
              data-testid="button-view-audit-logs"
            >
              <Link href="/admin/reports">
                View Full Audit Log
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-elevate" data-testid="card-quick-action-pricing">
          <CardContent className="p-4">
            <Link href="/admin/pricing" className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-clinical/10">
                <DollarSign className="w-6 h-6 text-clinical" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Pricing Rules</p>
                <p className="text-sm text-muted-foreground">Manage pricing and discounts</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-quick-action-integrations">
          <CardContent className="p-4">
            <Link href="/admin/integrations" className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-success/10">
                <Plug className="w-6 h-6 text-success" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Integrations</p>
                <p className="text-sm text-muted-foreground">Monitor system connections</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-quick-action-reports">
          <CardContent className="p-4">
            <Link href="/admin/reports" className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-info/10">
                <ListChecks className="w-6 h-6 text-info" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Reports & Logs</p>
                <p className="text-sm text-muted-foreground">Configuration audit trail</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
