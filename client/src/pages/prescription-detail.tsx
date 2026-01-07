import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  Edit2,
  Save,
  X,
  Upload,
  Download,
  Trash2,
  File,
  FileImage,
  FileType,
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
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [originalNotes, setOriginalNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null)[1];
  const [documents, setDocuments] = useState<Array<{
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
    source: 'fax' | 'scan' | 'email' | 'upload';
    uploadedBy: string;
    uploadedAt: Date;
    isSourceDocument: boolean;
  }>>([
    {
      id: 'doc-001',
      fileName: 'prescription_scan_001.pdf',
      fileType: 'pdf',
      fileSize: 245000,
      fileUrl: '#',
      source: 'fax',
      uploadedBy: 'Dr. Michael Chen',
      uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isSourceDocument: true,
    },
  ]);
  const [editForm, setEditForm] = useState({
    drugName: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });

  const prescriptionQuery = useQuery<Prescription>({
    queryKey: [`/api/prescriptions/${params?.id}`],
    enabled: !!params?.id,
    staleTime: 30000,
  });

  const updatePrescriptionMutation = useMutation({
    mutationFn: async (updates: Partial<Prescription>) => {
      const res = await apiRequest("PATCH", `/api/prescriptions/${params?.id}`, {
        ...updates,
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
        title: "Prescription updated",
        description: "Prescription details have been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sync form data when prescription loads
  const prescription = prescriptionQuery.data || mockPrescription;
  
  if (prescriptionQuery.isSuccess && !isEditing && (editForm.drugName === "" || editForm.drugName !== prescription.drugName)) {
     setEditForm({
       drugName: prescription.drugName,
       dosage: prescription.dosage,
       frequency: prescription.frequency,
       duration: prescription.duration || "",
       instructions: prescription.instructions || "",
     });
  }



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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                Medication Details
              </CardTitle>
              {!isEditing ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setEditForm({
                      drugName: prescription.drugName,
                      dosage: prescription.dosage,
                      frequency: prescription.frequency,
                      duration: prescription.duration || "",
                      instructions: prescription.instructions || "",
                    });
                    setIsEditing(true);
                  }}
                  disabled={prescription.status === "dispensed" || prescription.status === "ready"}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditing(false)}
                    disabled={updatePrescriptionMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => updatePrescriptionMutation.mutate(editForm)}
                    disabled={updatePrescriptionMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Drug Name</p>
                  {isEditing ? (
                    <Input 
                      value={editForm.drugName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, drugName: e.target.value }))}
                    />
                  ) : (
                    <p className="font-semibold">{prescription.drugName}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dosage</p>
                  {isEditing ? (
                    <Input 
                      value={editForm.dosage}
                      onChange={(e) => setEditForm(prev => ({ ...prev, dosage: e.target.value }))}
                    />
                  ) : (
                    <p className="font-semibold">{prescription.dosage}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Frequency</p>
                  {isEditing ? (
                    <Input 
                      value={editForm.frequency}
                      onChange={(e) => setEditForm(prev => ({ ...prev, frequency: e.target.value }))}
                    />
                  ) : (
                    <p className="font-semibold">{prescription.frequency}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  {isEditing ? (
                    <Input 
                      value={editForm.duration}
                      onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                    />
                  ) : (
                    <p className="font-semibold">{prescription.duration || "As needed"}</p>
                  )}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Instructions</p>
                {isEditing ? (
                  <Textarea 
                    value={editForm.instructions}
                    onChange={(e) => setEditForm(prev => ({ ...prev, instructions: e.target.value }))}
                  />
                ) : (
                  <p className="text-foreground">{prescription.instructions || "No special instructions"}</p>
                )}
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Pharmacist Notes
              </CardTitle>
              {!isEditingNotes ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setOriginalNotes(prescription.pharmacistNotes || "");
                    setNotes(prescription.pharmacistNotes || "");
                    setIsEditingNotes(true);
                  }}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setNotes(originalNotes);
                      setIsEditingNotes(false);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => {
                      updatePrescriptionMutation.mutate({ pharmacistNotes: notes });
                      setIsEditingNotes(false);
                    }}
                    disabled={updatePrescriptionMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add notes about this prescription..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
                data-testid="textarea-notes"
                disabled={!isEditingNotes}
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

          {(prescription.status !== "cancelled" && prescription.status !== "delivered") ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {nextStatus && actionLabel ? (
                  <>
                    <Button
                      className="w-full"
                      onClick={() => {
                        if (prescription.status === "pending") {
                          setLocation(`/prescription/${prescription.id}/review`);
                        } else if (prescription.status === "in_review") {
                          setLocation(`/prescription/${prescription.id}/validate`);
                        } else {
                          updatePrescriptionMutation.mutate({ status: nextStatus });
                        }
                      }}
                      disabled={updatePrescriptionMutation.isPending}
                      data-testid="button-next-status"
                    >
                      {prescription.status === "preparing" ? (
                        <Package className="w-4 h-4 mr-2" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      {actionLabel}
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full text-danger border-danger/50 hover:bg-danger/10"
                      onClick={() => updatePrescriptionMutation.mutate({ status: "cancelled" })}
                      disabled={updatePrescriptionMutation.isPending}
                      data-testid="button-cancel"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Prescription
                    </Button>
                  </>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    <p className="text-sm">No actions available for this prescription</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

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
