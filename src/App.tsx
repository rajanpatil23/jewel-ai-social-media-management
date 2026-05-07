import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import ImageGen from "./pages/ImageGen";
import PostMeta from "./pages/PostMeta";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Scheduler from "./pages/Scheduler";
import Connections from "./pages/Connections";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import DataDeletion from "./pages/DataDeletion";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const protect = (el: JSX.Element) => <ProtectedRoute>{el}</ProtectedRoute>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/data-deletion" element={<DataDeletion />} />
            <Route path="/" element={protect(<ImageGen />)} />
            <Route path="/dashboard" element={protect(<Dashboard />)} />
            <Route path="/post" element={protect(<PostMeta />)} />
            <Route path="/schedule" element={protect(<Scheduler />)} />
            <Route path="/connections" element={protect(<Connections />)} />
            <Route path="/analytics" element={protect(<Analytics />)} />
            <Route path="/settings" element={protect(<Settings />)} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
