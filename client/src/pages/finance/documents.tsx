import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
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

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    claimRef: "",
    patientName: "",
    type: "",
    file: null as File | null,
  });

  // Fetch real documents
  const { data: realDocuments, refetch } = useQuery({
    queryKey: ["/api/finance/documents"],
  });

  // Merge real and mock documents
  const allDocuments = [
    ...(realDocuments as any[] || []).map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      claimRef: doc.claimRef || doc.claimId || "Unknown",
      patientName: doc.patientName || "Unknown",
      size: `${Math.round(doc.size / 1024)} KB`,
      uploadedBy: "Finance Specialist", // Default for now
      uploadedAt: new Date(doc.uploadedAt).toISOString().split("T")[0],
      isReal: true, // Flag to identify real docs for download
      filename: doc.filename
    })),
    ...mockDocuments
  ];

  const filteredDocs = allDocuments.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.claimRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || doc.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleUploadSubmit = async () => {
    if (!formData.file || !formData.claimRef || !formData.patientName || !formData.type) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all fields and select a file.",
      });
      return;
    }

    setIsUploading(true);
    const data = new FormData();
    data.append("file", formData.file);
    data.append("claimRef", formData.claimRef);
    data.append("patientName", formData.patientName);
    data.append("type", formData.type);
    data.append("name", formData.file.name);

    try {
      const res = await fetch("/api/finance/documents", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Upload failed");

      await refetch();
      setIsUploadOpen(false);
      setFormData({
        claimRef: "",
        patientName: "",
        type: "",
        file: null,
      });
      toast({
        title: "Document Uploaded",
        description: "The document has been successfully added.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "There was an error uploading your document.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleView = (doc: Document) => {
    toast({
      title: "View Document",
      description: `Opening ${doc.name}...`,
    });
  };

  const handleDownload = async (doc: any) => {
    if (doc.isReal) {
      try {
        const response = await fetch(`/api/finance/documents/${doc.filename}`);
        if (!response.ok) throw new Error("Download failed");
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = doc.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Download Complete",
          description: `Downloaded ${doc.name}`,
        });
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Download Failed",
          description: "Could not download the document.",
        });
      }
    } else {
      // Keep toast for mock docs as they don't exist on server
      toast({
        title: "Download Started",
        description: `Downloading ${doc.name}... (Mock)`,
      });
    }
  };

  const handleDelete = async (doc: any) => {
    if (!doc.isReal) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete mock documents.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch(`/api/finance/documents/${doc.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      await refetch();
      toast({
        title: "Document Deleted",
        description: `${doc.name} has been removed.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete the document.",
      });
    }
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
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-new">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload a new document to the system. All fields are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="claimRef">Claim Number</Label>
                <Input
                  id="claimRef"
                  placeholder="e.g. CLM-2024-1850"
                  value={formData.claimRef}
                  onChange={(e) => setFormData({ ...formData, claimRef: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  placeholder="e.g. Sarah Johnson"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Document Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="prior_auth">Prior Authorization</SelectItem>
                    <SelectItem value="supporting">Supporting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleUploadSubmit} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
              onAction={() => setIsUploadOpen(true)}
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
            <div className="text-3xl font-bold">{allDocuments.length}</div>
            <p className="text-sm text-muted-foreground">Across all claims</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Prior Authorizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {allDocuments.filter((d) => d.type === "prior_auth").length}
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
              {allDocuments.filter((d: any) => d.uploadedAt === new Date().toISOString().split("T")[0] || d.uploadedAt === "2024-01-15").length}
            </div>
            <p className="text-sm text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
