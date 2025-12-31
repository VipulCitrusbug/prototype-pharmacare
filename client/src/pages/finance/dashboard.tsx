import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricCard, AIAssistBadge } from "@/components/common";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck,
  FileText,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";

const mockMetrics = [
  {
    id: "pending-claims",
    title: "Claims Pending Review",
    value: 24,
    change: 3,
    changeType: "increase" as const,
    icon: "clipboard",
    color: "amber" as const,
  },
  {
    id: "ready-submit",
    title: "Ready for Submission",
    value: 18,
    change: 5,
    changeType: "increase" as const,
    icon: "check",
    color: "success" as const,
  },
  {
    id: "high-risk",
    title: "High-Risk Claims",
    value: 6,
    change: 2,
    changeType: "decrease" as const,
    icon: "alert",
    color: "danger" as const,
  },
  {
    id: "avg-processing",
    title: "Avg Processing Time",
    value: "2.4 days",
    change: 12,
    changeType: "decrease" as const,
    icon: "clock",
    color: "info" as const,
  },
];

const mockHighRiskClaims = [
  {
    id: "clm-001",
    patientName: "Sarah Johnson",
    payer: "BlueCross BlueShield",
    amount: 1245.00,
    riskScore: 85,
    issues: ["Missing prior authorization", "Drug coefficient mismatch"],
  },
  {
    id: "clm-002",
    patientName: "James Wilson",
    payer: "Aetna",
    amount: 892.50,
    riskScore: 72,
    issues: ["Incomplete documentation"],
  },
  {
    id: "clm-003",
    patientName: "Maria Garcia",
    payer: "United Healthcare",
    amount: 2156.00,
    riskScore: 68,
    issues: ["Payer rule validation failed"],
  },
];

const mockRecentActivity = [
  {
    id: "act-001",
    type: "submitted",
    claimId: "CLM-2024-1847",
    patientName: "Robert Brown",
    amount: 567.00,
    time: "2 hours ago",
  },
  {
    id: "act-002",
    type: "approved",
    claimId: "CLM-2024-1842",
    patientName: "Emily Davis",
    amount: 1234.50,
    time: "4 hours ago",
  },
  {
    id: "act-003",
    type: "rejected",
    claimId: "CLM-2024-1838",
    patientName: "Michael Lee",
    amount: 789.00,
    time: "Yesterday",
  },
];

export default function FinanceDashboardPage() {
  return (
    <div className="space-y-6" data-testid="finance-dashboard-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finance Dashboard</h1>
          <p className="text-muted-foreground">
            Claims overview and AI-powered risk analysis
          </p>
        </div>
        <Button asChild data-testid="button-view-claims">
          <Link href="/finance/claims">
            View All Claims
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-danger" />
                  AI-Flagged High-Risk Claims
                </CardTitle>
                <CardDescription>
                  Claims requiring immediate attention before submission
                </CardDescription>
              </div>
              <AIAssistBadge confidence={92} showLabel />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockHighRiskClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-start justify-between p-4 rounded-lg border border-border hover-elevate"
                  data-testid={`claim-risk-${claim.id}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{claim.patientName}</span>
                      <Badge variant="outline" className="text-xs">
                        {claim.payer}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {claim.issues.map((issue, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs bg-danger/10 text-danger"
                        >
                          {issue}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Amount: ${claim.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="destructive"
                      className="text-xs"
                    >
                      Risk: {claim.riskScore}%
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      data-testid={`button-review-${claim.id}`}
                    >
                      <Link href={`/finance/claims/${claim.id}`}>Review</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4"
              asChild
              data-testid="button-view-all-risks"
            >
              <Link href="/finance/claims?risk=high">
                View All High-Risk Claims
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-clinical" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest claim submissions and outcomes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentActivity.map((activity) => {
                const statusConfig = {
                  submitted: {
                    icon: FileCheck,
                    color: "text-info",
                    bg: "bg-info/10",
                    label: "Submitted",
                  },
                  approved: {
                    icon: CheckCircle2,
                    color: "text-success",
                    bg: "bg-success/10",
                    label: "Approved",
                  },
                  rejected: {
                    icon: XCircle,
                    color: "text-danger",
                    bg: "bg-danger/10",
                    label: "Rejected",
                  },
                };
                const config = statusConfig[activity.type as keyof typeof statusConfig];
                const Icon = config.icon;

                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                    data-testid={`activity-${activity.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${config.bg}`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{activity.claimId}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.patientName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ${activity.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              Claim Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">94.2%</div>
            <p className="text-sm text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-clinical" />
              Monthly Reimbursements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">$847,523</div>
            <p className="text-sm text-muted-foreground">
              +12.4% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-accent" />
              Rejection Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">5.8%</div>
            <p className="text-sm text-muted-foreground">
              -1.3% from last month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
