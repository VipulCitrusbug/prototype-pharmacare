import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Brain,
  Calendar,
  Clock,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

const volumeTrends = [
  { period: "Mon", prescriptions: 145, refills: 89 },
  { period: "Tue", prescriptions: 162, refills: 95 },
  { period: "Wed", prescriptions: 138, refills: 82 },
  { period: "Thu", prescriptions: 171, refills: 108 },
  { period: "Fri", prescriptions: 189, refills: 115 },
  { period: "Sat", prescriptions: 98, refills: 52 },
  { period: "Sun", prescriptions: 67, refills: 38 },
];

const bottlenecks = [
  {
    id: "bn-1",
    stage: "Insurance Verification",
    avgDelay: "4.2 min",
    affectedPrescriptions: 23,
    trend: "increasing",
    severity: "high",
  },
  {
    id: "bn-2",
    stage: "Clinical Review",
    avgDelay: "2.8 min",
    affectedPrescriptions: 15,
    trend: "stable",
    severity: "medium",
  },
  {
    id: "bn-3",
    stage: "Patient Consultation",
    avgDelay: "1.5 min",
    affectedPrescriptions: 8,
    trend: "decreasing",
    severity: "low",
  },
];

const turnaroundBreakdown = [
  { stage: "Intake & Triage", avgTime: 3.2, target: 3, status: "on-target" },
  { stage: "Insurance Check", avgTime: 4.8, target: 3, status: "delayed" },
  { stage: "Clinical Review", avgTime: 5.1, target: 5, status: "on-target" },
  { stage: "Dispensing Prep", avgTime: 4.5, target: 5, status: "ahead" },
  { stage: "Final Verification", avgTime: 2.4, target: 3, status: "ahead" },
];

export default function ManagerInsightsPage() {
  const [timeRange, setTimeRange] = useState("week");

  const totalPrescriptions = volumeTrends.reduce((sum, d) => sum + d.prescriptions, 0);
  const totalRefills = volumeTrends.reduce((sum, d) => sum + d.refills, 0);
  const refillRate = Math.round((totalRefills / totalPrescriptions) * 100);

  return (
    <div className="space-y-6" data-testid="manager-insights-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Operational Insights</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            AI-driven performance analytics and trend detection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">{totalPrescriptions}</p>
              </div>
              <div className="p-2 rounded-lg bg-clinical/10">
                <Activity className="w-5 h-5 text-clinical" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-success">
              <ArrowUp className="w-3 h-3" />
              <span>12% vs last week</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Refill Rate</p>
                <p className="text-2xl font-bold">{refillRate}%</p>
              </div>
              <div className="p-2 rounded-lg bg-success/10">
                <RefreshCw className="w-5 h-5 text-success" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-success">
              <ArrowUp className="w-3 h-3" />
              <span>3% improvement</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Turnaround</p>
                <p className="text-2xl font-bold">18 min</p>
              </div>
              <div className="p-2 rounded-lg bg-accent/10">
                <Clock className="w-5 h-5 text-accent" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-success">
              <ArrowDown className="w-3 h-3" />
              <span>2 min faster</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SLA Compliance</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
              <div className="p-2 rounded-lg bg-info/10">
                <Zap className="w-5 h-5 text-info" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <span>Target: 95%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-clinical" />
              Volume Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {volumeTrends.map((day, index) => (
                <div key={day.period} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium w-12">{day.period}</span>
                    <div className="flex-1 mx-4">
                      <div className="flex gap-1 h-6">
                        <div
                          className="bg-clinical rounded"
                          style={{ width: `${(day.prescriptions / 200) * 100}%` }}
                        />
                        <div
                          className="bg-accent rounded"
                          style={{ width: `${(day.refills / 200) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right w-24">
                      <span className="text-clinical">{day.prescriptions}</span>
                      <span className="text-muted-foreground mx-1">/</span>
                      <span className="text-accent">{day.refills}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-clinical" />
                  <span className="text-sm text-muted-foreground">Prescriptions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-accent" />
                  <span className="text-sm text-muted-foreground">Refills</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Turnaround Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {turnaroundBreakdown.map((stage) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{stage.avgTime} min</span>
                      <Badge
                        variant={
                          stage.status === "delayed"
                            ? "destructive"
                            : stage.status === "ahead"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {stage.status === "delayed" && <TrendingUp className="w-3 h-3 mr-1" />}
                        {stage.status === "ahead" && <TrendingDown className="w-3 h-3 mr-1" />}
                        {stage.status}
                      </Badge>
                    </div>
                  </div>
                  <Progress
                    value={(stage.avgTime / 6) * 100}
                    className={`h-2 ${
                      stage.status === "delayed" ? "[&>div]:bg-danger" : ""
                    }`}
                  />
                  <p className="text-xs text-muted-foreground">Target: {stage.target} min</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent" />
            AI-Detected Bottlenecks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bottlenecks.map((bottleneck) => (
              <div
                key={bottleneck.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                data-testid={`bottleneck-${bottleneck.id}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${
                      bottleneck.severity === "high"
                        ? "bg-danger/10 text-danger"
                        : bottleneck.severity === "medium"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-info/10 text-info"
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">{bottleneck.stage}</p>
                    <p className="text-sm text-muted-foreground">
                      Avg delay: {bottleneck.avgDelay}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">{bottleneck.affectedPrescriptions}</p>
                    <p className="text-xs text-muted-foreground">affected</p>
                  </div>
                  <Badge
                    variant={
                      bottleneck.trend === "increasing"
                        ? "destructive"
                        : bottleneck.trend === "decreasing"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {bottleneck.trend === "increasing" && <TrendingUp className="w-3 h-3 mr-1" />}
                    {bottleneck.trend === "decreasing" && <TrendingDown className="w-3 h-3 mr-1" />}
                    {bottleneck.trend}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
