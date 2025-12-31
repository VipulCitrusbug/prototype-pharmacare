import { useState } from "react";
import { Link } from "wouter";
import {
  Lightbulb,
  Sparkles,
  RefreshCw,
  Check,
  X,
  Clock,
  ArrowLeft,
  Filter,
  TrendingUp,
  AlertTriangle,
  Archive,
  DollarSign,
  Settings,
  ChevronDown,
  ChevronUp,
  Shield,
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
import { AIAssistBadge } from "@/components/common";
import { useToast } from "@/hooks/use-toast";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  rationale: string;
  impact: "high" | "medium" | "low";
  category: "pricing" | "cleanup" | "optimization" | "conflict";
  confidence: number;
  affectedRules: string[];
  estimatedSavings?: string;
  status: "pending" | "applied" | "dismissed";
  createdAt: string;
}

const mockRecommendations: Recommendation[] = [
  {
    id: "rec-001",
    title: "Consolidate Senior Discount Rules",
    description: "3 overlapping senior discount rules can be merged into 1 unified rule",
    rationale: "Rules 'Senior 65+', 'Senior 70+', and 'AARP Member' have overlapping conditions. Consolidating reduces complexity and prevents potential conflicts during checkout.",
    impact: "high",
    category: "optimization",
    confidence: 92,
    affectedRules: ["Senior 65+ Discount", "Senior 70+ Premium", "AARP Member Discount"],
    estimatedSavings: "Reduce rule conflicts by 15%",
    status: "pending",
    createdAt: "2025-12-31T08:00:00Z",
  },
  {
    id: "rec-002",
    title: "Remove Unused Holiday Discount",
    description: "2023 Holiday Promo rule has not been triggered in 12 months",
    rationale: "This promotional rule expired and has not been used since January 2024. Removing it will reduce rule inventory clutter.",
    impact: "low",
    category: "cleanup",
    confidence: 98,
    affectedRules: ["Holiday Promo 2023"],
    status: "pending",
    createdAt: "2025-12-30T14:30:00Z",
  },
  {
    id: "rec-003",
    title: "Update Insurance Tier Thresholds",
    description: "Current thresholds may cause checkout friction based on usage patterns",
    rationale: "Analysis shows 12% of transactions are hitting edge cases between tiers, causing recalculation delays. Adjusting thresholds by 5% would smooth the transition.",
    impact: "medium",
    category: "pricing",
    confidence: 85,
    affectedRules: ["Insurance Tier A", "Insurance Tier B", "Insurance Tier C"],
    estimatedSavings: "Reduce checkout time by 8%",
    status: "pending",
    createdAt: "2025-12-29T10:15:00Z",
  },
  {
    id: "rec-004",
    title: "Resolve Conflicting Discount Logic",
    description: "Employee discount and loyalty discount have conflicting priority settings",
    rationale: "Both rules are set to priority 1, causing unpredictable application. Setting clear hierarchy will ensure consistent pricing.",
    impact: "high",
    category: "conflict",
    confidence: 95,
    affectedRules: ["Employee Discount", "Loyalty Gold Member"],
    status: "pending",
    createdAt: "2025-12-28T16:45:00Z",
  },
  {
    id: "rec-005",
    title: "Archive Expired Manufacturer Rebates",
    description: "5 manufacturer rebate rules have passed their expiration dates",
    rationale: "These rebates are no longer valid but remain in active configuration. Archiving will prevent confusion during audits.",
    impact: "low",
    category: "cleanup",
    confidence: 100,
    affectedRules: ["Pfizer Q3 2024", "Moderna Fall 2024", "J&J Summer 2024", "AbbVie Q2 2024", "Merck Promo 2024"],
    status: "pending",
    createdAt: "2025-12-27T09:00:00Z",
  },
];

export default function AdminAdvisorPage() {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState(mockRecommendations);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [impactFilter, setImpactFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getImpactConfig = (impact: string) => {
    switch (impact) {
      case "high":
        return { color: "text-danger", bg: "bg-danger/10", label: "High Impact" };
      case "medium":
        return { color: "text-amber-600 dark:text-amber-500", bg: "bg-amber-500/10", label: "Medium Impact" };
      case "low":
        return { color: "text-info", bg: "bg-info/10", label: "Low Impact" };
      default:
        return { color: "text-muted-foreground", bg: "bg-muted", label: "Unknown" };
    }
  };

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case "pricing":
        return { icon: DollarSign, color: "text-clinical", bg: "bg-clinical/10", label: "Pricing" };
      case "cleanup":
        return { icon: Archive, color: "text-muted-foreground", bg: "bg-muted", label: "Cleanup" };
      case "optimization":
        return { icon: TrendingUp, color: "text-success", bg: "bg-success/10", label: "Optimization" };
      case "conflict":
        return { icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10", label: "Conflict" };
      default:
        return { icon: Settings, color: "text-muted-foreground", bg: "bg-muted", label: "Other" };
    }
  };

  const filteredRecommendations = recommendations.filter((rec) => {
    const matchesSearch = rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || rec.category === categoryFilter;
    const matchesImpact = impactFilter === "all" || rec.impact === impactFilter;
    return matchesSearch && matchesCategory && matchesImpact && rec.status === "pending";
  });

  const handleApply = (id: string) => {
    setRecommendations(prev => prev.map(rec =>
      rec.id === id ? { ...rec, status: "applied" as const } : rec
    ));
    toast({
      title: "Recommendation Applied",
      description: "The configuration change has been queued for review.",
    });
  };

  const handleDismiss = (id: string) => {
    setRecommendations(prev => prev.map(rec =>
      rec.id === id ? { ...rec, status: "dismissed" as const } : rec
    ));
    toast({
      title: "Recommendation Dismissed",
      description: "This recommendation has been marked as not applicable.",
    });
  };

  const pendingCount = recommendations.filter(r => r.status === "pending").length;
  const highImpactCount = recommendations.filter(r => r.status === "pending" && r.impact === "high").length;

  return (
    <div className="space-y-6" data-testid="admin-advisor-page">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/admin">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Configuration Advisor</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              AI-powered optimization recommendations
            </p>
          </div>
        </div>
        <AIAssistBadge confidence={91} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-pending-count">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Pending Recommendations</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-pending-count">{pendingCount}</p>
              </div>
              <Lightbulb className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-high-impact">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">High Impact</p>
                <p className="text-2xl font-bold text-danger" data-testid="text-high-impact">{highImpactCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-danger" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-avg-confidence">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Confidence</p>
                <p className="text-2xl font-bold text-success" data-testid="text-avg-confidence">92%</p>
              </div>
              <Sparkles className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>
                Review and act on AI-generated suggestions. All changes require explicit approval.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                placeholder="Search recommendations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48"
                data-testid="input-search"
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36" data-testid="select-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="pricing">Pricing</SelectItem>
                  <SelectItem value="cleanup">Cleanup</SelectItem>
                  <SelectItem value="optimization">Optimization</SelectItem>
                  <SelectItem value="conflict">Conflict</SelectItem>
                </SelectContent>
              </Select>
              <Select value={impactFilter} onValueChange={setImpactFilter}>
                <SelectTrigger className="w-36" data-testid="select-impact">
                  <SelectValue placeholder="Impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Impacts</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecommendations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No pending recommendations match your filters</p>
              </div>
            ) : (
              filteredRecommendations.map((rec) => {
                const impactConfig = getImpactConfig(rec.impact);
                const categoryConfig = getCategoryConfig(rec.category);
                const CategoryIcon = categoryConfig.icon;
                const isExpanded = expandedId === rec.id;

                return (
                  <div
                    key={rec.id}
                    className="p-4 rounded-lg border border-border"
                    data-testid={`recommendation-${rec.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${categoryConfig.bg}`}>
                          <CategoryIcon className={`w-5 h-5 ${categoryConfig.color}`} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{rec.title}</span>
                            <Badge variant="secondary" className={`text-xs ${impactConfig.bg} ${impactConfig.color}`}>
                              {impactConfig.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {categoryConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                          
                          {isExpanded && (
                            <div className="mt-4 space-y-3 p-3 rounded-lg bg-muted/50">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Rationale</p>
                                <p className="text-sm">{rec.rationale}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Affected Rules</p>
                                <div className="flex flex-wrap gap-1">
                                  {rec.affectedRules.map((rule, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {rule}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              {rec.estimatedSavings && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Estimated Benefit</p>
                                  <p className="text-sm text-success">{rec.estimatedSavings}</p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-accent" />
                              {rec.confidence}% confidence
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(rec.createdAt).toLocaleDateString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                              className="h-auto p-0 text-xs"
                              data-testid={`button-expand-${rec.id}`}
                            >
                              {isExpanded ? (
                                <>Hide Details <ChevronUp className="w-3 h-3 ml-1" /></>
                              ) : (
                                <>View Details <ChevronDown className="w-3 h-3 ml-1" /></>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDismiss(rec.id)}
                          data-testid={`button-dismiss-${rec.id}`}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApply(rec.id)}
                          data-testid={`button-apply-${rec.id}`}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-dashed" data-testid="card-advisory-notice">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-info flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Advisory Only</p>
              <p className="text-xs text-muted-foreground">
                AI recommendations are suggestions only. No changes are applied automatically.
                All configuration modifications require explicit admin approval and are logged for audit purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
