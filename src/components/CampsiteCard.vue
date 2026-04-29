<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">{{ campsite.name }}</h5>
      <span class="badge">{{ campsite.type }}</span>
      <p>{{ campsite.location }}</p>
      <p>{{ campsite.pricePerNight }} $/nuit</p>
      <p>Capacité : {{ campsite.capacity }}</p>
      <p>{{ campsite.description }}</p>
      <router-link :to="`/campsites/${campsite._id}`" class="btn btn-primary">Réserver</router-link>
    </div>
  </div>
</template>

<script setup>
defineProps({
  campsite: {
    type: Object,
    required: true
  }
})
</script>
