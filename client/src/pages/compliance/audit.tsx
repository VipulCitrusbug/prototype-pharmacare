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
import {
  ArrowLeft,
  Search,
  Shield,
  Calendar,
  User,
  Clock,
  FileText,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  PillBottle,
  Activity,
  Eye,
  RefreshCw,
} from "lucide-react";

type ActionType = "all" | "dispensed" | "accessed" | "modified" | "override" | "login";
type UserRole = "all" | "pharmacist" | "technician" | "manager";

const mockAuditLogs = [
  {
    id: "log-001",
    action: "Prescription Dispensed",
    actionType: "dispensed",
    user: "RPh John Smith",
    userRole: "pharmacist",
    medication: "Oxycodone 30mg #60",
    category: "Schedule II",
    patientId: "PAT-1234",
    timestamp: "2025-12-31T16:45:23Z",
    ipAddress: "192.168.1.45",
    details: "Prescription RX-78234 dispensed successfully",
  },
  {
    id: "log-002",
    action: "Override Applied",
    actionType: "override",
    user: "RPh Sarah Johnson",
    userRole: "pharmacist",
    medication: "Alprazolam 2mg #90",
    category: "Schedule IV",
    patientId: "PAT-5678",
    timestamp: "2025-12-31T15:32:11Z",
    ipAddress: "192.168.1.42",
    details: "Early refill override - clinical justification documented",
  },
  {
    id: "log-003",
    action: "Patient Record Accessed",
    actionType: "accessed",
    user: "Tech Michael Brown",
    userRole: "technician",
    medication: null,
    category: null,
    patientId: "PAT-9012",
    timestamp: "2025-12-31T14:28:45Z",
    ipAddress: "192.168.1.38",
    details: "Viewed prescription history for refill verification",
  },
  {
    id: "log-004",
    action: "Prescription Dispensed",
    actionType: "dispensed",
    user: "RPh John Smith",
    userRole: "pharmacist",
    medication: "Adderall 20mg #30",
    category: "Schedule II",
    patientId: "PAT-3456",
    timestamp: "2025-12-31T13:15:00Z",
    ipAddress: "192.168.1.45",
    details: "Prescription RX-78235 dispensed successfully",
  },
  {
    id: "log-005",
    action: "Inventory Modified",
    actionType: "modified",
    user: "Mgr Emily Davis",
    userRole: "manager",
    medication: "Zolpidem 10mg",
    category: "Schedule IV",
    patientId: null,
    timestamp: "2025-12-31T12:00:00Z",
    ipAddress: "192.168.1.50",
    details: "Inventory count adjusted: received shipment of 500 units",
  },
  {
    id: "log-006",
    action: "User Login",
    actionType: "login",
    user: "RPh Sarah Johnson",
    userRole: "pharmacist",
    medication: null,
    category: null,
    patientId: null,
    timestamp: "2025-12-31T08:02:15Z",
    ipAddress: "192.168.1.42",
    details: "Successful authentication via SSO",
  },
  {
    id: "log-007",
    action: "Prescription Dispensed",
    actionType: "dispensed",
    user: "RPh Sarah Johnson",
    userRole: "pharmacist",
    medication: "Hydrocodone 10mg #120",
    category: "Schedule II",
    patientId: "PAT-7890",
    timestamp: "2025-12-31T11:45:30Z",
    ipAddress: "192.168.1.42",
    details: "Prescription RX-78236 dispensed successfully",
  },
  {
    id: "log-008",
    action: "Patient Record Accessed",
    actionType: "accessed",
    user: "RPh John Smith",
    userRole: "pharmacist",
    medication: null,
    category: null,
    patientId: "PAT-1234",
    timestamp: "2025-12-31T16:44:00Z",
    ipAddress: "192.168.1.45",
    details: "Reviewed patient allergy information before dispensing",
  },
];

export default function ComplianceAuditPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionType>("all");
  const [roleFilter, setRoleFilter] = useState<UserRole>("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  const getActionConfig = (actionType: string) => {
    switch (actionType) {
      case "dispensed":
        return { color: "text-success", bg: "bg-success/10", icon: PillBottle };
      case "override":
        return { color: "text-amber-600 dark:text-amber-500", bg: "bg-amber-500/10", icon: Shield };
      case "accessed":
        return { color: "text-info", bg: "bg-info/10", icon: Eye };
      case "modified":
        return { color: "text-clinical", bg: "bg-clinical/10", icon: FileText };
      case "login":
        return { color: "text-muted-foreground", bg: "bg-muted", icon: User };
      default:
        return { color: "text-muted-foreground", bg: "bg-muted", icon: Activity };
    }
  };

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.medication && log.medication.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAction = actionFilter === "all" || log.actionType === actionFilter;
    const matchesRole = roleFilter === "all" || log.userRole === roleFilter;
    return matchesSearch && matchesAction && matchesRole;
  });

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const actionCounts = {
    total: mockAuditLogs.length,
    dispensed: mockAuditLogs.filter((l) => l.actionType === "dispensed").length,
    override: mockAuditLogs.filter((l) => l.actionType === "override").length,
    accessed: mockAuditLogs.filter((l) => l.actionType === "accessed").length,
  };

  return (
    <div className="space-y-6" data-testid="compliance-audit-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/compliance">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Audit Trail</h1>
            <p className="text-muted-foreground">
              Complete system activity log for compliance review
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline" size="sm" data-testid="button-refresh">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card data-testid="card-total-actions">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Actions</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-actions">{actionCounts.total}</p>
              </div>
              <Activity className="w-8 h-8 text-clinical" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-dispensed">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Dispensed</p>
                <p className="text-2xl font-bold text-success" data-testid="text-dispensed-count">{actionCounts.dispensed}</p>
              </div>
              <PillBottle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-overrides">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Overrides</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-500" data-testid="text-override-count">{actionCounts.override}</p>
              </div>
              <Shield className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-record-access">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Record Access</p>
                <p className="text-2xl font-bold text-info" data-testid="text-accessed-count">{actionCounts.accessed}</p>
              </div>
              <Eye className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, action, medication, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-logs"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[130px]" data-testid="select-date">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={(v) => setActionFilter(v as ActionType)}>
                <SelectTrigger className="w-[140px]" data-testid="select-action">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="dispensed">Dispensed</SelectItem>
                  <SelectItem value="accessed">Accessed</SelectItem>
                  <SelectItem value="modified">Modified</SelectItem>
                  <SelectItem value="override">Override</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole)}>
                <SelectTrigger className="w-[130px]" data-testid="select-role">
                  <SelectValue placeholder="User Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {paginatedLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No audit logs match your current filters</p>
              </div>
            ) : (
              paginatedLogs.map((log) => {
                const actionConfig = getActionConfig(log.actionType);
                const ActionIcon = actionConfig.icon;

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border hover-elevate"
                    data-testid={`audit-log-${log.id}`}
                  >
                    <div className={`p-2 rounded-full ${actionConfig.bg}`}>
                      <ActionIcon className={`w-4 h-4 ${actionConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-foreground">{log.action}</span>
                        {log.category && (
                          <Badge variant="outline" className="text-xs">
                            {log.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{log.details}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.user}
                        </span>
                        {log.medication && (
                          <span className="flex items-center gap-1">
                            <PillBottle className="w-3 h-3" />
                            {log.medication}
                          </span>
                        )}
                        {log.patientId && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {log.patientId}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          IP: {log.ipAddress}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground flex-shrink-0">
                      <p>{new Date(log.timestamp).toLocaleDateString()}</p>
                      <p>{new Date(log.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * logsPerPage + 1} to{" "}
                {Math.min(currentPage * logsPerPage, filteredLogs.length)} of{" "}
                {filteredLogs.length} entries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  data-testid="button-next-page"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
