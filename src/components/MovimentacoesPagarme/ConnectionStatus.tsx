
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, RefreshCw, XCircle, AlertCircle, Key, Globe, Shield, ExternalLink } from 'lucide-react';
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
      case 'connected': return 'Conectado à API Pagar.me ✅';
      case 'connecting': return 'Conectando à API Pagar.me...';
      case 'error': return 'Erro na conexão com a API ❌';
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
              {loading ? 'Coletando dados...' : 'Atualizar Dados'}
            </Button>
          )}
        </div>
        
        {/* Progress indicator durante loading */}
        {loading && status === 'connected' && (
          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-400 text-sm font-medium">Coletando dados da API Pagar.me...</span>
              <RefreshCw size={16} className="text-blue-400 animate-spin" />
            </div>
            <div className="text-blue-300 text-xs space-y-1">
              <p>📊 Buscando payables, orders e transações</p>
              <p>🔄 Processando paginação automática</p>
              <p>💰 Calculando saldos e indicadores</p>
              <p className="text-yellow-300">⏳ Este processo pode levar alguns minutos...</p>
            </div>
          </div>
        )}
        
        {errorDetails && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-red-900/20 border border-red-600 rounded-lg">
              <p className="text-red-400 text-sm font-medium mb-2 flex items-center gap-2">
                <XCircle size={16} />
                Detalhes do erro:
              </p>
              <p className="text-red-300 text-sm mb-3">{errorDetails}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
                <p className="text-blue-400 text-sm font-medium mb-2 flex items-center gap-2">
                  <Key size={16} />
                  Sobre as chaves da Pagar.me:
                </p>
                <ul className="text-blue-300 text-xs space-y-1">
                  <li>🔑 <strong>Chaves de API:</strong> Obtidas no dashboard Pagar.me</li>
                  <li>📏 <strong>Tamanho:</strong> Deve ter pelo menos 20 caracteres</li>
                  <li>✅ <strong>Status:</strong> Deve estar ativa na sua conta</li>
                  <li>🔐 <strong>Tipo:</strong> Usar chaves de produção ou teste</li>
                  <li>🎯 <strong>Permissões:</strong> Deve ter acesso a payables e transactions</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-900/20 border border-purple-600 rounded-lg">
                <p className="text-purple-400 text-sm font-medium mb-2 flex items-center gap-2">
                  <Globe size={16} />
                  Problemas comuns:
                </p>
                <ul className="text-purple-300 text-xs space-y-1">
                  <li>• Chave inválida ou não encontrada</li>
                  <li>• Conta Pagar.me inativa ou suspensa</li>
                  <li>• Limites de requisições excedidos</li>
                  <li>• Problemas de conectividade</li>
                  <li>• Chave sem permissões necessárias</li>
                  <li>• Formato incorreto da chave API</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-green-900/20 border border-green-600 rounded-lg">
              <p className="text-green-400 text-sm font-medium mb-2 flex items-center gap-2">
                <Shield size={16} />
                Como resolver:
              </p>
              <ul className="text-green-300 text-xs space-y-1">
                <li>🔑 <strong>Dashboard:</strong> Acesse o dashboard da Pagar.me e copie uma chave válida</li>
                <li>✅ <strong>Verificar:</strong> Confirme se a chave está ativa e com permissões</li>
                <li>📊 <strong>Demo:</strong> Use o modo "Demo" para testar a interface</li>
                <li>🔄 <strong>Aguardar:</strong> Problemas temporários podem se resolver automaticamente</li>
                <li>🔍 <strong>Logs:</strong> Verifique o console do navegador para mais detalhes</li>
                <li>📞 <strong>Suporte:</strong> Contate o suporte da Pagar.me se o problema persistir</li>
              </ul>
              
              <div className="mt-3 pt-3 border-t border-green-700">
                <a 
                  href="https://dashboard.pagar.me/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-300 hover:text-green-200 text-xs mr-4"
                >
                  <ExternalLink size={12} />
                  Dashboard Pagar.me
                </a>
                <a 
                  href="https://docs.pagar.me/docs/chaves-de-acesso" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-300 hover:text-green-200 text-xs"
                >
                  <ExternalLink size={12} />
                  Documentação das Chaves
                </a>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
