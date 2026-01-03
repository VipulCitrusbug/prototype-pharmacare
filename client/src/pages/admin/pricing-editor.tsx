import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft,
  Save,
  DollarSign,
  Percent,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AdminPricingEditorPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isNew = id === "new";

  const [formData, setFormData] = useState({
    name: isNew ? "" : "Senior Citizen Discount",
    description: isNew ? "" : "10% discount for customers aged 65 and above",
    type: isNew ? "discount" : "discount",
    value: isNew ? "" : "10",
    valueType: isNew ? "percentage" : "percentage",
    priority: isNew ? "1" : "1",
    status: isNew ? "draft" : "active",
    validFrom: isNew ? "" : "2024-01-01",
    validTo: isNew ? "" : "",
    stackable: isNew ? false : true,
  });

  const [conditions, setConditions] = useState<string[]>(
    isNew ? [] : ["Age >= 65", "Valid ID Required"]
  );
  const [newCondition, setNewCondition] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      setConditions(prev => [...prev, newCondition.trim()]);
      setNewCondition("");
    }
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push("Rule name is required");
    }
    if (!formData.value || isNaN(Number(formData.value))) {
      errors.push("Valid value is required");
    }
    if (!formData.validFrom) {
      errors.push("Valid from date is required");
    }
    if (formData.validTo && new Date(formData.validTo) < new Date(formData.validFrom)) {
      errors.push("Valid to date must be after valid from date");
    }
    if (conditions.length === 0) {
      errors.push("At least one condition is required");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        ...formData,
        value: Number(formData.value),
        conditions,
        createdBy: "Admin User", // TODO: Get actual user
      };

      if (isNew) {
        await apiRequest("POST", "/api/admin/pricing", payload);
      } else {
        await apiRequest("PATCH", `/api/admin/pricing/${id}`, payload);
      }

      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing"] });

      toast({
        title: isNew ? "Rule Created" : "Rule Updated",
        description: `${formData.name} has been ${isNew ? "created" : "updated"} successfully.`,
      });
      setLocation("/admin/pricing");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save pricing rule.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-pricing-editor-page">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/admin/pricing">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isNew ? "Create Pricing Rule" : "Edit Pricing Rule"}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? "Define a new pricing or discount rule" : "Modify existing rule configuration"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild data-testid="button-cancel">
            <Link href="/admin/pricing">Cancel</Link>
          </Button>
          <Button onClick={handleSave} data-testid="button-save">
            <Save className="w-4 h-4 mr-2" />
            Save Rule
          </Button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <Card className="border-danger/50 bg-danger/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-danger mb-2">Please fix the following errors:</p>
                <ul className="list-disc list-inside text-sm text-danger space-y-1">
                  {validationErrors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rule Details</CardTitle>
              <CardDescription>
                Basic information about this pricing rule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Senior Citizen Discount"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  data-testid="input-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this rule does..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  data-testid="textarea-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rule Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger data-testid="select-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discount">Discount</SelectItem>
                      <SelectItem value="surcharge">Surcharge</SelectItem>
                      <SelectItem value="override">Override</SelectItem>
                      <SelectItem value="tier">Tier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange("priority", value)}
                  >
                    <SelectTrigger data-testid="select-priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 (Highest)</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5 (Lowest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing Value</CardTitle>
              <CardDescription>
                Define the pricing adjustment amount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Value Type</Label>
                  <Select
                    value={formData.valueType}
                    onValueChange={(value) => handleInputChange("valueType", value)}
                  >
                    <SelectTrigger data-testid="select-value-type">
                      <SelectValue placeholder="Select value type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      {formData.valueType === "percentage" ? (
                        <Percent className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <Input
                      id="value"
                      type="number"
                      placeholder={formData.valueType === "percentage" ? "10" : "5.00"}
                      value={formData.value}
                      onChange={(e) => handleInputChange("value", e.target.value)}
                      className="pl-9"
                      data-testid="input-value"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conditions</CardTitle>
              <CardDescription>
                Define when this rule should be applied
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add a condition (e.g., Age >= 65)"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCondition()}
                  data-testid="input-new-condition"
                />
                <Button onClick={handleAddCondition} data-testid="button-add-condition">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              {conditions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {conditions.map((condition, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-sm py-1 px-3 flex items-center gap-2"
                    >
                      {condition}
                      <button
                        onClick={() => handleRemoveCondition(idx)}
                        className="hover:text-danger"
                        data-testid={`button-remove-condition-${idx}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No conditions defined. Add at least one condition.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Validity Period</CardTitle>
              <CardDescription>
                When this rule is active
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => handleInputChange("validFrom", e.target.value)}
                  data-testid="input-valid-from"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validTo">Valid To (Optional)</Label>
                <Input
                  id="validTo"
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => handleInputChange("validTo", e.target.value)}
                  data-testid="input-valid-to"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for no expiration
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rule Status</CardTitle>
              <CardDescription>
                Control rule activation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger data-testid="select-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label htmlFor="stackable" className="text-sm font-medium">
                    Stackable
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Can combine with other rules
                  </p>
                </div>
                <Switch
                  id="stackable"
                  checked={formData.stackable as boolean}
                  onCheckedChange={(checked) => handleInputChange("stackable", checked)}
                  data-testid="switch-stackable"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-info/5 border-info/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Validation</p>
                  <p className="text-xs text-muted-foreground">
                    The system will check for conflicts with existing rules before saving.
                    All changes are logged for audit purposes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
