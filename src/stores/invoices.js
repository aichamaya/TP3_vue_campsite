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

export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref([])
  const invoice = ref(null)
  const loading = ref(false)
  const error = ref('')

  async function fetchInvoices(filters = {}) {
    loading.value = true
    error.value = ''
    try {
      const data = await apiFetch(`/api/invoices${buildQuery(filters)}`)
      invoices.value = Array.isArray(data) ? data : (data.invoices ?? [])
      return invoices.value
    } catch (err) {
      error.value = err?.message || 'Erreur chargement des factures.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchInvoice(id) {
    loading.value = true
    error.value = ''
    try {
      const data = await apiFetch(`/api/invoices/${id}`)
      invoice.value = data.invoice ?? data
      return invoice.value
    } catch (err) {
      error.value = err?.message || 'Erreur chargement de la facture.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createInvoice(payload) {
    loading.value = true
    error.value = ''
    try {
      const data = await apiFetch('/api/invoices', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      invoice.value = data.invoice ?? data
      return invoice.value
    } catch (err) {
      error.value = err?.message || 'Erreur création de la facture.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateInvoiceStatus(id, status) {
    loading.value = true
    error.value = ''
    try {
      const data = await apiFetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
      invoice.value = data.invoice ?? data
      return invoice.value
    } catch (err) {
      error.value = err?.message || 'Erreur modification du statut.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { invoices, invoice, loading, error, fetchInvoices, fetchInvoice, createInvoice, updateInvoiceStatus }
})
