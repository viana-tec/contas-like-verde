
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Filter, X, Search } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { FilterOptions } from './types';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const paymentMethodOptions = [
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'pix', label: 'PIX' },
  { value: 'boleto', label: 'Boleto' }
];

const statusOptions = [
  { value: 'paid', label: 'Pago' },
  { value: 'processing', label: 'Processando' },
  { value: 'pending', label: 'Pendente' },
  { value: 'refused', label: 'Recusado' },
  { value: 'refunded', label: 'Estornado' },
  { value: 'waiting_funds', label: 'Aguardando Fundos' },
  { value: 'transferred', label: 'Transferido' },
  { value: 'available', label: 'Disponível' }
];

const acquirerOptions = [
  { value: 'stone', label: 'Stone' },
  { value: 'cielo', label: 'Cielo' },
  { value: 'rede', label: 'Rede' },
  { value: 'bin', label: 'BIN' },
  { value: 'getnet', label: 'Getnet' }
];

const cardBrandOptions = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'amex', label: 'American Express' },
  { value: 'elo', label: 'Elo' },
  { value: 'hipercard', label: 'Hipercard' }
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  isExpanded,
  onToggleExpanded
}) => {
  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    const newMethods = checked
      ? [...filters.paymentMethods, method]
      : filters.paymentMethods.filter(m => m !== method);
    
    onFiltersChange({
      ...filters,
      paymentMethods: newMethods
    });
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatuses = checked
      ? [...filters.statuses, status]
      : filters.statuses.filter(s => s !== status);
    
    onFiltersChange({
      ...filters,
      statuses: newStatuses
    });
  };

  const hasActiveFilters = 
    filters.searchTerm ||
    filters.paymentMethods.length > 0 ||
    filters.statuses.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end ||
    filters.amountRange.min !== null ||
    filters.amountRange.max !== null ||
    filters.acquirer ||
    filters.cardBrand;

  return (
    <Card className="bg-[#1a1a1a] border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Filter size={20} />
            Filtros de Pesquisa
            {hasActiveFilters && (
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                {[
                  filters.searchTerm && 'Busca',
                  filters.paymentMethods.length > 0 && `${filters.paymentMethods.length} Métodos`,
                  filters.statuses.length > 0 && `${filters.statuses.length} Status`,
                  (filters.dateRange.start || filters.dateRange.end) && 'Data',
                  (filters.amountRange.min !== null || filters.amountRange.max !== null) && 'Valor',
                  filters.acquirer && 'Adquirente',
                  filters.cardBrand && 'Bandeira'
                ].filter(Boolean).join(', ')}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="text-gray-300 border-gray-600 hover:bg-gray-700"
              >
                <X size={16} className="mr-1" />
                Limpar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleExpanded}
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              {isExpanded ? 'Recolher' : 'Expandir'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Busca por termo */}
          <div className="space-y-2">
            <Label className="text-gray-300">Buscar por ID, código, cliente</Label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Digite para buscar..."
                value={filters.searchTerm}
                onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
                className="pl-10 bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Período */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Data Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-gray-800 border-gray-600 text-white",
                      !filters.dateRange.start && "text-gray-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.start 
                      ? format(filters.dateRange.start, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecionar data"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.start || undefined}
                    onSelect={(date) => onFiltersChange({
                      ...filters,
                      dateRange: { ...filters.dateRange, start: date || null }
                    })}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Data Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-gray-800 border-gray-600 text-white",
                      !filters.dateRange.end && "text-gray-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.end 
                      ? format(filters.dateRange.end, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecionar data"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.end || undefined}
                    onSelect={(date) => onFiltersChange({
                      ...filters,
                      dateRange: { ...filters.dateRange, end: date || null }
                    })}
                    disabled={(date) => 
                      date > new Date() || 
                      (filters.dateRange.start && date < filters.dateRange.start)
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Faixa de valor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Valor Mínimo (R$)</Label>
              <Input
                type="number"
                placeholder="0,00"
                value={filters.amountRange.min || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  amountRange: { 
                    ...filters.amountRange, 
                    min: e.target.value ? parseFloat(e.target.value) : null 
                  }
                })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Valor Máximo (R$)</Label>
              <Input
                type="number"
                placeholder="0,00"
                value={filters.amountRange.max || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  amountRange: { 
                    ...filters.amountRange, 
                    max: e.target.value ? parseFloat(e.target.value) : null 
                  }
                })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Métodos de pagamento */}
          <div className="space-y-2">
            <Label className="text-gray-300">Métodos de Pagamento</Label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethodOptions.map((method) => (
                <div key={method.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`payment-${method.value}`}
                    checked={filters.paymentMethods.includes(method.value)}
                    onCheckedChange={(checked) => 
                      handlePaymentMethodChange(method.value, checked === true)
                    }
                  />
                  <Label 
                    htmlFor={`payment-${method.value}`}
                    className="text-gray-300 text-sm"
                  >
                    {method.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-gray-300">Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status.value}`}
                    checked={filters.statuses.includes(status.value)}
                    onCheckedChange={(checked) => 
                      handleStatusChange(status.value, checked === true)
                    }
                  />
                  <Label 
                    htmlFor={`status-${status.value}`}
                    className="text-gray-300 text-sm"
                  >
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Adquirente e Bandeira */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Adquirente</Label>
              <Select
                value={filters.acquirer || ""}
                onValueChange={(value) => onFiltersChange({ ...filters, acquirer: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Todos os adquirentes" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="">Todos os adquirentes</SelectItem>
                  {acquirerOptions.map((acquirer) => (
                    <SelectItem key={acquirer.value} value={acquirer.value}>
                      {acquirer.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Bandeira do Cartão</Label>
              <Select
                value={filters.cardBrand || ""}
                onValueChange={(value) => onFiltersChange({ ...filters, cardBrand: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Todas as bandeiras" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="">Todas as bandeiras</SelectItem>
                  {cardBrandOptions.map((brand) => (
                    <SelectItem key={brand.value} value={brand.value}>
                      {brand.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
