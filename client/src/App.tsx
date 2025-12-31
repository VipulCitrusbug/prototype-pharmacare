import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider, AppSidebar, TopNavBar, PageLoader } from "@/components/common";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import DashboardPage from "@/pages/dashboard";
import QueuePage from "@/pages/queue";
import PrescriptionDetailPage from "@/pages/prescription-detail";
import PrescriptionReviewPage from "@/pages/prescription-review";
import PrescriptionValidatePage from "@/pages/prescription-validate";
import PrescriptionDispensePage from "@/pages/prescription-dispense";
import PrescriptionDocumentPage from "@/pages/prescription-document";
import PrescriptionCompletePage from "@/pages/prescription-complete";
import InventoryPage from "@/pages/inventory";
import PatientsPage from "@/pages/patients";
import ReportsPage from "@/pages/reports";
import ProfilePage from "@/pages/profile";
import SettingsPage from "@/pages/settings";
import ManagerDashboardPage from "@/pages/manager/dashboard";
import ManagerAlertsPage from "@/pages/manager/alerts";
import ManagerInventoryPage from "@/pages/manager/inventory";
import ManagerInsightsPage from "@/pages/manager/insights";
import ManagerStaffPage from "@/pages/manager/staff";
import ManagerReportsPage from "@/pages/manager/reports";
import PatientDashboardPage from "@/pages/patient/dashboard";
import PatientMedicationsPage from "@/pages/patient/medications";
import PatientMedicationDetailPage from "@/pages/patient/medication-detail";
import PatientOrdersPage from "@/pages/patient/orders";
import PatientNotificationsPage from "@/pages/patient/notifications";
import PatientSettingsPage from "@/pages/patient/settings";
import type { User } from "@shared/schema";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const userQuery = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    staleTime: Infinity,
    retry: false,
  });

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        setLocation("/login");
      } else {
        console.error("Logout failed with status:", response.status);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Redirect to login if not authenticated (using useEffect)
  useEffect(() => {
    if (!userQuery.isLoading && !userQuery.data) {
      setLocation("/login");
    }
  }, [userQuery.isLoading, userQuery.data, setLocation]);

  // Role-based route guard
  useEffect(() => {
    if (!userQuery.isLoading && userQuery.data) {
      const user = userQuery.data;
      const currentPath = location || "/";
      const isManagerRoute = currentPath.startsWith("/manager");
      const isPatientRoute = currentPath.startsWith("/patient");
      
      // Block non-managers from manager routes
      if (isManagerRoute && user.role !== "manager") {
        if (user.role === "patient") {
          setLocation("/patient");
        } else {
          setLocation("/dashboard");
        }
      }
      // Block non-patients from patient routes
      else if (isPatientRoute && user.role !== "patient") {
        if (user.role === "manager") {
          setLocation("/manager");
        } else {
          setLocation("/dashboard");
        }
      }
      // Redirect managers to their portal on root/dashboard
      else if (user.role === "manager" && (currentPath === "/" || currentPath === "/dashboard")) {
        setLocation("/manager");
      }
      // Redirect patients to their portal on root/dashboard
      else if (user.role === "patient" && (currentPath === "/" || currentPath === "/dashboard")) {
        setLocation("/patient");
      }
    }
  }, [userQuery.isLoading, userQuery.data, location, setLocation]);

  if (userQuery.isLoading) {
    return <PageLoader text="Loading..." />;
  }

  const user = userQuery.data;

  // Show loader while redirecting to login
  if (!user) {
    return <PageLoader text="Redirecting to login..." />;
  }

  const userRole = user.role || "pharmacist";
  const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username;

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar
          userRole={userRole as any}
          userName={userName}
          userAvatar={user.avatar}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <TopNavBar user={user} onLogout={handleLogout} />
          <main className="flex-1 overflow-auto p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const [location] = useLocation();

  const isAuthPage = location === "/login" || location === "/signup";

  if (isAuthPage) {
    return (
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <AuthenticatedLayout>
      <Switch>
        {/* Pharmacist routes */}
        <Route path="/" component={DashboardPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/queue" component={QueuePage} />
        <Route path="/prescription/:id" component={PrescriptionDetailPage} />
        <Route path="/prescription/:id/review" component={PrescriptionReviewPage} />
        <Route path="/prescription/:id/validate" component={PrescriptionValidatePage} />
        <Route path="/prescription/:id/dispense" component={PrescriptionDispensePage} />
        <Route path="/prescription/:id/document" component={PrescriptionDocumentPage} />
        <Route path="/prescription/:id/complete" component={PrescriptionCompletePage} />
        <Route path="/inventory" component={InventoryPage} />
        <Route path="/patients" component={PatientsPage} />
        <Route path="/reports" component={ReportsPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/settings" component={SettingsPage} />
        
        {/* Manager routes */}
        <Route path="/manager" component={ManagerDashboardPage} />
        <Route path="/manager/dashboard" component={ManagerDashboardPage} />
        <Route path="/manager/alerts" component={ManagerAlertsPage} />
        <Route path="/manager/inventory" component={ManagerInventoryPage} />
        <Route path="/manager/insights" component={ManagerInsightsPage} />
        <Route path="/manager/staff" component={ManagerStaffPage} />
        <Route path="/manager/reports" component={ManagerReportsPage} />
        
        {/* Patient routes */}
        <Route path="/patient" component={PatientDashboardPage} />
        <Route path="/patient/dashboard" component={PatientDashboardPage} />
        <Route path="/patient/medications" component={PatientMedicationsPage} />
        <Route path="/patient/medications/:id" component={PatientMedicationDetailPage} />
        <Route path="/patient/orders" component={PatientOrdersPage} />
        <Route path="/patient/notifications" component={PatientNotificationsPage} />
        <Route path="/patient/settings" component={PatientSettingsPage} />
        
        <Route component={NotFound} />
      </Switch>
    </AuthenticatedLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="pharmacare-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
