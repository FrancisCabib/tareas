import type { BadgeClass, Day } from './data'

export interface TaskInput {
  name: string
  benef?: string
  tipo?: string
  resp?: string
  bc?: BadgeClass
}

const BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export const api = {
  getDays: () => request<Day[]>('/days'),

  saveDays: (days: Day[]) =>
    request<Day[]>('/days', {
      method: 'PUT',
      body: JSON.stringify({ days }),
    }),

  reset: () => request<Day[]>('/reset', { method: 'POST' }),

  createTask: (dayId: string, task: TaskInput) =>
    request<Day[]>(`/days/${dayId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task),
    }),

  updateTask: (taskId: string, fields: Partial<TaskInput>) =>
    request<Day[]>(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(fields),
    }),

  deleteTask: (taskId: string) =>
    request<Day[]>(`/tasks/${taskId}`, { method: 'DELETE' }),
}
