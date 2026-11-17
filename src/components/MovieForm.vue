<script setup>
import { reactive, watch, onMounted, onUnmounted } from 'vue'
import { store } from '../store/movieStore.js'
import DropdownSelect from './DropdownSelect.vue'
import { TYPES, GENRES, STATUSES, youtubeId } from '../utils.js'

const props = defineProps({ movie: { type: Object, default: null } })
const emit = defineEmits(['save', 'close'])

const blank = () => ({ title: '', type: 'Movie', genre: '', year: '', rating: '', status: 'Want to Watch', image: '', trailer: '' })
const form = reactive(blank())
const errors = reactive({})
const maxYear = new Date().getFullYear() + 5
const typeOptions = TYPES.map((t) => ({ value: t, label: t }))
const genreOptions = GENRES.map((g) => ({ value: g, label: g }))
const statusOptions = STATUSES.map((x) => ({ value: x, label: x }))

// Fill the form when editing, reset it when adding
watch(() => props.movie, (m) => {
  Object.assign(form, m ? { ...m } : blank())
  Object.keys(errors).forEach((k) => delete errors[k])
}, { immediate: true })

const isEmpty = (v) => v === '' || v === null || v === undefined

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  const title = String(form.title).trim()
  if (!title) errors.title = 'Enter a title.'
  else if (title.length > 100) errors.title = 'Title must be 100 characters or fewer.'
  else if (store.state.movies.some((m) => m.id !== props.movie?.id && m.type === form.type && m.title.toLowerCase() === title.toLowerCase())) {
    errors.title = `This ${form.type.toLowerCase()} is already in your list.`
  }

  if (!TYPES.includes(form.type)) errors.type = 'Choose Movie or Drama.'
  if (!form.genre) errors.genre = 'Choose a genre.'

  const year = Number(form.year)
  if (isEmpty(form.year)) errors.year = 'Enter the release year.'
  else if (!Number.isInteger(year) || year < 1888 || year > maxYear) errors.year = `Enter a whole year between 1888 and ${maxYear}.`

  const rating = Number(form.rating)
  if (isEmpty(form.rating)) errors.rating = 'Enter a rating.'
  else if (Number.isNaN(rating) || rating < 0 || rating > 10) errors.rating = 'Rating must be a number from 0 to 10.'

  if (!STATUSES.includes(form.status)) errors.status = 'Choose a watch status.'
  else if (form.status === 'Watched' && Number.isInteger(year) && year > new Date().getFullYear()) errors.status = 'An upcoming title cannot be marked as watched yet.'

  const url = String(form.image || '').trim()
  if (url) {
    try {
      const u = new URL(url)
      if (!['http:', 'https:'].includes(u.protocol) || url.length > 500) throw new Error('bad')
    } catch {
      errors.image = 'Enter a valid image link starting with http:// or https://.'
    }
  }

  const trailer = String(form.trailer || '').trim()
  if (trailer && !youtubeId(trailer)) errors.trailer = 'Enter a YouTube link, e.g. https://www.youtube.com/watch?v=...'
  return Object.keys(errors).length === 0
}

function submit() {
  if (!validate()) return
  emit('save', {
    title: String(form.title).trim(),
    type: form.type,
    genre: form.genre,
    year: Number(form.year),
    rating: Math.round(Number(form.rating) * 10) / 10,
    status: form.status,
    image: String(form.image || '').trim(),
    trailer: String(form.trailer || '').trim()
  })
}

const onKey = (e) => { if (e.key === 'Escape') emit('close') }
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="backdrop" @click.self="emit('close')">
    <form class="modal" novalidate role="dialog" aria-modal="true" aria-labelledby="form-title" @submit.prevent="submit">
      <h2 id="form-title">{{ movie ? 'Edit title' : 'Add a movie or drama' }}</h2>

      <div class="field">
        <label for="f-title">Title</label>
        <input id="f-title" v-model="form.title" class="input" :class="{ invalid: errors.title }" maxlength="120" placeholder="e.g. Inception" autofocus />
        <span v-if="errors.title" class="error">{{ errors.title }}</span>
      </div>

      <div class="row">
        <div class="field">
          <label for="f-type">Type</label>
          <DropdownSelect id="f-type" v-model="form.type" :options="typeOptions" :invalid="!!errors.type" />
          <span v-if="errors.type" class="error">{{ errors.type }}</span>
        </div>
        <div class="field">
          <label for="f-genre">Genre</label>
          <DropdownSelect id="f-genre" v-model="form.genre" :options="genreOptions" placeholder="Choose genre" :invalid="!!errors.genre" />
          <span v-if="errors.genre" class="error">{{ errors.genre }}</span>
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label for="f-status">Status</label>
          <DropdownSelect id="f-status" v-model="form.status" :options="statusOptions" :invalid="!!errors.status" />
          <span v-if="errors.status" class="error">{{ errors.status }}</span>
        </div>
        <div class="field">
          <label for="f-year">Release year</label>
          <input id="f-year" v-model="form.year" class="input" :class="{ invalid: errors.year }" type="number" placeholder="e.g. 2010" />
          <span v-if="errors.year" class="error">{{ errors.year }}</span>
        </div>
      </div>

      <div class="field">
        <label for="f-rating">Rating (0 to 10)</label>
        <input id="f-rating" v-model="form.rating" class="input" :class="{ invalid: errors.rating }" type="number" step="0.1" placeholder="e.g. 8.5" />
        <span v-if="errors.rating" class="error">{{ errors.rating }}</span>
      </div>

      <div class="field">
        <label for="f-image">Poster image link (optional)</label>
        <input id="f-image" v-model="form.image" class="input" :class="{ invalid: errors.image }" type="url" placeholder="https://example.com/poster.jpg" />
        <span v-if="errors.image" class="error">{{ errors.image }}</span>
        <span v-else class="muted hint">Leave empty to use generated artwork.</span>
      </div>

      <div class="field">
        <label for="f-trailer">Trailer link, YouTube (optional)</label>
        <input id="f-trailer" v-model="form.trailer" class="input" :class="{ invalid: errors.trailer }" type="url" placeholder="https://www.youtube.com/watch?v=..." />
        <span v-if="errors.trailer" class="error">{{ errors.trailer }}</span>
        <span v-else class="muted hint">Leave empty to find the trailer automatically.</span>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn" @click="emit('close')">Cancel</button>
        <button type="submit" class="btn primary">{{ movie ? 'Save changes' : 'Add title' }}</button>
      </div>
    </form>
  </div>
</template>
