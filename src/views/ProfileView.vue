<template>
  <section class="profile-view">
    <div class="profile-header">
      <span class="section-kicker">Profil</span>
      <h1>Mon compte</h1>
      <p>Consulte et modifie tes informations personnelles.</p>
    </div>

    <div class="profile-grid">
      <section class="profile-card">
        <h2>Informations personnelles</h2>

        <AlertMessage
          v-if="profileSuccess"
          type="success"
          :message="profileSuccess"
          @close="profileSuccess = ''"
        />
        <AlertMessage
          v-if="profileError"
          type="error"
          :message="profileError"
          @close="profileError = ''"
        />

        <form class="profile-form" novalidate @submit.prevent="handleProfileSave">
          <div class="split-fields">
            <label class="field-group">
              <span>Prenom</span>
              <input v-model="profileForm.firstName" type="text" />
              <small v-if="profileErrors.firstName" class="field-error">
                {{ profileErrors.firstName }}
              </small>
            </label>

            <label class="field-group">
              <span>Nom</span>
              <input v-model="profileForm.lastName" type="text" />
              <small v-if="profileErrors.lastName" class="field-error">
                {{ profileErrors.lastName }}
              </small>
            </label>
          </div>

          <label class="field-group">
            <span>Courriel</span>
            <input v-model="profileForm.email" type="email" readonly />
          </label>

          <label class="field-group">
            <span>Telephone</span>
            <input v-model="profileForm.phone" type="tel" />
            <small v-if="profileErrors.phone" class="field-error">{{ profileErrors.phone }}</small>
          </label>

          <button type="submit" class="primary-button" :disabled="profileLoading">
            {{ profileLoading ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </form>
      </section>

      <section class="profile-card">
        <h2>Changer le mot de passe</h2>

        <AlertMessage
          v-if="passwordSuccess"
          type="success"
          :message="passwordSuccess"
          @close="passwordSuccess = ''"
        />
        <AlertMessage
          v-if="passwordError"
          type="error"
          :message="passwordError"
          @close="passwordError = ''"
        />

        <form class="profile-form" novalidate @submit.prevent="handlePasswordChange">
          <label class="field-group">
            <span>Mot de passe actuel</span>
            <input v-model="passwordForm.currentPassword" type="password" />
            <small v-if="passwordErrors.currentPassword" class="field-error">
              {{ passwordErrors.currentPassword }}
            </small>
          </label>

          <label class="field-group">
            <span>Nouveau mot de passe</span>
            <input v-model="passwordForm.newPassword" type="password" />
            <small v-if="passwordErrors.newPassword" class="field-error">
              {{ passwordErrors.newPassword }}
            </small>
          </label>

          <label class="field-group">
            <span>Confirmation</span>
            <input v-model="passwordForm.passwordConfirm" type="password" />
            <small v-if="passwordErrors.passwordConfirm" class="field-error">
              {{ passwordErrors.passwordConfirm }}
            </small>
          </label>

          <button type="submit" class="primary-button" :disabled="passwordLoading">
            {{ passwordLoading ? 'Modification...' : 'Modifier' }}
          </button>
        </form>
      </section>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AlertMessage from '@/components/AlertMessage.vue'

const auth = useAuthStore()

const profileForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  passwordConfirm: '',
})

const profileLoading = ref(false)
const passwordLoading = ref(false)
const profileError = ref('')
const profileSuccess = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')
const profileErrors = ref({})
const passwordErrors = ref({})

function fillProfileForm() {
  profileForm.value = {
    firstName: auth.user?.firstName || '',
    lastName: auth.user?.lastName || '',
    email: auth.user?.email || '',
    phone: auth.user?.phone || '',
  }
}

function getErrorMessage(err, fallbackMessage) {
  return err?.data?.message || err?.message || fallbackMessage
}

async function handleProfileSave() {
  profileError.value = ''
  profileSuccess.value = ''
  profileErrors.value = {}

  const phoneDigits = profileForm.value.phone.replace(/\D/g, '')
  if (!profileForm.value.firstName.trim()) profileErrors.value.firstName = 'Le prenom est requis.'
  if (!profileForm.value.lastName.trim()) profileErrors.value.lastName = 'Le nom est requis.'
  if (phoneDigits.length !== 10) {
    profileErrors.value.phone = 'Le telephone doit contenir exactement 10 chiffres.'
  }

  if (Object.keys(profileErrors.value).length) {
    return
  }

  profileLoading.value = true

  try {
    await auth.updateProfile({
      firstName: profileForm.value.firstName.trim(),
      lastName: profileForm.value.lastName.trim(),
      phone: phoneDigits,
    })
    fillProfileForm()
    profileSuccess.value = 'Profil mis a jour avec succes.'
  } catch (err) {
    profileError.value = getErrorMessage(err, 'Erreur lors de la mise a jour du profil.')
  } finally {
    profileLoading.value = false
  }
}

async function handlePasswordChange() {
  passwordError.value = ''
  passwordSuccess.value = ''
  passwordErrors.value = {}

  if (!passwordForm.value.currentPassword) {
    passwordErrors.value.currentPassword = 'Le mot de passe actuel est requis.'
  }
  if (!passwordForm.value.newPassword) {
    passwordErrors.value.newPassword = 'Le nouveau mot de passe est requis.'
  }
  if (!passwordForm.value.passwordConfirm) {
    passwordErrors.value.passwordConfirm = 'La confirmation est requise.'
  } else if (passwordForm.value.newPassword !== passwordForm.value.passwordConfirm) {
    passwordErrors.value.passwordConfirm = 'Les mots de passe ne correspondent pas.'
  }

  if (Object.keys(passwordErrors.value).length) {
    return
  }

  passwordLoading.value = true

  try {
    await auth.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })
    passwordSuccess.value = 'Mot de passe modifie avec succes.'
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      passwordConfirm: '',
    }
  } catch (err) {
    passwordError.value = getErrorMessage(err, 'Erreur lors du changement de mot de passe.')
  } finally {
    passwordLoading.value = false
  }
}

onMounted(async () => {
  if (!auth.user) {
    await auth.fetchProfile()
  }
  fillProfileForm()
})
</script>
<style scoped>
.profile-view {
  display: grid;
  gap: 1.5rem;
}

.profile-header h1 {
  margin-top: 0.75rem;
  font-size: 2rem;
  color: #102a43;
}

.profile-header p {
  margin-top: 0.5rem;
  color: #52606d;
}

.section-kicker {
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

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.profile-card {
  padding: 1.5rem;
  border-radius: 1.25rem;
  background: #ffffff;
  border: 1px solid #d9e2ec;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
}

.profile-card h2 {
  margin-bottom: 1rem;
  color: #102a43;
}

.profile-form {
  display: grid;
  gap: 1rem;
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

.field-group input[readonly] {
  background: #edf2f7;
  color: #52606d;
}

.field-error {
  color: #b91c1c;
  font-weight: 700;
}

.primary-button {
  min-height: 3rem;
  border: none;
  border-radius: 999px;
  background: #2b6cb0;
  color: #ffffff;
  font-weight: 700;
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .profile-grid,
  .split-fields {
    grid-template-columns: 1fr;
  }
}
</style>

