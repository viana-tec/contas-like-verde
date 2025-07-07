
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CLTEmployeesTab } from './FolhaSalarial/components/CLTEmployeesTab';
import { ServiceProvidersTab } from './FolhaSalarial/components/ServiceProvidersTab';
import { FolhaSalarialModal } from './FolhaSalarial/components/FolhaSalarialModal';
import { useFolhaSalarialData } from './FolhaSalarial/hooks/useFolhaSalarialData';

export const FolhaSalarial = () => {
  const {
    employees,
    providers,
    editingEmployee,
    editingProvider,
    cltFormData,
    setCltFormData,
    providerFormData,
    setProviderFormData,
    saveCLTEmployee,
    saveServiceProvider,
    deleteCLTEmployee,
    deleteServiceProvider,
    resetForms,
    setEditingEmployee,
    setEditingProvider
  } = useFolhaSalarialData();

  const [activeTab, setActiveTab] = useState<'clt' | 'provider'>('clt');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleCopyPix = async (pixKey: string) => {
    try {
      await navigator.clipboard.writeText(pixKey);
      // You could add a toast notification here
      console.log('PIX copiado para a área de transferência');
    } catch (err) {
      console.error('Erro ao copiar PIX:', err);
    }
  };

  const handleOpenModal = (employee?: any, provider?: any) => {
    if (employee) {
      setEditingEmployee(employee);
      setCltFormData(employee);
      setActiveTab('clt');
    } else if (provider) {
      setEditingProvider(provider);
      setProviderFormData(provider);
      setActiveTab('provider');
    } else {
      resetForms();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForms();
  };

  const handleSaveCLT = async (): Promise<boolean> => {
    try {
      await saveCLTEmployee();
      return true;
    } catch (error) {
      console.error('Erro ao salvar funcionário CLT:', error);
      return false;
    }
  };

  const handleSaveProvider = async (): Promise<boolean> => {
    try {
      await saveServiceProvider();
      return true;
    } catch (error) {
      console.error('Erro ao salvar prestador:', error);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/20 to-gray-100 p-6">
      {/* Header com Logo */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-6 bg-gradient-to-r from-green-400/10 to-green-600/10 rounded-2xl backdrop-blur-sm border border-green-200/20">
          <img 
            src="/lovable-uploads/f99b75e4-8df3-4c05-81a5-e91f03700671.png" 
            alt="Finance Logo" 
            className="h-16 w-auto"
          />
        </div>
        <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
          Folha Salarial
        </h1>
        <p className="text-gray-600 mt-2">Gestão de Funcionários e Prestadores de Serviço</p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'clt' | 'provider')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-green-100/50 to-green-200/50 border border-green-300/30">
          <TabsTrigger 
            value="clt" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white font-semibold"
          >
            Funcionários CLT
          </TabsTrigger>
          <TabsTrigger 
            value="provider"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white font-semibold"
          >
            Prestadores de Serviço
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="clt" className="mt-6">
          <CLTEmployeesTab
            employees={employees}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onOpenModal={(employee) => handleOpenModal(employee)}
            onDeleteEmployee={deleteCLTEmployee}
            onCopyPix={handleCopyPix}
            formatCurrency={formatCurrency}
          />
        </TabsContent>
        
        <TabsContent value="provider" className="mt-6">
          <ServiceProvidersTab
            providers={providers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onOpenModal={(provider) => handleOpenModal(undefined, provider)}
            onDeleteProvider={deleteServiceProvider}
            onCopyPix={handleCopyPix}
            formatCurrency={formatCurrency}
          />
        </TabsContent>
      </Tabs>

      <FolhaSalarialModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
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
