import { store } from './movieStore.js'

// Real posters and trailers from The Movie Database (TMDB). Needs a free API key in .env (see README).
const KEY = 'cinelist.tmdb.v2'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
export const posterEnabled = Boolean(API_KEY)

let cache = {}
try { cache = JSON.parse(localStorage.getItem(KEY)) || {} } catch { cache = {} }
const pending = new Map()
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cache)) } catch { /* cache is optional */ } }
const kindOf = (type) => (type === 'Drama' ? 'tv' : 'movie')

async function api(path, params = '') {
  const res = await fetch(`https://api.themoviedb.org/3/${path}?api_key=${API_KEY}${params}`)
  if (!res.ok) throw new Error(`TMDB ${res.status}`)
  return res.json()
}

async function search(kind, title, year) {
  const yearParam = kind === 'tv' ? 'first_air_date_year' : 'year'
  // Try with the release year first, then without it
  for (const extra of [year ? `&${yearParam}=${year}` : '', '']) {
    const data = await api(`search/${kind}`, `&query=${encodeURIComponent(title)}${extra}`)
    const hit = (data.results || []).find((x) => x.poster_path)
    if (hit) return { id: hit.id, poster: `https://image.tmdb.org/t/p/w500${hit.poster_path}` }
    if (!extra) break
  }
  return { id: null, poster: '' }
}

function warn(err) {
  console.warn('TMDB lookup failed:', err)
  if (import.meta.env.DEV && !store.state.warning) {
    store.state.warning = 'Posters could not be loaded from TMDB. Check that VITE_TMDB_API_KEY in .env is the v3 "API Key" and that your internet can reach themoviedb.org.'
  }
}

// Returns { id, poster } (empty values if not found or the request failed). Found results are cached.
export function getInfo(title, type, year) {
  const empty = { id: null, poster: '' }
  if (!posterEnabled) return Promise.resolve(empty)
  const k = `${type}|${title}|${year}`.toLowerCase()
  if (k in cache) return Promise.resolve(cache[k])
  if (pending.has(k)) return pending.get(k)
  const p = search(kindOf(type), title, year)
    .then((info) => { cache[k] = info; save(); return info })
    .catch((err) => { warn(err); return empty })
    .finally(() => pending.delete(k))
  pending.set(k, p)
  return p
}

export const getPoster = (title, type, year) => getInfo(title, type, year).then((i) => i.poster)

// Returns a YouTube video key for the best trailer, or ''
export async function getTrailer(id, type) {
  if (!posterEnabled || !id) return ''
  const k = `trailer|${type}|${id}`
  if (k in cache) return cache[k]
  try {
    const data = await api(`${kindOf(type)}/${id}/videos`)
    const vids = (data.results || []).filter((v) => v.site === 'YouTube')
    const pick = vids.find((v) => v.type === 'Trailer' && v.official) || vids.find((v) => v.type === 'Trailer') || vids.find((v) => v.type === 'Teaser') || vids[0]
    cache[k] = pick ? pick.key : ''
    save()
    return cache[k]
  } catch (err) {
    console.warn('Trailer lookup failed:', err)
    return ''
  }
}

// ---- Full title details (one request: details + credits + external ids) ----
const IMG = 'https://image.tmdb.org/t/p'
const names = (arr, max = 99) => (Array.isArray(arr) ? arr : []).map((x) => x && x.name).filter(Boolean).slice(0, max)

function displayName(type, code) {
  try { return new Intl.DisplayNames(['en'], { type }).of(code) || code } catch { return code }
}

// Turns TMDB's large response into a small, safe object. Every field has a fallback.
function normalizeDetails(d, kind) {
  const spoken = (Array.isArray(d.spoken_languages) ? d.spoken_languages : []).map((x) => x && x.english_name).filter(Boolean)
  const origin = Array.isArray(d.origin_country) ? d.origin_country.map((c) => displayName('region', c)) : []
  const crew = (d.credits && Array.isArray(d.credits.crew)) ? d.credits.crew : []
  const cast = (d.credits && Array.isArray(d.credits.cast)) ? d.credits.cast : []
  return {
    overview: d.overview || '',
    tagline: d.tagline || '',
    releaseDate: d.release_date || d.first_air_date || '',
    status: d.status || '',
    runtime: d.runtime || (Array.isArray(d.episode_run_time) && d.episode_run_time[0]) || 0,
    seasons: d.number_of_seasons || 0,
    episodes: d.number_of_episodes || 0,
    languages: spoken.length ? spoken : (d.original_language ? [displayName('language', d.original_language)] : []),
    countries: names(d.production_countries).length ? names(d.production_countries) : origin,
    genres: names(d.genres),
    budget: d.budget || 0,
    revenue: d.revenue || 0,
    tmdbScore: d.vote_average || 0,
    votes: d.vote_count || 0,
    companies: names(d.production_companies, 3),
    networks: names(d.networks, 3),
    createdBy: names(d.created_by, 3),
    director: crew.filter((c) => c.job === 'Director').map((c) => c.name).slice(0, 2),
    cast: cast.slice(0, 10).map((c) => ({
      id: c.id, name: c.name || '', character: c.character || '',
      photo: c.profile_path ? `${IMG}/w185${c.profile_path}` : ''
    })),
    backdrop: d.backdrop_path ? `${IMG}/w1280${d.backdrop_path}` : '',
    homepage: /^https?:\/\//.test(d.homepage || '') ? d.homepage : '',
    imdbId: d.imdb_id || (d.external_ids && d.external_ids.imdb_id) || '',
    tmdbUrl: d.id ? `https://www.themoviedb.org/${kind}/${d.id}` : ''
  }
}

export async function getDetails(id, type) {
  if (!posterEnabled || !id) return null
  const k = `details2|${type}|${id}`
  if (k in cache) return cache[k]
  try {
    const kind = kindOf(type)
    const out = normalizeDetails(await api(`${kind}/${id}`, '&append_to_response=credits,external_ids'), kind)
    cache[k] = out
    save()
    return out
  } catch (err) {
    console.warn('Details lookup failed:', err)
    return null
  }
}
