<script setup>
import { computed } from 'vue'
import AnimatedNumber from './AnimatedNumber.vue'

const props = defineProps({ stats: { type: Object, required: true } })

const items = computed(() => [
  { label: 'Total titles', value: props.stats.total, decimals: 0 },
  { label: 'Movies', value: props.stats.movies, decimals: 0 },
  { label: 'Dramas', value: props.stats.dramas, decimals: 0 },
  { label: 'Watched', value: props.stats.watched, decimals: 0 },
  { label: 'Want to watch', value: props.stats.wantToWatch, decimals: 0 },
  { label: 'Average rating', value: props.stats.avgRating, decimals: 1 }
])
</script>

<template>
  <section class="stats" aria-label="Watchlist statistics">
    <div v-for="item in items" :key="item.label" class="stat">
      <strong><AnimatedNumber :value="item.value" :decimals="item.decimals" /></strong>
      <span>{{ item.label }}</span>
    </div>
  </section>
</template>
