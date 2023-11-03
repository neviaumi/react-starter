import '../../src/index.css';

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import type { PropsWithChildren } from 'react';

import { testGraphqlUrl } from './graphql-test-utils.ts';

const cache = new InMemoryCache();

function TestBed(props: PropsWithChildren) {
  const client = new ApolloClient({
    cache,
    uri: testGraphqlUrl,
  });
  return (
    <main>
      <h1 className="tw-mb-1 tw-block tw-border-b-2 tw-border-warning tw-bg-warning tw-text-center tw-text-9xl tw-font-bold tw-text-warning hover:tw-border-warning-hover hover:tw-bg-warning-hover hover:tw-text-warning-hover">
        TestBed
      </h1>
      <ApolloProvider client={client}>{props.children}</ApolloProvider>
    </main>
  );
}

export default TestBed;
