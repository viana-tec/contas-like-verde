
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle } from 'lucide-react';

const financialCards = [
  {
    title: 'Total a Pagar Este Mês',
    value: 'R$ 45.280,00',
    icon: DollarSign,
    trend: '+12.5%',
    color: 'text-red-400',
    bgColor: 'bg-red-900/20'
  },
  {
    title: 'Total Pago',
    value: 'R$ 32.150,00',
    icon: TrendingUp,
    trend: '+8.2%',
    color: 'text-[#39FF14]',
    bgColor: 'bg-green-900/20'
  },
  {
    title: 'Contas Vencidas',
    value: '12',
    icon: AlertTriangle,
    trend: '-2',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20'
  },
  {
    title: 'Próximos Vencimentos',
    value: '8',
    icon: Calendar,
    trend: '+3',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20'
  }
];

const recentPayments = [
  { fornecedor: 'Empresa ABC Ltda', valor: 'R$ 2.500,00', data: '15/12/2024', status: 'Pago' },
  { fornecedor: 'Fornecedor XYZ', valor: 'R$ 1.200,00', data: '14/12/2024', status: 'Pago' },
  { fornecedor: 'Serviços Tech', valor: 'R$ 3.800,00', data: '13/12/2024', status: 'Pendente' },
  { fornecedor: 'Material Office', valor: 'R$ 650,00', data: '12/12/2024', status: 'Vencido' },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Visão geral das suas finanças</p>
      </div>

      {/* Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialCards.map((card, index) => (
          <div key={index} className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 hover:border-[#39FF14]/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <card.icon size={24} className={card.color} />
              </div>
              <span className={`text-sm ${card.color}`}>{card.trend}</span>
            </div>
            <div>
              <p className="text-2xl font-bold mb-1">{card.value}</p>
              <p className="text-gray-400 text-sm">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4">Fluxo de Pagamentos</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-xl">
            <p className="text-gray-500">Gráfico de linha será implementado aqui</p>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4">Status das Contas</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-xl">
            <p className="text-gray-500">Gráfico pizza será implementado aqui</p>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-4">Pagamentos Recentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-400">Fornecedor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Valor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Data</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-4">{payment.fornecedor}</td>
                  <td className="py-3 px-4 text-[#39FF14] font-medium">{payment.valor}</td>
                  <td className="py-3 px-4">{payment.data}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'Pago' ? 'bg-green-900/30 text-green-400' :
                      payment.status === 'Pendente' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-red-900/30 text-red-400'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
