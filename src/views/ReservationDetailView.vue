<template>
  <section class="reservation-detail-view">
    <RouterLink :to="{ name: 'reservations' }" class="back-link">
      Retour aux reservations
    </RouterLink>

    <p v-if="reservationsStore.loading && !reservation" class="status-text">
      Chargement de la reservation...
    </p>

    <AlertMessage
      v-if="localError && !reservation"
      type="error"
      :message="localError"
      @close="localError = ''"
    />

    <div v-if="reservation" class="detail-grid">
      <section class="detail-card">
        <div class="card-head">
          <div>
            <span class="section-kicker">Reservation</span>
            <h1>{{ campsite?.name || 'Emplacement reserve' }}</h1>
            <p>{{ campsite?.location || 'Information de localisation indisponible' }}</p>
          </div>

          <strong class="status-badge" :class="getStatusClass(reservation.status)">
            {{ getStatusLabel(reservation.status) }}
          </strong>
        </div>

        <AlertMessage v-if="success" type="success" :message="success" @close="success = ''" />
        <AlertMessage
          v-if="localError && reservation"
          type="error"
          :message="localError"
          @close="localError = ''"
        />

        <div class="detail-list">
          <p><strong>Arrivee :</strong> {{ formatDate(reservation.startDate) }}</p>
          <p><strong>Depart :</strong> {{ formatDate(reservation.endDate) }}</p>
          <p>
            <strong>Duree :</strong> {{ numberOfNights }} nuit{{ numberOfNights > 1 ? 's' : '' }}
          </p>
          <p><strong>Personnes :</strong> {{ reservation.guests }}</p>
          <p v-if="reservation.vehicleLength">
            <strong>Longueur vehicule :</strong> {{ reservation.vehicleLength }} m
          </p>
          <p><strong>Total :</strong> {{ reservation.totalPrice }} $</p>
        </div>

        <div v-if="campsite" class="detail-links">
          <RouterLink
            :to="{ name: 'campsite-detail', params: { id: campsite._id } }"
            class="detail-link"
          >
            Voir l'emplacement
          </RouterLink>
        </div>

        <div v-if="!hasInvoice" class="action-row">
          <button
            v-if="reservation.status === 'pending'"
            type="button"
            class="cancel-button"
            :disabled="reservationsStore.loading"
            @click="updateStatus('cancelled', 'Reservation annulee avec succes.')"
          >
            Annuler
          </button>

          <template v-if="auth.isAdmin">
            <button
              v-if="reservation.status === 'pending'"
              type="button"
              class="confirm-button"
              :disabled="reservationsStore.loading"
              @click="updateStatus('confirmed', 'Reservation confirmee avec succes.')"
            >
              Confirmer
            </button>
            <button
              v-if="reservation.status !== 'pending'"
              type="button"
              class="secondary-button"
              :disabled="reservationsStore.loading"
              @click="updateStatus('pending', 'Reservation remise en attente.')"
            >
              Remettre en attente
            </button>
            <button
              v-if="reservation.status === 'confirmed'"
              type="button"
              class="confirm-button"
              :disabled="invoicesStore.loading"
              @click="createInvoice"
            >
              Creer la facture
            </button>
          </template>
        </div>
      </section>

      <section class="detail-card">
        <h2>Resume financier</h2>
        <div class="detail-list">
          <p><strong>Prix par nuit :</strong> {{ campsite?.pricePerNight || 0 }} $</p>
          <p><strong>Nombre de nuits :</strong> {{ numberOfNights }}</p>
          <p><strong>Total :</strong> {{ reservation.totalPrice }} $</p>
        </div>

        <div v-if="invoice" class="invoice-box">
          <h3>Facture</h3>
          <p><strong>Statut :</strong> {{ invoice.status }}</p>
          <p v-if="invoice.subtotal"><strong>Sous-total :</strong> {{ invoice.subtotal }} $</p>
          <p v-if="invoice.taxes"><strong>Taxes :</strong> {{ invoice.taxes }} $</p>
          <p v-if="invoice.total"><strong>Total facture :</strong> {{ invoice.total }} $</p>

          <div v-if="Array.isArray(invoice.items) && invoice.items.length" class="invoice-items">
            <article v-for="(item, index) in invoice.items" :key="index" class="invoice-item">
              <p>
                <strong>{{ item.description || 'Article' }}</strong>
              </p>
              <p>Quantite : {{ item.quantity }}</p>
              <p>Prix unitaire : {{ item.unitPrice }} $</p>
            </article>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AlertMessage from '@/components/AlertMessage.vue'
import { useAuthStore } from '@/stores/auth'
import { useInvoicesStore } from '@/stores/invoices'
import { useReservationsStore } from '@/stores/reservations'

const route = useRoute()
const auth = useAuthStore()
const invoicesStore = useInvoicesStore()
const reservationsStore = useReservationsStore()

const success = ref('')
const localError = ref('')

const reservation = computed(() => reservationsStore.reservation)
const campsite = computed(() => {
  if (typeof reservation.value?.campsite === 'object') {
    return reservation.value.campsite
  }

  return null
})

const numberOfNights = computed(() => {
  if (!reservation.value?.startDate || !reservation.value?.endDate) return 0

  const start = new Date(reservation.value.startDate)
  const end = new Date(reservation.value.endDate)
  const difference = (end - start) / (1000 * 60 * 60 * 24)

  return difference > 0 ? difference : 0
})

const invoice = computed(() => {
  if (reservation.value?.invoice && typeof reservation.value.invoice === 'object') {
    return reservation.value.invoice
  }

  return null
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

function getErrorMessage(err) {
  return err?.data?.message || err?.message || 'Erreur lors du chargement de la reservation.'
}

const hasInvoice = computed(() => !!invoice.value)

async function updateStatus(status, message) {
  localError.value = ''
  success.value = ''

  try {
    await reservationsStore.updateReservationStatus(route.params.id, status)
    success.value = message
  } catch (err) {
    localError.value = getErrorMessage(err)
  }
}

async function createInvoice() {
  localError.value = ''
  success.value = ''

  try {
    await invoicesStore.createInvoice({ reservationId: reservation.value._id })
    await reservationsStore.fetchReservation(route.params.id)
    success.value = 'Facture creee avec succes.'
  } catch (err) {
    localError.value =
      err?.data?.message || err?.message || 'Erreur lors de la creation de la facture.'
  }
}

onMounted(async () => {
  try {
    await reservationsStore.fetchReservation(route.params.id)
  } catch (err) {
    localError.value = getErrorMessage(err)
  }
})
</script>
<style scoped>
.reservation-detail-view {
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

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

.detail-card {
  padding: 1.5rem;
  border-radius: 1rem;
  background: #ffffff;
  border: 1px solid #d9e2ec;
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
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

.card-head h1,
.detail-card h2,
.invoice-box h3 {
  margin-top: 0.75rem;
  color: #102a43;
}

.card-head p,
.detail-list,
.invoice-box {
  color: #52606d;
}

.detail-list {
  display: grid;
  gap: 0.65rem;
  margin-top: 1rem;
}

.status-badge {
  display: inline-flex;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
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

.detail-links {
  margin-top: 1rem;
}

.detail-link {
  color: #2b6cb0;
  font-weight: 700;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.cancel-button,
.confirm-button,
.secondary-button {
  margin-top: 1rem;
  min-height: 3rem;
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 999px;
  font-weight: 700;
}

.cancel-button {
  background: #c53030;
  color: #ffffff;
}

.confirm-button {
  background: #2b6cb0;
  color: #ffffff;
}

.secondary-button {
  background: #edf2f7;
  color: #243b53;
}

.cancel-button:disabled,
.confirm-button:disabled,
.secondary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.invoice-box {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #e9eff5;
}

.invoice-box p {
  margin-top: 0.45rem;
}

.invoice-items {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.invoice-item {
  padding: 0.9rem;
  border-radius: 0.8rem;
  background: #f8fafc;
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .card-head {
    flex-direction: column;
  }
}
</style>
