
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, FileText, Calendar, AlertTriangle } from 'lucide-react';

export const Dashboard = () => {
  const stats = [
    {
      title: 'Receita Total',
      value: 'R$ 45.231,89',
      change: '+20.1%',
      icon: DollarSign,
      trend: 'up'
    },
    {
      title: 'Funcionários CLT',
      value: '12',
      change: '+2',
      icon: Users,
      trend: 'up'
    },
    {
      title: 'Contas a Pagar',
      value: 'R$ 8.450,00',
      change: '-5.2%',
      icon: FileText,
      trend: 'down'
    },
    {
      title: 'Prestadores',
      value: '6',
      change: '+1',
      icon: TrendingUp,
      trend: 'up'
    }
  ];

  const recentPayments = [
    { name: 'João Silva', amount: 'R$ 3.500,00', type: 'Salário CLT', date: '15/01/2024' },
    { name: 'Maria Santos', amount: 'R$ 2.800,00', type: 'Prestação Serviço', date: '14/01/2024' },
    { name: 'Pedro Costa', amount: 'R$ 4.200,00', type: 'Salário CLT', date: '13/01/2024' }
  ];

  const upcomingPayments = [
    { name: 'Ana Lima', amount: 'R$ 3.200,00', type: 'Salário CLT', date: '30/01/2024' },
    { name: 'Carlos Oliveira', amount: 'R$ 1.800,00', type: 'Prestação Serviço', date: '31/01/2024' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-100 p-6">
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
          Sistema Financeiro
        </h1>
        <p className="text-gray-600 mt-2">Painel de Controle Executivo</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gradient-to-br from-white to-green-50/30 border border-green-100/50 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">{stat.title}</CardTitle>
              <div className="p-2 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-lg">
                <stat.icon className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-900 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                {stat.change}
                <span className="ml-1 text-gray-500">vs. mês anterior</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card className="bg-gradient-to-br from-white via-green-50/20 to-white border border-green-100/50 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              Pagamentos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50/50 to-transparent rounded-lg border border-green-100/30">
                  <div>
                    <p className="font-medium text-gray-900">{payment.name}</p>
                    <p className="text-sm text-gray-600">{payment.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-700">{payment.amount}</p>
                    <p className="text-sm text-gray-500">{payment.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card className="bg-gradient-to-br from-white via-green-50/20 to-white border border-green-100/50 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <AlertTriangle className="h-5 w-5 mr-2 text-green-600" />
              Próximos Pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50/50 to-transparent rounded-lg border border-green-100/30">
                  <div>
                    <p className="font-medium text-gray-900">{payment.name}</p>
                    <p className="text-sm text-gray-600">{payment.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-700">{payment.amount}</p>
                    <p className="text-sm text-gray-500">{payment.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
