
import React, { useState } from 'react';
import { Upload, FileText, Eye, Download, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface BoletoData {
  id: string;
  nomeArquivo: string;
  beneficiario: string;
  vencimento: string;
  valor: string;
  codigoBarras: string;
  arquivoUrl: string;
  criadoEm: string;
}

export const Boletos: React.FC = () => {
  const [boletos, setBoletos] = useState<BoletoData[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<BoletoData> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  // Simulated OCR extraction
  const simulateOCRExtraction = (fileName: string): Partial<BoletoData> => {
    const mockData = [
      {
        beneficiario: "Banco do Brasil S.A.",
        vencimento: "2024-07-15",
        valor: "1250.00",
        codigoBarras: "34191.09008 61207.727103 71444.640008 8 95470000125000"
      },
      {
        beneficiario: "Companhia de Energia Elétrica",
        vencimento: "2024-07-20",
        valor: "485.67",
        codigoBarras: "84660.00001 23456.789012 34567.890123 4 95480000048567"
      },
      {
        beneficiario: "Telefônica Brasil S.A.",
        vencimento: "2024-07-25",
        valor: "89.90",
        codigoBarras: "84660.00002 45678.901234 56789.012345 6 95490000008990"
      }
    ];
    
    return mockData[Math.floor(Math.random() * mockData.length)];
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Formato de arquivo não suportado. Use PDF, JPG ou PNG.",
        variant: "destructive"
      });
      return;
    }

    setIsExtracting(true);
    
    // Simulate OCR processing delay
    setTimeout(() => {
      const extracted = simulateOCRExtraction(file.name);
      setExtractedData({
        ...extracted,
        nomeArquivo: file.name,
        arquivoUrl: URL.createObjectURL(file)
      });
      setIsExtracting(false);
      setIsModalOpen(true);
    }, 2000);

    toast({
      title: "Processando",
      description: "Extraindo dados do boleto...",
    });
  };

  const handleConfirmExtraction = () => {
    if (!extractedData) return;

    const newBoleto: BoletoData = {
      id: Date.now().toString(),
      nomeArquivo: extractedData.nomeArquivo || '',
      beneficiario: extractedData.beneficiario || '',
      vencimento: extractedData.vencimento || '',
      valor: extractedData.valor || '',
      codigoBarras: extractedData.codigoBarras || '',
      arquivoUrl: extractedData.arquivoUrl || '',
      criadoEm: new Date().toISOString()
    };

    setBoletos(prev => [...prev, newBoleto]);
    setIsModalOpen(false);
    setExtractedData(null);

    toast({
      title: "Sucesso",
      description: "Boleto adicionado com sucesso!",
    });
  };

  const handleDelete = (id: string) => {
    setBoletos(prev => prev.filter(b => b.id !== id));
    toast({
      title: "Sucesso",
      description: "Boleto removido com sucesso!",
    });
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Boletos</h1>
      </div>

      {/* Upload Area */}
      <Card className="p-6 border-2 border-dashed border-gray-700 hover:border-[#39FF14] transition-colors">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload de Boleto</h3>
          <p className="text-gray-400 mb-4">Arraste e solte ou clique para selecionar um arquivo PDF ou imagem</p>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isExtracting}
            />
            <Button disabled={isExtracting} className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90">
              {isExtracting ? 'Processando...' : 'Selecionar Arquivo'}
            </Button>
          </label>
        </div>
      </Card>

      {/* Boletos List */}
      <div className="grid gap-4">
        {boletos.map((boleto) => (
          <Card key={boleto.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <FileText className="h-10 w-10 text-[#39FF14]" />
                <div>
                  <h3 className="font-medium">{boleto.nomeArquivo}</h3>
                  <p className="text-sm text-gray-400">
                    {boleto.beneficiario} • Venc: {formatDate(boleto.vencimento)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-[#39FF14]">
                  {formatCurrency(boleto.valor)}
                </span>
                <div className="flex space-x-1">
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleDelete(boleto.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Código de Barras: {boleto.codigoBarras}
            </div>
          </Card>
        ))}
      </div>

      {/* Extraction Confirmation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Confirmar Dados Extraídos</DialogTitle>
          </DialogHeader>
          {extractedData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="beneficiario">Beneficiário</Label>
                  <Input
                    id="beneficiario"
                    value={extractedData.beneficiario || ''}
                    onChange={(e) => setExtractedData(prev => ({ ...prev, beneficiario: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vencimento">Data de Vencimento</Label>
                  <Input
                    id="vencimento"
                    type="date"
                    value={extractedData.vencimento || ''}
                    onChange={(e) => setExtractedData(prev => ({ ...prev, vencimento: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor">Valor</Label>
                  <Input
                    id="valor"
                    value={extractedData.valor || ''}
                    onChange={(e) => setExtractedData(prev => ({ ...prev, valor: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="arquivo">Nome do Arquivo</Label>
                  <Input
                    id="arquivo"
                    value={extractedData.nomeArquivo || ''}
                    onChange={(e) => setExtractedData(prev => ({ ...prev, nomeArquivo: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="codigoBarras">Código de Barras</Label>
                <Input
                  id="codigoBarras"
                  value={extractedData.codigoBarras || ''}
                  onChange={(e) => setExtractedData(prev => ({ ...prev, codigoBarras: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleConfirmExtraction}
                  className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90"
                >
                  Confirmar e Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
