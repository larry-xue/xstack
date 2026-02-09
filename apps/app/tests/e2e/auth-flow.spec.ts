import { expect, test } from '@playwright/test'

test.describe('auth entry flow', () => {
  test('redirects unauthenticated users from root to auth', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/auth$/)
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  })

  test('renders the auth form fields', async ({ page }) => {
    await page.goto('/auth')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
    await expect(page.getByText('Sign up')).toBeVisible()
  })

  test('loads persisted language and theme preferences', async ({ page }) => {
    await page.goto('/auth')

    await page.evaluate(() => {
      window.localStorage.setItem('lang', 'zh-CN')
      window.localStorage.setItem('xstack-color-scheme', 'dark')
    })
    await page.reload()

    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
    await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'dark')
    await expect(page).toHaveURL(/\/auth$/)
  })
})
