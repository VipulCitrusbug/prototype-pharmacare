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
  Plus,
} from "lucide-react";
import { useState, useEffect } from "react";
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
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
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

  // Add Medication States
  const [isAddingMedication, setIsAddingMedication] = useState(false);
  const [isProcessingAddUpload, setIsProcessingAddUpload] = useState(false);
  const [addMedicationForm, setAddMedicationForm] = useState({
    drugName: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });
  const [additionalMedications, setAdditionalMedications] = useState<Array<{
    id: string;
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    addedAt: Date;
  }>>([]);

  // Mock AI Data Extraction (similar to new.tsx)
  const generateMockExtractedData = () => {
    const medications = [
      { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "30 days" },
      { name: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "60 days" },
      { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily at bedtime", duration: "90 days" },
      { name: "Levothyroxine", dosage: "50mcg", frequency: "Once daily in morning", duration: "30 days" },
      { name: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days" },
    ];

    const randomMed = medications[Math.floor(Math.random() * medications.length)];

    return {
      drugName: randomMed.name,
      dosage: randomMed.dosage,
      frequency: randomMed.frequency,
      duration: randomMed.duration,
      instructions: "Take with food. Do not skip doses.",
    };
  };

  // Simulate AI Processing
  const simulateAIProcessing = async () => {
    setIsProcessingUpload(true);
    
    // Simulate processing time (2-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Generate and populate mock data
    const extractedData = generateMockExtractedData();
    setEditForm(prev => ({ ...prev, ...extractedData }));
    
    setIsProcessingUpload(false);
    setUploadedFile(null);
    
    toast({
      title: "Extraction Complete",
      description: "Medication details have been extracted. Please review and edit as needed.",
    });
  };

  // Simulate AI Processing for Add Medication
  const simulateAIProcessingForAdd = async () => {
    setIsProcessingAddUpload(true);
    
    // Simulate processing time (2-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Generate and populate mock data for add form
    const extractedData = generateMockExtractedData();
    setAddMedicationForm(prev => ({ ...prev, ...extractedData }));
    
    setIsProcessingAddUpload(false);
    setUploadedFile(null);
    
    toast({
      title: "Extraction Complete",
      description: "New medication details have been extracted. Please review and save.",
    });
  };

  // Handle File Upload
  const handleFileUpload = async (file: File, isForAddMedication = false) => {
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

    // Create document object for tracking
    const newDocument = {
      id: `doc-${Date.now()}`,
      fileName: file.name,
      fileType: file.type.includes('pdf') ? 'pdf' : 'image',
      fileSize: file.size,
      fileUrl: URL.createObjectURL(file), // Create blob URL for preview
      source: 'upload' as const,
      uploadedBy: 'Current User', // In real app, get from auth context
      uploadedAt: new Date(),
      isSourceDocument: false,
    };

    // Add to documents list immediately
    setDocuments(prev => [newDocument, ...prev]);

    setUploadedFile(file);
    
    // Process based on context
    if (isForAddMedication) {
      await simulateAIProcessingForAdd();
    } else {
      await simulateAIProcessing();
    }
  };

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

  // Decode additional medications from aiNotes field
  useEffect(() => {
    if (prescription?.aiNotes) {
      try {
        const parsed = JSON.parse(prescription.aiNotes);
        if (parsed.type === "additional_medications" && Array.isArray(parsed.medications)) {
          const meds = parsed.medications.map((med: any, index: number) => ({
            id: `med-loaded-${index}`,
            drugName: med.drugName,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            instructions: med.instructions,
            addedAt: prescription.createdAt,
          }));
          setAdditionalMedications(meds);
        }
      } catch (e) {
        // aiNotes is regular text, not JSON - ignore
      }
    }
  }, [prescription?.aiNotes, prescription?.createdAt]);


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
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-normal">
                  Primary
                </span>
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
                    onClick={() => {
                      setIsEditing(false);
                      setIsProcessingUpload(false);
                      setUploadedFile(null);
                    }}
                    disabled={updatePrescriptionMutation.isPending || isProcessingUpload}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => updatePrescriptionMutation.mutate(editForm)}
                    disabled={updatePrescriptionMutation.isPending || isProcessingUpload}
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

              {/* Additional Medications within same card */}
              {additionalMedications.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      Additional Medications ({additionalMedications.length})
                    </h3>
                    <div className="space-y-3">
                      {additionalMedications.map((med) => (
                        <div key={med.id} className="p-4 border-l-4 border-l-accent bg-accent/5 rounded-r-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-base">{med.drugName}</h4>
                              <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">
                                Additional
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setAdditionalMedications(prev => prev.filter(m => m.id !== med.id));
                                toast({
                                  title: "Medication Removed",
                                  description: `${med.drugName} has been removed.`,
                                });
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-danger" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Dosage</p>
                              <p className="text-sm font-medium">{med.dosage}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Frequency</p>
                              <p className="text-sm font-medium">{med.frequency}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Duration</p>
                              <p className="text-sm font-medium">{med.duration || "As needed"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Added</p>
                              <p className="text-sm font-medium">{new Date(med.addedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {med.instructions && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-xs text-muted-foreground mb-1">Instructions</p>
                              <p className="text-sm">{med.instructions}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Add Medication Button/Form inside card */}
              <Separator className="my-6" />
              {!isAddingMedication ? (
                <Button
                  variant="outline"
                  className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5"
                  onClick={() => {
                    setAddMedicationForm({
                      drugName: "",
                      dosage: "",
                      frequency: "",
                      duration: "",
                      instructions: "",
                    });
                    setIsAddingMedication(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Medication
                </Button>
              ) : (
                <div className="border-2 border-primary/30 rounded-lg p-4 bg-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Plus className="w-5 h-5 text-primary" />
                      Add New Medication
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsAddingMedication(false);
                        setAddMedicationForm({
                            drugName: "",
                            dosage: "",
                            frequency: "",
                            duration: "",
                            instructions: "",
                          });
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Drug Name *</label>
                        <Input
                          value={addMedicationForm.drugName}
                          onChange={(e) => setAddMedicationForm(prev => ({ ...prev, drugName: e.target.value }))}
                          placeholder="e.g., Aspirin"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Dosage *</label>
                        <Input
                          value={addMedicationForm.dosage}
                          onChange={(e) => setAddMedicationForm(prev => ({ ...prev, dosage: e.target.value }))}
                          placeholder="e.g., 100mg"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Frequency *</label>
                        <Input
                          value={addMedicationForm.frequency}
                          onChange={(e) => setAddMedicationForm(prev => ({ ...prev, frequency: e.target.value }))}
                          placeholder="e.g., Once daily"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Duration</label>
                        <Input
                          value={addMedicationForm.duration}
                          onChange={(e) => setAddMedicationForm(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="e.g., 30 days"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Instructions</label>
                      <Textarea
                        value={addMedicationForm.instructions}
                        onChange={(e) => setAddMedicationForm(prev => ({ ...prev, instructions: e.target.value }))}
                        placeholder="Special instructions for this medication..."
                        rows={2}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingMedication(false);
                          setAddMedicationForm({
                            drugName: "",
                            dosage: "",
                            frequency: "",
                            duration: "",
                            instructions: "",
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          if (!addMedicationForm.drugName || !addMedicationForm.dosage || !addMedicationForm.frequency) {
                            toast({
                              title: "Validation Error",
                              description: "Please fill in Drug Name, Dosage, and Frequency.",
                              variant: "destructive",
                            });
                            return;
                          }

                          const newMedication = {
                            id: `med-${Date.now()}`,
                            ...addMedicationForm,
                            addedAt: new Date(),
                          };

                          setAdditionalMedications(prev => [...prev, newMedication]);
                          setIsAddingMedication(false);
                          setAddMedicationForm({
                            drugName: "",
                            dosage: "",
                            frequency: "",
                            duration: "",
                            instructions: "",
                          });

                          toast({
                            title: "Medication Added",
                            description: `${newMedication.drugName} has been added successfully.`,
                          });
                        }}
                        disabled={isProcessingAddUpload}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Medication
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
                <File className="w-5 h-5 text-primary" />
                Prescription Documents
              </CardTitle>
              <div>
                <input
                  type="file"
                  id="document-upload"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, false);
                      // Reset the input so the same file can be uploaded again if needed
                      e.target.value = '';
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('document-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <div 
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded">
                          {doc.fileType === 'pdf' ? (
                            <FileType className="w-5 h-5 text-primary" />
                          ) : (
                            <FileImage className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{doc.fileName}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="capitalize">{doc.source}</span>
                            <span>•</span>
                            <span>{(doc.fileSize / 1000).toFixed(0)} KB</span>
                            <span>•</span>
                            <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                            {doc.isSourceDocument && (
                              <>
                                <span>•</span>
                                <span className="text-primary font-medium">Original</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          // Create a temporary anchor element to trigger download
                          const link = document.createElement('a');
                          link.href = doc.fileUrl;
                          link.download = doc.fileName;
                          link.target = '_blank';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          
                          toast({
                            title: "Download Started",
                            description: `Downloading ${doc.fileName}`,
                          });
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No documents attached
                  </p>
                )}
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
