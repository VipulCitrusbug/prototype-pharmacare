import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AIAssistBadge } from "@/components/common";
import {
  AlertTriangle,
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Clock,
  PillBottle,
  TrendingUp,
  Calendar,
  User,
  ChevronRight,
  Sparkles,
} from "lucide-react";

type FlagStatus = "all" | "new" | "under_review" | "resolved" | "escalated";
type FlagSeverity = "all" | "high" | "medium" | "low";
type FlagType = "all" | "volume_anomaly" | "refill_frequency" | "pattern_deviation" | "staff_signal";

const mockFlags = [
  {
    id: "flg-001",
    type: "volume_anomaly",
    title: "Unusual Dispensing Volume Detected",
    description: "Oxycodone 30mg dispensing volume is 42% above the 30-day rolling average",
    medication: "Oxycodone 30mg",
    category: "Schedule II",
    severity: "high",
    timeFrame: "Dec 24-30, 2025",
    deviation: "+42% from baseline",
    status: "new",
    createdAt: "2025-12-30T14:30:00Z",
    evidenceCount: 12,
  },
  {
    id: "flg-002",
    type: "refill_frequency",
    title: "Abnormal Refill Pattern Detected",
    description: "Multiple early refill requests for Alprazolam across different patient profiles",
    medication: "Alprazolam 2mg",
    category: "Schedule IV",
    severity: "medium",
    timeFrame: "Dec 15-30, 2025",
    deviation: "3 early refills detected",
    status: "new",
    createdAt: "2025-12-29T09:15:00Z",
    evidenceCount: 8,
  },
  {
    id: "flg-003",
    type: "pattern_deviation",
    title: "Shift Pattern Deviation",
    description: "Evening shift controlled substance volume 18% higher than historical average",
    medication: "Multiple Controlled",
    category: "Various",
    severity: "low",
    timeFrame: "Dec 20-30, 2025",
    deviation: "+18% evening volume",
    status: "under_review",
    createdAt: "2025-12-28T16:45:00Z",
    evidenceCount: 5,
    reviewer: "Compliance Officer",
  },
  {
    id: "flg-004",
    type: "volume_anomaly",
    title: "Adderall Dispensing Spike",
    description: "Week-over-week increase in Adderall prescriptions exceeds normal variance",
    medication: "Adderall 20mg",
    category: "Schedule II",
    severity: "medium",
    timeFrame: "Dec 23-29, 2025",
    deviation: "+28% WoW increase",
    status: "new",
    createdAt: "2025-12-28T11:20:00Z",
    evidenceCount: 6,
  },
  {
    id: "flg-005",
    type: "refill_frequency",
    title: "Zolpidem Refill Interval Anomaly",
    description: "Patient cohort showing shorter-than-expected refill intervals",
    medication: "Zolpidem 10mg",
    category: "Schedule IV",
    severity: "low",
    timeFrame: "Dec 1-30, 2025",
    deviation: "Avg 22 days vs 28 expected",
    status: "resolved",
    createdAt: "2025-12-15T08:30:00Z",
    evidenceCount: 4,
    resolution: "Explained - seasonal pattern confirmed",
  },
  {
    id: "flg-006",
    type: "staff_signal",
    title: "Aggregated Staff Pattern Signal",
    description: "Statistical variance detected in controlled substance handling during specific periods",
    medication: "Various Schedule II",
    category: "Schedule II",
    severity: "medium",
    timeFrame: "Dec 10-30, 2025",
    deviation: "Pattern deviation detected",
    status: "escalated",
    createdAt: "2025-12-20T13:00:00Z",
    evidenceCount: 15,
    escalatedTo: "Internal Review Committee",
  },
];

export default function ComplianceFlagsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FlagStatus>("all");
  const [severityFilter, setSeverityFilter] = useState<FlagSeverity>("all");
  const [typeFilter, setTypeFilter] = useState<FlagType>("all");

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "high":
        return { color: "text-danger", bg: "bg-danger/10", label: "High" };
      case "medium":
        return { color: "text-amber-600 dark:text-amber-500", bg: "bg-amber-500/10", label: "Medium" };
      case "low":
        return { color: "text-info", bg: "bg-info/10", label: "Low" };
      default:
        return { color: "text-muted-foreground", bg: "bg-muted", label: "Unknown" };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "new":
        return { color: "text-danger", bg: "bg-danger/10", label: "New" };
      case "under_review":
        return { color: "text-amber-600 dark:text-amber-500", bg: "bg-amber-500/10", label: "Under Review" };
      case "resolved":
        return { color: "text-success", bg: "bg-success/10", label: "Resolved" };
      case "escalated":
        return { color: "text-clinical", bg: "bg-clinical/10", label: "Escalated" };
      default:
        return { color: "text-muted-foreground", bg: "bg-muted", label: "Unknown" };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "volume_anomaly":
        return "Volume Anomaly";
      case "refill_frequency":
        return "Refill Frequency";
      case "pattern_deviation":
        return "Pattern Deviation";
      case "staff_signal":
        return "Staff Signal";
      default:
        return type;
    }
  };

  const filteredFlags = mockFlags.filter((flag) => {
    const matchesSearch =
      flag.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.medication.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || flag.status === statusFilter;
    const matchesSeverity = severityFilter === "all" || flag.severity === severityFilter;
    const matchesType = typeFilter === "all" || flag.type === typeFilter;
    return matchesSearch && matchesStatus && matchesSeverity && matchesType;
  });

  const flagCounts = {
    total: mockFlags.length,
    new: mockFlags.filter((f) => f.status === "new").length,
    under_review: mockFlags.filter((f) => f.status === "under_review").length,
    resolved: mockFlags.filter((f) => f.status === "resolved").length,
    escalated: mockFlags.filter((f) => f.status === "escalated").length,
  };

  return (
    <div className="space-y-6" data-testid="compliance-flags-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/compliance">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Monitoring Flags</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Review and investigate AI-detected compliance anomalies
            </p>
          </div>
        </div>
        <AIAssistBadge confidence={94} showLabel />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card 
          className={`hover-elevate cursor-pointer ${statusFilter === "all" ? "ring-2 ring-clinical" : ""}`}
          onClick={() => setStatusFilter("all")}
          data-testid="card-filter-all"
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground" data-testid="text-total-count">{flagCounts.total}</div>
            <p className="text-xs text-muted-foreground">Total Flags</p>
          </CardContent>
        </Card>
        <Card 
          className={`hover-elevate cursor-pointer ${statusFilter === "new" ? "ring-2 ring-danger" : ""}`}
          onClick={() => setStatusFilter("new")}
          data-testid="card-filter-new"
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-danger" data-testid="text-new-count">{flagCounts.new}</div>
            <p className="text-xs text-muted-foreground">New</p>
          </CardContent>
        </Card>
        <Card 
          className={`hover-elevate cursor-pointer ${statusFilter === "under_review" ? "ring-2 ring-amber-500" : ""}`}
          onClick={() => setStatusFilter("under_review")}
          data-testid="card-filter-review"
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-500" data-testid="text-review-count">{flagCounts.under_review}</div>
            <p className="text-xs text-muted-foreground">Under Review</p>
          </CardContent>
        </Card>
        <Card 
          className={`hover-elevate cursor-pointer ${statusFilter === "resolved" ? "ring-2 ring-success" : ""}`}
          onClick={() => setStatusFilter("resolved")}
          data-testid="card-filter-resolved"
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success" data-testid="text-resolved-count">{flagCounts.resolved}</div>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
        <Card 
          className={`hover-elevate cursor-pointer ${statusFilter === "escalated" ? "ring-2 ring-clinical" : ""}`}
          onClick={() => setStatusFilter("escalated")}
          data-testid="card-filter-escalated"
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-clinical" data-testid="text-escalated-count">{flagCounts.escalated}</div>
            <p className="text-xs text-muted-foreground">Escalated</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search flags by medication, title, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-flags"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as FlagSeverity)}>
                <SelectTrigger className="w-[130px]" data-testid="select-severity">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FlagType)}>
                <SelectTrigger className="w-[160px]" data-testid="select-type">
                  <SelectValue placeholder="Flag Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="volume_anomaly">Volume Anomaly</SelectItem>
                  <SelectItem value="refill_frequency">Refill Frequency</SelectItem>
                  <SelectItem value="pattern_deviation">Pattern Deviation</SelectItem>
                  <SelectItem value="staff_signal">Staff Signal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredFlags.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No flags match your current filters</p>
              </div>
            ) : (
              filteredFlags.map((flag) => {
                const severityConfig = getSeverityConfig(flag.severity);
                const statusConfig = getStatusConfig(flag.status);

                return (
                  <Link 
                    key={flag.id} 
                    href={`/compliance/flags/${flag.id}`}
                    data-testid={`flag-row-${flag.id}`}
                  >
                    <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border hover-elevate">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground">{flag.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(flag.type)}
                          </Badge>
                          <Badge variant="secondary" className={`text-xs ${severityConfig.bg} ${severityConfig.color}`}>
                            {severityConfig.label}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${statusConfig.color}`}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{flag.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <PillBottle className="w-3 h-3" />
                            {flag.medication}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {flag.timeFrame}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {flag.deviation}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {flag.evidenceCount} evidence items
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-4" />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
