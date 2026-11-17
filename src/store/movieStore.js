import { reactive, computed, watch } from 'vue'
import { isUpcoming } from '../utils.js'

const KEY = 'cinelist.titles.v2'

// [title, genre, year, rating, watched]
const MOVIES = [
  ['Inception', 'Sci-Fi', 2010, 8.8, 1], ['The Dark Knight', 'Action', 2008, 9.0, 1], ['Interstellar', 'Sci-Fi', 2014, 8.7, 0],
  ['Parasite', 'Thriller', 2019, 8.5, 0], ['Spirited Away', 'Animation', 2001, 8.6, 1], ['The Godfather', 'Crime', 1972, 9.2, 0],
  ['La La Land', 'Romance', 2016, 8.0, 0], ['Dune', 'Adventure', 2021, 8.0, 1], ['The Matrix', 'Sci-Fi', 1999, 8.7, 1],
  ['Gladiator', 'Action', 2000, 8.5, 0], ['Joker', 'Drama', 2019, 8.4, 1], ['Coco', 'Animation', 2017, 8.4, 0],
  ['Titanic', 'Romance', 1997, 7.9, 1], ['Avengers: Endgame', 'Action', 2019, 8.4, 1], ['The Shawshank Redemption', 'Drama', 1994, 9.3, 0],
  ['Pulp Fiction', 'Crime', 1994, 8.9, 0], ['Forrest Gump', 'Drama', 1994, 8.8, 1], ['The Lion King', 'Animation', 1994, 8.5, 1],
  ['Get Out', 'Horror', 2017, 7.7, 0], ['Mad Max: Fury Road', 'Action', 2015, 8.1, 0], ['Knives Out', 'Comedy', 2019, 7.9, 1],
  ['The Conjuring', 'Horror', 2013, 7.5, 0]
]
const DRAMAS = [
  ['Breaking Bad', 'Crime', 2008, 9.5, 1], ['Game of Thrones', 'Fantasy', 2011, 9.2, 1], ['Stranger Things', 'Sci-Fi', 2016, 8.7, 0],
  ['Money Heist', 'Crime', 2017, 8.2, 1], ['Sherlock', 'Mystery', 2010, 9.1, 0], ['The Crown', 'Drama', 2016, 8.6, 0],
  ['Dark', 'Thriller', 2017, 8.7, 0], ['Squid Game', 'Thriller', 2021, 8.0, 1], ['Peaky Blinders', 'Crime', 2013, 8.8, 0],
  ['Chernobyl', 'Drama', 2019, 9.3, 0], ['Humsafar', 'Romance', 2011, 8.9, 1], ['Zindagi Gulzar Hai', 'Romance', 2012, 8.4, 0]
]
const make = (type) => (r, i) => ({
  id: `${type[0].toLowerCase()}${i + 1}`, title: r[0], type, genre: r[1], year: r[2], rating: r[3],
  status: r[4] ? 'Watched' : 'Want to Watch', image: '', trailer: ''
})
const seed = [...MOVIES.map(make('Movie')), ...DRAMAS.map(make('Drama'))]

let warning = ''

// Loads saved titles; falls back to sample data if nothing is saved, storage is blocked or the data is damaged
function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === null) return seed
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) throw new Error('bad data')
    return data
      .filter((m) => m && typeof m.title === 'string' && m.id)
      .map((m) => ({
        ...m,
        type: m.type === 'Drama' ? 'Drama' : 'Movie',
        year: Number(m.year) || 0,
        rating: Number(m.rating) || 0,
        addedAt: Number(m.addedAt) || 0,
        image: typeof m.image === 'string' ? m.image : '',
        trailer: typeof m.trailer === 'string' ? m.trailer : ''
      }))
  } catch {
    warning = 'Your saved data could not be read, so sample titles were loaded. Changes may not be saved if browser storage is blocked.'
    return seed
  }
}

const state = reactive({ movies: load(), toast: null, warning, lastAddedId: '' })
let timer
let freshTimer

function notify(message, type = 'success') {
  state.toast = { message, type, key: Date.now() }
  clearTimeout(timer)
  timer = setTimeout(() => { state.toast = null }, 3200)
}

// Watcher: every change is saved to localStorage
watch(() => state.movies, () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state.movies))
  } catch {
    state.warning = 'Could not save your changes. Browser storage is full or blocked (private mode?).'
  }
}, { deep: true })

export const store = {
  state,
  notify,
  get: (id) => state.movies.find((m) => m.id === id),
  add(data) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    state.movies.push({ ...data, id, addedAt: Date.now() })
    // Mark as new for a few seconds so the card is easy to spot
    state.lastAddedId = id
    clearTimeout(freshTimer)
    freshTimer = setTimeout(() => { state.lastAddedId = '' }, 5000)
    notify(`Added "${data.title}"`)
    return id
  },
  update(id, data) {
    const i = state.movies.findIndex((m) => m.id === id)
    if (i === -1) return notify('That title no longer exists.', 'error')
    state.movies[i] = { ...state.movies[i], ...data }
    notify(`Saved changes to "${data.title}"`)
  },
  remove(id) {
    const m = store.get(id)
    state.movies = state.movies.filter((x) => x.id !== id)
    if (m) notify(`Deleted "${m.title}"`)
  },
  toggleWatched(id) {
    const m = store.get(id)
    if (!m) return
    if (m.status !== 'Watched' && isUpcoming(m)) return notify(`"${m.title}" is not released yet.`, 'error')
    m.status = m.status === 'Watched' ? 'Want to Watch' : 'Watched'
    notify(m.status === 'Watched' ? `Marked "${m.title}" as watched` : `Moved "${m.title}" back to Want to Watch`)
  }
}

// Dashboard statistics, recalculated from the real data
export const stats = computed(() => {
  const all = state.movies
  const watched = all.filter((m) => m.status === 'Watched').length
  const avg = all.length ? all.reduce((s, m) => s + m.rating, 0) / all.length : 0
  return {
    total: all.length,
    movies: all.filter((m) => m.type === 'Movie').length,
    dramas: all.filter((m) => m.type === 'Drama').length,
    watched,
    wantToWatch: all.length - watched,
    avgRating: avg.toFixed(1)
  }
})
