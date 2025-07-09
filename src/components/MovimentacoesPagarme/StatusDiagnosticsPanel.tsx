
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useStatusDiagnostics } from './hooks/useStatusDiagnostics';
import { Search, RefreshCw, CheckCircle, AlertTriangle, Clock, Zap } from 'lucide-react';

interface StatusDiagnosticsPanelProps {
  onRefresh: () => void;
}

export const StatusDiagnosticsPanel: React.FC<StatusDiagnosticsPanelProps> = ({ onRefresh }) => {
  const { diagnostics, loading, runDiagnostics, applyCorrections } = useStatusDiagnostics();
  const [selectedCorrections, setSelectedCorrections] = useState<string[]>([]);

  const anomalies = diagnostics.filter(d => d.is_anomaly);
  const highConfidenceCorrections = diagnostics.filter(d => d.confidence >= 85 && d.is_anomaly);

  const handleSelectionChange = (externalId: string, checked: boolean) => {
    if (checked) {
      setSelectedCorrections(prev => [...prev, externalId]);
    } else {
      setSelectedCorrections(prev => prev.filter(id => id !== externalId));
    }
  };

  const handleApplySelected = async () => {
    const corrections = diagnostics.filter(d => selectedCorrections.includes(d.external_id));
    await applyCorrections(corrections);
    setSelectedCorrections([]);
    onRefresh();
  };

  const handleAutoFix = async () => {
    await applyCorrections(highConfidenceCorrections);
    setSelectedCorrections([]);
    onRefresh();
  };

  const getStatusColor = (diagnostic: any) => {
    if (diagnostic.confidence >= 95) return 'text-green-400';
    if (diagnostic.confidence >= 85) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 95) return <Badge className="bg-green-900 text-green-300">Alta Confiança</Badge>;
    if (confidence >= 85) return <Badge className="bg-yellow-900 text-yellow-300">Média Confiança</Badge>;
    return <Badge className="bg-orange-900 text-orange-300">Baixa Confiança</Badge>;
  };

  return (
    <Card className="bg-[#1a1a1a] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Search size={20} />
          Diagnóstico Inteligente de Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controles */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={runDiagnostics} disabled={loading} variant="outline">
            {loading ? <RefreshCw size={16} className="animate-spin mr-2" /> : <Search size={16} className="mr-2" />}
            Analisar Operações
          </Button>
          
          {highConfidenceCorrections.length > 0 && (
            <Button onClick={handleAutoFix} disabled={loading} className="bg-green-600 hover:bg-green-700">
              <Zap size={16} className="mr-2" />
              Correção Automática ({highConfidenceCorrections.length})
            </Button>
          )}
          
          {selectedCorrections.length > 0 && (
            <Button onClick={handleApplySelected} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              <CheckCircle size={16} className="mr-2" />
              Aplicar Selecionadas ({selectedCorrections.length})
            </Button>
          )}
        </div>

        {/* Resumo */}
        {diagnostics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-800 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{diagnostics.length}</p>
              <p className="text-sm text-gray-400">Total Analisadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{anomalies.length}</p>
              <p className="text-sm text-gray-400">Anomalias</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{highConfidenceCorrections.length}</p>
              <p className="text-sm text-gray-400">Alta Confiança</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{diagnostics.filter(d => d.api_status).length}</p>
              <p className="text-sm text-gray-400">Verificadas na API</p>
            </div>
          </div>
        )}

        {/* Lista de Anomalias */}
        {anomalies.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-400" />
              Anomalias Detectadas ({anomalies.length})
            </h3>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {anomalies.map((diagnostic) => (
                <div key={diagnostic.external_id} className="p-3 bg-gray-800 rounded border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedCorrections.includes(diagnostic.external_id)}
                        onCheckedChange={(checked) => handleSelectionChange(diagnostic.external_id, !!checked)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-white">{diagnostic.external_id}</span>
                          {getConfidenceBadge(diagnostic.confidence)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-gray-400">Status Atual:</span>
                            <Badge variant="destructive" className="ml-1">{diagnostic.current_status}</Badge>
                          </div>
                          <div>
                            <span className="text-gray-400">Sugerido:</span>
                            <Badge className={`ml-1 ${getStatusColor(diagnostic)}`}>{diagnostic.suggested_status}</Badge>
                          </div>
                          <div>
                            <span className="text-gray-400">Valor:</span>
                            <span className="text-white ml-1">R$ {diagnostic.amount.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-gray-400" />
                            <span className="text-gray-300">{diagnostic.hours_since_creation.toFixed(1)}h</span>
                          </div>
                        </div>
                        
                        {diagnostic.api_status && (
                          <div className="mt-2 text-xs">
                            <span className="text-green-400">✓ API Status:</span>
                            <Badge className="ml-1 bg-green-900 text-green-300">{diagnostic.api_status}</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {diagnostics.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-400">
            <Search size={48} className="mx-auto mb-4 opacity-50" />
            <p>Clique em "Analisar Operações" para iniciar o diagnóstico</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
