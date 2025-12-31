import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [format, setFormat] = useState("xlsx");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);

  const handleGenerateReport = () => {
    toast({
      title: "Report Generation Started",
      description: "Your report is being generated. This may take a few moments.",
    });
    setTimeout(() => {
      toast({
        title: "Report Ready",
        description: "Your report has been generated successfully.",
      });
    }, 2000);
  };

  const handleDownload = (exportId: string) => {
    toast({
      title: "Download Started",
      description: "Your file is being downloaded.",
    });
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
        <TabsList>
          <TabsTrigger value="generate" data-testid="tab-generate">
            Generate Report
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date Range</Label>
                        <Select value={dateRange} onValueChange={setDateRange}>
                          <SelectTrigger data-testid="select-date-range">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="day">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">This Quarter</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Export Format</Label>
                        <Select value={format} onValueChange={setFormat}>
                          <SelectTrigger data-testid="select-format">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                            <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                            <SelectItem value="csv">CSV (.csv)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Include in Report</Label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="charts"
                            checked={includeCharts}
                            onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                          />
                          <label
                            htmlFor="charts"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Visual charts and graphs
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="rawdata"
                            checked={includeRawData}
                            onCheckedChange={(checked) => setIncludeRawData(checked as boolean)}
                          />
                          <label
                            htmlFor="rawdata"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Raw data tables
                          </label>
                        </div>
                      </div>
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
