<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  size: { type: Number, default: 92 }
})

const R = 40
const C = 2 * Math.PI * R
const shown = ref(0)
// Start empty, then fill so the ring animates in
onMounted(() => requestAnimationFrame(() => { shown.value = props.value }))
watch(() => props.value, (v) => { shown.value = v })
const offset = computed(() => C * (1 - Math.min(Math.max(shown.value, 0), 10) / 10))
</script>

<template>
  <div class="ring" :style="{ width: size + 'px', height: size + 'px' }" role="img" :aria-label="`Rating ${value.toFixed(1)} out of 10`">
    <svg viewBox="0 0 100 100">
      <defs>
        <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ff2d46" />
          <stop offset="1" stop-color="#ffb13d" />
        </linearGradient>
      </defs>
      <circle class="track" cx="50" cy="50" r="40" />
      <circle class="bar" cx="50" cy="50" r="40" stroke="url(#ring-grad)" :stroke-dasharray="C" :stroke-dashoffset="offset" transform="rotate(-90 50 50)" />
    </svg>
    <span class="num">{{ value.toFixed(1) }}</span>
  </div>
</template>

<style scoped>
.ring { position: relative; flex: none; }
.ring svg { width: 100%; height: 100%; }
.track { fill: none; stroke: rgba(255, 255, 255, .2); stroke-width: 8; }
.bar { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 1.3s cubic-bezier(.2, .8, .2, 1); }
.num { position: absolute; inset: 0; display: grid; place-items: center; font-family: Fraunces, Georgia, serif; font-weight: 800; font-size: 1.5rem; color: #fff; }
</style>
