<script setup>
defineProps({
  title: { type: String, required: true },
  text: { type: String, default: '' }
})
</script>

<template>
  <div class="empty">
    <div class="empty-icon" aria-hidden="true">&#127916;</div>
    <h3>{{ title }}</h3>
    <p v-if="text" class="muted">{{ text }}</p>
    <div class="empty-actions"><slot /></div>
  </div>
</template>
