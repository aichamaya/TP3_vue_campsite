import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '../utiles/apiFetch'

function buildQuery(params) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) q.set(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

export const useCampsitesStore = defineStore('campsites', () => {
  const campsites = ref([])
  const currentCampsite = ref(null)
  const loading = ref(false)
  const error = ref('')

  async function fetchCampsites(filters = {}) {
    loading.value = true
    error.value = ''
    try {
      const data = await apiFetch(`/api/campsites${buildQuery(filters)}`)
      console.log("Données reçues de l'API:", data)
      campsites.value = Array.isArray(data) ? data : (data.data ?? data.campsites ?? [])
      console.log('Emplacements stockés:', campsites.value)
      return campsites.value
    } catch (e) {
      error.value = 'Erreur chargement'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchAvailableCampsites(query = {}) {
    loading.value = true
    error.value = ''
    try {
      const data = await apiFetch(`/api/campsites/available${buildQuery(query)}`)
      campsites.value = Array.isArray(data) ? data : (data.data ?? data.campsites ?? [])
      return campsites.value
    } catch (e) {
      error.value = 'Erreur recherche'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchCampsiteById(id) {
    loading.value = true
    error.value = ''
    try {
      const data = await apiFetch(`/api/campsites/${id}`)
      currentCampsite.value = data
      return currentCampsite.value
    } catch (e) {
      error.value = 'Erreur détail'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createCampsite(payload) {
    loading.value = true
    error.value = ''
    try {
      return await apiFetch('/api/campsites', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch (e) {
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateCampsite(id, payload) {
    loading.value = true
    error.value = ''
    try {
      return await apiFetch(`/api/campsites/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    } catch (e) {
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteCampsite(id) {
    loading.value = true
    error.value = ''
    try {
      await apiFetch(`/api/campsites/${id}`, { method: 'DELETE' })
      await fetchCampsites()
    } catch (e) {
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    campsites,
    currentCampsite,
    loading,
    error,
    fetchCampsites,
    fetchAvailableCampsites,
    fetchCampsiteById,
    createCampsite,
    updateCampsite,
    deleteCampsite,
  }
})
