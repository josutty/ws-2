import { setupWorker } from 'msw/browser';
import { env } from '@shared/config';
import { allHandlers, mockOnlyHandlers } from './handlers';

export const worker = setupWorker(...(env.apiMode === 'mock' ? allHandlers : mockOnlyHandlers));
