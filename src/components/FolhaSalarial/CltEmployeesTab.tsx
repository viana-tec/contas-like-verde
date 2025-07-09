import React from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PixKeyCell } from './PixKeyCell';
import type { Tables } from '@/integrations/supabase/types';
interface CltEmployeesTabProps {
  employees: Tables<'clt_employees'>[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleOpenEmployeeModal: (employee?: Tables<'clt_employees'>) => void;
  handleDeleteEmployee: (id: string) => void;
  formatCurrency: (value: number) => string;
  filteredEmployees: Tables<'clt_employees'>[];
}
export const CltEmployeesTab: React.FC<CltEmployeesTabProps> = ({
  employees,
  searchTerm,
  setSearchTerm,
  handleOpenEmployeeModal,
  handleDeleteEmployee,
  formatCurrency,
  filteredEmployees
}) => {
  return <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenEmployeeModal()} className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90">
          <Plus className="h-4 w-4 mr-2" />
          Novo Funcionário CLT
        </Button>
      </div>

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
            {filteredEmployees.map(employee => {
            const liquidValue = employee.base_salary - (employee.salary_advance || 0) - (employee.discounts || 0) + (employee.bonuses || 0);
            return <TableRow key={employee.id}>
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
                  <TableCell className="font-bold text-slate-50">
                    {employee.pix_key && <PixKeyCell pixKey={employee.pix_key} />}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => handleOpenEmployeeModal(employee)} className="text-slate-50">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteEmployee(employee.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>;
          })}
          </TableBody>
        </Table>
      </Card>
    </div>;
};