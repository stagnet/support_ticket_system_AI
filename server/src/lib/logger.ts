type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  info: '\x1b[36m',    // cyan
  warn: '\x1b[33m',    // yellow
  error: '\x1b[31m',   // red
  debug: '\x1b[35m',   // magenta
  key: '\x1b[90m',     // gray
  value: '\x1b[37m',   // white
} as const;

const LEVEL_LABELS: Record<LogLevel, string> = {
  info: `${COLORS.bold}${COLORS.info} INFO ${COLORS.reset}`,
  warn: `${COLORS.bold}${COLORS.warn} WARN ${COLORS.reset}`,
  error: `${COLORS.bold}${COLORS.error} ERR  ${COLORS.reset}`,
  debug: `${COLORS.bold}${COLORS.debug} DBG  ${COLORS.reset}`,
};

function formatContext(context: Record<string, unknown>): string {
  return Object.entries(context)
    .map(([k, v]) => {
      const val = typeof v === 'string' ? v : JSON.stringify(v);
      return `${COLORS.key}${k}=${COLORS.value}${val}${COLORS.reset}`;
    })
    .join(' ');
}

class Logger {
  private format(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): string {
    const time = `${COLORS.dim}${new Date().toLocaleTimeString()}${COLORS.reset}`;
    const label = LEVEL_LABELS[level];
    const ctx = context ? ` ${formatContext(context)}` : '';
    return `${time} ${label} ${message}${ctx}\n`;
  }

  info(message: string, context?: Record<string, unknown>): void {
    process.stdout.write(this.format('info', message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    process.stdout.write(this.format('warn', message, context));
  }

  error(message: string, context?: Record<string, unknown>): void {
    process.stderr.write(this.format('error', message, context));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== 'production') {
      process.stdout.write(this.format('debug', message, context));
    }
  }
}

export const logger = new Logger();
