import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

interface InventoryItemForm {
  name: string;
  genericName: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string;
  expiryDate: string;
  supplier: string;
  price: number;
  status: string;
}

export default function NewInventoryItemPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<InventoryItemForm>({
    name: "",
    genericName: "",
    category: "",
    quantity: 0,
    minStock: 0,
    unit: "tablets",
    expiryDate: "",
    supplier: "",
    price: 0,
    status: "available",
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: InventoryItemForm) => {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          genericName: data.genericName,
          category: data.category,
          quantity: data.quantity,
          minStock: data.minStock,
          unit: data.unit,
          expiryDate: data.expiryDate,
          supplier: data.supplier,
          price: Math.round(data.price * 100), // Convert to cents
          status: data.status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create inventory item");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      
      toast({
        title: "Item Added",
        description: `${formData.name} has been added to inventory successfully.`,
      });

      setLocation("/inventory");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.genericName || !formData.category || !formData.supplier) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.quantity < 0 || formData.minStock < 0 || formData.price < 0) {
      toast({
        title: "Validation Error",
        description: "Quantity, minimum stock, and price must be positive numbers.",
        variant: "destructive",
      });
      return;
    }

    createItemMutation.mutate(formData);
  };

  const updateField = <K extends keyof InventoryItemForm>(field: K, value: InventoryItemForm[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6" data-testid="new-inventory-item-page">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/inventory")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Inventory Item</h1>
          <p className="text-muted-foreground">Add a new medication to inventory</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Medication Information */}
          <Card>
            <CardHeader>
              <CardTitle>Medication Information</CardTitle>
              <CardDescription>Enter the medication details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Brand Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="e.g., Metformin 500mg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genericName">
                    Generic Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="genericName"
                    value={formData.genericName}
                    onChange={(e) => updateField("genericName", e.target.value)}
                    placeholder="e.g., Metformin Hydrochloride"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    placeholder="e.g., Antidiabetic"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => updateField("status", value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      <SelectItem value="on_order">On Order</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">
                  Supplier <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => updateField("supplier", e.target.value)}
                  placeholder="e.g., PharmaCorp"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Information</CardTitle>
              <CardDescription>Enter quantity and stock levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    Current Quantity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => updateField("quantity", parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">
                    Minimum Stock Level <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="minStock"
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => updateField("minStock", parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">
                    Unit <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => updateField("unit", e.target.value)}
                    placeholder="e.g., tablets, capsules"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">
                    Expiry Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => updateField("expiryDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Unit Price (₹) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => updateField("price", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/inventory")}
              disabled={createItemMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createItemMutation.isPending}
              data-testid="button-save-item"
            >
              {createItemMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Add Item
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
