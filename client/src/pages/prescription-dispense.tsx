import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PageLoader, StatusBadge, PriorityIndicator } from "@/components/common";
import { 
  ArrowLeft, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle,
  Package,
  Pill,
  Calendar,
  Hash,
  Box
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
  status: "preparing",
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

interface InventoryItem {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate: Date;
  location: string;
  isExpiringSoon: boolean;
}

const mockInventory: InventoryItem[] = [
  {
    id: "inv-001",
    batchNumber: "MET-2024-001",
    quantity: 250,
    expiryDate: new Date("2026-08-15"),
    location: "Shelf A-12",
    isExpiringSoon: false,
  },
  {
    id: "inv-002",
    batchNumber: "MET-2024-002",
    quantity: 180,
    expiryDate: new Date("2025-03-20"),
    location: "Shelf A-13",
    isExpiringSoon: true,
  },
  {
    id: "inv-003",
    batchNumber: "MET-2023-015",
    quantity: 45,
    expiryDate: new Date("2025-01-30"),
    location: "Shelf A-11",
    isExpiringSoon: true,
  },
];

export default function PrescriptionDispensePage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [quantityToDispense, setQuantityToDispense] = useState("60");

  const prescriptionQuery = useQuery<Prescription>({
    queryKey: ["/api/prescriptions", params.id],
    staleTime: 30000,
  });

  const prescription = prescriptionQuery.data || mockPrescription;

  const dispenseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/prescriptions/${params.id}`, {
        status: "dispensed",
        dispensedAt: new Date().toISOString(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      toast({ title: "Medication dispensed", description: "Proceeding to documentation" });
      setLocation(`/prescription/${params.id}/document`);
    },
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getDaysUntilExpiry = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (prescriptionQuery.isLoading) {
    return <PageLoader text="Loading prescription..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="page-prescription-dispense">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation(`/prescription/${params.id}/validate`)} 
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Dispensing Preparation</h1>
          <p className="text-muted-foreground">
            Select inventory and prepare medication
          </p>
        </div>
        <StatusBadge status="preparing" />
        <PriorityIndicator priority={prescription.priority as any} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Select Inventory Batch
              </CardTitle>
              <CardDescription>
                Choose from available stock. Expiring items are highlighted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedBatch} onValueChange={setSelectedBatch}>
                <div className="space-y-3">
                  {mockInventory.map((item) => {
                    const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedBatch === item.id 
                            ? "border-primary bg-primary/5" 
                            : item.isExpiringSoon 
                            ? "border-amber bg-amber/5" 
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedBatch(item.id)}
                        data-testid={`batch-${item.id}`}
                      >
                        <div className="flex items-start gap-4">
                          <RadioGroupItem value={item.id} id={item.id} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <Label htmlFor={item.id} className="font-medium cursor-pointer">
                                Batch: {item.batchNumber}
                              </Label>
                              {item.isExpiringSoon && (
                                <Badge variant="secondary" className="text-amber border-amber">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Expires in {daysUntilExpiry} days
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-muted-foreground" />
                                <span>{item.quantity} units available</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>Exp: {formatDate(item.expiryDate)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Box className="w-4 h-4 text-muted-foreground" />
                                <span>{item.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dispensing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity to Dispense</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantityToDispense}
                    onChange={(e) => setQuantityToDispense(e.target.value)}
                    data-testid="input-quantity"
                  />
                  <p className="text-xs text-muted-foreground">
                    Based on {prescription.frequency} for {prescription.duration}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input value="Tablets" readOnly className="bg-muted" />
                </div>
              </div>
              
              {mockInventory.find(i => i.isExpiringSoon && i.id === selectedBatch) && (
                <div className="p-4 rounded-lg bg-amber/10 border border-amber/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber mt-0.5" />
                    <div>
                      <p className="font-medium text-amber">Expiring Stock Selected</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        This batch is expiring soon. Consider using FIFO (First In, First Out) 
                        to minimize waste if appropriate for the prescription duration.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Medication Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Drug Name</p>
                <p className="font-medium">{prescription.drugName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dosage</p>
                <p className="font-medium">{prescription.dosage}</p>
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
                <p className="text-sm text-muted-foreground">Instructions</p>
                <p className="font-medium">{prescription.instructions}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patient Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Patient Name</p>
                <p className="font-medium">{prescription.patientName}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {prescription.isDelivery && (
                  <Badge variant="outline">Delivery Order</Badge>
                )}
                {prescription.isRefill && (
                  <Badge variant="secondary">Refill</Badge>
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
            onClick={() => setLocation(`/prescription/${params.id}/validate`)} 
            data-testid="button-back-validate"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Validation
          </Button>
          <Button 
            variant="default"
            onClick={() => dispenseMutation.mutate()}
            disabled={!selectedBatch || dispenseMutation.isPending}
            data-testid="button-dispense"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirm Dispensing
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
