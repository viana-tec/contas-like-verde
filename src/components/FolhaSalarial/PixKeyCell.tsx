
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PixKeyCellProps {
  pixKey: string;
}

export const PixKeyCell: React.FC<PixKeyCellProps> = ({ pixKey }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyPixKey = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "Chave PIX copiada para a área de transferência",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a chave PIX",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-400 truncate max-w-[100px]">
        {pixKey}
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={copyPixKey}
        className="h-6 w-6 p-0"
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
};
