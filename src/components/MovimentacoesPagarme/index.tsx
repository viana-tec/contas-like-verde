
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { CollectorInterface } from './CollectorInterface';

export const MovimentacoesPagarme = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Movimentações Pagar.me</h1>
      </div>

      <Card className="bg-blue-900/20 border-blue-600">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-400">
            <AlertCircle size={20} />
            <div>
              <p className="font-medium">📡 Coletor de Dados API v5</p>
              <p className="text-sm mt-1">
                Configure seu token e escolha o endpoint para buscar automaticamente todos os dados com paginação.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <CollectorInterface />
    </div>
  );
};
