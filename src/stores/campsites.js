import { defineStore } from 'pinia'
import { apiFetch } from '../utiles/apiFetch'

export const useCampsitesStore = defineStore('campsites', {
  state: () => ({
    campsites: [],
    currentCampsite: null,
    loading: false,
    error: ''
  }),

  actions: {
    async fetchCampsites(filters = {}) {
      this.loading = true
      this.error = ''
      try {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== '' && v !== null && v !== undefined) params.set(k, String(v))
        })
        const query = params.toString() ? `?${params.toString()}` : ''
        const data = await apiFetch(`/api/campsites${query}`)
        this.campsites = Array.isArray(data) ? data : (data.data ?? data.campsites ?? [])
      } catch (e) {
        this.error = 'Erreur chargement'
      } finally {
        this.loading = false
      }
    },

    async fetchAvailableCampsites(query = {}) {
      this.loading = true
      this.error = ''
      try {
        const params = new URLSearchParams()
        Object.entries(query).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
        })
        const paramsStr = params.toString()
        const data = await apiFetch(`/api/campsites/available${paramsStr ? '?' + paramsStr : ''}`)
        this.campsites = Array.isArray(data) ? data : (data.data ?? data.campsites ?? [])
      } catch (e) {
        this.error = 'Erreur recherche'
      } finally {
        this.loading = false
      }
    },

    async fetchCampsiteById(id) {
      this.loading = true
      this.error = ''
      try {
        const data = await apiFetch(`/api/campsites/${id}`)
        this.currentCampsite = data
      } catch (e) {
        this.error = 'Erreur détail'
      } finally {
        this.loading = false
      }
    },

    async createCampsite(payload) {
      this.loading = true
      this.error = ''
      try {
        return await apiFetch('/api/campsites', {
          method: 'POST',
          body: JSON.stringify(payload)
        })
      } catch (e) {
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateCampsite(id, payload) {
      this.loading = true
      this.error = ''
      try {
        return await apiFetch(`/api/campsites/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        })
      } catch (e) {
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteCampsite(id) {
      this.loading = true
      this.error = ''
      try {
        await apiFetch(`/api/campsites/${id}`, { method: 'DELETE' })
        await this.fetchCampsites()
      } catch (e) {
        throw e
      } finally {
        this.loading = false
      }
    }
  }
})
