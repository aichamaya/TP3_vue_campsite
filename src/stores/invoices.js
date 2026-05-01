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

  if (Array.isArray(response?.data?.invoices)) {
    return response.data.invoices
  }

  if (Array.isArray(response)) {
    return response
  }

  return []
}

function getItemFromResponse(response) {
  return response?.data?.invoice || response?.data || response
}

export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref([])
  const invoice = ref(null)
  const loading = ref(false)
  const error = ref('')

  async function fetchInvoices(filters = {}) {
    loading.value = true
    error.value = ''

    try {
      const response = await apiFetch(`/api/invoices${buildQueryString(filters)}`)
      invoices.value = getListFromResponse(response)
      return invoices.value
    } catch (err) {
      invoices.value = []
      error.value = err?.data?.message || err?.message || 'Erreur lors du chargement des factures.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchInvoice(id) {
    loading.value = true
    error.value = ''

    try {
      const response = await apiFetch(`/api/invoices/${id}`)
      invoice.value = getItemFromResponse(response)
      return invoice.value
    } catch (err) {
      invoice.value = null
      error.value = err?.data?.message || err?.message || 'Erreur lors du chargement de la facture.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createInvoice(payload) {
    loading.value = true
    error.value = ''

    try {
      const response = await apiFetch('/api/invoices', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      invoice.value = getItemFromResponse(response)
      return invoice.value
    } catch (err) {
      error.value =
        err?.data?.message || err?.message || 'Erreur lors de la creation de la facture.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateInvoiceStatus(id, status) {
    loading.value = true
    error.value = ''

    try {
      const response = await apiFetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      invoice.value = getItemFromResponse(response)
      return invoice.value
    } catch (err) {
      error.value =
        err?.data?.message ||
        err?.message ||
        'Erreur lors de la modification du statut de la facture.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    invoices,
    invoice,
    loading,
    error,
    fetchInvoices,
    fetchInvoice,
    createInvoice,
    updateInvoiceStatus,
  }
})
