import { useState } from "react";
import { format, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common";
import {
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  Pill,
  Store,
  Truck,
} from "lucide-react";

interface Order {
  id: string;
  medication: string;
  dosage: string;
  quantity: string;
  status: "requested" | "processing" | "ready" | "out_for_delivery" | "completed";
  deliveryType: "delivery" | "pickup";
  requestedDate: string;
  estimatedDate: string;
  completedDate?: string;
  address?: string;
  trackingNumber?: string;
  progress: number;
}

const mockOrders: Order[] = [
  {
    id: "order-1",
    medication: "Metformin",
    dosage: "500mg",
    quantity: "60 tablets",
    status: "processing",
    deliveryType: "delivery",
    requestedDate: format(new Date(), "MMM d, yyyy"),
    estimatedDate: format(addDays(new Date(), 2), "MMM d, yyyy"),
    address: "123 Main Street, Apt 4B, San Francisco, CA 94102",
    progress: 60,
  },
  {
    id: "order-2",
    medication: "Atorvastatin",
    dosage: "20mg",
    quantity: "30 tablets",
    status: "ready",
    deliveryType: "pickup",
    requestedDate: format(new Date(), "MMM d, yyyy"),
    estimatedDate: format(addDays(new Date(), 1), "MMM d, yyyy"),
    progress: 80,
  },
  {
    id: "order-3",
    medication: "Lisinopril",
    dosage: "10mg",
    quantity: "90 tablets",
    status: "completed",
    deliveryType: "delivery",
    requestedDate: "Dec 1, 2025",
    estimatedDate: "Dec 5, 2025",
    completedDate: "Dec 4, 2025",
    trackingNumber: "1Z999AA10123456784",
    progress: 100,
  },
  {
    id: "order-4",
    medication: "Omeprazole",
    dosage: "20mg",
    quantity: "30 capsules",
    status: "completed",
    deliveryType: "pickup",
    requestedDate: "Nov 15, 2025",
    estimatedDate: "Nov 18, 2025",
    completedDate: "Nov 17, 2025",
    progress: 100,
  },
];

const statusConfig = {
  requested: { label: "Requested", color: "secondary", icon: Clock },
  processing: { label: "Processing", color: "secondary", icon: Package },
  ready: { label: "Ready", color: "default", icon: CheckCircle },
  out_for_delivery: { label: "Out for Delivery", color: "default", icon: Truck },
  completed: { label: "Completed", color: "outline", icon: CheckCircle },
};

export default function PatientOrdersPage() {
  const [activeTab, setActiveTab] = useState("active");

  const activeOrders = mockOrders.filter((o) => o.status !== "completed");
  const completedOrders = mockOrders.filter((o) => o.status === "completed");

  const filteredOrders = activeTab === "active" ? activeOrders : completedOrders;

  return (
    <div className="space-y-6" data-testid="patient-orders-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order Status</h1>
          <p className="text-muted-foreground">Track your prescription orders</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-orders">
          <TabsTrigger value="active" data-testid="button-tab-active-orders">
            Active ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="button-tab-completed-orders">
            Completed ({completedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredOrders.length === 0 ? (
            <EmptyState
              icon="inbox"
              title={activeTab === "active" ? "No Active Orders" : "No Completed Orders"}
              description={
                activeTab === "active"
                  ? "When you request a refill, your order status will appear here"
                  : "Your completed orders will appear here"
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const StatusIcon = statusConfig[order.status].icon;

                return (
                  <Card key={order.id} data-testid={`order-card-${order.id}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 rounded-full bg-clinical/10 text-clinical">
                            <Pill className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                              <h3 className="font-semibold text-foreground text-lg">
                                {order.medication}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {order.dosage}
                              </Badge>
                              <Badge
                                variant={statusConfig[order.status].color as any}
                                className="flex items-center gap-1"
                              >
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig[order.status].label}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4">
                              {order.quantity}
                            </p>

                            {order.status !== "completed" && (
                              <div className="mb-4">
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-muted-foreground">Order Progress</span>
                                  <span className="font-medium">{order.progress}%</span>
                                </div>
                                <Progress value={order.progress} className="h-2" />
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Requested:</span>
                                <span className="font-medium">{order.requestedDate}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                {order.status === "completed" ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-success" />
                                    <span className="text-muted-foreground">Completed:</span>
                                    <span className="font-medium">{order.completedDate}</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Estimated:</span>
                                    <span className="font-medium">{order.estimatedDate}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-border">
                              <div className="flex items-start gap-2">
                                {order.deliveryType === "delivery" ? (
                                  <>
                                    <Truck className="w-4 h-4 text-info mt-0.5" />
                                    <div>
                                      <p className="text-sm font-medium">Home Delivery</p>
                                      {order.address && (
                                        <p className="text-sm text-muted-foreground">
                                          {order.address}
                                        </p>
                                      )}
                                      {order.trackingNumber && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          Tracking: {order.trackingNumber}
                                        </p>
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <Store className="w-4 h-4 text-clinical mt-0.5" />
                                    <div>
                                      <p className="text-sm font-medium">In-Store Pickup</p>
                                      <p className="text-sm text-muted-foreground">
                                        PharmaCare Plus - Downtown
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {order.status !== "completed" && (
                          <div className="flex flex-col gap-4 min-w-[200px]">
                            <div className="p-4 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-2">Status Timeline</p>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-success" />
                                  <span>Order Placed</span>
                                </div>
                                <div
                                  className={`flex items-center gap-2 text-sm ${
                                    order.progress >= 50
                                      ? "text-foreground"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {order.progress >= 50 ? (
                                    <CheckCircle className="w-4 h-4 text-success" />
                                  ) : (
                                    <Clock className="w-4 h-4" />
                                  )}
                                  <span>Processing</span>
                                </div>
                                <div
                                  className={`flex items-center gap-2 text-sm ${
                                    order.progress >= 80
                                      ? "text-foreground"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {order.progress >= 80 ? (
                                    <CheckCircle className="w-4 h-4 text-success" />
                                  ) : (
                                    <Package className="w-4 h-4" />
                                  )}
                                  <span>Ready</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  {order.deliveryType === "delivery" ? (
                                    <Truck className="w-4 h-4" />
                                  ) : (
                                    <Store className="w-4 h-4" />
                                  )}
                                  <span>
                                    {order.deliveryType === "delivery" ? "Delivered" : "Picked Up"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
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
