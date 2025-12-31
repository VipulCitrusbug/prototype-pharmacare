import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ClipboardList,
  Eye,
  Package,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import type { DashboardMetric } from "@shared/schema";

interface MetricCardProps {
  metric: DashboardMetric;
  onClick?: () => void;
}

const iconMap: Record<string, typeof ClipboardList> = {
  clipboard: ClipboardList,
  eye: Eye,
  package: Package,
  check: CheckCircle,
  clock: Clock,
  users: Users,
  dollar: DollarSign,
  alert: AlertTriangle,
};

const colorMap: Record<string, string> = {
  clinical: "bg-primary/10 text-primary",
  mint: "bg-accent/10 text-accent",
  amber: "bg-amber/10 text-amber",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
  info: "bg-info/10 text-info",
};

export function MetricCard({ metric, onClick }: MetricCardProps) {
  const Icon = iconMap[metric.icon] || ClipboardList;
  const colorClass = colorMap[metric.color] || colorMap.clinical;

  const TrendIcon = metric.changeType === "increase" 
    ? TrendingUp 
    : metric.changeType === "decrease" 
    ? TrendingDown 
    : Minus;

  const trendColor = metric.changeType === "increase"
    ? "text-success"
    : metric.changeType === "decrease"
    ? "text-danger"
    : "text-muted-foreground";

  return (
    <Card
      className={`${onClick ? "cursor-pointer hover-elevate active-elevate-2" : ""}`}
      onClick={onClick}
      data-testid={`card-metric-${metric.id}`}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-4">
          <div className="text-3xl font-bold text-foreground">
            {metric.value}
          </div>
          {metric.change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span>{Math.abs(metric.change)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
