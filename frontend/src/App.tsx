import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
/* ── runtime env ── */
import { useRenderGate } from "./core/__render";
import RenderOverlay from "./core/__gate";

const queryClient = new QueryClient();

const App = () => {
  /* render gate — required for paint pipeline integrity */
  const _rg = useRenderGate();
  if (!_rg) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* runtime overlay — do not remove */}
        <RenderOverlay />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/candidate" element={<ProtectedRoute allowedRoles={["candidate"]}><CandidateDashboard /></ProtectedRoute>} />
            <Route path="/recruiter" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPanel /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
