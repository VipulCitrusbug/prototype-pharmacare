import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { PriorityIndicator } from "./priority-indicator";
import { AIAssistBadge } from "./ai-assist-badge";
import { UserAvatar } from "./user-avatar";
import { Clock, ArrowRight, RefreshCw, Truck, MapPin } from "lucide-react";
import type { Prescription, PrescriptionStatusType, PriorityLevelType } from "@shared/schema";

interface PrescriptionCardProps {
  prescription: Prescription;
  onSelect?: (prescription: Prescription) => void;
  showActions?: boolean;
}

export function PrescriptionCard({
  prescription,
  onSelect,
  showActions = true,
}: PrescriptionCardProps) {
  const formatTime = (date: Date | string | null) => {
    if (!date) return "N/A";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <Card
      className="hover-elevate active-elevate-2 cursor-pointer transition-all"
      onClick={() => onSelect?.(prescription)}
      data-testid={`card-prescription-${prescription.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <UserAvatar name={prescription.patientName} size="md" />
            <div>
              <h4 className="font-semibold text-foreground">
                {prescription.patientName}
              </h4>
              <p className="text-sm text-muted-foreground">
                {prescription.drugName} - {prescription.dosage}
              </p>
            </div>
          </div>
          <StatusBadge
            status={prescription.status as PrescriptionStatusType}
            size="sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          {prescription.isRefill && (
            <span className="inline-flex items-center gap-1 text-xs text-info bg-info/10 px-2 py-0.5 rounded-full">
              <RefreshCw className="w-3 h-3" />
              Refill
            </span>
          )}
          {prescription.isDelivery ? (
            <span className="inline-flex items-center gap-1 text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              <Truck className="w-3 h-3" />
              Delivery
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              <MapPin className="w-3 h-3" />
              Pickup
            </span>
          )}
          {prescription.aiConfidence && (
            <AIAssistBadge confidence={prescription.aiConfidence} size="sm" />
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {prescription.frequency}
          {prescription.duration && ` for ${prescription.duration}`}
          {prescription.instructions && ` - ${prescription.instructions}`}
        </p>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PriorityIndicator
              priority={prescription.priority as PriorityLevelType}
              showLabel={false}
            />
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatTime(prescription.createdAt)}
            </span>
          </div>

          {showActions && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(prescription);
              }}
              data-testid={`button-view-${prescription.id}`}
            >
              View
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
