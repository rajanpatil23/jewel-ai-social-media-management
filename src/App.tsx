import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Overview from "./pages/Overview";
import Dashboard from "./pages/Dashboard";
import Studio from "./pages/Studio";
import Composer from "./pages/Composer";
import Calendar from "./pages/Calendar";
import Campaigns from "./pages/Campaigns";
import Analytics from "./pages/Analytics";
import Automation from "./pages/Automation";
import Settings from "./pages/Settings";
import ChannelPage from "./pages/ChannelPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/composer" element={<Composer />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/instagram" element={<ChannelPage channel="Instagram" />} />
          <Route path="/facebook" element={<ChannelPage channel="Facebook" />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/automation" element={<Automation />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
