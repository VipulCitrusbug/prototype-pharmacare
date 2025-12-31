import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { PageLoader, StatusBadge, PriorityIndicator, AIAssistBadge } from "@/components/common";
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles,
  FileText,
  Edit3,
  CheckCircle,
  RefreshCw,
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
  status: "dispensed",
  priority: "high",
  isRefill: false,
  isDelivery: true,
  aiConfidence: 95,
  aiNotes: "Clear prescription, verified dosage",
  pharmacistNotes: null,
  assignedPharmacistId: null,
  createdAt: new Date(Date.now() - 30 * 60000),
  updatedAt: new Date(),
  dispensedAt: new Date(),
};

export default function PrescriptionDocumentPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [approved, setApproved] = useState(false);
  const [dispensingNotes, setDispensingNotes] = useState(`Prescription dispensed as prescribed.

Medication: Metformin 500mg tablets
Quantity Dispensed: 60 tablets
Batch Number: MET-2024-001
Expiry Date: August 15, 2026

Patient counseling provided on:
- Take medication with meals to reduce GI side effects
- Monitor blood glucose levels regularly
- Contact pharmacy if experiencing persistent side effects

No substitutions made. Prescription filled as written.`);

  const prescriptionQuery = useQuery<Prescription>({
    queryKey: ["/api/prescriptions", params.id],
    staleTime: 30000,
  });

  const prescription = prescriptionQuery.data || mockPrescription;

  const completeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/prescriptions/${params.id}`, {
        status: "completed",
        pharmacistNotes: dispensingNotes,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      toast({ title: "Documentation complete", description: "Prescription ready for pickup/delivery" });
      setLocation(`/prescription/${params.id}/complete`);
    },
  });

  const regenerateNotes = () => {
    toast({ title: "Regenerating notes", description: "AI is generating updated documentation" });
  };

  if (prescriptionQuery.isLoading) {
    return <PageLoader text="Loading prescription..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="page-prescription-document">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation(`/prescription/${params.id}/dispense`)} 
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Documentation & Notes</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            AI-assisted documentation
          </p>
        </div>
        <StatusBadge status="dispensed" />
        <PriorityIndicator priority={prescription.priority as any} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  AI-Generated Dispensing Notes
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={regenerateNotes}
                    data-testid="button-regenerate"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button 
                    variant={isEditing ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    data-testid="button-edit"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditing ? "Done" : "Edit"}
                  </Button>
                </div>
              </div>
              <CardDescription>
                Review and approve the auto-generated documentation before completion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <AIAssistBadge confidence={95} showLabel />
              </div>
              {isEditing ? (
                <Textarea
                  value={dispensingNotes}
                  onChange={(e) => setDispensingNotes(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  data-testid="textarea-notes"
                />
              ) : (
                <div className="p-4 bg-muted/50 rounded-lg border min-h-[300px]">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">
                    {dispensingNotes}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Documentation Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg border">
                  <Checkbox
                    id="approve-docs"
                    checked={approved}
                    onCheckedChange={(checked) => setApproved(checked as boolean)}
                    data-testid="checkbox-approve"
                  />
                  <div>
                    <Label htmlFor="approve-docs" className="font-medium cursor-pointer">
                      I confirm that I have reviewed the documentation and it is accurate
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      By checking this box, you acknowledge that the dispensing notes are complete 
                      and accurate for audit purposes.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Documentation will be timestamped and locked upon completion
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
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
                <p className="text-sm text-muted-foreground">Prescriber</p>
                <p className="font-medium">{prescription.prescriberName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dispensed</p>
                <p className="font-medium">
                  {prescription.dispensedAt 
                    ? new Date(prescription.dispensedAt).toLocaleString()
                    : "Just now"
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
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
                    <p className="font-medium">Data Reviewed</p>
                    <p className="text-muted-foreground">25 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-success" />
                  <div>
                    <p className="font-medium">Validation Complete</p>
                    <p className="text-muted-foreground">20 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-success" />
                  <div>
                    <p className="font-medium">Medication Dispensed</p>
                    <p className="text-muted-foreground">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-info" />
                  <div>
                    <p className="font-medium">Documentation Review</p>
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
          <Button 
            variant="outline" 
            onClick={() => setLocation(`/prescription/${params.id}/dispense`)} 
            data-testid="button-back-dispense"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dispensing
          </Button>
          <Button 
            variant="default"
            onClick={() => completeMutation.mutate()}
            disabled={!approved || completeMutation.isPending}
            data-testid="button-complete"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete & Finalize
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
