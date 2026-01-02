import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import type { InsertPrescription } from "@shared/schema";

export default function NewPrescriptionPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<InsertPrescription>>({
    patientId: "",
    patientName: "",
    prescriberId: "",
    prescriberName: "",
    drugName: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    status: "pending",
    priority: "medium",
    isRefill: false,
    isDelivery: false,
    pharmacistNotes: "",
  });

  const createPrescriptionMutation = useMutation({
    mutationFn: async (data: Partial<InsertPrescription>) => {
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to create prescription");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      
      toast({
        title: "Prescription Created",
        description: `Prescription for ${formData.patientName} has been created successfully.`,
      });

      setLocation(`/prescription/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create prescription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.patientName || !formData.drugName || !formData.dosage || !formData.frequency) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Patient Name, Drug, Dosage, Frequency).",
        variant: "destructive",
      });
      return;
    }

    createPrescriptionMutation.mutate(formData);
  };

  const updateField = (field: keyof InsertPrescription, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6" data-testid="new-prescription-page">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/dashboard")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">New Prescription</h1>
          <p className="text-muted-foreground">Create a new prescription entry</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>Enter the patient's details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">
                    Patient Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => updateField("patientName", e.target.value)}
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input
                    id="patientId"
                    value={formData.patientId}
                    onChange={(e) => updateField("patientId", e.target.value)}
                    placeholder="e.g., P-12345"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prescriber Information */}
          <Card>
            <CardHeader>
              <CardTitle>Prescriber Information</CardTitle>
              <CardDescription>Enter the prescriber's details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prescriberName">Prescriber Name</Label>
                  <Input
                    id="prescriberName"
                    value={formData.prescriberName || ""}
                    onChange={(e) => updateField("prescriberName", e.target.value)}
                    placeholder="e.g., Dr. Sarah Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prescriberId">Prescriber ID</Label>
                  <Input
                    id="prescriberId"
                    value={formData.prescriberId || ""}
                    onChange={(e) => updateField("prescriberId", e.target.value)}
                    placeholder="e.g., DR-12345"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medication Details */}
          <Card>
            <CardHeader>
              <CardTitle>Medication Details</CardTitle>
              <CardDescription>Enter the medication information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="drugName">
                    Drug Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="drugName"
                    value={formData.drugName}
                    onChange={(e) => updateField("drugName", e.target.value)}
                    placeholder="e.g., Lisinopril"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">
                    Dosage <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => updateField("dosage", e.target.value)}
                    placeholder="e.g., 10mg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">
                    Frequency <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => updateField("frequency", e.target.value)}
                    placeholder="e.g., Once daily"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration || ""}
                    onChange={(e) => updateField("duration", e.target.value)}
                    placeholder="e.g., 30 days"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions || ""}
                  onChange={(e) => updateField("instructions", e.target.value)}
                  placeholder="e.g., Take with food in the morning"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Prescription Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Prescription Settings</CardTitle>
              <CardDescription>Set priority and delivery options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => updateField("priority", value)}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => updateField("status", value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRefill"
                    checked={formData.isRefill || false}
                    onCheckedChange={(checked) => updateField("isRefill", checked)}
                  />
                  <Label
                    htmlFor="isRefill"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    This is a refill prescription
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isDelivery"
                    checked={formData.isDelivery || false}
                    onCheckedChange={(checked) => updateField("isDelivery", checked)}
                  />
                  <Label
                    htmlFor="isDelivery"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Requires delivery
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pharmacistNotes">Pharmacist Notes</Label>
                <Textarea
                  id="pharmacistNotes"
                  value={formData.pharmacistNotes || ""}
                  onChange={(e) => updateField("pharmacistNotes", e.target.value)}
                  placeholder="Add any additional notes or observations"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/dashboard")}
              disabled={createPrescriptionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPrescriptionMutation.isPending}
              data-testid="button-create-prescription"
            >
              {createPrescriptionMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Prescription
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
