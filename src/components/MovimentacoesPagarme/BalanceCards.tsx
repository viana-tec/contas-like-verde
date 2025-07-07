
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from './utils';

interface BalanceCardsProps {
  availableBalance: number;
  pendingBalance: number;
  isLoading?: boolean;
}

export const BalanceCards: React.FC<BalanceCardsProps> = ({ 
  availableBalance, 
  pendingBalance, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-[#1a1a1a] border-gray-800 animate-pulse">
          <CardContent className="p-6">
            <div className="h-6 bg-gray-700 rounded mb-2" />
            <div className="h-8 bg-gray-700 rounded" />
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-gray-800 animate-pulse">
          <CardContent className="p-6">
            <div className="h-6 bg-gray-700 rounded mb-2" />
            <div className="h-8 bg-gray-700 rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Saldo Disponível */}
      <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-600/50 bg-[#1a1a1a]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Wallet size={24} />
            Saldo Disponível
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {formatCurrency(availableBalance)}
          </div>
          <div className="flex items-center gap-1 text-sm text-green-300">
            <TrendingUp size={16} />
            Pronto para transferir
          </div>
        </CardContent>
      </Card>

      {/* Saldo Pendente */}
      <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-600/50 bg-[#1a1a1a]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-400">
            <Clock size={24} />
            Saldo Pendente
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold text-orange-400 mb-2">
            {formatCurrency(pendingBalance)}
          </div>
          <div className="flex items-center gap-1 text-sm text-orange-300">
            <TrendingDown size={16} />
            A receber
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
