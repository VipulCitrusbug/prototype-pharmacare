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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  PillBottle,
  Shield,
  Sparkles,
  FileCheck,
  FilePlus,
  Printer,
  Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockReportTemplates = [
  {
    id: "rpt-001",
    name: "Controlled Substance Monitoring Summary",
    description: "Weekly overview of all controlled substance dispensing activity with AI-flagged anomalies",
    category: "monitoring",
    frequency: "Weekly",
    lastGenerated: "2025-12-29T10:00:00Z",
    format: "PDF",
  },
  {
    id: "rpt-002",
    name: "Flag Resolution History",
    description: "Complete history of AI flags, investigations, and resolutions for audit purposes",
    category: "flags",
    frequency: "Monthly",
    lastGenerated: "2025-12-01T08:00:00Z",
    format: "PDF",
  },
  {
    id: "rpt-003",
    name: "Refill Pattern Analysis",
    description: "Detailed analysis of refill intervals and early refill patterns across all controlled substances",
    category: "trends",
    frequency: "Monthly",
    lastGenerated: "2025-12-01T08:00:00Z",
    format: "PDF",
  },
  {
    id: "rpt-004",
    name: "Audit Trail Export",
    description: "Complete system audit log export for external compliance review or regulatory submission",
    category: "audit",
    frequency: "On-demand",
    lastGenerated: "2025-12-15T14:30:00Z",
    format: "CSV",
  },
  {
    id: "rpt-005",
    name: "Staff Activity Summary",
    description: "Aggregated activity patterns by staff role for compliance oversight",
    category: "audit",
    frequency: "Weekly",
    lastGenerated: "2025-12-29T10:00:00Z",
    format: "PDF",
  },
  {
    id: "rpt-006",
    name: "Regulatory Readiness Report",
    description: "Comprehensive report summarizing compliance posture for external audit preparation",
    category: "compliance",
    frequency: "Quarterly",
    lastGenerated: "2025-10-01T08:00:00Z",
    format: "PDF",
  },
];

const mockGeneratedReports = [
  {
    id: "gen-001",
    name: "Controlled Substance Monitoring Summary - Week 52",
    template: "Controlled Substance Monitoring Summary",
    generatedAt: "2025-12-29T10:00:00Z",
    generatedBy: "Compliance Officer",
    period: "Dec 23-29, 2025",
    size: "1.2 MB",
    status: "ready",
  },
  {
    id: "gen-002",
    name: "Flag Resolution History - December 2025",
    template: "Flag Resolution History",
    generatedAt: "2025-12-01T08:00:00Z",
    generatedBy: "Compliance Officer",
    period: "December 2025",
    size: "856 KB",
    status: "ready",
  },
  {
    id: "gen-003",
    name: "Audit Trail Export - Q4 2025",
    template: "Audit Trail Export",
    generatedAt: "2025-12-15T14:30:00Z",
    generatedBy: "System",
    period: "Oct-Dec 2025",
    size: "4.8 MB",
    status: "ready",
  },
  {
    id: "gen-004",
    name: "Staff Activity Summary - Week 51",
    template: "Staff Activity Summary",
    generatedAt: "2025-12-22T10:00:00Z",
    generatedBy: "Compliance Officer",
    period: "Dec 16-22, 2025",
    size: "678 KB",
    status: "ready",
  },
];

export default function ComplianceReportsPage() {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("last_7_days");
  const [reportCategory, setReportCategory] = useState("all");

  const handleGenerateReport = (templateId: string) => {
    toast({
      title: "Report Generation Started",
      description: "Your report is being generated. It will be available shortly.",
    });
  };

  const handleDownloadReport = (reportId: string) => {
    toast({
      title: "Download Started",
      description: "Your report download has begun.",
    });
  };

  const handleExportAll = () => {
    // Create CSV content with all report template data
    const headers = ["Template Name", "Description", "Category", "Frequency", "Format", "Last Generated"];
    const rows = mockReportTemplates.map(template => [
      template.name,
      template.description,
      template.category,
      template.frequency,
      template.format,
      new Date(template.lastGenerated).toLocaleDateString()
    ]);

    // Convert to CSV format
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `compliance-reports-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "All report templates have been exported successfully.",
    });
  };

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case "monitoring":
        return { color: "text-clinical", bg: "bg-clinical/10", icon: PillBottle };
      case "flags":
        return { color: "text-danger", bg: "bg-danger/10", icon: AlertTriangle };
      case "trends":
        return { color: "text-info", bg: "bg-info/10", icon: BarChart3 };
      case "audit":
        return { color: "text-amber-600 dark:text-amber-500", bg: "bg-amber-500/10", icon: Shield };
      case "compliance":
        return { color: "text-success", bg: "bg-success/10", icon: CheckCircle2 };
      default:
        return { color: "text-muted-foreground", bg: "bg-muted", icon: FileText };
    }
  };

  const filteredTemplates = mockReportTemplates.filter((template) => {
    if (reportCategory === "all") return true;
    return template.category === reportCategory;
  });

  return (
    <div className="space-y-6" data-testid="compliance-reports-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/compliance">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Compliance Reports</h1>
            <p className="text-muted-foreground">
              Generate and export audit-ready compliance documentation
            </p>
          </div>
        </div>
        <Button
          onClick={handleExportAll}
          className="bg-clinical hover:bg-clinical/90"
          data-testid="button-export-all"
        >
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-elevate" data-testid="card-reports-this-month">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-success/10">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground" data-testid="text-reports-count">23</p>
              <p className="text-sm text-muted-foreground">Reports This Month</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate" data-testid="card-last-report">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-clinical/10">
              <Clock className="w-6 h-6 text-clinical" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground" data-testid="text-last-report">2 days ago</p>
              <p className="text-sm text-muted-foreground">Last Report Generated</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate" data-testid="card-templates-count">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-info/10">
              <FileCheck className="w-6 h-6 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground" data-testid="text-templates-count">6</p>
              <p className="text-sm text-muted-foreground">Report Templates</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates" data-testid="tab-templates">
            <FilePlus className="w-4 h-4 mr-2" />
            Report Templates
          </TabsTrigger>
          <TabsTrigger value="generated" data-testid="tab-generated">
            <FileText className="w-4 h-4 mr-2" />
            Generated Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center gap-4">
            <Select value={reportCategory} onValueChange={setReportCategory}>
              <SelectTrigger className="w-[180px]" data-testid="select-category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
                <SelectItem value="flags">Flags</SelectItem>
                <SelectItem value="trends">Trends</SelectItem>
                <SelectItem value="audit">Audit</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]" data-testid="select-period">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                <SelectItem value="last_quarter">Last Quarter</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => {
              const categoryConfig = getCategoryConfig(template.category);
              const CategoryIcon = categoryConfig.icon;

              return (
                <Card key={template.id} data-testid={`template-${template.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${categoryConfig.bg}`}>
                          <CategoryIcon className={`w-5 h-5 ${categoryConfig.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="mt-1">{template.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {template.frequency}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {template.format}
                      </Badge>
                      <span className="ml-auto">
                        Last generated: {new Date(template.lastGenerated).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="generated" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>
                Previously generated reports available for download
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockGeneratedReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover-elevate"
                    data-testid={`report-${report.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{report.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>Period: {report.period}</span>
                          <span>Size: {report.size}</span>
                          <span>By: {report.generatedBy}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Ready
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadReport(report.id)}
                        data-testid={`button-download-${report.id}`}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        data-testid={`button-print-${report.id}`}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        data-testid={`button-email-${report.id}`}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Audit Preparation Tip</p>
                  <p className="text-xs text-muted-foreground">
                    For external audits, we recommend generating the "Regulatory Readiness Report" along with
                    the "Audit Trail Export" to provide comprehensive documentation of your compliance posture
                    and system activity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
