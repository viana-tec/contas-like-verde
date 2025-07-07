import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface ApiDiagnosticsProps {
  apiKey: string;
  totalOperations: number;
  totalTransactions: number;
}

export const ApiDiagnostics: React.FC<ApiDiagnosticsProps> = ({ 
  apiKey, 
  totalOperations, 
  totalTransactions 
}) => {
  const isValidApiKey = apiKey && apiKey.startsWith('sk_');
  const hasData = totalOperations > 0 || totalTransactions > 0;
  
  return (
    <Card className="bg-[#1a1a1a] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Info size={20} />
          Diagnóstico da API Pagar.me v5
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da API Key */}
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Formato da API Key:</span>
          <div className="flex items-center gap-2">
            {isValidApiKey ? (
              <>
                <CheckCircle size={16} className="text-green-400" />
                <Badge variant="outline" className="text-green-400 border-green-400">
                  sk_... ✓
                </Badge>
              </>
            ) : (
              <>
                <XCircle size={16} className="text-red-400" />
                <Badge variant="outline" className="text-red-400 border-red-400">
                  Inválida
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Dados Coletados */}
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Dados Coletados:</span>
          <div className="flex items-center gap-2">
            {hasData ? (
              <>
                <CheckCircle size={16} className="text-green-400" />
                <Badge variant="outline" className="text-green-400 border-green-400">
                  {totalOperations + totalTransactions} registros
                </Badge>
              </>
            ) : (
              <>
                <AlertCircle size={16} className="text-yellow-400" />
                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                  Nenhum dado
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Configurações da API v5 */}
        <div className="bg-gray-800/50 p-4 rounded-lg space-y-2">
          <p className="text-sm font-semibold text-white mb-2">✅ Configurações Aplicadas (API v5):</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle size={12} className="text-green-400" />
              <span className="text-gray-300">Autenticação: Bearer Token</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={12} className="text-green-400" />
              <span className="text-gray-300">Parâmetros: size + page</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={12} className="text-green-400" />
              <span className="text-gray-300">Size máximo: 100</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={12} className="text-green-400" />
              <span className="text-gray-300">Paginação: Completa</span>
            </div>
          </div>
        </div>

        {/* Endpoints Utilizados */}
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <p className="text-sm font-semibold text-white mb-2">📡 Endpoints da API v5:</p>
          <div className="space-y-1 text-xs">
            <div className="font-mono text-gray-300">/core/v5/payables</div>
            <div className="font-mono text-gray-300">/core/v5/orders</div>
            <div className="font-mono text-gray-300">/core/v5/transactions</div>
          </div>
        </div>

        {/* Problemas Comuns */}
        {(!isValidApiKey || !hasData) && (
          <div className="bg-red-900/20 border border-red-800 p-4 rounded-lg">
            <p className="text-sm font-semibold text-red-400 mb-2">🚨 Possíveis Problemas:</p>
            <ul className="space-y-1 text-xs text-red-300">
              {!isValidApiKey && (
                <li>• API Key deve começar com 'sk_' (chave secreta)</li>
              )}
              {isValidApiKey && !hasData && (
                <>
                  <li>• Token pode estar inválido ou expirado</li>
                  <li>• Permissões insuficientes na conta Pagar.me</li>
                  <li>• Conta pode não ter transações no período</li>
                  <li>• Cache pode estar interferindo (aguarde 5min)</li>
                </>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};