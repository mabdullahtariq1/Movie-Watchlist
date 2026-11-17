export const TYPES = ['Movie', 'Drama']
export const GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller']
export const STATUSES = ['Want to Watch', 'Watched']
export const SORTS = [
  { value: 'added-desc', label: 'Recently added' },
  { value: 'rating-desc', label: 'Rating: high to low' },
  { value: 'rating-asc', label: 'Rating: low to high' },
  { value: 'year-desc', label: 'Newest release' },
  { value: 'year-asc', label: 'Oldest release' },
  { value: 'title-asc', label: 'Title: A to Z' },
  { value: 'title-desc', label: 'Title: Z to A' }
]
export const PAGE_SIZE = 15

export const MOBILE_PAGE_SIZE = 16 // 2 columns on phones, so 16 fills every row

// A title is upcoming when its release year is later than the current year
export const isUpcoming = (m) => Number(m.year) > new Date().getFullYear()

// Extracts the 11-character video id from a YouTube link ('' if it is not one)
export function youtubeId(url) {
  if (!url) return ''
  const m = String(url).trim().match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/)
  return m ? m[1] : ''
}

// ---- Formatting helpers for TMDB data ----
export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
export const formatMoney = (n) => (n > 0
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n)
  : '')
export const formatCount = (n) => (n > 0 ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n) : '')
export function formatRuntime(min) {
  if (!min) return ''
  const h = Math.floor(min / 60)
  const m = min % 60
  return h ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`
}
