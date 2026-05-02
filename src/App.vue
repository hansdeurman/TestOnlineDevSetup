<script setup lang="ts">
import initSqlJs, { type Database } from 'sql.js'
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import { onMounted, ref } from 'vue'

type Message = { id: number; body: string; created_at: string }

const STORAGE_KEY = 'sqlite-db-v1'
const gitSha = __GIT_SHA__
const buildTime = __BUILD_TIME__

const messages = ref<Message[]>([])
const draft = ref('')
const ready = ref(false)
let db: Database

function persist() {
  const bytes = db.export()
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  localStorage.setItem(STORAGE_KEY, btoa(binary))
}

function loadFromStorage(): Uint8Array | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null
  try {
    const binary = atob(stored)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  } catch {
    return null
  }
}

function refresh() {
  const result = db.exec('SELECT id, body, created_at FROM messages ORDER BY id DESC')
  messages.value = result.length
    ? result[0].values.map(([id, body, created_at]) => ({
        id: id as number,
        body: body as string,
        created_at: created_at as string,
      }))
    : []
}

function submit() {
  const body = draft.value.trim()
  if (!body) return
  db.run('INSERT INTO messages (body) VALUES (?)', [body])
  persist()
  draft.value = ''
  refresh()
}

function clearAll() {
  db.run('DELETE FROM messages')
  persist()
  refresh()
}

onMounted(async () => {
  const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl })
  const existing = loadFromStorage()
  db = existing ? new SQL.Database(existing) : new SQL.Database()
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  if (!existing) persist()
  ready.value = true
  refresh()
})
</script>

<template>
  <main class="page">
    <h1>Vite + Vue + sql.js</h1>
    <p>SQLite runs in your browser. Data persists in <code>localStorage</code>.</p>

    <form class="composer" @submit.prevent="submit">
      <input v-model="draft" :disabled="!ready" placeholder="Write a message" />
      <button type="submit" :disabled="!ready">Send</button>
    </form>
    <button v-if="ready && messages.length" class="clear" @click="clearAll">
      Clear all
    </button>

    <ul class="messages">
      <li v-for="m in messages" :key="m.id">
        <span class="body">{{ m.body }}</span>
        <span class="meta">{{ m.created_at }}</span>
      </li>
      <li v-if="ready && !messages.length" class="empty">No messages yet.</li>
      <li v-if="!ready" class="empty">Loading SQLite…</li>
    </ul>

    <footer class="build">build {{ gitSha }} · {{ buildTime }}</footer>
  </main>
</template>

<style scoped>
.page {
  font-family: system-ui, sans-serif;
  max-width: 32rem;
  margin: 4rem auto;
  padding: 0 1.5rem;
  color: #213547;
}

h1 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.composer {
  display: flex;
  gap: 0.5rem;
  margin: 1.5rem 0 1rem;
}

input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: 1px solid #646cff;
  background: #646cff;
  color: #fff;
  border-radius: 0.5rem;
  cursor: pointer;
}

button:disabled,
input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button.clear {
  background: transparent;
  color: #888;
  border-color: #ccc;
  font-size: 0.85rem;
  padding: 0.3rem 0.7rem;
  margin-bottom: 0.75rem;
}

button.clear:hover {
  background: #f5f5f5;
  color: #c00;
  border-color: #c00;
}

.messages {
  list-style: none;
  padding: 0;
  margin: 0;
  border-top: 1px solid #eee;
}

.messages li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid #eee;
}

.messages .meta {
  color: #888;
  font-size: 0.85rem;
  white-space: nowrap;
}

.messages .empty {
  color: #888;
  justify-content: center;
}

.build {
  margin-top: 2rem;
  color: #aaa;
  font-size: 0.75rem;
  font-family: ui-monospace, monospace;
  text-align: center;
}
</style>
