type ApiMode = 'mock' | 'hybrid' | 'real';

const mode = import.meta.env.VITE_API_MODE as string | undefined;

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  apiMode: (['mock', 'hybrid', 'real'].includes(mode ?? '') ? mode : 'mock') as ApiMode,
} as const;
