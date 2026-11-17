<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  value: { type: [Number, String], required: true },
  decimals: { type: Number, default: 0 }
})

const shown = ref(0)
let raf

// Counts up (or down) smoothly to the new value
function run(to) {
  cancelAnimationFrame(raf)
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { shown.value = to; return }
  const from = shown.value
  const start = performance.now()
  const tick = (now) => {
    const t = Math.min(1, (now - start) / 900)
    shown.value = from + (to - from) * (1 - Math.pow(1 - t, 3))
    if (t < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}
onMounted(() => run(Number(props.value) || 0))
watch(() => props.value, (v) => run(Number(v) || 0))
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <span>{{ shown.toFixed(decimals) }}</span>
</template>
