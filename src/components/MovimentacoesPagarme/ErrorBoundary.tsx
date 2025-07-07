
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('💥 Erro capturado pelo ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="bg-red-900/20 border-red-600 m-4">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={24} className="text-red-400" />
              <div>
                <h3 className="text-lg font-semibold text-red-400">
                  Erro na aplicação
                </h3>
                <p className="text-red-300 text-sm">
                  Algo deu errado. Tente recarregar a página.
                </p>
              </div>
            </div>
            
            {this.state.error && (
              <div className="mb-4 p-3 bg-red-950/50 rounded border border-red-800">
                <p className="text-red-300 text-sm font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={this.handleRetry}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                <RefreshCw size={16} className="mr-2" />
                Tentar Novamente
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Recarregar Página
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
