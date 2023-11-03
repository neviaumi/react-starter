import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import type { PropsWithChildren } from 'react';

import GameLibraryPage from './GameLibraryPage/GameLibraryPage.tsx';
import Layout from './Layout/Layout.tsx';

const cache = new InMemoryCache();

function ApolloClientProvider({ children }: PropsWithChildren<unknown>) {
  const uri = `${import.meta.env['WEB_BACKEND_HOST']}/graphql`;
  const client = new ApolloClient({
    cache,
    uri: uri,
  });
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

function App() {
  return (
    <ApolloClientProvider>
      <Layout>
        <GameLibraryPage />
      </Layout>
    </ApolloClientProvider>
  );
}

export default App;
