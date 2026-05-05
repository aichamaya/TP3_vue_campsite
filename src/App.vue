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
        <div class="footer-brand-block">
          <img src="/logo.png" alt="logo" class="footer-logo" />
          <div>
            <span class="footer-brand">CampXplore</span>
            <p class="footer-tagline">Camping, réservation et gestion en ligne.</p>
          </div>
        </div>
        <p class="footer-copy">© 2025 CampXplore — Tous droits réservés.</p>
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
  border-top: 2px solid var(--color-border);
  background: linear-gradient(135deg, #fff8ef 0%, #fdeecf 50%, #fae3b0 100%);
}

.app-footer-inner {
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: 1.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.footer-brand-block {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.footer-brand {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-accent-dark);
}

.footer-tagline {
  font-size: 0.8rem;
  color: var(--color-text-soft);
  margin-top: 0.1rem;
}

.footer-copy {
  font-size: 0.8rem;
  color: var(--color-text-soft);
}

@media (max-width: 640px) {
  .app-main {
    padding: 1.25rem 0.75rem;
  }
}
</style>
