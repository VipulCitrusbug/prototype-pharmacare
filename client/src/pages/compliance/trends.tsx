import { useState } from "react";
import { Link } from "wouter";
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
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  PillBottle,
  RefreshCw,
  Sparkles,
  BarChart3,
  Clock,
  AlertTriangle,
} from "lucide-react";

type TimePeriod = "7d" | "30d" | "90d";
type MedicationCategory = "all" | "schedule_ii" | "schedule_iii" | "schedule_iv";

const mockDispensingTrends = [
  {
    id: "dt-001",
    medication: "Oxycodone 30mg",
    category: "Schedule II",
    currentPeriod: 156,
    previousPeriod: 110,
    percentChange: 42,
    trend: "up",
    status: "anomaly",
    avgDaily: 22,
    peakDay: "Monday",
  },
  {
    id: "dt-002",
    medication: "Adderall 20mg",
    category: "Schedule II",
    currentPeriod: 89,
    previousPeriod: 82,
    percentChange: 9,
    trend: "up",
    status: "normal",
    avgDaily: 13,
    peakDay: "Tuesday",
  },
  {
    id: "dt-003",
    medication: "Alprazolam 2mg",
    category: "Schedule IV",
    currentPeriod: 234,
    previousPeriod: 245,
    percentChange: -4,
    trend: "down",
    status: "normal",
    avgDaily: 33,
    peakDay: "Friday",
  },
  {
    id: "dt-004",
    medication: "Zolpidem 10mg",
    category: "Schedule IV",
    currentPeriod: 112,
    previousPeriod: 118,
    percentChange: -5,
    trend: "down",
    status: "normal",
    avgDaily: 16,
    peakDay: "Wednesday",
  },
  {
    id: "dt-005",
    medication: "Methylphenidate 20mg",
    category: "Schedule II",
    currentPeriod: 67,
    previousPeriod: 58,
    percentChange: 16,
    trend: "up",
    status: "watch",
    avgDaily: 10,
    peakDay: "Thursday",
  },
  {
    id: "dt-006",
    medication: "Hydrocodone 10mg",
    category: "Schedule II",
    currentPeriod: 198,
    previousPeriod: 185,
    percentChange: 7,
    trend: "up",
    status: "normal",
    avgDaily: 28,
    peakDay: "Monday",
  },
];

const mockRefillPatterns = [
  {
    id: "rp-001",
    medication: "Oxycodone 30mg",
    expectedInterval: 30,
    avgActualInterval: 26,
    earlyRefills: 8,
    onTimeRefills: 42,
    lateRefills: 5,
    status: "anomaly",
  },
  {
    id: "rp-002",
    medication: "Alprazolam 2mg",
    expectedInterval: 30,
    avgActualInterval: 28,
    earlyRefills: 3,
    onTimeRefills: 67,
    lateRefills: 12,
    status: "normal",
  },
  {
    id: "rp-003",
    medication: "Adderall 20mg",
    expectedInterval: 30,
    avgActualInterval: 29,
    earlyRefills: 2,
    onTimeRefills: 45,
    lateRefills: 8,
    status: "normal",
  },
  {
    id: "rp-004",
    medication: "Zolpidem 10mg",
    expectedInterval: 30,
    avgActualInterval: 22,
    earlyRefills: 12,
    onTimeRefills: 34,
    lateRefills: 4,
    status: "watch",
  },
];

const mockTimeDistribution = [
  { period: "Morning (6am-12pm)", volume: 245, percentage: 28 },
  { period: "Afternoon (12pm-6pm)", volume: 312, percentage: 35 },
  { period: "Evening (6pm-10pm)", volume: 198, percentage: 22 },
  { period: "Night (10pm-6am)", volume: 132, percentage: 15 },
];

export default function ComplianceTrendsPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30d");
  const [categoryFilter, setCategoryFilter] = useState<MedicationCategory>("all");

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "anomaly":
        return { color: "text-danger", bg: "bg-danger/10", label: "Anomaly Detected" };
      case "watch":
        return { color: "text-amber-600 dark:text-amber-500", bg: "bg-amber-500/10", label: "Watch" };
      case "normal":
        return { color: "text-success", bg: "bg-success/10", label: "Normal" };
      default:
        return { color: "text-muted-foreground", bg: "bg-muted", label: "Unknown" };
    }
  };

  // Scale data based on time period
  const getScaleFactor = () => {
    switch (timePeriod) {
      case "7d":
        return 0.25; // 7 days is ~25% of 30 days
      case "30d":
        return 1.0;  // baseline
      case "90d":
        return 3.0;  // 90 days is 3x 30 days
      default:
        return 1.0;
    }
  };

  const scaleFactor = getScaleFactor();

  const filteredTrends = mockDispensingTrends
    .filter((item) => {
      if (categoryFilter === "all") return true;
      if (categoryFilter === "schedule_ii") return item.category === "Schedule II";
      if (categoryFilter === "schedule_iii") return item.category === "Schedule III";
      if (categoryFilter === "schedule_iv") return item.category === "Schedule IV";
      return true;
    })
    .map((item) => ({
      ...item,
      currentPeriod: Math.round(item.currentPeriod * scaleFactor),
      previousPeriod: Math.round(item.previousPeriod * scaleFactor),
      avgDaily: Math.round(item.avgDaily * scaleFactor / (timePeriod === "7d" ? 7 : timePeriod === "30d" ? 30 : 90)),
    }));

  return (
    <div className="space-y-6" data-testid="compliance-trends-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/compliance">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trend Analysis</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Dispensing and refill patterns over time
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
            <SelectTrigger className="w-[130px]" data-testid="select-time-period">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as MedicationCategory)}>
            <SelectTrigger className="w-[150px]" data-testid="select-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="schedule_ii">Schedule II</SelectItem>
              <SelectItem value="schedule_iii">Schedule III</SelectItem>
              <SelectItem value="schedule_iv">Schedule IV</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" data-testid="button-refresh">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dispensing" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dispensing" data-testid="tab-dispensing">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dispensing Volume
          </TabsTrigger>
          <TabsTrigger value="refills" data-testid="tab-refills">
            <Clock className="w-4 h-4 mr-2" />
            Refill Patterns
          </TabsTrigger>
          <TabsTrigger value="time" data-testid="tab-time">
            <Activity className="w-4 h-4 mr-2" />
            Time Distribution
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dispensing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card data-testid="card-total-dispensed">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Dispensed</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-dispensed">856</p>
                  </div>
                  <Activity className="w-8 h-8 text-clinical" />
                </div>
                <p className="text-xs text-success mt-2">+8% vs previous period</p>
              </CardContent>
            </Card>
            <Card data-testid="card-schedule-ii">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Schedule II</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-schedule-ii">510</p>
                  </div>
                  <PillBottle className="w-8 h-8 text-danger" />
                </div>
                <p className="text-xs text-danger mt-2">+15% vs previous period</p>
              </CardContent>
            </Card>
            <Card data-testid="card-schedule-iv">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Schedule IV</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-schedule-iv">346</p>
                  </div>
                  <PillBottle className="w-8 h-8 text-info" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">-2% vs previous period</p>
              </CardContent>
            </Card>
            <Card data-testid="card-anomalies">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Anomalies</p>
                    <p className="text-2xl font-bold text-danger" data-testid="text-anomalies">2</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-danger" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Requires review</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Dispensing Volume by Medication</CardTitle>
              <CardDescription>
                Compare current period against baseline with deviation analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTrends.map((item) => {
                  const statusConfig = getStatusConfig(item.status);
                  const maxVolume = Math.max(...filteredTrends.map((t) => Math.max(t.currentPeriod, t.previousPeriod)));

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border border-border"
                      data-testid={`trend-item-${item.id}`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <PillBottle className="w-5 h-5 text-clinical" />
                          <div>
                            <p className="font-medium">{item.medication}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={`text-xs ${statusConfig.bg} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </Badge>
                          <div className={`flex items-center gap-1 text-sm font-medium ${item.trend === "up" ? "text-danger" : "text-success"
                            }`}>
                            {item.trend === "up" ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {item.percentChange > 0 ? "+" : ""}{item.percentChange}%
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="w-24 text-muted-foreground">Previous:</span>
                          <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-muted-foreground/50 rounded-full"
                              style={{ width: `${(item.previousPeriod / maxVolume) * 100}%` }}
                            />
                          </div>
                          <span className="w-16 text-right">{item.previousPeriod}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="w-24 text-muted-foreground">Current:</span>
                          <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${item.status === "anomaly" ? "bg-danger" : "bg-clinical"}`}
                              style={{ width: `${(item.currentPeriod / maxVolume) * 100}%` }}
                            />
                          </div>
                          <span className="w-16 text-right font-medium">{item.currentPeriod}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>Avg: {item.avgDaily}/day</span>
                        <span>Peak: {item.peakDay}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Refill Interval Analysis</CardTitle>
              <CardDescription>
                Compare actual refill intervals against expected prescription duration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRefillPatterns.map((item) => {
                  const statusConfig = getStatusConfig(item.status);
                  const totalRefills = item.earlyRefills + item.onTimeRefills + item.lateRefills;

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border border-border"
                      data-testid={`refill-pattern-${item.id}`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-clinical" />
                          <div>
                            <p className="font-medium">{item.medication}</p>
                            <p className="text-xs text-muted-foreground">
                              Expected: {item.expectedInterval} days | Actual avg: {item.avgActualInterval} days
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className={`text-xs ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="flex h-6 rounded-full overflow-hidden bg-muted">
                        <div
                          className="bg-danger/80 flex items-center justify-center text-xs text-white"
                          style={{ width: `${(item.earlyRefills / totalRefills) * 100}%` }}
                        >
                          {item.earlyRefills > 3 && item.earlyRefills}
                        </div>
                        <div
                          className="bg-success/80 flex items-center justify-center text-xs text-white"
                          style={{ width: `${(item.onTimeRefills / totalRefills) * 100}%` }}
                        >
                          {item.onTimeRefills}
                        </div>
                        <div
                          className="bg-info/80 flex items-center justify-center text-xs text-white"
                          style={{ width: `${(item.lateRefills / totalRefills) * 100}%` }}
                        >
                          {item.lateRefills > 3 && item.lateRefills}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-danger/80 rounded" />
                          Early: {item.earlyRefills}
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-success/80 rounded" />
                          On-time: {item.onTimeRefills}
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-info/80 rounded" />
                          Late: {item.lateRefills}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dispensing by Time of Day</CardTitle>
              <CardDescription>
                Distribution of controlled substance dispensing across different time periods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTimeDistribution.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-border"
                    data-testid={`time-distribution-${index}`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <p className="font-medium">{item.period}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{item.volume} units</span>
                        <Badge variant="outline">{item.percentage}%</Badge>
                      </div>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-clinical rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-lg bg-accent/5 border border-accent/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">AI Insight</p>
                    <p className="text-xs text-muted-foreground">
                      Afternoon hours show the highest concentration of controlled substance dispensing (35%).
                      Evening activity appears elevated compared to industry benchmarks. Consider reviewing
                      evening shift patterns for optimization opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
