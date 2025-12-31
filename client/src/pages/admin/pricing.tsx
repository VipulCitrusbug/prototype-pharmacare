import { useState } from "react";
import { Link } from "wouter";
import {
  DollarSign,
  Plus,
  Search,
  ArrowLeft,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Clock,
  Tag,
  Percent,
  Filter,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface PricingRule {
  id: string;
  name: string;
  description: string;
  type: "discount" | "surcharge" | "override" | "tier";
  value: number;
  valueType: "percentage" | "fixed";
  conditions: string[];
  status: "active" | "inactive" | "draft";
  priority: number;
  validFrom: string;
  validTo: string | null;
  usageCount: number;
  lastTriggered: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const mockPricingRules: PricingRule[] = [
  {
    id: "rule-001",
    name: "Senior Citizen Discount",
    description: "10% discount for customers aged 65 and above",
    type: "discount",
    value: 10,
    valueType: "percentage",
    conditions: ["Age >= 65", "Valid ID Required"],
    status: "active",
    priority: 1,
    validFrom: "2024-01-01",
    validTo: null,
    usageCount: 1245,
    lastTriggered: "2025-12-31T10:30:00Z",
    createdBy: "Admin Sarah",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-06-15T14:30:00Z",
  },
  {
    id: "rule-002",
    name: "Generic Medication Discount",
    description: "15% discount on all generic medications",
    type: "discount",
    value: 15,
    valueType: "percentage",
    conditions: ["Medication Type = Generic"],
    status: "active",
    priority: 2,
    validFrom: "2024-03-01",
    validTo: null,
    usageCount: 3567,
    lastTriggered: "2025-12-31T11:45:00Z",
    createdBy: "Admin John",
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-03-01T00:00:00Z",
  },
  {
    id: "rule-003",
    name: "Insurance Tier A Copay",
    description: "Fixed copay amount for Tier A insurance members",
    type: "override",
    value: 10,
    valueType: "fixed",
    conditions: ["Insurance Tier = A", "In-Network Provider"],
    status: "active",
    priority: 1,
    validFrom: "2024-01-01",
    validTo: "2025-12-31",
    usageCount: 892,
    lastTriggered: "2025-12-30T16:20:00Z",
    createdBy: "Admin Sarah",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-09-01T10:00:00Z",
  },
  {
    id: "rule-004",
    name: "Loyalty Gold Member",
    description: "5% additional discount for gold loyalty members",
    type: "discount",
    value: 5,
    valueType: "percentage",
    conditions: ["Loyalty Tier = Gold", "Active Membership"],
    status: "active",
    priority: 3,
    validFrom: "2024-06-01",
    validTo: null,
    usageCount: 456,
    lastTriggered: "2025-12-31T09:15:00Z",
    createdBy: "Admin John",
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "rule-005",
    name: "Holiday Promo 2023",
    description: "Seasonal holiday discount - expired",
    type: "discount",
    value: 20,
    valueType: "percentage",
    conditions: ["Date Range: Dec 15-31, 2023"],
    status: "inactive",
    priority: 1,
    validFrom: "2023-12-15",
    validTo: "2023-12-31",
    usageCount: 234,
    lastTriggered: "2023-12-31T23:45:00Z",
    createdBy: "Admin Sarah",
    createdAt: "2023-12-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "rule-006",
    name: "Employee Discount",
    description: "Employee pharmacy discount program",
    type: "discount",
    value: 25,
    valueType: "percentage",
    conditions: ["Employee ID Valid", "Active Employment"],
    status: "active",
    priority: 1,
    validFrom: "2024-01-01",
    validTo: null,
    usageCount: 89,
    lastTriggered: "2025-12-28T14:30:00Z",
    createdBy: "Admin John",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export default function AdminPricingPage() {
  const { toast } = useToast();
  const [rules, setRules] = useState(mockPricingRules);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { color: "text-success", bg: "bg-success/10", label: "Active" };
      case "inactive":
        return { color: "text-muted-foreground", bg: "bg-muted", label: "Inactive" };
      case "draft":
        return { color: "text-amber-600 dark:text-amber-500", bg: "bg-amber-500/10", label: "Draft" };
      default:
        return { color: "text-muted-foreground", bg: "bg-muted", label: "Unknown" };
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "discount":
        return { color: "text-success", icon: Percent, label: "Discount" };
      case "surcharge":
        return { color: "text-danger", icon: Plus, label: "Surcharge" };
      case "override":
        return { color: "text-clinical", icon: DollarSign, label: "Override" };
      case "tier":
        return { color: "text-info", icon: Tag, label: "Tier" };
      default:
        return { color: "text-muted-foreground", icon: Tag, label: "Other" };
    }
  };

  const filteredRules = rules.filter((rule) => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || rule.status === statusFilter;
    const matchesType = typeFilter === "all" || rule.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleToggleStatus = (id: string) => {
    setRules(prev => prev.map(rule => {
      if (rule.id === id) {
        const newStatus = rule.status === "active" ? "inactive" : "active";
        toast({
          title: `Rule ${newStatus === "active" ? "Enabled" : "Disabled"}`,
          description: `${rule.name} has been ${newStatus === "active" ? "activated" : "deactivated"}.`,
        });
        return { ...rule, status: newStatus as "active" | "inactive" };
      }
      return rule;
    }));
  };

  const handleDelete = (id: string) => {
    const rule = rules.find(r => r.id === id);
    setRules(prev => prev.filter(r => r.id !== id));
    toast({
      title: "Rule Deleted",
      description: `${rule?.name} has been removed.`,
    });
  };

  const activeCount = rules.filter(r => r.status === "active").length;
  const inactiveCount = rules.filter(r => r.status === "inactive").length;

  return (
    <div className="space-y-6" data-testid="admin-pricing-page">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/admin">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pricing Rules</h1>
            <p className="text-muted-foreground">
              Manage pricing rules, discounts, and pricing overrides
            </p>
          </div>
        </div>
        <Button asChild data-testid="button-create-rule">
          <Link href="/admin/pricing/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Rule
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-total-rules">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Rules</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-rules">{rules.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-clinical" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-active-rules">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold text-success" data-testid="text-active-rules">{activeCount}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-inactive-rules">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Inactive Rules</p>
                <p className="text-2xl font-bold text-muted-foreground" data-testid="text-inactive-rules">{inactiveCount}</p>
              </div>
              <PowerOff className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>All Pricing Rules</CardTitle>
              <CardDescription>
                Configure and manage pricing logic for the pharmacy system
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search rules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48"
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32" data-testid="select-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32" data-testid="select-type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="discount">Discount</SelectItem>
                  <SelectItem value="surcharge">Surcharge</SelectItem>
                  <SelectItem value="override">Override</SelectItem>
                  <SelectItem value="tier">Tier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredRules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No pricing rules match your filters</p>
              </div>
            ) : (
              filteredRules.map((rule) => {
                const statusConfig = getStatusConfig(rule.status);
                const typeConfig = getTypeConfig(rule.type);
                const TypeIcon = typeConfig.icon;

                return (
                  <div
                    key={rule.id}
                    className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border hover-elevate"
                    data-testid={`rule-${rule.id}`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${rule.status === "active" ? "bg-success/10" : "bg-muted"}`}>
                        <TypeIcon className={`w-5 h-5 ${rule.status === "active" ? typeConfig.color : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{rule.name}</span>
                          <Badge variant="secondary" className={`text-xs ${statusConfig.bg} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {typeConfig.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Priority: {rule.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {rule.conditions.map((condition, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-muted">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {rule.valueType === "percentage" ? `${rule.value}%` : `$${rule.value}`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Used {rule.usageCount} times
                          </span>
                          {rule.lastTriggered && (
                            <span>
                              Last: {new Date(rule.lastTriggered).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-menu-${rule.id}`}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/pricing/${rule.id}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Rule
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(rule.id)}>
                          {rule.status === "active" ? (
                            <>
                              <PowerOff className="w-4 h-4 mr-2" />
                              Disable Rule
                            </>
                          ) : (
                            <>
                              <Power className="w-4 h-4 mr-2" />
                              Enable Rule
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(rule.id)}
                          className="text-danger"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Rule
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
