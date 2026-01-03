import { useState } from "react";
import { Link } from "wouter";
import {
  FileText,
  ArrowLeft,
  Download,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Activity,
  Settings,
  DollarSign,
  Shield,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";

interface AuditLog {
  id: string;
  action: string;
  target: string;
  targetType: "pricing" | "user" | "integration" | "system";
  user: string;
  previousValue: string | null;
  newValue: string | null;
  timestamp: string;
  ipAddress: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: "pricing" | "audit" | "ai" | "system";
  frequency: string;
  lastGenerated: string;
  format: "PDF" | "CSV" | "Excel";
}

const mockAuditLogs: AuditLog[] = [
  {
    id: "log-001",
    action: "Rule Updated",
    target: "Generic Medication Discount",
    targetType: "pricing",
    user: "Admin Sarah",
    previousValue: "10%",
    newValue: "15%",
    timestamp: "2025-12-31T11:30:00Z",
    ipAddress: "192.168.1.100",
  },
  {
    id: "log-002",
    action: "Rule Disabled",
    target: "Seasonal Promo Q4",
    targetType: "pricing",
    user: "Admin John",
    previousValue: "Active",
    newValue: "Inactive",
    timestamp: "2025-12-30T16:45:00Z",
    ipAddress: "192.168.1.101",
  },
  {
    id: "log-003",
    action: "Rule Created",
    target: "Loyalty Program Tier 3",
    targetType: "pricing",
    user: "Admin Sarah",
    previousValue: null,
    newValue: "5% discount",
    timestamp: "2025-12-29T09:20:00Z",
    ipAddress: "192.168.1.100",
  },
  {
    id: "log-004",
    action: "AI Recommendation Applied",
    target: "Consolidate Senior Discounts",
    targetType: "system",
    user: "Admin Sarah",
    previousValue: "3 rules",
    newValue: "1 unified rule",
    timestamp: "2025-12-28T14:15:00Z",
    ipAddress: "192.168.1.100",
  },
  {
    id: "log-005",
    action: "Integration Reviewed",
    target: "Payment Gateway",
    targetType: "integration",
    user: "Admin John",
    previousValue: null,
    newValue: "Status check completed",
    timestamp: "2025-12-27T10:30:00Z",
    ipAddress: "192.168.1.101",
  },
];

const mockReportTemplates: ReportTemplate[] = [
  {
    id: "rpt-001",
    name: "Pricing Rule Inventory",
    description: "Complete list of all active and inactive pricing rules",
    category: "pricing",
    frequency: "Weekly",
    lastGenerated: "2025-12-28T08:00:00Z",
    format: "Excel",
  },
  {
    id: "rpt-002",
    name: "Configuration Change History",
    description: "Detailed log of all configuration modifications",
    category: "audit",
    frequency: "Daily",
    lastGenerated: "2025-12-31T00:00:00Z",
    format: "PDF",
  },
  {
    id: "rpt-003",
    name: "AI Recommendation Summary",
    description: "Summary of AI-generated suggestions and their outcomes",
    category: "ai",
    frequency: "Monthly",
    lastGenerated: "2025-12-01T08:00:00Z",
    format: "PDF",
  },
  {
    id: "rpt-004",
    name: "System Health Report",
    description: "Integration uptime and performance metrics",
    category: "system",
    frequency: "Weekly",
    lastGenerated: "2025-12-28T08:00:00Z",
    format: "PDF",
  },
  {
    id: "rpt-005",
    name: "Rule Usage Analytics",
    description: "Which pricing rules are triggered most frequently",
    category: "pricing",
    frequency: "Monthly",
    lastGenerated: "2025-12-01T08:00:00Z",
    format: "CSV",
  },
];

export default function AdminReportsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7d");

  const getTargetTypeConfig = (type: string) => {
    switch (type) {
      case "pricing":
        return { icon: DollarSign, color: "text-clinical", bg: "bg-clinical/10" };
      case "user":
        return { icon: User, color: "text-info", bg: "bg-info/10" };
      case "integration":
        return { icon: Activity, color: "text-success", bg: "bg-success/10" };
      case "system":
        return { icon: Settings, color: "text-accent", bg: "bg-accent/10" };
      default:
        return { icon: FileText, color: "text-muted-foreground", bg: "bg-muted" };
    }
  };

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case "pricing":
        return { icon: DollarSign, color: "text-clinical", bg: "bg-clinical/10" };
      case "audit":
        return { icon: Shield, color: "text-info", bg: "bg-info/10" };
      case "ai":
        return { icon: Sparkles, color: "text-accent", bg: "bg-accent/10" };
      case "system":
        return { icon: Activity, color: "text-success", bg: "bg-success/10" };
      default:
        return { icon: FileText, color: "text-muted-foreground", bg: "bg-muted" };
    }
  };

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch = log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "all" || log.targetType === actionFilter;
    
    let matchesDate = true;
    const now = new Date();
    const logDate = new Date(log.timestamp);
    const diffTime = Math.abs(now.getTime() - logDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (dateRange === "24h") {
      matchesDate = diffTime <= (24 * 60 * 60 * 1000);
    } else if (dateRange === "7d") {
      matchesDate = diffDays <= 7;
    } else if (dateRange === "30d") {
      matchesDate = diffDays <= 30;
    } else if (dateRange === "90d") {
      matchesDate = diffDays <= 90;
    }

    return matchesSearch && matchesAction && matchesDate;
  });

  const handleGenerateReport = (template: ReportTemplate) => {
    toast({
      title: "Downloading Report",
      description: `Generating ${template.name}...`,
    });

    if (template.format === "CSV" || template.format === "Excel") {
      // Generate CSV/Excel content
      let content = "";
      if (template.id === "rpt-001") { // Pricing Rule Inventory
        content = "Rule ID,Name,Status,Discount Value,Created By\nPR-001,Generic Discount,Active,15%,Admin Sarah\nPR-002,Senior Discount,Active,10%,Admin John";
      } else if (template.id === "rpt-005") { // Rule Usage Analytics
        content = "Rule Name,Trigger Count,Total Savings,Last Triggered\nGeneric Discount,1450,$5200.00,2025-01-02\nSenior Discount,890,$1200.50,2025-01-03";
      }
      
      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${template.name.replace(/\s+/g, "_")}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (template.format === "PDF") {
      // Generate PDF content
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(template.name, 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      
      if (template.id === "rpt-002") { // Config Change History
        let yPos = 40;
        doc.text("Date | Action | Target | User", 14, yPos);
        yPos += 10;
        mockAuditLogs.forEach(log => {
          const date = new Date(log.timestamp).toLocaleDateString();
          doc.text(`${date} | ${log.action} | ${log.target} | ${log.user}`, 14, yPos);
          yPos += 10;
        });
      } else if (template.id === "rpt-003") { // AI Summary
        doc.text("AI Recommendation Impact Summary", 14, 45);
        doc.text("1. Consolidate Senior Discounts - Implementation Success: 100%", 14, 55);
        doc.text("2. Inventory Overstock Alert - Cost Savings: $4,500", 14, 65);
      } else if (template.id === "rpt-004") { // System Health
        doc.text("System Uptime Report", 14, 45);
        doc.text("Payment Gateway: 99.99%", 14, 55);
        doc.text("Claims Database: 99.95%", 14, 65);
        doc.text("Reporting Engine: 100.00%", 14, 75);
      }
      
      doc.save(`${template.name.replace(/\s+/g, "_")}.pdf`);
    }
  };



  return (
    <div className="space-y-6" data-testid="admin-reports-page">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/admin">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Audit Logs</h1>
            <p className="text-muted-foreground">
              Configuration history and compliance reporting
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="audit" className="space-y-6">
        <TabsList data-testid="tabs-reports">
          <TabsTrigger value="audit" data-testid="tab-audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports">Report Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card data-testid="card-total-actions">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Actions (30d)</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-actions">156</p>
                  </div>
                  <Activity className="w-8 h-8 text-clinical" />
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-config-changes">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Config Changes</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-config-changes">24</p>
                  </div>
                  <Settings className="w-8 h-8 text-info" />
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-active-admins">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Admins</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-active-admins">3</p>
                  </div>
                  <User className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Configuration Audit Trail</CardTitle>
                  <CardDescription>
                    Complete history of all administrative actions
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-48"
                      data-testid="input-search"
                    />
                  </div>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="w-36" data-testid="select-action-filter">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="pricing">Pricing</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-32" data-testid="select-date-range">
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>

                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No audit logs match your filters</p>
                  </div>
                ) : (
                  filteredLogs.map((log) => {
                    const typeConfig = getTargetTypeConfig(log.targetType);
                    const TypeIcon = typeConfig.icon;

                    return (
                      <div
                        key={log.id}
                        className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border"
                        data-testid={`audit-log-${log.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${typeConfig.bg}`}>
                            <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{log.action}</span>
                              <Badge variant="outline" className="text-xs">
                                {log.targetType}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{log.target}</p>
                            {(log.previousValue || log.newValue) && (
                              <div className="flex items-center gap-2 text-xs">
                                {log.previousValue && (
                                  <span className="text-muted-foreground line-through">{log.previousValue}</span>
                                )}
                                {log.previousValue && log.newValue && (
                                  <span className="text-muted-foreground">→</span>
                                )}
                                {log.newValue && (
                                  <span className="text-success">{log.newValue}</span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {log.user}
                              </span>
                              <span>IP: {log.ipAddress}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Report Templates</CardTitle>
                  <CardDescription>
                    Generate and export configuration reports
                  </CardDescription>
                </div>
                <Badge variant="outline">{mockReportTemplates.length} templates</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockReportTemplates.map((template) => {
                  const categoryConfig = getCategoryConfig(template.category);
                  const CategoryIcon = categoryConfig.icon;

                  return (
                    <Card key={template.id} data-testid={`report-template-${template.id}`}>
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
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {template.frequency}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {template.format}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleGenerateReport(template)}
                            data-testid={`button-generate-${template.id}`}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Generate
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          Last generated: {new Date(template.lastGenerated).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
