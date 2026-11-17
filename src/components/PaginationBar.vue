<script setup>
import { computed } from 'vue'

const props = defineProps({
  page: { type: Number, default: 1 },
  total: { type: Number, required: true },
  size: { type: Number, default: 15 }
})
const emit = defineEmits(['update:page'])

const pages = computed(() => Math.max(1, Math.ceil(props.total / props.size)))

// Page numbers with ellipses, e.g. 1 ... 4 5 6 ... 9
const shown = computed(() => {
  const out = []
  for (let i = 1; i <= pages.value; i++) {
    if (i === 1 || i === pages.value || Math.abs(i - props.page) <= 1) out.push(i)
    else if (out[out.length - 1] !== '...') out.push('...')
  }
  return out
})

const go = (n) => { if (n >= 1 && n <= pages.value && n !== props.page) emit('update:page', n) }
</script>

<template>
  <nav v-if="pages > 1" class="pager" aria-label="Pagination">
    <button class="btn sm" :disabled="page === 1" @click="go(page - 1)">Previous</button>
    <template v-for="(s, i) in shown" :key="i">
      <span v-if="s === '...'" class="muted dots">...</span>
      <button v-else class="btn sm pg" :class="{ active: s === page }" :aria-current="s === page ? 'page' : null" @click="go(s)">{{ s }}</button>
    </template>
    <button class="btn sm" :disabled="page === pages" @click="go(page + 1)">Next</button>
  </nav>
</template>
