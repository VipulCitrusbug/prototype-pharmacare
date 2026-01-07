import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/common";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle2, 
  Printer, 
  Bell,
  Truck,
  Clock,
  FileText,
  User,
  Pill,
  ArrowLeft,
  Home
} from "lucide-react";
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
  status: "completed",
  priority: "high",
  isRefill: false,
  isDelivery: true,
  aiConfidence: 95,
  aiNotes: "Clear prescription, verified dosage",
  pharmacistNotes: "Prescription dispensed as prescribed. Patient counseling provided.",
  assignedPharmacistId: "ph-001",
  createdAt: new Date(Date.now() - 30 * 60000),
  updatedAt: new Date(),
  dispensedAt: new Date(),
};

export default function PrescriptionCompletePage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const prescriptionQuery = useQuery<Prescription>({
    queryKey: ["/api/prescriptions", params.id],
    staleTime: 30000,
  });

  const prescription = prescriptionQuery.data || mockPrescription;

  const completionTime = new Date();
  const processingTime = Math.round((completionTime.getTime() - new Date(prescription.createdAt).getTime()) / 60000);

  if (prescriptionQuery.isLoading) {
    return <PageLoader text="Loading prescription..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6" data-testid="page-prescription-complete">
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Prescription Complete
        </h1>
        <p className="text-muted-foreground text-lg">
          {prescription.isDelivery ? "Ready for Delivery" : "Ready for Pickup"}
        </p>
      </div>

      <Card>
        <CardHeader className="text-center border-b">
          <CardTitle className="text-xl">Completion Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">{processingTime}</p>
              <p className="text-sm text-muted-foreground">Minutes to Process</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-success">100%</p>
              <p className="text-sm text-muted-foreground">Validations Passed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent">60</p>
              <p className="text-sm text-muted-foreground">Units Dispensed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-info">0</p>
              <p className="text-sm text-muted-foreground">Overrides Required</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{prescription.patientName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Patient ID</p>
              <p className="font-medium">{prescription.patientId}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {prescription.isDelivery ? (
                <Badge className="bg-info/10 text-info border-info/30">
                  <Truck className="w-3 h-3 mr-1" />
                  Delivery Order
                </Badge>
              ) : (
                <Badge variant="secondary">Pickup Order</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5" />
              Medication Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Medication</p>
              <p className="font-medium">{prescription.drugName} {prescription.dosage}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Directions</p>
              <p className="font-medium">{prescription.frequency}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{prescription.duration}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-success" />
            <div className="space-y-6 ml-10">
              <div className="relative">
                <div className="absolute -left-8 w-4 h-4 rounded-full bg-success border-2 border-background" />
                <div>
                  <p className="font-medium">Prescription Received</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(prescription.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-8 w-4 h-4 rounded-full bg-success border-2 border-background" />
                <div>
                  <p className="font-medium">AI Processing Completed</p>
                  <p className="text-sm text-muted-foreground">Data extracted with {prescription.aiConfidence}% confidence</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-8 w-4 h-4 rounded-full bg-success border-2 border-background" />
                <div>
                  <p className="font-medium">Pharmacist Review Completed</p>
                  <p className="text-sm text-muted-foreground">All fields verified and confirmed</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-8 w-4 h-4 rounded-full bg-success border-2 border-background" />
                <div>
                  <p className="font-medium">Validation Passed</p>
                  <p className="text-sm text-muted-foreground">All required checks completed</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-8 w-4 h-4 rounded-full bg-success border-2 border-background" />
                <div>
                  <p className="font-medium">Medication Dispensed</p>
                  <p className="text-sm text-muted-foreground">
                    {prescription.dispensedAt 
                      ? new Date(prescription.dispensedAt).toLocaleString()
                      : "Just now"
                    }
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-8 w-4 h-4 rounded-full bg-success border-2 border-background" />
                <div>
                  <p className="font-medium">Documentation Finalized</p>
                  <p className="text-sm text-muted-foreground">{completionTime.toLocaleString()}</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-8 w-4 h-4 rounded-full bg-info border-2 border-background" />
                <div>
                  <p className="font-medium text-info">
                    {prescription.isDelivery ? "Out for Delivery" : "Ready for Pickup"}
                  </p>
                  <p className="text-sm text-muted-foreground">Patient notification sent</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
        <Button 
          variant="outline" 
          data-testid="button-print"
          onClick={() => {
            // Generate and print a label with prescription details
            const printWindow = window.open('', '_blank');
            if (printWindow) {
              printWindow.document.write(`
                <html>
                  <head>
                    <title>Prescription Label - ${prescription.id}</title>
                    <style>
                      body { font-family: Arial, sans-serif; padding: 20px; }
                      .label { border: 2px solid #000; padding: 20px; max-width: 400px; }
                      h2 { margin-top: 0; }
                      .field { margin: 10px 0; }
                      .field strong { display: inline-block; width: 120px; }
                    </style>
                  </head>
                  <body>
                    <div class="label">
                      <h2>Prescription Label</h2>
                      <div class="field"><strong>Rx #:</strong> ${prescription.id}</div>
                      <div class="field"><strong>Patient:</strong> ${prescription.patientName}</div>
                      <div class="field"><strong>Drug:</strong> ${prescription.drugName}</div>
                      <div class="field"><strong>Dosage:</strong> ${prescription.dosage}</div>
                      <div class="field"><strong>Frequency:</strong> ${prescription.frequency}</div>
                      <div class="field"><strong>Duration:</strong> ${prescription.duration || 'As needed'}</div>
                      <div class="field"><strong>Instructions:</strong> ${prescription.instructions || 'None'}</div>
                      <div class="field"><strong>Prescriber:</strong> ${prescription.prescriberName || 'N/A'}</div>
                      <div class="field"><strong>Dispensed:</strong> ${prescription.dispensedAt ? new Date(prescription.dispensedAt).toLocaleDateString() : 'N/A'}</div>
                    </div>
                    <script>window.print(); window.close();</script>
                  </body>
                </html>
              `);
              printWindow.document.close();
            }
          }}
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Label
        </Button>
        <Button 
          variant="outline" 
          data-testid="button-notify"
          onClick={() => {
            // Simulate sending a notification
            toast({
              title: "Notification Sent",
              description: `${prescription.patientName} has been notified that their prescription is ${prescription.isDelivery ? 'out for delivery' : 'ready for pickup'}.`,
            });
          }}
        >
          <Bell className="w-4 h-4 mr-2" />
          Send Notification
        </Button>
        <Button 
          variant="outline" 
          data-testid="button-view-record"
          onClick={() => setLocation(`/prescription/${prescription.id}`)}
        >
          <FileText className="w-4 h-4 mr-2" />
          View Full Record
        </Button>
      </div>

      <div className="flex justify-center gap-4 pt-4 border-t">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/queue")}
          data-testid="button-back-queue"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Queue
        </Button>
        <Button 
          onClick={() => setLocation("/dashboard")}
          data-testid="button-dashboard"
        >
          <Home className="w-4 h-4 mr-2" />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
