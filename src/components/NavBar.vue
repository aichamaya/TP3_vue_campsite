<template>
  <header class="navbar">
    <nav class="navbar-inner">
      <div class="navbar-left">
        <RouterLink :to="{ name: 'home' }" class="brand">
          <img src="/logo.png" alt="CampXplore logo" class="logo-icon" />
          <div class="brand-text">
            <span class="brand-title">CampXplore</span>
            <span class="slogan">Trouve ton emplacement facilement.</span>
          </div>
        </RouterLink>

        <div class="navbar-links desktop-only">
          <RouterLink
            :to="{ name: 'home' }"
            class="nav-link"
            :class="{ 'nav-link-active': homeActive }"
            >Accueil</RouterLink
          >
          <RouterLink
            :to="{ name: 'campsites' }"
            class="nav-link"
            :class="{ 'nav-link-active': campsitesActive }"
            >Emplacements</RouterLink
          >
          <template v-if="auth.isAuthenticated">
            <RouterLink
              v-if="!auth.isAdmin"
              :to="{ name: 'reservations' }"
              class="nav-link"
              :class="{ 'nav-link-active': reservationsActive }"
              >Mes réservations</RouterLink
            >
            <RouterLink
              v-if="auth.isAdmin"
              :to="{ name: 'admin-reservations' }"
              class="nav-link"
              :class="{ 'nav-link-active': reservationsActive }"
              >Réservations</RouterLink
            >
            <RouterLink
              v-if="auth.isAdmin"
              :to="{ name: 'admin-campsites' }"
              class="nav-link"
              :class="{ 'nav-link-active': adminCampsitesActive }"
              >Gestion emplacements</RouterLink
            >
          </template>
        </div>
      </div>

      <div class="navbar-actions desktop-only">
        <template v-if="auth.isAuthenticated">
          <button @click="handleLogout" class="nav-link nav-button" type="button">
            Déconnexion
          </button>
        </template>
        <template v-else>
          <RouterLink
            :to="{ name: 'login' }"
            class="nav-link"
            :class="{ 'nav-link-active': loginActive }"
            >Connexion</RouterLink
          >
          <RouterLink :to="{ name: 'register' }" class="nav-link nav-link-primary"
            >Inscription</RouterLink
          >
        </template>
      </div>

      <button @click="mobileOpen = !mobileOpen" class="menu-button mobile-only" type="button">
        Menu
      </button>
    </nav>

    <div v-if="mobileOpen" class="mobile-panel mobile-only">
      <RouterLink
        @click="mobileOpen = false"
        :to="{ name: 'home' }"
        class="mobile-link"
        :class="{ 'mobile-link-active': homeActive }"
        >Accueil</RouterLink
      >
      <RouterLink
        @click="mobileOpen = false"
        :to="{ name: 'campsites' }"
        class="mobile-link"
        :class="{ 'mobile-link-active': campsitesActive }"
        >Emplacements</RouterLink
      >

      <template v-if="auth.isAuthenticated">
        <RouterLink
          v-if="!auth.isAdmin"
          @click="mobileOpen = false"
          :to="{ name: 'reservations' }"
          class="mobile-link"
          :class="{ 'mobile-link-active': reservationsActive }"
          >Mes réservations</RouterLink
        >
        <RouterLink
          v-if="auth.isAdmin"
          @click="mobileOpen = false"
          :to="{ name: 'admin-reservations' }"
          class="mobile-link"
          :class="{ 'mobile-link-active': reservationsActive }"
          >Réservations</RouterLink
        >
        <RouterLink
          v-if="auth.isAdmin"
          @click="mobileOpen = false"
          :to="{ name: 'admin-campsites' }"
          class="mobile-link"
          :class="{ 'mobile-link-active': adminCampsitesActive }"
          >Gestion emplacements</RouterLink
        >
        <button @click="handleLogout" class="mobile-link mobile-button" type="button">
          Déconnexion
        </button>
      </template>

      <template v-else>
        <RouterLink
          @click="mobileOpen = false"
          :to="{ name: 'login' }"
          class="mobile-link"
          :class="{ 'mobile-link-active': loginActive }"
          >Connexion</RouterLink
        >
        <RouterLink @click="mobileOpen = false" :to="{ name: 'register' }" class="mobile-link"
          >Inscription</RouterLink
        >
      </template>
    </div>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const mobileOpen = ref(false)

const homeActive = computed(() => route.name === 'home')
const campsitesActive = computed(
  () => route.name === 'campsites' || route.name === 'campsite-detail',
)
const reservationsActive = computed(
  () => route.name === 'reservations' || route.name === 'reservation-detail',
)
const adminCampsitesActive = computed(() => route.name === 'admin-campsites')
const profileActive = computed(() => route.name === 'profile')
const loginActive = computed(() => route.name === 'login')

const userName = computed(() => {
  const firstName = auth.user?.firstName || ''
  const lastName = auth.user?.lastName || ''
  return `${firstName} ${lastName}`.trim() || 'Profil'
})

function handleLogout() {
  auth.logout()
  mobileOpen.value = false
  router.push({ name: 'home' })
}
</script>
<style scoped>
.navbar {
  background: linear-gradient(180deg, #fffdf9 0%, #fff3df 100%);
  border-bottom: 1px solid var(--color-border);
}

.navbar-inner {
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.brand-text {
  display: grid;
  gap: 0.1rem;
}

.brand-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-accent-dark);
}

.slogan {
  font-size: 0.82rem;
  color: var(--color-text-soft);
}

.navbar-links,
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link {
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  font-weight: 600;
  color: var(--color-text);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.nav-link-active {
  background: var(--color-accent-soft);
  color: var(--color-accent-dark);
}

.nav-link:hover,
.nav-button:hover,
.mobile-link:hover {
  background: #fff1d6;
}

.nav-link-primary {
  background: var(--color-accent);
  color: #000000;
}

.nav-link-primary:hover {
  background: var(--color-accent-dark);
}

.nav-button {
  border: none;
  background: transparent;
}

.admin-menu {
  position: relative;
}

.admin-menu-list {
  position: absolute;
  right: 0;
  top: calc(100% + 0.35rem);
  z-index: 10;
  display: none;
  min-width: 180px;
  padding: 0.4rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: #fffdf9;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
}

.admin-menu:hover .admin-menu-list,
.admin-menu:focus-within .admin-menu-list {
  display: grid;
}

.admin-link {
  padding: 0.65rem 0.75rem;
  border-radius: 0.55rem;
  color: var(--color-text);
  font-weight: 600;
}

.admin-link:hover {
  background: #fff1d6;
}

.menu-button {
  border: 1px solid var(--color-border);
  background: #fffdf9;
  border-radius: 0.5rem;
  padding: 0.5rem 0.85rem;
  color: var(--color-text);
  font-weight: 600;
}

.mobile-panel {
  border-top: 1px solid var(--color-border);
  background: #fffdf9;
  padding: 0.5rem 1rem 1rem;
}

.mobile-link {
  display: block;
  width: 100%;
  padding: 0.75rem 0.5rem;
  border-radius: 0.5rem;
  color: var(--color-text);
  font-weight: 600;
}

.mobile-link-active {
  background: var(--color-accent-soft);
  color: var(--color-accent-dark);
}

.mobile-button {
  border: none;
  background: transparent;
  text-align: left;
}

.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  .navbar-left {
    gap: 1rem;
  }

  .brand-text {
    display: none;
  }
}
</style>
