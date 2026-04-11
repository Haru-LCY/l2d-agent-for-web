<script setup lang="ts">
import Oml2d from './components/Oml2d.vue'
</script>

<template>
  <main class="page-shell">
    <div class="hero-card">
      <Oml2d />
    </div>
  </main>
</template>

<style scoped>
.page-shell {
  min-height: 100vh;
  padding: 2rem;
  background: radial-gradient(circle at top left, rgba(15, 118, 110, 0.22), transparent 36%),
    radial-gradient(circle at bottom right, rgba(14, 116, 144, 0.18), transparent 28%),
    linear-gradient(180deg, #f8fafc 0%, #eef6ff 100%);
}

.hero-card {
  max-width: 1240px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 32px;
  background: rgba(241, 245, 249, 0.72);
  backdrop-filter: blur(16px);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
}

@media (max-width: 960px) {
  .page-shell {
    padding: 1rem;
  }

  .hero-card {
    padding: 1.1rem;
    border-radius: 24px;
  }
}
</style>
