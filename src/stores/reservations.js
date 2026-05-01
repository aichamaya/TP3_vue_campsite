import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '@/services/api'

function buildQueryString(params) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      searchParams.set(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

function getListFromResponse(response) {
  if (Array.isArray(response?.data)) {
    return response.data
  }

  if (Array.isArray(response?.data?.reservations)) {
    return response.data.reservations
  }

  if (Array.isArray(response)) {
    return response
  }

  return []
}

function getItemFromResponse(response) {
  return response?.data?.reservation || response?.data || response
}

export const useReservationsStore = defineStore('reservations', () => {
  const reservations = ref([])
  const reservation = ref(null)
  const loading = ref(false)
  const error = ref('')

  async function fetchReservations(filters = {}) {
    loading.value = true
    error.value = ''

    try {
      const response = await apiFetch(`/api/reservations${buildQueryString(filters)}`)
      reservations.value = getListFromResponse(response)
      return reservations.value
    } catch (err) {
      reservations.value = []
      error.value =
        err?.data?.message || err?.message || 'Erreur lors du chargement des reservations.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchReservation(id) {
    loading.value = true
    error.value = ''

    try {
      const response = await apiFetch(`/api/reservations/${id}`)
      reservation.value = getItemFromResponse(response)
      return reservation.value
    } catch (err) {
      reservation.value = null
      error.value =
        err?.data?.message || err?.message || 'Erreur lors du chargement de la reservation.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createReservation(payload) {
    loading.value = true
    error.value = ''

    try {
      const response = await apiFetch('/api/reservations', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      reservation.value = getItemFromResponse(response)
      return reservation.value
    } catch (err) {
      error.value =
        err?.data?.message || err?.message || 'Erreur lors de la creation de la reservation.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateReservationStatus(id, status) {
    loading.value = true
    error.value = ''

    try {
      const response = await apiFetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      reservation.value = getItemFromResponse(response)
      return reservation.value
    } catch (err) {
      error.value =
        err?.data?.message || err?.message || 'Erreur lors de la modification du statut.'
      throw err
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
    updateReservationStatus,
  }
})
