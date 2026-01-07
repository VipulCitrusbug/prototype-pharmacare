import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Claim } from "@shared/schema";
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
import { AIAssistBadge, EmptyState } from "@/components/common";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Filter,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  pending: { label: "Pending Review", icon: Clock, color: "bg-amber-500/10 text-amber-600" },
  ready: { label: "Ready to Submit", icon: CheckCircle2, color: "bg-success/10 text-success" },
  submitted: { label: "Submitted", icon: FileText, color: "bg-info/10 text-info" },
  approved: { label: "Approved", icon: CheckCircle2, color: "bg-success/10 text-success" },
  rejected: { label: "Rejected", icon: XCircle, color: "bg-danger/10 text-danger" },
};

const riskConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low Risk", color: "bg-success/10 text-success" },
  medium: { label: "Medium Risk", color: "bg-amber-500/10 text-amber-600" },
  high: { label: "High Risk", color: "bg-danger/10 text-danger" },
};

export default function FinanceClaimsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [payerFilter, setPayerFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const { data: claims = [], isLoading } = useQuery<Claim[]>({
    queryKey: ["/api/finance/claims"],
  });

  // Enrich claims with static issues for now since backend issues array is limited or needs transformation if simple string array
  // We'll trust what's coming from backend storage if present, otherwise default to empty
  const enrichedClaims = claims.map(c => ({
    ...c,
    // Ensure issues is an array. Schema defines it as string[] | null likely, but verify. 
    // In our storage mock it's string[].
    issues: Array.isArray(c.issues) ? c.issues : [],
    // Convert amount to dollars
    amountDollars: c.amount / 100,
  }));

  const filteredClaims = enrichedClaims.filter((claim) => {
    const matchesSearch =
      claim.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && claim.status === "pending") ||
      (activeTab === "ready" && claim.status === "ready") ||
      (activeTab === "submitted" && ["submitted", "approved", "rejected"].includes(claim.status));

    const matchesPayer = payerFilter === "all" || claim.payer === payerFilter;
    const matchesRisk = riskFilter === "all" || claim.riskLevel === riskFilter;

    return matchesSearch && matchesTab && matchesPayer && matchesRisk;
  });

  const payers = [...new Set(enrichedClaims.map((c) => c.payer))];


  return (
    <div className="space-y-6" data-testid="finance-claims-page">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Claims Review Queue</h1>
        <p className="text-muted-foreground">
          Review and validate insurance claims before submission
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search claims by patient or claim number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-claims"
          />
        </div>
        <Select value={payerFilter} onValueChange={setPayerFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-payer">
            <SelectValue placeholder="Filter by payer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payers</SelectItem>
            {payers.map((payer) => (
              <SelectItem key={payer} value={payer}>
                {payer}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[150px]" data-testid="select-risk">
            <SelectValue placeholder="Risk level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risks</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">
            All Claims ({enrichedClaims.length})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending ({enrichedClaims.filter((c) => c.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="ready" data-testid="tab-ready">
            Ready ({enrichedClaims.filter((c) => c.status === "ready").length})
          </TabsTrigger>
          <TabsTrigger value="submitted" data-testid="tab-submitted">
            Submitted ({enrichedClaims.filter((c) => ["submitted", "approved", "rejected"].includes(c.status)).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading claims...</div>
          ) : filteredClaims.length === 0 ? (
            <EmptyState
              icon="clipboard"
              title="No Claims Found"
              description={
                searchQuery
                  ? "Try adjusting your search or filters"
                  : "No claims match the selected criteria"
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredClaims.map((claim) => {
                const StatusIcon = statusConfig[claim.status].icon;
                return (
                  <Card
                    key={claim.id}
                    className="hover-elevate"
                    data-testid={`claim-card-${claim.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div
                            className={`p-2 rounded-full ${statusConfig[claim.status].color}`}
                          >
                            <StatusIcon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">
                                {claim.claimNumber}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {claim.payer}
                              </Badge>
                              <Badge
                                className={`text-xs ${riskConfig[claim.riskLevel].color}`}
                              >
                                {riskConfig[claim.riskLevel].label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {claim.patientName} - {claim.prescriptionRef}
                            </p>
                            {claim.issues.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <AlertTriangle className="w-3 h-3 text-danger" />
                                <span className="text-xs text-danger">
                                  {claim.issues.length} issue(s) detected
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">
                              ${claim.amountDollars.toFixed(2)}
                            </p>
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-accent" />
                              <span className="text-xs text-muted-foreground">
                                Readiness: {claim.readinessScore}%
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            data-testid={`button-view-${claim.id}`}
                          >
                            <Link href={`/finance/claims/${claim.id}`}>
                              <ChevronRight className="w-5 h-5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
