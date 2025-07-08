
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
    
    operations.forEach(op => {
      // Contar status
      statusCounts[op.status] = (statusCounts[op.status] || 0) + 1;
      
      // Encontrar operações suspeitas (cartão de crédito com status de aguardando)
      if (op.payment_method === 'credit_card' && 
          (op.status === 'waiting_payment' || op.status === 'pending')) {
        suspiciousOperations.push(op);
      }
    });
    
    const results = {
      totalOperations: operations.length,
      statusCounts,
      suspiciousOperations: suspiciousOperations.slice(0, 10), // Primeiras 10
      recommendations: []
    };
    
    // Gerar recomendações
    if (suspiciousOperations.length > 0) {
      results.recommendations.push(`${suspiciousOperations.length} operações de cartão de crédito com status suspeito`);
    }
    
    console.log('🔍 [DIAGNOSTIC] Resultados:', results);
    setDiagnosticResults(results);
    
    toast({
      title: "Diagnóstico concluído",
      description: `Analisadas ${operations.length} operações`,
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
    if (!diagnosticResults?.suspiciousOperations?.length) {
      toast({
        title: "Nada para corrigir",
        description: "Execute o diagnóstico primeiro",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🔧 [AUTO_FIX] Corrigindo operações suspeitas...');
      
      const updates = diagnosticResults.suspiciousOperations.map((op: any) => ({
        external_id: op.external_id,
        status: 'captured', // Assumir que cartão de crédito processado = captured
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        await supabase
          .from('pagarme_operations')
          .update({ 
            status: update.status,
            updated_at: update.updated_at
          })
          .eq('external_id', update.external_id);
      }

      toast({
        title: "Correção automática concluída",
        description: `${updates.length} operações corrigidas`,
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
                  <p className="text-sm text-gray-400">Operações Suspeitas</p>
                  <p className="text-lg font-bold text-yellow-400">{diagnosticResults.suspiciousOperations.length}</p>
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

              {diagnosticResults.suspiciousOperations.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-yellow-400" />
                    <p className="text-sm text-yellow-400">Operações Suspeitas (Cartão com status de aguardando):</p>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {diagnosticResults.suspiciousOperations.map((op: any) => (
                      <div key={op.external_id} className="text-xs text-gray-300 p-2 bg-gray-700 rounded">
                        ID: {op.external_id} | Status: {op.status} | Valor: R$ {op.amount.toFixed(2)}
                      </div>
                    ))}
                  </div>
                  <Button onClick={autoFixSuspicious} disabled={loading} className="w-full bg-yellow-600 hover:bg-yellow-700">
                    {loading ? <RefreshCw size={16} className="animate-spin mr-2" /> : null}
                    Corrigir Automaticamente
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
