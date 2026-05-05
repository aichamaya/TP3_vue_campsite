import { defineStore } from 'pinia'
import { apiFetch } from '../utiles/apiFetch'

export const useReservationsStore = defineStore('reservations', {
  state: () => ({
    reservations: [],
    reservation: null,
    loading: false,
    error: ''
  }),

  actions: {
    async fetchReservations() {
      this.loading = true
      this.error = ''
      try {
        const data = await apiFetch('/api/reservations')
        this.reservations = Array.isArray(data) ? data : (data.reservations ?? data.data ?? [])
      } catch (e) {
        this.error = 'Erreur chargement'
      } finally {
        this.loading = false
      }
    },

    async fetchReservation(id) {
      this.loading = true
      this.error = ''
      try {
        const data = await apiFetch(`/api/reservations/${id}`)
        this.reservation = data
      } catch (e) {
        this.error = 'Erreur détail'
      } finally {
        this.loading = false
      }
    },

    async createReservation(payload) {
      this.loading = true
      this.error = ''
      try {
        const data = await apiFetch('/api/reservations', {
          method: 'POST',
          body: JSON.stringify(payload)
        })
        this.reservation = data
      } catch (e) {
        this.error = e?.message || 'Erreur création'
        throw e
      } finally {
        this.loading = false
      }
    },

    async cancelReservation(id) {
      this.loading = true
      this.error = ''
      try {
        await apiFetch(`/api/reservations/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'cancelled' })
        })
        await this.fetchReservations()
      } catch (e) {
        this.error = e?.message || 'Erreur annulation'
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateReservationStatus(id, status) {
      this.loading = true
      this.error = ''
      try {
        const data = await apiFetch(`/api/reservations/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        })
        this.reservation = data
        return data
      } catch (e) {
        this.error = e?.message || 'Erreur modification statut'
        throw e
      } finally {
        this.loading = false
      }
    }
  }
})
