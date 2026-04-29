<template>
  <article class="campsite-card">
    <div class="card-head">
      <div>
        <h3>{{ campsite.name }}</h3>
        <p class="card-location">{{ campsite.location }}</p>
      </div>
      <span class="card-badge">{{ typeLabel }}</span>
    </div>

    <p class="card-description">{{ campsite.description }}</p>

    <div class="card-meta">
      <span>{{ campsite.capacity }} personnes</span>
      <span v-if="campsite.maxVehicleLength">VR {{ campsite.maxVehicleLength }} m</span>
      <span v-for="item in amenityPreview" :key="item">{{ item }}</span>
    </div>

    <div class="card-footer">
      <div class="card-price">
        <strong>{{ campsite.pricePerNight }} $</strong>
        <span>/ nuit</span>
      </div>

      <RouterLink
        :to="{ name: 'campsite-detail', params: { id: campsite._id } }"
        class="card-action"
      >
        Voir details
      </RouterLink>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  campsite: { type: Object, required: true },
})

const typeLabel = computed(() => {
  if (props.campsite.type === 'tente') return 'Tente'
  if (props.campsite.type === 'rv') return 'VR'
  if (props.campsite.type === 'chalet') return 'Chalet'
  if (props.campsite.type === 'glamping') return 'Glamping'
  if (props.campsite.type === 'arriere-pays' || props.campsite.type === 'arrière-pays')
    return 'Arriere-pays'
  return 'Autre'
})

const amenityPreview = computed(() => props.campsite.amenities?.slice(0, 3) || [])
</script>
<style scoped>
.campsite-card {
  display: grid;
  gap: 0.95rem;
  height: 100%;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background: var(--color-surface);
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.card-head h3 {
  font-size: 1.05rem;
  color: var(--color-text);
}

.card-location {
  margin-top: 0.3rem;
  color: var(--color-text-soft);
  font-size: 0.88rem;
}

.card-badge {
  display: inline-flex;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  background: var(--color-accent-soft);
  color: var(--color-accent-dark);
  font-size: 0.75rem;
  font-weight: 700;
}

.card-description {
  color: var(--color-text-soft);
  line-height: 1.5;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  color: var(--color-text-soft);
  font-size: 0.88rem;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: auto;
  padding-top: 0.9rem;
  border-top: 1px solid #e9eff5;
}

.card-price strong {
  color: var(--color-accent-dark);
  font-size: 1.3rem;
}

.card-price span {
  margin-left: 0.2rem;
  color: var(--color-text-soft);
  font-size: 0.9rem;
}

.card-action {
  padding: 0.6rem 0.9rem;
  border-radius: 999px;
  background: var(--color-accent);
  color: #ffffff;
  font-weight: 700;
}
</style>
