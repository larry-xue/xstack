import { expect, test, type Page } from '@playwright/test'

type Credentials = {
  email: string
  password: string
}

const createCredentials = (): Credentials => {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    email: `playwright-${nonce}@example.com`,
    password: 'Playwright123!',
  }
}

const signUp = async (page: Page, credentials: Credentials) => {
  await page.goto('/auth')
  await page.getByRole('radio', { name: 'Sign up' }).click()
  await page.getByLabel('Email address').fill(credentials.email)
  await page.getByLabel('Password').fill(credentials.password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL(/\/app\/todos$/)
}

const login = async (page: Page, credentials: Credentials) => {
  await page.goto('/auth')
  await page.getByLabel('Email address').fill(credentials.email)
  await page.getByLabel('Password').fill(credentials.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/app\/todos$/)
}

const openAccountMenu = async (page: Page) => {
  const trigger = page.getByTestId('sidebar-account-trigger')
  await expect(trigger).toBeVisible()
  await trigger.click()
  await expect(page.getByTestId('sidebar-account-menu')).toBeVisible()
}

const signOutFromAccountMenu = async (page: Page) => {
  await openAccountMenu(page)
  await page.getByRole('menuitem', { name: 'Sign out' }).click()
}

test.describe('auth and todos', () => {
  test('supports sign up and sign in', async ({ page }) => {
    const credentials = createCredentials()

    await signUp(page, credentials)
    await signOutFromAccountMenu(page)
    await expect(page).toHaveURL(/\/auth$/)

    await login(page, credentials)
    await openAccountMenu(page)
    await expect(page.getByRole('menuitem', { name: 'Sign out' })).toBeVisible()
  })

  test('supports todo create, toggle, edit and delete', async ({ page }) => {
    const credentials = createCredentials()
    const initialTitle = `todo-${Date.now()}`
    const updatedTitle = `${initialTitle}-updated`

    await signUp(page, credentials)

    const input = page.getByPlaceholder('Add a new task')
    await input.fill(initialTitle)
    await page.getByRole('button', { name: 'Add todo' }).click()

    const item = page.locator('li', { hasText: initialTitle })
    await expect(item).toBeVisible()

    await item.getByRole('button', { name: 'Mark as done' }).click()
    await expect(item.getByRole('button', { name: 'Mark as not done' })).toBeVisible()

    await item.getByRole('button', { name: 'Edit' }).click()
    await item.getByRole('textbox').fill(updatedTitle)
    await item.getByRole('button', { name: 'Save' }).click()
    await expect(page.locator('li', { hasText: updatedTitle })).toBeVisible()

    const updatedItem = page.locator('li', { hasText: updatedTitle })
    await updatedItem.getByRole('button', { name: 'Delete' }).click()
    await expect(updatedItem).toHaveCount(0)
  })

  test('keeps selected theme after authentication', async ({ page }) => {
    const credentials = createCredentials()

    await page.goto('/auth')

    const themeSwitch = page.getByRole('switch', { name: 'Theme' })
    await expect(themeSwitch).toBeVisible()
    const startedDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    )
    await themeSwitch.click()

    const expectedTheme = startedDark ? 'light' : 'dark'
    const expectedDark = !startedDark

    await signUp(page, credentials)

    await expect
      .poll(async () =>
        page.evaluate(() => document.documentElement.classList.contains('dark')),
      )
      .toBe(expectedDark)
    await expect
      .poll(async () => page.evaluate(() => window.localStorage.getItem('theme')))
      .toBe(expectedTheme)
  })

  test('renders full-bleed app shell and sidebar footer controls', async ({ page }) => {
    const credentials = createCredentials()
    await signUp(page, credentials)

    const shell = page.getByTestId('app-shell-root')
    await expect(shell).toBeVisible()
    await openAccountMenu(page)
    await expect(page.getByRole('menuitem', { name: 'Theme' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Language' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Sign out' })).toBeVisible()

    const viewport = page.viewportSize()
    if (!viewport) {
      throw new Error('Viewport size is unavailable')
    }

    const rect = await shell.evaluate((node) => {
      const { x, y, width, height } = node.getBoundingClientRect()
      return { x, y, width, height }
    })

    expect(rect.x).toBe(0)
    expect(rect.y).toBe(0)
    expect(Math.abs(rect.width - viewport.width)).toBeLessThanOrEqual(1)
    expect(Math.abs(rect.height - viewport.height)).toBeLessThanOrEqual(1)
  })

  test('keeps mobile sidebar drawer interaction', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })

    const credentials = createCredentials()
    await signUp(page, credentials)

    const openNavButton = page.getByRole('button', { name: 'Open navigation' })
    await expect(openNavButton).toBeVisible()
    await openNavButton.click()

    await expect(page.getByRole('link', { name: 'Todos' })).toBeVisible()
  })
})
