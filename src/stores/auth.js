import { defineStore } from 'pinia'
import { apiFetch } from '../utiles/apiFetch'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user')) || null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    initialize() {
      this.token = localStorage.getItem('token')
      try {
        this.user = JSON.parse(localStorage.getItem('user')) || null
      } catch {
        this.user = null
      }
    },

    async login(email, password) {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      this.token = data.token
      this.user = data.user
      localStorage.setItem('token', this.token)
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    async register(user) {
      return await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(user)
      })
    },

    async fetchProfile() {
      try {
        const data = await apiFetch('/api/auth/profile')
        this.user = data
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (e) {
        if (e.status === 401) {
          this.logout()
        }
      }
    },

    async updateProfile(payload) {
      this.loading = true
      this.error = ''
      try {
        const data = await apiFetch('/api/auth/profile', {
          method: 'PUT',
          body: JSON.stringify(payload)
        })
        this.user = data
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (e) {
        throw e
      } finally {
        this.loading = false
      }
    },

    async changePassword(payload) {
      this.loading = true
      this.error = ''
      try {
        return await apiFetch('/api/auth/password', {
          method: 'PATCH',
          body: JSON.stringify(payload)
        })
      } catch (e) {
        throw e
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})
