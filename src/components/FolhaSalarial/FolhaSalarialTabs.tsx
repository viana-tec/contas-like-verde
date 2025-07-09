import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolhaSalarialStats } from './FolhaSalarialStats';
import { CltEmployeesTab } from './CltEmployeesTab';
import { ServiceProvidersTab } from './ServiceProvidersTab';
import type { Tables } from '@/integrations/supabase/types';
interface FolhaSalarialTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  employees: Tables<'clt_employees'>[];
  providers: Tables<'service_providers'>[];
  filteredEmployees: Tables<'clt_employees'>[];
  filteredProviders: Tables<'service_providers'>[];
  totalEmployeesPayroll: number;
  totalProvidersPayroll: number;
  formatCurrency: (value: number) => string;
  handleOpenEmployeeModal: (employee?: Tables<'clt_employees'>) => void;
  handleOpenProviderModal: (provider?: Tables<'service_providers'>) => void;
  handleDeleteEmployee: (id: string) => void;
  handleDeleteProvider: (id: string) => void;
}
export const FolhaSalarialTabs: React.FC<FolhaSalarialTabsProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  employees,
  providers,
  filteredEmployees,
  filteredProviders,
  totalEmployeesPayroll,
  totalProvidersPayroll,
  formatCurrency,
  handleOpenEmployeeModal,
  handleOpenProviderModal,
  handleDeleteEmployee,
  handleDeleteProvider
}) => {
  return <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="clt" className="text-stone-950">Funcionários CLT</TabsTrigger>
        <TabsTrigger value="providers" className="text-lime-500">Prestadores de Serviços</TabsTrigger>
      </TabsList>

      <TabsContent value="clt" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 md:col-span-2 bg-gray-900 border-gray-800">
            <Label htmlFor="search-clt" className="text-white">Buscar Funcionário CLT</Label>
            <Input id="search-clt" placeholder="Nome ou cargo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="text-white" />
          </Card>
          <FolhaSalarialStats employeeCount={employees.length} providerCount={providers.length} totalEmployeePayroll={totalEmployeesPayroll} totalProviderPayroll={totalProvidersPayroll} activeTab={activeTab} formatCurrency={formatCurrency} />
        </div>

        <CltEmployeesTab employees={employees} searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleOpenEmployeeModal={handleOpenEmployeeModal} handleDeleteEmployee={handleDeleteEmployee} formatCurrency={formatCurrency} filteredEmployees={filteredEmployees} />
      </TabsContent>

      <TabsContent value="providers" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 md:col-span-2 bg-gray-900 border-gray-800">
            <Label htmlFor="search-providers" className="text-white">Buscar Prestador</Label>
            <Input id="search-providers" placeholder="Nome ou tipo de serviço..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="text-white" />
          </Card>
          <FolhaSalarialStats employeeCount={employees.length} providerCount={providers.length} totalEmployeePayroll={totalEmployeesPayroll} totalProviderPayroll={totalProvidersPayroll} activeTab={activeTab} formatCurrency={formatCurrency} />
        </div>

        <ServiceProvidersTab providers={providers} handleOpenProviderModal={handleOpenProviderModal} handleDeleteProvider={handleDeleteProvider} formatCurrency={formatCurrency} filteredProviders={filteredProviders} />
      </TabsContent>
    </Tabs>;
};