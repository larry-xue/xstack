import { expect, test } from '@playwright/test'

test.describe('auth entry flow', () => {
  test('redirects unauthenticated users from root to auth', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveURL(/\/auth$/)
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  })

  test('renders the auth form fields', async ({ page }) => {
    await page.goto('/auth')

    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
    await expect(page.getByRole('radio', { name: 'Sign up' })).toBeVisible()
  })

  test('switches language and syncs selection state', async ({ page }) => {
    await page.goto('/auth')

    const languageSelect = page.locator('select').first()
    await expect(languageSelect).toHaveValue('en')

    await languageSelect.selectOption('zh-CN')

    await expect(languageSelect).toHaveValue('zh-CN')
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
    await expect
      .poll(async () => page.evaluate(() => window.localStorage.getItem('lang')))
      .toBe('zh-CN')
  })

  test('toggles theme and persists after reload', async ({ page }) => {
    await page.goto('/auth')

    const themeSwitch = page.getByRole('switch', { name: 'Theme' })
    await expect(themeSwitch).toBeVisible()
    const startedDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    )

    await themeSwitch.click()

    const expectedTheme = startedDark ? 'light' : 'dark'
    const expectedDark = !startedDark

    await expect
      .poll(async () =>
        page.evaluate(() => document.documentElement.classList.contains('dark')),
      )
      .toBe(expectedDark)
    await expect
      .poll(async () => page.evaluate(() => window.localStorage.getItem('theme')))
      .toBe(expectedTheme)

    await page.reload()

    await expect
      .poll(async () =>
        page.evaluate(() => document.documentElement.classList.contains('dark')),
      )
      .toBe(expectedDark)
  })
})
