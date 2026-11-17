<script setup>
defineProps({ cast: { type: Array, required: true } })

const initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
</script>

<template>
  <section class="cast" aria-label="Top cast">
    <h2>Top cast</h2>
    <div class="cast-row">
      <article v-for="(c, i) in cast" :key="c.id" class="cast-card" :style="{ '--i': i }">
        <div class="cast-photo">
          <span class="ini">{{ initials(c.name) }}</span>
          <img v-if="c.photo" :src="c.photo" :alt="c.name" loading="lazy" @error="$event.target.style.display = 'none'" />
        </div>
        <strong>{{ c.name }}</strong>
        <small>{{ c.character }}</small>
      </article>
    </div>
  </section>
</template>
