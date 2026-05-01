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

  if (Array.isArray(response?.data?.campsites)) {
    return response.data.campsites
  }

  if (Array.isArray(response)) {
    return response
  }

  return []
}

function getItemFromResponse(response) {
  return response?.data?.campsite || response?.data || response
}

export const useCampsitesStore = defineStore('campsites', () => {
  const campsites = ref([])
  const campsite = ref(null)
  const loading = ref(false)
  const error = ref('')

  async function fetchCampsites(filters = {}) {
    loading.value = true
    error.value = ''

    try {
      const response = await apiFetch(`/api/campsites${buildQueryString(filters)}`)
      campsites.value = getListFromResponse(response)
      return campsites.value
    } catch (err) {
      campsites.value = []
      error.value =
        err?.data?.message || err?.message || 'Erreur lors du chargement des emplacements.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAvailableCampsites(filters) {
    loading.value = true
    error.value = ''

    try {
      const response = await apiFetch(`/api/campsites/available${buildQueryString(filters)}`)
      campsites.value = getListFromResponse(response)
      return campsites.value
    } catch (err) {
      campsites.value = []
      error.value =
        err?.data?.message || err?.message || 'Erreur lors de la recherche de disponibilites.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCampsite(id) {
    loading.value = true
    error.value = ''

    try {
      const response = await apiFetch(`/api/campsites/${id}`)
      campsite.value = getItemFromResponse(response)
      return campsite.value
    } catch (err) {
      campsite.value = null
      error.value =
        err?.data?.message || err?.message || "Erreur lors du chargement de l'emplacement."
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createCampsite(payload) {
    loading.value = true
    error.value = ''

    try {
      const response = await apiFetch('/api/campsites', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      return getItemFromResponse(response)
    } catch (err) {
      error.value =
        err?.data?.message || err?.message || "Erreur lors de la creation de l'emplacement."
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCampsite(id, payload) {
    loading.value = true
    error.value = ''

    try {
      const response = await apiFetch(`/api/campsites/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      return getItemFromResponse(response)
    } catch (err) {
      error.value =
        err?.data?.message || err?.message || "Erreur lors de la modification de l'emplacement."
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteCampsite(id) {
    loading.value = true
    error.value = ''

    try {
      return await apiFetch(`/api/campsites/${id}`, {
        method: 'DELETE',
      })
    } catch (err) {
      error.value =
        err?.data?.message || err?.message || "Erreur lors de la suppression de l'emplacement."
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearCampsites() {
    campsites.value = []
  }

  return {
    campsites,
    campsite,
    loading,
    error,
    fetchCampsites,
    fetchAvailableCampsites,
    fetchCampsite,
    createCampsite,
    updateCampsite,
    deleteCampsite,
    clearCampsites,
  }
})
