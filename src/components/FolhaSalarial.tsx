
import React, { useState } from 'react';
import { Download, FileSpreadsheet, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFolhaSalarialData } from './FolhaSalarial/hooks/useFolhaSalarialData';
import { useCLTEmployees } from './FolhaSalarial/hooks/useCLTEmployees';
import { useServiceProviders } from './FolhaSalarial/hooks/useServiceProviders';
import { CLTEmployeesTab } from './FolhaSalarial/components/CLTEmployeesTab';
import { ServiceProvidersTab } from './FolhaSalarial/components/ServiceProvidersTab';
import { FolhaSalarialModal } from './FolhaSalarial/components/FolhaSalarialModal';
import { CLTEmployee, ServiceProvider } from './FolhaSalarial/types';

export const FolhaSalarial: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'clt' | 'provider'>('clt');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { cltEmployees, serviceProviders, loading, refetchData } = useFolhaSalarialData();
  
  const {
    editingEmployee,
    setEditingEmployee,
    cltFormData,
    setCltFormData,
    handleSaveCLT,
    handleDeleteCLT
  } = useCLTEmployees(refetchData);

  const {
    editingProvider,
    setEditingProvider,
    providerFormData,
    setProviderFormData,
    handleSaveProvider,
    handleDeleteProvider
  } = useServiceProviders(refetchData);

  const handleOpenModal = (type: 'clt' | 'provider', item?: CLTEmployee | ServiceProvider) => {
    setActiveTab(type);
    if (type === 'clt') {
      if (item) {
        setEditingEmployee(item as CLTEmployee);
        setCltFormData(item as CLTEmployee);
      } else {
        setEditingEmployee(null);
        setCltFormData({ payment_day_1: 15, payment_day_2: 30, salary_advance: 0 });
      }
    } else {
      if (item) {
        setEditingProvider(item as ServiceProvider);
        setProviderFormData(item as ServiceProvider);
      } else {
        setEditingProvider(null);
        setProviderFormData({ payment_day_1: 15, payment_day_2: 30 });
      }
    }
    setIsModalOpen(true);
  };

  const handleCopyPix = (pixKey: string) => {
    navigator.clipboard.writeText(pixKey);
    toast({
      title: "Copiado!",
      description: "Chave PIX copiada para a área de transferência",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-[#39FF14]" />
          <h1 className="text-3xl font-bold">Folha Salarial</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="clt" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clt">Funcionários CLT</TabsTrigger>
          <TabsTrigger value="providers">Prestadores de Serviço</TabsTrigger>
        </TabsList>

        <TabsContent value="clt">
          <CLTEmployeesTab
            employees={cltEmployees}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onOpenModal={(employee) => handleOpenModal('clt', employee)}
            onDeleteEmployee={handleDeleteCLT}
            onCopyPix={handleCopyPix}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        <TabsContent value="providers">
          <ServiceProvidersTab
            providers={serviceProviders}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onOpenModal={(provider) => handleOpenModal('provider', provider)}
            onDeleteProvider={handleDeleteProvider}
            onCopyPix={handleCopyPix}
            formatCurrency={formatCurrency}
          />
        </TabsContent>
      </Tabs>

      <FolhaSalarialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeTab={activeTab}
        editingEmployee={editingEmployee}
        editingProvider={editingProvider}
        cltFormData={cltFormData}
        setCltFormData={setCltFormData}
        providerFormData={providerFormData}
        setProviderFormData={setProviderFormData}
        onSaveCLT={handleSaveCLT}
        onSaveProvider={handleSaveProvider}
      />
    </div>
  );
};
