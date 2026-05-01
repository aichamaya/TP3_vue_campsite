<template>
  <section class="admin-view">
    <div class="section-head">
      <span class="section-kicker">Administration</span>
      <h1>Gestion des emplacements</h1>
      <p>Ajoute, modifie ou supprime des emplacements.</p>
    </div>

    <button type="button" class="primary-button add-button" @click="openCreateModal">
      Ajouter
    </button>

    <AlertMessage v-if="success" type="success" :message="success" @close="success = ''" />
    <AlertMessage
      v-if="campsitesStore.error"
      type="error"
      :message="campsitesStore.error"
      @close="campsitesStore.error = ''"
    />

    <section v-if="showFormModal" class="modal-backdrop">
      <div class="modal-panel">
        <button type="button" class="modal-close" @click="showFormModal = false">Fermer</button>
        <h2>{{ editingId ? "Modifier l'emplacement" : 'Nouvel emplacement' }}</h2>

        <form class="form-grid" novalidate @submit.prevent="handleSubmit">
          <label class="field-group">
            <span>Nom</span>
            <input v-model="form.name" type="text" />
            <small v-if="errors.name" class="field-error">{{ errors.name }}</small>
          </label>

          <label class="field-group">
            <span>Lieu</span>
            <input v-model="form.location" type="text" />
            <small v-if="errors.location" class="field-error">{{ errors.location }}</small>
          </label>

          <label class="field-group">
            <span>Type</span>
            <select v-model="form.type">
              <option value="tente">Tente</option>
              <option value="rv">VR</option>
              <option value="chalet">Chalet</option>
              <option value="glamping">Glamping</option>
              <option value="arrière-pays">Arriere-pays</option>
              <option value="autre">Autre</option>
            </select>
          </label>

          <label class="field-group">
            <span>Prix par nuit</span>
            <input v-model="form.pricePerNight" type="number" step="0.01" />
            <small v-if="errors.pricePerNight" class="field-error">{{
              errors.pricePerNight
            }}</small>
          </label>

          <label class="field-group">
            <span>Capacite</span>
            <input v-model="form.capacity" type="number" />
            <small v-if="errors.capacity" class="field-error">{{ errors.capacity }}</small>
          </label>

          <label v-if="form.type === 'rv'" class="field-group">
            <span>Longueur maximale du vehicule</span>
            <input v-model="form.maxVehicleLength" type="number" step="0.1" />
            <small v-if="errors.maxVehicleLength" class="field-error">
              {{ errors.maxVehicleLength }}
            </small>
          </label>

          <label class="field-group field-wide">
            <span>Description</span>
            <textarea v-model="form.description" rows="3" />
          </label>

          <label class="field-group field-wide">
            <span>Equipements</span>
            <input v-model="form.amenities" type="text" placeholder="eau, wifi, douche" />
          </label>

          <div class="action-row">
            <button type="button" class="secondary-button" @click="resetForm">Reinitialiser</button>
            <button type="submit" class="primary-button" :disabled="campsitesStore.loading">
              {{ campsitesStore.loading ? 'Sauvegarde...' : editingId ? 'Modifier' : 'Ajouter' }}
            </button>
          </div>
        </form>
      </div>
    </section>

    <section v-if="campsiteToDelete" class="modal-backdrop">
      <div class="modal-panel small-modal">
        <h2>Supprimer l'emplacement</h2>
        <p>
          Tu es sur le point de supprimer {{ campsiteToDelete.name }}. Cette action est
          irreversible.
        </p>
        <div class="action-row">
          <button type="button" class="secondary-button" @click="campsiteToDelete = null">
            Annuler
          </button>
          <button type="button" class="small-button danger" @click="handleDelete">
            Confirmer la suppression
          </button>
        </div>
      </div>
    </section>

    <p v-if="campsitesStore.loading" class="status-text">Chargement des emplacements...</p>

    <div v-else-if="campsites.length" class="admin-table">
      <div class="table-head">
        <span>Nom</span>
        <span>Lieu</span>
        <span>Type</span>
        <span>Prix</span>
        <span>Capacite</span>
        <span>Actions</span>
      </div>

      <article v-for="item in campsites" :key="item._id" class="table-row">
        <span>{{ item.name }}</span>
        <span>{{ item.location }}</span>
        <span>{{ item.type }}</span>
        <span>{{ item.pricePerNight }} $</span>
        <span>{{ item.capacity }}</span>
        <span class="action-row">
          <button type="button" class="small-button primary" @click="fillForm(item)">
            Modifier
          </button>
          <button type="button" class="small-button danger" @click="campsiteToDelete = item">
            Supprimer
          </button>
        </span>
      </article>
    </div>
  </section>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import AlertMessage from '@/components/AlertMessage.vue'
import { useCampsitesStore } from '@/stores/campsites'


const campsitesStore = useCampsitesStore()

const editingId = ref(null)
const showFormModal = ref(false)
const campsiteToDelete = ref(null)
const success = ref('')
const errors = ref({})
const form = ref({
  name: '',
  location: '',
  description: '',
  type: 'tente',
  pricePerNight: '',
  capacity: '',
  maxVehicleLength: '',
  amenities: '',
})

const campsites = computed(() => campsitesStore.campsites)

function resetForm() {
  editingId.value = null
  errors.value = {}
  form.value = {
    name: '',
    location: '',
    description: '',
    type: 'tente',
    pricePerNight: '',
    capacity: '',
    maxVehicleLength: '',
    amenities: '',
  }
}

function validateForm() {
  errors.value = {}

  if (!form.value.name.trim()) errors.value.name = 'Le nom est requis.'
  if (!form.value.location.trim()) errors.value.location = 'Le lieu est requis.'
  if (Number(form.value.pricePerNight) < 0 || form.value.pricePerNight === '') {
    errors.value.pricePerNight = 'Le prix doit etre superieur ou egal a 0.'
  }
  if (Number(form.value.capacity) < 1 || form.value.capacity === '') {
    errors.value.capacity = 'La capacite doit etre superieure ou egale a 1.'
  }
  if (
    form.value.type === 'rv' &&
    form.value.maxVehicleLength !== '' &&
    Number(form.value.maxVehicleLength) < 1
  ) {
    errors.value.maxVehicleLength = 'La longueur maximale doit etre superieure ou egale a 1.'
  }

  return Object.keys(errors.value).length === 0
}

function openCreateModal() {
  resetForm()
  showFormModal.value = true
}

function fillForm(item) {
  editingId.value = item._id
  form.value = {
    name: item.name,
    location: item.location,
    description: item.description || '',
    type: item.type,
    pricePerNight: item.pricePerNight,
    capacity: item.capacity,
    maxVehicleLength: item.maxVehicleLength || '',
    amenities: (item.amenities || []).join(', '),
  }
  showFormModal.value = true
}

function getPayload() {
  return {
    name: form.value.name.trim(),
    location: form.value.location.trim(),
    description: form.value.description.trim(),
    type: form.value.type,
    pricePerNight: Number(form.value.pricePerNight),
    capacity: Number(form.value.capacity),
    maxVehicleLength: form.value.type === 'rv' ? Number(form.value.maxVehicleLength) : undefined,
    amenities: form.value.amenities
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  }
}

async function loadCampsites() {
  try {
    await campsitesStore.fetchCampsites()
  } catch {
    // je gere deja l'erreur dans le store (campsitesStore.error)
  }
}

async function handleSubmit() {
  success.value = ''

  if (!validateForm()) {
    return
  }

  try {
    if (editingId.value) {
      await campsitesStore.updateCampsite(editingId.value, getPayload())
      success.value = 'Emplacement modifie.'
    } else {
      await campsitesStore.createCampsite(getPayload())
      success.value = 'Emplacement cree.'
    }

    resetForm()
    showFormModal.value = false
    await loadCampsites()
  } catch (err) {
    if (err?.status === 409) {
      errors.value.name = 'Un emplacement avec ce nom existe deja pour ce lieu.'
      errors.value.location = 'Verifie le nom et le lieu.'
    }
  }
}

async function handleDelete() {
  if (!campsiteToDelete.value) return
  success.value = ''

  try {
    await campsitesStore.deleteCampsite(campsiteToDelete.value._id)
    success.value = 'Emplacement supprime.'
    campsiteToDelete.value = null
    await loadCampsites()
  } catch {
    // je gere deja l'erreur dans le store (campsitesStore.error)
  }
}

onMounted(async () => {
  await loadCampsites()
})
</script>
<script setup>
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
  width: min(100%, 780px);
  max-height: 90vh;
  overflow: auto;
  padding: 1.5rem;
  border-radius: 1rem;
  background: #ffffff;
  border: 1px solid #d9e2ec;
}

.small-modal {
  width: min(100%, 460px);
}

.modal-close {
  float: right;
  border: none;
  background: transparent;
  color: #2b6cb0;
  font-weight: 700;
}

.add-button {
  width: fit-content;
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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

.field-group input,
.field-group select,
.field-group textarea {
  min-height: 3rem;
  padding: 0.85rem 1rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.9rem;
  background: #f8fafc;
}

.field-wide {
  grid-column: 1 / -1;
}

.field-error {
  color: #b91c1c;
  font-weight: 700;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.primary-button,
.secondary-button,
.small-button {
  border: none;
  border-radius: 999px;
  font-weight: 700;
}

.primary-button {
  min-height: 3rem;
  padding: 0.8rem 1rem;
  background: #2b6cb0;
  color: #ffffff;
}

.secondary-button {
  min-height: 3rem;
  padding: 0.8rem 1rem;
  background: #edf2f7;
  color: #243b53;
}

.small-button {
  padding: 0.55rem 0.75rem;
  color: #ffffff;
}

.small-button.primary {
  background: #2b6cb0;
}

.small-button.danger {
  background: #c53030;
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
  grid-template-columns: 1.2fr 1fr 0.8fr 0.8fr 0.7fr 1fr;
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

@media (max-width: 1000px) {
  .form-grid,
  .table-row {
    grid-template-columns: 1fr;
  }

  .table-head {
    display: none;
  }
}
</style>

