
import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Download, FileSpreadsheet, Users, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCltEmployees } from '@/hooks/useCltEmployees';
import { useServiceProviders } from '@/hooks/useServiceProviders';
import { CltEmployeeForm } from './CltEmployeeForm';
import { ServiceProviderForm } from './ServiceProviderForm';
import type { Tables } from '@/integrations/supabase/types';

export const FolhaSalarial: React.FC = () => {
  const { employees, loading: loadingEmployees, addEmployee, updateEmployee, deleteEmployee } = useCltEmployees();
  const { providers, loading: loadingProviders, addProvider, updateProvider, deleteProvider } = useServiceProviders();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('clt');
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Tables<'clt_employees'> | null>(null);
  const [editingProvider, setEditingProvider] = useState<Tables<'service_providers'> | null>(null);
  const [copiedPix, setCopiedPix] = useState<string | null>(null);
  const { toast } = useToast();

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
      description: "Gerando arquivo PDF...",
    });
  };

  const handleExportExcel = () => {
    toast({
      title: "Exportando",
      description: "Gerando arquivo Excel...",
    });
  };

  const copyPixKey = async (pixKey: string) => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopiedPix(pixKey);
      toast({
        title: "Copiado!",
        description: "Chave PIX copiada para a área de transferência",
      });
      setTimeout(() => setCopiedPix(null), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a chave PIX",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.service_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEmployeesPayroll = employees.reduce((sum, emp) => 
    sum + emp.base_salary - (emp.salary_advance || 0) - (emp.discounts || 0) + (emp.bonuses || 0), 0
  );

  const totalProvidersPayroll = providers.reduce((sum, prov) => sum + prov.monthly_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-[#39FF14]" />
          <h1 className="text-3xl font-bold text-white">Folha Salarial</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clt" className="text-white">Funcionários CLT</TabsTrigger>
          <TabsTrigger value="providers" className="text-white">Prestadores de Serviços</TabsTrigger>
        </TabsList>

        <TabsContent value="clt" className="space-y-4">
          {/* Search and Stats for CLT */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 md:col-span-2 bg-gray-900 border-gray-800">
              <Label htmlFor="search-clt" className="text-white">Buscar Funcionário CLT</Label>
              <Input
                id="search-clt"
                placeholder="Nome ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-white"
              />
            </Card>
            <Card className="p-4 bg-gray-900 border-gray-800">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#39FF14]">{employees.length}</div>
                <div className="text-sm text-gray-400">Total CLT</div>
              </div>
            </Card>
            <Card className="p-4 bg-gray-900 border-gray-800">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#39FF14]">
                  {formatCurrency(totalEmployeesPayroll)}
                </div>
                <div className="text-sm text-gray-400">Folha CLT</div>
              </div>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={() => handleOpenEmployeeModal()}
              className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Funcionário CLT
            </Button>
          </div>

          {/* CLT Table */}
          <Card className="bg-gray-900 border-gray-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white font-bold">Nome</TableHead>
                  <TableHead className="text-white font-bold">Cargo</TableHead>
                  <TableHead className="text-white font-bold">Salário Base</TableHead>
                  <TableHead className="text-white font-bold">Vale</TableHead>
                  <TableHead className="text-white font-bold">Descontos</TableHead>
                  <TableHead className="text-white font-bold">Líquido</TableHead>
                  <TableHead className="text-white font-bold">Chave PIX</TableHead>
                  <TableHead className="text-white font-bold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => {
                  const liquidValue = employee.base_salary - (employee.salary_advance || 0) - (employee.discounts || 0) + (employee.bonuses || 0);
                  return (
                    <TableRow key={employee.id}>
                      <TableCell className="font-bold text-white">{employee.name}</TableCell>
                      <TableCell className="text-white font-bold">{employee.position}</TableCell>
                      <TableCell className="text-[#39FF14] font-bold">
                        {formatCurrency(employee.base_salary)}
                      </TableCell>
                      <TableCell className="text-white font-bold">
                        {formatCurrency(employee.salary_advance || 0)}
                      </TableCell>
                      <TableCell className="text-white font-bold">
                        {formatCurrency(employee.discounts || 0)}
                      </TableCell>
                      <TableCell className="text-[#39FF14] font-bold">
                        {formatCurrency(liquidValue)}
                      </TableCell>
                      <TableCell className="text-white font-bold">
                        {employee.pix_key && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-400 truncate max-w-[100px]">
                              {employee.pix_key}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyPixKey(employee.pix_key!)}
                              className="h-6 w-6 p-0"
                            >
                              {copiedPix === employee.pix_key ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleOpenEmployeeModal(employee)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          {/* Search and Stats for Providers */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 md:col-span-2 bg-gray-900 border-gray-800">
              <Label htmlFor="search-providers" className="text-white">Buscar Prestador</Label>
              <Input
                id="search-providers"
                placeholder="Nome ou tipo de serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-white"
              />
            </Card>
            <Card className="p-4 bg-gray-900 border-gray-800">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#39FF14]">{providers.length}</div>
                <div className="text-sm text-gray-400">Total Prestadores</div>
              </div>
            </Card>
            <Card className="p-4 bg-gray-900 border-gray-800">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#39FF14]">
                  {formatCurrency(totalProvidersPayroll)}
                </div>
                <div className="text-sm text-gray-400">Folha Prestadores</div>
              </div>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={() => handleOpenProviderModal()}
              className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Prestador de Serviços
            </Button>
          </div>

          {/* Providers Table */}
          <Card className="bg-gray-900 border-gray-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white font-bold">Nome</TableHead>
                  <TableHead className="text-white font-bold">Tipo de Serviço</TableHead>
                  <TableHead className="text-white font-bold">Valor Mensal</TableHead>
                  <TableHead className="text-white font-bold">Dia Pagamento</TableHead>
                  <TableHead className="text-white font-bold">Chave PIX</TableHead>
                  <TableHead className="text-white font-bold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-bold text-white">{provider.name}</TableCell>
                    <TableCell className="text-white font-bold">{provider.service_type}</TableCell>
                    <TableCell className="text-[#39FF14] font-bold">
                      {formatCurrency(provider.monthly_amount)}
                    </TableCell>
                    <TableCell className="text-white font-bold">Dia {provider.payment_date}</TableCell>
                    <TableCell className="text-white font-bold">
                      {provider.pix_key && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400 truncate max-w-[100px]">
                            {provider.pix_key}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyPixKey(provider.pix_key!)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedPix === provider.pix_key ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleOpenProviderModal(provider)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteProvider(provider.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CltEmployeeForm
        isOpen={isEmployeeModalOpen}
        onSubmit={handleEmployeeSubmit}
        onCancel={() => {
          setIsEmployeeModalOpen(false);
          setEditingEmployee(null);
        }}
        initialData={editingEmployee || undefined}
      />

      <ServiceProviderForm
        isOpen={isProviderModalOpen}
        onSubmit={handleProviderSubmit}
        onCancel={() => {
          setIsProviderModalOpen(false);
          setEditingProvider(null);
        }}
        initialData={editingProvider || undefined}
      />
    </div>
  );
};
