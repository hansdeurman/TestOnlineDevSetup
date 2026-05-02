<script setup lang="ts">
import { onMounted, ref } from 'vue'

type Message = { id: number; body: string; created_at: string }

const messages = ref<Message[]>([])
const draft = ref('')
const error = ref<string | null>(null)

async function load() {
  const res = await fetch('/api/messages')
  messages.value = await res.json()
}

async function submit() {
  const body = draft.value.trim()
  if (!body) return
  error.value = null
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  })
  if (!res.ok) {
    error.value = `Request failed: ${res.status}`
    return
  }
  draft.value = ''
  await load()
}

onMounted(load)
</script>

<template>
  <main class="page">
    <h1>Vite + Vue + SQLite</h1>
    <p>Messages persist in <code>data.db</code> via the Hono API.</p>

    <form class="composer" @submit.prevent="submit">
      <input v-model="draft" placeholder="Write a message" />
      <button type="submit">Send</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>

    <ul class="messages">
      <li v-for="m in messages" :key="m.id">
        <span class="body">{{ m.body }}</span>
        <span class="meta">{{ m.created_at }}</span>
      </li>
      <li v-if="!messages.length" class="empty">No messages yet.</li>
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

.error {
  color: #c00;
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
