import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { InstallPWAPrompt } from "@/components/InstallPWAPrompt";
import LoadingSpinner from "@/components/LoadingSpinner";

// Eager load - critical paths
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load - secondary paths
const WilayahPage = lazy(() => import("./pages/WilayahPage"));
const WarungPage = lazy(() => import("./pages/WarungPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderTrackingPage = lazy(() => import("./pages/OrderTrackingPage"));
const OrderHistoryPage = lazy(() => import("./pages/OrderHistoryPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

// Lazy load - dashboard pages (heavy)
const CustomerDashboard = lazy(() => import("./pages/dashboard/CustomerDashboard"));
const DriverDashboard = lazy(() => import("./pages/dashboard/DriverDashboard"));
const MitraDashboard = lazy(() => import("./pages/dashboard/MitraDashboard"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <InstallPWAPrompt />
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Critical paths - eager loaded */}
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Secondary paths - lazy loaded */}
              <Route path="/wilayah/:slug" element={<WilayahPage />} />
              <Route path="/warung/:id" element={<WarungPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order/:orderId" element={<OrderTrackingPage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* Dashboard paths - lazy loaded */}
              <Route path="/dashboard/pelanggan" element={<CustomerDashboard />} />
              <Route path="/dashboard/customer" element={<CustomerDashboard />} />
              <Route path="/dashboard/driver" element={<DriverDashboard />} />
              <Route path="/dashboard/mitra" element={<MitraDashboard />} />
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
