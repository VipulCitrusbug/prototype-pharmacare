import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/common";
import { Package, Search, Plus, AlertTriangle, TrendingDown } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  genericName: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string;
  expiryDate: Date;
  supplier: string;
  price: number;
}

const mockInventory: InventoryItem[] = [
  {
    id: "inv-001",
    name: "Metformin 500mg",
    genericName: "Metformin Hydrochloride",
    category: "Antidiabetic",
    quantity: 450,
    minStock: 100,
    unit: "tablets",
    expiryDate: new Date("2026-06-15"),
    supplier: "PharmaCorp",
    price: 0.15,
  },
  {
    id: "inv-002",
    name: "Lisinopril 10mg",
    genericName: "Lisinopril",
    category: "Antihypertensive",
    quantity: 85,
    minStock: 100,
    unit: "tablets",
    expiryDate: new Date("2025-08-20"),
    supplier: "MedSupply Inc",
    price: 0.22,
  },
  {
    id: "inv-003",
    name: "Amoxicillin 250mg",
    genericName: "Amoxicillin",
    category: "Antibiotic",
    quantity: 320,
    minStock: 150,
    unit: "capsules",
    expiryDate: new Date("2025-03-10"),
    supplier: "PharmaCorp",
    price: 0.18,
  },
  {
    id: "inv-004",
    name: "Omeprazole 20mg",
    genericName: "Omeprazole",
    category: "Proton Pump Inhibitor",
    quantity: 200,
    minStock: 80,
    unit: "capsules",
    expiryDate: new Date("2026-01-25"),
    supplier: "HealthMeds",
    price: 0.35,
  },
  {
    id: "inv-005",
    name: "Atorvastatin 20mg",
    genericName: "Atorvastatin Calcium",
    category: "Statin",
    quantity: 45,
    minStock: 100,
    unit: "tablets",
    expiryDate: new Date("2025-11-30"),
    supplier: "MedSupply Inc",
    price: 0.28,
  },
];

function getStockStatus(item: InventoryItem): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  // If item has a manual status set, use that with appropriate styling
  if (item.status) {
    switch (item.status) {
      case "available":
        return { label: "Available", variant: "default" };
      case "out_of_stock":
        return { label: "Out of Stock", variant: "destructive" };
      case "on_order":
        return { label: "On Order", variant: "secondary" };
      case "discontinued":
        return { label: "Discontinued", variant: "outline" };
      default:
        break;
    }
  }
  
  // Fallback to calculated stock status based on quantity
  if (item.quantity <= item.minStock * 0.5) {
    return { label: "Critical", variant: "destructive" };
  }
  if (item.quantity <= item.minStock) {
    return { label: "Low Stock", variant: "secondary" };
  }
  return { label: "In Stock", variant: "default" };
}

function isExpiringSoon(date: Date): boolean {
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  return date <= threeMonthsFromNow;
}

export default function InventoryPage() {
  const [, setLocation] = useLocation();
  
  const { data: inventory = [], isLoading, error } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
    queryFn: async () => {
      const response = await fetch("/api/inventory");
      if (!response.ok) {
        throw new Error("Failed to fetch inventory");
      }
      const data = await response.json();
      // Convert date strings to Date objects
      return data.map((item: any) => ({
        ...item,
        expiryDate: new Date(item.expiryDate),
      }));
    },
  });

  const lowStockCount = inventory.filter(i => i.quantity <= i.minStock).length;
  const expiringSoonCount = inventory.filter(i => isExpiringSoon(i.expiryDate)).length;

  if (error) {
    return <ErrorState message="Failed to load inventory data" />;
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6" data-testid="page-inventory">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage medication stock levels</p>
        </div>
        <Button 
          data-testid="button-add-item"
          onClick={() => setLocation("/inventory/new")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{inventory.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber/10">
              <TrendingDown className="w-6 h-6 text-amber" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold">{lowStockCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-danger/10">
              <AlertTriangle className="w-6 h-6 text-danger" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
              <p className="text-2xl font-bold">{expiringSoonCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Stock Items</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                className="pl-9"
                data-testid="input-search-inventory"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Medication</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Quantity</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Expiry</th>
                  <th className="pb-3 font-medium">Supplier</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const status = getStockStatus(item);
                  const expiring = isExpiringSoon(item.expiryDate);
                  return (
                    <tr key={item.id} className="border-b hover-elevate" data-testid={`row-inventory-${item.id}`}>
                      <td className="py-4">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.genericName}</p>
                        </div>
                      </td>
                      <td className="py-4 text-sm">{item.category}</td>
                      <td className="py-4">
                        <span className="font-medium">{item.quantity}</span>
                        <span className="text-muted-foreground"> {item.unit}</span>
                      </td>
                      <td className="py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="py-4">
                        <span className={expiring ? "text-danger" : ""}>
                          {item.expiryDate.toLocaleDateString()}
                        </span>
                        {expiring && <AlertTriangle className="inline w-4 h-4 ml-1 text-danger" />}
                      </td>
                      <td className="py-4 text-sm">{item.supplier}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
