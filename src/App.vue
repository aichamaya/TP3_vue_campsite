<template>
  <div class="app-shell">
    <NavBar />

    <main class="app-main">
      <div class="app-content">
        <RouterView />
      </div>
    </main>

    <footer class="app-footer">
      <div class="app-footer-inner">
        <span class="footer-brand">CampXplore</span>
        <p class="footer-copy">Camping, reservation et gestion en ligne.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NavBar from './components/NavBar.vue'

const auth = useAuthStore()

onMounted(() => {
  auth.initialize()
})
</script>



<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #fff8ef 0%, #fffdf9 100%);
}

.app-main {
  flex: 1;
  width: 100%;
  padding: 2rem 1rem;
}

.app-content {
  width: min(100%, 1200px);
  margin: 0 auto;
}

.app-footer {
  border-top: 1px solid var(--color-border);
  background: linear-gradient(180deg, #fffdf9 0%, #fff3df 100%);
}

.app-footer-inner {
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: 1.25rem 1rem;
  display: grid;
  gap: 0.35rem;
}

.footer-brand {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-accent-dark);
}

.footer-copy {
  color: var(--color-text-soft);
}

@media (max-width: 640px) {
  .app-main {
    padding: 1.25rem 0.75rem;
  }
}
</style>
