<template>
  <section class="auth-view">
    <div class="auth-card">
      <div class="auth-card-head">
        <h1>Se connecter</h1>
        <p>Entre ton courriel et ton mot de passe pour acceder a ton compte.</p>
      </div>

      <AlertMessage v-if="error" type="error" :message="error" @close="error = ''" />

      <form class="auth-form" novalidate @submit.prevent="handleSubmit">
        <label class="field-group">
          <span>Courriel</span>
          <input v-model="form.email" type="email" autocomplete="email" />
          <small v-if="errors.email" class="field-error">{{ errors.email }}</small>
        </label>

        <label class="field-group">
          <span>Mot de passe</span>
          <input v-model="form.password" type="password" autocomplete="current-password" />
          <small v-if="errors.password" class="field-error">{{ errors.password }}</small>
        </label>

        <button type="submit" class="submit-button" :disabled="loading">
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>

      <p class="auth-switch">
        Pas encore de compte ?
        <RouterLink :to="{ name: 'register' }" class="auth-switch-link">Inscription</RouterLink>
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AlertMessage from '@/components/AlertMessage.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = ref({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')
const errors = ref({})

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getErrorMessage(err) {
  return err?.data?.message || err?.message || 'Erreur de connexion.'
}

function validateForm() {
  errors.value = {}

  if (!form.value.email.trim()) {
    errors.value.email = 'Le courriel est requis.'
  } else if (!isValidEmail(form.value.email)) {
    errors.value.email = 'Le courriel doit etre valide.'
  }

  if (!form.value.password) {
    errors.value.password = 'Le mot de passe est requis.'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  error.value = ''

  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    await auth.login(form.value.email, form.value.password)
    router.push(route.query.redirect || '/')
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
.auth-view {
  display: grid;
  place-items: center;
  min-height: calc(100vh - 12rem);
  padding: 1rem 0 2rem;
}

.auth-card {
  width: min(100%, 480px);
  padding: 2.5rem;
  border-radius: 1.5rem;
  background: #ffffff;
  border: none;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.auth-card-head h1 {
  margin-top: 0.5rem;
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-text);
}

.auth-card-head p {
  margin-top: 0.4rem;
  color: var(--color-text-soft);
  font-size: 0.92rem;
}

.auth-kicker {
  display: inline-flex;
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  background: var(--color-accent-soft);
  color: var(--color-accent-dark);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.auth-form {
  display: grid;
  gap: 1.1rem;
  margin-top: 1.75rem;
}

.field-group {
  display: grid;
  gap: 0.4rem;
}

.field-group span {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text);
}

.field-group input {
  min-height: 2.8rem;
  padding: 0.7rem 1rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #f9fafb;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.field-group input:focus {
  outline: none;
  border-color: var(--color-accent);
  background: #fff;
}

.field-error {
  color: #dc2626;
  font-size: 0.82rem;
  font-weight: 600;
}

.submit-button {
  margin-top: 0.5rem;
  min-height: 2.9rem;
  border: none;
  border-radius: 999px;
  background: var(--color-accent);
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  transition:
    background 0.2s,
    transform 0.1s;
}

.submit-button:hover:not(:disabled) {
  background: var(--color-accent-dark);
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-switch {
  margin-top: 1.25rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--color-text-soft);
}

.auth-switch-link {
  margin-left: 0.3rem;
  color: var(--color-accent-dark);
  font-weight: 700;
}

@media (max-width: 700px) {
  .auth-card {
    padding: 1.25rem;
  }
}
</style>
