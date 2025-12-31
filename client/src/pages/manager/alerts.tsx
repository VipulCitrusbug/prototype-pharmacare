import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Bell,
  Brain,
  Check,
  Clock,
  Eye,
  Package,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  category: "inventory" | "workflow" | "capacity" | "compliance";
  title: string;
  description: string;
  impact: string;
  aiConfidence: number;
  suggestedAction: string;
  time: string;
  acknowledged: boolean;
}

const mockAlerts: Alert[] = [
  {
    id: "alert-1",
    type: "critical",
    category: "inventory",
    title: "High Expiry Risk - Amoxicillin 500mg",
    description: "Current stock of 240 units expires in 28 days. Historical monthly usage is 180 units.",
    impact: "Potential loss of $2,400 if not dispensed",
    aiConfidence: 94,
    suggestedAction: "Consider promotional dispensing or inventory transfer to high-volume location",
    time: "1 hour ago",
    acknowledged: false,
  },
  {
    id: "alert-2",
    type: "warning",
    category: "workflow",
    title: "Rising Refill Backlog",
    description: "Refill requests have increased 23% compared to this time last week. Current queue: 34 pending.",
    impact: "12 prescriptions may exceed SLA if not addressed within 2 hours",
    aiConfidence: 88,
    suggestedAction: "Consider reallocating staff from front counter to fulfillment",
    time: "15 min ago",
    acknowledged: false,
  },
  {
    id: "alert-3",
    type: "info",
    category: "capacity",
    title: "Peak Hour Volume Prediction",
    description: "Based on historical patterns, volume typically increases 40% between 2-4 PM on Mondays.",
    impact: "Proactive staffing adjustment recommended",
    aiConfidence: 91,
    suggestedAction: "Schedule additional pharmacist coverage for afternoon shift",
    time: "2 hours ago",
    acknowledged: true,
  },
  {
    id: "alert-4",
    type: "warning",
    category: "inventory",
    title: "Low Stock Alert - Lisinopril 10mg",
    description: "Current stock at 45 units. Predicted stockout in 3 days based on dispensing velocity.",
    impact: "High-demand medication; 15 patients on regular refill schedule",
    aiConfidence: 92,
    suggestedAction: "Expedite reorder or identify alternative supplier",
    time: "3 hours ago",
    acknowledged: false,
  },
  {
    id: "alert-5",
    type: "info",
    category: "workflow",
    title: "Dispensing Efficiency Improvement",
    description: "AI detected a 12% improvement in afternoon dispensing speed over the past week.",
    impact: "Positive trend supporting current operational practices",
    aiConfidence: 86,
    suggestedAction: "Document and share best practices with morning shift",
    time: "1 day ago",
    acknowledged: true,
  },
];

export default function ManagerAlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filter, setFilter] = useState<"all" | "active" | "acknowledged">("all");

  const handleAcknowledge = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "active") return !alert.acknowledged;
    if (filter === "acknowledged") return alert.acknowledged;
    return true;
  });

  const alertCounts = {
    all: alerts.length,
    active: alerts.filter((a) => !a.acknowledged).length,
    acknowledged: alerts.filter((a) => a.acknowledged).length,
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "inventory":
        return <Package className="w-4 h-4" />;
      case "workflow":
        return <RefreshCw className="w-4 h-4" />;
      case "capacity":
        return <Users className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6" data-testid="manager-alerts-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Proactive Alerts</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Early warning system powered by predictive analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Brain className="w-3 h-3 mr-2" />
            {alertCounts.active} Active Alerts
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as any)}>
        <TabsList data-testid="tabs-alerts">
          <TabsTrigger value="all" data-testid="button-tab-all-alerts">
            All ({alertCounts.all})
          </TabsTrigger>
          <TabsTrigger value="active" data-testid="button-tab-active-alerts">
            Active ({alertCounts.active})
          </TabsTrigger>
          <TabsTrigger value="acknowledged" data-testid="button-tab-acknowledged-alerts">
            Acknowledged ({alertCounts.acknowledged})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Check className="w-12 h-12 mx-auto text-success mb-4" />
                  <h3 className="text-lg font-medium mb-2">All Clear</h3>
                  <p className="text-muted-foreground">
                    No alerts in this category. Great job staying on top of operations!
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={alert.acknowledged ? "opacity-75" : ""}
                  data-testid={`alert-${alert.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-full ${
                          alert.type === "critical"
                            ? "bg-danger/10 text-danger"
                            : alert.type === "warning"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-info/10 text-info"
                        }`}
                      >
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{alert.title}</h3>
                          <Badge
                            variant={
                              alert.type === "critical"
                                ? "destructive"
                                : alert.type === "warning"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {alert.type}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getCategoryIcon(alert.category)}
                            {alert.category}
                          </Badge>
                          {alert.acknowledged && (
                            <Badge variant="outline" className="text-success border-success">
                              <Check className="w-3 h-3 mr-1" />
                              Acknowledged
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-foreground mb-3">{alert.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Impact Assessment</p>
                            <p className="text-sm font-medium">{alert.impact}</p>
                          </div>
                          <div className="p-3 bg-accent/5 rounded-lg border border-accent/20">
                            <p className="text-xs text-accent mb-1 flex items-center gap-1">
                              <Brain className="w-3 h-3" />
                              AI Suggested Action
                            </p>
                            <p className="text-sm">{alert.suggestedAction}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {alert.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {alert.aiConfidence}% confidence
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {!alert.acknowledged && (
                              <Button
                                size="sm"
                                onClick={() => handleAcknowledge(alert.id)}
                                data-testid={`button-acknowledge-${alert.id}`}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Acknowledge
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
