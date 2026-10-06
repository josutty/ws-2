import { setupServer } from 'msw/node';
import { allHandlers } from './handlers';

// test/setup.ts must call server.listen({ onUnhandledRequest: 'error' }) so unmocked requests fail tests.
export const server = setupServer(...allHandlers);
