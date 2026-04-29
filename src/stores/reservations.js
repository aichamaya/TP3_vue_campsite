import { defineStore } from 'pinia'

export const useReservationsStore = defineStore('reservations', {
  state: () => ({
    reservations: [],
    currentReservation: null
  }),
  actions: {}
})
