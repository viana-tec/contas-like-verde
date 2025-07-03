
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Transaction } from './types';
import { formatCurrency, formatDate } from './utils';
import { StatusBadge } from './StatusBadge';
import { PaymentMethodIcon } from './PaymentMethodIcon';

interface TransactionsTableProps {
  transactions: Transaction[];
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  if (transactions.length === 0) return null;

  return (
    <Card className="bg-[#1a1a1a] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-300">ID</TableHead>
                <TableHead className="text-gray-300">Método</TableHead>
                <TableHead className="text-gray-300">Valor</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Data</TableHead>
                <TableHead className="text-gray-300">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 10).map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="text-gray-300 font-mono text-xs">
                    {transaction.id.substring(0, 12)}...
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
      </CardContent>
    </Card>
  );
};
