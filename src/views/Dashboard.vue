<script setup>
// import { ref, computed, watch, nextTick } from 'vue'
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { store, stats } from '../store/movieStore.js'
// import { PAGE_SIZE } from '../utils.js'
import { PAGE_SIZE, MOBILE_PAGE_SIZE } from '../utils.js'
import DashboardStats from '../components/DashboardStats.vue'
import FilterBar from '../components/FilterBar.vue'
import MovieCard from '../components/MovieCard.vue'
import MovieForm from '../components/MovieForm.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import EmptyState from '../components/EmptyState.vue'
import PaginationBar from '../components/PaginationBar.vue'
import HeroCarousel from '../components/HeroCarousel.vue'
import { query } from '../store/search.js'

const type = ref('')
const genre = ref('')
const status = ref('')
const sort = ref('added-desc')
const page = ref(1)
const showForm = ref(false)
const editing = ref(null)
const deleting = ref(null)

const genres = computed(() => [...new Set(store.state.movies.map((m) => m.genre))].sort())

// Reset the genre filter if its last title was removed
watch(genres, (g) => { if (genre.value && !g.includes(genre.value)) genre.value = '' })

const filtersActive = computed(() => !!(query.value.trim() || type.value || genre.value || status.value))

const list = computed(() => {
  const q = query.value.trim().toLowerCase()
  const out = store.state.movies.filter((m) =>
    (!q || m.title.toLowerCase().includes(q)) &&
    (!type.value || m.type === type.value) &&
    (!genre.value || m.genre === genre.value) &&
    (!status.value || m.status === status.value)
  )
  const [key, dir] = sort.value.split('-')
  const k = dir === 'asc' ? 1 : -1
  const field = key === 'added' ? 'addedAt' : key
  return out.sort((a, b) => (field === 'title' ? k * a.title.localeCompare(b.title) : k * ((a[field] || 0) - (b[field] || 0))))
})

// const totalPages = computed(() => Math.max(1, Math.ceil(list.value.length / PAGE_SIZE)))
// const paged = computed(() => list.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
// const range = computed(() => list.value.length
//   ? `${(page.value - 1) * PAGE_SIZE + 1}-${Math.min(page.value * PAGE_SIZE, list.value.length)} of ${list.value.length}`
//   : '0')

// Phones show 2 columns, so 16 titles per page keeps every row full
const phone = window.matchMedia('(max-width: 600px)')
const isPhone = ref(phone.matches)
const syncPhone = () => { isPhone.value = phone.matches }
phone.addEventListener('change', syncPhone)
onUnmounted(() => phone.removeEventListener('change', syncPhone))
const pageSize = computed(() => (isPhone.value ? MOBILE_PAGE_SIZE : PAGE_SIZE))

const totalPages = computed(() => Math.max(1, Math.ceil(list.value.length / pageSize.value)))
const paged = computed(() => list.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
const range = computed(() => list.value.length
  ? `${(page.value - 1) * pageSize.value + 1}-${Math.min(page.value * pageSize.value, list.value.length)} of ${list.value.length}`
  : '0')

// Back to page 1 when search/filters change; stay in range when items are deleted
watch([query, type, genre, status, sort], () => { page.value = 1 })
watch(totalPages, (n) => { if (page.value > n) page.value = n })

function changePage(n) {
  page.value = n
  document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
}

// Hero slides: the 5 best-rated titles you still want to watch (all titles if everything is watched)
const featuredList = computed(() => {
  const pool = store.state.movies.filter((m) => m.status === 'Want to Watch')
  const src = pool.length ? pool : store.state.movies
  return [...src].sort((a, b) => b.rating - a.rating).slice(0, 5)
})

function openAdd() { editing.value = null; showForm.value = true }
function openEdit(m) { editing.value = m; showForm.value = true }
function closeForm() { showForm.value = false; editing.value = null }
function onSave(data) {
  if (editing.value) store.update(editing.value.id, data)
  else {
    store.add(data)
    // Show the new title first: newest-first order, no filters, page 1
    sort.value = 'added-desc'
    clearFilters()
    page.value = 1
    nextTick(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }))
  }
  closeForm()
}
function confirmDelete() {
  store.remove(deleting.value.id)
  deleting.value = null
}
function clearFilters() { query.value = ''; type.value = ''; genre.value = ''; status.value = '' }
</script>

<template>
  <div class="page">
  <HeroCarousel v-if="featuredList.length" :items="featuredList" @add="openAdd" />
  <section v-else class="hero plain">
    <div class="hero-shade">
      <h1>Your watchlist starts here</h1>
      <p class="hero-meta">Add the first movie or drama you want to see.</p>
      <div class="hero-actions"><button class="btn primary" @click="openAdd">Add a title</button></div>
    </div>
  </section>

  <DashboardStats v-reveal :stats="stats" />

  <section v-reveal class="toolbar">
    <FilterBar v-model:type="type" v-model:genre="genre" v-model:status="status" v-model:sort="sort" :genres="genres" />
    <button class="btn primary" @click="openAdd">+ Add Movie</button>
  </section>

  <h2 id="results" v-reveal class="section-title">
    {{ filtersActive ? 'Results' : 'All titles' }}
    <span class="muted count">{{ range }}</span>
  </h2>

  <TransitionGroup v-if="paged.length" name="cards" tag="div" class="grid" appear>
    <MovieCard v-for="(m, i) in paged" :key="m.id" :movie="m" :style="{ '--i': i }" @toggle="store.toggleWatched" @edit="openEdit" @remove="deleting = $event" />
  </TransitionGroup>
  <EmptyState v-else-if="filtersActive" title="Nothing matches" text="Try a different title or clear the filters.">
    <button class="btn" @click="clearFilters">Clear filters</button>
  </EmptyState>
  <EmptyState v-else title="Your watchlist is empty" text="Add a movie or drama to start tracking what you want to watch.">
    <button class="btn primary" @click="openAdd">Add your first title</button>
  </EmptyState>

  <PaginationBar :page="page" :total="list.length" :size="pageSize" @update:page="changePage" />

  <MovieForm v-if="showForm" :movie="editing" @save="onSave" @close="closeForm" />
  <ConfirmDialog
    v-if="deleting"
    title="Delete this title?"
    :message="`&quot;${deleting.title}&quot; will be removed permanently.`"
    @confirm="confirmDelete"
    @cancel="deleting = null"
  />
  </div>
</template>
