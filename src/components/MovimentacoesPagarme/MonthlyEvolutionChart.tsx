
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BalanceOperation } from './types';
import { formatCurrency } from './utils/formatters';

interface MonthlyEvolutionChartProps {
  operations: BalanceOperation[];
}

export const MonthlyEvolutionChart: React.FC<MonthlyEvolutionChartProps> = ({ operations }) => {
  const monthlyData = React.useMemo(() => {
    const monthlyRevenue: { [key: string]: number } = {};
    
    operations.forEach(operation => {
      if (operation.type === 'credit' && operation.status === 'paid') {
        const date = new Date(operation.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + operation.amount;
      }
    });

    // Criar array com os últimos 12 meses em ordem cronológica
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      months.push({
        month: monthName,
        value: monthlyRevenue[monthKey] || 0
      });
    }

    return months;
  }, [operations]);

  const maxValue = Math.max(...monthlyData.map(item => item.value));

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          📈 Evolução Mensal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 relative">
          {/* Efeito neon de fundo */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-lg blur-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-lg blur-lg"></div>
          
          <ResponsiveContainer width="100%" height="100%" className="relative z-10">
            <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00ffff" stopOpacity={1} />
                  <stop offset="50%" stopColor="#ff00ff" stopOpacity={1} />
                  <stop offset="100%" stopColor="#ffff00" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="glowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00ffff" stopOpacity={0.8} />
                  <stop offset="50%" stopColor="#ff00ff" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#ffff00" stopOpacity={0.1} />
                </linearGradient>
                
                {/* Filtros para efeito de brilho */}
                <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#374151" 
                strokeOpacity={0.3}
              />
              
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
              />
              
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(156, 163, 175, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
                }}
                formatter={(value: number) => [formatCurrency(value), 'Receita']}
                labelStyle={{ color: '#9CA3AF' }}
              />
              
              {/* Linha principal com efeito neon */}
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="url(#neonGradient)"
                strokeWidth={3}
                dot={{ 
                  fill: '#00ffff', 
                  strokeWidth: 2, 
                  stroke: '#ffffff',
                  r: 6,
                  filter: 'url(#strongGlow)'
                }}
                activeDot={{ 
                  r: 8, 
                  fill: '#ff00ff',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                  filter: 'url(#strongGlow)'
                }}
                filter="url(#neonGlow)"
              />
              
              {/* Linha de sombra para intensificar o efeito */}
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#00ffff"
                strokeWidth={1}
                strokeOpacity={0.5}
                dot={false}
                activeDot={false}
                filter="url(#strongGlow)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Indicadores de performance */}
        <div className="mt-4 flex justify-between text-sm text-gray-400">
          <span>Pico: {formatCurrency(maxValue)}</span>
          <span>Últimos 12 meses</span>
        </div>
      </CardContent>
    </Card>
  );
};
