
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, RefreshCw, XCircle, AlertCircle } from 'lucide-react';
import { ConnectionStatus as ConnectionStatusType } from './types';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  errorDetails: string;
  loading: boolean;
  onRefresh: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  errorDetails,
  loading,
  onRefresh
}) => {
  const getConnectionStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConnectionStatusText = () => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'connecting': return 'Conectando...';
      case 'error': return 'Erro na conexão';
      default: return 'Não conectado';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (status) {
      case 'connected': return <CheckCircle size={20} className="text-green-400" />;
      case 'connecting': return <RefreshCw size={20} className="text-yellow-400 animate-spin" />;
      case 'error': return <XCircle size={20} className="text-red-400" />;
      default: return <AlertCircle size={20} className="text-gray-400" />;
    }
  };

  return (
    <Card className="bg-[#1a1a1a] border-gray-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getConnectionStatusIcon()}
            <span className={`font-medium ${getConnectionStatusColor()}`}>
              {getConnectionStatusText()}
            </span>
          </div>
          {status === 'connected' && (
            <Button 
              onClick={onRefresh} 
              disabled={loading}
              size="sm"
              className="bg-[#39FF14] text-black hover:bg-[#32E012]"
            >
              {loading ? (
                <RefreshCw size={16} className="animate-spin mr-2" />
              ) : null}
              Atualizar Dados
            </Button>
          )}
        </div>
        {errorDetails && (
          <div className="mt-3 p-4 bg-red-900/20 border border-red-600 rounded-lg">
            <p className="text-red-400 text-sm font-medium mb-2">Erro: {errorDetails}</p>
            <div className="text-gray-400 text-xs space-y-1">
              <p>💡 <strong>Soluções sugeridas:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Clique em "Demo" para ver dados de exemplo</li>
                <li>Verifique se sua chave API está correta</li>
                <li>A conexão agora usa um proxy seguro via Supabase</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
