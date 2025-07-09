
/**
 * Serviço para armazenar operações Pagar.me no banco de dados
 */

import { supabase } from '@/integrations/supabase/client';
import { BalanceOperation } from '../types';

export const saveOperationsToDatabase = async (operations: BalanceOperation[]): Promise<void> => {
  if (operations.length === 0) {
    console.log('📦 [STORAGE] Nenhuma operação para salvar');
    return;
  }

  console.log(`📦 [STORAGE] Salvando ${operations.length} operações no banco...`);

  try {
    // Mapear operações para o formato do banco de dados
    const operationsData = operations.map(operation => ({
      external_id: operation.id,
      type: operation.type,
      status: operation.status,
      amount: operation.amount,
      fee: operation.fee || 0,
      payment_method: operation.payment_method,
      acquirer_name: operation.acquirer_name,
      authorization_code: operation.authorization_code,
      tid: operation.tid,
      nsu: operation.nsu,
      card_brand: operation.card_brand,
      card_last_four_digits: operation.card_last_four_digits,
      installments: operation.installments || 1,
      description: operation.description,
      created_at: operation.created_at,
      synced_at: new Date().toISOString()
    }));

    // Usar upsert para evitar duplicatas
    const { error } = await supabase
      .from('pagarme_operations')
      .upsert(operationsData, {
        onConflict: 'external_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('❌ [STORAGE] Erro ao salvar operações:', error);
      throw new Error(`Erro ao salvar operações: ${error.message}`);
    }

    console.log(`✅ [STORAGE] ${operations.length} operações salvas com sucesso!`);

  } catch (error: any) {
    console.error('❌ [STORAGE] Erro crítico:', error);
    throw error;
  }
};

export const getStoredOperations = async (): Promise<BalanceOperation[]> => {
  console.log('📦 [STORAGE] Carregando operações do banco...');

  try {
    const { data, error } = await supabase
      .from('pagarme_operations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [STORAGE] Erro ao carregar operações:', error);
      throw new Error(`Erro ao carregar operações: ${error.message}`);
    }

    // Mapear de volta para o formato da aplicação
    const operations: BalanceOperation[] = (data || []).map(op => ({
      id: op.external_id,
      type: op.type,
      status: op.status,
      amount: op.amount,
      fee: op.fee,
      payment_method: op.payment_method,
      acquirer_name: op.acquirer_name,
      authorization_code: op.authorization_code,
      tid: op.tid,
      nsu: op.nsu,
      card_brand: op.card_brand,
      card_last_four_digits: op.card_last_four_digits,
      installments: op.installments,
      description: op.description,
      created_at: op.created_at,
      synced_at: op.synced_at
    }));

    console.log(`✅ [STORAGE] ${operations.length} operações carregadas do banco`);
    return operations;

  } catch (error: any) {
    console.error('❌ [STORAGE] Erro crítico:', error);
    throw error;
  }
};
