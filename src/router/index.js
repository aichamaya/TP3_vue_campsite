import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/connexion', name: 'login', component: () => import('@/views/LoginView.vue') },
    { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue') },
    { path: '/campsites', name: 'campsites', component: () => import('@/views/CampsitesView.vue') },
    {
      path: '/campsites/:id',
      name: 'campsite-detail',
      component: () => import('@/views/CampsiteDetailView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reservations',
      name: 'reservations',
      component: () => import('@/views/ReservationsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reservations/:id',
      name: 'reservation-detail',
      component: () => import('@/views/ReservationDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/campsites',
      name: 'admin-campsites',
      component: () => import('@/views/admin/AdminCampsitesView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/reservations',
      name: 'admin-reservations',
      component: () => import('@/views/admin/AdminReservationsView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/invoices',
      name: 'admin-invoices',
      component: () => import('@/views/admin/AdminInvoicesView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    { path: '/login', redirect: { name: 'login' } },
    { path: '/inscription', redirect: { name: 'register' } },
    { path: '/emplacements', redirect: { name: 'campsites' } },
    {
      path: '/emplacements/:id',
      redirect: (to) => ({ name: 'campsite-detail', params: { id: to.params.id } }),
    },
    { path: '/profil', redirect: { name: 'profile' } },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  auth.syncExpiredToken()

  if ((to.name === 'login' || to.name === 'register') && auth.isAuthenticated) {
    return { name: 'home' }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'home' }
  }
})

export default router
