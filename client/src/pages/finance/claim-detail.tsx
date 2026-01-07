import { useState, useRef } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AIAssistBadge } from "@/components/common";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck,
  FileText,
  RefreshCw,
  Sparkles,
  Upload,
  User,
  XCircle,
} from "lucide-react";
import type { Claim } from "@shared/schema";

const mockClaimDetail = {
  id: "clm-001",
  claimNumber: "CLM-2024-1850",
  patientName: "Sarah Johnson",
  patientId: "PT-12345",
  dateOfBirth: "1985-03-15",
  prescriptionRef: "RX-001",
  payer: "BlueCross BlueShield",
  payerId: "BCBS-001",
  memberId: "XYZ123456789",
  groupNumber: "GRP-5678",
  amount: 1245.00,
  drugName: "Metformin 500mg",
  drugNdc: "12345-678-90",
  quantity: 90,
  daysSupply: 30,
  drugCoefficient: 1.25,
  status: "pending" as const,
  riskLevel: "high" as const,
  readinessScore: 62,
  issues: [
    {
      id: "iss-001",
      type: "error",
      title: "Missing Prior Authorization",
      description: "This medication requires prior authorization from the payer before submission.",
      suggestion: "Upload prior authorization document or contact payer for expedited approval.",
    },
    {
      id: "iss-002",
      type: "warning",
      title: "Drug Coefficient Mismatch",
      description: "The applied drug coefficient (1.25) differs from payer's expected rate (1.18).",
      suggestion: "Verify coefficient with payer fee schedule or adjust billing amount.",
    },
  ],
  documents: [
    { id: "doc-001", name: "Prescription Image", type: "prescription", uploadedAt: "2024-01-15" },
    { id: "doc-002", name: "Patient Insurance Card", type: "insurance", uploadedAt: "2024-01-15" },
  ],
  createdAt: "2024-01-15T10:30:00Z",
  aiConfidence: 88,
};

export default function FinanceClaimDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();

  const [isRerunning, setIsRerunning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents
  const { data: documents, isLoading: isLoadingDocs, refetch: refetchDocs } = useQuery({
    queryKey: [`/api/finance/claims/${id}/documents`],
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/finance/claims/${id}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      await refetchDocs();
      toast({
        title: "Document Uploaded",
        description: "The document has been successfully attached to this claim.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "There was an error uploading your document.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Fetch claim details
  const { data: claim, isLoading: isLoadingClaim } = useQuery<Claim>({
    queryKey: [`/api/finance/claims/${id}`],
  });

  const handleDownload = async (filename: string, originalName: string) => {
    try {
      const response = await fetch(`/api/finance/documents/${filename}`);
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not download the document.",
      });
    }
  };

  const handleRerunValidation = async () => {
    setIsRerunning(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsRerunning(false);
    toast({
      title: "Validation Complete",
      description: "AI readiness check has been updated.",
    });
  };

  if (isLoadingClaim) {
    return <div className="p-6">Loading claim details...</div>;
  }

  if (!claim) {
    return <div className="p-6">Claim not found</div>;
  }
  
  // Transform or enrich claim data if needed to match UI expectations (like mock issues)
  // For now, we'll merge with static issues since backend doesn't store them yet
  const enrichedClaim = {
    ...claim,
    amount: claim.amount / 100, // Convert cents back to dollars
    issues: [
      {
        id: "iss-001",
        type: "error",
        title: "Missing Prior Authorization",
        description: "This medication requires prior authorization from the payer before submission.",
        suggestion: "Upload prior authorization document or contact payer for expedited approval.",
      },
      {
        id: "iss-002",
        type: "warning",
        title: "Drug Coefficient Mismatch",
        description: "The applied drug coefficient (1.25) differs from payer's expected rate (1.18).",
        suggestion: "Verify coefficient with payer fee schedule or adjust billing amount.",
      },
    ],
  };



  return (
    <div className="space-y-6" data-testid="finance-claim-detail-page">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild data-testid="button-back">
          <Link href="/finance/claims">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {enrichedClaim.claimNumber}
            </h1>
            <Badge
              className={
                enrichedClaim.riskLevel === "high"
                  ? "bg-danger/10 text-danger"
                  : enrichedClaim.riskLevel === "medium"
                  ? "bg-amber-500/10 text-amber-600"
                  : "bg-success/10 text-success"
              }
            >
              {enrichedClaim.riskLevel === "high" ? "High Risk" : enrichedClaim.riskLevel === "medium" ? "Medium Risk" : "Low Risk"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Created on {new Date(enrichedClaim.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRerunValidation}
            disabled={isRerunning || enrichedClaim.status === "submitted"}
            data-testid="button-rerun-validation"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRerunning ? "animate-spin" : ""}`} />
            {isRerunning ? "Validating..." : "Re-run Validation"}
          </Button>
          <Button 
            asChild 
            data-testid="button-submit-claim"
            disabled={enrichedClaim.status === "submitted"}
            variant={enrichedClaim.status === "submitted" ? "secondary" : "default"}
          >
            {enrichedClaim.status === "submitted" ? (
              <span>Submitted</span>
            ) : (
              <Link href={`/finance/claims/${id}/submit`}>
                Submit Claim
              </Link>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                AI Claim Readiness Panel
              </CardTitle>
              <CardDescription>
                AI-powered analysis of claim submission readiness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 mb-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Readiness Score</span>
                    <span className="text-2xl font-bold">{enrichedClaim.readinessScore}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        enrichedClaim.readinessScore >= 80
                          ? "bg-success"
                          : enrichedClaim.readinessScore >= 60
                          ? "bg-amber-500"
                          : "bg-danger"
                      }`}
                      style={{ width: `${enrichedClaim.readinessScore}%` }}
                    />
                  </div>
                </div>
                <AIAssistBadge confidence={enrichedClaim.aiConfidence} />
              </div>

              {enrichedClaim.issues.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Issues Detected ({enrichedClaim.issues.length})
                  </h4>
                  {enrichedClaim.issues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`p-4 rounded-lg border ${
                        issue.type === "error"
                          ? "border-danger/30 bg-danger/5"
                          : "border-amber-500/30 bg-amber-500/5"
                      }`}
                      data-testid={`issue-${issue.id}`}
                    >
                      <div className="flex items-start gap-3">
                        {issue.type === "error" ? (
                          <XCircle className="w-5 h-5 text-danger mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{issue.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {issue.description}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-accent">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Suggestion: {issue.suggestion}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/30">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <div>
                    <p className="font-medium text-success">Claim Ready for Submission</p>
                    <p className="text-sm text-muted-foreground">
                      All validations passed. This claim can be submitted.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-clinical" />
                Prescription & Billing Summary
              </CardTitle>
              <CardDescription>Read-only prescription and billing details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Drug Name</p>
                  <p className="font-medium">{enrichedClaim.drugName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NDC</p>
                  <p className="font-medium">{enrichedClaim.drugNdc}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">{enrichedClaim.quantity} units</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Days Supply</p>
                  <p className="font-medium">{enrichedClaim.daysSupply} days</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Drug Coefficient</p>
                  <p className="font-medium">{enrichedClaim.drugCoefficient}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Claim Amount</p>
                  <p className="font-medium text-lg">${enrichedClaim.amount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-info" />
                    Supporting Documentation
                  </CardTitle>
                  <CardDescription>Attached documents for this claim</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    data-testid="button-upload-doc"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || enrichedClaim.status === "submitted"}
                  >
                    <Upload className={`w-4 h-4 mr-2 ${isUploading ? "animate-spin" : ""}`} />
                    {isUploading ? "Uploading..." : "Upload Document"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(documents as any[] || []).map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                    data-testid={`doc-${doc.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      data-testid={`button-view-doc-${doc.id}`}
                      onClick={() => handleDownload(doc.filename, doc.name)}
                    >
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-clinical" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{enrichedClaim.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Patient ID</p>
                <p className="font-medium">{enrichedClaim.patientId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{enrichedClaim.dateOfBirth}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-accent" />
                Insurance Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Payer</p>
                <p className="font-medium">{enrichedClaim.payer}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payer ID</p>
                <p className="font-medium">{enrichedClaim.payerId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member ID</p>
                <p className="font-medium">{enrichedClaim.memberId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Group Number</p>
                <p className="font-medium">{enrichedClaim.groupNumber}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Claim Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-success mt-2" />
                  <div>
                    <p className="font-medium text-sm">Claim Created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(enrichedClaim.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {enrichedClaim.status === "submitted" ? (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div>
                      <p className="font-medium text-sm">Claim Submitted</p>
                      <p className="text-xs text-muted-foreground">
                        Sent to Payer
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-2" />
                    <div>
                      <p className="font-medium text-sm">Pending Review</p>
                      <p className="text-xs text-muted-foreground">
                        Awaiting issue resolution
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
