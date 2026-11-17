<script setup>
import AppHeader from './components/AppHeader.vue'
import ToastMessage from './components/ToastMessage.vue'
import { store } from './store/movieStore.js'
</script>

<template>
  <AppHeader />
  <div v-if="store.state.warning" class="banner" role="alert">
    <span>{{ store.state.warning }}</span>
    <button class="clear-x" aria-label="Dismiss message" @click="store.state.warning = ''">&times;</button>
  </div>
  <main class="container">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </main>
  <footer class="footer">CineList keeps your watchlist in this browser. Poster images come from TMDB. This product uses the TMDB API.</footer>
  <ToastMessage />
</template>
