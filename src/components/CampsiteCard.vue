<template>
  <div class="flex h-full flex-col bg-white rounded-xl shadow p-4 space-y-3">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="font-bold text-lg">
          {{ campsite.name }}
        </h3>
        <p class="text-sm text-slate-500">
          {{ campsite.location }}
        </p>
      </div>

      <span class="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
        {{ campsite.type }}
      </span>
    </div>

    <p class="text-sm text-slate-600">
      {{ campsite.description }}
    </p>

    <div class="flex gap-3 text-sm text-slate-500">
      <span>{{ campsite.capacity }} pers.</span>
      <span v-if="campsite.maxVehicleLength"> {{ campsite.maxVehicleLength }} m </span>
    </div>

    <div v-if="campsite.amenities && campsite.amenities.length" class="flex flex-wrap gap-1">
      <span
        v-for="a in campsite.amenities"
        :key="a"
        class="text-xs bg-orange-50 border border-orange-200 text-orange-700 px-2 py-0.5 rounded-full"
      >
        {{ amenityIcon(a) }} {{ a }}
      </span>
    </div>

    <div class="mt-auto flex justify-between items-center pt-4 border-t">
      <p class="text-orange-500 font-bold text-lg">{{ campsite.pricePerNight }}$ / nuit</p>

      <RouterLink
        v-if="!auth.isAdmin"
        :to="{ name: 'campsite-detail', params: { id: campsite._id } }"
        class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
      >
        Réserver
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps({
  campsite: Object,
})

const auth = useAuthStore()

const AMENITY_ICONS = {
  électricité: '⚡',
  eau: '💧',
  égout: '🔧',
  'feu de camp': '🔥',
  'table de pique-nique': '🪑',
  abri: '⛺',
  wifi: '📶',
  douche: '🚿',
  toilettes: '🚻',
}

function amenityIcon(name) {
  return AMENITY_ICONS[name] || '•'
}
</script>
<style scoped>
.campsite-card {
  display: grid;
  gap: 0.85rem;
  height: 100%;
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 1.25rem;
  background: var(--color-surface);
  transition: box-shadow 0.2s;
}

.campsite-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.card-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
}

.card-location {
  margin-top: 0.2rem;
  color: var(--color-text-soft);
  font-size: 0.85rem;
}

.card-badge {
  flex-shrink: 0;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: var(--color-accent-soft);
  color: var(--color-accent-dark);
  font-size: 0.75rem;
  font-weight: 700;
}

.card-description {
  color: var(--color-text-soft);
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 0.85rem;
  color: var(--color-text-soft);
  background: #f5f5f5;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.card-amenities {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.amenity-tag {
  font-size: 0.78rem;
  color: var(--color-text-soft);
  background: #fef3dc;
  border: 1px solid #fde4b0;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: auto;
  padding-top: 0.85rem;
  border-top: 1px solid var(--color-border);
}

.card-price strong {
  font-size: 1.25rem;
  color: var(--color-accent-dark);
}

.card-price span {
  margin-left: 0.2rem;
  font-size: 0.85rem;
  color: var(--color-text-soft);
}

.card-action {
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  background: var(--color-accent);
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.card-action:hover {
  background: var(--color-accent-dark);
}
</style>
