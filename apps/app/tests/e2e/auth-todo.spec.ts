import { expect, test, type Page } from '@playwright/test'

type Credentials = {
  email: string
  password: string
}

const resetAuthState = async (page: Page) => {
  await page.context().clearCookies()
  await page.goto('/auth')
  await page.evaluate(() => {
    window.localStorage.clear()
    window.localStorage.setItem('lang', 'en')
    window.sessionStorage.clear()
  })
  await page.reload()
}

const createCredentials = (): Credentials => {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    email: `playwright-${nonce}@example.com`,
    password: 'Playwright123!',
  }
}

const signUp = async (page: Page, credentials: Credentials) => {
  await resetAuthState(page)
  await page.getByText('Sign up').click()
  await page.getByLabel('Email').fill(credentials.email)
  await page.getByLabel('Password').fill(credentials.password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL(/\/app\/home$/)
}

const login = async (page: Page, credentials: Credentials) => {
  await resetAuthState(page)
  await page.getByLabel('Email').fill(credentials.email)
  await page.getByLabel('Password').fill(credentials.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/app\/home$/)
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

test.describe('auth and tasks', () => {
  test('supports sign up and sign in', async ({ page }) => {
    const credentials = createCredentials()

    await signUp(page, credentials)
    await signOutFromAccountMenu(page)
    await expect(page).toHaveURL(/\/auth$/)

    await login(page, credentials)
    await openAccountMenu(page)
    await expect(page.getByRole('menuitem', { name: 'Sign out' })).toBeVisible()
  })

  test('supports task create, toggle, edit and delete', async ({ page }) => {
    const credentials = createCredentials()
    const initialTitle = `task-${Date.now()}`
    const updatedTitle = `${initialTitle}-updated`

    await signUp(page, credentials)
    await page.getByRole('button', { name: 'Tasks' }).click()
    await expect(page).toHaveURL(/\/app\/tasks$/)

    const input = page.getByPlaceholder('Add a new task')
    await input.fill(initialTitle)
    await page.getByRole('button', { name: 'Add task' }).click()

    const row = page.getByRole('row', { name: new RegExp(initialTitle) })
    await expect(row).toBeVisible()

    await row.getByRole('button', { name: 'Mark as done' }).click()
    await expect(row.getByText('Done')).toBeVisible()

    await row.getByRole('button', { name: 'Edit task' }).click()
    await row.getByRole('textbox').fill(updatedTitle)
    await row.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('row', { name: new RegExp(updatedTitle) })).toBeVisible()

    const updatedRow = page.getByRole('row', { name: new RegExp(updatedTitle) })
    await updatedRow.getByRole('button', { name: 'Delete task' }).click()
    await expect(updatedRow).toHaveCount(0)
  })

  test('persists theme and language preferences from settings', async ({ page }) => {
    const credentials = createCredentials()
    await signUp(page, credentials)

    await page.getByRole('button', { name: 'Settings' }).click()
    await expect(page).toHaveURL(/\/app\/settings$/)

    await page.getByRole('button', { name: 'Dark' }).click()
    await page.getByText('Chinese (Simplified)').click()
    await page.reload()

    await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'dark')
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
    await expect
      .poll(async () => page.evaluate(() => window.localStorage.getItem('xstack-color-scheme')))
      .toBe('dark')
    await expect
      .poll(async () => page.evaluate(() => window.localStorage.getItem('lang')))
      .toBe('zh-CN')
  })

  test('supports command palette navigation', async ({ page }) => {
    const credentials = createCredentials()
    await signUp(page, credentials)

    await page.getByRole('button', { name: 'Open command palette' }).click()
    const commandSearch = page.getByPlaceholder('Search pages and actions')
    await expect(commandSearch).toBeVisible()
    await commandSearch.fill('Projects')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/app\/projects$/)
  })

  test('keeps mobile sidebar drawer interaction', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })

    const credentials = createCredentials()
    await signUp(page, credentials)

    const openNavButton = page.getByRole('button', { name: 'Open navigation' })
    await expect(openNavButton).toBeVisible()
    await openNavButton.click()
    await expect(page.getByRole('button', { name: 'Tasks' })).toBeVisible()
  })

  test('shows global toast for task load failures and no inline task alert', async ({ page }) => {
    const credentials = createCredentials()
    await signUp(page, credentials)

    await page.route('**/api/v1/todos**', route =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'UNMAPPED_CODE',
            message: '',
            requestId: 'e2e-load-error',
          },
        }),
      }),
    )

    await page.getByRole('button', { name: 'Tasks' }).click()
    await expect(page).toHaveURL(/\/app\/tasks$/)
    await expect(page.getByText('Failed to load tasks')).toBeVisible()
    await expect(page.locator('[data-testid="tasks-page"] .mantine-Alert-root')).toHaveCount(0)
  })

  test('redirects to auth and shows session-expired toast on 401', async ({ page }) => {
    const credentials = createCredentials()
    await signUp(page, credentials)

    await page.route('**/api/v1/todos**', route =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'AUTH_INVALID_TOKEN',
            message: 'Invalid bearer token',
            requestId: 'e2e-unauthorized',
          },
        }),
      }),
    )

    await page.getByRole('button', { name: 'Tasks' }).click()
    await expect(page).toHaveURL(/\/auth$/)
    await expect(page.getByText('Your session has expired. Please sign in again.')).toBeVisible()
  })

  test('shows auth failure via toast only', async ({ page }) => {
    await resetAuthState(page)

    await page.route('**/auth/v1/token*', route =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'invalid_grant',
          error_description: 'Invalid login credentials',
        }),
      }),
    )

    await page.getByLabel('Email').fill('invalid@example.com')
    await page.getByLabel('Password').fill('WrongPassword123!')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/auth$/)
    await expect(
      page.getByText('Authentication failed. Please check your credentials and try again.'),
    ).toBeVisible()
    await expect(page.locator('.mantine-Alert-root')).toHaveCount(0)
  })
})
