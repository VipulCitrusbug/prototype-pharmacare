import { useLocation } from "wouter";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { UserAvatar } from "./user-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, LogOut, Settings, User } from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface TopNavBarProps {
  user?: UserType | null;
  onLogout?: () => void;
  showSidebarTrigger?: boolean;
}

export function TopNavBar({ user, onLogout, showSidebarTrigger = true }: TopNavBarProps) {
  const [, setLocation] = useLocation();
  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username
    : "Guest";

  return (
    <header
      className="sticky top-0 z-50 h-16 border-b border-border bg-card flex items-center justify-between gap-4 px-4"
      data-testid="top-nav-bar"
    >
      <div className="flex items-center gap-4">
        {showSidebarTrigger && (
          <SidebarTrigger data-testid="button-sidebar-toggle" />
        )}
        <Logo size="md" />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
        </Button>

        <ThemeToggle />

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2"
                data-testid="button-user-menu"
              >
                <UserAvatar
                  name={displayName}
                  image={user.avatar}
                  role={user.role as any}
                  size="sm"
                />
                <span className="hidden md:inline text-sm font-medium">
                  {displayName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{displayName}</span>
                  <span className="text-xs text-muted-foreground font-normal capitalize">
                    {user.role}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setLocation("/profile")}
                data-testid="menu-item-profile"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLocation("/settings")}
                data-testid="menu-item-settings"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onLogout}
                className="text-danger focus:text-danger"
                data-testid="menu-item-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm" data-testid="button-login">
            Login
          </Button>
        )}
      </div>
    </header>
  );
}
