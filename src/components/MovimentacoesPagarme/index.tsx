
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { ApiConfiguration } from './ApiConfiguration';
import { ConnectionStatus } from './ConnectionStatus';
import { FinancialIndicators } from './FinancialIndicators';
import { FilterPanel } from './FilterPanel';
import { ChartsSection } from './ChartsSection';
import { OperationsTable } from './OperationsTable';
import { EmptyState } from './EmptyState';
import { BalanceCards } from './BalanceCards';
import { ApiDiagnostics } from './ApiDiagnostics';
import { usePagarmeApi } from './hooks/usePagarmeApi';

export const MovimentacoesPagarme = () => {
  const {
    // Estado
    apiKey,
    operations,
    
    availableBalance,
    pendingBalance,
    loading,
    connectionStatus,
    errorDetails,
    filtersExpanded,
    filters,
    financialIndicators,
    hasData,
    progressInfo,
    
    // Ações
    setApiKey,
    setFiltersExpanded,
    setFilters,
    clearFilters,
    saveApiKey,
    testConnection,
    loadDemoData,
    fetchData,
    loadSavedData
  } = usePagarmeApi();

  // Carregar dados salvos na inicialização
  React.useEffect(() => {
    if (!apiKey && !hasData) {
      loadSavedData();
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Movimentações Pagar.me</h1>
        
        <ApiConfiguration
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          onSaveApiKey={saveApiKey}
          onTestConnection={testConnection}
          onLoadDemo={loadDemoData}
          connectionStatus={connectionStatus}
        />
      </div>

      <ConnectionStatus
        status={connectionStatus}
        errorDetails={errorDetails}
        loading={loading}
        onRefresh={fetchData}
        progressInfo={progressInfo}
      />

      <ApiDiagnostics
        apiKey={apiKey}
        totalOperations={operations.length}
        totalTransactions={0}
      />

      {!apiKey && (
        <Card className="bg-yellow-900/20 border-yellow-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertCircle size={20} />
              <div>
                <p className="font-medium">⚠️ Chave API não configurada</p>
                <p className="text-sm mt-1">
                  Configure sua chave da API Pagar.me para dados reais, 
                  ou clique em "Demo" para dados de exemplo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(connectionStatus === 'connected' || hasData) && (
        <>
          <BalanceCards 
            availableBalance={availableBalance}
            pendingBalance={pendingBalance}
            isLoading={loading}
          />
          
          <FinancialIndicators indicators={financialIndicators} isLoading={loading} />
          
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
            isExpanded={filtersExpanded}
            onToggleExpanded={() => setFiltersExpanded(!filtersExpanded)}
          />
          
          <ChartsSection operations={operations} />
          <OperationsTable operations={operations} />
        </>
      )}

      {!hasData && connectionStatus !== 'connecting' && connectionStatus !== 'connected' && (
        <EmptyState onLoadDemo={loadDemoData} />
      )}
    </div>
  );
};
