<template>
  <section class="admin-view">
    <div class="section-head">
      <span class="section-kicker">Administration</span>
      <h1>Gestion des reservations</h1>
      <p>Confirme ou annule les reservations selon les besoins.</p>
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

    <div v-else-if="filteredReservations.length" class="admin-table">
      <div class="table-head">
        <span>Client</span>
        <span>Emplacement</span>
        <span>Dates</span>
        <span>Statut</span>
        <span>Total</span>
        <span>Actions</span>
      </div>

      <article v-for="item in filteredReservations" :key="item._id" class="table-row">
        <span>{{ getUserName(item) }}</span>
        <span>{{ getCampsiteName(item) }}</span>
        <span>{{ formatDate(item.startDate) }} au {{ formatDate(item.endDate) }}</span>
        <span>
          <strong class="status-badge" :class="getStatusClass(item.status)">
            {{ getStatusLabel(item.status) }}
          </strong>
        </span>
        <span>{{ item.totalPrice }} $</span>
        <span class="action-row">
          <RouterLink
            :to="{ name: 'reservation-detail', params: { id: item._id } }"
            class="small-link"
            title="Voir"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
            </svg>
          </RouterLink>
          <button
            v-if="item.status === 'pending'"
            type="button"
            class="small-button primary"
            title="Confirmer"
            @click="updateStatus(item, 'confirmed')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </button>
          <button
            v-if="item.status !== 'cancelled'"
            type="button"
            class="small-button danger"
            title="Annuler"
            @click="updateStatus(item, 'cancelled')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </span>
      </article>
    </div>

    <div v-else class="empty-state">
      <h2>Aucune reservation</h2>
      <p>Aucune reservation ne correspond au filtre selectionne.</p>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AlertMessage from '@/components/AlertMessage.vue'
import { useReservationsStore } from '@/stores/reservations'

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

function getUserName(item) {
  if (typeof item.user === 'object') {
    return (
      `${item.user.firstName || ''} ${item.user.lastName || ''}`.trim() ||
      item.user.email ||
      'Utilisateur'
    )
  }

  return 'Utilisateur'
}

function getCampsiteName(item) {
  if (typeof item.campsite === 'object') {
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
    reservationsStore.error = 'Erreur lors du chargement des donnees.'
  }
}

async function updateStatus(item, status) {
  success.value = ''

  try {
    await reservationsStore.updateReservationStatus(item._id, status)
    success.value = 'Statut de reservation mis a jour.'
    await loadReservations()
  } catch { 
    reservationsStore.error = 'Erreur lors de la mise a jour du statut de la reservation.'
  }
}

onMounted(async () => {
  await loadReservations()
})

watch(activeFilter, async () => {
  await loadReservations()
})
</script>

<style scoped>
.admin-view {
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

.section-head p,
.status-text {
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

.admin-table {
  border: 1px solid #d9e2ec;
  border-radius: 1rem;
  overflow: hidden;
  background: #ffffff;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 1.2fr 1.2fr 1.4fr 0.9fr 0.7fr 1.2fr;
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

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.small-button {
  border: none;
  padding: 0.55rem 0.75rem;
  border-radius: 999px;
  color: #ffffff;
  font-weight: 700;
}

.small-link {
  display: inline-flex;
  align-items: center;
  padding: 0.55rem 0.75rem;
  border-radius: 999px;
  background: #486581;
  color: #ffffff;
  font-weight: 700;
}

.small-button.primary {
  background: #2b6cb0;
}

.small-button.danger {
  background: #c53030;
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

@media (max-width: 1100px) {
  .table-head {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
  }
}
</style>
