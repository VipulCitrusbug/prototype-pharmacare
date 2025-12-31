import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface AIAssistBadgeProps {
  confidence?: number;
  label?: string;
  size?: "sm" | "md";
}

export function AIAssistBadge({ confidence, label = "AI Assisted", size = "md" }: AIAssistBadgeProps) {
  const confidenceColor = confidence
    ? confidence >= 90
      ? "text-success"
      : confidence >= 70
      ? "text-amber"
      : "text-danger"
    : "";

  return (
    <Badge
      variant="outline"
      className={`bg-mint/10 text-mint border-mint/20 dark:bg-mint/20 ${
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
      } gap-1.5 font-medium`}
      data-testid="badge-ai-assist"
    >
      <Sparkles className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      {label}
      {confidence !== undefined && (
        <span className={`${confidenceColor} ml-1`}>
          ({confidence}%)
        </span>
      )}
    </Badge>
  );
}
