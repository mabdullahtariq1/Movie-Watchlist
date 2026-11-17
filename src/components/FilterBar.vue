<script setup>
import { computed } from 'vue'
import { STATUSES, SORTS } from '../utils.js'
import DropdownSelect from './DropdownSelect.vue'

const props = defineProps({ genres: { type: Array, default: () => [] } })
const type = defineModel('type', { type: String, default: '' })
const genre = defineModel('genre', { type: String, default: '' })
const status = defineModel('status', { type: String, default: '' })
const sort = defineModel('sort', { type: String, default: 'added-desc' })

const typeOptions = [
  { value: '', label: 'Movies and dramas' },
  { value: 'Movie', label: 'Movies only' },
  { value: 'Drama', label: 'Dramas only' }
]
const genreOptions = computed(() => [{ value: '', label: 'All genres' }, ...props.genres.map((g) => ({ value: g, label: g }))])
const statusOptions = [{ value: '', label: 'All statuses' }, ...STATUSES.map((s) => ({ value: s, label: s }))]
</script>

<template>
  <div class="filters">
    <DropdownSelect v-model="type" :options="typeOptions" label="Type" />
    <DropdownSelect v-model="genre" :options="genreOptions" label="Genre" />
    <DropdownSelect v-model="status" :options="statusOptions" label="Status" />
    <DropdownSelect v-model="sort" :options="SORTS" label="Sort by" />
  </div>
</template>
