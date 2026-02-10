import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { handleUiError, type ErrorPipelineOptions } from './error-pipeline'

type ErrorMeta = Pick<ErrorPipelineOptions, 'fallbackI18nKey' | 'suppressGlobalToast'>

const asErrorMeta = (meta: unknown): ErrorMeta => {
  if (!meta || typeof meta !== 'object') {
    return {}
  }

  const raw = meta as Record<string, unknown>
  const fallbackI18nKey =
    typeof raw.fallbackI18nKey === 'string' && raw.fallbackI18nKey.length > 0
      ? raw.fallbackI18nKey
      : undefined
  const suppressGlobalToast = raw.suppressGlobalToast === true

  return {
    fallbackI18nKey,
    suppressGlobalToast,
  }
}

const handleQueryError = (error: unknown, meta: unknown) => {
  const errorMeta = asErrorMeta(meta)
  handleUiError(error, errorMeta)
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      handleQueryError(error, query.meta)
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      void variables
      void context
      handleQueryError(error, mutation.meta)
    },
  }),
})
