<template>
  <div v-if="message" class="alert-message" :class="`alert-${type}`" role="alert">
    <div class="alert-content">
      <p v-if="titre" class="alert-title">{{ titre }}</p>
      <p class="alert-text">{{ message }}</p>
    </div>

    <button type="button" class="alert-close" aria-label="Fermer" @click="emit('close')">×</button>
  </div>
</template>

<script setup>
defineProps({
  titre: { type: String, default: '' },
  message: { type: String, default: '' },
  type: { type: String, default: 'info' },
})

const emit = defineEmits(['close'])
</script>
<style scoped>
.alert-message {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.9rem 1rem;
  border: 1px solid;
  border-radius: 0.9rem;
}

.alert-info {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
}

.alert-success {
  background: #ecfdf3;
  border-color: #a7f3d0;
  color: #166534;
}

.alert-error {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}

.alert-warning {
  background: #fffbeb;
  border-color: #fde68a;
  color: #b45309;
}

.alert-content {
  display: grid;
  gap: 0.2rem;
}

.alert-title {
  font-weight: 600;
}

.alert-text {
  line-height: 1.45;
}

.alert-close {
  border: none;
  background: transparent;
  color: inherit;
  font-size: 1.3rem;
  line-height: 1;
}
</style>
