
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Database,
  TrendingUp
} from 'lucide-react';
import { ConnectionStatus as ConnectionStatusType } from './types';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  errorDetails?: string;
  loading: boolean;
  onRefresh: () => void;
  // Novos props para progresso detalhado
  progressInfo?: {
    stage: string;
    current: number;
    total: number;
    info: string;
  };
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  status, 
  errorDetails, 
  loading, 
  onRefresh,
  progressInfo 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          title: '✅ Conectado à API Pagar.me',
          description: 'Dados atualizados e disponíveis',
          bgColor: 'bg-green-900/20',
          borderColor: 'border-green-600',
          textColor: 'text-green-400'
        };
      case 'connecting':
        return {
          icon: Loader2,
          title: '🔄 Conectando...',
          description: 'Estabelecendo conexão com a API',
          bgColor: 'bg-blue-900/20',
          borderColor: 'border-blue-600',
          textColor: 'text-blue-400'
        };
      case 'error':
        return {
          icon: XCircle,
          title: '❌ Erro de Conexão',
          description: errorDetails || 'Falha na comunicação com a API',
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-600',
          textColor: 'text-red-400'
        };
      default:
        return {
          icon: WifiOff,
          title: '⚠️ Não Conectado',
          description: 'Configure sua chave API para conectar',
          bgColor: 'bg-gray-900/20',
          borderColor: 'border-gray-600',
          textColor: 'text-gray-400'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Card className={`${config.bgColor} ${config.borderColor} bg-[#1a1a1a]`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon 
              size={24} 
              className={`${config.textColor} ${status === 'connecting' ? 'animate-spin' : ''}`} 
            />
            <div>
              <h3 className={`font-semibold ${config.textColor}`}>
                {config.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {config.description}
              </p>
            </div>
          </div>
          
          {status === 'connected' && !loading && (
            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              className="border-gray-600 hover:border-gray-500"
            >
              <RefreshCw size={16} className="mr-2" />
              Atualizar
            </Button>
          )}
        </div>

        {/* Indicador de progresso detalhado */}
        {loading && progressInfo && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300 font-medium">
                {progressInfo.stage}
              </span>
              <span className="text-gray-400">
                {progressInfo.current}/{progressInfo.total}
              </span>
            </div>
            
            <Progress 
              value={(progressInfo.current / progressInfo.total) * 100} 
              className="h-2"
            />
            
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Database size={14} />
              <span>{progressInfo.info}</span>
            </div>
          </div>
        )}

        {/* Loading genérico (quando não há progressInfo) */}
        {loading && !progressInfo && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <Loader2 size={16} className="animate-spin" />
              <span>Carregando dados da API...</span>
            </div>
            <Progress value={undefined} className="h-2" />
          </div>
        )}

        {/* Status de erro detalhado */}
        {status === 'error' && errorDetails && (
          <div className="mt-3 p-3 bg-red-900/10 border border-red-600/30 rounded">
            <p className="text-red-300 text-sm font-mono">
              {errorDetails}
            </p>
          </div>
        )}

        {/* Estatísticas de conexão (quando conectado) */}
        {status === 'connected' && !loading && (
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Wifi size={12} />
              <span>API Ativa</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp size={12} />
              <span>Dados Atualizados</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
