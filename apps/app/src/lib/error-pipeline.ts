import { ApiErrorCodeEnum, isApiClientError } from '@repo/api-client'
import { notifications } from '@mantine/notifications'
import i18n from '../i18n'
import { router } from '../router'
import { supabase } from './supabase'

export type ErrorPipelineOptions = {
  fallbackI18nKey?: string
  suppressGlobalToast?: boolean
}

type UiError = {
  toastTitle: string
  toastMessage: string
  isUnauthorized: boolean
  fingerprint: string
}

type RecordLike = Record<string, unknown>

const TOAST_DEDUP_WINDOW_MS = 2_000
const recentToastByFingerprint = new Map<string, number>()
let unauthorizedFlow: Promise<void> | null = null

const ERROR_CODE_TO_I18N_KEY: Record<string, string> = {
  [ApiErrorCodeEnum.AUTH_MISSING_TOKEN]: 'errors.codes.AUTH_MISSING_TOKEN',
  [ApiErrorCodeEnum.AUTH_INVALID_TOKEN]: 'errors.codes.AUTH_INVALID_TOKEN',
  [ApiErrorCodeEnum.TASK_NOT_FOUND]: 'errors.codes.TASK_NOT_FOUND',
  [ApiErrorCodeEnum.VALIDATION_ERROR]: 'errors.codes.VALIDATION_ERROR',
  [ApiErrorCodeEnum.PARSE_ERROR]: 'errors.codes.PARSE_ERROR',
  [ApiErrorCodeEnum.ROUTE_NOT_FOUND]: 'errors.codes.ROUTE_NOT_FOUND',
  [ApiErrorCodeEnum.DATABASE_UNAVAILABLE]: 'errors.codes.DATABASE_UNAVAILABLE',
  [ApiErrorCodeEnum.DATABASE_ERROR]: 'errors.codes.DATABASE_ERROR',
  [ApiErrorCodeEnum.INTERNAL_ERROR]: 'errors.codes.INTERNAL_ERROR',
}

const asRecordLike = (value: unknown): RecordLike | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  return value as RecordLike
}

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null

const asNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const translate = (key: string, fallback: string) => {
  if (!i18n.exists(key)) {
    return fallback
  }

  const translated = i18n.t(key)
  return typeof translated === 'string' ? translated : fallback
}

const resolveFallbackMessage = (options: ErrorPipelineOptions) => {
  if (!options.fallbackI18nKey) {
    return null
  }

  if (!i18n.exists(options.fallbackI18nKey)) {
    return null
  }

  const translated = i18n.t(options.fallbackI18nKey)
  return typeof translated === 'string' && translated.length > 0 ? translated : null
}

const isNetworkMessage = (message: string | null) => {
  if (!message) {
    return false
  }

  const normalized = message.toLowerCase()
  return (
    normalized.includes('failed to fetch') ||
    normalized.includes('networkerror') ||
    normalized.includes('network request failed') ||
    normalized.includes('fetch failed')
  )
}

const getGenericErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return asString(error.message)
  }

  const errorLike = asRecordLike(error)
  return asString(errorLike?.message)
}

const toUiError = (error: unknown, options: ErrorPipelineOptions): UiError => {
  const toastTitle = translate('errors.title', 'Request failed')
  const fallbackMessage = resolveFallbackMessage(options)

  if (isApiClientError(error)) {
    const mappedKey = error.code ? ERROR_CODE_TO_I18N_KEY[error.code] : undefined
    const mappedMessage =
      mappedKey && i18n.exists(mappedKey) ? translate(mappedKey, '') || null : null
    const isUnauthorized =
      error.status === 401 ||
      error.code === ApiErrorCodeEnum.AUTH_INVALID_TOKEN ||
      error.code === ApiErrorCodeEnum.AUTH_MISSING_TOKEN
    const toastMessage = isUnauthorized
      ? translate('errors.sessionExpired', 'Your session has expired. Please sign in again.')
      : (mappedMessage ??
        fallbackMessage ??
        asString(error.message) ??
        (isNetworkMessage(error.message) ? translate('errors.network', 'Network error') : null) ??
        translate('errors.unknown', 'Something went wrong. Please try again.'))
    const fingerprint = [
      'api',
      error.code ?? 'unknown-code',
      error.status ?? 'unknown-status',
      error.requestId ?? 'unknown-request',
      toastMessage,
    ].join('|')

    return {
      toastTitle,
      toastMessage,
      isUnauthorized,
      fingerprint,
    }
  }

  const errorLike = asRecordLike(error)
  const status = asNumber(errorLike?.status)
  const code = asString(errorLike?.code)
  const message = getGenericErrorMessage(error)
  const isUnauthorized =
    status === 401 || code === ApiErrorCodeEnum.AUTH_INVALID_TOKEN || code === 'invalid_token'
  const toastMessage = isUnauthorized
    ? translate('errors.sessionExpired', 'Your session has expired. Please sign in again.')
    : (fallbackMessage ??
      message ??
      (isNetworkMessage(message) ? translate('errors.network', 'Network error') : null) ??
      translate('errors.unknown', 'Something went wrong. Please try again.'))
  const fingerprint = [
    'generic',
    status ?? 'unknown-status',
    code ?? 'unknown-code',
    toastMessage,
  ].join('|')

  return {
    toastTitle,
    toastMessage,
    isUnauthorized,
    fingerprint,
  }
}

const shouldSkipToast = (fingerprint: string) => {
  const now = Date.now()

  for (const [key, timestamp] of recentToastByFingerprint.entries()) {
    if (now - timestamp > TOAST_DEDUP_WINDOW_MS) {
      recentToastByFingerprint.delete(key)
    }
  }

  const previous = recentToastByFingerprint.get(fingerprint)
  if (previous && now - previous <= TOAST_DEDUP_WINDOW_MS) {
    return true
  }

  recentToastByFingerprint.set(fingerprint, now)
  return false
}

const showErrorToast = (uiError: UiError) => {
  if (shouldSkipToast(uiError.fingerprint)) {
    return
  }

  notifications.show({
    title: uiError.toastTitle,
    message: uiError.toastMessage,
    color: 'red',
    autoClose: 4_000,
  })
}

const runUnauthorizedFlow = async (uiError: UiError) => {
  if (unauthorizedFlow) {
    return unauthorizedFlow
  }

  unauthorizedFlow = (async () => {
    showErrorToast(uiError)

    try {
      await supabase.auth.signOut()
    } catch {
      // Ignore sign-out failures and continue navigation.
    }

    if (router.state.location.pathname !== '/auth') {
      await router.navigate({ to: '/auth' })
    }
  })().finally(() => {
    unauthorizedFlow = null
  })

  return unauthorizedFlow
}

export const handleUiError = (error: unknown, options: ErrorPipelineOptions = {}) => {
  if (options.suppressGlobalToast) {
    return
  }

  const uiError = toUiError(error, options)
  if (uiError.isUnauthorized) {
    void runUnauthorizedFlow(uiError)
    return
  }

  showErrorToast(uiError)
}
