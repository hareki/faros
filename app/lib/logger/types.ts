export type LogLevel = 'error' | 'warn' | 'info';
export type LogSource = 'server-action' | 'error-boundary';
export type LogRuntime = 'server' | 'client';
export type LogContext = Record<string, unknown>;

/** What callers pass to the logger. */
export type LogInput = {
  message: string;
  source: LogSource;
  context?: LogContext;
  // Accepts anything that was thrown; normalized into `NormalizedError`.
  error?: unknown;
};

export type NormalizedError = {
  name: string;
  message: string;
  stack?: string;
};

/** The fully-resolved record that gets formatted and emitted. */
export type LogEntry = {
  level: LogLevel;
  message: string;
  source: LogSource;
  runtime: LogRuntime;
  timestamp: string;
  context?: LogContext;
  error?: NormalizedError;
};

export type Logger = {
  error: (input: LogInput) => void;
  warn: (input: LogInput) => void;
  info: (input: LogInput) => void;
};
