import { defineStore } from 'pinia'

export const useCampsitesStore = defineStore('campsites', {
  state: () => ({
    campsites: [],
    currentCampsite: null
  }),
  actions: {}
})
