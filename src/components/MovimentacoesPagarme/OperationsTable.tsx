
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
        <CardTitle className="text-white">Operações de Saldo ({operations.length})</CardTitle>
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
                <TableHead className="text-gray-300">Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.slice(0, 15).map((operation, index) => (
                <TableRow key={`${operation.id}_${index}`}>
                  <TableCell className="text-gray-300 font-mono text-xs">
                    {/* CORREÇÃO: Verificar se é string antes de usar substring */}
                    {typeof operation.id === 'string' && operation.id.length > 12 
                      ? `${operation.id.substring(0, 12)}...`
                      : String(operation.id)
                    }
                  </TableCell>
                  <TableCell className="text-gray-300 capitalize">
                    {operation.type?.replace('_', ' ') || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={operation.status} />
                  </TableCell>
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
                  <TableCell className="text-gray-300 text-sm">
                    {operation.description || 'Sem descrição'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {operations.length > 15 && (
            <div className="mt-4 text-center text-gray-400 text-sm">
              Mostrando 15 de {operations.length} operações
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
