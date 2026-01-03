import { useState } from "react";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AIAssistBadge } from "@/components/common";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  PillBottle,
  TrendingUp,
  Calendar,
  Eye,
  Sparkles,
  FileText,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  User,
  Shield,
  Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockFlagDetail = {
  id: "flg-001",
  type: "volume_anomaly",
  title: "Unusual Dispensing Volume Detected",
  description: "Oxycodone 30mg dispensing volume is 42% above the 30-day rolling average. This pattern was detected through automated AI monitoring of controlled substance dispensing activity. The deviation is statistically significant and warrants compliance review.",
  medication: "Oxycodone 30mg",
  category: "Schedule II",
  severity: "high",
  timeFrame: "Dec 24-30, 2025",
  deviation: "+42% from baseline",
  status: "new",
  createdAt: "2025-12-30T14:30:00Z",
  baselineVolume: 110,
  currentVolume: 156,
  percentChange: 42,
  evidenceItems: [
    {
      id: "ev-001",
      type: "dispensing_record",
      title: "Daily Dispensing Volume - Dec 30",
      value: "28 units",
      baseline: "18 units avg",
      timestamp: "2025-12-30T23:59:00Z",
    },
    {
      id: "ev-002",
      type: "dispensing_record",
      title: "Daily Dispensing Volume - Dec 29",
      value: "32 units",
      baseline: "18 units avg",
      timestamp: "2025-12-29T23:59:00Z",
    },
    {
      id: "ev-003",
      type: "dispensing_record",
      title: "Daily Dispensing Volume - Dec 28",
      value: "24 units",
      baseline: "18 units avg",
      timestamp: "2025-12-28T23:59:00Z",
    },
    {
      id: "ev-004",
      type: "trend_analysis",
      title: "Week-over-Week Trend",
      value: "Increasing pattern",
      baseline: "Stable expected",
      timestamp: "2025-12-30T12:00:00Z",
    },
    {
      id: "ev-005",
      type: "prescription_count",
      title: "Unique Prescriptions - Dec 24-30",
      value: "47 prescriptions",
      baseline: "32 avg weekly",
      timestamp: "2025-12-30T14:30:00Z",
    },
  ],
  trendData: [
    { period: "Week 1", baseline: 110, actual: 108 },
    { period: "Week 2", baseline: 110, actual: 115 },
    { period: "Week 3", baseline: 110, actual: 128 },
    { period: "Week 4", baseline: 110, actual: 156 },
  ],
  relatedAuditLogs: [
    {
      id: "log-001",
      action: "Prescription Dispensed",
      user: "RPh John Smith",
      timestamp: "2025-12-30T16:45:00Z",
      details: "Oxycodone 30mg #60",
    },
    {
      id: "log-002",
      action: "Prescription Dispensed",
      user: "RPh Sarah Johnson",
      timestamp: "2025-12-30T14:22:00Z",
      details: "Oxycodone 30mg #90",
    },
    {
      id: "log-003",
      action: "Prescription Dispensed",
      user: "RPh John Smith",
      timestamp: "2025-12-30T11:15:00Z",
      details: "Oxycodone 30mg #60",
    },
  ],
  notes: [],
};

export default function ComplianceFlagDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [decision, setDecision] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [showAllEvidence, setShowAllEvidence] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [savedResolutions, setSavedResolutions] = useState<Array<{
    decision: string;
    notes: string;
    timestamp: string;
  }>>([]);

  const flag = mockFlagDetail;

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
        return { color: "text-danger", bg: "bg-danger/10", label: "New", icon: AlertCircle };
      case "under_review":
        return { color: "text-amber-600 dark:text-amber-500", bg: "bg-amber-500/10", label: "Under Review", icon: Clock };
      case "resolved":
        return { color: "text-success", bg: "bg-success/10", label: "Resolved", icon: CheckCircle2 };
      case "escalated":
        return { color: "text-clinical", bg: "bg-clinical/10", label: "Escalated", icon: AlertTriangle };
      default:
        return { color: "text-muted-foreground", bg: "bg-muted", label: "Unknown", icon: AlertCircle };
    }
  };

  const severityConfig = getSeverityConfig(flag.severity);
  const statusConfig = getStatusConfig(flag.status);
  const StatusIcon = statusConfig.icon;

  const visibleEvidence = showAllEvidence ? flag.evidenceItems : flag.evidenceItems.slice(0, 3);
  const visibleLogs = showAllLogs ? flag.relatedAuditLogs : flag.relatedAuditLogs.slice(0, 3);

  const handleSaveDecision = () => {
    console.log("Save Decision clicked", { decision, notes });

    if (!decision) {
      toast({
        title: "Decision Required",
        description: "Please select a decision before saving.",
        variant: "destructive",
      });
      return;
    }

    // Save the resolution
    const resolution = {
      decision,
      notes,
      timestamp: new Date().toISOString(),
    };

    console.log("Saving resolution:", resolution);
    setSavedResolutions(prev => [...prev, resolution]);
    console.log("Resolution saved to state");

    // Clear the form
    setDecision("");
    setNotes("");

    toast({
      title: "Decision Saved",
      description: `Flag marked as "${decision}" with notes recorded.`,
    });
  };

  return (
    <div className="space-y-6" data-testid="compliance-flag-detail-page">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/compliance/flags">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-bold text-foreground">{flag.title}</h1>
              <Badge variant="secondary" className={`${severityConfig.bg} ${severityConfig.color}`}>
                {severityConfig.label} Severity
              </Badge>
              <Badge variant="outline" className={`${statusConfig.color}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              AI-detected anomaly for compliance review
            </p>
          </div>
        </div>
        <AIAssistBadge confidence={94} showLabel />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-danger" />
                Anomaly Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4">{flag.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Medication</p>
                  <p className="font-medium text-foreground flex items-center gap-1">
                    <PillBottle className="w-3 h-3" />
                    {flag.medication}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="font-medium text-foreground">{flag.category}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Time Frame</p>
                  <p className="font-medium text-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {flag.timeFrame}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Deviation</p>
                  <p className="font-medium text-danger flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {flag.deviation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-clinical" />
                  Trend Comparison
                </CardTitle>
              </div>
              <CardDescription>
                Baseline vs actual dispensing volume over the monitoring period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {flag.trendData.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">{item.period}</span>
                      <span className="font-medium">
                        {item.actual} units
                        {item.actual > item.baseline && (
                          <span className="text-danger ml-2">
                            (+{Math.round(((item.actual - item.baseline) / item.baseline) * 100)}%)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-muted-foreground/30 absolute"
                        style={{ width: `${(item.baseline / 180) * 100}%` }}
                      />
                      <div
                        className={`h-full rounded-full ${item.actual > item.baseline * 1.1 ? "bg-danger" : "bg-clinical"}`}
                        style={{ width: `${(item.actual / 180) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-muted-foreground/30 rounded" />
                    Baseline ({flag.baselineVolume} units)
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-clinical rounded" />
                    Actual Volume
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-danger rounded" />
                    Above Threshold
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-accent" />
                  Supporting Evidence
                </CardTitle>
                <Badge variant="secondary">{flag.evidenceItems.length} items</Badge>
              </div>
              <CardDescription>
                Read-only evidence supporting this AI flag
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {visibleEvidence.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border"
                    data-testid={`evidence-item-${item.id}`}
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Recorded: {item.value}</span>
                        <span>Baseline: {item.baseline}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              {flag.evidenceItems.length > 3 && (
                <Button
                  variant="ghost"
                  className="w-full mt-3"
                  onClick={() => setShowAllEvidence(!showAllEvidence)}
                  data-testid="button-toggle-evidence"
                >
                  {showAllEvidence ? (
                    <>
                      Show Less <ChevronUp className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Show All ({flag.evidenceItems.length}) <ChevronDown className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-info" />
                  Related Audit Logs
                </CardTitle>
                <Badge variant="outline">Read-only</Badge>
              </div>
              <CardDescription>
                System audit trail related to this flag period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {visibleLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border"
                    data-testid={`audit-log-${log.id}`}
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{log.action}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.user}
                        </span>
                        <span>{log.details}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              {flag.relatedAuditLogs.length > 3 && (
                <Button
                  variant="ghost"
                  className="w-full mt-3"
                  onClick={() => setShowAllLogs(!showAllLogs)}
                  data-testid="button-toggle-logs"
                >
                  {showAllLogs ? (
                    <>
                      Show Less <ChevronUp className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      View Full Audit Trail <ChevronDown className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-clinical" />
                Flag Resolution
              </CardTitle>
              <CardDescription>
                Document your investigation outcome
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Decision</label>
                <Select value={decision} onValueChange={setDecision}>
                  <SelectTrigger data-testid="select-decision">
                    <SelectValue placeholder="Select decision..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="explained">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        Explained / No Issue
                      </span>
                    </SelectItem>
                    <SelectItem value="follow_up">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        Needs Follow-Up
                      </span>
                    </SelectItem>
                    <SelectItem value="escalated">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-danger" />
                        Escalate for Internal Review
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Investigation Notes</label>
                <Textarea
                  placeholder="Document your findings, observations, and any relevant context..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                  data-testid="textarea-notes"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSaveDecision}
                data-testid="button-save-decision"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Decision
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Flag Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-danger rounded-full" />
                    <div className="w-0.5 h-full bg-border" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">Flag Created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(flag.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      AI detected unusual pattern
                    </p>
                  </div>
                </div>
                {savedResolutions.length > 0 ? (
                  savedResolutions.map((resolution, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-success rounded-full" />
                        {index < savedResolutions.length - 1 && <div className="w-0.5 h-full bg-border" />}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium">Resolution Added</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(resolution.timestamp).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Decision: {resolution.decision === "explained" ? "Explained / No Issue" : resolution.decision === "follow_up" ? "Needs Follow-Up" : "Escalate for Internal Review"}
                        </p>
                        {resolution.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Notes: {resolution.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                      <p className="text-xs text-muted-foreground">
                        Awaiting compliance officer action
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">AI Guidance</p>
                  <p className="text-xs text-muted-foreground">
                    This flag represents a statistically significant deviation. Consider reviewing
                    prescriber patterns and patient profiles for the affected time period.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
