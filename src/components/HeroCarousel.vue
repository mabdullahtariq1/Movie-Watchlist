<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import PosterArt from './PosterArt.vue'

const props = defineProps({ items: { type: Array, required: true } })
defineEmits(['add'])

const index = ref(0)
const paused = ref(false)
const current = computed(() => props.items[index.value] || props.items[0])
const go = (n) => { index.value = (n + props.items.length) % props.items.length }

// Keep the slide index valid when titles are removed or marked watched
watch(() => props.items.length, (n) => { if (index.value >= n) index.value = 0 })

// Slides change every 6 seconds (paused on hover/focus, off for reduced-motion users)
let timer
onMounted(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  timer = setInterval(() => { if (!paused.value && props.items.length > 1) go(index.value + 1) }, 6000)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <section class="hero-wrap" aria-label="Featured titles" @mouseenter="paused = true" @mouseleave="paused = false" @focusin="paused = true" @focusout="paused = false">
    <Transition name="slide" mode="out-in">
      <div :key="current.id" class="hero">
        <div class="hero-art blur"><PosterArt bare :title="current.title" :genre="current.genre" :type="current.type" :year="current.year" :image="current.image" /></div>
        <div class="hero-poster"><PosterArt :title="current.title" :genre="current.genre" :type="current.type" :year="current.year" :image="current.image" /></div>
        <div class="hero-shade">
          <!-- <p class="hero-kicker">{{ index === 0 ? 'Top pick on your list' : `Pick ${index + 1} on your list` }}</p> -->
          <h1>{{ current.title }}</h1>
          <p class="hero-meta">{{ current.type === 'Drama' ? 'Drama series' : 'Movie' }}, {{ current.year }}, {{ current.genre }}, rated {{ current.rating.toFixed(1) }}</p>
          <div class="hero-actions">
            <RouterLink :to="`/movie/${current.id}`" class="btn primary">View details</RouterLink>
            <!-- <button class="btn glass" @click="$emit('add')">Add a title</button> -->
          </div>
        </div>
      </div>
    </Transition>
    <div v-if="items.length > 1" class="hero-nav">
      <button class="hero-arrow" aria-label="Previous title" @click="go(index - 1)">&#10094;</button>
      <button v-for="(m, i) in items" :key="m.id" class="dot" :class="{ active: i === index }" :aria-label="`Show ${m.title}`" @click="go(i)"></button>
      <button class="hero-arrow" aria-label="Next title" @click="go(index + 1)">&#10095;</button>
    </div>
  </section>
</template>
