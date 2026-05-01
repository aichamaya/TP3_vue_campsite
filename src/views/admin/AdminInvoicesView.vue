<template>
  <section class="admin-view">
    <div class="section-head">
      <span class="section-kicker">Administration</span>
      <h1>Gestion des factures</h1>
      <p>Cree une facture pour une reservation confirmee puis envoie-la au client.</p>
    </div>

    <section class="panel">
      <h2>Creer une facture</h2>
      <div class="create-row">
        <label class="field-group">
          <span>Reservation confirmee</span>
          <select v-model="reservationId">
            <option value="">Choisir une reservation</option>
            <option
              v-for="item in confirmedReservationsWithoutInvoice"
              :key="item._id"
              :value="item._id"
            >
              {{ getReservationLabel(item) }}
            </option>
          </select>
        </label>

        <button
          type="button"
          class="primary-button"
          :disabled="invoicesStore.loading"
          @click="handleCreateInvoice"
        >
          {{ invoicesStore.loading ? 'Creation...' : 'Creer la facture' }}
        </button>
      </div>
    </section>

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
        :class="{ 'filter-active': activeFilter === 'draft' }"
        @click="activeFilter = 'draft'"
      >
        Brouillons
      </button>
      <button
        type="button"
        class="filter-button"
        :class="{ 'filter-active': activeFilter === 'sent' }"
        @click="activeFilter = 'sent'"
      >
        Envoyees
      </button>
      <button
        type="button"
        class="filter-button"
        :class="{ 'filter-active': activeFilter === 'paid' }"
        @click="activeFilter = 'paid'"
      >
        Payees
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
      v-if="invoicesStore.error"
      type="error"
      :message="invoicesStore.error"
      @close="invoicesStore.error = ''"
    />

    <p v-if="invoicesStore.loading" class="status-text">Chargement des factures...</p>

    <div v-else-if="filteredInvoices.length" class="admin-table">
      <div class="table-head">
        <span>Facture</span>
        <span>Reservation</span>
        <span>Statut</span>
        <span>Echeance</span>
        <span>Actions</span>
      </div>

      <article v-for="item in filteredInvoices" :key="item._id" class="table-row">
        <span>{{ item._id }}</span>
        <span>{{ item.reservationId || item.reservation || 'Reservation' }}</span>
        <span>{{ item.status }}</span>
        <span>{{ formatDate(item.dueDate) }}</span>
        <span class="action-row">
          <button type="button" class="small-button secondary" @click="selectedInvoice = item">
            Voir le detail
          </button>
          <button
            v-if="item.status === 'draft'"
            type="button"
            class="small-button primary"
            @click="sendInvoice(item)"
          >
            Envoyer
          </button>
        </span>
      </article>
    </div>

    <div v-else class="empty-state">
      <h2>Aucune facture</h2>
      <p>Aucune facture ne correspond au filtre selectionne.</p>
    </div>

    <section v-if="selectedInvoice" class="modal-backdrop">
      <div class="modal-panel">
        <button type="button" class="modal-close" @click="selectedInvoice = null">Fermer</button>
        <h2>Detail de la facture</h2>
        <p><strong>Numero :</strong> {{ selectedInvoice._id }}</p>
        <p><strong>Client :</strong> {{ selectedInvoice.client?.email || 'Client' }}</p>
        <p><strong>Statut :</strong> {{ selectedInvoice.status }}</p>

        <div v-if="selectedInvoice.items?.length" class="invoice-lines">
          <div class="table-head invoice-head">
            <span>Description</span>
            <span>Quantite</span>
            <span>Prix unitaire</span>
            <span>Total</span>
          </div>
          <div
            v-for="(item, index) in selectedInvoice.items"
            :key="index"
            class="table-row invoice-row"
          >
            <span>{{ item.description }}</span>
            <span>{{ item.quantity }}</span>
            <span>{{ item.unitPrice }} $</span>
            <span>{{ item.total }} $</span>
          </div>
        </div>

        <div class="invoice-total">
          <p><strong>Sous-total :</strong> {{ selectedInvoice.subtotal }} $</p>
          <p><strong>Taxes :</strong> {{ selectedInvoice.taxes }} $</p>
          <p><strong>Total :</strong> {{ selectedInvoice.total }} $</p>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AlertMessage from '@/components/AlertMessage.vue'
import { useInvoicesStore } from '@/stores/invoices'
import { useReservationsStore } from '@/stores/reservations'

const invoicesStore = useInvoicesStore()
const reservationsStore = useReservationsStore()

const activeFilter = ref('all')
const reservationId = ref('')
const success = ref('')
const selectedInvoice = ref(null)

const filteredInvoices = computed(() => {
  if (activeFilter.value === 'all') {
    return invoicesStore.invoices
  }

  return invoicesStore.invoices.filter((item) => item.status === activeFilter.value)
})

const confirmedReservationsWithoutInvoice = computed(() =>
  reservationsStore.reservations.filter((item) => item.status === 'confirmed' && !item.invoice),
)

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('fr-CA')
}

function getReservationLabel(item) {
  const campsiteName = typeof item.campsite === 'object' ? item.campsite?.name : 'Reservation'
  return `${campsiteName} - ${formatDate(item.startDate)}`
}

async function loadData() {
  try {
    await Promise.all([
      invoicesStore.fetchInvoices(
        activeFilter.value === 'all' ? {} : { status: activeFilter.value },
      ),
      reservationsStore.fetchReservations({ status: 'confirmed' }),
    ])
  } catch { 
    invoicesStore.error = 'Erreur lors du chargement des donnees.'
  }
}

async function handleCreateInvoice() {
  success.value = ''

  if (!reservationId.value) {
    invoicesStore.error = 'Choisis une reservation confirmee.'
    return
  }

  try {
    await invoicesStore.createInvoice({ reservationId: reservationId.value })
    success.value = 'Facture creee avec succes.'
    reservationId.value = ''
    await loadData()
  } catch {
    invoicesStore.error = 'Erreur lors de la creation de la facture.'
  }
}

async function sendInvoice(item) {
  success.value = ''

  try {
    await invoicesStore.updateInvoiceStatus(item._id, 'sent')
    success.value = 'Facture envoyee.'
    await loadData()
  } catch {
    invoicesStore.error = 'Erreur lors de l envoi de la facture.'
  }
}

onMounted(async () => {
  await loadData()
})

watch(activeFilter, async () => {
  await loadData()
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

.panel {
  padding: 1.5rem;
  border-radius: 1rem;
  background: #ffffff;
  border: 1px solid #d9e2ec;
}

.panel h2 {
  color: #102a43;
}

.create-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
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

.field-group select {
  min-height: 3rem;
  padding: 0.85rem 1rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.9rem;
  background: #f8fafc;
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

.primary-button,
.small-button {
  border: none;
  border-radius: 999px;
  color: #ffffff;
  font-weight: 700;
}

.primary-button {
  min-height: 3rem;
  padding: 0.8rem 1rem;
  background: #2b6cb0;
}

.small-button {
  padding: 0.55rem 0.75rem;
}

.small-button.primary {
  background: #2b6cb0;
}

.small-button.secondary {
  background: #486581;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.42);
}

.modal-panel {
  width: min(100%, 760px);
  max-height: 90vh;
  overflow: auto;
  padding: 1.5rem;
  border-radius: 1rem;
  background: #ffffff;
  border: 1px solid #d9e2ec;
}

.modal-close {
  float: right;
  border: none;
  background: transparent;
  color: #2b6cb0;
  font-weight: 700;
}

.invoice-lines,
.invoice-total {
  margin-top: 1rem;
}

.invoice-head,
.invoice-row {
  grid-template-columns: 1.4fr 0.7fr 0.8fr 0.8fr;
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
  grid-template-columns: 1.3fr 1.3fr 0.8fr 0.8fr 1fr;
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

.action-row {
  display: flex;
  gap: 0.5rem;
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

@media (max-width: 1000px) {
  .create-row,
  .table-row {
    grid-template-columns: 1fr;
  }

  .table-head {
    display: none;
  }
}
</style>
