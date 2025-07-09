import React from 'react';
import { MonthlyEvolutionChart } from './MonthlyEvolutionChart';
import { BalanceOperation } from './types';
import { RevenueByCategoryChart } from './RevenueByCategoryChart';
import { PaymentMethodsChart } from './PaymentMethodsChart';

interface ChartsSectionProps {
  operations: BalanceOperation[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ operations }) => {
  const revenueByCategoryData = React.useMemo(() => {
    const categoryRevenue: { [key: string]: number } = {};
    
    operations.forEach(operation => {
      if (operation.type === 'credit' && operation.status === 'paid') {
        const category = operation.description || 'Outros';
        categoryRevenue[category] = (categoryRevenue[category] || 0) + operation.amount;
      }
    });

    return Object.entries(categoryRevenue).map(([category, value]) => ({
      name: category,
      value: value
    }));
  }, [operations]);

  const paymentMethodsData = React.useMemo(() => {
    const paymentMethodCounts: { [key: string]: number } = {};
    
    operations.forEach(operation => {
      if (operation.type === 'credit' && operation.status === 'paid') {
        const method = operation.payment_method || 'Desconhecido';
        paymentMethodCounts[method] = (paymentMethodCounts[method] || 0) + 1;
      }
    });

    return Object.entries(paymentMethodCounts).map(([method, count]) => ({
      name: method,
      value: count
    }));
  }, [operations]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <MonthlyEvolutionChart operations={operations} />
      
      <RevenueByCategoryChart data={revenueByCategoryData} />
      <PaymentMethodsChart data={paymentMethodsData} />
    </div>
  );
};
