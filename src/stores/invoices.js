import { defineStore } from 'pinia'

export const useInvoicesStore = defineStore('invoices', {
  state: () => ({
    invoices: [],
    currentInvoice: null
  }),
  actions: {}
})
