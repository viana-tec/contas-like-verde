
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Download, FileSpreadsheet, Users, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CLTEmployee {
  id: string;
  name: string;
  document: string;
  position: string;
  base_salary: number;
  payment_day_1: number;
  payment_day_2: number;
  pix_key?: string;
  email?: string;
  phone?: string;
  salary_advance: number;
  status: string;
  hire_date: string;
  created_at: string;
}

interface ServiceProvider {
  id: string;
  name: string;
  document: string;
  service_type: string;
  monthly_amount: number;
  payment_day_1: number;
  payment_day_2: number;
  pix_key?: string;
  email?: string;
  phone?: string;
  status: string;
  created_at: string;
}

export const FolhaSalarial: React.FC = () => {
  const [cltEmployees, setCltEmployees] = useState<CLTEmployee[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('clt');
  const [editingEmployee, setEditingEmployee] = useState<CLTEmployee | null>(null);
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);
  const [cltFormData, setCltFormData] = useState<Partial<CLTEmployee>>({});
  const [providerFormData, setProviderFormData] = useState<Partial<ServiceProvider>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cltResponse, providersResponse] = await Promise.all([
        supabase.from('clt_employees').select('*').order('name'),
        supabase.from('service_providers').select('*').order('name')
      ]);

      if (cltResponse.error) throw cltResponse.error;
      if (providersResponse.error) throw providersResponse.error;

      setCltEmployees(cltResponse.data || []);
      setServiceProviders(providersResponse.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da folha salarial",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleSaveCLT = async () => {
    if (!cltFormData.name || !cltFormData.document || !cltFormData.position || !cltFormData.base_salary) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      const employeeData = {
        name: cltFormData.name,
        document: cltFormData.document,
        position: cltFormData.position,
        base_salary: Number(cltFormData.base_salary),
        hire_date: cltFormData.hire_date || new Date().toISOString().split('T')[0],
        salary_advance: Number(cltFormData.salary_advance || 0),
        payment_day_1: cltFormData.payment_day_1 || 15,
        payment_day_2: cltFormData.payment_day_2 || 30,
        status: cltFormData.status || 'active',
        email: cltFormData.email || null,
        phone: cltFormData.phone || null,
        pix_key: cltFormData.pix_key || null
      };

      if (editingEmployee) {
        const { error } = await supabase
          .from('clt_employees')
          .update(employeeData)
          .eq('id', editingEmployee.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Funcionário CLT atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('clt_employees')
          .insert([employeeData]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Funcionário CLT adicionado com sucesso!" });
      }

      setIsModalOpen(false);
      setCltFormData({});
      setEditingEmployee(null);
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar funcionário CLT:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar funcionário CLT",
        variant: "destructive"
      });
    }
  };

  const handleSaveProvider = async () => {
    if (!providerFormData.name || !providerFormData.document || !providerFormData.service_type || !providerFormData.monthly_amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      const providerData = {
        name: providerFormData.name,
        document: providerFormData.document,
        service_type: providerFormData.service_type,
        monthly_amount: Number(providerFormData.monthly_amount),
        payment_day_1: providerFormData.payment_day_1 || 15,
        payment_day_2: providerFormData.payment_day_2 || 30,
        status: providerFormData.status || 'active',
        email: providerFormData.email || null,
        phone: providerFormData.phone || null,
        pix_key: providerFormData.pix_key || null
      };

      if (editingProvider) {
        const { error } = await supabase
          .from('service_providers')
          .update(providerData)
          .eq('id', editingProvider.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Prestador de serviço atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('service_providers')
          .insert([providerData]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Prestador de serviço adicionado com sucesso!" });
      }

      setIsModalOpen(false);
      setProviderFormData({});
      setEditingProvider(null);
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar prestador:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar prestador de serviço",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCLT = async (id: string) => {
    try {
      const { error } = await supabase.from('clt_employees').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Funcionário CLT removido com sucesso!" });
      fetchData();
    } catch (error) {
      console.error('Erro ao deletar funcionário CLT:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover funcionário CLT",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProvider = async (id: string) => {
    try {
      const { error } = await supabase.from('service_providers').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Prestador de serviço removido com sucesso!" });
      fetchData();
    } catch (error) {
      console.error('Erro ao deletar prestador:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover prestador de serviço",
        variant: "destructive"
      });
    }
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

  const filteredCLTEmployees = cltEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredServiceProviders = serviceProviders.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.service_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        <TabsContent value="clt" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <Input
                placeholder="Buscar funcionário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Card className="p-3 bg-gray-900 border-gray-800">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#39FF14]">{cltEmployees.length}</div>
                  <div className="text-xs text-gray-400">Funcionários CLT</div>
                </div>
              </Card>
              <Card className="p-3 bg-gray-900 border-gray-800">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#39FF14]">
                    {formatCurrency(cltEmployees.reduce((sum, f) => sum + f.base_salary, 0))}
                  </div>
                  <div className="text-xs text-gray-400">Total CLT</div>
                </div>
              </Card>
            </div>
            <Button 
              onClick={() => handleOpenModal('clt')}
              className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Funcionário CLT
            </Button>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white font-bold">Nome</TableHead>
                  <TableHead className="text-white font-bold">Função</TableHead>
                  <TableHead className="text-white font-bold">Salário</TableHead>
                  <TableHead className="text-white font-bold">Vale</TableHead>
                  <TableHead className="text-white font-bold">1º Pagamento</TableHead>
                  <TableHead className="text-white font-bold">2º Pagamento</TableHead>
                  <TableHead className="text-white font-bold">Chave PIX</TableHead>
                  <TableHead className="text-white font-bold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCLTEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium text-white font-bold">{employee.name}</TableCell>
                    <TableCell className="text-white font-bold">{employee.position}</TableCell>
                    <TableCell className="text-[#39FF14] font-bold">
                      {formatCurrency(employee.base_salary)}
                    </TableCell>
                    <TableCell className="text-white font-bold">
                      {formatCurrency(employee.salary_advance)}
                    </TableCell>
                    <TableCell className="text-white font-bold">Dia {employee.payment_day_1}</TableCell>
                    <TableCell className="text-white font-bold">Dia {employee.payment_day_2}</TableCell>
                    <TableCell className="text-white font-bold">
                      {employee.pix_key && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{employee.pix_key}</span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleCopyPix(employee.pix_key!)}
                            className="p-1 h-auto"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleOpenModal('clt', employee)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteCLT(employee.id)}
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

        <TabsContent value="providers" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <Input
                placeholder="Buscar prestador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Card className="p-3 bg-gray-900 border-gray-800">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#39FF14]">{serviceProviders.length}</div>
                  <div className="text-xs text-gray-400">Prestadores</div>
                </div>
              </Card>
              <Card className="p-3 bg-gray-900 border-gray-800">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#39FF14]">
                    {formatCurrency(serviceProviders.reduce((sum, p) => sum + p.monthly_amount, 0))}
                  </div>
                  <div className="text-xs text-gray-400">Total Prestadores</div>
                </div>
              </Card>
            </div>
            <Button 
              onClick={() => handleOpenModal('provider')}
              className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Prestador
            </Button>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white font-bold">Nome</TableHead>
                  <TableHead className="text-white font-bold">Tipo de Serviço</TableHead>
                  <TableHead className="text-white font-bold">Valor Mensal</TableHead>
                  <TableHead className="text-white font-bold">1º Pagamento</TableHead>
                  <TableHead className="text-white font-bold">2º Pagamento</TableHead>
                  <TableHead className="text-white font-bold">Chave PIX</TableHead>
                  <TableHead className="text-white font-bold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServiceProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium text-white font-bold">{provider.name}</TableCell>
                    <TableCell className="text-white font-bold">{provider.service_type}</TableCell>
                    <TableCell className="text-[#39FF14] font-bold">
                      {formatCurrency(provider.monthly_amount)}
                    </TableCell>
                    <TableCell className="text-white font-bold">Dia {provider.payment_day_1}</TableCell>
                    <TableCell className="text-white font-bold">Dia {provider.payment_day_2}</TableCell>
                    <TableCell className="text-white font-bold">
                      {provider.pix_key && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{provider.pix_key}</span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleCopyPix(provider.pix_key!)}
                            className="p-1 h-auto"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleOpenModal('provider', provider)}
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

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'clt' 
                ? (editingEmployee ? 'Editar Funcionário CLT' : 'Novo Funcionário CLT')
                : (editingProvider ? 'Editar Prestador de Serviço' : 'Novo Prestador de Serviço')
              }
            </DialogTitle>
          </DialogHeader>
          
          {activeTab === 'clt' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={cltFormData.name || ''}
                    onChange={(e) => setCltFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="document">CPF *</Label>
                  <Input
                    id="document"
                    value={cltFormData.document || ''}
                    onChange={(e) => setCltFormData(prev => ({ ...prev, document: e.target.value }))}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Função *</Label>
                  <Input
                    id="position"
                    value={cltFormData.position || ''}
                    onChange={(e) => setCltFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Cargo ou função"
                  />
                </div>
                <div>
                  <Label htmlFor="hire_date">Data de Admissão</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={cltFormData.hire_date || ''}
                    onChange={(e) => setCltFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="base_salary">Salário Base *</Label>
                  <Input
                    id="base_salary"
                    type="number"
                    step="0.01"
                    value={cltFormData.base_salary || ''}
                    onChange={(e) => setCltFormData(prev => ({ ...prev, base_salary: parseFloat(e.target.value) }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="salary_advance">Vale (Adiantamento)</Label>
                  <Input
                    id="salary_advance"
                    type="number"
                    step="0.01"
                    value={cltFormData.salary_advance || ''}
                    onChange={(e) => setCltFormData(prev => ({ ...prev, salary_advance: parseFloat(e.target.value) }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={cltFormData.status || 'active'}
                    onChange={(e) => setCltFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_day_1">1º Pagamento (Dia)</Label>
                  <Input
                    id="payment_day_1"
                    type="number"
                    min="1"
                    max="31"
                    value={cltFormData.payment_day_1 || ''}
                    onChange={(e) => setCltFormData(prev => ({ ...prev, payment_day_1: parseInt(e.target.value) }))}
                    placeholder="15"
                  />
                </div>
                <div>
                  <Label htmlFor="payment_day_2">2º Pagamento (Dia)</Label>
                  <Input
                    id="payment_day_2"
                    type="number"
                    min="1"
                    max="31"
                    value={cltFormData.payment_day_2 || ''}
                    onChange={(e) => setCltFormData(prev => ({ ...prev, payment_day_2: parseInt(e.target.value) }))}
                    placeholder="30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={cltFormData.email || ''}
                    onChange={(e) => setCltFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={cltFormData.phone || ''}
                    onChange={(e) => setCltFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="pix_key">Chave PIX</Label>
                  <Input
                    id="pix_key"
                    value={cltFormData.pix_key || ''}
                    onChange={(e) => setCltFormData(prev => ({ ...prev, pix_key: e.target.value }))}
                    placeholder="CPF, email, telefone..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveCLT}
                  className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90"
                >
                  {editingEmployee ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider_name">Nome *</Label>
                  <Input
                    id="provider_name"
                    value={providerFormData.name || ''}
                    onChange={(e) => setProviderFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="provider_document">CPF/CNPJ *</Label>
                  <Input
                    id="provider_document"
                    value={providerFormData.document || ''}
                    onChange={(e) => setProviderFormData(prev => ({ ...prev, document: e.target.value }))}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service_type">Tipo de Serviço *</Label>
                  <Input
                    id="service_type"
                    value={providerFormData.service_type || ''}
                    onChange={(e) => setProviderFormData(prev => ({ ...prev, service_type: e.target.value }))}
                    placeholder="Ex: Consultoria, Desenvolvimento..."
                  />
                </div>
                <div>
                  <Label htmlFor="monthly_amount">Valor Mensal *</Label>
                  <Input
                    id="monthly_amount"
                    type="number"
                    step="0.01"
                    value={providerFormData.monthly_amount || ''}
                    onChange={(e) => setProviderFormData(prev => ({ ...prev, monthly_amount: parseFloat(e.target.value) }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider_payment_day_1">1º Pagamento (Dia)</Label>
                  <Input
                    id="provider_payment_day_1"
                    type="number"
                    min="1"
                    max="31"
                    value={providerFormData.payment_day_1 || ''}
                    onChange={(e) => setProviderFormData(prev => ({ ...prev, payment_day_1: parseInt(e.target.value) }))}
                    placeholder="15"
                  />
                </div>
                <div>
                  <Label htmlFor="provider_payment_day_2">2º Pagamento (Dia)</Label>
                  <Input
                    id="provider_payment_day_2"
                    type="number"
                    min="1"
                    max="31"
                    value={providerFormData.payment_day_2 || ''}
                    onChange={(e) => setProviderFormData(prev => ({ ...prev, payment_day_2: parseInt(e.target.value) }))}
                    placeholder="30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="provider_email">Email</Label>
                  <Input
                    id="provider_email"
                    type="email"
                    value={providerFormData.email || ''}
                    onChange={(e) => setProviderFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="provider_phone">Telefone</Label>
                  <Input
                    id="provider_phone"
                    value={providerFormData.phone || ''}
                    onChange={(e) => setProviderFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="provider_pix_key">Chave PIX</Label>
                  <Input
                    id="provider_pix_key"
                    value={providerFormData.pix_key || ''}
                    onChange={(e) => setProviderFormData(prev => ({ ...prev, pix_key: e.target.value }))}
                    placeholder="CPF, email, telefone..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveProvider}
                  className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90"
                >
                  {editingProvider ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
