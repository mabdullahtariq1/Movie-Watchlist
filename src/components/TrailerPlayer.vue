<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  videoId: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  title: { type: String, required: true },
  year: { type: [Number, String], default: '' }
})

const playing = ref(false)
watch(() => props.videoId, () => { playing.value = false })

const thumb = computed(() => `https://img.youtube.com/vi/${props.videoId}/hqdefault.jpg`)
const embedUrl = computed(() => `https://www.youtube-nocookie.com/embed/${props.videoId}?autoplay=1&rel=0`)
const searchUrl = computed(() => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${props.title} ${props.year} official trailer`)}`)
</script>

<template>
  <section class="trailer" aria-label="Trailer">
    <h2>Trailer</h2>
    <div v-if="loading" class="trailer-box state muted">Looking for the trailer...</div>
    <div v-else-if="videoId" class="trailer-box">
      <iframe v-if="playing" :src="embedUrl" :title="`${title} trailer`" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
      <button v-else class="trailer-play" :aria-label="`Play ${title} trailer`" @click="playing = true">
        <img :src="thumb" :alt="`${title} trailer thumbnail`" loading="lazy" />
        <span class="play-btn" aria-hidden="true">&#9654;</span>
      </button>
    </div>
    <div v-else class="trailer-box state">
      <p class="muted">No trailer found for this title.</p>
      <a class="btn" :href="searchUrl" target="_blank" rel="noopener">Search on YouTube</a>
    </div>
  </section>
</template>
