import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Calendar,
  CheckCircle,
  Download,
  FileSpreadsheet,
  FileText,
  Package,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const reportTemplates = [
  {
    id: "inventory-summary",
    name: "Inventory Summary",
    description: "Stock levels, expiry risks, and reorder recommendations",
    icon: Package,
    category: "inventory",
  },
  {
    id: "operational-kpis",
    name: "Operational KPIs",
    description: "Volume trends, turnaround times, and SLA compliance",
    icon: BarChart3,
    category: "operations",
  },
  {
    id: "alert-history",
    name: "Alert History",
    description: "AI alerts, resolutions, and pattern analysis",
    icon: TrendingUp,
    category: "alerts",
  },
  {
    id: "staff-metrics",
    name: "Staff Metrics",
    description: "Aggregate performance signals and workload distribution",
    icon: Users,
    category: "staff",
  },
];

const recentExports = [
  {
    id: "exp-1",
    name: "Weekly Inventory Report",
    date: "Dec 30, 2025",
    format: "xlsx",
    size: "2.4 MB",
  },
  {
    id: "exp-2",
    name: "Monthly KPI Summary",
    date: "Dec 28, 2025",
    format: "pdf",
    size: "1.1 MB",
  },
  {
    id: "exp-3",
    name: "Q4 Alert Analysis",
    date: "Dec 25, 2025",
    format: "xlsx",
    size: "3.8 MB",
  },
];

export default function ManagerReportsPage() {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("week");


  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateInventoryReport = () => {
    const headers = ["ID", "Name", "SKU", "Current Stock", "Min Stock", "Status"];
    const rows = [
      ["INV-001", "Amoxicillin 500mg", "AMX-500", "240", "100", "OK"],
      ["INV-002", "Lisinopril 10mg", "LIS-10", "45", "80", "Low Stock"],
      ["INV-003", "Metformin 1000mg", "MET-1000", "320", "150", "OK"],
      ["INV-004", "Atorvastatin 20mg", "ATV-20", "180", "100", "OK"],
      ["INV-005", "Omeprazole 20mg", "OMP-20", "65", "80", "Low Stock"],
    ];
    return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
  };

  const generateOperationalKPIsReport = () => {
    const headers = ["Metric", "Value", "Target", "Status"];
    const rows = [
      ["Prescription Volume", "1450", "1200", "Exceeding"],
      ["Avg Fill Time", "12m", "15m", "On Track"],
      ["Error Rate", "0.2%", "0.5%", "Excellent"],
      ["Customer Satisfaction", "4.8/5", "4.5/5", "Exceeding"],
    ];
    return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
  };

  const generateAlertHistoryReport = () => {
    const headers = ["Date", "Type", "Message", "Status"];
    const rows = [
      ["2025-01-02", "Warning", "Low stock on key antibiotics", "Resolved"],
      ["2025-01-01", "Info", "System maintenance scheduled", "Completed"],
      ["2024-12-31", "Critical", "Compliance check failed", "Investigating"],
    ];
    return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
  };

  const generateStaffMetricsReport = () => {
    const headers = ["Staff Member", "Role", "Tasks Completed", "Efficiency Score"];
    const rows = [
      ["Sarah Chen", "Pharmacist", "45", "98%"],
      ["Mike Ross", "Tech", "52", "95%"],
      ["David Kim", "Pharmacist", "38", "99%"],
    ];
    return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
  };

  const handleGenerateReport = () => {
    if (!selectedReport) {
      toast({
        title: "No Report Selected",
        description: "Please select a report type to generate.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Report Generation Started",
      description: "Your report is being generated. This may take a few moments.",
    });

    setTimeout(() => {
      let content = "";
      let filename = `report-${Date.now()}.csv`;

      switch (selectedReport) {
        case "inventory-summary":
          content = generateInventoryReport();
          filename = `inventory-summary-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case "operational-kpis":
          content = generateOperationalKPIsReport();
          filename = `operational-kpis-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case "alert-history":
          content = generateAlertHistoryReport();
          filename = `alert-history-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case "staff-metrics":
          content = generateStaffMetricsReport();
          filename = `staff-metrics-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        default:
          content = "Metric,Value\nUnknown,0";
      }

      downloadCSV(content, filename);

      toast({
        title: "Report Ready",
        description: "Your report has been generated and downloaded successfully.",
      });
    }, 1500);
  };

  const handleDownload = (exportId: string) => {
    toast({
      title: "Download Started",
      description: "Your file is being downloaded.",
    });
    
    // Simulate download for historical items
    setTimeout(() => {
      const content = "Date,Export ID,Status\n2025-01-01," + exportId + ",Completed";
      downloadCSV(content, `export-${exportId}.csv`);
    }, 500);
  };

  return (
    <div className="space-y-6" data-testid="manager-reports-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Export</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Generate leadership-ready reports and data exports
          </p>
        </div>
      </div>

      <Tabs defaultValue="generate">
        <TabsList data-testid="tabs-reports">
          <TabsTrigger value="generate" data-testid="button-tab-generate">
            Generate Report
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="button-tab-history">
            Export History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Report Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedReport === template.id
                            ? "border-accent bg-accent/5"
                            : "border-border hover-elevate"
                        }`}
                        onClick={() => setSelectedReport(template.id)}
                        data-testid={`report-template-${template.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <template.icon className="w-5 h-5 text-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{template.name}</h3>
                              {selectedReport === template.id && (
                                <CheckCircle className="w-4 h-4 text-accent" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedReport && (
                <Card>
                  <CardHeader>
                    <CardTitle>Report Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Date Range</Label>
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger data-testid="button-select-date-range">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day" data-testid="option-day">Today</SelectItem>
                          <SelectItem value="week" data-testid="option-week">This Week</SelectItem>
                          <SelectItem value="month" data-testid="option-month">This Month</SelectItem>
                          <SelectItem value="quarter" data-testid="option-quarter">This Quarter</SelectItem>

                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleGenerateReport}
                      data-testid="button-generate-report"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Reports Generated</p>
                    <p className="text-2xl font-bold">47</p>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Data Exported</p>
                    <p className="text-2xl font-bold">2.8 GB</p>
                    <p className="text-xs text-muted-foreground">Total this quarter</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Most Popular</p>
                    <p className="font-medium">Operational KPIs</p>
                    <p className="text-xs text-muted-foreground">18 exports</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Exports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExports.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                    data-testid={`export-${exp.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        {exp.format === "xlsx" ? (
                          <FileSpreadsheet className="w-5 h-5 text-success" />
                        ) : (
                          <FileText className="w-5 h-5 text-danger" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{exp.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{exp.date}</span>
                          <span>•</span>
                          <span>{exp.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">.{exp.format}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(exp.id)}
                        data-testid={`button-download-${exp.id}`}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
