
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

  const translateType = (type: string) => {
    const translations: Record<string, string> = {
      'payable': 'Recebível',
      'transfer': 'Transferência',
      'fee_collection': 'Cobrança de Taxa',
      'refund': 'Estorno',
      'chargeback': 'Chargeback',
      'anticipation': 'Antecipação',
      'credit': 'Crédito',
      'debit': 'Débito'
    };
    return translations[type] || type.replace('_', ' ');
  };

  const translatePaymentMethod = (method?: string) => {
    if (!method) return '-';
    const translations: Record<string, string> = {
      'credit_card': 'Cartão de Crédito',
      'debit_card': 'Cartão de Débito',
      'pix': 'PIX',
      'boleto': 'Boleto'
    };
    return translations[method] || method.replace('_', ' ');
  };

  const formatCode = (operation: BalanceOperation) => {
    // Extrair código de 5 dígitos se existir
    const authCode = operation.authorization_code;
    const tid = operation.tid;
    const nsu = operation.nsu;
    
    if (authCode && authCode.length >= 5) {
      return authCode.substring(0, 5);
    }
    if (tid && tid.length >= 5) {
      return tid.substring(0, 5);
    }
    if (nsu && nsu.length >= 5) {
      return nsu.substring(0, 5);
    }
    
    // Gerar código fictício baseado no ID se não houver
    const idStr = String(operation.id);
    if (idStr.length >= 5) {
      return idStr.substring(idStr.length - 5);
    }
    return '-----';
  };

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
                <TableHead className="text-gray-300">ID Transação</TableHead>
                <TableHead className="text-gray-300">Código</TableHead>
                <TableHead className="text-gray-300">Tipo</TableHead>
                <TableHead className="text-gray-300">Método</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Valor</TableHead>
                <TableHead className="text-gray-300">Taxa</TableHead>
                <TableHead className="text-gray-300">Bandeira</TableHead>
                <TableHead className="text-gray-300">Adquirente</TableHead>
                <TableHead className="text-gray-300">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.slice(0, 15).map((operation, index) => (
                <TableRow key={`${operation.id}_${index}`}>
                  <TableCell className="text-gray-300 font-mono text-xs">
                    {typeof operation.id === 'string' && operation.id.length > 12 
                      ? `${operation.id.substring(0, 12)}...`
                      : String(operation.id)
                    }
                  </TableCell>
                  <TableCell className="text-green-400 font-mono font-bold">
                    {formatCode(operation)}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {translateType(operation.type)}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div className="flex items-center gap-2">
                      {operation.payment_method && (
                        <>
                          {operation.payment_method === 'pix' && (
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                          )}
                          {operation.payment_method === 'credit_card' && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full" />
                          )}
                          {operation.payment_method === 'debit_card' && (
                            <div className="w-2 h-2 bg-purple-400 rounded-full" />
                          )}
                          {operation.payment_method === 'boleto' && (
                            <div className="w-2 h-2 bg-orange-400 rounded-full" />
                          )}
                        </>
                      )}
                      <span>{translatePaymentMethod(operation.payment_method)}</span>
                    </div>
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
                  <TableCell className="text-gray-300 capitalize">
                    {operation.card_brand || '-'}
                  </TableCell>
                  <TableCell className="text-gray-300 capitalize">
                    {operation.acquirer_name || '-'}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {formatDate(operation.created_at)}
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
