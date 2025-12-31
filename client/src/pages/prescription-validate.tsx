import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageLoader, StatusBadge, PriorityIndicator } from "@/components/common";
import { 
  ArrowLeft, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2,
  Shield,
  Pill,
  FileCheck,
  AlertCircle,
  XCircle
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Prescription } from "@shared/schema";

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
  instructions: "Take with meals",
  status: "in_review",
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
};

interface ValidationItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
  status: "pending" | "passed" | "failed" | "warning";
}

export default function PrescriptionValidatePage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [validations, setValidations] = useState<Record<string, boolean>>({});

  const prescriptionQuery = useQuery<Prescription>({
    queryKey: ["/api/prescriptions", params.id],
    staleTime: 30000,
  });

  const prescription = prescriptionQuery.data || mockPrescription;

  const validationItems: ValidationItem[] = [
    { 
      id: "drug-correct", 
      label: "Drug Name Verified", 
      description: "Confirm the drug name matches the prescription",
      required: true,
      status: "pending"
    },
    { 
      id: "dosage-appropriate", 
      label: "Dosage Appropriate", 
      description: "Verify dosage is within therapeutic range",
      required: true,
      status: "pending"
    },
    { 
      id: "frequency-correct", 
      label: "Frequency Verified", 
      description: "Confirm administration frequency is correct",
      required: true,
      status: "pending"
    },
    { 
      id: "instructions-complete", 
      label: "Instructions Complete", 
      description: "All necessary patient instructions are included",
      required: true,
      status: "pending"
    },
    { 
      id: "no-interactions", 
      label: "No Drug Interactions", 
      description: "No known drug interactions identified",
      required: true,
      status: "passed"
    },
    { 
      id: "no-allergies", 
      label: "Allergy Check Passed", 
      description: "Patient has no known allergies to this medication",
      required: true,
      status: "passed"
    },
    { 
      id: "prescriber-valid", 
      label: "Prescriber Authorized", 
      description: "Prescriber is authorized to prescribe this medication",
      required: true,
      status: "passed"
    },
  ];

  const requiredValidations = validationItems.filter(v => v.required);
  const checkedCount = Object.values(validations).filter(Boolean).length;
  const autoPassedCount = validationItems.filter(v => v.status === "passed").length;
  const allValidationsComplete = checkedCount + autoPassedCount >= requiredValidations.length;

  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/prescriptions/${params.id}`, {
        status: "preparing",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      toast({ title: "Validation complete", description: "Prescription approved for dispensing" });
      setLocation(`/prescription/${params.id}/dispense`);
    },
  });

  const handleValidationChange = (id: string, checked: boolean) => {
    setValidations(prev => ({ ...prev, [id]: checked }));
  };

  const getStatusIcon = (status: ValidationItem["status"]) => {
    switch (status) {
      case "passed": return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "failed": return <XCircle className="w-5 h-5 text-danger" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-amber" />;
      default: return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  if (prescriptionQuery.isLoading) {
    return <PageLoader text="Loading prescription..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="page-prescription-validate">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation(`/prescription/${params.id}/review`)} 
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Prescription Validation</h1>
          <p className="text-muted-foreground">
            Complete all required checks before dispensing
          </p>
        </div>
        <StatusBadge status="in_review" />
        <PriorityIndicator priority={prescription.priority as any} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Validation Checklist
              </CardTitle>
              <CardDescription>
                All required validations must be completed before proceeding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {validationItems.map((item) => {
                const isAutoCompleted = item.status === "passed";
                const isChecked = isAutoCompleted || validations[item.id];
                
                return (
                  <div 
                    key={item.id}
                    className={`p-4 rounded-lg border ${isChecked ? "border-success/50 bg-success/5" : "border-border"}`}
                    data-testid={`validation-${item.id}`}
                  >
                    <div className="flex items-start gap-4">
                      {isAutoCompleted ? (
                        getStatusIcon(item.status)
                      ) : (
                        <Checkbox
                          id={item.id}
                          checked={validations[item.id] || false}
                          onCheckedChange={(checked) => handleValidationChange(item.id, checked as boolean)}
                          className="mt-0.5"
                          data-testid={`checkbox-${item.id}`}
                        />
                      )}
                      <div className="flex-1">
                        <Label 
                          htmlFor={item.id} 
                          className={`font-medium cursor-pointer ${isChecked ? "text-success" : ""}`}
                        >
                          {item.label}
                          {item.required && <span className="text-danger ml-1">*</span>}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        {isAutoCompleted && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            Automatically verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Prescription Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">{prescription.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medication</p>
                <p className="font-medium">{prescription.drugName} {prescription.dosage}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Frequency</p>
                <p className="font-medium">{prescription.frequency}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{prescription.duration}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prescriber</p>
                <p className="font-medium">{prescription.prescriberName}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Validation Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium">
                    {checkedCount + autoPassedCount} / {requiredValidations.length}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all"
                    style={{ width: `${((checkedCount + autoPassedCount) / requiredValidations.length) * 100}%` }}
                  />
                </div>
                {!allValidationsComplete && (
                  <p className="text-sm text-amber flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Complete all required validations to proceed
                  </p>
                )}
                {allValidationsComplete && (
                  <p className="text-sm text-success flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    All validations complete
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardFooter className="flex justify-between p-4">
          <Button 
            variant="outline" 
            onClick={() => setLocation(`/prescription/${params.id}/review`)} 
            data-testid="button-back-review"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Review
          </Button>
          <Button 
            variant="default"
            onClick={() => approveMutation.mutate()}
            disabled={!allValidationsComplete || approveMutation.isPending}
            data-testid="button-approve-dispense"
          >
            Approve for Dispensing
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
