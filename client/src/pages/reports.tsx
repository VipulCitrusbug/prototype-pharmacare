import { useState } from "react";
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
  BarChart as BarChartIcon,
  FileText,
  Download,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";


// Function to generate and download PDF report
// Function to generate and download text report
const downloadReport = (report: ReportItem) => {
  let content = `PharmaCare Plus
Pharmacy Management System
================================================================

${report.title}
Generated: ${new Date().toLocaleString()}
Category: ${report.category}
Type: ${report.type}

================================================================
\n`;

  // Report-specific content
  switch (report.id) {
    case "rpt-001": // Daily Dispensing Summary
      content += `EXECUTIVE SUMMARY
Total prescriptions dispensed today: 79
New prescriptions: 52 (65.8%)
Refills: 27 (34.2%)

PRESCRIPTION BREAKDOWN BY CATEGORY
• Cardiovascular: 18 prescriptions (22.8%)
• Diabetes Management: 15 prescriptions (19.0%)
• Antibiotics: 12 prescriptions (15.2%)
• Pain Management: 11 prescriptions (13.9%)
• Mental Health: 9 prescriptions (11.4%)
• Other: 14 prescriptions (17.7%)

PROCESSING METRICS
Average processing time: 3.8 minutes
Peak hours: 10 AM - 12 PM (28 prescriptions)
Fulfillment rate: 100%
Patient wait time (avg): 12 minutes`;
      break;

    case "rpt-002": // Weekly Revenue Report
      content += `FINANCIAL SUMMARY
Total Revenue: $23,980.00
Total Prescriptions: 324
Average Revenue per Prescription: $74.01

REVENUE BY DAY
• Monday: $3,250.00 (45 prescriptions)
• Tuesday: $3,890.00 (52 prescriptions)
• Wednesday: $3,420.00 (48 prescriptions)
• Thursday: $4,560.00 (61 prescriptions)
• Friday: $4,120.00 (55 prescriptions)
• Saturday: $2,850.00 (38 prescriptions)
• Sunday: $1,890.00 (25 prescriptions)

INSURANCE VS CASH
Insurance claims: $18,384.00 (76.7%)
Cash payments: $5,596.00 (23.3%)`;
      break;

    case "rpt-003": // Inventory Status Report
      content += `CURRENT INVENTORY STATUS
Total unique items: 247
Total units in stock: 18,542
Items requiring reorder: 23

LOW STOCK ALERTS
• Lisinopril 10mg: 85 units (min: 100)
• Atorvastatin 20mg: 45 units (min: 100)
• Metformin 500mg: 450 units (approaching min)

EXPIRING SOON (Next 3 Months)
• Amoxicillin 250mg: Exp 03/10/2025
• Lisinopril 10mg: Exp 08/20/2025
• Atorvastatin 20mg: Exp 11/30/2025

RECOMMENDED ACTIONS
1. Place urgent order for Lisinopril and Atorvastatin
2. Monitor Amoxicillin expiration date
3. Review stock levels for high-demand items`;
      break;

    case "rpt-004": // Compliance Audit Trail
      content += `AUDIT SUMMARY
Audit Period: Last 30 days
Total transactions reviewed: 1,320
Compliance rate: 99.8%
Issues identified: 3

CONTROLLED SUBSTANCES TRACKING
• Schedule II prescriptions: 47
• All properly documented: Yes
• DEA reporting status: Up to date

PRESCRIPTION VERIFICATION
• Prescriber license verification: 100%
• Patient ID verification: 100%
• Drug interaction checks: 1,320/1,320

ISSUES IDENTIFIED
1. Minor documentation delay (resolved)
2. Signature missing on transfer (corrected)
3. Inventory count discrepancy (reconciled)`;
      break;

    case "rpt-005": // Patient Engagement Report
      content += `PATIENT METRICS
Total active patients: 486
New patient registrations: 23
Refill requests: 186
Patient satisfaction score: 4.7/5.0

COMMUNICATION CHANNELS
• Phone consultations: 142
• In-person visits: 298
• Digital refill requests: 186
• Email inquiries: 67

PATIENT FOLLOW-UPS
Medication adherence calls made: 89
Positive outcomes: 76 (85.4%)
Scheduled follow-ups: 34`;
      break;
  }

  content += `\n\n================================================================
CONFIDENTIAL - PharmaCare Plus Internal Document
================================================================`;

  // Create blob and download
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

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

// Data generators for different time periods
const getDataForPeriod = (period: string) => {
  switch (period) {
    case "today":
      return {
        prescriptions: [
          { time: "9 AM", prescriptions: 8, refills: 5 },
          { time: "10 AM", prescriptions: 12, refills: 7 },
          { time: "11 AM", prescriptions: 15, refills: 9 },
          { time: "12 PM", prescriptions: 10, refills: 6 },
          { time: "1 PM", prescriptions: 9, refills: 5 },
          { time: "2 PM", prescriptions: 14, refills: 8 },
          { time: "3 PM", prescriptions: 11, refills: 7 },
        ],
        revenue: [
          { time: "9 AM", revenue: 580 },
          { time: "10 AM", revenue: 890 },
          { time: "11 AM", revenue: 1120 },
          { time: "12 PM", revenue: 750 },
          { time: "1 PM", revenue: 650 },
          { time: "2 PM", revenue: 1040 },
          { time: "3 PM", revenue: 820 },
        ],
      };
    case "week":
      return {
        prescriptions: [
          { time: "Mon", prescriptions: 45, refills: 28 },
          { time: "Tue", prescriptions: 52, refills: 31 },
          { time: "Wed", prescriptions: 48, refills: 25 },
          { time: "Thu", prescriptions: 61, refills: 35 },
          { time: "Fri", prescriptions: 55, refills: 30 },
          { time: "Sat", prescriptions: 38, refills: 22 },
          { time: "Sun", prescriptions: 25, refills: 15 },
        ],
        revenue: [
          { time: "Mon", revenue: 3250 },
          { time: "Tue", revenue: 3890 },
          { time: "Wed", revenue: 3420 },
          { time: "Thu", revenue: 4560 },
          { time: "Fri", revenue: 4120 },
          { time: "Sat", revenue: 2850 },
          { time: "Sun", revenue: 1890 },
        ],
      };
    case "month":
      return {
        prescriptions: [
          { time: "Week 1", prescriptions: 324, refills: 186 },
          { time: "Week 2", prescriptions: 298, refills: 172 },
          { time: "Week 3", prescriptions: 356, refills: 205 },
          { time: "Week 4", prescriptions: 342, refills: 198 },
        ],
        revenue: [
          { time: "Week 1", revenue: 23480 },
          { time: "Week 2", revenue: 21560 },
          { time: "Week 3", revenue: 25780 },
          { time: "Week 4", revenue: 24760 },
        ],
      };
    case "quarter": {
      const now = new Date();
      const currentMonth = now.getMonth();
      const quarterStart = Math.floor(currentMonth / 3) * 3;
      const months = [0, 1, 2].map(offset => {
        const d = new Date(now.getFullYear(), quarterStart + offset, 1);
        return d.toLocaleString('default', { month: 'short' });
      });

      return {
        prescriptions: [
          { time: months[0], prescriptions: 1320, refills: 761 },
          { time: months[1], prescriptions: 1198, refills: 694 },
          { time: months[2], prescriptions: 1424, refills: 822 },
        ],
        revenue: [
          { time: months[0], revenue: 95580 },
          { time: months[1], revenue: 86740 },
          { time: months[2], revenue: 103120 },
        ],
      };
    }
    default:
      return {
        prescriptions: [],
        revenue: [],
      };
  }
};

// Get summary metrics based on period
const getMetricsForPeriod = (period: string) => {
  switch (period) {
    case "today":
      return [
        { title: "Total Prescriptions", value: "79", change: "+5%", icon: FileText, color: "bg-primary/10 text-primary" },
        { title: "Revenue (Today)", value: "$5,850", change: "+12%", icon: DollarSign, color: "bg-success/10 text-success" },
        { title: "Avg. Processing Time", value: "3.8 min", change: "-8%", icon: Clock, color: "bg-info/10 text-info" },
        { title: "Fulfillment Rate", value: "100%", change: "+1%", icon: CheckCircle, color: "bg-accent/10 text-accent" },
      ];
    case "week":
      return [
        { title: "Total Prescriptions", value: "324", change: "+12%", icon: FileText, color: "bg-primary/10 text-primary" },
        { title: "Revenue (WTD)", value: "$23,980", change: "+8%", icon: DollarSign, color: "bg-success/10 text-success" },
        { title: "Avg. Processing Time", value: "4.2 min", change: "-15%", icon: Clock, color: "bg-info/10 text-info" },
        { title: "Fulfillment Rate", value: "98.5%", change: "+2%", icon: CheckCircle, color: "bg-accent/10 text-accent" },
      ];
    case "month":
      return [
        { title: "Total Prescriptions", value: "1,320", change: "+15%", icon: FileText, color: "bg-primary/10 text-primary" },
        { title: "Revenue (MTD)", value: "$95,580", change: "+18%", icon: DollarSign, color: "bg-success/10 text-success" },
        { title: "Avg. Processing Time", value: "4.5 min", change: "-12%", icon: Clock, color: "bg-info/10 text-info" },
        { title: "Fulfillment Rate", value: "97.8%", change: "+3%", icon: CheckCircle, color: "bg-accent/10 text-accent" },
      ];
    case "quarter":
      return [
        { title: "Total Prescriptions", value: "3,942", change: "+22%", icon: FileText, color: "bg-primary/10 text-primary" },
        { title: "Revenue (QTD)", value: "$285,440", change: "+25%", icon: DollarSign, color: "bg-success/10 text-success" },
        { title: "Avg. Processing Time", value: "4.3 min", change: "-18%", icon: Clock, color: "bg-info/10 text-info" },
        { title: "Fulfillment Rate", value: "98.1%", change: "+4%", icon: CheckCircle, color: "bg-accent/10 text-accent" },
      ];
    default:
      return [];
  }
};

// Filter reports based on period
const getFilteredReports = (period: string) => {
  switch (period) {
    case "today":
      return mockReports.filter(r => r.type === "daily");
    case "week":
      return mockReports.filter(r => r.type === "daily" || r.type === "weekly");
    case "month":
      return mockReports.filter(r => r.type === "weekly" || r.type === "monthly");
    case "quarter":
      return mockReports;
    default:
      return mockReports;
  }
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const chartData = getDataForPeriod(selectedPeriod);
  const summaryMetrics = getMetricsForPeriod(selectedPeriod);
  const filteredReports = getFilteredReports(selectedPeriod);

  return (
    <div className="space-y-6" data-testid="page-reports">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">View performance metrics and generate reports</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
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
              <BarChartIcon className="w-5 h-5" />
              Prescription Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.prescriptions}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="time"
                    className="text-sm"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-sm"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="prescriptions"
                    name="New Prescriptions"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="refills"
                    name="Refills"
                    fill="hsl(var(--accent))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
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
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.revenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="time"
                    className="text-sm"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-sm"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [`$${value}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
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
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
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
                    <Button 
                      size="sm" 
                      variant="outline" 
                      data-testid={`button-download-${report.id}`}
                      onClick={() => downloadReport(report)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last: {formatDate(report.lastGenerated)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No reports available for this time period</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
