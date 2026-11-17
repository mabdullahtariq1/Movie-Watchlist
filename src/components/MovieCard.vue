<script setup>
import PosterArt from './PosterArt.vue'
import { store } from '../store/movieStore.js'
import { isUpcoming } from '../utils.js'

defineProps({ movie: { type: Object, required: true } })
defineEmits(['toggle', 'edit', 'remove'])
</script>

<template>
  <article class="card" :class="{ fresh: store.state.lastAddedId === movie.id }">
    <RouterLink :to="`/movie/${movie.id}`" class="poster" :aria-label="`View details for ${movie.title}`">
      <PosterArt :title="movie.title" :genre="movie.genre" :type="movie.type" :year="movie.year" :image="movie.image" />
      <span class="badge" :class="{ ok: movie.status === 'Watched' }">{{ movie.status }}</span>
      <span class="badge type">{{ movie.type }}</span>
      <span v-if="isUpcoming(movie)" class="badge upcoming">Upcoming {{ movie.year }}</span>
      <span v-if="store.state.lastAddedId === movie.id" class="badge new">New</span>
    </RouterLink>
    <div class="card-body">
      <h3 class="clamp">{{ movie.title }}</h3>
      <p class="meta">
        <span>{{ movie.year }}</span>
        <span>{{ movie.genre }}</span>
        <span class="star">&#9733; {{ movie.rating.toFixed(1) }}</span>
      </p>
      <div class="actions">
        <button class="btn sm" :disabled="isUpcoming(movie) && movie.status !== 'Watched'" :title="isUpcoming(movie) && movie.status !== 'Watched' ? 'Not released yet' : undefined" @click="$emit('toggle', movie.id)">
          {{ movie.status === 'Watched' ? 'Unmark' : 'Mark watched' }}
        </button>
        <button class="icon-btn" aria-label="Edit" @click="$emit('edit', movie)">&#9998;</button>
        <button class="icon-btn" aria-label="Delete" @click="$emit('remove', movie)">&#128465;</button>
      </div>
    </div>
  </article>
</template>
