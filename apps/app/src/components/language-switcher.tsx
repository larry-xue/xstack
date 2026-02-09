import { useTranslation } from 'react-i18next'

const LanguageSwitcher = ({ className = '' }: { className?: string }) => {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.resolvedLanguage?.startsWith('zh') ? 'zh-CN' : 'en'

  return (
    <label className={`inline-flex items-center gap-2 text-xs text-slate-600 ${className}`}>
      <span className="font-semibold">{t('common.language')}</span>
      <select
        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
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
