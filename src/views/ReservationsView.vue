<template>
  <section class="space-y-6">
    <select v-model="filter" class="border p-2 rounded mb-4">
      <option value="all">Toutes</option>
      <option value="pending">En attente</option>
      <option value="confirmed">Confirmées</option>
      <option value="cancelled">Annulées</option>
    </select>

    <table class="w-full bg-white rounded shadow overflow-hidden">
      <thead class="bg-orange-100">
        <tr class="text-left">
          <th class="p-2">Emplacement</th>
          <th class="p-2">Arrivée</th>
          <th class="p-2">Départ</th>
          <th class="p-2">Pers.</th>
          <th class="p-2">Total</th>
          <th class="p-2">Statut</th>
          <th class="p-2">Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="r in filtered" :key="r.id" class="border-t">
          <td class="p-2">{{ r.campsite?.name || r.campsiteName || '—' }}</td>
          <td class="p-2">{{ r.startDate?.slice(0, 10) }}</td>
          <td class="p-2">{{ r.endDate?.slice(0, 10) }}</td>
          <td class="p-2">{{ r.guests }}</td>
          <td class="p-2">{{ r.totalPrice ?? r.total ?? '—' }}$</td>

          <td class="p-2">
            <span
              v-if="r.status === 'pending'"
              class="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs"
            >
              En attente
            </span>
            <span
              v-else-if="r.status === 'confirmed'"
              class="bg-green-200 text-green-800 px-2 py-1 rounded text-xs"
            >
              Confirmée
            </span>
            <span
              v-else-if="r.status === 'cancelled'"
              class="bg-red-200 text-red-800 px-2 py-1 rounded text-xs"
            >
              Annulée
            </span>
          </td>

          <td class="p-2 flex gap-2 flex-wrap">
            <RouterLink
              :to="{ name: 'reservation-detail', params: { id: r._id } }"
              class="bg-orange-500 text-white px-2 py-1 rounded text-xs inline-flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fill-rule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </RouterLink>

            <button
              v-if="r.status === 'pending'"
              @click="cancelReservation(r._id)"
              class="bg-red-500 text-white px-2 py-1 rounded text-xs inline-flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!filtered.length" class="text-center text-slate-500 py-6 space-y-2">
      <p>Aucune réservation trouvée.</p>
      <RouterLink :to="{ name: 'campsites' }" class="text-orange-500 font-semibold hover:underline">
        Voir les emplacements disponibles →
      </RouterLink>
    </div>
  </section>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useReservationsStore } from '@/stores/reservations'

const reservationsStore = useReservationsStore()

const filter = ref('all')

onMounted(() => {
  reservationsStore.fetchReservations()
})

const filtered = computed(() => {
  if (filter.value === 'all') return reservationsStore.reservations
  return reservationsStore.reservations.filter((r) => r.status === filter.value)
})

function cancelReservation(id) {
  reservationsStore.cancelReservation(id)
}
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
