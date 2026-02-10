import type { NodeEnv } from '@api/core/config/runtime-config'

type LogLevel = 'info' | 'warn' | 'error'

export type LogContext = Record<string, unknown>

export type Logger = {
  info: (message: string, context?: LogContext) => void
  warn: (message: string, context?: LogContext) => void
  error: (message: string, context?: LogContext) => void
}

type CreateLoggerOptions = {
  service: string
  nodeEnv: NodeEnv
}

const logWithLevel = (
  level: LogLevel,
  service: string,
  nodeEnv: NodeEnv,
  message: string,
  context?: LogContext,
) => {
  const basePayload = {
    timestamp: new Date().toISOString(),
    level,
    service,
    nodeEnv,
    message,
  }
  const payload = context ? { ...basePayload, ...context } : basePayload

  if (level === 'error') {
    console.error(JSON.stringify(payload))
    return
  }

  if (level === 'warn') {
    console.warn(JSON.stringify(payload))
    return
  }

  console.info(JSON.stringify(payload))
}

export const createLogger = (options: CreateLoggerOptions): Logger => ({
  info: (message, context) =>
    logWithLevel('info', options.service, options.nodeEnv, message, context),
  warn: (message, context) =>
    logWithLevel('warn', options.service, options.nodeEnv, message, context),
  error: (message, context) =>
    logWithLevel('error', options.service, options.nodeEnv, message, context),
})
