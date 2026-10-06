type LogMeta = Record<string, unknown>;

function write(level: 'debug' | 'info' | 'warn' | 'error', message: string, meta?: LogMeta) {
  console[level](message, meta ?? '');
}

export const logger = {
  debug: (message: string, meta?: LogMeta) => { if (!import.meta.env.PROD) write('debug', message, meta); },
  info: (message: string, meta?: LogMeta) => { if (!import.meta.env.PROD) write('info', message, meta); },
  warn: (message: string, meta?: LogMeta) => write('warn', message, meta),
  error: (message: string, meta?: LogMeta) => write('error', message, meta),
};
