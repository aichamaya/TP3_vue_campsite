import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '../utiles/apiFetch'

export const useReservationsStore = defineStore('reservations', () => {
  const reservations = ref([])
  const reservation = ref(null)
  const loading = ref(false)
  const error = ref('')

  async function fetchReservations() {
    loading.value = true
    error.value = ''
    try {
      const data = await apiFetch('/api/reservations')
      reservations.value = Array.isArray(data) ? data : (data.reservations ?? data.data ?? [])
      return reservations.value
    } catch (e) {
      error.value = 'Erreur chargement'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchReservation(id) {
    loading.value = true
    error.value = ''
    try {
      const data = await apiFetch(`/api/reservations/${id}`)
      reservation.value = data
      return reservation.value
    } catch (e) {
      error.value = 'Erreur détail'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createReservation(payload) {
    loading.value = true
    error.value = ''
    try {
      const data = await apiFetch('/api/reservations', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      reservation.value = data
      return reservation.value
    } catch (e) {
      error.value = e?.message || 'Erreur création'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function cancelReservation(id) {
    loading.value = true
    error.value = ''
    try {
      await apiFetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' }),
      })
      return await fetchReservations()
    } catch (e) {
      error.value = e?.message || 'Erreur annulation'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateReservationStatus(id, status) {
    loading.value = true
    error.value = ''
    try {
      const data = await apiFetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      reservation.value = data
      return data
    } catch (e) {
      error.value = e?.message || 'Erreur modification statut'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    reservations,
    reservation,
    loading,
    error,
    fetchReservations,
    fetchReservation,
    createReservation,
    cancelReservation,
    updateReservationStatus,
  }
})
