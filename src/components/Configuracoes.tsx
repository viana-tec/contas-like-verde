
import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Database, Palette, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export const Configuracoes: React.FC = () => {
  const [configuracoes, setConfiguracoes] = useState({
    nomeEmpresa: 'Like Finance Corp',
    emailAdmin: 'admin@likefinance.com',
    telefone: '+55 11 99999-9999',
    endereco: 'Rua das Flores, 123 - São Paulo, SP',
    notificacaoEmail: true,
    notificacaoSMS: false,
    notificacaoVencimento: true,
    diasAviso: 3,
    tema: 'dark',
    idioma: 'pt-BR',
    moeda: 'BRL',
    backupAutomatico: true,
    senhaObrigatoria: true,
    loginDuplo: false
  });

  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Sucesso",
      description: "Configurações salvas com sucesso!",
    });
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfiguracoes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-[#39FF14]" />
          <h1 className="text-3xl font-bold">Configurações</h1>
        </div>
        <Button onClick={handleSave} className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90">
          Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="bg-gray-900">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-[#39FF14]" />
              <h3 className="text-lg font-semibold">Informações da Empresa</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                <Input
                  id="nomeEmpresa"
                  value={configuracoes.nomeEmpresa}
                  onChange={(e) => handleConfigChange('nomeEmpresa', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="emailAdmin">Email do Administrador</Label>
                <Input
                  id="emailAdmin"
                  type="email"
                  value={configuracoes.emailAdmin}
                  onChange={(e) => handleConfigChange('emailAdmin', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={configuracoes.telefone}
                  onChange={(e) => handleConfigChange('telefone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={configuracoes.endereco}
                  onChange={(e) => handleConfigChange('endereco', e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center space-x-2 mb-4">
              <Palette className="h-5 w-5 text-[#39FF14]" />
              <h3 className="text-lg font-semibold">Preferências de Interface</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tema">Tema</Label>
                <Select value={configuracoes.tema} onValueChange={(value) => handleConfigChange('tema', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="auto">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="idioma">Idioma</Label>
                <Select value={configuracoes.idioma} onValueChange={(value) => handleConfigChange('idioma', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="moeda">Moeda</Label>
                <Select value={configuracoes.moeda} onValueChange={(value) => handleConfigChange('moeda', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                    <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-6">
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="h-5 w-5 text-[#39FF14]" />
              <h3 className="text-lg font-semibold">Configurações de Notificações</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notificacaoEmail">Notificações por Email</Label>
                  <p className="text-sm text-gray-400">Receber alertas e lembretes por email</p>
                </div>
                <Switch
                  id="notificacaoEmail"
                  checked={configuracoes.notificacaoEmail}
                  onCheckedChange={(checked) => handleConfigChange('notificacaoEmail', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notificacaoSMS">Notificações por SMS</Label>
                  <p className="text-sm text-gray-400">Receber alertas críticos por SMS</p>
                </div>
                <Switch
                  id="notificacaoSMS"
                  checked={configuracoes.notificacaoSMS}
                  onCheckedChange={(checked) => handleConfigChange('notificacaoSMS', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notificacaoVencimento">Alertas de Vencimento</Label>
                  <p className="text-sm text-gray-400">Notificar sobre contas próximas do vencimento</p>
                </div>
                <Switch
                  id="notificacaoVencimento"
                  checked={configuracoes.notificacaoVencimento}
                  onCheckedChange={(checked) => handleConfigChange('notificacaoVencimento', checked)}
                />
              </div>
              <div className="ml-6">
                <Label htmlFor="diasAviso">Dias de antecedência para avisos</Label>
                <Input
                  id="diasAviso"
                  type="number"
                  min="1"
                  max="30"
                  value={configuracoes.diasAviso}
                  onChange={(e) => handleConfigChange('diasAviso', parseInt(e.target.value))}
                  className="w-20 mt-1"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-6">
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-[#39FF14]" />
              <h3 className="text-lg font-semibold">Configurações de Segurança</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="senhaObrigatoria">Senha Obrigatória</Label>
                  <p className="text-sm text-gray-400">Exigir senha para ações sensíveis</p>
                </div>
                <Switch
                  id="senhaObrigatoria"
                  checked={configuracoes.senhaObrigatoria}
                  onCheckedChange={(checked) => handleConfigChange('senhaObrigatoria', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="loginDuplo">Autenticação em Duas Etapas</Label>
                  <p className="text-sm text-gray-400">Adicionar camada extra de segurança no login</p>
                </div>
                <Switch
                  id="loginDuplo"
                  checked={configuracoes.loginDuplo}
                  onCheckedChange={(checked) => handleConfigChange('loginDuplo', checked)}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  Alterar Senha
                </Button>
                <Button variant="outline" className="w-full">
                  Gerenciar Sessões Ativas
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sistema" className="space-y-6">
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center space-x-2 mb-4">
              <Database className="h-5 w-5 text-[#39FF14]" />
              <h3 className="text-lg font-semibold">Configurações do Sistema</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="backupAutomatico">Backup Automático</Label>
                  <p className="text-sm text-gray-400">Realizar backup diário dos dados</p>
                </div>
                <Switch
                  id="backupAutomatico"
                  checked={configuracoes.backupAutomatico}
                  onCheckedChange={(checked) => handleConfigChange('backupAutomatico', checked)}
                />
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Fazer Backup Manual
                </Button>
                <Button variant="outline">
                  <Globe className="h-4 w-4 mr-2" />
                  Exportar Dados
                </Button>
              </div>
              <Separator />
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Informações do Sistema</h4>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>Versão: 2.1.0</p>
                  <p>Última atualização: 15/01/2024</p>
                  <p>Banco de dados: PostgreSQL 14.2</p>
                  <p>Status: Online</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
