<script setup>
import { ref, computed, watch } from 'vue'
import { getPoster, posterEnabled } from '../store/posters.js'

const props = defineProps({
  title: { type: String, required: true },
  genre: { type: String, default: '' },
  type: { type: String, default: 'Movie' },
  year: { type: [Number, String], default: '' },
  image: { type: String, default: '' },
  bare: { type: Boolean, default: false }
})

const ICONS = { Action: '💥', Adventure: '🧭', Animation: '✨', Comedy: '😂', Crime: '🕵️', Drama: '🎭', Fantasy: '🐉', Horror: '👻', Mystery: '🔍', Romance: '❤️', 'Sci-Fi': '🚀', Thriller: '🌀' }

// If a poster link is broken, the generated artwork is shown instead
const failed = ref(false)
const remote = ref('')
const src = computed(() => props.image || remote.value)
watch(src, () => { failed.value = false })

// No poster link saved: look up the real poster online (when a TMDB key is set)
async function loadRemote() {
  remote.value = ''
  if (props.image || !posterEnabled) return
  const t = props.title
  const img = await getPoster(props.title, props.type, props.year)
  if (t === props.title) remote.value = img
}
watch(() => [props.title, props.type, props.year, props.image], loadRemote, { immediate: true })

const hue = computed(() => {
  let h = 0
  for (const c of props.title + props.genre) h = (h * 31 + c.charCodeAt(0)) % 360
  return h
})
</script>

<template>
  <div class="art">
    <img v-if="src && !failed" :src="src" :alt="`${title} poster`" loading="lazy" referrerpolicy="no-referrer" @error="failed = true" />
    <div v-else class="art-gen" :class="{ bare }" :style="{ '--h': hue }">
      <span class="art-icon" aria-hidden="true">{{ ICONS[genre] || '🎬' }}</span>
      <span class="art-type">{{ type === 'Drama' ? 'Drama series' : 'Feature film' }}</span>
      <strong class="art-title">{{ title }}</strong>
      <span class="art-year">{{ year }}</span>
    </div>
  </div>
</template>

<style scoped>
.art, .art img { width: 100%; height: 100%; display: block; object-fit: cover; }
.art-gen {
  position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: flex-end;
  gap: 2px; padding: 16px; color: #fff; overflow: hidden;
  background: radial-gradient(circle at 75% 20%, hsl(var(--h) 90% 62% / .9), transparent 55%),
    linear-gradient(155deg, hsl(var(--h) 70% 40%), hsl(calc(var(--h) + 80) 65% 14%));
}
.art-gen::before { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(115deg, rgba(255, 255, 255, .07) 0 2px, transparent 2px 14px); }
.art-gen::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0, 0, 0, .72), transparent 62%); }
.art-gen > * { position: relative; z-index: 1; }
.art-icon { position: absolute !important; top: 14%; right: 10%; font-size: clamp(3rem, 9vw, 5.5rem); filter: drop-shadow(0 6px 14px rgba(0, 0, 0, .45)); }
.art-type { font-size: .72rem; font-weight: 700; opacity: .85; }
.art-title { font-family: Fraunces, Georgia, serif; font-size: 1.3rem; line-height: 1.1; text-shadow: 0 2px 10px rgba(0, 0, 0, .55); }
.art-year { font-size: .8rem; opacity: .8; }
.bare .art-type, .bare .art-title, .bare .art-year { display: none; }
</style>
