
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BalanceOperation } from './types';
import { formatCurrency, formatDate } from './utils';
import { StatusBadge } from './StatusBadge';

interface OperationsTableProps {
  operations: BalanceOperation[];
}

export const OperationsTable: React.FC<OperationsTableProps> = ({ operations }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // Aumentado de 10 para 50

  if (operations.length === 0) {
    return (
      <Card className="bg-[#1a1a1a] border-gray-800">
        <CardContent className="p-8 text-center">
          <p className="text-gray-400">Nenhuma operação encontrada com os filtros aplicados</p>
        </CardContent>
      </Card>
    );
  }

  const totalPages = Math.ceil(operations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOperations = operations.slice(startIndex, endIndex);

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
    // PRIORIDADE 1: real_code que já foi processado
    if ((operation as any).real_code) {
      return (operation as any).real_code;
    }
    
    // PRIORIDADE 2: Extrair números do ID da transação (para ch_XXXXX pegar parte numérica)
    const idStr = String(operation.id);
    const numericPart = idStr.replace(/[^0-9]/g, '');
    
    if (numericPart.length >= 4) {
      return numericPart.substring(0, 6);
    }
    
    // PRIORIDADE 3: Códigos de autorização se existirem
    if (operation.authorization_code && /^\d+$/.test(operation.authorization_code)) {
      return operation.authorization_code.substring(0, 6);
    }
    
    if (operation.tid && /^\d+$/.test(operation.tid)) {
      return operation.tid.substring(0, 6);
    }
    
    if (operation.nsu && /^\d+$/.test(operation.nsu)) {
      return operation.nsu.substring(0, 6);
    }
    
    // Fallback: usar timestamp
    const timestamp = Date.now();
    return String(timestamp).slice(-5);
  };

  return (
    <Card className="bg-[#1a1a1a] border-gray-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">
            Operações de Saldo ({operations.length} total)
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            Página {currentPage} de {totalPages} - Mostrando {currentOperations.length} de {operations.length}
          </div>
        </div>
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
                <TableHead className="text-gray-300">Parcelas</TableHead>
                <TableHead className="text-gray-300">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOperations.map((operation, index) => (
                <TableRow key={`${operation.id}_${index}`}>
                  <TableCell className="text-gray-300 font-mono text-xs">
                    {String(operation.id).startsWith('ch_') || String(operation.id).startsWith('tran_') || String(operation.id).startsWith('op_')
                      ? String(operation.id)
                      : `${String(operation.id).substring(0, 15)}...`
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
                  <TableCell className="text-gray-300">
                    {operation.installments && operation.installments > 1 && (
                      <Badge variant="secondary" className="bg-blue-900/30 text-blue-400">
                        {operation.installments}x
                      </Badge>
                    )}
                    {(!operation.installments || operation.installments <= 1) && '-'}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {formatDate(operation.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-400">
              Mostrando {startIndex + 1} a {Math.min(endIndex, operations.length)} de {operations.length} operações
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-gray-300 border-gray-600 hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm text-gray-400">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="text-gray-300 border-gray-600 hover:bg-gray-700"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
