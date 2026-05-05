<template>
  <section class="max-w-5xl mx-auto space-y-6">
    <div class="page-header">
      <div>
        <h1 class="page-title">Emplacements</h1>
      </div>
      <span class="count-badge"
        >{{ campsitesStore.campsites.length }} emplacement(s) trouvé(s)</span
      >
    </div>

    <div class="filter-bar">
      <select v-model="type" @change="load" class="filter-select">
        <option value="">Tous les types</option>
        <option value="tente">Tente</option>
        <option value="vr">VR</option>
        <option value="chalet">Chalet</option>
        <option value="glamping">Glamping</option>
        <option value="arrière-pays">Arrière-pays</option>
        <option value="autre">Autre</option>
      </select>

      <button @click="resetFilter" class="reset-btn">Réinitialiser</button>
    </div>

    <div v-if="campsitesStore.campsites.length" class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <CampsiteCard v-for="c in campsitesStore.campsites" :key="c._id" :campsite="c" />
    </div>

    <div v-else class="empty-state">
      <p>Aucun emplacement trouvé pour ce filtre.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCampsitesStore } from '@/stores/campsites'
import CampsiteCard from '@/components/CampsiteCard.vue'

const campsitesStore = useCampsitesStore()
const type = ref('')

onMounted(() => load())

function load() {
  campsitesStore.fetchCampsites({ type: type.value || undefined })
}

function resetFilter() {
  type.value = ''
  load()
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-text);
}

.page-sub {
  margin-top: 0.25rem;
  font-size: 0.9rem;
  color: var(--color-text-soft);
}

.count-badge {
  background: var(--color-accent-soft);
  color: var(--color-accent-dark);
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  white-space: nowrap;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.55rem 1rem;
  border: 1.5px solid var(--color-border);
  border-radius: 0.6rem;
  background: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text);
  cursor: pointer;
  min-width: 180px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-accent);
}

.reset-btn {
  padding: 0.55rem 1.1rem;
  border-radius: 0.6rem;
  border: 1.5px solid var(--color-border);
  background: #fff;
  font-weight: 600;
  font-size: 0.88rem;
  color: var(--color-text-soft);
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent-dark);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-soft);
  font-size: 1rem;
}
</style>
