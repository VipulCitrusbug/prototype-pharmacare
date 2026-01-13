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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2, Upload, FileImage, CheckCircle2, Sparkles, Plus, Trash2, Pill } from "lucide-react";
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

  // AI Upload Feature States
  const [entryMode, setEntryMode] = useState<'manual' | 'upload'>('manual');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExtractedDataReview, setShowExtractedDataReview] = useState(false);

  // Multiple Medications States
  const [medications, setMedications] = useState<Array<{
    id: string;
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>>([]);

  const [currentMedication, setCurrentMedication] = useState({
    drugName: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
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

  // Mock AI Data Extraction
  const generateMockExtractedData = (): Partial<InsertPrescription> => {
    const medications = [
      { name: "Lisinopril", dosage: "10mg", frequency: "Once daily" },
      { name: "Metformin", dosage: "500mg", frequency: "Twice daily" },
      { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily at bedtime" },
      { name: "Levothyroxine", dosage: "50mcg", frequency: "Once daily in morning" },
      { name: "Amlodipine", dosage: "5mg", frequency: "Once daily" },
    ];

    const prescribers = [
      "Dr. Sarah Johnson",
      "Dr. Michael Chen",
      "Dr. Emily Rodriguez",
      "Dr. James Thompson",
      "Dr. Lisa Anderson",
    ];

    const randomMed = medications[Math.floor(Math.random() * medications.length)];
    const randomPrescriber = prescribers[Math.floor(Math.random() * prescribers.length)];
    const randomPatientId = Math.floor(10000 + Math.random() * 90000);
    const randomPrescriberId = Math.floor(10000 + Math.random() * 90000);

    return {
      patientName: "John Michael Doe",
      patientId: `P-${randomPatientId}`,
      prescriberName: randomPrescriber,
      prescriberId: `DR-${randomPrescriberId}`,
      drugName: randomMed.name,
      dosage: randomMed.dosage,
      frequency: randomMed.frequency,
      duration: "30 days",
      instructions: "Take with food. Do not skip doses.",
      priority: "medium",
      status: "pending",
      isRefill: false,
      isDelivery: false,
    };
  };

  // Simulate AI Processing
  const simulateAIProcessing = async () => {
    setIsProcessing(true);
    
    // Simulate processing time (2-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Generate and populate mock data
    const extractedData = generateMockExtractedData();
    
    // Update patient/prescriber info in formData
    setFormData(prev => ({
      ...prev,
      patientName: extractedData.patientName,
      patientId: extractedData.patientId,
      prescriberName: extractedData.prescriberName,
      prescriberId: extractedData.prescriberId,
    }));
    
    // Update medication info in currentMedication
    setCurrentMedication({
      drugName: extractedData.drugName || "",
      dosage: extractedData.dosage || "",
      frequency: extractedData.frequency || "",
      duration: extractedData.duration || "",
      instructions: extractedData.instructions || "",
    });
    
    setIsProcessing(false);
    setShowExtractedDataReview(true);
    
    toast({
      title: "Extraction Complete",
      description: "Prescription details have been extracted. Please review and edit as needed.",
    });
  };

  // Handle File Upload
  const handleFileUpload = async (file: File) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image (JPG, PNG) or PDF file.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    await simulateAIProcessing();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.patientName) {
      toast({
        title: "Validation Error",
        description: "Please fill in Patient Name.",
        variant: "destructive",
      });
      return;
    }

    if (medications.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one medication to the prescription.",
        variant: "destructive",
      });
      return;
    }

    // Use first medication for the prescription (for now, backend supports single medication)
    const firstMedication = medications[0];
    const additionalMeds = medications.slice(1);
    
    // Encode additional medications in aiNotes field as JSON
    let aiNotesValue = formData.aiNotes || "";
    
    if (additionalMeds.length > 0) {
      const additionalMedsData = {
        type: "additional_medications",
        medications: additionalMeds.map(({ id, ...med }) => med),
        originalAiNotes: aiNotesValue
      };
      aiNotesValue = JSON.stringify(additionalMedsData);
    }
    
    const prescriptionData = {
      ...formData,
      drugName: firstMedication.drugName,
      dosage: firstMedication.dosage,
      frequency: firstMedication.frequency,
      duration: firstMedication.duration,
      instructions: firstMedication.instructions,
      aiNotes: aiNotesValue,
    };

    createPrescriptionMutation.mutate(prescriptionData);
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

      <Tabs value={entryMode} onValueChange={(value) => setEntryMode(value as 'manual' | 'upload')} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="upload">
            <Sparkles className="w-4 h-4 mr-2" />
            Upload Prescription (AI)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {!isProcessing && !showExtractedDataReview && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Prescription Document
                </CardTitle>
                <CardDescription>
                  Upload a prescription image or PDF. Our AI will extract the details automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-primary');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('border-primary');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-primary');
                    const file = e.dataTransfer.files[0];
                    if (file) handleFileUpload(file);
                  }}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  <FileImage className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">
                    Drop your prescription here, or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports JPG, PNG, and PDF files
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {isProcessing && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Analyzing prescription...</p>
                    <p className="text-sm text-muted-foreground">
                      Extracting patient and medication details
                    </p>
                  </div>
                  {uploadedFile && (
                    <p className="text-xs text-muted-foreground">
                      Processing: {uploadedFile.name}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {showExtractedDataReview && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Data extracted successfully!</strong> Please review and edit the prescription details below before saving.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="manual" className="m-0">
          {/* Manual entry content will be shown below */}
        </TabsContent>
      </Tabs>

      {/* Form - shown for both manual and upload (after extraction) */}
      {(entryMode === 'manual' || (entryMode === 'upload' && showExtractedDataReview)) && (
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

          {/* Medication Details - Multiple Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Medications ({medications.length})
              </CardTitle>
              <CardDescription>Add one or more medications to this prescription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Display Added Medications */}
              {medications.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">Added Medications</h4>
                  <div className="space-y-2">
                    {medications.map((med, index) => (
                      <div key={med.id} className="p-4 border rounded-lg bg-accent/5 border-l-4 border-l-primary">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="font-semibold text-base">{med.drugName}</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Dosage:</span>
                                <span className="ml-1 font-medium">{med.dosage}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Frequency:</span>
                                <span className="ml-1 font-medium">{med.frequency}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Duration:</span>
                                <span className="ml-1 font-medium">{med.duration || "As needed"}</span>
                              </div>
                            </div>
                            {med.instructions && (
                              <p className="text-sm text-muted-foreground mt-2">
                                <span className="font-medium">Instructions:</span> {med.instructions}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setMedications(prev => prev.filter(m => m.id !== med.id));
                              toast({
                                title: "Medication Removed",
                                description: `${med.drugName} has been removed.`,
                              });
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-danger" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4" />
                </div>
              )}

              {/* Add Medication Form */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  {medications.length > 0 ? "Add Another Medication" : "Add Medication"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentDrugName">
                      Drug Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="currentDrugName"
                      value={currentMedication.drugName}
                      onChange={(e) => setCurrentMedication(prev => ({ ...prev, drugName: e.target.value }))}
                      placeholder="e.g., Lisinopril"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentDosage">
                      Dosage <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="currentDosage"
                      value={currentMedication.dosage}
                      onChange={(e) => setCurrentMedication(prev => ({ ...prev, dosage: e.target.value }))}
                      placeholder="e.g., 10mg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentFrequency">
                      Frequency <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="currentFrequency"
                      value={currentMedication.frequency}
                      onChange={(e) => setCurrentMedication(prev => ({ ...prev, frequency: e.target.value }))}
                      placeholder="e.g., Once daily"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentDuration">Duration</Label>
                    <Input
                      id="currentDuration"
                      value={currentMedication.duration}
                      onChange={(e) => setCurrentMedication(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 30 days"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentInstructions">Instructions</Label>
                  <Textarea
                    id="currentInstructions"
                    value={currentMedication.instructions}
                    onChange={(e) => setCurrentMedication(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="e.g., Take with food in the morning"
                    rows={2}
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (!currentMedication.drugName || !currentMedication.dosage || !currentMedication.frequency) {
                      toast({
                        title: "Validation Error",
                        description: "Please fill in Drug Name, Dosage, and Frequency.",
                        variant: "destructive",
                      });
                      return;
                    }

                    const newMedication = {
                      id: `med-${Date.now()}`,
                      ...currentMedication,
                    };

                    setMedications(prev => [...prev, newMedication]);
                    setCurrentMedication({
                      drugName: "",
                      dosage: "",
                      frequency: "",
                      duration: "",
                      instructions: "",
                    });

                    toast({
                      title: "Medication Added",
                      description: `${newMedication.drugName} has been added to the prescription.`,
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication to List
                </Button>
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
      )}
    </div>
  );
}
