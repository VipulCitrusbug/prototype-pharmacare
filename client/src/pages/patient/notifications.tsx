import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common";
import {
  Bell,
  CheckCircle,
  Clock,
  Package,
  Pill,
  RefreshCw,
  Sparkles,
  Truck,
  X,
} from "lucide-react";

interface Notification {
  id: string;
  type: "refill_reminder" | "order_update" | "general";
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "refill_reminder",
    title: "Refill Reminder: Metformin",
    message:
      "Based on your refill history, you may be running low on Metformin 500mg. Would you like to request a refill?",
    time: "2 hours ago",
    read: false,
    actionUrl: "/patient/medications/med-1",
    actionLabel: "Request Refill",
  },
  {
    id: "notif-2",
    type: "order_update",
    title: "Order Processing",
    message: "Your refill request for Metformin 500mg is now being processed. Estimated delivery: Jan 2, 2026.",
    time: "1 day ago",
    read: false,
  },
  {
    id: "notif-3",
    type: "order_update",
    title: "Order Ready for Pickup",
    message: "Your Atorvastatin 20mg is ready for pickup at PharmaCare Plus - Downtown.",
    time: "2 days ago",
    read: true,
    actionUrl: "/patient/orders",
    actionLabel: "View Order",
  },
  {
    id: "notif-4",
    type: "refill_reminder",
    title: "Upcoming Refill: Atorvastatin",
    message: "Your Atorvastatin prescription will be eligible for refill in 8 days.",
    time: "3 days ago",
    read: true,
  },
  {
    id: "notif-5",
    type: "order_update",
    title: "Order Delivered",
    message: "Your Lisinopril 10mg has been delivered successfully.",
    time: "1 week ago",
    read: true,
  },
  {
    id: "notif-6",
    type: "general",
    title: "Welcome to PharmaCare Plus",
    message: "Thank you for joining PharmaCare Plus. We're here to help you manage your medications easily.",
    time: "2 weeks ago",
    read: true,
  },
];

const notificationIcons = {
  refill_reminder: Sparkles,
  order_update: Package,
  general: Bell,
};

const notificationColors = {
  refill_reminder: "text-accent bg-accent/10",
  order_update: "text-info bg-info/10",
  general: "text-muted-foreground bg-muted",
};

export default function PatientNotificationsPage() {
  const [, setLocation] = useLocation();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.read;
    return n.type === activeTab;
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-6" data-testid="patient-notifications-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated on your prescriptions and orders
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead} data-testid="button-mark-all-read">
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-notifications">
          <TabsTrigger value="all" data-testid="button-tab-all">
            All
          </TabsTrigger>
          <TabsTrigger value="unread" data-testid="button-tab-unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="refill_reminder" data-testid="button-tab-refills">
            Refill Reminders
          </TabsTrigger>
          <TabsTrigger value="order_update" data-testid="button-tab-orders">
            Order Updates
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredNotifications.length === 0 ? (
            <EmptyState
              icon="inbox"
              title="No Notifications"
              description="You're all caught up!"
            />
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const Icon = notificationIcons[notification.type];

                return (
                  <Card
                    key={notification.id}
                    className={!notification.read ? "border-accent/30" : ""}
                    data-testid={`notification-${notification.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-2 rounded-full ${notificationColors[notification.type]}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground">
                                  {notification.title}
                                </h3>
                                {!notification.read && (
                                  <Badge variant="secondary" className="text-xs">
                                    New
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {notification.time}
                                </span>
                                {notification.actionUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-xs text-accent hover:text-accent"
                                    onClick={() => {
                                      markAsRead(notification.id);
                                      setLocation(notification.actionUrl!);
                                    }}
                                    data-testid={`button-action-${notification.id}`}
                                  >
                                    {notification.actionLabel}
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => markAsRead(notification.id)}
                                  data-testid={`button-mark-read-${notification.id}`}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => dismissNotification(notification.id)}
                                data-testid={`button-dismiss-${notification.id}`}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
