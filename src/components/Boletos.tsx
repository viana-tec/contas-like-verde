
import React, { useState, useEffect } from 'react';
import { Upload, FileText, Eye, Download, Trash2, Edit3, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BoletoData {
  id: string;
  company_name: string;
  company_document?: string;
  due_date: string;
  amount: number;
  barcode: string;
  digitable_line?: string;
  bank_code?: string;
  agency_code?: string;
  account_number?: string;
  status: string;
  notes?: string;
  created_at: string;
}

export const Boletos: React.FC = () => {
  const [boletos, setBoletos] = useState<BoletoData[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<BoletoData> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBoletos();
  }, []);

  const fetchBoletos = async () => {
    try {
      const { data, error } = await supabase
        .from('boletos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBoletos(data || []);
    } catch (error) {
      console.error('Erro ao carregar boletos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar boletos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Simulated OCR extraction
  const simulateOCRExtraction = (fileName: string): Partial<BoletoData> => {
    const mockData = [
      {
        company_name: "Banco do Brasil S.A.",
        company_document: "00.000.000/0001-91",
        due_date: "2024-07-15",
        amount: 1250.00,
        barcode: "34191.09008 61207.727103 71444.640008 8 95470000125000",
        digitable_line: "34191090086120772710371444640008895470000125000",
        bank_code: "001",
        agency_code: "1234",
        account_number: "56789-0"
      },
      {
        company_name: "Companhia de Energia Elétrica",
        company_document: "12.345.678/0001-90",
        due_date: "2024-07-20",
        amount: 485.67,
        barcode: "84660.00001 23456.789012 34567.890123 4 95480000048567",
        digitable_line: "84660000012345678901234567890123495480000048567",
        bank_code: "104",
        agency_code: "0001",
        account_number: "12345-6"
      },
      {
        company_name: "Telefônica Brasil S.A.",
        company_document: "02.558.157/0001-62",
        due_date: "2024-07-25",
        amount: 89.90,
        barcode: "84660.00002 45678.901234 56789.012345 6 95490000008990",
        digitable_line: "84660000024567890123456789012345695490000008990",
        bank_code: "237",
        agency_code: "0002",
        account_number: "67890-1"
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
      setExtractedData(extracted);
      setIsExtracting(false);
      setIsModalOpen(true);
    }, 2000);

    toast({
      title: "Processando",
      description: "Extraindo dados do boleto...",
    });
  };

  const handleConfirmExtraction = async () => {
    if (!extractedData) return;

    try {
      const boletoData = {
        company_name: extractedData.company_name || '',
        company_document: extractedData.company_document,
        due_date: extractedData.due_date || '',
        amount: extractedData.amount || 0,
        barcode: extractedData.barcode || '',
        digitable_line: extractedData.digitable_line,
        bank_code: extractedData.bank_code,
        agency_code: extractedData.agency_code,
        account_number: extractedData.account_number,
        status: 'pending'
      };

      const { error } = await supabase
        .from('boletos')
        .insert([boletoData]);

      if (error) throw error;

      setIsModalOpen(false);
      setExtractedData(null);
      fetchBoletos();

      toast({
        title: "Sucesso",
        description: "Boleto adicionado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar boleto:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar boleto",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('boletos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBoletos(prev => prev.filter(b => b.id !== id));
      toast({
        title: "Sucesso",
        description: "Boleto removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao deletar boleto:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover boleto",
        variant: "destructive"
      });
    }
  };

  const handleCopyBarcode = (barcode: string) => {
    navigator.clipboard.writeText(barcode);
    toast({
      title: "Copiado!",
      description: "Código de barras copiado para a área de transferência",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#39FF14] mx-auto"></div>
          <p className="mt-2 text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

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
                  <h3 className="font-medium text-white font-bold">{boleto.company_name}</h3>
                  <p className="text-sm text-gray-400">
                    {boleto.company_document && `${boleto.company_document} • `}
                    Venc: {formatDate(boleto.due_date)}
                  </p>
                  {boleto.bank_code && (
                    <p className="text-xs text-gray-500">
                      Banco: {boleto.bank_code} | Agência: {boleto.agency_code} | Conta: {boleto.account_number}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-[#39FF14]">
                  {formatCurrency(boleto.amount)}
                </span>
                <div className="flex space-x-1">
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleCopyBarcode(boleto.barcode)}
                  >
                    <Copy className="h-4 w-4" />
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
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
              <span>Código de Barras: {boleto.barcode}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleCopyBarcode(boleto.barcode)}
                className="text-xs p-1 h-auto"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar
              </Button>
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
                  <Label htmlFor="company_name">Razão Social</Label>
                  <Input
                    id="company_name"
                    value={extractedData.company_name || ''}
                    onChange={(e) => setExtractedData(prev => ({ ...prev, company_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="company_document">CNPJ</Label>
                  <Input
                    id="company_document"
                    value={extractedData.company_document || ''}
                    onChange={(e) => setExtractedData(prev => ({ ...prev, company_document: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="due_date">Data de Vencimento</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={extractedData.due_date || ''}
                    onChange={(e) => setExtractedData(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={extractedData.amount || ''}
                    onChange={(e) => setExtractedData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bank_code">Código do Banco</Label>
                  <Input
                    id="bank_code"
                    value={extractedData.bank_code || ''}
                    onChange={(e) => setExtractedData(prev => ({ ...prev, bank_code: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="agency_code">Agência</Label>
                  <Input
                    id="agency_code"
                    value={extractedData.agency_code || ''}
                    onChange={(e) => setExtractedData(prev => ({ ...prev, agency_code: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="account_number">Conta</Label>
                  <Input
                    id="account_number"
                    value={extractedData.account_number || ''}
                    onChange={(e) => setExtractedData(prev => ({ ...prev, account_number: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="barcode">Código de Barras</Label>
                <Input
                  id="barcode"
                  value={extractedData.barcode || ''}
                  onChange={(e) => setExtractedData(prev => ({ ...prev, barcode: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="digitable_line">Linha Digitável</Label>
                <Input
                  id="digitable_line"
                  value={extractedData.digitable_line || ''}
                  onChange={(e) => setExtractedData(prev => ({ ...prev, digitable_line: e.target.value }))}
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
