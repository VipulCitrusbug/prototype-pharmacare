import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  Search, 
  Inbox, 
  FileQuestion,
  Plus
} from "lucide-react";

interface EmptyStateProps {
  icon?: "clipboard" | "search" | "inbox" | "file";
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const iconMap = {
  clipboard: ClipboardList,
  search: Search,
  inbox: Inbox,
  file: FileQuestion,
};

export function EmptyState({
  icon = "inbox",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const Icon = iconMap[icon];

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      data-testid="empty-state"
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} data-testid="button-empty-action">
          <Plus className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
