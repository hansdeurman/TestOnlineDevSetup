<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const message = ref('Hello from Vite + Vue + TypeScript!')
</script>

<template>
  <main class="page">
    <h1>{{ message }}</h1>
    <p>If you can see this on your phone, the test server is working.</p>
    <button @click="count++">Clicked {{ count }} times</button>
  </main>
</template>

<style scoped>
.page {
  font-family: system-ui, sans-serif;
  max-width: 32rem;
  margin: 4rem auto;
  padding: 0 1.5rem;
  text-align: center;
  color: #213547;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

button {
  margin-top: 1.5rem;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #646cff;
  background: #fff;
  color: #213547;
  cursor: pointer;
}

button:hover {
  background: #646cff;
  color: #fff;
}
</style>
