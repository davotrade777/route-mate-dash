import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Home from "./pages/Home";
import Index from "./pages/Index";
import TruckAssignmentPage from "./pages/TruckAssignmentPage";
import RouteOptimizationPage from "./pages/RouteOptimizationPage";
import FreightSummaryPage from "./pages/FreightSummaryPage";
import AssignedFreightsPage from "./pages/AssignedFreightsPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/orders" element={<Index />} />
            <Route path="/truck-assignment" element={<TruckAssignmentPage />} />
            <Route path="/route-optimization" element={<RouteOptimizationPage />} />
            <Route path="/freight-summary" element={<FreightSummaryPage />} />
            <Route path="/assigned-freights" element={<AssignedFreightsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
