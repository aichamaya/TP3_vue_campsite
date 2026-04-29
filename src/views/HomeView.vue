<template>
  <div class="home-view">
    <section class="hero">
      <img src="/hero.png" alt="CampXplore" class="hero-image" />
    </section>

    <section class="search-section">
      <div class="section-head">
        <span class="section-kicker">Accueil</span>
        <h1>Recherche de disponibilite</h1>
        <p>
          Choisis tes dates, le nombre de personnes et un type pour verifier les emplacements
          disponibles.
        </p>
      </div>

      <AlertMessage v-if="localError" type="error" :message="localError" @close="localError = ''" />

      <form class="search-form" novalidate @submit.prevent="handleSearch">
        <label class="field-group">
          <span>Date d'arrivee</span>
          <input v-model="form.startDate" type="date" />
          <small v-if="errors.startDate" class="field-error">{{ errors.startDate }}</small>
        </label>

        <label class="field-group">
          <span>Date de depart</span>
          <input v-model="form.endDate" type="date" />
          <small v-if="errors.endDate" class="field-error">{{ errors.endDate }}</small>
        </label>

        <label class="field-group">
          <span>Nombre de personnes</span>
          <input v-model.number="form.guests" type="number" />
        </label>

        <label class="field-group">
          <span>Type</span>
          <select v-model="form.type">
            <option value="">Tous les types</option>
            <option value="tente">Tente</option>
            <option value="rv">VR</option>
            <option value="chalet">Chalet</option>
            <option value="glamping">Glamping</option>
            <option value="arrière-pays">Arriere-pays</option>
            <option value="autre">Autre</option>
          </select>
        </label>

        <button type="submit" class="primary-button" :disabled="campsitesStore.loading">
          {{ campsitesStore.loading ? 'Recherche...' : 'Rechercher' }}
        </button>
      </form>
    </section>

    <section v-if="hasSearched" class="results-section">
      <div class="results-head">
        <div>
          <h2>
            {{ campsitesStore.campsites.length }} emplacement{{
              campsitesStore.campsites.length > 1 ? 's' : ''
            }}
            trouve{{ campsitesStore.campsites.length > 1 ? 's' : '' }}
          </h2>
          <p v-if="campsitesStore.campsites.length">Voici un apercu des disponibilites trouvees.</p>
          <p v-else>Aucun emplacement disponible pour les criteres choisis.</p>
        </div>

        <button
          v-if="campsitesStore.campsites.length"
          type="button"
          class="secondary-button"
          @click="openResultsPage"
        >
          Voir la liste complete
        </button>
      </div>

      <div v-if="previewCampsites.length" class="results-grid">
        <CampsiteCard v-for="item in previewCampsites" :key="item._id" :campsite="item" />
      </div>
    </section>

    <section v-else class="home-note">
      <h2>Commence par une recherche</h2>
      <p>La liste des emplacements disponibles apparaitra ici apres avoir choisi tes criteres.</p>
      <RouterLink :to="{ name: 'campsites' }" class="secondary-button"
        >Voir tous les emplacements</RouterLink
      >
    </section>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AlertMessage from '@/components/AlertMessage.vue'
import CampsiteCard from '@/components/CampsiteCard.vue'
import { useCampsitesStore } from '@/stores/campsites'

const router = useRouter()
const campsitesStore = useCampsitesStore()

const form = ref({
  startDate: '',
  endDate: '',
  guests: 1,
  type: '',
})

const hasSearched = ref(false)
const localError = ref('')
const errors = ref({})

const previewCampsites = computed(() => campsitesStore.campsites.slice(0, 6))

async function handleSearch() {
  localError.value = ''
  errors.value = {}

  if (!form.value.startDate || !form.value.endDate) {
    if (!form.value.startDate) errors.value.startDate = "La date d'arrivee est requise."
    if (!form.value.endDate) errors.value.endDate = 'La date de depart est requise.'
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = form.value.startDate ? new Date(form.value.startDate) : null
  const end = form.value.endDate ? new Date(form.value.endDate) : null

  if (start && start < today)
    errors.value.startDate = "La date d'arrivee ne peut pas etre dans le passe."
  if (start && end && end <= start)
    errors.value.endDate = "La date de depart doit etre apres la date d'arrivee."

  if (Object.keys(errors.value).length) {
    localError.value = 'Corrige les champs en erreur.'
    return
  }

  hasSearched.value = true

  try {
    await campsitesStore.fetchAvailableCampsites({
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      guests: form.value.guests,
      type: form.value.type || undefined,
    })
  } catch {
    localError.value = campsitesStore.error
  }
}

function openResultsPage() {
  router.push({
    name: 'campsites',
    query: {
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      guests: form.value.guests,
      type: form.value.type || undefined,
    },
  })
}
</script>
<style scoped>
.home-view {
  display: grid;
  gap: 1.5rem;
}

.hero,
.search-section,
.results-section,
.home-note {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 1.5rem;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  max-height: 360px;
  object-fit: cover;
}

.search-section,
.results-section,
.home-note {
  padding: 1.5rem;
}

.section-kicker {
  display: inline-flex;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: var(--color-accent-soft);
  color: var(--color-accent-dark);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-head h1,
.results-head h2,
.home-note h2 {
  margin-top: 0.75rem;
  color: var(--color-text);
}

.section-head p,
.results-head p,
.home-note p {
  margin-top: 0.5rem;
  color: var(--color-text-soft);
}

.search-form {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
  gap: 1rem;
  margin-top: 1.5rem;
}

.field-group {
  display: grid;
  gap: 0.45rem;
}

.field-group span {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-text);
}

.field-group input,
.field-group select {
  min-height: 3rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.9rem;
  background: #fffdf9;
}

.field-error {
  color: #b91c1c;
  font-weight: 700;
}

.primary-button,
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 999px;
  font-weight: 700;
}

.primary-button {
  background: var(--color-accent);
  color: #ffffff;
}

.secondary-button {
  background: var(--color-accent-soft);
  color: var(--color-accent-dark);
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.results-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.home-note {
  display: grid;
  justify-items: start;
  gap: 0.75rem;
}

@media (max-width: 1000px) {
  .search-form,
  .results-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .search-section,
  .results-section,
  .home-note {
    padding: 1.2rem;
  }

  .results-head {
    flex-direction: column;
  }
}
</style>
