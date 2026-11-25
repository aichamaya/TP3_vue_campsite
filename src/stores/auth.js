import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { apiFetch } from '../utiles/apiFetch'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const error = ref(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => {
    if (!token.value) return false

    try {
      const decoded = jwtDecode(token.value)
      const now = Date.now() / 1000
      return typeof decoded.exp === 'number' && decoded.exp > now
    } catch {
      return false
    }
  })

  const isAdmin = computed(() => user.value?.role === 'admin')

  function initialize() {
    token.value = localStorage.getItem('token')

    try {
      user.value = JSON.parse(localStorage.getItem('user')) || null
    } catch {
      user.value = null
    }
  }

  async function login(email, password) {
    loading.value = true
    error.value = null

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      token.value = data.token
      user.value = data.user || null

      localStorage.setItem('token', token.value)

      if (user.value) {
        localStorage.setItem('user', JSON.stringify(user.value))
      }

      return data
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(payload) {
    return await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async function fetchProfile() {
    try {
      const data = await apiFetch('/api/auth/profile')
      user.value = data
      localStorage.setItem('user', JSON.stringify(user.value))
      return data
    } catch (e) {
      if (e.status === 401) {
        logout()
      }
      throw e
    }
  }

  async function updateProfile(payload) {
    loading.value = true
    error.value = null

    try {
      const data = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })

      user.value = data
      localStorage.setItem('user', JSON.stringify(user.value))

      return data
    } catch (e) {
      error.value = e
      throw e
    } finally {
      loading.value = false
    }
  }

  async function changePassword(payload) {
    loading.value = true
    error.value = null

    try {
      return await apiFetch('/api/auth/password', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    } catch (e) {
      error.value = e
      throw e
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    token,
    user,
    error,
    loading,
    isAuthenticated,
    isAdmin,
    initialize,
    login,
    register,
    fetchProfile,
    updateProfile,
    changePassword,
    logout,
  }
})
// une fonction pour decoder le jwt
