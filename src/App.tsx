
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Contas from "./pages/Contas";
import Usuarios from "./pages/Usuarios";
import Boletos from "./pages/Boletos";
import FolhaSalarial from "./pages/FolhaSalarial";
import Pagamentos from "./pages/Pagamentos";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import Relatorios from "./pages/Relatorios";
import MovimentacoesPagarme from "./pages/MovimentacoesPagarme";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/contas" element={<Contas />} />
          <Route path="/boletos" element={<Boletos />} />
          <Route path="/pagamentos" element={<Pagamentos />} />
          <Route path="/folha-salarial" element={<FolhaSalarial />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/movimentacoes-pagarme" element={<MovimentacoesPagarme />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
