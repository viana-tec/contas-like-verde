
import React from 'react';
import { Layout } from '../components/Layout';
import { MovimentacoesPagarme } from '../components/MovimentacoesPagarme/index';
import { ErrorBoundary } from '../components/MovimentacoesPagarme/ErrorBoundary';

const MovimentacoesPagarmePage = () => {
  return (
    <Layout>
      <ErrorBoundary>
        <MovimentacoesPagarme />
      </ErrorBoundary>
    </Layout>
  );
};

export default MovimentacoesPagarmePage;
