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
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Info,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const getWorkloadDistribution = (range: string) => {
  switch (range) {
    case "week":
      return [
        { timeBlock: "Mon", volume: 145, avgLoad: 75, staffCount: 3 },
        { timeBlock: "Tue", volume: 162, avgLoad: 85, staffCount: 3 },
        { timeBlock: "Wed", volume: 138, avgLoad: 72, staffCount: 3 },
        { timeBlock: "Thu", volume: 171, avgLoad: 88, staffCount: 4 },
        { timeBlock: "Fri", volume: 189, avgLoad: 92, staffCount: 4 },
      ];
    case "quarter":
      return [
        { timeBlock: "Month 1", volume: 2400, avgLoad: 82, staffCount: 12 },
        { timeBlock: "Month 2", volume: 2600, avgLoad: 88, staffCount: 12 },
        { timeBlock: "Month 3", volume: 2550, avgLoad: 85, staffCount: 12 },
      ];
    case "month":
    default:
      return [
        { timeBlock: "6 AM - 9 AM", volume: 45, avgLoad: 65, staffCount: 2 },
        { timeBlock: "9 AM - 12 PM", volume: 89, avgLoad: 95, staffCount: 3 },
        { timeBlock: "12 PM - 3 PM", volume: 102, avgLoad: 88, staffCount: 4 },
        { timeBlock: "3 PM - 6 PM", volume: 95, avgLoad: 92, staffCount: 3 },
        { timeBlock: "6 PM - 9 PM", volume: 58, avgLoad: 72, staffCount: 2 },
      ];
  }
};

const getAggregateMetrics = (range: string) => {
  switch (range) {
    case "week":
      return {
        speedVsAccuracy: {
          currentSpeed: 16.5,
          targetSpeed: 20,
          speedTrend: "improving",
          accuracy: 99.1,
          targetAccuracy: 98,
          accuracyTrend: "improving",
        },
        overridePatterns: {
          weeklyCount: 12,
          previousWeek: 15,
          trend: "decreasing",
          topReason: "Dosage Confirmation",
          topReasonPercent: 35,
        },
        capacityUtilization: {
          current: 92,
          optimal: 85,
          status: "over-capacity",
        },
      };
    case "quarter":
      return {
        speedVsAccuracy: {
          currentSpeed: 19.5,
          targetSpeed: 20,
          speedTrend: "stable",
          accuracy: 98.2,
          targetAccuracy: 98,
          accuracyTrend: "stable",
        },
        overridePatterns: {
          weeklyCount: 245,
          previousWeek: 230,
          trend: "increasing",
          topReason: "Inventory Shortage",
          topReasonPercent: 55,
        },
        capacityUtilization: {
          current: 82,
          optimal: 85,
          status: "optimal",
        },
      };
    case "month":
    default:
      return {
        speedVsAccuracy: {
          currentSpeed: 18.2,
          targetSpeed: 20,
          speedTrend: "improving",
          accuracy: 98.5,
          targetAccuracy: 98,
          accuracyTrend: "stable",
        },
        overridePatterns: {
          weeklyCount: 23,
          previousWeek: 28,
          trend: "decreasing",
          topReason: "Insurance exceptions",
          topReasonPercent: 45,
        },
        capacityUtilization: {
          current: 87,
          optimal: 85,
          status: "slightly-over",
        },
      };
  }
};

const getPerformanceTrends = (range: string) => {
  switch (range) {
    case "week":
      return [
        { week: "Day 1", speed: 22.5, accuracy: 96.8 },
        { week: "Day 2", speed: 21.2, accuracy: 97.5 },
        { week: "Day 3", speed: 18.1, accuracy: 98.9 },
        { week: "Day 4", speed: 16.5, accuracy: 99.1 },
      ];
    case "quarter":
      return [
        { week: "M 1", speed: 20.5, accuracy: 97.5 },
        { week: "M 2", speed: 19.8, accuracy: 98.0 },
        { week: "M 3", speed: 19.5, accuracy: 98.2 },
      ];
    case "month":
    default:
      return [
        { week: "Week 1", speed: 21.5, accuracy: 97.8 },
        { week: "Week 2", speed: 20.2, accuracy: 98.1 },
        { week: "Week 3", speed: 19.1, accuracy: 98.3 },
        { week: "Week 4", speed: 18.2, accuracy: 98.5 },
      ];
  }
};

export default function ManagerStaffPage() {
  const [timeRange, setTimeRange] = useState("month");
  
  const aggregateMetrics = getAggregateMetrics(timeRange);
  const workloadDistribution = getWorkloadDistribution(timeRange);
  const performanceTrends = getPerformanceTrends(timeRange);

  return (
    <div className="space-y-6" data-testid="manager-staff-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Performance Signals</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Aggregated insights for capacity planning and process improvement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32" data-testid="button-select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week" data-testid="option-week">This Week</SelectItem>
              <SelectItem value="month" data-testid="option-month">This Month</SelectItem>
              <SelectItem value="quarter" data-testid="option-quarter">Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-info/5 border-info/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-info mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Non-Punitive Performance Insights</p>
              <p className="text-sm text-muted-foreground">
                These signals are aggregate-level metrics designed for capacity planning and process
                improvement. They are not intended for individual performance evaluation or disciplinary
                purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-accent" />
              Speed vs Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg Processing Time</span>
                <Badge
                  variant={
                    aggregateMetrics.speedVsAccuracy.speedTrend === "improving"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {aggregateMetrics.speedVsAccuracy.speedTrend === "improving" && (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {aggregateMetrics.speedVsAccuracy.speedTrend}
                </Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  {aggregateMetrics.speedVsAccuracy.currentSpeed}
                </span>
                <span className="text-muted-foreground">min</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Target: {aggregateMetrics.speedVsAccuracy.targetSpeed} min
              </p>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Accuracy Rate</span>
                <Badge variant="outline">
                  {aggregateMetrics.speedVsAccuracy.accuracyTrend}
                </Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-success">
                  {aggregateMetrics.speedVsAccuracy.accuracy}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Target: {aggregateMetrics.speedVsAccuracy.targetAccuracy}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Override Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Weekly Override Count</span>
                <Badge
                  variant={
                    aggregateMetrics.overridePatterns.trend === "decreasing"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {aggregateMetrics.overridePatterns.trend === "decreasing" && (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {aggregateMetrics.overridePatterns.trend}
                </Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  {aggregateMetrics.overridePatterns.weeklyCount}
                </span>
                <span className="text-sm text-muted-foreground">
                  vs {aggregateMetrics.overridePatterns.previousWeek} last week
                </span>
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Top Override Reason</p>
              <div className="flex items-center justify-between">
                <span className="font-medium">{aggregateMetrics.overridePatterns.topReason}</span>
                <Badge variant="outline">
                  {aggregateMetrics.overridePatterns.topReasonPercent}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-clinical" />
              Capacity Utilization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32">
                  <circle
                    className="text-muted"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="52"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className={
                      aggregateMetrics.capacityUtilization.current > 90
                        ? "text-danger"
                        : aggregateMetrics.capacityUtilization.current > 85
                        ? "text-amber-500"
                        : "text-success"
                    }
                    strokeWidth="10"
                    strokeDasharray={`${(aggregateMetrics.capacityUtilization.current / 100) * 327} 327`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="52"
                    cx="64"
                    cy="64"
                    transform="rotate(-90 64 64)"
                  />
                </svg>
                <span className="absolute text-2xl font-bold">
                  {aggregateMetrics.capacityUtilization.current}%
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Optimal range: {aggregateMetrics.capacityUtilization.optimal}%
              </p>
              <Badge
                variant={
                  aggregateMetrics.capacityUtilization.status === "slightly-over"
                    ? "secondary"
                    : "outline"
                }
                className="mt-2"
              >
                {aggregateMetrics.capacityUtilization.status.replace("-", " ")}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-clinical" />
            Workload Distribution by Time Block
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workloadDistribution.map((block) => (
              <div
                key={block.timeBlock}
                className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
                data-testid={`workload-${block.timeBlock}`}
              >
                <div className="w-32">
                  <p className="font-medium text-sm">{block.timeBlock}</p>
                  <p className="text-xs text-muted-foreground">{block.staffCount} staff</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">
                      {block.volume} prescriptions
                    </span>
                    <span className="text-sm font-medium">{block.avgLoad}% load</span>
                  </div>
                  <Progress
                    value={block.avgLoad}
                    className={`h-3 ${
                      block.avgLoad > 90 ? "[&>div]:bg-danger" : block.avgLoad > 80 ? "[&>div]:bg-amber-500" : ""
                    }`}
                  />
                </div>
                <Badge
                  variant={
                    block.avgLoad > 90
                      ? "destructive"
                      : block.avgLoad > 80
                      ? "secondary"
                      : "outline"
                  }
                >
                  {block.avgLoad > 90
                    ? "High"
                    : block.avgLoad > 80
                    ? "Moderate"
                    : "Normal"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent" />
            Performance Trends (Aggregate)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {performanceTrends.map((week) => (
              <div
                key={week.week}
                className="p-4 bg-muted/30 rounded-lg text-center"
                data-testid={`trend-${week.week}`}
              >
                <p className="text-sm font-medium mb-3">{week.week}</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-2xl font-bold">{week.speed}</p>
                    <p className="text-xs text-muted-foreground">min avg</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-success">{week.accuracy}%</p>
                    <p className="text-xs text-muted-foreground">accuracy</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="font-medium">AI Insight</p>
                <p className="text-sm text-muted-foreground">
                  Processing speed has improved by 15% over the past 4 weeks while maintaining
                  accuracy above target. This suggests effective process optimization without
                  quality trade-offs.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
