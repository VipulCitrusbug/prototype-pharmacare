import { useState } from "react";
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
import { EmptyState } from "@/components/common";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  Eye,
  File,
  FileCheck,
  FileImage,
  FileText,
  Filter,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: "prescription" | "insurance" | "prior_auth" | "supporting" | "other";
  claimRef: string;
  patientName: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

const mockDocuments: Document[] = [
  {
    id: "doc-001",
    name: "Prescription_RX001.pdf",
    type: "prescription",
    claimRef: "CLM-2024-1850",
    patientName: "Sarah Johnson",
    size: "245 KB",
    uploadedBy: "Rebecca Taylor",
    uploadedAt: "2024-01-15",
  },
  {
    id: "doc-002",
    name: "Insurance_Card_Front.jpg",
    type: "insurance",
    claimRef: "CLM-2024-1850",
    patientName: "Sarah Johnson",
    size: "1.2 MB",
    uploadedBy: "Rebecca Taylor",
    uploadedAt: "2024-01-15",
  },
  {
    id: "doc-003",
    name: "Prior_Authorization_PA123.pdf",
    type: "prior_auth",
    claimRef: "CLM-2024-1849",
    patientName: "James Wilson",
    size: "567 KB",
    uploadedBy: "Rebecca Taylor",
    uploadedAt: "2024-01-14",
  },
  {
    id: "doc-004",
    name: "Lab_Results.pdf",
    type: "supporting",
    claimRef: "CLM-2024-1848",
    patientName: "Maria Garcia",
    size: "890 KB",
    uploadedBy: "System",
    uploadedAt: "2024-01-13",
  },
  {
    id: "doc-005",
    name: "Prescription_RX002.pdf",
    type: "prescription",
    claimRef: "CLM-2024-1847",
    patientName: "Robert Brown",
    size: "234 KB",
    uploadedBy: "Rebecca Taylor",
    uploadedAt: "2024-01-12",
  },
];

const typeConfig: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  prescription: { label: "Prescription", icon: FileText, color: "bg-clinical/10 text-clinical" },
  insurance: { label: "Insurance", icon: FileCheck, color: "bg-info/10 text-info" },
  prior_auth: { label: "Prior Auth", icon: FileCheck, color: "bg-accent/10 text-accent" },
  supporting: { label: "Supporting", icon: File, color: "bg-amber-500/10 text-amber-600" },
  other: { label: "Other", icon: File, color: "bg-muted text-muted-foreground" },
};

export default function FinanceDocumentsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredDocs = mockDocuments.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.claimRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || doc.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleUpload = () => {
    toast({
      title: "Upload Document",
      description: "Document upload dialog would open here.",
    });
  };

  const handleView = (doc: Document) => {
    toast({
      title: "View Document",
      description: `Opening ${doc.name}...`,
    });
  };

  const handleDownload = (doc: Document) => {
    toast({
      title: "Download Started",
      description: `Downloading ${doc.name}...`,
    });
  };

  const handleDelete = (doc: Document) => {
    toast({
      title: "Document Deleted",
      description: `${doc.name} has been removed.`,
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6" data-testid="finance-documents-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documentation Management</h1>
          <p className="text-muted-foreground">
            Upload, view, and manage claim supporting documents
          </p>
        </div>
        <Button onClick={handleUpload} data-testid="button-upload-new">
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search documents by name, claim, or patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-docs"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-type">
                <SelectValue placeholder="Document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="prescription">Prescription</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="prior_auth">Prior Authorization</SelectItem>
                <SelectItem value="supporting">Supporting</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDocs.length === 0 ? (
            <EmptyState
              icon="file"
              title="No Documents Found"
              description={
                searchQuery
                  ? "Try adjusting your search or filters"
                  : "Upload documents to get started"
              }
              actionLabel="Upload Document"
              onAction={handleUpload}
            />
          ) : (
            <div className="space-y-2">
              {filteredDocs.map((doc) => {
                const config = typeConfig[doc.type];
                const Icon = config.icon;

                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover-elevate"
                    data-testid={`doc-row-${doc.id}`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">{doc.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {doc.claimRef}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{doc.patientName}</span>
                          <span>-</span>
                          <span>{doc.size}</span>
                          <span>-</span>
                          <span>Uploaded {doc.uploadedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Badge className={`text-xs ${config.color}`}>
                        {config.label}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(doc)}
                        data-testid={`button-view-${doc.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(doc)}
                        data-testid={`button-download-${doc.id}`}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc)}
                        data-testid={`button-delete-${doc.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-danger" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockDocuments.length}</div>
            <p className="text-sm text-muted-foreground">Across all claims</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Prior Authorizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {mockDocuments.filter((d) => d.type === "prior_auth").length}
            </div>
            <p className="text-sm text-muted-foreground">On file</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {mockDocuments.filter((d) => d.uploadedAt === "2024-01-15").length}
            </div>
            <p className="text-sm text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
