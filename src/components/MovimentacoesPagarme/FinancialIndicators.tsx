import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Users, 
  BarChart3,
  Target,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { FinancialIndicators as FinancialIndicatorsType } from './types';
import { formatCurrency } from './utils';

interface FinancialIndicatorsProps {
  indicators: FinancialIndicatorsType;
  isLoading?: boolean;
}

export const FinancialIndicators: React.FC<FinancialIndicatorsProps> = ({ 
  indicators, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="bg-[#1a1a1a] border-gray-800 animate-pulse">
            <CardContent className="p-4">
              <div className="h-6 bg-gray-700 rounded mb-2" />
              <div className="h-8 bg-gray-700 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const indicatorCards = [
    {
      title: 'Receita Total',
      value: formatCurrency(indicators.totalRevenue),
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-600'
    },
    {
      title: 'Receita Líquida',
      value: formatCurrency(indicators.netRevenue),
      subtitle: `Taxa: ${formatCurrency(indicators.totalFees)}`,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-600'
    },
    {
      title: 'Total de Transações',
      value: indicators.totalTransactions.toLocaleString('pt-BR'),
      icon: CreditCard,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-600'
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(indicators.averageTicket),
      icon: BarChart3,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-600'
    },
    {
      title: 'Taxa de Aprovação',
      value: `${indicators.approvalRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: indicators.approvalRate >= 80 ? 'text-green-400' : 'text-yellow-400',
      bgColor: indicators.approvalRate >= 80 ? 'bg-green-900/20' : 'bg-yellow-900/20',
      borderColor: indicators.approvalRate >= 80 ? 'border-green-600' : 'border-yellow-600'
    },
    {
      title: 'Taxa de Estorno',
      value: `${indicators.refundRate.toFixed(1)}%`,
      icon: AlertCircle,
      color: indicators.refundRate <= 5 ? 'text-green-400' : 'text-red-400',
      bgColor: indicators.refundRate <= 5 ? 'bg-green-900/20' : 'bg-red-900/20',
      borderColor: indicators.refundRate <= 5 ? 'border-green-600' : 'border-red-600'
    },
    {
      title: 'Receita Hoje',
      value: formatCurrency(indicators.todayRevenue),
      icon: Target,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-900/20',
      borderColor: 'border-cyan-600'
    },
    {
      title: 'Pendente',
      value: formatCurrency(indicators.pendingAmount),
      icon: Clock,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicatorCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className={`${card.bgColor} ${card.borderColor} bg-[#1a1a1a] border-gray-800`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                  <Icon size={20} className={card.color} />
                </div>
                <div className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </div>
                {card.subtitle && (
                  <p className="text-gray-500 text-xs mt-1">{card.subtitle}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Distribuição por método de pagamento */}
      <Card className="bg-[#1a1a1a] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Distribuição por Método de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">PIX</span>
                <Badge variant="secondary" className="bg-green-900/30 text-green-400">
                  {indicators.pixPercentage.toFixed(1)}%
                </Badge>
              </div>
              <Progress 
                value={indicators.pixPercentage} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Cartão de Crédito</span>
                <Badge variant="secondary" className="bg-blue-900/30 text-blue-400">
                  {indicators.creditCardPercentage.toFixed(1)}%
                </Badge>
              </div>
              <Progress 
                value={indicators.creditCardPercentage} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Cartão de Débito</span>
                <Badge variant="secondary" className="bg-purple-900/30 text-purple-400">
                  {indicators.debitCardPercentage.toFixed(1)}%
                </Badge>
              </div>
              <Progress 
                value={indicators.debitCardPercentage} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Boleto</span>
                <Badge variant="secondary" className="bg-orange-900/30 text-orange-400">
                  {indicators.boletoPercentage.toFixed(1)}%
                </Badge>
              </div>
              <Progress 
                value={indicators.boletoPercentage} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};