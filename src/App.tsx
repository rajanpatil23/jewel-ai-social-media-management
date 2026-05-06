import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ImageGen from "./pages/ImageGen";
import PostMeta from "./pages/PostMeta";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Scheduler from "./pages/Scheduler";
import Connections from "./pages/Connections";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ImageGen />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/post" element={<PostMeta />} />
          <Route path="/schedule" element={<Scheduler />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
