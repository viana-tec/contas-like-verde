
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  onLoadDemo: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onLoadDemo }) => {
  return (
    <Card className="bg-[#1a1a1a] border-gray-800">
      <CardContent className="p-8 text-center">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Nenhum dado disponível</h3>
        <p className="text-gray-400 mb-4">
          Clique em "Demo" para carregar dados de exemplo ou configure sua chave API e teste a conexão.
        </p>
        <Button 
          onClick={onLoadDemo}
          className="bg-purple-600 text-white hover:bg-purple-700"
        >
          Carregar Dados Demo
        </Button>
      </CardContent>
    </Card>
  );
};
