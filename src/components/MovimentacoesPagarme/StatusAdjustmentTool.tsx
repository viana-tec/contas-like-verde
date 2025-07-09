
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Settings, RefreshCw, Database, AlertTriangle } from 'lucide-react';

interface StatusAdjustmentToolProps {
  operations: any[];
  onRefresh: () => void;
}

export const StatusAdjustmentTool: React.FC<StatusAdjustmentToolProps> = ({ operations, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [selectedExternalId, setSelectedExternalId] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const { toast } = useToast();

  // Diagnosticar problemas de status
  const runDiagnostic = () => {
    console.log('🔍 [DIAGNOSTIC] Analisando operações...');
    
    const statusCounts: Record<string, number> = {};
    const suspiciousOperations: any[] = [];
    const criticalOperations: any[] = [];
    
    operations.forEach(op => {
      // Contar status
      statusCounts[op.status] = (statusCounts[op.status] || 0) + 1;
      
      // Operações críticas: cartões desde 08/07 com waiting_funds
      const opDate = new Date(op.created_at);
      const criticalDate = new Date('2025-07-08');
      if (op.payment_method === 'credit_card' && 
          op.status === 'waiting_funds' && 
          opDate >= criticalDate) {
        criticalOperations.push(op);
      }
      
      // Operações suspeitas antigas: cartão de crédito com status de aguardando
      if (op.payment_method === 'credit_card' && 
          (op.status === 'waiting_payment' || op.status === 'pending')) {
        suspiciousOperations.push(op);
      }
    });
    
    const results = {
      totalOperations: operations.length,
      statusCounts,
      criticalOperations: criticalOperations.slice(0, 10), // Primeiras 10
      suspiciousOperations: suspiciousOperations.slice(0, 10), // Primeiras 10
      recommendations: []
    };
    
    // Gerar recomendações
    if (criticalOperations.length > 0) {
      results.recommendations.push(`🚨 CRÍTICO: ${criticalOperations.length} operações de cartão desde 08/07 com status incorreto`);
    }
    if (suspiciousOperations.length > 0) {
      results.recommendations.push(`⚠️ ${suspiciousOperations.length} operações antigas de cartão com status suspeito`);
    }
    
    console.log('🔍 [DIAGNOSTIC] Resultados:', results);
    setDiagnosticResults(results);
    
    toast({
      title: criticalOperations.length > 0 ? "🚨 Problema Crítico Detectado" : "Diagnóstico concluído",
      description: `${criticalOperations.length + suspiciousOperations.length} operações com problemas`,
      variant: criticalOperations.length > 0 ? "destructive" : "default"
    });
  };

  // Ajustar status específico
  const adjustStatus = async () => {
    if (!selectedExternalId || !newStatus) {
      toast({
        title: "Erro",
        description: "Selecione uma operação e um novo status",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🔧 [ADJUST] Ajustando status:', { selectedExternalId, newStatus });
      
      const { error } = await supabase
        .from('pagarme_operations')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('external_id', selectedExternalId);

      if (error) throw error;

      toast({
        title: "Status ajustado",
        description: `Operação ${selectedExternalId} alterada para ${newStatus}`,
      });

      onRefresh();
    } catch (error: any) {
      console.error('❌ [ADJUST] Erro:', error);
      toast({
        title: "Erro ao ajustar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Corrigir automaticamente operações suspeitas
  const autoFixSuspicious = async () => {
    if (!diagnosticResults) {
      toast({
        title: "Execute o diagnóstico primeiro",
        variant: "destructive",
      });
      return;
    }

    const criticalOps = diagnosticResults.criticalOperations || [];
    const suspiciousOps = diagnosticResults.suspiciousOperations || [];
    const totalToFix = criticalOps.length + suspiciousOps.length;

    if (totalToFix === 0) {
      toast({
        title: "Nada para corrigir",
        description: "Nenhuma operação problemática encontrada",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🔧 [AUTO_FIX] Corrigindo operações...');
      
      let fixedCount = 0;

      // Corrigir operações críticas (desde 08/07)
      if (criticalOps.length > 0) {
        const criticalUpdates = criticalOps.map((op: any) => op.external_id);
        
        const { error: criticalError } = await supabase
          .from('pagarme_operations')
          .update({ 
            status: 'captured',
            updated_at: new Date().toISOString()
          })
          .in('external_id', criticalUpdates);

        if (criticalError) throw criticalError;
        fixedCount += criticalOps.length;
      }

      // Corrigir operações suspeitas antigas
      if (suspiciousOps.length > 0) {
        const suspiciousUpdates = suspiciousOps.map((op: any) => op.external_id);
        
        const { error: suspiciousError } = await supabase
          .from('pagarme_operations')
          .update({ 
            status: 'captured',
            updated_at: new Date().toISOString()
          })
          .in('external_id', suspiciousUpdates);

        if (suspiciousError) throw suspiciousError;
        fixedCount += suspiciousOps.length;
      }

      toast({
        title: "✅ Correção automática concluída",
        description: `${fixedCount} operações corrigidas (${criticalOps.length} críticas desde 08/07)`,
      });

      onRefresh();
      setDiagnosticResults(null);
    } catch (error: any) {
      console.error('❌ [AUTO_FIX] Erro:', error);
      toast({
        title: "Erro na correção",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-[#1a1a1a] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings size={20} />
          Ferramenta de Ajuste de Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Diagnóstico */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Diagnóstico</h3>
            <Button onClick={runDiagnostic} variant="outline" size="sm">
              <Database size={16} className="mr-2" />
              Analisar
            </Button>
          </div>
          
          {diagnosticResults && (
            <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Total de Operações</p>
                  <p className="text-lg font-bold text-white">{diagnosticResults.totalOperations}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Operações Críticas</p>
                  <p className="text-lg font-bold text-red-400">{(diagnosticResults.criticalOperations || []).length}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-2">Status Encontrados:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(diagnosticResults.statusCounts).map(([status, count]) => (
                    <Badge key={status} variant="outline" className="text-xs">
                      {status}: {count as number}
                    </Badge>
                  ))}
                </div>
              </div>

              {((diagnosticResults.criticalOperations || []).length > 0 || (diagnosticResults.suspiciousOperations || []).length > 0) && (
                <div className="space-y-2">
                  {(diagnosticResults.criticalOperations || []).length > 0 && (
                    <>
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-400" />
                        <p className="text-sm text-red-400">🚨 Operações Críticas (Cartão desde 08/07 com waiting_funds):</p>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {diagnosticResults.criticalOperations.map((op: any) => (
                          <div key={op.external_id} className="text-xs text-gray-300 p-2 bg-red-900/20 rounded border border-red-600">
                            ID: {op.external_id} | Status: {op.status} | Valor: R$ {op.amount.toFixed(2)} | Data: {new Date(op.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {(diagnosticResults.suspiciousOperations || []).length > 0 && (
                    <>
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-yellow-400" />
                        <p className="text-sm text-yellow-400">⚠️ Operações Suspeitas (Cartão com status antigo):</p>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {diagnosticResults.suspiciousOperations.map((op: any) => (
                          <div key={op.external_id} className="text-xs text-gray-300 p-2 bg-yellow-900/20 rounded border border-yellow-600">
                            ID: {op.external_id} | Status: {op.status} | Valor: R$ {op.amount.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  <Button onClick={autoFixSuspicious} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
                    {loading ? <RefreshCw size={16} className="animate-spin mr-2" /> : null}
                    Corrigir {((diagnosticResults.criticalOperations || []).length + (diagnosticResults.suspiciousOperations || []).length)} Operações
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ajuste Manual */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Ajuste Manual</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="external-id" className="text-gray-300">ID Externo da Operação</Label>
              <Input
                id="external-id"
                value={selectedExternalId}
                onChange={(e) => setSelectedExternalId(e.target.value)}
                placeholder="Ex: 8277651027"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="new-status" className="text-gray-300">Novo Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="captured">Captured (Pago)</SelectItem>
                  <SelectItem value="paid">Paid (Pago)</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="refused">Refused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={adjustStatus} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? <RefreshCw size={16} className="animate-spin mr-2" /> : null}
            Ajustar Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
