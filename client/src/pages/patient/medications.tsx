import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common";
import {
  Calendar,
  Clock,
  Pill,
  RefreshCw,
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  History,
} from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  prescriber: string;
  lastRefill: string;
  nextRefillDate: string;
  daysRemaining: number;
  refillEligible: boolean;
  aiPrediction: boolean;
  status: "active" | "inactive";
  refillsRemaining: number;
  totalRefills: number;
}

const mockMedications: Medication[] = [
  {
    id: "med-1",
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    instructions: "Take with meals",
    prescriber: "Dr. Michael Chen",
    lastRefill: "Dec 15, 2025",
    nextRefillDate: "Jan 3, 2026",
    daysRemaining: 3,
    refillEligible: true,
    aiPrediction: true,
    status: "active",
    refillsRemaining: 5,
    totalRefills: 12,
  },
  {
    id: "med-2",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    instructions: "Take in the morning",
    prescriber: "Dr. Emily Park",
    lastRefill: "Dec 1, 2025",
    nextRefillDate: "Jan 15, 2026",
    daysRemaining: 15,
    refillEligible: false,
    aiPrediction: false,
    status: "active",
    refillsRemaining: 3,
    totalRefills: 6,
  },
  {
    id: "med-3",
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily at bedtime",
    instructions: "Take at bedtime for best results",
    prescriber: "Dr. Michael Chen",
    lastRefill: "Nov 20, 2025",
    nextRefillDate: "Jan 8, 2026",
    daysRemaining: 8,
    refillEligible: true,
    aiPrediction: false,
    status: "active",
    refillsRemaining: 2,
    totalRefills: 6,
  },
  {
    id: "med-4",
    name: "Omeprazole",
    dosage: "20mg",
    frequency: "Once daily before breakfast",
    instructions: "Take 30 minutes before first meal",
    prescriber: "Dr. Sarah Johnson",
    lastRefill: "Dec 10, 2025",
    nextRefillDate: "Jan 20, 2026",
    daysRemaining: 20,
    refillEligible: false,
    aiPrediction: false,
    status: "active",
    refillsRemaining: 4,
    totalRefills: 6,
  },
  {
    id: "med-5",
    name: "Amoxicillin",
    dosage: "250mg",
    frequency: "Three times daily",
    instructions: "Complete full course",
    prescriber: "Dr. Emily Park",
    lastRefill: "Oct 5, 2025",
    nextRefillDate: "-",
    daysRemaining: 0,
    refillEligible: false,
    aiPrediction: false,
    status: "inactive",
    refillsRemaining: 0,
    totalRefills: 1,
  },
];

export default function PatientMedicationsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  const filteredMedications = mockMedications.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.dosage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || med.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const medicationCounts = {
    all: mockMedications.length,
    active: mockMedications.filter((m) => m.status === "active").length,
    inactive: mockMedications.filter((m) => m.status === "inactive").length,
  };

  return (
    <div className="space-y-6" data-testid="patient-medications-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Medications</h1>
          <p className="text-muted-foreground">
            View and manage your prescriptions
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search medications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-medications"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-medications">
          <TabsTrigger value="active" data-testid="button-tab-active">
            Active ({medicationCounts.active})
          </TabsTrigger>
          <TabsTrigger value="inactive" data-testid="button-tab-inactive">
            Inactive ({medicationCounts.inactive})
          </TabsTrigger>
          <TabsTrigger value="all" data-testid="button-tab-all">
            All ({medicationCounts.all})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredMedications.length === 0 ? (
            <EmptyState
              icon="clipboard"
              title="No Medications Found"
              description={
                searchQuery
                  ? "Try adjusting your search"
                  : "Your medications will appear here"
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMedications.map((med) => (
                <Card
                  key={med.id}
                  className={`hover-elevate cursor-pointer ${
                    med.status === "inactive" ? "opacity-75" : ""
                  }`}
                  onClick={() => setLocation(`/patient/medications/${med.id}`)}
                  data-testid={`medication-card-${med.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-full ${
                          med.status === "active"
                            ? "bg-clinical/10 text-clinical"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Pill className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{med.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {med.dosage}
                          </Badge>
                          {med.aiPrediction && (
                            <Badge variant="secondary" className="text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Refill Suggested
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {med.frequency}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <History className="w-3 h-3" />
                            <span>Last: {med.lastRefill}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>Next: {med.nextRefillDate}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {med.status === "active" ? (
                              med.daysRemaining <= 7 ? (
                                <div className="flex items-center gap-1 text-amber-500">
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    {med.daysRemaining} days left
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-success">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-sm">
                                    {med.daysRemaining} days left
                                  </span>
                                </div>
                              )
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                Completed
                              </Badge>
                            )}
                          </div>
                          {med.refillEligible && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocation(`/patient/medications/${med.id}`);
                              }}
                              data-testid={`button-refill-${med.id}`}
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Refill
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
