import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PrescriptionCard,
  PrescriptionCardSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/common";
import { Search, Filter, Sparkles, LayoutGrid, List } from "lucide-react";
import type { Prescription, PrescriptionStatusType } from "@shared/schema";

const mockPrescriptions: Prescription[] = [
  {
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
    status: "pending",
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
  },
  {
    id: "rx-002",
    patientId: "p-002",
    patientName: "James Wilson",
    prescriberId: "dr-002",
    prescriberName: "Dr. Emily Park",
    drugName: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    duration: "90 days",
    instructions: "Take in the morning",
    status: "pending",
    priority: "medium",
    isRefill: true,
    isDelivery: false,
    aiConfidence: 88,
    aiNotes: "Refill request, previous history available",
    pharmacistNotes: null,
    assignedPharmacistId: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60000),
    updatedAt: new Date(),
    dispensedAt: null,
  },
  {
    id: "rx-003",
    patientId: "p-003",
    patientName: "Maria Garcia",
    prescriberId: "dr-001",
    prescriberName: "Dr. Michael Chen",
    drugName: "Amoxicillin",
    dosage: "250mg",
    frequency: "Three times daily",
    duration: "7 days",
    instructions: "Complete full course",
    status: "in_review",
    priority: "critical",
    isRefill: false,
    isDelivery: true,
    aiConfidence: 92,
    aiNotes: "Antibiotic prescription, urgent",
    pharmacistNotes: null,
    assignedPharmacistId: null,
    createdAt: new Date(Date.now() - 15 * 60000),
    updatedAt: new Date(),
    dispensedAt: null,
  },
  {
    id: "rx-004",
    patientId: "p-004",
    patientName: "Robert Brown",
    prescriberId: "dr-003",
    prescriberName: "Dr. Lisa Wang",
    drugName: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily at bedtime",
    duration: "90 days",
    instructions: "Take at night for best results",
    status: "pending",
    priority: "low",
    isRefill: true,
    isDelivery: false,
    aiConfidence: 78,
    aiNotes: "Handwritten, some characters unclear",
    pharmacistNotes: null,
    assignedPharmacistId: null,
    createdAt: new Date(Date.now() - 4 * 60 * 60000),
    updatedAt: new Date(),
    dispensedAt: null,
  },
  {
    id: "rx-005",
    patientId: "p-005",
    patientName: "Emily Davis",
    prescriberId: "dr-002",
    prescriberName: "Dr. Emily Park",
    drugName: "Omeprazole",
    dosage: "20mg",
    frequency: "Once daily before breakfast",
    duration: "14 days",
    instructions: "Take 30 minutes before eating",
    status: "preparing",
    priority: "medium",
    isRefill: false,
    isDelivery: false,
    aiConfidence: 96,
    aiNotes: "Electronic prescription, all fields clear",
    pharmacistNotes: null,
    assignedPharmacistId: null,
    createdAt: new Date(Date.now() - 45 * 60000),
    updatedAt: new Date(),
    dispensedAt: null,
  },
  {
    id: "rx-006",
    patientId: "p-006",
    patientName: "David Kim",
    prescriberId: "dr-001",
    prescriberName: "Dr. Michael Chen",
    drugName: "Levothyroxine",
    dosage: "50mcg",
    frequency: "Once daily",
    duration: "90 days",
    instructions: "Take on empty stomach",
    status: "pending",
    priority: "high",
    isRefill: true,
    isDelivery: true,
    aiConfidence: 91,
    aiNotes: "Thyroid medication refill",
    pharmacistNotes: null,
    assignedPharmacistId: null,
    createdAt: new Date(Date.now() - 1 * 60 * 60000),
    updatedAt: new Date(),
    dispensedAt: null,
  },
];

type ViewMode = "grid" | "list";
type StatusFilter = "all" | PrescriptionStatusType;

export default function QueuePage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const prescriptionsQuery = useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions?status=pending,in_review,preparing"],
    staleTime: 30000,
  });

  const prescriptions = prescriptionsQuery.data || mockPrescriptions;

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const matchesSearch =
      searchQuery === "" ||
      rx.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.drugName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || rx.status === statusFilter;

    const matchesPriority =
      priorityFilter === "all" || rx.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSelectPrescription = (prescription: Prescription) => {
    setLocation(`/prescription/${prescription.id}`);
  };

  if (prescriptionsQuery.error) {
    return (
      <ErrorState
        title="Failed to load prescriptions"
        message="We couldn't load the prescription queue. Please try again."
        onRetry={() => prescriptionsQuery.refetch()}
      />
    );
  }

  const statusCounts = {
    all: prescriptions.length,
    pending: prescriptions.filter((p) => p.status === "pending").length,
    in_review: prescriptions.filter((p) => p.status === "in_review").length,
    preparing: prescriptions.filter((p) => p.status === "preparing").length,
  };

  return (
    <div className="space-y-6" data-testid="queue-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prescription Queue</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            AI-prioritized for optimal workflow
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            data-testid="button-view-grid"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            data-testid="button-view-list"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by patient name or medication..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-queue"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select
                value={priorityFilter}
                onValueChange={setPriorityFilter}
              >
                <SelectTrigger className="w-36" data-testid="select-priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as StatusFilter)}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" data-testid="tab-all">
            All ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending ({statusCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="in_review" data-testid="tab-in-review">
            In Review ({statusCounts.in_review})
          </TabsTrigger>
          <TabsTrigger value="preparing" data-testid="tab-preparing">
            Preparing ({statusCounts.preparing})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          {prescriptionsQuery.isLoading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-4"
              }
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <PrescriptionCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <EmptyState
              icon="clipboard"
              title="No prescriptions found"
              description={
                searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "All caught up! No prescriptions waiting in this queue."
              }
            />
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-4"
              }
            >
              {filteredPrescriptions.map((prescription) => (
                <PrescriptionCard
                  key={prescription.id}
                  prescription={prescription}
                  onSelect={handleSelectPrescription}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
