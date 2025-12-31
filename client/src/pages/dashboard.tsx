import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MetricCard,
  PrescriptionCard,
  DashboardSkeleton,
  ErrorState,
  EmptyState,
} from "@/components/common";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import type { DashboardMetric, Prescription } from "@shared/schema";

const mockMetrics: DashboardMetric[] = [
  {
    id: "pending",
    title: "Pending Prescriptions",
    value: 24,
    change: 12,
    changeType: "increase",
    icon: "clipboard",
    color: "amber",
  },
  {
    id: "in-review",
    title: "In Review",
    value: 8,
    change: -5,
    changeType: "decrease",
    icon: "eye",
    color: "info",
  },
  {
    id: "preparing",
    title: "Preparing",
    value: 15,
    change: 3,
    changeType: "increase",
    icon: "package",
    color: "mint",
  },
  {
    id: "completed",
    title: "Completed Today",
    value: 47,
    change: 8,
    changeType: "increase",
    icon: "check",
    color: "success",
  },
];

const mockPrescriptions: Prescription[] = [
  {
    id: "rx-001",
    patientId: "p-001",
    patientName: "Sarah Johnson",
    prescriberId: "dr-001",
    prescriberName: "Dr. Michael Chen",
    drugName: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    duration: "30 days",
    instructions: "Take with meals",
    status: "pending",
    priority: "high",
    isRefill: false,
    isDelivery: true,
    aiConfidence: 95,
    aiNotes: "Clear prescription, verified dosage",
    pharmacistNotes: null,
    assignedPharmacistId: null,
    createdAt: new Date(Date.now() - 30 * 60000),
    updatedAt: new Date(),
    dispensedAt: null,
  },
  {
    id: "rx-002",
    patientId: "p-002",
    patientName: "James Wilson",
    prescriberId: "dr-002",
    prescriberName: "Dr. Emily Park",
    drugName: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    duration: "90 days",
    instructions: "Take in the morning",
    status: "in_review",
    priority: "medium",
    isRefill: true,
    isDelivery: false,
    aiConfidence: 88,
    aiNotes: "Refill request, previous history available",
    pharmacistNotes: null,
    assignedPharmacistId: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60000),
    updatedAt: new Date(),
    dispensedAt: null,
  },
  {
    id: "rx-003",
    patientId: "p-003",
    patientName: "Maria Garcia",
    prescriberId: "dr-001",
    prescriberName: "Dr. Michael Chen",
    drugName: "Amoxicillin",
    dosage: "250mg",
    frequency: "Three times daily",
    duration: "7 days",
    instructions: "Complete full course",
    status: "preparing",
    priority: "critical",
    isRefill: false,
    isDelivery: true,
    aiConfidence: 92,
    aiNotes: "Antibiotic prescription, urgent",
    pharmacistNotes: null,
    assignedPharmacistId: null,
    createdAt: new Date(Date.now() - 15 * 60000),
    updatedAt: new Date(),
    dispensedAt: null,
  },
  {
    id: "rx-004",
    patientId: "p-004",
    patientName: "Robert Brown",
    prescriberId: "dr-003",
    prescriberName: "Dr. Lisa Wang",
    drugName: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily at bedtime",
    duration: "90 days",
    instructions: "Take at night for best results",
    status: "pending",
    priority: "low",
    isRefill: true,
    isDelivery: false,
    aiConfidence: 78,
    aiNotes: "Handwritten, some characters unclear",
    pharmacistNotes: null,
    assignedPharmacistId: null,
    createdAt: new Date(Date.now() - 4 * 60 * 60000),
    updatedAt: new Date(),
    dispensedAt: null,
  },
];

export default function DashboardPage() {
  const metricsQuery = useQuery<DashboardMetric[]>({
    queryKey: ["/api/dashboard/metrics"],
    staleTime: 30000,
  });

  const prescriptionsQuery = useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions?limit=6&status=pending,in_review,preparing"],
    staleTime: 30000,
  });

  const isLoading = metricsQuery.isLoading || prescriptionsQuery.isLoading;
  const hasError = metricsQuery.error || prescriptionsQuery.error;

  const metrics = metricsQuery.data || mockMetrics;
  const prescriptions = prescriptionsQuery.data || mockPrescriptions;

  if (hasError) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message="We couldn't load your dashboard data. Please try again."
        onRetry={() => {
          metricsQuery.refetch();
          prescriptionsQuery.refetch();
        }}
      />
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your pharmacy overview.
          </p>
        </div>
        <Button data-testid="button-new-prescription">
          <Plus className="w-4 h-4 mr-2" />
          New Prescription
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl">Priority Queue</CardTitle>
            <span className="inline-flex items-center gap-1 text-xs text-accent bg-accent/10 px-2 py-1 rounded-full font-medium">
              <Sparkles className="w-3 h-3" />
              AI Prioritized
            </span>
          </div>
          <Link href="/queue">
            <Button variant="outline" size="sm" data-testid="button-view-all-queue">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {prescriptions.length === 0 ? (
            <EmptyState
              icon="clipboard"
              title="No pending prescriptions"
              description="All prescriptions have been processed. Great work!"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.slice(0, 4).map((prescription) => (
                <PrescriptionCard
                  key={prescription.id}
                  prescription={prescription}
                  onSelect={(p) => console.log("Selected:", p.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Dispensed", patient: "Sarah Johnson", drug: "Metformin 500mg", time: "5 min ago" },
                { action: "Reviewed", patient: "James Wilson", drug: "Lisinopril 10mg", time: "12 min ago" },
                { action: "Received", patient: "Maria Garcia", drug: "Amoxicillin 250mg", time: "25 min ago" },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {activity.action} - {activity.patient}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.drug}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  type: "info",
                  message: "3 prescriptions require attention due to aging",
                  color: "text-info",
                },
                {
                  type: "warning",
                  message: "Low stock alert: Metformin 500mg (15 units)",
                  color: "text-amber",
                },
                {
                  type: "success",
                  message: "Processing time improved by 12% this week",
                  color: "text-success",
                },
              ].map((insight, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 py-2 border-b border-border last:border-0"
                >
                  <Sparkles className={`w-4 h-4 mt-0.5 ${insight.color}`} />
                  <p className="text-sm text-foreground">{insight.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
