import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  ArrowUp, 
  Minus,
  AlertOctagon
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { PriorityLevelType } from "@shared/schema";

interface PriorityIndicatorProps {
  priority: PriorityLevelType;
  showLabel?: boolean;
  tooltip?: string;
}

const priorityConfig: Record<
  PriorityLevelType,
  { label: string; className: string; icon: typeof AlertTriangle }
> = {
  low: {
    label: "Low",
    className: "bg-muted text-muted-foreground border-muted",
    icon: Minus,
  },
  medium: {
    label: "Medium",
    className: "bg-info/10 text-info border-info/20 dark:bg-info/20",
    icon: ArrowUp,
  },
  high: {
    label: "High",
    className: "bg-amber/10 text-amber border-amber/20 dark:bg-amber/20",
    icon: AlertTriangle,
  },
  critical: {
    label: "Critical",
    className: "bg-danger/10 text-danger border-danger/20 dark:bg-danger/20",
    icon: AlertOctagon,
  },
};

export function PriorityIndicator({ 
  priority, 
  showLabel = true, 
  tooltip 
}: PriorityIndicatorProps) {
  const config = priorityConfig[priority] || priorityConfig.medium;
  const Icon = config.icon;

  const indicator = (
    <Badge
      variant="outline"
      className={`${config.className} text-xs px-2 py-0.5 gap-1 font-medium`}
      data-testid={`badge-priority-${priority}`}
    >
      <Icon className="w-3 h-3" />
      {showLabel && config.label}
    </Badge>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{indicator}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return indicator;
}
