import React from 'react';
import { BarChart3, DollarSign, TrendingUp, AlertCircle, Calendar, PieChart, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';
const monthlyData = [{
  mes: 'Jul',
  pago: 18500,
  pendente: 12300
}, {
  mes: 'Ago',
  pago: 22100,
  pendente: 8900
}, {
  mes: 'Set',
  pago: 19800,
  pendente: 15600
}, {
  mes: 'Out',
  pago: 25300,
  pendente: 11200
}, {
  mes: 'Nov',
  pago: 21900,
  pendente: 9800
}, {
  mes: 'Dez',
  pago: 28700,
  pendente: 14100
}];
const categoryData = [{
  name: 'Utilities',
  value: 35,
  color: '#39FF14'
}, {
  name: 'Aluguel',
  value: 25,
  color: '#00D9FF'
}, {
  name: 'Materiais',
  value: 20,
  color: '#FF6B35'
}, {
  name: 'Serviços',
  value: 15,
  color: '#FFD23F'
}, {
  name: 'Outros',
  value: 5,
  color: '#FF3366'
}];
const weeklyPayments = [{
  dia: 'Seg',
  valor: 3200
}, {
  dia: 'Ter',
  valor: 1800
}, {
  dia: 'Qua',
  valor: 4500
}, {
  dia: 'Qui',
  valor: 2900
}, {
  dia: 'Sex',
  valor: 5100
}, {
  dia: 'Sáb',
  valor: 1200
}, {
  dia: 'Dom',
  valor: 800
}];
export const Dashboard: React.FC = () => {
  return <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <BarChart3 className="h-8 w-8 text-[#39FF14]" />
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total a Pagar</p>
              <p className="text-2xl font-bold text-red-400">R$ 45.230,00</p>
            </div>
            <DollarSign className="h-8 w-8 text-red-400" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Pago</p>
              <p className="text-2xl font-bold text-[#39FF14]">R$ 128.750,00</p>
            </div>
            <TrendingUp className="h-8 w-8 text-[#39FF14]" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Vencendo Hoje</p>
              <p className="text-2xl font-bold text-orange-400">R$ 8.450,00</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-400" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Próx. 7 Dias</p>
              <p className="text-2xl font-bold text-blue-400">R$ 23.890,00</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Payments Line Chart */}
        <Card className="p-6 bg-gray-900 border-gray-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-slate-50">
            <TrendingUp className="h-5 w-5 mr-2 text-[#39FF14]" />
            Pagamentos Mensais
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="mes" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }} formatter={value => [`R$ ${Number(value).toLocaleString()}`, '']} />
              <Line type="monotone" dataKey="pago" stroke="#39FF14" strokeWidth={3} name="Pago" dot={{
              fill: '#39FF14',
              strokeWidth: 2,
              r: 4
            }} />
              <Line type="monotone" dataKey="pendente" stroke="#FF6B6B" strokeWidth={3} name="Pendente" dot={{
              fill: '#FF6B6B',
              strokeWidth: 2,
              r: 4
            }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Distribution Pie Chart */}
        <Card className="p-6 bg-gray-900 border-gray-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-slate-50">
            <PieChart className="h-5 w-5 mr-2 text-[#39FF14]" />
            Gastos por Categoria
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({
              name,
              value
            }) => `${name}: ${value}%`}>
                {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </Card>

        {/* Weekly Payments Bar Chart */}
        <Card className="p-6 bg-gray-900 border-gray-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-zinc-50">
            <BarChart3 className="h-5 w-5 mr-2 text-[#39FF14]" />
            Pagamentos Semanais
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyPayments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="dia" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }} formatter={value => [`R$ ${Number(value).toLocaleString()}`, 'Valor']} />
              <Bar dataKey="valor" fill="#39FF14" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Activities */}
        <Card className="p-6 bg-gray-900 border-gray-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-zinc-50">
            <Users className="h-5 w-5 mr-2 text-[#39FF14]" />
            Atividades Recentes
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-zinc-50">Pagamento realizado</p>
                <p className="text-sm text-gray-400">Energia Elétrica - CEMIG</p>
              </div>
              <div className="text-right">
                <p className="text-[#39FF14] font-bold">R$ 890,50</p>
                <p className="text-xs text-gray-400">há 2 horas</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-zinc-50">Nova conta cadastrada</p>
                <p className="text-sm text-gray-400">Material de Escritório</p>
              </div>
              <div className="text-right">
                <p className="text-orange-400 font-bold">R$ 245,80</p>
                <p className="text-xs text-gray-400">há 4 horas</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-zinc-50">Boleto anexado</p>
                <p className="text-sm text-gray-400">Aluguel - Janeiro</p>
              </div>
              <div className="text-right">
                <p className="text-blue-400 font-bold">R$ 3.500,00</p>
                <p className="text-xs text-gray-400">há 6 horas</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-zinc-50">
          <AlertCircle className="h-5 w-5 mr-2 text-orange-400" />
          Alertas e Lembretes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <h4 className="font-medium text-red-400 mb-2">Contas Vencidas</h4>
            <p className="text-2xl font-bold text-red-400">3</p>
            <p className="text-sm text-gray-400">Total: R$ 2.850,00</p>
          </div>
          
          <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
            <h4 className="font-medium text-orange-400 mb-2">Vencendo Hoje</h4>
            <p className="text-2xl font-bold text-orange-400">2</p>
            <p className="text-sm text-gray-400">Total: R$ 1.420,00</p>
          </div>
          
          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <h4 className="font-medium text-blue-400 mb-2">Próximos 3 Dias</h4>
            <p className="text-2xl font-bold text-blue-400">5</p>
            <p className="text-sm text-gray-400">Total: R$ 8.950,00</p>
          </div>
        </div>
      </Card>
    </div>;
};