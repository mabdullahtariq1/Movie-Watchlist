
<!-- HOW to get online URL
ngrok http 5173 -->


# CineList - Movie Watchlist

A frontend-only Vue.js web app for tracking the movies and TV dramas you want to watch or have already watched.

Built for the CM Intern Assignment, Project 5: Movie Watchlist.
Author: Muhammad Abdullah Tariq

## Project description

CineList has a cinematic, streaming-style interface with a dark/light theme toggle. You can add, edit and delete movies and dramas, search and filter your list, sort it, mark titles as watched, and open a details page for any title. All data lives in the browser (`localStorage`), so no backend or database is needed.

Real posters, trailers and extra details come from the free TMDB API. This part is an **optional extra**: without a key the app works fully and shows generated poster artwork instead.

## Features

### Assignment requirements
- **Add, edit and delete** titles. A confirmation dialog appears before deleting.
- **View details** on a separate page for every title.
- **Search** by title in the header search bar. Results update as you type (press `/` to jump to the search box).
- **Filter** by genre and by watch status (plus an extra filter for type: movie or drama).
- **Sort** by rating or release year (plus recently added and title A to Z / Z to A).
- **Mark as watched** or move a title back to "Want to Watch".
- **Dashboard statistics**, calculated from the real data: total titles, movies, dramas, watched, want to watch and average rating.
- **localStorage persistence**: new, edited and deleted titles are saved, loaded on start and kept after a refresh. Sample data appears on the first launch.
- **Form validation** with clear messages (see Error handling).
- **Responsive layout** for desktop, tablet and mobile.
- **User experience**: empty states, success and error toasts, clear labels and spacing.

### Extra features
- 22 sample movies and 12 sample dramas on first launch.
- **Pagination**: 15 titles per page (16 on phones, so the 2-column grid has full rows). It returns to page 1 when you search or filter.
- Featured **hero slider** with the top 5 best-rated titles you still want to watch. It changes every 6 seconds and pauses on hover.
- Newly added titles appear first, with a "New" badge. Titles with a future release year get an "Upcoming" tag and cannot be marked as watched.
- **Details page**: backdrop, animated rating ring, playable trailer, synopsis with View more / View less, runtime or seasons, languages, countries, budget and box office, director or creator, studio or network, TMDB score, top cast with photos, and links to IMDb and TMDB.
- Custom animated dropdowns, count-up statistics, staggered card entrance, page transitions and scroll reveal. All animations respect the "reduce motion" setting.
- Dark and light theme toggle. The choice is remembered and follows your system theme on the first visit.

## Technologies used

- Vue 3 (Composition API, `<script setup>`)
- Vue Router 4 (hash history)
- Vite
- Plain CSS with theme variables
- Browser `localStorage`
- TMDB API and YouTube embedded player (optional extras)

**Vue concepts demonstrated:** components, props, events, `v-model` and `defineModel`, `v-for`, `v-if` / `v-else`, reactive state, computed properties, methods, watchers, lifecycle hooks (`onMounted`, `onUnmounted`), conditional rendering, form handling, transitions and a custom directive (`v-reveal`).

## Project structure

```
src/
  components/
    AppHeader, SearchBar, HeroCarousel, DashboardStats, AnimatedNumber,
    FilterBar, DropdownSelect, MovieCard, PosterArt, PaginationBar,
    MovieForm, ConfirmDialog, EmptyState, ToastMessage,
    RatingRing, TrailerPlayer, InfoCard, ExpandableText, CastRow
  views/
    Dashboard.vue      home page: hero, statistics, filters, movie grid
    Details.vue        details page: trailer, info card, cast
  router/
    index.js           routes (hash history)
  store/
    movieStore.js      titles, sample data, localStorage, statistics, toasts
    posters.js         optional TMDB lookups (poster, trailer, details)
    search.js          shared search text
    theme.js           dark/light theme
  utils.js             genres, statuses, sort options, helpers
  style.css            global styles and light/dark themes
  App.vue, main.js
```

## Installation steps

1. Install [Node.js](https://nodejs.org) 18 or newer.
2. Open a terminal in the project folder.
3. Run `npm install`.

## How to run the project

- **Development:** `npm run dev`, then open the address shown (usually http://localhost:5173).
- **Production build:** `npm run build` (creates the `dist` folder).
- **Preview the build:** `npm run preview`.

## Optional: real posters, trailers and details (TMDB)

1. Create a free account at https://www.themoviedb.org, then open Settings > API and request a Developer key. Use the value called **API Key** (the short one, not the Read Access Token).
2. In the project root (next to `package.json`), create a file named exactly `.env` with this single line, with no quotes:
   ```
   VITE_TMDB_API_KEY=your_key_here
   ```
3. Restart `npm run dev`.

Results are cached in the browser. If TMDB has no poster or trailer for a title, the app shows generated artwork, or a "Search on YouTube" link for the trailer.

You can also paste your own **poster image link** or **YouTube trailer link** when adding or editing a title. Titles with their own links do not need TMDB.

Keep `.env` private: do not upload it or share it. It is already listed in `.gitignore`.

## Put it online

Run `npm run build`, then publish the `dist` folder on any static host:

- **Netlify:** drag and drop the `dist` folder at https://app.netlify.com/drop. Build it on your computer with `.env` present if you want posters and trailers online.
- **Vercel:** import the repository, build command `npm run build`, output directory `dist`, and add `VITE_TMDB_API_KEY` as an environment variable.
- **GitHub Pages:** push the contents of `dist` to a `gh-pages` branch and enable Pages.

The app uses hash routing and relative asset paths, so it works on all of these without extra settings. Note that a key used in a frontend app is visible in the built files. TMDB keys are free and read-only, but do not reuse a key that matters elsewhere.

## Data and storage

- Titles are saved in `localStorage` under `cinelist.titles.v2`. TMDB results are cached under `cinelist.tmdb.v2`, and the theme under `theme`.
- To reset the app to its sample data, clear the site data in your browser (F12 > Application > Local Storage).

## Error handling

- **Form validation:** empty title, title over 100 characters, duplicate title, invalid or out-of-range year, rating outside 0 to 10, "Watched" on an unreleased title, invalid poster link, invalid YouTube link.
- **Storage problems:** damaged or unreadable saved data falls back to the sample data with a warning banner. A full or blocked storage shows a banner instead of crashing.
- **Navigation:** unknown addresses go back to the home page. A missing title shows a "Title not found" page.
- **Empty states:** an empty list and a search with no matches each show a message with an action button.
- **Images and TMDB:** broken posters, backdrops and cast photos fall back to generated artwork or initials. Failed TMDB or trailer requests never break the page.
- **Unexpected errors:** a friendly toast message appears instead of a broken screen.

## Screenshots

Save the screenshots in the `screenshots/` folder with these names:

| Screen | File |
|---|---|
| Dashboard (dark) | `screenshots/dashboard.png` |
| Dashboard (light theme) | `screenshots/dashboard-light.png` |
| Add / edit form | `screenshots/form.png` |
| Details page with trailer | `screenshots/details.png` |
| Delete confirmation | `screenshots/delete.png` |
| Mobile view | `screenshots/mobile.png` |

![Dashboard](screenshots/dashboard.png)
![Dashboard, light theme](screenshots/dashboard-light.png)
![Add or edit form](screenshots/form.png)
![Details page](screenshots/details.png)
![Delete confirmation](screenshots/delete.png)
![Mobile view](screenshots/mobile.png)

## Credits

This product uses the TMDB API but is not endorsed or certified by TMDB.
