<template>
  <section class="auth-view">
    <div class="auth-card auth-card-wide">
      <div class="auth-card-head">
        <span class="auth-kicker">Inscription</span>
        <h1>Creer un compte</h1>
        <p>Remplis les informations demandees pour acceder a ton espace.</p>
      </div>

      <AlertMessage v-if="success" type="success" :message="success" @close="success = ''" />
      <AlertMessage v-if="error" type="error" :message="error" @close="error = ''" />

      <form class="auth-form" novalidate @submit.prevent="handleSubmit">
        <div class="split-fields">
          <label class="field-group">
            <span>Prenom</span>
            <input v-model="form.firstName" type="text" autocomplete="given-name" />
            <small v-if="errors.firstName" class="field-error">{{ errors.firstName }}</small>
          </label>

          <label class="field-group">
            <span>Nom</span>
            <input v-model="form.lastName" type="text" autocomplete="family-name" />
            <small v-if="errors.lastName" class="field-error">{{ errors.lastName }}</small>
          </label>
        </div>

        <label class="field-group">
          <span>Courriel</span>
          <input v-model="form.email" type="email" autocomplete="email" />
          <small v-if="errors.email" class="field-error">{{ errors.email }}</small>
        </label>

        <label class="field-group">
          <span>Telephone</span>
          <input v-model="form.phone" type="tel" autocomplete="tel" placeholder="5141234567" />
          <small v-if="errors.phone" class="field-error">{{ errors.phone }}</small>
        </label>

        <div class="split-fields">
          <label class="field-group">
            <span>Mot de passe</span>
            <input v-model="form.password" type="password" autocomplete="new-password" />
            <small v-if="errors.password" class="field-error">{{ errors.password }}</small>
          </label>

          <label class="field-group">
            <span>Confirmation</span>
            <input v-model="form.passwordConfirm" type="password" autocomplete="new-password" />
            <small v-if="errors.passwordConfirm" class="field-error">
              {{ errors.passwordConfirm }}
            </small>
          </label>
        </div>

        <button type="submit" class="submit-button" :disabled="loading">
          {{ loading ? 'Creation...' : 'Creer mon compte' }}
        </button>
      </form>

      <p class="auth-switch">
        Deja inscrit ?
        <RouterLink :to="{ name: 'login' }" class="auth-switch-link">Connexion</RouterLink>
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AlertMessage from '@/components/AlertMessage.vue'

const auth = useAuthStore()
const router = useRouter()

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
})

const loading = ref(false)
const error = ref('')
const errors = ref({})
const success = ref('')

const phoneDigits = computed(() => form.value.phone.replace(/\D/g, ''))

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getErrorMessage(err) {
  return err?.data?.message || err?.message || "Erreur lors de l'inscription."
}

function validateForm() {
  errors.value = {}

  if (!form.value.firstName.trim()) errors.value.firstName = 'Le prenom est requis.'
  if (!form.value.lastName.trim()) errors.value.lastName = 'Le nom est requis.'
  if (!form.value.email.trim()) {
    errors.value.email = 'Le courriel est requis.'
  } else if (!isValidEmail(form.value.email)) {
    errors.value.email = 'Le courriel doit etre valide.'
  }
  if (phoneDigits.value.length !== 10) {
    errors.value.phone = 'Le telephone doit contenir exactement 10 chiffres.'
  }
  if (!form.value.password) errors.value.password = 'Le mot de passe est requis.'
  if (!form.value.passwordConfirm) {
    errors.value.passwordConfirm = 'La confirmation est requise.'
  } else if (form.value.password !== form.value.passwordConfirm) {
    errors.value.passwordConfirm = 'Les mots de passe ne correspondent pas.'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  error.value = ''
  success.value = ''

  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    await auth.register({
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      email: form.value.email.trim(),
      password: form.value.password,
      phone: phoneDigits.value,
    })

    success.value = 'Compte cree avec succes. Redirection vers la connexion...'
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 2000)
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
  width: min(100%, 760px);
  padding: 1.75rem;
  border-radius: 1.5rem;
  background: #ffffff;
  border: 1px solid #d9e2ec;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.auth-card-head h1 {
  margin-top: 0.75rem;
  font-size: 2rem;
  color: #102a43;
}

.auth-card-head p {
  margin-top: 0.5rem;
  color: #52606d;
}

.auth-kicker {
  display: inline-flex;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: #eaf2fb;
  color: #2b6cb0;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.auth-form {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}

.split-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.field-group {
  display: grid;
  gap: 0.45rem;
}

.field-group span {
  font-size: 0.92rem;
  font-weight: 700;
  color: #243b53;
}

.field-group input {
  min-height: 3rem;
  padding: 0.85rem 1rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.9rem;
  background: #f8fafc;
}

.field-error {
  color: #b91c1c;
  font-weight: 700;
}

.submit-button {
  min-height: 3rem;
  border: none;
  border-radius: 999px;
  background: #2b6cb0;
  color: #ffffff;
  font-weight: 700;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-switch {
  margin-top: 1.25rem;
  text-align: center;
  color: #52606d;
}

.auth-switch-link {
  margin-left: 0.35rem;
  color: #2b6cb0;
  font-weight: 700;
}

@media (max-width: 700px) {
  .auth-card {
    padding: 1.25rem;
  }

  .split-fields {
    grid-template-columns: 1fr;
  }
}
</style>
