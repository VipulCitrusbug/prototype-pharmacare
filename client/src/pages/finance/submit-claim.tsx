import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, Send } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Claim } from "@shared/schema";

export default function FinanceSubmitClaimPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: claim, isLoading } = useQuery<Claim>({
    queryKey: [`/api/finance/claims/${id}`],
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/finance/claims/${id}`, { status: "submitted" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/finance/claims/${id}`] });
      toast({
        title: "Claim Submitted Successfully",
        description: `Claim ${claim?.claimNumber} has been submitted to ${claim?.payer}.`,
      });
      setLocation(`/finance/claims/${id}`);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error submitting your claim.",
      });
    }
  });

  if (isLoading) {
    return <div className="p-6">Loading claim details...</div>;
  }

  if (!claim) {
    return <div className="p-6">Claim not found</div>;
  }

  const amountDollars = claim.amount / 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6 container py-6">
      <Button 
        variant="ghost" 
        onClick={() => window.history.back()}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Claim
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Submit Claim</h1>
        <p className="text-muted-foreground">
          Review details before final submission to payer.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Claim Summary</CardTitle>
          <CardDescription>
            Reference: {claim.claimNumber}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Patient</p>
              <p className="font-medium">{claim.patientName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payer</p>
              <p className="font-medium">{claim.payer}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Medication</p>
              <p className="font-medium">{claim.drugName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="font-medium">{claim.quantity}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
            <span className="font-medium">Total Claim Amount</span>
            <span className="text-xl font-bold">${amountDollars.toFixed(2)}</span>
          </div>

          <div className="bg-blue-50 text-blue-700 p-4 rounded-lg flex gap-3 items-start border border-blue-100">
            <FileText className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Submission Statement</p>
              <p className="mt-1">
                By submitting this claim, you create a formal request for payment from the payer. 
                Ensure all attached documentation is correct and complete.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || claim.status === "submitted"}>
            {mutation.isPending ? (
              <>Submitting...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {claim.status === "submitted" ? "Already Submitted" : "Submit Claim"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
