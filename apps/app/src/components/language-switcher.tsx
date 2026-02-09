import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type LanguageSwitcherProps = {
  className?: string
  showIcon?: boolean
}

const LanguageSwitcher = ({ className = '', showIcon = true }: LanguageSwitcherProps) => {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.resolvedLanguage?.startsWith('zh') ? 'zh-CN' : 'en'

  return (
    <label className={`inline-flex items-center gap-2 text-xs text-muted-foreground ${className}`}>
      {showIcon && <Languages className="size-3.5 text-muted-foreground/80" aria-hidden />}
      <select
        aria-label={t('common.language')}
        title={t('common.language')}
        className="rounded-lg border border-border bg-card px-2 py-1 text-xs font-semibold text-foreground shadow-xs outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/40"
        value={currentLanguage}
        onChange={(event) => {
          i18n.changeLanguage(event.target.value)
        }}
      >
        <option value="en">{t('common.languages.en')}</option>
        <option value="zh-CN">{t('common.languages.zhCN')}</option>
      </select>
    </label>
  )
}

export default LanguageSwitcher
