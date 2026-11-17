<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store } from '../store/movieStore.js'
import { getInfo, getTrailer, getDetails } from '../store/posters.js'
import { youtubeId, isUpcoming } from '../utils.js'
import PosterArt from '../components/PosterArt.vue'
import RatingRing from '../components/RatingRing.vue'
import TrailerPlayer from '../components/TrailerPlayer.vue'
import InfoCard from '../components/InfoCard.vue'
import CastRow from '../components/CastRow.vue'
import MovieForm from '../components/MovieForm.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import EmptyState from '../components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const movie = computed(() => store.get(route.params.id))
const showForm = ref(false)
const confirming = ref(false)
const trailerId = ref('')
const details = ref(null)
const loading = ref(false)

const backdropFailed = ref(false)
watch(() => details.value?.backdrop, () => { backdropFailed.value = false })

// Upcoming by release year, or by the exact release date when TMDB has it
const upcoming = computed(() => {
  if (!movie.value) return false
  const date = details.value?.releaseDate
  return isUpcoming(movie.value) || (!!date && new Date(date) > new Date())
})

const verdict = computed(() => {
  const r = movie.value?.rating ?? 0
  if (r >= 9) return 'Masterpiece'
  if (r >= 8) return 'Must watch'
  if (r >= 7) return 'Worth a watch'
  if (r >= 5) return 'Mixed reviews'
  return 'Skip it'
})

// Trailer link saved on the title wins; otherwise trailer and details come from TMDB
watch(movie, async (m) => {
  trailerId.value = ''
  details.value = null
  if (!m) return
  const own = youtubeId(m.trailer)
  if (own) trailerId.value = own
  const myId = m.id
  loading.value = true
  try {
    const info = await getInfo(m.title, m.type, m.year)
    const [key, det] = await Promise.all([own ? Promise.resolve(own) : getTrailer(info.id, m.type), getDetails(info.id, m.type)])
    if (movie.value?.id === myId) { trailerId.value = key || own; details.value = det }
  } finally {
    loading.value = false
  }
}, { immediate: true })

function onSave(data) {
  store.update(movie.value.id, data)
  showForm.value = false
}
function onDelete() {
  store.remove(movie.value.id)
  confirming.value = false
  router.push('/')
}
</script>

<template>
  <div class="page">
    <RouterLink to="/" class="back">&larr; Back to watchlist</RouterLink>

    <template v-if="movie">
      <section class="dhero">
        <div class="hero-art" :class="{ blur: !(details && details.backdrop) || backdropFailed }">
          <img v-if="details && details.backdrop && !backdropFailed" class="backdrop-img" :src="details.backdrop" alt="" @error="backdropFailed = true" />
          <PosterArt v-else bare :title="movie.title" :genre="movie.genre" :type="movie.type" :year="movie.year" :image="movie.image" />
        </div>
        <div class="dhero-inner">
          <div class="dposter"><PosterArt :title="movie.title" :genre="movie.genre" :type="movie.type" :year="movie.year" :image="movie.image" /></div>
          <div class="dinfo stagger">
            <div class="chips">
              <span class="chip" :class="movie.status === 'Watched' ? 'ok' : ''">{{ movie.status }}</span>
              <span class="chip hot">{{ movie.type === 'Drama' ? 'Drama series' : 'Movie' }}</span>
              <span class="chip">{{ movie.genre }}</span>
              <span v-if="upcoming" class="chip soon">Upcoming</span>
              <span class="chip">{{ movie.year }}</span>
            </div>
            <h1>{{ movie.title }}</h1>
            <p v-if="details && details.tagline" class="tagline">{{ details.tagline }}</p>
            <div class="drate">
              <RatingRing :value="movie.rating" />
              <div>
                <strong>{{ verdict }}</strong>
                <span>Rated {{ movie.rating.toFixed(1) }} out of 10</span>
              </div>
            </div>
            <div class="detail-actions">
              <button class="btn primary" :disabled="upcoming && movie.status !== 'Watched'" @click="store.toggleWatched(movie.id)">
                {{ movie.status === 'Watched' ? 'Move back to Want to Watch' : upcoming ? 'Not released yet' : 'Mark as watched' }}
              </button>
              <button class="btn glass" @click="showForm = true">Edit</button>
              <button class="btn danger" @click="confirming = true">Delete</button>
            </div>
          </div>
        </div>
      </section>

      <section class="dgrid">
        <div v-reveal class="dgrid-main">
          <TrailerPlayer :video-id="trailerId" :loading="loading && !trailerId" :title="movie.title" :year="movie.year" />
        </div>
        <InfoCard v-reveal="120" class="dgrid-side" :movie="movie" :details="details" :loading="loading" />
      </section>

      <CastRow v-if="details && details.cast && details.cast.length" v-reveal :cast="details.cast" />

      <MovieForm v-if="showForm" :movie="movie" @save="onSave" @close="showForm = false" />
      <ConfirmDialog
        v-if="confirming"
        title="Delete this title?"
        :message="`&quot;${movie.title}&quot; will be removed permanently.`"
        @confirm="onDelete"
        @cancel="confirming = false"
      />
    </template>

    <EmptyState v-else title="Title not found" text="It may have been deleted, or the link is wrong.">
      <RouterLink to="/" class="btn primary">Go to watchlist</RouterLink>
    </EmptyState>
  </div>
</template>
