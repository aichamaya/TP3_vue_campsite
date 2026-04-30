<template>
  <div class="detail-view">
    <RouterLink :to="{ name: 'campsites' }" class="back-link"> Retour aux emplacements </RouterLink>

    <p v-if="campsitesStore.loading && !campsite" class="status-text">
      Chargement de l'emplacement...
    </p>

    <AlertMessage
      v-if="localError && !campsite"
      type="error"
      :message="localError"
      @close="localError = ''"
    />

    <section v-if="campsite" class="detail-shell">
      <div class="detail-main">
        <section class="detail-card">
          <span class="section-kicker">{{ typeLabel }}</span>
          <h1>{{ campsite.name }}</h1>
          <p class="detail-location">{{ campsite.location }}</p>
          <p class="detail-description">{{ campsite.description }}</p>

          <div class="detail-meta">
            <div class="meta-box">
              <strong>{{ campsite.pricePerNight }} $</strong>
              <span>par nuit</span>
            </div>

            <div class="meta-box">
              <strong>{{ campsite.capacity }}</strong>
              <span>personnes max</span>
            </div>

            <div v-if="campsite.maxVehicleLength" class="meta-box">
              <strong>{{ campsite.maxVehicleLength }} m</strong>
              <span>longueur max</span>
            </div>
          </div>
        </section>

        <section class="detail-card">
          <h2>Equipements</h2>
          <div class="amenities-list">
            <span v-for="item in campsite.amenities" :key="item" class="amenity-chip">
              {{ item }}
            </span>
          </div>
        </section>
      </div>

      <aside class="booking-card">
        <h2>Formulaire de reservation</h2>
        <p>Choisis les dates et le nombre de personnes pour calculer le total.</p>

        <AlertMessage v-if="success" type="success" :message="success" @close="success = ''" />
        <AlertMessage
          v-if="localError && campsite"
          type="error"
          :message="localError"
          @close="localError = ''"
        />

        <form class="booking-form" novalidate @submit.prevent="handleReservation">
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
            <input v-model.number="form.guests" type="number" :max="campsite.capacity" />
            <small v-if="errors.guests" class="field-error">{{ errors.guests }}</small>
          </label>

          <label v-if="campsite.type === 'rv'" class="field-group">
            <span>Longueur du vehicule</span>
            <input v-model="form.vehicleLength" type="number" step="0.1" />
            <small v-if="errors.vehicleLength" class="field-error">
              {{ errors.vehicleLength }}
            </small>
          </label>

          <div class="summary-box">
            <p>
              {{ numberOfNights }} nuit{{ numberOfNights > 1 ? 's' : '' }} x
              {{ campsite.pricePerNight }} $
            </p>
            <strong>Total : {{ totalPrice }} $</strong>
          </div>

          <button type="submit" class="primary-button" :disabled="reservationsStore.loading">
            {{ reservationsStore.loading ? 'Reservation...' : 'Confirmer la reservation' }}
          </button>
        </form>
      </aside>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AlertMessage from '@/components/AlertMessage.vue'
import { useAuthStore } from '@/stores/auth'
import { useCampsitesStore } from '@/stores/campsites'
import { useReservationsStore } from '@/stores/reservations'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const campsitesStore = useCampsitesStore()
const reservationsStore = useReservationsStore()

const form = ref({
  startDate: '',
  endDate: '',
  guests: 1,
  vehicleLength: '',
})

const success = ref('')
const localError = ref('')
const errors = ref({})

const campsite = computed(() => campsitesStore.campsite)

const typeLabel = computed(() => {
  if (!campsite.value) return ''
  if (campsite.value.type === 'tente') return 'Tente'
  if (campsite.value.type === 'rv') return 'VR'
  if (campsite.value.type === 'chalet') return 'Chalet'
  if (campsite.value.type === 'glamping') return 'Glamping'
  if (campsite.value.type === 'arrière-pays' || campsite.value.type === 'arriere-pays')
    return 'Arriere-pays'
  return 'Autre'
})

const numberOfNights = computed(() => {
  if (!form.value.startDate || !form.value.endDate) return 0

  const start = new Date(form.value.startDate)
  const end = new Date(form.value.endDate)
  const difference = (end - start) / (1000 * 60 * 60 * 24)

  return difference > 0 ? difference : 0
})

const totalPrice = computed(() => {
  if (!campsite.value) return 0
  return numberOfNights.value * campsite.value.pricePerNight
})

function getErrorMessage(err) {
  return err?.data?.message || err?.message || 'Erreur lors de la reservation.'
}

async function handleReservation() {
  localError.value = ''
  success.value = ''
  errors.value = {}

  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = form.value.startDate ? new Date(form.value.startDate) : null
  const end = form.value.endDate ? new Date(form.value.endDate) : null

  if (!form.value.startDate) {
    errors.value.startDate = "La date d'arrivee est requise."
  } else if (start < today) {
    errors.value.startDate = "La date d'arrivee ne peut pas etre dans le passe."
  }

  if (!form.value.endDate) {
    errors.value.endDate = 'La date de depart est requise.'
  } else if (start && end <= start) {
    errors.value.endDate = "La date de depart doit etre apres la date d'arrivee."
  }

  if (form.value.guests < 1 || form.value.guests > campsite.value.capacity) {
    errors.value.guests = `Le nombre de personnes doit etre entre 1 et ${campsite.value.capacity}.`
  }

  if (campsite.value.type === 'rv' && !form.value.vehicleLength) {
    errors.value.vehicleLength = 'La longueur du vehicule est obligatoire pour un emplacement VR.'
  } else if (
    campsite.value.type === 'rv' &&
    Number(form.value.vehicleLength) > Number(campsite.value.maxVehicleLength)
  ) {
    errors.value.vehicleLength = `La longueur doit etre au maximum ${campsite.value.maxVehicleLength} m.`
  }

  if (Object.keys(errors.value).length) {
    localError.value = 'Corrige les champs en erreur.'
    return
  }

  try {
    await reservationsStore.createReservation({
      campsite: campsite.value._id,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      guests: form.value.guests,
      vehicleLength: campsite.value.type === 'rv' ? Number(form.value.vehicleLength) : undefined,
    })

    success.value = 'Reservation creee avec succes. Redirection vers mes reservations...'
    setTimeout(() => {
      router.push({ name: 'reservations' })
    }, 2000)
  } catch (err) {
    localError.value = getErrorMessage(err)
  }
}

onMounted(async () => {
  try {
    await campsitesStore.fetchCampsite(route.params.id)
  } catch (err) {
    localError.value = getErrorMessage(err)
  }
})
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
