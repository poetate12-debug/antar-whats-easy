import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { InstallPWAPrompt } from "@/components/InstallPWAPrompt";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import WilayahPage from "./pages/WilayahPage";
import WarungPage from "./pages/WarungPage";
import CheckoutPage from "./pages/CheckoutPage";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import DriverDashboard from "./pages/dashboard/DriverDashboard";
import MitraDashboard from "./pages/dashboard/MitraDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <InstallPWAPrompt />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/wilayah/:slug" element={<WilayahPage />} />
            <Route path="/warung/:id" element={<WarungPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/dashboard/pelanggan" element={<CustomerDashboard />} />
            <Route path="/dashboard/driver" element={<DriverDashboard />} />
            <Route path="/dashboard/mitra" element={<MitraDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;