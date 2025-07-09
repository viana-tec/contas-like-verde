
/**
 * Interface para configurar e executar a coleta de dados
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Download, Play, TestTube, Trash2 } from 'lucide-react';
import { usePagarmeCollector } from './hooks/usePagarmeCollector';
import { useToast } from '@/hooks/use-toast';

export const CollectorInterface = () => {
  const [token, setToken] = useState(localStorage.getItem('pagarme_token') || '');
  const [endpoint, setEndpoint] = useState<'orders' | 'payments' | 'transactions'>('orders');
  const [pageSize, setPageSize] = useState(100);
  const [maxPages, setMaxPages] = useState(1000);
  
  const { loading, progress, result, coletarDados, testarConexao, limparResultados } = usePagarmeCollector();
  const { toast } = useToast();

  const handleSaveToken = () => {
    localStorage.setItem('pagarme_token', token);
    toast({
      title: "Token salvo",
      description: "Token de acesso foi salvo com sucesso",
    });
  };

  const handleTestConnection = async () => {
    if (!token) {
      toast({
        title: "Token obrigatório",
        description: "Digite seu token de acesso da Pagar.me",
        variant: "destructive",
      });
      return;
    }

    try {
      const testResult = await testarConexao(token);
      
      if (testResult.success) {
        toast({
          title: "Conexão estabelecida",
          description: "Token válido e API acessível",
        });
      } else {
        toast({
          title: "Erro na conexão",
          description: testResult.error || "Falha ao conectar com a API",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível testar a conexão",
        variant: "destructive",
      });
    }
  };

  const handleStartCollection = async () => {
    if (!token) {
      toast({
        title: "Token obrigatório",
        description: "Digite seu token de acesso da Pagar.me",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await coletarDados(endpoint, token, { pageSize, maxPages });
      
      if (result.success) {
        toast({
          title: "Coleta finalizada",
          description: `${result.totalResults} registros coletados com sucesso`,
        });
      } else {
        toast({
          title: "Erro na coleta",
          description: result.error || "Falha durante a coleta",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na coleta",
        description: "Falha ao executar a coleta de dados",
        variant: "destructive",
      });
    }
  };

  const handleDownloadResults = () => {
    if (!result?.data) return;
    
    const dataStr = JSON.stringify(result.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pagarme_${result.endpoint}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const progressPercentage = progress ? Math.min((progress.currentPage / 10) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Coletor de Dados Pagar.me v5
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuração do Token */}
          <div className="space-y-2">
            <Label htmlFor="token">Token de Acesso</Label>
            <div className="flex gap-2">
              <Input
                id="token"
                type="password"
                placeholder="Seu token da API v5 Pagar.me"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSaveToken} variant="outline">
                Salvar
              </Button>
              <Button onClick={handleTestConnection} variant="outline">
                <TestTube className="w-4 h-4 mr-1" />
                Testar
              </Button>
            </div>
          </div>

          {/* Configuração da Coleta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint</Label>
              <Select value={endpoint} onValueChange={(value: any) => setEndpoint(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orders">Orders (Pedidos)</SelectItem>
                  <SelectItem value="payments">Payments (Pagamentos)</SelectItem>
                  <SelectItem value="transactions">Transactions (Transações)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pageSize">Tamanho da Página</Label>
              <Input
                id="pageSize"
                type="number"
                value={pageSize}
                onChange={(e) => setPageSize(Math.min(100, Math.max(1, parseInt(e.target.value) || 100)))}
                min="1"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPages">Máximo de Páginas</Label>
              <Input
                id="maxPages"
                type="number"
                value={maxPages}
                onChange={(e) => setMaxPages(Math.max(1, parseInt(e.target.value) || 1000))}
                min="1"
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2">
            <Button 
              onClick={handleStartCollection} 
              disabled={loading || !token}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-2" />
              {loading ? 'Coletando...' : 'Iniciar Coleta'}
            </Button>
            
            {result && (
              <>
                <Button onClick={handleDownloadResults} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download JSON
                </Button>
                <Button onClick={limparResultados} variant="outline">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progresso da Coleta */}
      {loading && progress && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Página {progress.currentPage}</span>
                <span>{progress.totalCollected} registros coletados</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
              <p className="text-sm text-muted-foreground">{progress.info}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado da Coleta */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Resultados da Coleta
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? "Sucesso" : "Erro"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Endpoint</p>
                  <p className="font-medium">{result.endpoint}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Registros</p>
                  <p className="font-medium">{result.totalResults}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Páginas Processadas</p>
                  <p className="font-medium">{result.totalPages}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="default">Completo</Badge>
                </div>
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
