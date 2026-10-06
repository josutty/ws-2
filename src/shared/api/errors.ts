import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import type { ApiErrorBody } from './generated/models';

export interface ApiError {
  status: number | 'NETWORK' | 'TIMEOUT' | 'PARSE' | 'UNKNOWN';
  code: string;
  message: string;
  retryable: boolean;
  fieldErrors?: ApiErrorBody['fieldErrors'];
}

const isApiErrorBody = (data: unknown): data is ApiErrorBody =>
  typeof data === 'object' && data !== null && 'errorCode' in data && 'message' in data;

export const toApiError = (error: FetchBaseQueryError): ApiError => {
  if (typeof error.status === 'number') {
    if (isApiErrorBody(error.data)) {
      return {
        status: error.status,
        code: error.data.errorCode,
        message: error.data.message,
        retryable: error.data.retryable,
        fieldErrors: error.data.fieldErrors,
      };
    }
    return { status: error.status, code: `HTTP_${error.status}`, message: 'Request failed', retryable: false };
  }
  if (error.status === 'FETCH_ERROR') {
    return { status: 'NETWORK', code: 'NETWORK', message: 'Network error — check your connection', retryable: true };
  }
  if (error.status === 'TIMEOUT_ERROR') return { status: 'TIMEOUT', code: 'TIMEOUT', message: 'The request timed out', retryable: true };
  if (error.status === 'PARSING_ERROR') return { status: 'PARSE', code: 'PARSE', message: 'Unexpected server response', retryable: false };
  return { status: 'UNKNOWN', code: 'UNKNOWN', message: error.error, retryable: false };
};

export const getErrorMessage = (error: ApiError | SerializedError | undefined): string => error?.message ?? 'Something went wrong';
