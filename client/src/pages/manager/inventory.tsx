import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Brain,
  Calendar,
  Check,
  Package,
  Search,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  expiryDate: string;
  daysToExpiry: number;
  demandForecast: number;
  reorderQty: number;
  reorderUrgency: "critical" | "high" | "medium" | "low";
  aiConfidence: number;
  category: string;
}

const mockInventory: InventoryItem[] = [
  {
    id: "inv-1",
    name: "Amoxicillin 500mg",
    sku: "AMX-500",
    currentStock: 240,
    minStock: 100,
    maxStock: 500,
    expiryDate: "2025-01-28",
    daysToExpiry: 28,
    demandForecast: 180,
    reorderQty: 0,
    reorderUrgency: "critical",
    aiConfidence: 94,
    category: "Antibiotics",
  },
  {
    id: "inv-2",
    name: "Lisinopril 10mg",
    sku: "LIS-10",
    currentStock: 45,
    minStock: 80,
    maxStock: 300,
    expiryDate: "2025-08-15",
    daysToExpiry: 227,
    demandForecast: 120,
    reorderQty: 200,
    reorderUrgency: "critical",
    aiConfidence: 92,
    category: "Cardiovascular",
  },
  {
    id: "inv-3",
    name: "Metformin 1000mg",
    sku: "MET-1000",
    currentStock: 320,
    minStock: 150,
    maxStock: 600,
    expiryDate: "2025-12-30",
    daysToExpiry: 364,
    demandForecast: 200,
    reorderQty: 100,
    reorderUrgency: "low",
    aiConfidence: 89,
    category: "Diabetes",
  },
  {
    id: "inv-4",
    name: "Atorvastatin 20mg",
    sku: "ATV-20",
    currentStock: 180,
    minStock: 100,
    maxStock: 400,
    expiryDate: "2025-06-20",
    daysToExpiry: 171,
    demandForecast: 90,
    reorderQty: 0,
    reorderUrgency: "low",
    aiConfidence: 91,
    category: "Cardiovascular",
  },
  {
    id: "inv-5",
    name: "Omeprazole 20mg",
    sku: "OMP-20",
    currentStock: 65,
    minStock: 80,
    maxStock: 250,
    expiryDate: "2025-09-10",
    daysToExpiry: 253,
    demandForecast: 100,
    reorderQty: 150,
    reorderUrgency: "high",
    aiConfidence: 87,
    category: "Gastrointestinal",
  },
  {
    id: "inv-6",
    name: "Gabapentin 300mg",
    sku: "GAB-300",
    currentStock: 12,
    minStock: 50,
    maxStock: 200,
    expiryDate: "2025-11-05",
    daysToExpiry: 309,
    demandForecast: 40,
    reorderQty: 100,
    reorderUrgency: "critical",
    aiConfidence: 93,
    category: "Neurology",
  },
];

export default function ManagerInventoryPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("forecasts");
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = filteredInventory.filter((i) => i.currentStock < i.minStock);
  const expiryRiskItems = filteredInventory.filter((i) => i.daysToExpiry <= 60);
  const reorderItems = filteredInventory.filter((i) => i.reorderQty > 0);

  const getStockLevel = (item: InventoryItem) => {
    return Math.round((item.currentStock / item.maxStock) * 100);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "destructive";
      case "high":
        return "secondary";
      case "medium":
        return "outline";
      default:
        return "outline";
    }
  };

  const handleApproveReorder = (id: string) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = item.currentStock + item.reorderQty;
          return {
            ...item,
            currentStock: newStock,
            reorderQty: 0,
          };
        }
        return item;
      })
    );

    toast({
      title: "Reorder Approved",
      description: "Inventory stock has been updated successfully.",
    });
  };

  const handleTransferStock = (id: string) => {
    toast({
      title: "Stock Transfer Initiated",
      description: "Transfer request has been sent for approval.",
    });
  };

  const handleMarkForReview = (id: string) => {
    toast({
      title: "Marked for Review",
      description: "Item has been flagged for manual inspection.",
    });
  };

  return (
    <div className="space-y-6" data-testid="manager-inventory-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Intelligence</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            AI-powered demand forecasting and optimization
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-danger/10">
                <AlertTriangle className="w-5 h-5 text-danger" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lowStockItems.length}</p>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{expiryRiskItems.length}</p>
                <p className="text-sm text-muted-foreground">Expiry Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <ShoppingCart className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reorderItems.length}</p>
                <p className="text-sm text-muted-foreground">Reorder Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Check className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">87%</p>
                <p className="text-sm text-muted-foreground">Inventory Health</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search medications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-inventory"
          />
        </div>
      </div>

      <Tabs defaultValue="forecasts" onValueChange={setSelectedTab}>
        <TabsList data-testid="tabs-inventory">
          <TabsTrigger value="forecasts" data-testid="button-tab-forecasts">
            Demand Forecasts
          </TabsTrigger>
          <TabsTrigger value="reorder" data-testid="button-tab-reorder">
            Reorder Recommendations
          </TabsTrigger>
          <TabsTrigger value="expiry" data-testid="button-tab-expiry">
            Expiry Risk
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecasts" className="mt-6">
          <div className="space-y-4">
            {filteredInventory.map((item) => (
              <Card key={item.id} data-testid={`inventory-item-${item.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{item.name}</h3>
                        <Badge variant="outline">{item.sku}</Badge>
                        <Badge variant="secondary">{item.category}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Stock</p>
                          <p className="text-lg font-semibold">{item.currentStock} units</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">30-Day Forecast</p>
                          <p className="text-lg font-semibold flex items-center gap-1">
                            {item.demandForecast} units
                            <TrendingUp className="w-4 h-4 text-success" />
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Stock Level</p>
                          <div className="flex items-center gap-2">
                            <Progress value={getStockLevel(item)} className="h-2 flex-1" />
                            <span className="text-sm font-medium">{getStockLevel(item)}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">AI Confidence</p>
                          <p className="text-lg font-semibold flex items-center gap-1">
                            <Brain className="w-4 h-4 text-accent" />
                            {item.aiConfidence}%
                          </p>
                        </div>
                      </div>
                    </div>
                    {item.currentStock < item.minStock && (
                      <Badge variant="destructive">
                        <ArrowDown className="w-3 h-3 mr-1" />
                        Below Min
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reorder" className="mt-6">
          <div className="space-y-4">
            {reorderItems.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Check className="w-12 h-12 mx-auto text-success mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Reorders Needed</h3>
                  <p className="text-muted-foreground">Inventory levels are optimal.</p>
                </CardContent>
              </Card>
            ) : (
              reorderItems.map((item) => (
                <Card key={item.id} data-testid={`reorder-item-${item.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{item.name}</h3>
                          <Badge variant={getUrgencyColor(item.reorderUrgency) as any}>
                            {item.reorderUrgency} priority
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Current Stock</p>
                            <p className="text-lg font-semibold">{item.currentStock}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">AI Suggested Qty</p>
                            <p className="text-lg font-semibold text-accent">{item.reorderQty} units</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Confidence</p>
                            <p className="text-lg font-semibold">{item.aiConfidence}%</p>
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => handleApproveReorder(item.id)} data-testid={`button-approve-reorder-${item.id}`}>
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="expiry" className="mt-6">
          <div className="space-y-4">
            {expiryRiskItems.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Check className="w-12 h-12 mx-auto text-success mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Expiry Risks</h3>
                  <p className="text-muted-foreground">All medications have sufficient shelf life.</p>
                </CardContent>
              </Card>
            ) : (
              expiryRiskItems.map((item) => (
                <Card key={item.id} className="border-amber-500/50" data-testid={`expiry-item-${item.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{item.name}</h3>
                          <Badge className="bg-amber-500 text-white">
                            <Calendar className="w-3 h-3 mr-1" />
                            {item.daysToExpiry} days
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Units at Risk</p>
                            <p className="text-lg font-semibold">{item.currentStock}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Expiry Date</p>
                            <p className="text-lg font-semibold">{item.expiryDate}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Monthly Demand</p>
                            <p className="text-lg font-semibold">{item.demandForecast}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleTransferStock(item.id)} data-testid={`button-transfer-${item.id}`}>
                          Transfer Stock
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleMarkForReview(item.id)} data-testid={`button-review-${item.id}`}>
                          Mark for Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        </Tabs>
    </div>
  );
}
