<template>
  <section class="max-w-5xl mx-auto space-y-6">

    
    <div v-if="campsite" class="bg-white p-6 rounded-xl shadow space-y-3">

      <h1 class="text-2xl font-bold">
        {{ campsite.name }}
      </h1>

      <p class="text-slate-600">
        {{ campsite.description }}
      </p>

      <p>📍 {{ campsite.location }}</p>
      <p>👥 {{ campsite.capacity }} personnes</p>

      <p v-if="campsite.maxVehicleLength">
        🚐 {{ campsite.maxVehicleLength }} m
      </p>

      <p class="text-orange-500 font-bold">
        {{ campsite.pricePerNight }}$ / nuit
      </p>

    </div>

  
    <div class="bg-white p-6 rounded-xl shadow space-y-4">

      <h2 class="font-semibold text-lg">
        Réserver
      </h2>

      <div v-if="!authStore.isAuthenticated" class="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center space-y-2">
        <p class="text-orange-700">Vous devez être connecté pour réserver.</p>
        <button
          @click="router.push({ name: 'login', query: { redirect: route.fullPath } })"
          class="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold"
        >
          Se connecter
        </button>
      </div>

      <div v-else-if="authStore.isAdmin" class="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
        <p class="text-slate-500 text-sm">Les administrateurs ne peuvent pas effectuer de réservation.</p>
      </div>

      <form v-else @submit.prevent="handleReserve" class="grid grid-cols-1 md:grid-cols-3 gap-3">

        <input v-model="form.startDate" type="date" class="border p-2 rounded" />

        <input v-model="form.endDate" type="date" class="border p-2 rounded" />

        <div class="flex flex-col gap-1">
          <input
            v-model.number="form.guests"
            type="number"
            min="1"
            :max="campsite?.capacity"
            :placeholder="`Nb. personnes`"
            class="border p-2 rounded"
          />
          <small v-if="campsite?.capacity" class="text-slate-400 text-xs">
            Entre 1 et {{ campsite.capacity }} personne(s)
          </small>
        </div>

        <input
          v-if="campsite?.type === 'vr'"
          v-model.number="form.vehicleLength"
          type="number"
          min="1"
          :max="campsite?.maxVehicleLength"
          placeholder="Longueur véhicule (m)"
          class="border p-2 rounded col-span-full md:col-span-1"
        />

        <button
          :disabled="loading"
          class="bg-orange-500 text-white rounded col-span-full py-2 disabled:opacity-50"
        >
          {{ loading ? 'Réservation en cours...' : 'Réserver' }}
        </button>

      </form>

      <p>
        Nuits : {{ nights }}
      </p>

      <p class="font-bold text-orange-500">
        Total : {{ total }}$
      </p>

      <p v-if="error" class="text-red-500">
        {{ error }}
      </p>

      <p v-if="success" class="text-green-500">
        {{ success }}
      </p>

    </div>

  </section>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCampsitesStore } from '@/stores/campsites'
import { useReservationsStore } from '@/stores/reservations'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const campsitesStore = useCampsitesStore()
const reservationsStore = useReservationsStore()
const authStore = useAuthStore()

const campsite = ref(null)

const today = new Date().toISOString().slice(0, 10)
const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10)

const form = ref({
  startDate: today,
  endDate: tomorrow,
  guests: 1,
  vehicleLength: null
})

const error = ref('')
const success = ref('')
const loading = ref(false)

onMounted(async () => {
  await campsitesStore.fetchCampsiteById(route.params.id)
  campsite.value = campsitesStore.currentCampsite
})

const nights = computed(() => {
  if (!form.value.startDate || !form.value.endDate) return 0
  const start = new Date(form.value.startDate)
  const end = new Date(form.value.endDate)
  const diff = (end - start) / (1000 * 60 * 60 * 24)
  return diff > 0 ? diff : 0
})

const total = computed(() => {
  if (!campsite.value || nights.value === 0) return 0
  return nights.value * campsite.value.pricePerNight
})

async function handleReserve() {
  error.value = ''
  success.value = ''

  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  if (!form.value.startDate || !form.value.endDate) {
    error.value = 'Les dates sont requises.'
    return
  }
  if (form.value.startDate < today) {
    error.value = "La date d'arrivée ne peut pas être dans le passé."
    return
  }
  if (form.value.endDate <= form.value.startDate) {
    error.value = "La date de départ doit être après la date d'arrivée."
    return
  }
  if (!form.value.guests || form.value.guests < 1) {
    error.value = 'Le nombre de personnes doit être au moins 1.'
    return
  }
  if (campsite.value && form.value.guests > campsite.value.capacity) {
    error.value = `Cet emplacement accepte maximum ${campsite.value.capacity} personne(s).`
    return
  }
  if (campsite.value?.type === 'vr' && !form.value.vehicleLength) {
    error.value = 'La longueur du véhicule est requise pour les emplacements VR.'
    return
  }
  if (campsite.value?.maxVehicleLength && form.value.vehicleLength > campsite.value.maxVehicleLength) {
    error.value = `La longueur maximale acceptée est ${campsite.value.maxVehicleLength} m.`
    return
  }

  loading.value = true
  try {
    const payload = {
      campsite: campsite.value._id,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      guests: Number(form.value.guests),
    }
    if (campsite.value?.type === 'vr') {
      payload.vehicleLength = Number(form.value.vehicleLength)
    }
    await reservationsStore.createReservation(payload)
    success.value = 'Réservation effectuée avec succès !'
    setTimeout(() => router.push({ name: 'reservations' }), 1500)
  } catch (e) {
    error.value = e?.message || 'Erreur lors de la réservation.'
  } finally {
    loading.value = false
  }
}
</script>




<style scoped>
.detail-view {
  display: grid;
  gap: 1.25rem;
}

.back-link {
  width: fit-content;
  color: #2b6cb0;
  font-weight: 700;
}

.status-text {
  color: #52606d;
}

.detail-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.8fr);
  gap: 1.5rem;
}

.detail-main {
  display: grid;
  gap: 1.5rem;
}

.detail-card,
.booking-card {
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: #ffffff;
  border: 1px solid #d9e2ec;
}

.section-kicker {
  display: inline-flex;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: #eaf2fb;
  color: #2b6cb0;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.detail-card h1 {
  margin-top: 0.75rem;
  color: #102a43;
  font-size: 2rem;
}

.detail-location,
.detail-description,
.booking-card p {
  margin-top: 0.5rem;
  color: #52606d;
}

.detail-description {
  line-height: 1.6;
}

.detail-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1.25rem;
}

.meta-box {
  padding: 1rem;
  border-radius: 1rem;
  background: #f8fafc;
}

.meta-box strong {
  display: block;
  color: #102a43;
}

.meta-box span {
  color: #627d98;
  font-size: 0.9rem;
}

.amenities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.amenity-chip {
  padding: 0.55rem 0.8rem;
  border-radius: 999px;
  background: #edf2f7;
  color: #243b53;
}

.booking-card {
  align-self: start;
}

.booking-card h2 {
  color: #102a43;
}

.booking-form {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.field-group {
  display: grid;
  gap: 0.45rem;
}

.field-group span {
  font-size: 0.92rem;
  font-weight: 700;
  color: #243b53;
}

.field-group input {
  min-height: 3rem;
  padding: 0.85rem 1rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.9rem;
  background: #f8fafc;
}

.field-error {
  color: #b91c1c;
  font-weight: 700;
}

.summary-box {
  padding: 1rem;
  border-radius: 1rem;
  background: #edf2f7;
  color: #243b53;
}

.summary-box strong {
  display: block;
  margin-top: 0.35rem;
  color: #102a43;
}

.primary-button {
  min-height: 3rem;
  border: none;
  border-radius: 999px;
  background: #2b6cb0;
  color: #ffffff;
  font-weight: 700;
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 1000px) {
  .detail-shell,
  .detail-meta {
    grid-template-columns: 1fr;
  }
}
</style>
