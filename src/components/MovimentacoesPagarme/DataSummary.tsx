
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BalanceOperation, Transaction } from './types';
import { formatCurrency } from './utils';

interface DataSummaryProps {
  operations: BalanceOperation[];
  transactions: Transaction[];
}

export const DataSummary: React.FC<DataSummaryProps> = ({ operations, transactions }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-[#1a1a1a] border-gray-800">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-[#39FF14]">{operations.length}</div>
          <p className="text-gray-400">Operações</p>
        </CardContent>
      </Card>
      <Card className="bg-[#1a1a1a] border-gray-800">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-[#39FF14]">{transactions.length}</div>
          <p className="text-gray-400">Transações</p>
        </CardContent>
      </Card>
      <Card className="bg-[#1a1a1a] border-gray-800">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-[#39FF14]">
            {formatCurrency(operations.reduce((sum, op) => sum + op.amount, 0))}
          </div>
          <p className="text-gray-400">Total Operações</p>
        </CardContent>
      </Card>
      <Card className="bg-[#1a1a1a] border-gray-800">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-[#39FF14]">
            {formatCurrency(transactions.reduce((sum, tx) => sum + tx.amount, 0))}
          </div>
          <p className="text-gray-400">Total Transações</p>
        </CardContent>
      </Card>
    </div>
  );
};
