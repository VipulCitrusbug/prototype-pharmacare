import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MetricCard, EmptyState, ErrorState } from "@/components/common";
import {
  Bell,
  Calendar,
  Clock,
  Package,
  Pill,
  Sparkles,
  Truck,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { DashboardMetric } from "@shared/schema";

const mockPatientMetrics: DashboardMetric[] = [
  {
    id: "active-rx",
    title: "Active Medications",
    value: 4,
    change: 0,
    changeType: "neutral",
    icon: "pill",
    color: "clinical",
  },
  {
    id: "pending-refills",
    title: "Pending Refills",
    value: 1,
    change: 1,
    changeType: "increase",
    icon: "refresh",
    color: "amber",
  },
  {
    id: "next-refill",
    title: "Next Refill Due",
    value: "3 days",
    change: 0,
    changeType: "neutral",
    icon: "calendar",
    color: "mint",
  },
  {
    id: "orders-in-progress",
    title: "Orders in Progress",
    value: 1,
    change: 0,
    changeType: "neutral",
    icon: "truck",
    color: "info",
  },
];

const metricRedirects: Record<string, string> = {
  "active-rx": "/patient/medications",
  "pending-refills": "/patient/medications",
  "next-refill": "/patient/medications",
  "orders-in-progress": "/patient/orders",
};

const mockMedications = [
  {
    id: "med-1",
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    lastRefill: "Dec 15, 2025",
    nextRefillDate: "Jan 3, 2026",
    daysRemaining: 3,
    refillEligible: true,
    aiPrediction: true,
  },
  {
    id: "med-2",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    lastRefill: "Dec 1, 2025",
    nextRefillDate: "Jan 15, 2026",
    daysRemaining: 15,
    refillEligible: false,
    aiPrediction: false,
  },
  {
    id: "med-3",
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily at bedtime",
    lastRefill: "Nov 20, 2025",
    nextRefillDate: "Jan 8, 2026",
    daysRemaining: 8,
    refillEligible: true,
    aiPrediction: false,
  },
  {
    id: "med-4",
    name: "Omeprazole",
    dosage: "20mg",
    frequency: "Once daily before breakfast",
    lastRefill: "Dec 10, 2025",
    nextRefillDate: "Jan 20, 2026",
    daysRemaining: 20,
    refillEligible: false,
    aiPrediction: false,
  },
];

const mockActiveOrder = {
  id: "order-1",
  medication: "Metformin 500mg",
  status: "processing",
  deliveryType: "delivery",
  estimatedDate: "Jan 2, 2026",
  progress: 60,
};

export default function PatientDashboardPage() {
  const [, setLocation] = useLocation();
  const [showRefillReminder, setShowRefillReminder] = useState(true);

  const metricsQuery = useQuery<DashboardMetric[]>({
    queryKey: ["/api/patient/metrics"],
    staleTime: 30000,
  });

  const metrics = metricsQuery.data || mockPatientMetrics;

  if (metricsQuery.error) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message="We couldn't load your health data. Please try again."
        onRetry={() => metricsQuery.refetch()}
      />
    );
  }

  const refillDueMedications = mockMedications.filter((m) => m.aiPrediction);

  return (
    <div className="space-y-6" data-testid="patient-dashboard-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Health Dashboard</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Your medication overview at a glance
          </p>
        </div>
      </div>

      {refillDueMedications.length > 0 && showRefillReminder && (
        <Card className="border-accent/50 bg-accent/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-accent/10 text-accent">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">Refill Reminder</h3>
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Suggested
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Based on your refill history, you may be running low on{" "}
                  <span className="font-medium text-foreground">
                    {refillDueMedications.map((m) => m.name).join(", ")}
                  </span>
                  . Would you like to request a refill?
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setLocation("/patient/medications")}
                    data-testid="button-refill-now"
                  >
                    Request Refill Now
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-remind-later" onClick={() => setShowRefillReminder(false)}>
                    Remind Me Later
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            metric={metric}
            onClick={() => {
              const path = metricRedirects[metric.id];
              if (path) setLocation(path);
            }}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Pill className="w-5 h-5 text-clinical" />
              My Medications
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/patient/medications")}
              data-testid="button-view-all-medications"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockMedications.slice(0, 3).map((med) => (
                <div
                  key={med.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate cursor-pointer"
                  onClick={() => setLocation(`/patient/medications/${med.id}`)}
                  data-testid={`medication-card-${med.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-clinical/10 text-clinical">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{med.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {med.dosage} - {med.frequency}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {med.refillEligible ? (
                      <Badge variant="secondary" className="text-xs">
                        Refill Available
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {med.daysRemaining} days left
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Truck className="w-5 h-5 text-info" />
              Order Status
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/patient/orders")}
              data-testid="button-view-all-orders"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {mockActiveOrder ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{mockActiveOrder.medication}</p>
                    <p className="text-sm text-muted-foreground">
                      {mockActiveOrder.deliveryType === "delivery" ? "Delivery" : "Pickup"}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {mockActiveOrder.status === "processing" ? "Processing" : "Ready"}
                  </Badge>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Order Progress</span>
                    <span className="font-medium">{mockActiveOrder.progress}%</span>
                  </div>
                  <Progress value={mockActiveOrder.progress} className="h-2" />
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Estimated: {mockActiveOrder.estimatedDate}</span>
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Order Placed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Processing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <span>Ready</span>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon="inbox"
                title="No Active Orders"
                description="Your completed orders will appear here"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            Upcoming Refills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockMedications
              .sort((a, b) => a.daysRemaining - b.daysRemaining)
              .slice(0, 4)
              .map((med) => (
                <div
                  key={med.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                  data-testid={`refill-schedule-${med.id}`}
                >
                  <div className="flex items-center gap-3">
                    {med.daysRemaining <= 7 ? (
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-success" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{med.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Next refill: {med.nextRefillDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-medium ${
                        med.daysRemaining <= 7 ? "text-amber-500" : "text-muted-foreground"
                      }`}
                    >
                      {med.daysRemaining} days
                    </span>
                    {med.refillEligible && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLocation(`/patient/medications/${med.id}`)}
                        data-testid={`button-refill-${med.id}`}
                      >
                        Refill
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
