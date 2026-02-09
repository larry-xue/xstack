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
  await page.getByText('Sign up').click()
  await page.getByLabel('Email').fill(credentials.email)
  await page.getByLabel('Password').fill(credentials.password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL(/\/app\/home$/)
}

const login = async (page: Page, credentials: Credentials) => {
  await page.goto('/auth')
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

    await page.keyboard.press('Control+K')
    await page.keyboard.type('Projects')
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
})
