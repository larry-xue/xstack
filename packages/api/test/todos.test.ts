import { beforeEach, describe, expect, test } from 'vitest'
import { createApp } from '../src/app'
import { createJwt, authHeader, resetTodos } from './helpers'

const userId = '00000000-0000-4000-8000-000000000001'

const createRequest = (path: string, init: RequestInit = {}) =>
  new Request(`http://localhost${path}`, init)

const createAuthedRequest = async (path: string, init: RequestInit = {}) => {
  const token = await createJwt(userId)
  const headers = new Headers(init.headers)
  const auth = authHeader(token)
  headers.set('authorization', auth.authorization)

  return createRequest(path, {
    ...init,
    headers,
  })
}

describe('Todos API', () => {
  const app = createApp()

  beforeEach(async () => {
    await resetTodos(userId)
  })

  test('GET /api/todos requires auth', async () => {
    const response = await app.fetch(createRequest('/api/todos'))

    expect(response.status).toBe(401)
    const body = (await response.json()) as {
      error: string
      code: string
      requestId: string
    }
    expect(body.error).toBe('Unauthorized')
    expect(body.code).toBe('UNAUTHORIZED')
    expect(body.requestId).toBeTruthy()
    expect(response.headers.get('x-request-id')).toBeTruthy()
  })

  test('CRUD flow works', async () => {
    const createResponse = await app.fetch(
      await createAuthedRequest('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'First task' }),
      }),
    )

    expect(createResponse.status).toBe(200)
    const created = (await createResponse.json()) as { id: string; title: string; isDone: boolean }
    expect(created.title).toBe('First task')
    expect(created.isDone).toBe(false)
    expect(createResponse.headers.get('x-request-id')).toBeTruthy()

    const listResponse = await app.fetch(await createAuthedRequest('/api/todos'))
    expect(listResponse.status).toBe(200)
    const list = (await listResponse.json()) as Array<{ id: string }>
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe(created.id)

    const updateResponse = await app.fetch(
      await createAuthedRequest(`/api/todos/${created.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated task', isDone: true }),
      }),
    )
    expect(updateResponse.status).toBe(200)
    expect(updateResponse.headers.get('x-request-id')).toBeTruthy()
    const updated = (await updateResponse.json()) as { title: string; isDone: boolean }
    expect(updated.title).toBe('Updated task')
    expect(updated.isDone).toBe(true)

    const deleteResponse = await app.fetch(
      await createAuthedRequest(`/api/todos/${created.id}`, {
        method: 'DELETE',
      }),
    )
    expect(deleteResponse.status).toBe(200)
    expect(deleteResponse.headers.get('x-request-id')).toBeTruthy()
    await expect(deleteResponse.json()).resolves.toEqual({ ok: true })
  })

  test('PATCH rejects missing updates', async () => {
    const createResponse = await app.fetch(
      await createAuthedRequest('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'No update task' }),
      }),
    )
    const created = (await createResponse.json()) as { id: string }

    const patchResponse = await app.fetch(
      await createAuthedRequest(`/api/todos/${created.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    )

    expect(patchResponse.status).toBe(400)
    const patchBody = (await patchResponse.json()) as {
      error: string
      code: string
      requestId: string
    }
    expect(patchBody.error).toBe('No updates provided')
    expect(patchBody.code).toBe('NO_UPDATES')
    expect(patchBody.requestId).toBeTruthy()
    expect(patchResponse.headers.get('x-request-id')).toBeTruthy()
  })

  test('PATCH/DELETE 404 on missing todo', async () => {
    const patchResponse = await app.fetch(
      await createAuthedRequest('/api/todos/00000000-0000-4000-8000-000000000099', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Missing' }),
      }),
    )
    expect(patchResponse.status).toBe(404)
    const missingPatch = (await patchResponse.json()) as {
      error: string
      code: string
      requestId: string
    }
    expect(missingPatch.error).toBe('Todo not found')
    expect(missingPatch.code).toBe('TODO_NOT_FOUND')
    expect(missingPatch.requestId).toBeTruthy()
    expect(patchResponse.headers.get('x-request-id')).toBeTruthy()

    const deleteResponse = await app.fetch(
      await createAuthedRequest('/api/todos/00000000-0000-4000-8000-000000000099', {
        method: 'DELETE',
      }),
    )
    expect(deleteResponse.status).toBe(404)
    const missingDelete = (await deleteResponse.json()) as {
      error: string
      code: string
      requestId: string
    }
    expect(missingDelete.error).toBe('Todo not found')
    expect(missingDelete.code).toBe('TODO_NOT_FOUND')
    expect(missingDelete.requestId).toBeTruthy()
    expect(deleteResponse.headers.get('x-request-id')).toBeTruthy()
  })
})
