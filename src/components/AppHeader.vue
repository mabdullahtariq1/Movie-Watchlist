<script setup>
import { watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { theme, toggleTheme } from '../store/theme.js'
import { query } from '../store/search.js'
import SearchBar from './SearchBar.vue'

const route = useRoute()
const router = useRouter()

// Typing while on a details page takes you back to the list to see the results
watch(query, (q) => { if (q && route.path !== '/') router.push('/') })

async function showResults() {
  if (route.path !== '/') await router.push('/')
  await nextTick()
  document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <header class="header">
    <div class="container header-inner">
      <RouterLink to="/" class="logo">CineList</RouterLink>
      <SearchBar v-model="query" @enter="showResults" />
      <nav class="nav">
        <RouterLink to="/" class="nav-link">Watchlist</RouterLink>
        <button
          class="icon-btn theme-btn"
          :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
          :title="theme === 'dark' ? 'Light theme' : 'Dark theme'"
          @click="toggleTheme"
        >
          <Transition name="spin" mode="out-in">
            <span :key="theme">{{ theme === 'dark' ? '\u2600' : '\u263E' }}</span>
          </Transition>
        </button>
      </nav>
    </div>
  </header>
</template>
