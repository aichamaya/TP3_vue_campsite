<template>
  <div class="campsites-view">
    <section class="filters-section">
      <div class="section-head">
        <span class="section-kicker">Emplacements</span>
        <h1>Liste des emplacements</h1>
        <p>
          Filtre par type et consulte les disponibilites si tu arrives depuis la recherche de
          l'accueil.
        </p>
      </div>

      <div class="filters-grid">
        <label class="field-group">
          <span>Type</span>
          <select v-model="filters.type">
            <option value="">Tous les types</option>
            <option value="tente">Tente</option>
            <option value="rv">VR</option>
            <option value="chalet">Chalet</option>
            <option value="glamping">Glamping</option>
            <option value="arrière-pays">Arriere-pays</option>
            <option value="autre">Autre</option>
          </select>
        </label>

        <label class="field-group">
          <span>Date de depart</span>
          <input v-model="filters.startDate" type="date" :disabled="!hasAvailabilitySearch" />
        </label>

        <label class="field-group">
          <span>Date de fin</span>
          <input v-model="filters.endDate" type="date" :disabled="!hasAvailabilitySearch" />
        </label>

        <label class="field-group">
          <span>Personnes</span>
          <input
            v-model.number="filters.guests"
            type="number"
            min="1"
            :disabled="!hasAvailabilitySearch"
          />
        </label>

        <button type="button" class="secondary-button" @click="resetFilters">Reinitialiser</button>
      </div>
    </section>

    <section class="results-section">
      <div class="results-head">
        <p>
          <strong>{{ campsitesStore.campsites.length }}</strong>
          emplacement{{ campsitesStore.campsites.length > 1 ? 's' : '' }} affiche{{
            campsitesStore.campsites.length > 1 ? 's' : ''
          }}
        </p>
      </div>

      <AlertMessage
        v-if="campsitesStore.error"
        type="error"
        :message="campsitesStore.error"
        @close="campsitesStore.error = ''"
      />

      <p v-if="campsitesStore.loading" class="status-text">Chargement des emplacements...</p>

      <div v-else-if="campsitesStore.campsites.length" class="results-grid">
        <CampsiteCard v-for="item in campsitesStore.campsites" :key="item._id" :campsite="item" />
      </div>

      <div v-else class="empty-state">
        <h2>Aucun emplacement trouve</h2>
        <p>Essaie un autre type ou retire les filtres pour afficher davantage de resultats.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AlertMessage from '@/components/AlertMessage.vue'
import CampsiteCard from '@/components/CampsiteCard.vue'
import { useCampsitesStore } from '@/stores/campsites'

const route = useRoute()
const router = useRouter()
const campsitesStore = useCampsitesStore()

const filters = ref({
  type: '',
  startDate: '',
  endDate: '',
  guests: 1,
})

const hasAvailabilitySearch = computed(() => !!filters.value.startDate && !!filters.value.endDate)

function syncFiltersFromRoute() {
  filters.value = {
    type: typeof route.query.type === 'string' ? route.query.type : '',
    startDate: typeof route.query.startDate === 'string' ? route.query.startDate : '',
    endDate: typeof route.query.endDate === 'string' ? route.query.endDate : '',
    guests: Number(route.query.guests) > 0 ? Number(route.query.guests) : 1,
  }
}

async function loadCampsites() {
  if (hasAvailabilitySearch.value) {
    await campsitesStore.fetchAvailableCampsites({
      startDate: filters.value.startDate,
      endDate: filters.value.endDate,
      guests: filters.value.guests,
      type: filters.value.type || undefined,
    })
    return
  }

  await campsitesStore.fetchCampsites({
    type: filters.value.type || undefined,
  })
}

function updateRouteQuery() {
  router.replace({
    name: 'campsites',
    query: {
      type: filters.value.type || undefined,
      startDate: filters.value.startDate || undefined,
      endDate: filters.value.endDate || undefined,
      guests: hasAvailabilitySearch.value ? filters.value.guests : undefined,
    },
  })
}

function resetFilters() {
  filters.value = {
    type: '',
    startDate: '',
    endDate: '',
    guests: 1,
  }
  updateRouteQuery()
}

onMounted(async () => {
  syncFiltersFromRoute()
  await loadCampsites()
})

watch(
  () => route.query,
  async () => {
    syncFiltersFromRoute()
    await loadCampsites()
  },
)

watch(
  () => filters.value.type,
  () => {
    updateRouteQuery()
  },
)
</script>
<style scoped>
.campsites-view {
  display: grid;
  gap: 1.5rem;
}

.filters-section,
.results-section {
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
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

.section-head h1 {
  margin-top: 0.75rem;
  color: var(--color-text);
}

.section-head p {
  margin-top: 0.5rem;
  color: var(--color-text-soft);
}

.filters-grid {
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

.field-group input:disabled {
  background: #f6ead8;
  color: #7b8794;
}

.secondary-button {
  min-height: 3rem;
  align-self: end;
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 999px;
  background: var(--color-accent-soft);
  color: var(--color-accent-dark);
  font-weight: 700;
}

.results-head {
  margin-bottom: 1rem;
  color: var(--color-text-soft);
}

.results-head strong {
  color: var(--color-text);
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.status-text,
.empty-state {
  color: var(--color-text-soft);
}

.empty-state {
  padding: 1rem 0;
}

.empty-state h2 {
  color: var(--color-text);
}

@media (max-width: 1000px) {
  .filters-grid,
  .results-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .filters-section,
  .results-section {
    padding: 1.2rem;
  }
}
</style>
