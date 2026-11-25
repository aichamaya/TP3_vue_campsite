<template>
  <section class="space-y-6">
    <div class="relative rounded-2xl overflow-hidden shadow">
      <img src="/hero.png" class="w-full h-[420px] object-cover object-center" />

      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
      ></div>

      <div class="absolute bottom-6 left-6">
        <button
          @click="router.push({ name: 'campsites' })"
          class="bg-orange-500 hover:bg-orange-600 transition-colors text-white font-semibold px-8 py-3 rounded-full shadow-lg"
        >
          Voir les emplacements
        </button>
      </div>
    </div>

    <div class="mt-4 bg-white p-4 rounded-xl shadow">
      <form
        @submit.prevent="handleSearch"
        novalidate
        class="flex flex-col md:flex-row gap-3 items-start"
      >
        <div class="w-full">
          <input v-model="form.startDate" type="date" class="border p-2 rounded w-full" />
          <small v-if="errors.startDate" class="text-red-600 text-xs">{{ errors.startDate }}</small>
        </div>

        <div class="w-full">
          <input v-model="form.endDate" type="date" class="border p-2 rounded w-full" />
          <small v-if="errors.endDate" class="text-red-600 text-xs">{{ errors.endDate }}</small>
        </div>

        <input v-model="form.guests" type="number" min="1" class="border p-2 rounded w-full" />

        <select v-model="form.type" class="border p-2 rounded w-full">
          <option value="">Tous</option>
          <option value="tente">Tente</option>
          <option value="vr">VR</option>
          <option value="chalet">Chalet</option>
          <option value="glamping">Glamping</option>
          <option value="arrière-pays">Arrière-pays</option>
        </select>

        <button
          class="bg-orange-500 text-white px-4 py-2 rounded w-full md:w-auto whitespace-nowrap"
        >
          Rechercher
        </button>
      </form>
    </div>

    <div v-if="searched">
      <p class="mt-6 mb-3 font-semibold">
        {{ results.length }} emplacement{{ results.length === 1 ? '' : 's' }}
        disponible{{ results.length === 1 ? '' : 's' }}
      </p>

      <div v-if="results.length" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CampsiteCard v-for="c in results" :key="c._id" :campsite="c" />
      </div>

      <p v-else class="bg-orange-100 text-orange-700 p-3 rounded">
        Aucun emplacement disponible pour ces critères.
      </p>
    </div>
  </section>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCampsitesStore } from '@/stores/campsites'
import CampsiteCard from '@/components/CampsiteCard.vue'

const router = useRouter()
const campsitesStore = useCampsitesStore()

const form = ref({
  startDate: '',
  endDate: '',
  guests: 1,
  type: '',
})

const results = computed(() => campsitesStore.campsites)
const errors = ref({})
const searched = ref(false)

async function handleSearch() {
  errors.value = {}

  const today = new Date().toISOString().slice(0, 10)

  if (!form.value.startDate) {
    errors.value.startDate = "La date d'arrivée est requise."
  } else if (form.value.startDate < today) {
    errors.value.startDate = "La date d'arrivée ne peut pas être dans le passé."
  }

  if (!form.value.endDate) {
    errors.value.endDate = 'La date de départ est requise.'
  } else if (form.value.endDate <= form.value.startDate) {
    errors.value.endDate = "La date de départ doit être après la date d'arrivée."
  }

  if (Object.keys(errors.value).length) return

  await campsitesStore.fetchAvailableCampsites({
    startDate: form.value.startDate,
    endDate: form.value.endDate,
    guests: form.value.guests,
    type: form.value.type || undefined,
  })

  searched.value = true
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
