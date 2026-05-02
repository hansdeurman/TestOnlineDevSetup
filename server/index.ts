import { serve } from '@hono/node-server'
import Database from 'better-sqlite3'
import { Hono } from 'hono'

const db = new Database('data.db')
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)

const listMessages = db.prepare('SELECT id, body, created_at FROM messages ORDER BY id DESC')
const insertMessage = db.prepare('INSERT INTO messages (body) VALUES (?)')

const app = new Hono()

app.get('/api/messages', (c) => {
  return c.json(listMessages.all())
})

app.post('/api/messages', async (c) => {
  const { body } = await c.req.json<{ body?: string }>()
  if (!body || typeof body !== 'string') {
    return c.json({ error: 'body is required' }, 400)
  }
  const result = insertMessage.run(body)
  return c.json({ id: result.lastInsertRowid, body }, 201)
})

const port = Number(process.env.PORT ?? 3001)
serve({ fetch: app.fetch, port, hostname: '0.0.0.0' })
console.log(`API listening on http://localhost:${port}`)
