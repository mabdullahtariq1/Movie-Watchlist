<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const query = defineModel({ type: String, default: '' })
const emit = defineEmits(['enter'])

const input = ref(null)
const focused = ref(false)
const HINTS = ['Search movies and dramas', 'Try "Inception"', 'Try "Breaking Bad"', 'Try "Humsafar"']
const hint = ref(0)
let timer

// Press "/" anywhere to jump to the search box
const onKey = (e) => {
  const typing = ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)
  if (e.key === '/' && !typing) { e.preventDefault(); input.value?.focus() }
}
onMounted(() => {
  window.addEventListener('keydown', onKey)
  timer = setInterval(() => { if (!focused.value) hint.value = (hint.value + 1) % HINTS.length }, 2800)
})
onUnmounted(() => { window.removeEventListener('keydown', onKey); clearInterval(timer) })

function clear() { query.value = ''; input.value?.focus() }
</script>

<template>
  <div class="sb" :class="{ on: focused }">
    <svg class="sb-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
    <input
      ref="input" v-model="query" class="sb-input" type="search" :placeholder="HINTS[hint]"
      aria-label="Search movies and dramas by title" autocomplete="off"
      @focus="focused = true" @blur="focused = false" @keydown.enter="emit('enter')" @keydown.esc="query = ''"
    />
    <button v-if="query" class="sb-clear" aria-label="Clear search" @click="clear">&times;</button>
    <kbd v-else class="sb-kbd" aria-hidden="true">/</kbd>
  </div>
</template>

<style scoped>
.sb { position: relative; }
/* Animated gradient ring that appears while the box is focused */
.sb::before {
  content: ""; position: absolute; inset: -2px; border-radius: 99px; opacity: 0; transition: opacity .3s;
  background: linear-gradient(90deg, var(--accent), var(--accent2), #7c5cff, var(--accent)); background-size: 300% 100%;
  animation: ring 3s linear infinite;
}
.sb.on::before { opacity: 1; }
.sb-input {
  position: relative; z-index: 1; width: 100%; padding: 11px 44px; border-radius: 99px; border: 1px solid var(--border);
  background: var(--bg2); -webkit-appearance: none; appearance: none; transition: box-shadow .3s;
}
.sb-input:focus { outline: none; box-shadow: 0 6px 22px rgba(255, 138, 61, .25); }
.sb-input::-webkit-search-cancel-button { display: none; }
.sb-icon { position: absolute; z-index: 2; left: 16px; top: 50%; transform: translateY(-50%); color: var(--muted); transition: transform .3s, color .3s; }
.sb.on .sb-icon { color: var(--accent2); transform: translateY(-50%) scale(1.2) rotate(-12deg); }
.sb-clear { position: absolute; z-index: 2; right: 10px; top: 50%; transform: translateY(-50%); width: 28px; height: 28px; border: 0; border-radius: 50%; background: var(--border); cursor: pointer; font-size: 1.1rem; line-height: 1; }
.sb-kbd { position: absolute; z-index: 2; right: 14px; top: 50%; transform: translateY(-50%); border: 1px solid var(--border); border-radius: 6px; padding: 0 7px; font-size: .78rem; color: var(--muted); }
@keyframes ring { to { background-position: 300% 0; } }
</style>
