<script setup>
import { onMounted, onUnmounted } from 'vue'

defineProps({
  title: { type: String, default: 'Are you sure?' },
  message: { type: String, default: '' }
})
const emit = defineEmits(['confirm', 'cancel'])

const onKey = (e) => { if (e.key === 'Escape') emit('cancel') }
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="backdrop" @click.self="emit('cancel')">
    <div class="modal small" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
      <h2 id="confirm-title">{{ title }}</h2>
      <p class="muted">{{ message }}</p>
      <div class="modal-actions">
        <button class="btn" @click="emit('cancel')">Keep it</button>
        <button class="btn danger" @click="emit('confirm')">Delete</button>
      </div>
    </div>
  </div>
</template>
