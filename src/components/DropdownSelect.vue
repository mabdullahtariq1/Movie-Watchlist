<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  options: { type: Array, required: true }, // [{ value, label }]
  placeholder: { type: String, default: 'Select' },
  label: { type: String, default: '' }, // accessible name when there is no visible <label>
  id: { type: String, default: undefined },
  invalid: { type: Boolean, default: false }
})
const model = defineModel({ type: String, default: '' })

const open = ref(false)
const active = ref(-1)
const root = ref(null)
const list = ref(null)
const selected = computed(() => props.options.find((o) => o.value === model.value))

const scrollActive = () => list.value?.children[active.value]?.scrollIntoView({ block: 'nearest' })
function show() {
  open.value = true
  active.value = Math.max(0, props.options.findIndex((o) => o.value === model.value))
  nextTick(scrollActive)
}
const close = () => { open.value = false }
function pick(o) { model.value = o.value; close() }

function onKey(e) {
  const n = props.options.length
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    if (!open.value) return show()
    active.value = (active.value + (e.key === 'ArrowDown' ? 1 : -1) + n) % n
    nextTick(scrollActive)
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    if (open.value && active.value >= 0) pick(props.options[active.value])
    else show()
  } else if (e.key === 'Escape' && open.value) {
    e.preventDefault(); e.stopPropagation(); close()
  } else if (e.key === 'Tab') close()
}

// Close when clicking anywhere outside
const outside = (e) => { if (root.value && !root.value.contains(e.target)) close() }
onMounted(() => document.addEventListener('mousedown', outside))
onUnmounted(() => document.removeEventListener('mousedown', outside))
</script>

<template>
  <div ref="root" class="dd" :class="{ open, invalid }">
    <button
      :id="id" type="button" class="dd-btn" aria-haspopup="listbox" :aria-expanded="open"
      :aria-label="label ? `${label}: ${selected ? selected.label : placeholder}` : undefined"
      @click="open ? close() : show()" @keydown="onKey"
    >
      <span class="dd-label" :class="{ ph: !selected }">{{ selected ? selected.label : placeholder }}</span>
      <svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </button>
    <Transition name="dd">
      <ul v-if="open" ref="list" class="dd-list" role="listbox">
        <li
          v-for="(o, i) in options" :key="o.value" class="dd-item" role="option" :aria-selected="o.value === model"
          :class="{ active: i === active, selected: o.value === model }" :style="{ '--i': i }"
          @mousedown.prevent="pick(o)" @mousemove="active = i"
        >
          <span>{{ o.label }}</span>
          <span v-if="o.value === model" aria-hidden="true">&#10003;</span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.dd { position: relative; min-width: 0; }
.dd-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 11px 14px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg2); cursor: pointer; text-align: left; transition: border-color .2s, box-shadow .2s, transform .15s; }
.dd-btn:hover { border-color: var(--accent2); }
.dd-btn:active { transform: scale(.98); }
.dd.open .dd-btn, .dd-btn:focus-visible { border-color: var(--accent2); box-shadow: 0 0 0 3px rgba(255, 138, 61, .22); outline: none; }
.dd.invalid .dd-btn { border-color: #ff4d5e; }
.dd-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dd-label.ph { color: var(--muted); }
.chev { flex: none; color: var(--muted); transition: transform .3s cubic-bezier(.2, .8, .2, 1), color .2s; }
.dd.open .chev { transform: rotate(180deg); color: var(--accent2); }
.dd-list { position: absolute; z-index: 40; left: 0; right: 0; top: calc(100% + 8px); max-height: 340px; overflow-y: auto; list-style: none; padding: 6px; border-radius: 14px; background: var(--bg2); border: 1px solid var(--border); box-shadow: var(--shadow); transform-origin: top center; }
.dd-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 9px 12px; border-radius: 9px; cursor: pointer; animation: ddItem .28s both; animation-delay: calc(var(--i) * 22ms); }
.dd-item.active { background: linear-gradient(90deg, rgba(229, 18, 45, .16), rgba(255, 138, 61, .16)); }
.dd-item.selected { font-weight: 700; color: var(--accent2); }
.dd-enter-active, .dd-leave-active { transition: opacity .2s, transform .22s cubic-bezier(.2, .8, .2, 1); }
.dd-enter-from, .dd-leave-to { opacity: 0; transform: translateY(-8px) scale(.97); }
@keyframes ddItem { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
</style>
