
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, Save, TestTube, Sparkles } from 'lucide-react';
import { ConnectionStatus } from './types';

interface ApiConfigurationProps {
  apiKey: string;
  onApiKeyChange: (value: string) => void;
  onSaveApiKey: () => void;
  onTestConnection: () => void;
  onLoadDemo: () => void;
  connectionStatus: ConnectionStatus;
}

export const ApiConfiguration: React.FC<ApiConfigurationProps> = ({
  apiKey,
  onApiKeyChange,
  onSaveApiKey,
  onTestConnection,
  onLoadDemo,
  connectionStatus
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <Input
        placeholder="Chave da API Pagar.me (sk_...)"
        type="password"
        value={apiKey}
        onChange={(e) => onApiKeyChange(e.target.value)}
        className="bg-gray-800 border-gray-700 text-white w-full sm:w-64"
      />
      <Button 
        onClick={onSaveApiKey} 
        className="bg-[#39FF14] text-black hover:bg-[#32E012]"
        disabled={connectionStatus === 'connecting'}
      >
        <Save size={16} className="mr-2" />
        Salvar
      </Button>
      <Button 
        onClick={onTestConnection} 
        disabled={!apiKey || connectionStatus === 'connecting'}
        className="bg-blue-600 text-white hover:bg-blue-700"
      >
        {connectionStatus === 'connecting' ? (
          <RefreshCw size={16} className="animate-spin mr-2" />
        ) : (
          <TestTube size={16} className="mr-2" />
        )}
        Testar
      </Button>
      <Button 
        onClick={onLoadDemo} 
        disabled={connectionStatus === 'connecting'}
        className="bg-purple-600 text-white hover:bg-purple-700"
        size="sm"
      >
        <Sparkles size={16} className="mr-2" />
        Demo
      </Button>
    </div>
  );
};
