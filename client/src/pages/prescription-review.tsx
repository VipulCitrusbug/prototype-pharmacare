import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PageLoader, AIAssistBadge, PriorityIndicator, StatusBadge } from "@/components/common";
import { 
  ArrowLeft, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle, 
  Edit3, 
  Sparkles,
  Eye,
  FileText,
  User,
  Pill,
  Clock
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

interface ExtractedField {
  name: string;
  value: string;
  confidence: number;
  editable: boolean;
}

export default function PrescriptionReviewPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});

  const prescriptionQuery = useQuery<Prescription>({
    queryKey: ["/api/prescriptions", params.id],
    staleTime: 30000,
  });

  const prescription = prescriptionQuery.data || mockPrescription;

  const extractedFields: ExtractedField[] = [
    { name: "Drug Name", value: prescription.drugName, confidence: 98, editable: true },
    { name: "Dosage", value: prescription.dosage, confidence: 95, editable: true },
    { name: "Frequency", value: prescription.frequency, confidence: 88, editable: true },
    { name: "Duration", value: prescription.duration || "", confidence: 92, editable: true },
    { name: "Instructions", value: prescription.instructions || "", confidence: 85, editable: true },
    { name: "Patient Name", value: prescription.patientName, confidence: 99, editable: false },
    { name: "Prescriber", value: prescription.prescriberName || "", confidence: 97, editable: false },
  ];

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/prescriptions/${params.id}`, {
        status: "in_review",
        ...editedFields,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      toast({ title: "Review completed", description: "Prescription data has been confirmed" });
      setLocation(`/prescription/${params.id}/validate`);
    },
  });

  const handleFieldChange = (fieldName: string, value: string) => {
    setEditedFields(prev => ({ ...prev, [fieldName.toLowerCase().replace(/\s/g, "")]: value }));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-success";
    if (confidence >= 75) return "text-amber";
    return "text-danger";
  };

  if (prescriptionQuery.isLoading) {
    return <PageLoader text="Loading prescription..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="page-prescription-review">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/queue")} data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Prescription Review & Intake</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            AI-extracted data for review
          </p>
        </div>
        <StatusBadge status={prescription.status as any} />
        <PriorityIndicator priority={prescription.priority as any} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Extracted Prescription Data
                </CardTitle>
                <Button 
                  variant={isEditing ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  data-testid="button-edit-mode"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {isEditing ? "Done Editing" : "Edit Fields"}
                </Button>
              </div>
              <CardDescription>
                Review and confirm AI-extracted fields. Low-confidence items are highlighted.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {extractedFields.map((field) => {
                const isLowConfidence = field.confidence < 90;
                return (
                  <div 
                    key={field.name} 
                    className={`p-4 rounded-lg border ${isLowConfidence ? "border-amber bg-amber/5" : "border-border"}`}
                    data-testid={`field-${field.name.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">{field.name}</Label>
                      <div className="flex items-center gap-2">
                        {isLowConfidence && (
                          <AlertTriangle className="w-4 h-4 text-amber" />
                        )}
                        <span className={`text-xs font-medium ${getConfidenceColor(field.confidence)}`}>
                          {field.confidence}% confidence
                        </span>
                      </div>
                    </div>
                    {isEditing && field.editable ? (
                      <Input
                        defaultValue={editedFields[field.name.toLowerCase().replace(/\s/g, "")] || field.value}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className={isLowConfidence ? "border-amber" : ""}
                        data-testid={`input-${field.name.toLowerCase().replace(/\s/g, "-")}`}
                      />
                    ) : (
                      <p className="text-foreground">{field.value}</p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                AI Analysis Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                <p className="text-foreground">{prescription.aiNotes}</p>
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="pharmacistNotes">Pharmacist Notes</Label>
                <Textarea
                  id="pharmacistNotes"
                  placeholder="Add any notes about corrections or observations..."
                  className="min-h-[100px]"
                  data-testid="textarea-pharmacist-notes"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Patient Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Patient Name</p>
                <p className="font-medium">{prescription.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Patient ID</p>
                <p className="font-medium">{prescription.patientId}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {prescription.isRefill && <Badge variant="secondary">Refill</Badge>}
                {prescription.isDelivery && <Badge variant="outline">Delivery</Badge>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                AI Confidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIAssistBadge confidence={prescription.aiConfidence || 0} />
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Overall Extraction</span>
                  <span className={getConfidenceColor(prescription.aiConfidence || 0)}>
                    {prescription.aiConfidence}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fields Extracted</span>
                  <span>7 / 7</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Low Confidence Fields</span>
                  <span className="text-amber">2</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-success" />
                  <div>
                    <p className="font-medium">Prescription Received</p>
                    <p className="text-muted-foreground">30 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-success" />
                  <div>
                    <p className="font-medium">AI Processing Complete</p>
                    <p className="text-muted-foreground">28 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-info" />
                  <div>
                    <p className="font-medium">In Review</p>
                    <p className="text-muted-foreground">Current stage</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardFooter className="flex justify-between p-4">
          <Button variant="outline" onClick={() => setLocation("/queue")} data-testid="button-cancel">
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="default"
              onClick={() => confirmMutation.mutate()}
              disabled={confirmMutation.isPending}
              data-testid="button-confirm-review"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm & Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
