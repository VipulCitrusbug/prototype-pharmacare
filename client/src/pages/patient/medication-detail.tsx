import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Home,
  MapPin,
  Pill,
  RefreshCw,
  Sparkles,
  Store,
  Truck,
  User,
  FileText,
} from "lucide-react";

const mockMedicationDetail = {
  id: "med-1",
  name: "Metformin",
  dosage: "500mg",
  frequency: "Twice daily",
  instructions: "Take with meals to reduce stomach upset. Do not skip doses. Monitor blood sugar regularly.",
  prescriber: "Dr. Michael Chen",
  prescriberPhone: "(555) 123-4567",
  pharmacy: "PharmaCare Plus - Downtown",
  lastRefill: "Dec 15, 2025",
  nextRefillDate: "Jan 3, 2026",
  daysRemaining: 3,
  refillEligible: true,
  aiPrediction: true,
  status: "active",
  refillsRemaining: 5,
  totalRefills: 12,
  prescriptionNumber: "RX-2025-001234",
  originalPrescribedDate: "June 15, 2025",
  quantity: "60 tablets",
  ndc: "0093-7214-01",
};

const mockAddresses = [
  {
    id: "addr-1",
    label: "Home",
    address: "123 Main Street, Apt 4B",
    city: "San Francisco",
    state: "CA",
    zip: "94102",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Work",
    address: "456 Office Park Drive",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    isDefault: false,
  },
];

export default function PatientMedicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [showRefillDialog, setShowRefillDialog] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [selectedAddress, setSelectedAddress] = useState(mockAddresses[0].id);
  const [refillNote, setRefillNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const medication = mockMedicationDetail;

  const handleSubmitRefill = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    setShowRefillDialog(false);
    toast({
      title: "Refill Requested",
      description: `Your refill for ${medication.name} has been submitted successfully.`,
    });
    setLocation("/patient/orders");
  };

  return (
    <div className="space-y-6" data-testid="patient-medication-detail-page">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/patient/medications")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{medication.name}</h1>
          <p className="text-muted-foreground">
            {medication.dosage} - {medication.frequency}
          </p>
        </div>
      </div>

      {medication.aiPrediction && (
        <Card className="border-accent/50 bg-accent/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-accent/10 text-accent">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">AI Refill Reminder</h3>
                  <Badge variant="secondary" className="text-xs">Smart Prediction</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Based on your refill history, you may be running low on this medication.
                  We recommend requesting a refill now to avoid any gaps in your treatment.
                </p>
                <Button
                  size="sm"
                  onClick={() => setShowRefillDialog(true)}
                  data-testid="button-request-refill-banner"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Request Refill Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-clinical" />
                Medication Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Medication Name</p>
                  <p className="font-medium">{medication.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dosage</p>
                  <p className="font-medium">{medication.dosage}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Frequency</p>
                  <p className="font-medium">{medication.frequency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">{medication.quantity}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Instructions</p>
                <p className="text-foreground">{medication.instructions}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-info" />
                Prescription Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Prescription Number</p>
                  <p className="font-medium">{medication.prescriptionNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NDC</p>
                  <p className="font-medium">{medication.ndc}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Original Date</p>
                  <p className="font-medium">{medication.originalPrescribedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prescriber</p>
                  <p className="font-medium">{medication.prescriber}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-accent" />
                Refill Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Refill</span>
                <span className="font-medium">{medication.lastRefill}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Next Refill Due</span>
                <span className="font-medium">{medication.nextRefillDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Days Remaining</span>
                <Badge variant={medication.daysRemaining <= 7 ? "secondary" : "outline"}>
                  {medication.daysRemaining} days
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Refills Remaining</span>
                <span className="font-medium">
                  {medication.refillsRemaining} of {medication.totalRefills}
                </span>
              </div>

              {medication.refillEligible && (
                <Button
                  className="w-full mt-4"
                  onClick={() => setShowRefillDialog(true)}
                  data-testid="button-request-refill"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Request Refill
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-clinical" />
                Prescriber
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{medication.prescriber}</p>
              <p className="text-sm text-muted-foreground">{medication.prescriberPhone}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-info" />
                Pharmacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{medication.pharmacy}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showRefillDialog} onOpenChange={setShowRefillDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Refill</DialogTitle>
            <DialogDescription>
              Request a refill for {medication.name} {medication.dosage}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Delivery Method</Label>
              <RadioGroup
                value={deliveryMethod}
                onValueChange={(v) => setDeliveryMethod(v as "delivery" | "pickup")}
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover-elevate cursor-pointer">
                  <RadioGroupItem value="delivery" id="delivery" data-testid="radio-delivery" />
                  <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Truck className="w-4 h-4 text-info" />
                    <div>
                      <p className="font-medium">Home Delivery</p>
                      <p className="text-sm text-muted-foreground">Delivered to your address</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover-elevate cursor-pointer">
                  <RadioGroupItem value="pickup" id="pickup" data-testid="radio-pickup" />
                  <Label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Store className="w-4 h-4 text-clinical" />
                    <div>
                      <p className="font-medium">In-Store Pickup</p>
                      <p className="text-sm text-muted-foreground">Pick up at PharmaCare Plus</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {deliveryMethod === "delivery" && (
              <div className="space-y-3">
                <Label>Delivery Address</Label>
                <RadioGroup
                  value={selectedAddress}
                  onValueChange={setSelectedAddress}
                >
                  {mockAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="flex items-center space-x-2 p-3 rounded-lg border border-border hover-elevate cursor-pointer"
                    >
                      <RadioGroupItem value={addr.id} id={addr.id} data-testid={`radio-address-${addr.id}`} />
                      <Label htmlFor={addr.id} className="flex items-center gap-2 cursor-pointer flex-1">
                        {addr.label === "Home" ? (
                          <Home className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">{addr.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {addr.address}, {addr.city}, {addr.state} {addr.zip}
                          </p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="note">Additional Notes (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Any special instructions for this refill..."
                value={refillNote}
                onChange={(e) => setRefillNote(e.target.value)}
                data-testid="input-refill-note"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRefillDialog(false)}
              data-testid="button-cancel-refill"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRefill}
              disabled={isSubmitting}
              data-testid="button-submit-refill"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Refill Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
