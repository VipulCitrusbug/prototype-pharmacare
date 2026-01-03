import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  FileText,
  PieChart,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function FinanceReportsPage() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("30_days");

  const { data: reportData, isLoading } = useQuery({
    queryKey: [`/api/finance/reports`, dateRange],
    queryFn: async () => {
      const res = await fetch(`/api/finance/reports?range=${dateRange}`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
  });

  const metrics = reportData?.metrics || {
    totalClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    successRate: 0,
    totalReimbursed: 0,
    avgProcessingDays: 0,
    pendingAmount: 0,
  };

  const rejectionReasons = reportData?.rejectionReasons || [];
  const payerPerformance = reportData?.payerPerformance || [];
  const monthlyTrends = reportData?.monthlyTrends || [];

  const handleExport = () => {
    if (!reportData) return;

    toast({
      title: "Export Started",
      description: "Generating comprehensive report...",
    });

    const rows = [
      ["FINANCE REPORT SUMMARY"],
      ["Generated at", new Date().toLocaleString()],
      ["Time Range", dateRange.replace("_", " ").toUpperCase()],
      [],
      ["OVERVIEW METRICS"],
      ["Metric", "Value"],
      ["Total Claims", metrics.totalClaims],
      ["Approved Claims", metrics.approvedClaims],
      ["Rejected Claims", metrics.rejectedClaims],
      ["Success Rate", `${metrics.successRate}%`],
      ["Total Reimbursed", `$${metrics.totalReimbursed.toLocaleString()}`],
      ["Pending Amount", `$${metrics.pendingAmount}`],
      ["Avg Processing Time", `${metrics.avgProcessingDays} days`],
      [],
      ["TOP REJECTION REASONS"],
      ["Reason", "Count", "Percentage"],
      ...rejectionReasons.map((r: any) => [r.reason, r.count, `${r.percentage}%`]),
      [],
      ["PAYER PERFORMANCE"],
      ["Payer", "Claims Processed", "Success Rate", "Avg Days"],
      ...payerPerformance.map((p: any) => [p.payer, p.claims, `${p.successRate}%`, p.avgDays]),
      [],
      ["MONTHLY TRENDS"],
      ["Period", "Total Claims", "Approved", "Rejected"],
      ...monthlyTrends.map((m: any) => [m.month, m.claims, m.approved, m.rejected]),
    ];

    const csvContent = rows
      .map((row) => row.map((cell: any) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `finance_report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "Report downloaded successfully.",
    });
  };

  return (
    <div className="space-y-6" data-testid="finance-reports-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finance Reports</h1>
          <p className="text-muted-foreground">
            Claim analytics, rejection trends, and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]" data-testid="select-date-range">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7_days">Last 7 days</SelectItem>
              <SelectItem value="30_days">Last 30 days</SelectItem>
              <SelectItem value="90_days">Last 90 days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleExport}
            data-testid="button-export"
            disabled={isLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Total Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? (
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              ) : (
                metrics.totalClaims.toLocaleString()
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-success">
              <TrendingUp className="w-4 h-4" />
              <span>+12.4% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {isLoading ? "-" : `${metrics.successRate}%`}
            </div>
            <div className="flex items-center gap-1 text-sm text-success">
              <TrendingUp className="w-4 h-4" />
              <span>+2.1% improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Reimbursed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? (
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              ) : (
                `$${(metrics.totalReimbursed / 1000).toFixed(0)}K`
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              ${metrics.pendingAmount.toLocaleString()} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Avg Processing Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? "-" : `${metrics.avgProcessingDays} days`}
            </div>
            <div className="flex items-center gap-1 text-sm text-success">
              <TrendingDown className="w-4 h-4" />
              <span>-0.5 days faster</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rejections">
        <TabsList>
          <TabsTrigger value="rejections" data-testid="tab-rejections">
            Rejection Analysis
          </TabsTrigger>
          <TabsTrigger value="payers" data-testid="tab-payers">
            Payer Performance
          </TabsTrigger>
          <TabsTrigger value="trends" data-testid="tab-trends">
            Monthly Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rejections" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-danger" />
                    Top Rejection Reasons
                  </CardTitle>
                  <CardDescription>
                    Common causes for claim rejections
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  rejectionReasons.map((item: any, idx: number) => (
                  <div key={idx} className="space-y-2" data-testid={`rejection-reason-${idx}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.reason}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{item.count} claims</Badge>
                        <span className="text-sm text-muted-foreground">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-danger/70"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                )))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payers" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-clinical" />
                    Payer Performance Comparison
                  </CardTitle>
                  <CardDescription>
                    Success rates and processing times by insurance provider
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  payerPerformance.map((payer: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                    data-testid={`payer-row-${idx}`}
                  >
                    <div>
                      <p className="font-medium">{payer.payer}</p>
                      <p className="text-sm text-muted-foreground">
                        {payer.claims} claims processed
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p
                          className={`font-semibold ${
                            payer.successRate >= 95
                              ? "text-success"
                              : payer.successRate >= 90
                              ? "text-amber-600"
                              : "text-danger"
                          }`}
                        >
                          {payer.successRate}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Avg Days</p>
                        <p className="font-semibold">{payer.avgDays}</p>
                      </div>
                    </div>
                  </div>
                )))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-accent" />
                    Monthly Claim Trends
                  </CardTitle>
                  <CardDescription>
                    Claim volume and outcomes over time
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  monthlyTrends.map((month: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4"
                    data-testid={`month-row-${idx}`}
                  >
                    <div className="w-12 font-medium">{month.month}</div>
                    <div className="flex-1">
                      <div className="flex h-6 rounded-md overflow-hidden">
                        <div
                          className="bg-success"
                          style={{
                            width: `${(month.approved / month.claims) * 100}%`,
                          }}
                        />
                        <div
                          className="bg-danger"
                          style={{
                            width: `${(month.rejected / month.claims) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-24 text-right text-sm">
                      <span className="text-success">{month.approved}</span>
                      <span className="text-muted-foreground"> / </span>
                      <span className="text-danger">{month.rejected}</span>
                    </div>
                  </div>
                )))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-success" />
                  <span className="text-sm text-muted-foreground">Approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-danger" />
                  <span className="text-sm text-muted-foreground">Rejected</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
