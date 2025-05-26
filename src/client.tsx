/// <reference types="vinxi/types/client" />
import { hydrateRoot } from 'react-dom/client';
import { StartClient } from '@tanstack/react-start';
import { createRouter } from './router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const router = createRouter();
const queryClient = new QueryClient();

hydrateRoot(
  document,
  <QueryClientProvider client={queryClient}>
    <StartClient router={router} />
  </QueryClientProvider>,
);
