import * as seed from './mock/data.js'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

/** Enquanto não houver backend, usa os dados simulados. Defina VITE_USE_MOCK=false para chamar a API. */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

function queryString(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  return entries.length ? `?${new URLSearchParams(entries)}` : ''
}

async function request(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Não foi possível conectar à API.', 0)
  }

  if (!res.ok) {
    let message = `Erro ${res.status} ao acessar ${path}`
    try {
      const data = await res.json()
      message = data.message || data.detail || data.error || message
    } catch {
      // resposta sem corpo JSON
    }
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return null
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

/* ---------- Mock em memória ---------- */

const db = Object.fromEntries(Object.entries(seed).map(([k, rows]) => [k, rows.map((r) => ({ ...r }))]))
const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms))

function mockResource(table, { onCreate } = {}) {
  const rows = () => db[table]
  return {
    async list(params = {}) {
      await wait()
      return rows()
        .filter((row) => Object.entries(params).every(([k, v]) => v === undefined || v === '' || String(row[k]) === String(v)))
        .map((r) => ({ ...r }))
    },
    async get(id) {
      await wait()
      const row = rows().find((r) => r.id === Number(id))
      if (!row) throw new ApiError('Registro não encontrado.', 404)
      return { ...row }
    },
    async create(data) {
      await wait()
      const id = Math.max(0, ...rows().map((r) => r.id)) + 1
      const row = { ...(onCreate ? onCreate(data) : data), id }
      rows().push(row)
      return { ...row }
    },
    async update(id, data) {
      await wait()
      const idx = rows().findIndex((r) => r.id === Number(id))
      if (idx < 0) throw new ApiError('Registro não encontrado.', 404)
      rows()[idx] = { ...rows()[idx], ...data, id: Number(id) }
      return { ...rows()[idx] }
    },
    async remove(id) {
      await wait()
      db[table] = rows().filter((r) => r.id !== Number(id))
      return null
    },
  }
}

/* ---------- Recurso REST ---------- */

/**
 * Cria um cliente CRUD para um endpoint REST.
 * Rotas esperadas: GET /{endpoint}, GET /{endpoint}/{id}, POST /{endpoint},
 * PUT /{endpoint}/{id} e DELETE /{endpoint}/{id}.
 */
export function createResource(endpoint, options = {}) {
  if (USE_MOCK) return mockResource(options.table ?? endpoint, options)
  return {
    list: (params) => request(`/${endpoint}${queryString(params)}`),
    get: (id) => request(`/${endpoint}/${id}`),
    create: (data) => request(`/${endpoint}`, { method: 'POST', body: data }),
    update: (id, data) => request(`/${endpoint}/${id}`, { method: 'PUT', body: data }),
    remove: (id) => request(`/${endpoint}/${id}`, { method: 'DELETE' }),
  }
}
