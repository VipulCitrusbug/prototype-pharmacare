import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserRoleType } from "@shared/schema";

interface UserAvatarProps {
  name: string;
  image?: string | null;
  role?: UserRoleType;
  size?: "sm" | "md" | "lg" | "xl";
  showRing?: boolean;
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-24 h-24 text-2xl",
};

const roleRingColors: Record<UserRoleType, string> = {
  pharmacist: "ring-primary",
  manager: "ring-accent",
  patient: "ring-info",
  finance: "ring-success",
  compliance: "ring-amber",
  admin: "ring-danger",
};

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserAvatar({
  name,
  image,
  role,
  size = "md",
  showRing = false,
}: UserAvatarProps) {
  const initials = getInitials(name);
  const ringColor = role ? roleRingColors[role] : "ring-primary";

  return (
    <Avatar
      className={`${sizeMap[size]} ${showRing ? `ring-2 ${ringColor}` : ""}`}
      data-testid="user-avatar"
    >
      {image && <AvatarImage src={image} alt={name} />}
      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
