<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  lines: { type: Number, default: 5 }
})

const el = ref(null)
const expanded = ref(false)
const overflow = ref(false)
const full = ref(0)
const collapsed = ref(0)

// Works out whether the text is longer than the allowed number of lines
function measure() {
  const n = el.value
  if (!n) return
  full.value = n.scrollHeight
  collapsed.value = parseFloat(getComputedStyle(n).lineHeight) * props.lines
  overflow.value = full.value > collapsed.value + 4
}

let ro
onMounted(() => {
  measure()
  document.fonts?.ready.then(measure)
  if ('ResizeObserver' in window) { ro = new ResizeObserver(measure); ro.observe(el.value) }
})
onBeforeUnmount(() => ro?.disconnect())
watch(() => props.text, async () => { expanded.value = false; await nextTick(); measure() })

const style = computed(() => (overflow.value ? { maxHeight: `${expanded.value ? full.value : collapsed.value}px` } : {}))
</script>

<template>
  <div>
    <p ref="el" class="xt" :class="{ fade: overflow && !expanded }" :style="style">{{ text }}</p>
    <button v-if="overflow" type="button" class="xt-more" :class="{ open: expanded }" :aria-expanded="expanded" @click="expanded = !expanded">
      {{ expanded ? 'View less' : 'View more' }}
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </button>
  </div>
</template>

<style scoped>
.xt { overflow: hidden; line-height: 1.65; color: var(--muted); transition: max-height .45s cubic-bezier(.2, .8, .2, 1); }
.xt.fade { -webkit-mask-image: linear-gradient(#000 55%, transparent); mask-image: linear-gradient(#000 55%, transparent); }
.xt-more { display: inline-flex; align-items: center; gap: 4px; margin: 6px 0 18px; padding: 2px 6px; margin-left: -6px; border-radius: 6px; border: 0; background: none; cursor: pointer; font-weight: 700; color: var(--accent2); }
.xt-more svg { transition: transform .3s; }
.xt-more.open svg { transform: rotate(180deg); }
.xt-more:hover { text-decoration: underline; }
</style>
