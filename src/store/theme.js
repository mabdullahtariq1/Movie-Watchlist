import { ref, watch } from 'vue'

function read() {
  try { return localStorage.getItem('theme') } catch { return null }
}
const prefersLight = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: light)').matches

export const theme = ref(read() || (prefersLight ? 'light' : 'dark'))

watch(theme, (v) => {
  document.documentElement.dataset.theme = v
  try { localStorage.setItem('theme', v) } catch { /* storage unavailable: theme still works for this session */ }
}, { immediate: true })

export const toggleTheme = () => { theme.value = theme.value === 'dark' ? 'light' : 'dark' }
