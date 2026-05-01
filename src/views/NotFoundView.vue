<template>
  <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-slate-50 px-4">
    <div class="text-center max-w-md">
     
      <div class="flex justify-center mb-8">
        <div class="relative">
          <svg viewBox="0 0 200 180" class="w-48 h-48" fill="none">
            
            <polygon
              points="100,20 175,150 25,150"
              fill="#dbeafe"
              stroke="#3b82f6"
              stroke-width="3"
            />
            <polygon points="100,55 145,150 55,150" fill="#bfdbfe" />
            
            <polygon
              points="100,20 120,60 80,60"
              fill="white"
              stroke="#3b82f6"
              stroke-width="1.5"
            />
            <!-- "404" on mountain -->
            <text
              x="75"
              y="120"
              font-size="24"
              font-weight="bold"
              fill="#1d4ed8"
              font-family="sans-serif"
            >
              404
            </text>
            <!-- Stars -->
            <circle cx="30" cy="30" r="3" fill="#f59e0b" />
            <circle cx="165" cy="25" r="2" fill="#f59e0b" />
            <circle cx="50" cy="70" r="1.5" fill="#93c5fd" />
            <circle cx="160" cy="60" r="2.5" fill="#93c5fd" />
            <!-- Flag on top -->
            <line x1="100" y1="20" x2="100" y2="5" stroke="#f59e0b" stroke-width="2" />
            <polygon points="100,5 115,10 100,15" fill="#f59e0b" />
          </svg>
        </div>
      </div>

      <h1 class="text-5xl font-extrabold text-blue-900 mb-3">Oups !</h1>
      <h2 class="text-xl font-bold text-slate-700 mb-3">Page introuvable</h2>
      <p class="text-slate-500 mb-8 leading-relaxed">
        La page que vous cherchez n'existe pas ou a été déplacée.<br />
        Peut-être avez-vous emprunté le mauvais sentier ?
      </p>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <RouterLink
          :to="{ name: 'home' }"
          class="bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Retour à l'accueil
        </RouterLink>
        <RouterLink
          :to="{ name: 'campsites' }"
          class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Voir les emplacements
        </RouterLink>
      </div>
    </div>
  </div>
</template>


<script setup>
import { RouterLink } from 'vue-router'
</script>
