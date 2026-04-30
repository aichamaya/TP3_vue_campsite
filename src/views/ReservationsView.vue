<template>
  <section class="reservations-view">
    <div class="section-head">
      <span class="section-kicker">Reservations</span>
      <h1>Mes reservations</h1>
      <p>Consulte tes reservations et leur statut.</p>
    </div>

    <div class="filter-row">
      <button
        type="button"
        class="filter-button"
        :class="{ 'filter-active': activeFilter === 'all' }"
        @click="activeFilter = 'all'"
      >
        Toutes
      </button>
      <button
        type="button"
        class="filter-button"
        :class="{ 'filter-active': activeFilter === 'pending' }"
        @click="activeFilter = 'pending'"
      >
        En attente
      </button>
      <button
        type="button"
        class="filter-button"
        :class="{ 'filter-active': activeFilter === 'confirmed' }"
        @click="activeFilter = 'confirmed'"
      >
        Confirmees
      </button>
      <button
        type="button"
        class="filter-button"
        :class="{ 'filter-active': activeFilter === 'cancelled' }"
        @click="activeFilter = 'cancelled'"
      >
        Annulees
      </button>
    </div>

    <AlertMessage v-if="success" type="success" :message="success" @close="success = ''" />

    <AlertMessage
      v-if="reservationsStore.error"
      type="error"
      :message="reservationsStore.error"
      @close="reservationsStore.error = ''"
    />

    <p v-if="reservationsStore.loading" class="status-text">Chargement des reservations...</p>

    <div v-else-if="filteredReservations.length" class="reservations-table">
      <div class="table-head">
        <span>Emplacement</span>
        <span>Arrivee</span>
        <span>Depart</span>
        <span>Personnes</span>
        <span>Total</span>
        <span>Statut</span>
        <span>Actions</span>
      </div>

      <article v-for="item in filteredReservations" :key="item._id" class="table-row">
        <span>{{ getCampsiteName(item) }}</span>
        <span>{{ formatDate(item.startDate) }}</span>
        <span>{{ formatDate(item.endDate) }}</span>
        <span>{{ item.guests }}</span>
        <span>{{ item.totalPrice }} $</span>
        <span>
          <strong class="status-badge" :class="getStatusClass(item.status)">
            {{ getStatusLabel(item.status) }}
          </strong>
        </span>
        <span>
          <RouterLink
            :to="{ name: 'reservation-detail', params: { id: item._id } }"
            class="detail-link"
          >
            Voir details
          </RouterLink>
          <button
            v-if="item.status === 'pending'"
            type="button"
            class="cancel-link"
            @click="cancelReservation(item)"
          >
            Annuler
          </button>
        </span>
      </article>
    </div>

    <div v-else class="empty-state">
      <h2>Aucune reservation</h2>
      <p>Tu n'as pas encore de reservation pour ce filtre.</p>
      <button type="button" class="primary-button" @click="goToCampsites">
        Voir les emplacements
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AlertMessage from '@/components/AlertMessage.vue'
import { useReservationsStore } from '@/stores/reservations'

const router = useRouter()
const reservationsStore = useReservationsStore()
const activeFilter = ref('all')
const success = ref('')

const filteredReservations = computed(() => {
  if (activeFilter.value === 'all') {
    return reservationsStore.reservations
  }

  return reservationsStore.reservations.filter((item) => item.status === activeFilter.value)
})

function formatDate(value) {
  if (!value) return ''

  return new Date(value).toLocaleDateString('fr-CA')
}

function getStatusLabel(status) {
  if (status === 'pending') return 'En attente'
  if (status === 'confirmed') return 'Confirmee'
  if (status === 'cancelled') return 'Annulee'
  return status
}

function getStatusClass(status) {
  if (status === 'pending') return 'status-pending'
  if (status === 'confirmed') return 'status-confirmed'
  if (status === 'cancelled') return 'status-cancelled'
  return ''
}

function getCampsiteName(item) {
  if (typeof item.campsite === 'object' && item.campsite?.name) {
    return item.campsite.name
  }

  return 'Emplacement'
}

async function loadReservations() {
  try {
    await reservationsStore.fetchReservations(
      activeFilter.value === 'all' ? {} : { status: activeFilter.value },
    )
  } catch {
    // je gère l'erreur est déjà gérée dans le store (reservationsStore.error)
  }
}

async function cancelReservation(item) {
  success.value = ''

  try {
    await reservationsStore.updateReservationStatus(item._id, 'cancelled')
    success.value = 'Reservation annulee avec succes.'
    await loadReservations()
  } catch {
    // je gère l'erreur est déjà gérée dans le store (reservationsStore.error)
  }
}

function goToCampsites() {
  router.push({ name: 'campsites' })
}

onMounted(async () => {
  await loadReservations()
})

watch(activeFilter, async () => {
  await loadReservations()
})
</script>
<style scoped>
.reservations-view {
  display: grid;
  gap: 1.5rem;
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

.section-head h1 {
  margin-top: 0.75rem;
  color: #102a43;
}

.section-head p {
  margin-top: 0.5rem;
  color: #52606d;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-button {
  border: none;
  padding: 0.7rem 1rem;
  border-radius: 999px;
  background: #edf2f7;
  color: #243b53;
  font-weight: 700;
}

.filter-active {
  background: #2b6cb0;
  color: #ffffff;
}

.status-text {
  color: #52606d;
}

.reservations-table {
  border: 1px solid #d9e2ec;
  border-radius: 1rem;
  overflow: hidden;
  background: #ffffff;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 1.4fr repeat(5, minmax(0, 1fr)) 0.9fr;
  gap: 1rem;
  padding: 1rem 1.25rem;
  align-items: center;
}

.table-head {
  background: #f8fafc;
  color: #486581;
  font-weight: 700;
}

.table-row {
  border-top: 1px solid #e9eff5;
  color: #243b53;
}

.status-badge {
  display: inline-flex;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.82rem;
}

.status-pending {
  background: #fffbeb;
  color: #b45309;
}

.status-confirmed {
  background: #ecfdf3;
  color: #166534;
}

.status-cancelled {
  background: #fef2f2;
  color: #b91c1c;
}

.detail-link {
  color: #2b6cb0;
  font-weight: 700;
}

.cancel-link {
  margin-left: 0.75rem;
  border: none;
  background: transparent;
  color: #b91c1c;
  font-weight: 700;
}

.empty-state {
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid #d9e2ec;
  background: #ffffff;
  color: #52606d;
}

.empty-state h2 {
  color: #102a43;
}

.empty-state p {
  margin-top: 0.5rem;
}

.primary-button {
  margin-top: 1rem;
  min-height: 3rem;
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 999px;
  background: #2b6cb0;
  color: #ffffff;
  font-weight: 700;
}

@media (max-width: 1000px) {
  .table-head {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
  }
}
</style>
