import { beforeEach, describe, expect, test } from 'vitest'
import { createApp } from '../src/app'
import { authHeader, createJwt, resetTodos } from './helpers'

const userId = '00000000-0000-4000-8000-000000000001'
const anotherUserId = '00000000-0000-4000-8000-000000000002'

type TaskDto = {
  id: string
  title: string
  isDone: boolean
  createdAt: string
  updatedAt: string
}

type TaskListDto = {
  items: TaskDto[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  sortBy: 'createdAt' | 'updatedAt' | 'title'
  sortOrder: 'asc' | 'desc'
  status: 'all' | 'todo' | 'done'
}

type SuccessEnvelope<T> = {
  data: T
  meta: {
    requestId: string
  }
}

type ErrorEnvelope = {
  error: {
    code: string
    message: string
    requestId: string
  }
}

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

const createAuthedRequestAsAnotherUser = async (path: string, init: RequestInit = {}) => {
  const token = await createJwt(anotherUserId)
  const headers = new Headers(init.headers)
  const auth = authHeader(token)
  headers.set('authorization', auth.authorization)

  return createRequest(path, {
    ...init,
    headers,
  })
}

describe('Todos API v1', () => {
  const app = createApp()

  beforeEach(async () => {
    await resetTodos(userId)
    await resetTodos(anotherUserId)
  })

  test('GET /api/v1/todos requires auth token', async () => {
    const response = await app.fetch(createRequest('/api/v1/todos'))
    expect(response.status).toBe(401)

    const body = (await response.json()) as ErrorEnvelope
    expect(body.error.code).toBe('AUTH_MISSING_TOKEN')
    expect(body.error.message).toBe('Missing bearer token')
    expect(body.error.requestId).toBeTruthy()
    expect(response.headers.get('x-request-id')).toBe(body.error.requestId)
  })

  test('GET /api/v1/todos rejects invalid auth token', async () => {
    const response = await app.fetch(
      createRequest('/api/v1/todos', {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      }),
    )

    expect(response.status).toBe(401)
    const body = (await response.json()) as ErrorEnvelope
    expect(body.error.code).toBe('AUTH_INVALID_TOKEN')
    expect(body.error.message).toBe('Invalid bearer token')
    expect(body.error.requestId).toBeTruthy()
    expect(response.headers.get('x-request-id')).toBe(body.error.requestId)
  })

  test('CRUD flow works with success envelope', async () => {
    const createResponse = await app.fetch(
      await createAuthedRequest('/api/v1/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'First task' }),
      }),
    )

    expect(createResponse.status).toBe(200)
    const createdBody = (await createResponse.json()) as SuccessEnvelope<TaskDto>
    expect(createdBody.data.title).toBe('First task')
    expect(createdBody.data.isDone).toBe(false)
    expect(createdBody.meta.requestId).toBeTruthy()
    expect(createResponse.headers.get('x-request-id')).toBe(createdBody.meta.requestId)

    const listResponse = await app.fetch(await createAuthedRequest('/api/v1/todos'))
    expect(listResponse.status).toBe(200)
    const listBody = (await listResponse.json()) as SuccessEnvelope<TaskListDto>
    expect(listBody.data.items).toHaveLength(1)
    expect(listBody.data.items[0]?.id).toBe(createdBody.data.id)
    expect(listBody.data.total).toBe(1)
    expect(listBody.data.page).toBe(1)
    expect(listBody.data.pageSize).toBe(10)
    expect(listBody.data.totalPages).toBe(1)

    const updateResponse = await app.fetch(
      await createAuthedRequest(`/api/v1/todos/${createdBody.data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated task', isDone: true }),
      }),
    )

    expect(updateResponse.status).toBe(200)
    const updatedBody = (await updateResponse.json()) as SuccessEnvelope<{ ok: true }>
    expect(updatedBody.data.ok).toBe(true)
    expect(updateResponse.headers.get('x-request-id')).toBe(updatedBody.meta.requestId)

    const deleteResponse = await app.fetch(
      await createAuthedRequest(`/api/v1/todos/${createdBody.data.id}`, {
        method: 'DELETE',
      }),
    )

    expect(deleteResponse.status).toBe(200)
    const deletedBody = (await deleteResponse.json()) as SuccessEnvelope<{ ok: true }>
    expect(deletedBody.data.ok).toBe(true)
    expect(deleteResponse.headers.get('x-request-id')).toBe(deletedBody.meta.requestId)
  })

  test('PATCH rejects empty updates', async () => {
    const createResponse = await app.fetch(
      await createAuthedRequest('/api/v1/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'No update task' }),
      }),
    )
    const createdBody = (await createResponse.json()) as SuccessEnvelope<TaskDto>

    const patchResponse = await app.fetch(
      await createAuthedRequest(`/api/v1/todos/${createdBody.data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    )

    expect(patchResponse.status).toBe(400)
    const body = (await patchResponse.json()) as ErrorEnvelope
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(body.error.message).toBe('Invalid request')
    expect(patchResponse.headers.get('x-request-id')).toBe(body.error.requestId)
  })

  test('GET /api/v1/todos supports pagination, sorting, and status filters', async () => {
    const createTask = async (title: string) =>
      app.fetch(
        await createAuthedRequest('/api/v1/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        }),
      )

    const taskAResponse = await createTask('alpha')
    const taskA = ((await taskAResponse.json()) as SuccessEnvelope<TaskDto>).data

    const taskBResponse = await createTask('bravo')
    const taskB = ((await taskBResponse.json()) as SuccessEnvelope<TaskDto>).data

    await createTask('charlie')

    await app.fetch(
      await createAuthedRequest(`/api/v1/todos/${taskB.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDone: true }),
      }),
    )

    const pageResponse = await app.fetch(
      await createAuthedRequest('/api/v1/todos?page=1&pageSize=2&sortBy=title&sortOrder=asc'),
    )
    expect(pageResponse.status).toBe(200)
    const pageBody = (await pageResponse.json()) as SuccessEnvelope<TaskListDto>
    expect(pageBody.data.items).toHaveLength(2)
    expect(pageBody.data.total).toBe(3)
    expect(pageBody.data.totalPages).toBe(2)
    expect(pageBody.data.items[0]?.title).toBe('alpha')
    expect(pageBody.data.items[1]?.title).toBe('bravo')

    const doneOnlyResponse = await app.fetch(await createAuthedRequest('/api/v1/todos?status=done'))
    expect(doneOnlyResponse.status).toBe(200)
    const doneOnlyBody = (await doneOnlyResponse.json()) as SuccessEnvelope<TaskListDto>
    expect(doneOnlyBody.data.items).toHaveLength(1)
    expect(doneOnlyBody.data.items[0]?.id).toBe(taskB.id)

    const todoOnlyResponse = await app.fetch(
      await createAuthedRequest('/api/v1/todos?status=todo&sortBy=title&sortOrder=desc'),
    )
    expect(todoOnlyResponse.status).toBe(200)
    const todoOnlyBody = (await todoOnlyResponse.json()) as SuccessEnvelope<TaskListDto>
    expect(todoOnlyBody.data.items.map(task => task.id)).toContain(taskA.id)
    expect(todoOnlyBody.data.items.map(task => task.id)).not.toContain(taskB.id)
  })

  test('PATCH/DELETE returns 404 when task does not exist', async () => {
    const missingId = '00000000-0000-4000-8000-000000000099'

    const patchResponse = await app.fetch(
      await createAuthedRequest(`/api/v1/todos/${missingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Missing' }),
      }),
    )

    expect(patchResponse.status).toBe(404)
    const patchBody = (await patchResponse.json()) as ErrorEnvelope
    expect(patchBody.error.code).toBe('TASK_NOT_FOUND')
    expect(patchBody.error.message).toBe('Task not found')

    const deleteResponse = await app.fetch(
      await createAuthedRequest(`/api/v1/todos/${missingId}`, {
        method: 'DELETE',
      }),
    )

    expect(deleteResponse.status).toBe(404)
    const deleteBody = (await deleteResponse.json()) as ErrorEnvelope
    expect(deleteBody.error.code).toBe('TASK_NOT_FOUND')
    expect(deleteBody.error.message).toBe('Task not found')
  })

  test('tenant boundary enforced by repository update/delete', async () => {
    const createResponse = await app.fetch(
      await createAuthedRequest('/api/v1/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Owned by user A' }),
      }),
    )

    const createdBody = (await createResponse.json()) as SuccessEnvelope<TaskDto>

    const updateByAnotherUser = await app.fetch(
      await createAuthedRequestAsAnotherUser(`/api/v1/todos/${createdBody.data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'should-not-work' }),
      }),
    )
    expect(updateByAnotherUser.status).toBe(404)

    const deleteByAnotherUser = await app.fetch(
      await createAuthedRequestAsAnotherUser(`/api/v1/todos/${createdBody.data.id}`, {
        method: 'DELETE',
      }),
    )
    expect(deleteByAnotherUser.status).toBe(404)
  })
})
