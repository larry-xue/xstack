import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import zhCN from './locales/zh-CN'

const SUPPORTED_LANGUAGES = ['en', 'zh-CN'] as const
const LANGUAGE_STORAGE_KEY = 'lang'

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

const normalizeLanguage = (value: string | null | undefined): SupportedLanguage => {
  if (!value) {
    return 'en'
  }

  const lowered = value.toLowerCase()
  if (lowered.startsWith('zh')) {
    return 'zh-CN'
  }
  return 'en'
}

const detectInitialLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (stored) {
    return normalizeLanguage(stored)
  }

  return normalizeLanguage(window.navigator.language)
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: {
        translation: en,
      },
      'zh-CN': {
        translation: zhCN,
      },
    },
    lng: detectInitialLanguage(),
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false,
    },
  })
}

if (typeof window !== 'undefined') {
  const appWindow = window as Window & { __xstackI18nSyncBound?: boolean }

  const syncLanguageState = (lng: string) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lng)
    document.documentElement.lang = lng
  }

  syncLanguageState(i18n.language)
  if (!appWindow.__xstackI18nSyncBound) {
    i18n.on('languageChanged', syncLanguageState)
    appWindow.__xstackI18nSyncBound = true
  }
}

export default i18n
