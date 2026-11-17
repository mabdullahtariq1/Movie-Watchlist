import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { store } from './store/movieStore.js'
import { posterEnabled } from './store/posters.js'
import './style.css'

const app = createApp(App)
const friendly = () => store.notify('Something went wrong. Please try again.', 'error')

// Unexpected errors show a friendly message instead of a broken page
app.config.errorHandler = (err) => { console.error(err); friendly() }
window.addEventListener('unhandledrejection', (e) => { console.error(e.reason); friendly(); e.preventDefault() })

// Developer hint: shown only while running `npm run dev`
if (import.meta.env.DEV && !posterEnabled) {
  store.state.warning = 'Real posters are off. Create a .env file in the project root with VITE_TMDB_API_KEY=your_key, then restart npm run dev (see README).'
}

// v-reveal: fades and slides an element in when it scrolls into view (optional delay in ms)
app.directive('reveal', {
  mounted(el, binding) {
    el.classList.add('reveal')
    if (binding.value) el.style.transitionDelay = `${binding.value}ms`
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return }
    el._io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); el._io.disconnect() }
    }, { threshold: 0.12 })
    el._io.observe(el)
  },
  unmounted(el) { el._io?.disconnect() }
})

app.use(router).mount('#app')
