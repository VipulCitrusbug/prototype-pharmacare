import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Package, 
  Truck, 
  XCircle,
  Eye
} from "lucide-react";
import type { PrescriptionStatusType } from "@shared/schema";

interface StatusBadgeProps {
  status: PrescriptionStatusType;
  size?: "sm" | "md";
  showIcon?: boolean;
}

const statusConfig: Record<
  PrescriptionStatusType,
  { label: string; className: string; icon: typeof Clock }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber/10 text-amber border-amber/20 dark:bg-amber/20",
    icon: Clock,
  },
  in_review: {
    label: "In Review",
    className: "bg-info/10 text-info border-info/20 dark:bg-info/20",
    icon: Eye,
  },
  preparing: {
    label: "Preparing",
    className: "bg-mint/10 text-mint border-mint/20 dark:bg-mint/20",
    icon: Package,
  },
  dispensed: {
    label: "Dispensed",
    className: "bg-success/10 text-success border-success/20 dark:bg-success/20",
    icon: CheckCircle,
  },
  ready: {
    label: "Ready for Pickup",
    className: "bg-success/10 text-success border-success/20 dark:bg-success/20",
    icon: CheckCircle,
  },
  delivered: {
    label: "Delivered",
    className: "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20",
    icon: Truck,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-danger/10 text-danger border-danger/20 dark:bg-danger/20",
    icon: XCircle,
  },
};

export function StatusBadge({ status, size = "md", showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
      } gap-1.5 font-medium`}
      data-testid={`badge-status-${status}`}
    >
      {showIcon && <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />}
      {config.label}
    </Badge>
  );
}
