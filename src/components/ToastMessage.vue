<script setup>
import { store } from '../store/movieStore.js'
</script>

<template>
  <Transition name="toast">
    <div v-if="store.state.toast" :key="store.state.toast.key" class="toast" :class="store.state.toast.type" role="status" aria-live="polite">
      {{ store.state.toast.message }}
    </div>
  </Transition>
</template>
