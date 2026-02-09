import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useTranslation } from 'react-i18next'
import { Switch } from '@/components/ui/switch'

const ThemeToggle = ({ className = '' }: { className?: string }) => {
  const { t } = useTranslation()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <div className={`inline-flex items-center text-xs text-muted-foreground ${className}`}>
      <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/85 px-2 py-1 shadow-xs backdrop-blur">
        <Sun className={`size-3.5 ${isDark ? 'text-muted-foreground/70' : 'text-amber-500'}`} />
        <Switch
          aria-label={t('common.theme')}
          title={t('common.theme')}
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        />
        <Moon className={`size-3.5 ${isDark ? 'text-sky-300' : 'text-muted-foreground/70'}`} />
      </div>
    </div>
  )
}

export default ThemeToggle
