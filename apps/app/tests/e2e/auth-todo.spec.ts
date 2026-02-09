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
  await page.getByRole('button', { name: 'Sign up' }).click()
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

test.describe('auth and todos', () => {
  test('supports sign up and sign in', async ({ page }) => {
    const credentials = createCredentials()

    await signUp(page, credentials)
    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page).toHaveURL(/\/auth$/)

    await login(page, credentials)
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
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
})
