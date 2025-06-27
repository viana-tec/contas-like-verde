
import React, { useState } from 'react';
import { 
  FileText, 
  TrendingUp, 
  Calendar, 
  PieChart, 
  BarChart3, 
  Download, 
  Filter,
  Eye,
  DollarSign,
  CreditCard,
  Target,
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const fluxoCaixaData = [
  { mes: 'Jan', entradas: 45000, saidas: 38000, saldo: 7000 },
  { mes: 'Fev', entradas: 52000, saidas: 41000, saldo: 11000 },
  { mes: 'Mar', entradas: 48000, saidas: 45000, saldo: 3000 },
  { mes: 'Abr', entradas: 61000, saidas: 47000, saldo: 14000 },
  { mes: 'Mai', entradas: 55000, saidas: 52000, saldo: 3000 },
  { mes: 'Jun', entradas: 58000, saidas: 49000, saldo: 9000 }
];

const categoriasData = [
  { name: 'Salários', value: 45, color: '#39FF14' },
  { name: 'Fornecedores', value: 25, color: '#00D9FF' },
  { name: 'Aluguel', value: 15, color: '#FF6B35' },
  { name: 'Impostos', value: 10, color: '#FFD23F' },
  { name: 'Outros', value: 5, color: '#FF3366' }
];

const inadimplenciaData = [
  { mes: 'Jan', total: 15000, vencidas: 2500 },
  { mes: 'Fev', total: 18000, vencidas: 3200 },
  { mes: 'Mar', total: 22000, vencidas: 1800 },
  { mes: 'Abr', total: 19000, vencidas: 4100 },
  { mes: 'Mai', total: 25000, vencidas: 2900 },
  { mes: 'Jun', total: 21000, vencidas: 3500 }
];

export const Relatorios: React.FC = () => {
  const [filtroAtivo, setFiltroAtivo] = useState('mes');
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<string | null>(null);

  const relatorios = [
    {
      id: 'fluxo-caixa',
      titulo: 'Fluxo de Caixa',
      descricao: 'Análise detalhada de entradas e saídas',
      icon: TrendingUp,
      color: 'text-[#39FF14]',
      dados: fluxoCaixaData
    },
    {
      id: 'dre',
      titulo: 'DRE - Demonstrativo de Resultado',
      descricao: 'Receitas, custos e resultado líquido',
      icon: BarChart3,
      color: 'text-blue-400',
      dados: []
    },
    {
      id: 'contas-pagar',
      titulo: 'Contas a Pagar',
      descricao: 'Pendências e vencimentos',
      icon: CreditCard,
      color: 'text-red-400',
      dados: []
    },
    {
      id: 'inadimplencia',
      titulo: 'Relatório de Inadimplência',
      descricao: 'Contas vencidas e em atraso',
      icon: AlertCircle,
      color: 'text-orange-400',
      dados: inadimplenciaData
    },
    {
      id: 'categorias',
      titulo: 'Gastos por Categoria',
      descricao: 'Distribuição de gastos por categoria',
      icon: PieChart,
      color: 'text-purple-400',
      dados: categoriasData
    },
    {
      id: 'folha-pagamento',
      titulo: 'Folha de Pagamento',
      descricao: 'Relatório mensal de salários',
      icon: Users,
      color: 'text-green-400',
      dados: []
    }
  ];

  const handleExportarRelatorio = (tipo: string, formato: string) => {
    console.log(`Exportando relatório ${tipo} em formato ${formato}`);
    // Simulação de exportação
  };

  const handleVisualizarRelatorio = (id: string) => {
    setRelatorioSelecionado(id);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-[#39FF14]" />
          <h1 className="text-2xl sm:text-3xl font-bold">Relatórios</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <select 
            value={filtroAtivo}
            onChange={(e) => setFiltroAtivo(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#39FF14]"
          >
            <option value="mes">Este Mês</option>
            <option value="trimestre">Trimestre</option>
            <option value="semestre">Semestre</option>
            <option value="ano">Ano</option>
          </select>
          
          <Button className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90 text-sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Cards de Relatórios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {relatorios.map((relatorio) => (
          <Card key={relatorio.id} className="p-4 sm:p-6 bg-gray-900 border-gray-800 hover:border-[#39FF14]/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <relatorio.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${relatorio.color}`} />
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">{relatorio.titulo}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">{relatorio.descricao}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
              <Button 
                onClick={() => handleVisualizarRelatorio(relatorio.id)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleExportarRelatorio(relatorio.id, 'pdf')}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm px-3"
                >
                  PDF
                </Button>
                <Button 
                  onClick={() => handleExportarRelatorio(relatorio.id, 'excel')}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm px-3"
                >
                  Excel
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Visualização do Relatório Selecionado */}
      {relatorioSelecionado && (
        <Card className="p-4 sm:p-6 bg-gray-900 border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {relatorios.find(r => r.id === relatorioSelecionado)?.titulo}
            </h2>
            <Button 
              onClick={() => setRelatorioSelecionado(null)}
              className="bg-gray-800 hover:bg-gray-700 text-white w-full sm:w-auto"
            >
              Fechar
            </Button>
          </div>

          {/* Gráfico do Fluxo de Caixa */}
          {relatorioSelecionado === 'fluxo-caixa' && (
            <div className="space-y-6">
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fluxoCaixaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="mes" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, '']}
                    />
                    <Line type="monotone" dataKey="entradas" stroke="#39FF14" strokeWidth={3} name="Entradas" />
                    <Line type="monotone" dataKey="saidas" stroke="#FF6B6B" strokeWidth={3} name="Saídas" />
                    <Line type="monotone" dataKey="saldo" stroke="#00D9FF" strokeWidth={3} name="Saldo" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <h4 className="font-medium text-green-400 mb-2">Total Entradas</h4>
                  <p className="text-xl sm:text-2xl font-bold text-green-400">R$ 319.000</p>
                </div>
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <h4 className="font-medium text-red-400 mb-2">Total Saídas</h4>
                  <p className="text-xl sm:text-2xl font-bold text-red-400">R$ 272.000</p>
                </div>
                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <h4 className="font-medium text-blue-400 mb-2">Saldo Médio</h4>
                  <p className="text-xl sm:text-2xl font-bold text-blue-400">R$ 47.000</p>
                </div>
              </div>
            </div>
          )}

          {/* Gráfico de Categorias */}
          {relatorioSelecionado === 'categorias' && (
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie 
                    data={categoriasData} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {categoriasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de Inadimplência */}
          {relatorioSelecionado === 'inadimplencia' && (
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inadimplenciaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="mes" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, '']}
                  />
                  <Bar dataKey="total" fill="#39FF14" name="Total" />
                  <Bar dataKey="vencidas" fill="#FF6B6B" name="Vencidas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Outros Relatórios */}
          {!['fluxo-caixa', 'categorias', 'inadimplencia'].includes(relatorioSelecionado) && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-400">
                Relatório em desenvolvimento. Em breve você poderá visualizar dados detalhados aqui.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Resumo Executivo */}
      <Card className="p-4 sm:p-6 bg-gray-900 border-gray-800">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center text-white">
          <Target className="h-5 w-5 mr-2 text-[#39FF14]" />
          Resumo Executivo
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Receita Mensal</span>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-green-400">R$ 58.000</p>
            <p className="text-xs text-gray-500">+12% vs mês anterior</p>
          </div>
          
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Gastos Mensais</span>
              <DollarSign className="h-4 w-4 text-red-400" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-red-400">R$ 49.000</p>
            <p className="text-xs text-gray-500">+8% vs mês anterior</p>
          </div>
          
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Contas Vencidas</span>
              <AlertCircle className="h-4 w-4 text-orange-400" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-orange-400">R$ 3.500</p>
            <p className="text-xs text-gray-500">3 contas em atraso</p>
          </div>
          
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Funcionários</span>
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-blue-400">12</p>
            <p className="text-xs text-gray-500">Folha: R$ 28.000</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
