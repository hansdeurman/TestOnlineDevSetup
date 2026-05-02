<script setup lang="ts">
import initSqlJs, { type Database } from 'sql.js'
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import { onMounted, ref } from 'vue'

type Message = { id: number; body: string; created_at: string }

const messages = ref<Message[]>([])
const draft = ref('')
const ready = ref(false)
let db: Database

function refresh() {
  const result = db.exec('SELECT id, body, created_at FROM messages ORDER BY id DESC')
  if (!result.length) {
    messages.value = []
    return
  }
  messages.value = result[0].values.map(([id, body, created_at]) => ({
    id: id as number,
    body: body as string,
    created_at: created_at as string,
  }))
}

function submit() {
  const body = draft.value.trim()
  if (!body) return
  db.run('INSERT INTO messages (body) VALUES (?)', [body])
  draft.value = ''
  refresh()
}

onMounted(async () => {
  const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl })
  db = new SQL.Database()
  db.run(`
    CREATE TABLE messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  ready.value = true
  refresh()
})
</script>

<template>
  <main class="page">
    <h1>Vite + Vue + sql.js</h1>
    <p>SQLite runs in your browser via WebAssembly. Data resets on refresh.</p>

    <form class="composer" @submit.prevent="submit">
      <input v-model="draft" :disabled="!ready" placeholder="Write a message" />
      <button type="submit" :disabled="!ready">Send</button>
    </form>

    <ul class="messages">
      <li v-for="m in messages" :key="m.id">
        <span class="body">{{ m.body }}</span>
        <span class="meta">{{ m.created_at }}</span>
      </li>
      <li v-if="ready && !messages.length" class="empty">No messages yet.</li>
      <li v-if="!ready" class="empty">Loading SQLite…</li>
    </ul>
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
</style>
