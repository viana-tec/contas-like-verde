
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useSmartStatusSync } from './hooks/useSmartStatusSync';
import { RefreshCw, Zap, CheckCircle, XCircle, Activity } from 'lucide-react';

interface SmartStatusSyncProps {
  onRefresh: () => void;
}

export const SmartStatusSync: React.FC<SmartStatusSyncProps> = ({ onRefresh }) => {
  const { progress, results, syncWithAPI, reset } = useSmartStatusSync();

  const handleSync = async () => {
    await syncWithAPI();
    if (progress.status === 'completed') {
      onRefresh();
    }
  };

  const successful = results.filter(r => r.success && r.old_status !== r.new_status);
  const failed = results.filter(r => !r.success);
  const unchanged = results.filter(r => r.success && r.old_status === r.new_status);

  return (
    <Card className="bg-[#1a1a1a] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity size={20} />
          Sincronização Inteligente com API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles */}
        <div className="flex gap-3">
          <Button 
            onClick={handleSync}
            disabled={progress.status === 'running'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {progress.status === 'running' ? (
              <>
                <RefreshCw size={16} className="animate-spin mr-2" />
                Sincronizando...
              </>
            ) : (
              <>
                <Zap size={16} className="mr-2" />
                Sincronizar com API
              </>
            )}
          </Button>

          {progress.status !== 'idle' && progress.status !== 'running' && (
            <Button onClick={reset} variant="outline">
              Limpar Resultados
            </Button>
          )}
        </div>

        {/* Progresso */}
        {progress.status === 'running' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">{progress.operation || 'Preparando...'}</span>
              <span className="text-gray-400">{progress.current}/{progress.total}</span>
            </div>
            <Progress 
              value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0} 
              className="h-2"
            />
          </div>
        )}

        {/* Resumo dos Resultados */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-800 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{successful.length}</p>
              <p className="text-sm text-gray-400">Atualizadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-400">{unchanged.length}</p>
              <p className="text-sm text-gray-400">Sem Mudança</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{failed.length}</p>
              <p className="text-sm text-gray-400">Falhas</p>
            </div>
          </div>
        )}

        {/* Detalhes dos Resultados */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Resultados Detalhados</h3>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {results.map((result, index) => (
                <div key={index} className="p-3 bg-gray-800 rounded border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        result.old_status !== result.new_status ? (
                          <CheckCircle size={16} className="text-green-400" />
                        ) : (
                          <CheckCircle size={16} className="text-gray-400" />
                        )
                      ) : (
                        <XCircle size={16} className="text-red-400" />
                      )}
                      
                      <span className="font-mono text-sm text-white">{result.operation_id}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {result.old_status !== result.new_status ? (
                        <>
                          <Badge variant="outline">{result.old_status}</Badge>
                          <span className="text-gray-400">→</span>
                          <Badge className="bg-green-900 text-green-300">{result.new_status}</Badge>
                        </>
                      ) : (
                        <Badge variant="outline">{result.old_status}</Badge>
                      )}
                    </div>
                  </div>
                  
                  {result.error && (
                    <div className="mt-2 text-xs text-red-300">
                      Erro: {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {progress.status === 'idle' && (
          <div className="text-center py-4 text-gray-400">
            <Activity size={48} className="mx-auto mb-4 opacity-50" />
            <p>Clique em "Sincronizar com API" para verificar status reais</p>
            <p className="text-xs mt-2">Foca automaticamente em operações de cartão com problemas desde 08/07</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
