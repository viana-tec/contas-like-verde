import React, { useState } from 'react';
import { Download, FileSpreadsheet, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCltEmployees } from '@/hooks/useCltEmployees';
import { useServiceProviders } from '@/hooks/useServiceProviders';
import { CltEmployeeForm } from './CltEmployeeForm';
import { ServiceProviderForm } from './ServiceProviderForm';
import { FolhaSalarialTabs } from './FolhaSalarial/FolhaSalarialTabs';
import type { Tables } from '@/integrations/supabase/types';
export const FolhaSalarial: React.FC = () => {
  const {
    employees,
    loading: loadingEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee
  } = useCltEmployees();
  const {
    providers,
    loading: loadingProviders,
    addProvider,
    updateProvider,
    deleteProvider
  } = useServiceProviders();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('clt');
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Tables<'clt_employees'> | null>(null);
  const [editingProvider, setEditingProvider] = useState<Tables<'service_providers'> | null>(null);
  const {
    toast
  } = useToast();
  const handleOpenEmployeeModal = (employee?: Tables<'clt_employees'>) => {
    setEditingEmployee(employee || null);
    setIsEmployeeModalOpen(true);
  };
  const handleOpenProviderModal = (provider?: Tables<'service_providers'>) => {
    setEditingProvider(provider || null);
    setIsProviderModalOpen(true);
  };
  const handleEmployeeSubmit = async (employeeData: any) => {
    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, employeeData);
    } else {
      await addEmployee(employeeData);
    }
    setIsEmployeeModalOpen(false);
    setEditingEmployee(null);
  };
  const handleProviderSubmit = async (providerData: any) => {
    if (editingProvider) {
      await updateProvider(editingProvider.id, providerData);
    } else {
      await addProvider(providerData);
    }
    setIsProviderModalOpen(false);
    setEditingProvider(null);
  };
  const handleDeleteEmployee = (id: string) => {
    deleteEmployee(id);
  };
  const handleDeleteProvider = (id: string) => {
    deleteProvider(id);
  };
  const handleExportPDF = () => {
    toast({
      title: "Exportando",
      description: "Gerando arquivo PDF..."
    });
  };
  const handleExportExcel = () => {
    toast({
      title: "Exportando",
      description: "Gerando arquivo Excel..."
    });
  };
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  const filteredEmployees = employees.filter(employee => employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || employee.position.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredProviders = providers.filter(provider => provider.name.toLowerCase().includes(searchTerm.toLowerCase()) || provider.service_type.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalEmployeesPayroll = employees.reduce((sum, emp) => sum + emp.base_salary - (emp.salary_advance || 0) - (emp.discounts || 0) + (emp.bonuses || 0), 0);
  const totalProvidersPayroll = providers.reduce((sum, prov) => sum + prov.monthly_amount, 0);
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-[#39FF14]" />
          <h1 className="text-3xl font-bold text-white">Folha Salarial</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportPDF} className="text-slate-950">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel} className="text-slate-950">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      <FolhaSalarialTabs activeTab={activeTab} setActiveTab={setActiveTab} searchTerm={searchTerm} setSearchTerm={setSearchTerm} employees={employees} providers={providers} filteredEmployees={filteredEmployees} filteredProviders={filteredProviders} totalEmployeesPayroll={totalEmployeesPayroll} totalProvidersPayroll={totalProvidersPayroll} formatCurrency={formatCurrency} handleOpenEmployeeModal={handleOpenEmployeeModal} handleOpenProviderModal={handleOpenProviderModal} handleDeleteEmployee={handleDeleteEmployee} handleDeleteProvider={handleDeleteProvider} />

      {/* Modals */}
      <CltEmployeeForm isOpen={isEmployeeModalOpen} onSubmit={handleEmployeeSubmit} onCancel={() => {
      setIsEmployeeModalOpen(false);
      setEditingEmployee(null);
    }} initialData={editingEmployee || undefined} />

      <ServiceProviderForm isOpen={isProviderModalOpen} onSubmit={handleProviderSubmit} onCancel={() => {
      setIsProviderModalOpen(false);
      setEditingProvider(null);
    }} initialData={editingProvider || undefined} />
    </div>;
};