<script setup>
import { computed } from 'vue'
import { formatDate, formatMoney, formatCount, formatRuntime } from '../utils.js'
import ExpandableText from './ExpandableText.vue'

const props = defineProps({
  movie: { type: Object, required: true },
  details: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const list = (a) => (Array.isArray(a) ? a.join(', ') : '')

// Your own data first, then everything TMDB knows about the title (empty values are skipped)
const rows = computed(() => {
  const m = props.movie
  const d = props.details
  const isDrama = m.type === 'Drama'
  const out = []
  const add = (icon, label, value, wide = false) => {
    if (value !== undefined && value !== null && value !== '') out.push({ icon, label, value: String(value), wide })
  }
  add('🎬', 'Type', isDrama ? 'Drama series' : 'Movie')
  const genres = d ? list(d.genres) : ''
  add('🎭', d && d.genres && d.genres.length > 1 ? 'Genres' : 'Genre', genres || m.genre, !!(d && d.genres && d.genres.length > 2))
  add('📅', 'Released', (d && formatDate(d.releaseDate)) || m.year)
  add('⭐', 'Your rating', `${m.rating.toFixed(1)} / 10`)
  add(m.status === 'Watched' ? '✅' : '🕒', 'Your status', m.status)
  if (d) {
    if (d.tmdbScore) add('📊', 'TMDB score', `${d.tmdbScore.toFixed(1)}${d.votes ? ` (${formatCount(d.votes)} votes)` : ''}`)
    add('📡', 'Release status', d.status)
    if (isDrama) {
      add('📺', 'Seasons', d.seasons || '')
      add('🎞️', 'Episodes', d.episodes || '')
      add('⏱️', 'Episode length', formatRuntime(d.runtime))
    } else {
      add('⏱️', 'Runtime', formatRuntime(d.runtime))
    }
    add('🌐', 'Language', list(d.languages))
    add('🌍', 'Country', list(d.countries), d.countries && d.countries.length > 2)
    add('💰', 'Budget', formatMoney(d.budget))
    add('💵', 'Box office', formatMoney(d.revenue))
    add('🎥', isDrama ? 'Created by' : 'Director', list(isDrama && d.createdBy.length ? d.createdBy : d.director), true)
    add('🏢', isDrama ? 'Network' : 'Studio', list(isDrama && d.networks.length ? d.networks : d.companies), true)
  }
  return out
})

const links = computed(() => {
  const d = props.details
  if (!d) return []
  return [
    d.homepage && { label: 'Official website', href: d.homepage },
    d.imdbId && { label: 'IMDb', href: `https://www.imdb.com/title/${d.imdbId}/` },
    d.tmdbUrl && { label: 'TMDB', href: d.tmdbUrl }
  ].filter(Boolean)
})
</script>

<template>
  <aside class="info-card">
    <h2>About this {{ movie.type === 'Drama' ? 'drama' : 'movie' }}</h2>
    <div v-if="loading && !details" class="skeleton" aria-hidden="true"><span></span><span></span><span class="short"></span></div>
    <ExpandableText v-else-if="details && details.overview" :text="details.overview" :lines="5" />
    <div class="info-rows">
      <div v-for="(r, i) in rows" :key="r.label" class="irow" :class="{ wide: r.wide }" :style="{ '--i': i }">
        <span class="ico" aria-hidden="true">{{ r.icon }}</span>
        <div><small>{{ r.label }}</small><strong>{{ r.value }}</strong></div>
      </div>
    </div>
    <div v-if="links.length" class="links">
      <a v-for="l in links" :key="l.label" :href="l.href" target="_blank" rel="noopener noreferrer" class="link-chip">{{ l.label }} &#8599;</a>
    </div>
  </aside>
</template>
