import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricCard, AIAssistBadge } from "@/components/common";
import {
  AlertTriangle,
  ArrowRight,
  Shield,
  Activity,
  FileSearch,
  Clock,
  TrendingUp,
  PillBottle,
  RefreshCw,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const mockMetrics = [
  {
    id: "new-flags",
    title: "New AI Flags",
    value: 12,
    change: 3,
    changeType: "increase" as const,
    icon: "alert",
    color: "danger" as const,
  },
  {
    id: "under-review",
    title: "Under Review",
    value: 8,
    change: 2,
    changeType: "decrease" as const,
    icon: "clock",
    color: "amber" as const,
  },
  {
    id: "resolved",
    title: "Resolved This Week",
    value: 23,
    change: 15,
    changeType: "increase" as const,
    icon: "check",
    color: "success" as const,
  },
  {
    id: "controlled-volume",
    title: "Controlled Substance Vol.",
    value: "1,847",
    change: 5,
    changeType: "neutral" as const,
    icon: "activity",
    color: "clinical" as const,
  },
];

const mockRecentFlags = [
  {
    id: "flg-001",
    type: "volume_anomaly",
    title: "Unusual Dispensing Volume Detected",
    medication: "Oxycodone 30mg",
    severity: "high",
    timeFrame: "Last 7 days",
    deviation: "+42%",
    status: "new",
  },
  {
    id: "flg-002",
    type: "refill_frequency",
    title: "Abnormal Refill Pattern",
    medication: "Alprazolam 2mg",
    severity: "medium",
    timeFrame: "Last 30 days",
    deviation: "Early refills: 3",
    status: "new",
  },
  {
    id: "flg-003",
    type: "pattern_deviation",
    title: "Shift Pattern Deviation",
    medication: "Multiple Controlled",
    severity: "low",
    timeFrame: "Evening shifts",
    deviation: "+18% volume",
    status: "under_review",
  },
];

const mockControlledActivity = [
  {
    id: "ca-001",
    medication: "Oxycodone 30mg",
    category: "Schedule II",
    weeklyDispensed: 156,
    trend: "up",
    trendValue: 12,
  },
  {
    id: "ca-002",
    medication: "Adderall 20mg",
    category: "Schedule II",
    weeklyDispensed: 89,
    trend: "stable",
    trendValue: 2,
  },
  {
    id: "ca-003",
    medication: "Alprazolam 2mg",
    category: "Schedule IV",
    weeklyDispensed: 234,
    trend: "up",
    trendValue: 8,
  },
  {
    id: "ca-004",
    medication: "Zolpidem 10mg",
    category: "Schedule IV",
    weeklyDispensed: 112,
    trend: "down",
    trendValue: 5,
  },
];

export default function ComplianceDashboardPage() {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "high":
        return { color: "text-danger", bg: "bg-danger/10", label: "High" };
      case "medium":
        return { color: "text-amber-600 dark:text-amber-500", bg: "bg-amber-500/10", label: "Medium" };
      case "low":
        return { color: "text-info", bg: "bg-info/10", label: "Low" };
      default:
        return { color: "text-muted-foreground", bg: "bg-muted", label: "Unknown" };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "new":
        return { color: "text-danger", bg: "bg-danger/10", label: "New" };
      case "under_review":
        return { color: "text-amber-600 dark:text-amber-500", bg: "bg-amber-500/10", label: "Under Review" };
      case "resolved":
        return { color: "text-success", bg: "bg-success/10", label: "Resolved" };
      default:
        return { color: "text-muted-foreground", bg: "bg-muted", label: "Unknown" };
    }
  };

  return (
    <div className="space-y-6" data-testid="compliance-dashboard-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compliance Dashboard</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            AI-powered controlled substance monitoring
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
                  <AlertTriangle className="w-5 h-5 text-danger" />
                  AI Monitoring Flags
                </CardTitle>
                <CardDescription>
                  Recent anomalies requiring compliance review
                </CardDescription>
              </div>
              <AIAssistBadge confidence={94} showLabel />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentFlags.map((flag) => {
                const severityConfig = getSeverityConfig(flag.severity);
                const statusConfig = getStatusConfig(flag.status);
                
                return (
                  <div
                    key={flag.id}
                    className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border hover-elevate"
                    data-testid={`flag-item-${flag.id}`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{flag.title}</span>
                        <Badge variant="secondary" className={`text-xs ${severityConfig.bg} ${severityConfig.color}`}>
                          {severityConfig.label}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${statusConfig.color}`}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <PillBottle className="w-3 h-3" />
                          {flag.medication}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {flag.timeFrame}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        Deviation: {flag.deviation}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      data-testid={`button-review-flag-${flag.id}`}
                    >
                      <Link href={`/compliance/flags/${flag.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4"
              asChild
              data-testid="button-view-all-flags"
            >
              <Link href="/compliance/flags">
                View All Flags
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-clinical" />
              Controlled Substance Activity
            </CardTitle>
            <CardDescription>
              Weekly dispensing summary by medication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockControlledActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border"
                  data-testid={`controlled-activity-${item.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-clinical/10">
                      <PillBottle className="w-4 h-4 text-clinical" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.medication}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">{item.weeklyDispensed}</p>
                      <p className="text-xs text-muted-foreground">this week</p>
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${
                      item.trend === "up" ? "text-danger" : 
                      item.trend === "down" ? "text-success" : "text-muted-foreground"
                    }`}>
                      {item.trend === "up" && <TrendingUp className="w-3 h-3" />}
                      {item.trend === "down" && <TrendingUp className="w-3 h-3 rotate-180" />}
                      {item.trend === "stable" && <Activity className="w-3 h-3" />}
                      {item.trend !== "stable" && `${item.trendValue}%`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4"
              asChild
              data-testid="button-view-trends"
            >
              <Link href="/compliance/trends">
                View Detailed Trends
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-elevate" data-testid="card-flag-queue">
          <Link href="/compliance/flags" data-testid="link-flag-queue">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-danger" />
                Flag Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-2xl font-bold text-foreground" data-testid="text-flag-count">20</div>
                  <p className="text-sm text-muted-foreground">
                    Pending review
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover-elevate" data-testid="card-audit-trail">
          <Link href="/compliance/audit" data-testid="link-audit-trail">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-clinical" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-2xl font-bold text-foreground" data-testid="text-audit-count">1,234</div>
                  <p className="text-sm text-muted-foreground">
                    Actions logged today
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover-elevate" data-testid="card-compliance-reports">
          <Link href="/compliance/reports" data-testid="link-compliance-reports">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-success" />
                Compliance Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-2xl font-bold text-foreground" data-testid="text-reports-status">Ready</div>
                  <p className="text-sm text-muted-foreground">
                    Generate audit reports
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
