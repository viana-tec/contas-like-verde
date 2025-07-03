
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BalanceOperation } from './types';
import { formatCurrency, formatDate } from './utils';
import { StatusBadge } from './StatusBadge';

interface OperationsTableProps {
  operations: BalanceOperation[];
}

export const OperationsTable: React.FC<OperationsTableProps> = ({ operations }) => {
  if (operations.length === 0) return null;

  return (
    <Card className="bg-[#1a1a1a] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Operações de Saldo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-300">ID</TableHead>
                <TableHead className="text-gray-300">Tipo</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Valor</TableHead>
                <TableHead className="text-gray-300">Taxa</TableHead>
                <TableHead className="text-gray-300">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.slice(0, 10).map((operation) => (
                <TableRow key={operation.id}>
                  <TableCell className="text-gray-300 font-mono text-xs">
                    {operation.id.substring(0, 12)}...
                  </TableCell>
                  <TableCell className="text-gray-300 capitalize">{operation.type.replace('_', ' ')}</TableCell>
                  <TableCell><StatusBadge status={operation.status} /></TableCell>
                  <TableCell className={`font-semibold ${
                    operation.amount >= 0 ? 'text-[#39FF14]' : 'text-red-400'
                  }`}>
                    {formatCurrency(operation.amount)}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {operation.fee ? formatCurrency(operation.fee) : '-'}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {formatDate(operation.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
