import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  StatusBadge,
  PriorityIndicator,
  AIAssistBadge,
  UserAvatar,
  PageLoader,
  ErrorState,
  FormSection,
} from "@/components/common";
import {
  ArrowLeft,
  CheckCircle,
  Package,
  XCircle,
  Sparkles,
  Clock,
  User,
  Stethoscope,
  Pill,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import type { Prescription, PrescriptionStatusType, PriorityLevelType } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const mockPrescription: Prescription = {
  id: "rx-001",
  patientId: "p-001",
  patientName: "Sarah Johnson",
  prescriberId: "dr-001",
  prescriberName: "Dr. Michael Chen",
  drugName: "Metformin",
  dosage: "500mg",
  frequency: "Twice daily",
  duration: "30 days",
  instructions: "Take with meals. Avoid alcohol. Monitor blood sugar levels.",
  status: "pending",
  priority: "high",
  isRefill: false,
  isDelivery: true,
  aiConfidence: 95,
  aiNotes: "Clear prescription with verified dosage. Patient has no known allergies to this medication. Previous dispensing history shows good adherence.",
  pharmacistNotes: null,
  assignedPharmacistId: null,
  createdAt: new Date(Date.now() - 30 * 60000),
  updatedAt: new Date(),
  dispensedAt: null,
};

export default function PrescriptionDetailPage() {
  const [, params] = useRoute("/prescription/:id");
  const { toast } = useToast();
  const [notes, setNotes] = useState("");

  const prescriptionQuery = useQuery<Prescription>({
    queryKey: [`/api/prescriptions/${params?.id}`],
    enabled: !!params?.id,
    staleTime: 30000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status }: { status: PrescriptionStatusType }) => {
      const res = await apiRequest("PATCH", `/api/prescriptions/${params?.id}`, {
        status,
        pharmacistNotes: notes || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all queries that start with /api/prescriptions
      queryClient.invalidateQueries({ 
        queryKey: ["/api/prescriptions"],
        refetchType: 'all' // Refetch both active and inactive queries
      });
      // Explicitly invalidate the specific prescription detail query
      queryClient.invalidateQueries({ 
        queryKey: [`/api/prescriptions/${params?.id}`]
      });
      // Also invalidate dashboard metrics since counts may have changed
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Status updated",
        description: "Prescription has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const prescription = prescriptionQuery.data || mockPrescription;

  if (prescriptionQuery.isLoading) {
    return <PageLoader text="Loading prescription details..." />;
  }

  if (prescriptionQuery.error) {
    return (
      <ErrorState
        title="Prescription not found"
        message="We couldn't find this prescription. It may have been deleted or you don't have permission to view it."
        showHomeLink
      />
    );
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  const getNextStatus = (): PrescriptionStatusType | null => {
    switch (prescription.status) {
      case "pending":
        return "in_review";
      case "in_review":
        return "preparing";
      case "preparing":
        return "dispensed";
      case "dispensed":
        return "ready";
      default:
        return null;
    }
  };

  const getActionLabel = () => {
    switch (prescription.status) {
      case "pending":
        return "Start Review";
      case "in_review":
        return "Start Preparing";
      case "preparing":
        return "Mark as Dispensed";
      case "dispensed":
        return "Mark as Ready";
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus();
  const actionLabel = getActionLabel();

  return (
    <div className="space-y-6" data-testid="prescription-detail-page">
      <div className="flex items-center gap-4">
        <Link href="/queue">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            Prescription Details
          </h1>
          <p className="text-muted-foreground">ID: {prescription.id}</p>
        </div>
        <StatusBadge status={prescription.status as PrescriptionStatusType} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <UserAvatar
                  name={prescription.patientName}
                  size="lg"
                  role="patient"
                  showRing
                />
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold">{prescription.patientName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Patient ID: {prescription.patientId}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {prescription.isDelivery && (
                      <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                        Delivery Requested
                      </span>
                    )}
                    {prescription.isRefill && (
                      <span className="text-xs bg-info/10 text-info px-2 py-1 rounded-full">
                        Refill
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                Medication Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Drug Name</p>
                  <p className="font-semibold">{prescription.drugName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dosage</p>
                  <p className="font-semibold">{prescription.dosage}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Frequency</p>
                  <p className="font-semibold">{prescription.frequency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{prescription.duration || "As needed"}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Instructions</p>
                <p className="text-foreground">{prescription.instructions || "No special instructions"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" />
                Prescriber Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <UserAvatar
                  name={prescription.prescriberName || "Unknown"}
                  size="md"
                />
                <div>
                  <p className="font-semibold">{prescription.prescriberName || "Unknown Prescriber"}</p>
                  <p className="text-sm text-muted-foreground">
                    Prescriber ID: {prescription.prescriberId || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Pharmacist Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add notes about this prescription..."
                value={notes || prescription.pharmacistNotes || ""}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
                data-testid="textarea-notes"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {prescription.aiConfidence && (
            <Card className="border-accent/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-accent" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Confidence</span>
                  <AIAssistBadge confidence={prescription.aiConfidence} size="sm" />
                </div>
                {prescription.aiNotes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{prescription.aiNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Status & Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Status</span>
                <StatusBadge status={prescription.status as PrescriptionStatusType} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Priority</span>
                <PriorityIndicator priority={prescription.priority as PriorityLevelType} />
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Created
                  </span>
                  <span>{formatDate(prescription.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Updated
                  </span>
                  <span>{formatDate(prescription.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {nextStatus && actionLabel && (
                <Button
                  className="w-full"
                  onClick={() => updateStatusMutation.mutate({ status: nextStatus })}
                  disabled={updateStatusMutation.isPending}
                  data-testid="button-next-status"
                >
                  {prescription.status === "preparing" ? (
                    <Package className="w-4 h-4 mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  {actionLabel}
                </Button>
              )}
              
              {prescription.status !== "cancelled" && prescription.status !== "delivered" && (
                <Button
                  variant="outline"
                  className="w-full text-danger border-danger/50 hover:bg-danger/10"
                  onClick={() => updateStatusMutation.mutate({ status: "cancelled" })}
                  disabled={updateStatusMutation.isPending}
                  data-testid="button-cancel"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Prescription
                </Button>
              )}
            </CardContent>
          </Card>

          {prescription.priority === "critical" && (
            <Card className="border-danger/50 bg-danger/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-danger">Critical Priority</p>
                    <p className="text-sm text-muted-foreground">
                      This prescription requires immediate attention.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
