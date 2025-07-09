
import React from 'react';
import { Card } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle }) => (
  <Card className="p-4 bg-gray-900 border-gray-800">
    <div className="text-center">
      <div className="text-2xl font-bold text-[#39FF14]">{value}</div>
      <div className="text-sm text-gray-400">{subtitle}</div>
    </div>
  </Card>
);

interface FolhaSalarialStatsProps {
  employeeCount: number;
  providerCount: number;
  totalEmployeePayroll: number;
  totalProviderPayroll: number;
  activeTab: string;
  formatCurrency: (value: number) => string;
}

export const FolhaSalarialStats: React.FC<FolhaSalarialStatsProps> = ({
  employeeCount,
  providerCount,
  totalEmployeePayroll,
  totalProviderPayroll,
  activeTab,
  formatCurrency,
}) => {
  if (activeTab === 'clt') {
    return (
      <>
        <StatsCard title="Total CLT" value={employeeCount} subtitle="Total CLT" />
        <StatsCard 
          title="Folha CLT" 
          value={formatCurrency(totalEmployeePayroll)} 
          subtitle="Folha CLT" 
        />
      </>
    );
  }

  return (
    <>
      <StatsCard 
        title="Total Prestadores" 
        value={providerCount} 
        subtitle="Total Prestadores" 
      />
      <StatsCard 
        title="Folha Prestadores" 
        value={formatCurrency(totalProviderPayroll)} 
        subtitle="Folha Prestadores" 
      />
    </>
  );
};
