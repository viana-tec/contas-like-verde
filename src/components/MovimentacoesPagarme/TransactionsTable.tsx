
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction } from './types';
import { formatCurrency, formatDate } from './utils';
import { StatusBadge } from './StatusBadge';
import { PaymentMethodIcon } from './PaymentMethodIcon';

interface TransactionsTableProps {
  transactions: Transaction[];
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // Aumentado de 10 para 50

  if (transactions.length === 0) {
    return (
      <Card className="bg-[#1a1a1a] border-gray-800">
        <CardContent className="p-8 text-center">
          <p className="text-gray-400">Nenhuma transação encontrada com os filtros aplicados</p>
        </CardContent>
      </Card>
    );
  }

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  return (
    <Card className="bg-[#1a1a1a] border-gray-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">
            Transações ({transactions.length} total)
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            Página {currentPage} de {totalPages} - Mostrando {currentTransactions.length} de {transactions.length}
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
                <TableHead className="text-gray-300">Método</TableHead>
                <TableHead className="text-gray-300">Valor</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Data</TableHead>
                <TableHead className="text-gray-300">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {currentTransactions.map((transaction) => (
                 <TableRow key={transaction.id}>
                   <TableCell className="text-gray-300 font-mono text-xs">
                     {transaction.id.substring(0, 15)}...
                   </TableCell>
                   <TableCell className="text-green-400 font-mono font-bold">
                     {(transaction as any).real_code || 
                      String(transaction.id).replace(/[^0-9]/g, '').substring(0, 6) ||
                      String(Date.now()).slice(-5)
                     }
                   </TableCell>
                  <TableCell className="text-gray-300">
                    <div className="flex items-center gap-2">
                      <PaymentMethodIcon method={transaction.payment_method} />
                      <span className="capitalize">{transaction.payment_method.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#39FF14] font-semibold">
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell><StatusBadge status={transaction.status} /></TableCell>
                  <TableCell className="text-gray-300">
                    {formatDate(transaction.created_at)}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <Eye size={14} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#1a1a1a] border-gray-800 text-white">
                        <DialogHeader>
                          <DialogTitle>Detalhes da Transação</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-400">ID da Transação</p>
                            <p className="font-mono text-sm">{transaction.id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Valor</p>
                            <p className="text-lg font-semibold text-[#39FF14]">
                              {formatCurrency(transaction.amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Status</p>
                            <div className="mt-1"><StatusBadge status={transaction.status} /></div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Método de Pagamento</p>
                            <div className="flex items-center gap-2 mt-1">
                              <PaymentMethodIcon method={transaction.payment_method} />
                              <span className="capitalize">{transaction.payment_method.replace('_', ' ')}</span>
                            </div>
                          </div>
                          {transaction.boleto && (
                            <div>
                              <p className="text-sm text-gray-400">Linha Digitável</p>
                              <p className="font-mono text-sm bg-gray-800 p-2 rounded">
                                {transaction.boleto.line}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-400">Data de Criação</p>
                            <p>{formatDate(transaction.created_at)}</p>
                          </div>
                          {transaction.paid_at && (
                            <div>
                              <p className="text-sm text-gray-400">Data de Pagamento</p>
                              <p>{formatDate(transaction.paid_at)}</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
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
              Mostrando {startIndex + 1} a {Math.min(endIndex, transactions.length)} de {transactions.length} transações
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
