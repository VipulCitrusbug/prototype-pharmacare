import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  FileText,
  Download,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";

interface ReportItem {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly" | "custom";
  lastGenerated: Date;
  category: string;
}

const mockReports: ReportItem[] = [
  {
    id: "rpt-001",
    title: "Daily Dispensing Summary",
    description: "Overview of all prescriptions dispensed today",
    type: "daily",
    lastGenerated: new Date(),
    category: "Operations",
  },
  {
    id: "rpt-002",
    title: "Weekly Revenue Report",
    description: "Financial summary including sales and costs",
    type: "weekly",
    lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60000),
    category: "Finance",
  },
  {
    id: "rpt-003",
    title: "Inventory Status Report",
    description: "Current stock levels and reorder recommendations",
    type: "weekly",
    lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60000),
    category: "Inventory",
  },
  {
    id: "rpt-004",
    title: "Compliance Audit Trail",
    description: "Detailed log of all prescription activities",
    type: "monthly",
    lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60000),
    category: "Compliance",
  },
  {
    id: "rpt-005",
    title: "Patient Engagement Report",
    description: "Analysis of patient interactions and follow-ups",
    type: "monthly",
    lastGenerated: new Date(Date.now() - 14 * 24 * 60 * 60000),
    category: "Patients",
  },
];

const summaryMetrics = [
  {
    title: "Total Prescriptions",
    value: "1,247",
    change: "+12%",
    icon: FileText,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Revenue (MTD)",
    value: "$45,892",
    change: "+8%",
    icon: DollarSign,
    color: "bg-success/10 text-success",
  },
  {
    title: "Avg. Processing Time",
    value: "4.2 min",
    change: "-15%",
    icon: Clock,
    color: "bg-info/10 text-info",
  },
  {
    title: "Fulfillment Rate",
    value: "98.5%",
    change: "+2%",
    icon: CheckCircle,
    color: "bg-accent/10 text-accent",
  },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ReportsPage() {
  return (
    <div className="space-y-6" data-testid="page-reports">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">View performance metrics and generate reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="month">
            <SelectTrigger className="w-[140px]" data-testid="select-period">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${metric.color}`}>
                  <metric.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center text-sm text-success">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {metric.change}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Prescription Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Chart visualization would appear here</p>
                <p className="text-sm">Showing prescription trends over time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Chart visualization would appear here</p>
                <p className="text-sm">Showing revenue growth patterns</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                data-testid={`card-report-${report.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {report.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {report.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Button size="sm" variant="outline" data-testid={`button-download-${report.id}`}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last: {formatDate(report.lastGenerated)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
