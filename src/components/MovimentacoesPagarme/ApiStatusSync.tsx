import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface ApiStatusSyncProps {
  onRefresh: () => void;
}

export const ApiStatusSync: React.FC<ApiStatusSyncProps> = ({ onRefresh }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [syncResults, setSyncResults] = useState<string>('');
  const { toast } = useToast();

  const syncStatusFromApi = async () => {
    setIsProcessing(true);
    setSyncResults('');

    try {
      // Primeiro, verificar quantas operações temos com problema
      const { data: problemOperations, error: queryError } = await supabase
        .from('pagarme_operations')
        .select('external_id, status, payment_method, created_at, amount')
        .eq('payment_method', 'credit_card')
        .eq('status', 'waiting_funds')
        .gte('created_at', '2025-07-08')
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      if (!problemOperations || problemOperations.length === 0) {
        setSyncResults('✅ Nenhuma operação com problema detectada');
        toast({
          title: "Sincronização desnecessária",
          description: "Todas as operações estão com status correto"
        });
        return;
      }

      // Buscar API keys salvas
      let apiKey = localStorage.getItem('pagarme_api_key');
      if (!apiKey) {
        throw new Error('Chave API não encontrada. Configure primeiro.');
      }

      let correctedCount = 0;
      let failedCount = 0;
      const results = [`🔄 Iniciando sincronização de ${problemOperations.length} operações...`];

      // Processar em lotes de 10 para não sobrecarregar a API
      const batchSize = 10;
      for (let i = 0; i < problemOperations.length; i += batchSize) {
        const batch = problemOperations.slice(i, i + batchSize);
        results.push(`\n📦 Processando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(problemOperations.length/batchSize)}...`);

        const promises = batch.map(async (operation) => {
          try {
            // Consultar status na API do Pagar.me
            const response = await fetch('/api/pagarme-proxy', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                endpoint: `/core/v5/payables/${operation.external_id}`,
                apiKey: apiKey
              })
            });

            if (!response.ok) {
              throw new Error(`API error: ${response.status}`);
            }

            const apiData = await response.json();
            const realStatus = apiData.status;

            // Se o status na API for diferente do banco, atualizar
            if (realStatus && realStatus !== operation.status) {
              const { error: updateError } = await supabase
                .from('pagarme_operations')
                .update({ status: realStatus })
                .eq('external_id', operation.external_id);

              if (updateError) throw updateError;

              results.push(`✅ ${operation.external_id}: ${operation.status} → ${realStatus}`);
              return { success: true, operation: operation.external_id, oldStatus: operation.status, newStatus: realStatus };
            } else {
              results.push(`ℹ️ ${operation.external_id}: status já correto (${realStatus})`);
              return { success: true, operation: operation.external_id, noChange: true };
            }
          } catch (error) {
            results.push(`❌ ${operation.external_id}: ${error.message}`);
            return { success: false, operation: operation.external_id, error: error.message };
          }
        });

        const batchResults = await Promise.allSettled(promises);
        
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            if (result.value.success && !result.value.noChange) {
              correctedCount++;
            }
          } else {
            failedCount++;
          }
        });

        // Pequena pausa entre lotes
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      results.push(`\n📊 Resultado Final:`);
      results.push(`✅ Corrigidas: ${correctedCount}`);
      results.push(`❌ Falhas: ${failedCount}`);
      results.push(`📝 Total processadas: ${problemOperations.length}`);

      setSyncResults(results.join('\n'));

      toast({
        title: "✅ Sincronização Concluída",
        description: `${correctedCount} operações corrigidas, ${failedCount} falhas`
      });

      if (correctedCount > 0) {
        onRefresh();
      }

    } catch (error: any) {
      console.error('Erro na sincronização:', error);
      setSyncResults(`❌ Erro: ${error.message}`);
      toast({
        title: "Erro na sincronização",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Sincronização de Status com API
        </CardTitle>
        <CardDescription>
          Corrige status desatualizados consultando diretamente a API do Pagar.me
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="text-sm text-muted-foreground">
            Identifica e corrige operações de cartão com status "waiting_funds" desde 08/07/2025
          </span>
        </div>

        <Button 
          onClick={syncStatusFromApi}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Sincronizar Status com API
            </>
          )}
        </Button>

        {syncResults && (
          <div className="space-y-2">
            <Badge variant="outline">Resultados da Sincronização</Badge>
            <Textarea
              value={syncResults}
              readOnly
              className="min-h-[200px] font-mono text-xs"
              placeholder="Os resultados da sincronização aparecerão aqui..."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};