import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },

  {
    path: '/verify-email',
    component: () => import('@/views/auth/VerifyEmail.vue')
  },

  // Redirigé après connexion
  {
    path: '/dashboard',
    component: () => import('@/views/user/RootDashboard.vue')
  },

  // Sous-pages si pas encore rattaché
  {
    path: '/user/merchant-choice',
    component: () => import('@/views/user/MerchantChoice.vue')
  },
  {
    path: '/user/join-merchant',
    component: () => import('@/views/user/JoinMerchantRequest.vue')
  },
  {
    path: '/user/create-merchant',
    component: () => import('@/views/user/CreateMerchantRequest.vue')
  },
  {
    path: '/user/pending-requests',
    component: () => import('@/views/user/PendingRequests.vue')
  },

  // Dashboards spécifiques
  {
    path: '/admin/dashboard',
    component: () => import('@/views/admin/Dashboard.vue')
  },
  {
    path: '/merchant/dashboard',
    component: () => import('@/views/merchant/Dashboard.vue')
  },
  {
  path: '/merchant/:id/members',
  name: 'MerchantMembers',
  component: () => import('@/views/merchant/Members.vue')
},
{
  path: '/merchant/:id/credentials',
  name: 'MerchantCredentials',
  component: () => import('@/views/merchant/Credentials.vue')
},
{
  path: '/merchant/:id/transactions',
  name: 'MerchantTransactions',
  component: () => import('@/views/merchant/Transactions.vue')
},
{
  path: '/merchant/:id/refunds',
  name: 'MerchantRefunds',
  component: () => import('@/views/merchant/Refunds.vue')
},
{
  path: '/merchant/:id/edit',
  name: 'MerchantEdit',
  component: () => import('@/views/merchant/Edit.vue')
},
{
  path: '/payment/create/:id',
  name: 'CreateTransaction',
  component: () => import('@/views/payment/CreateTransaction.vue')
},
{
  path: '/payment/script',
  name: 'PaymentScript',
  component: () => import('@/views/payment/PaymentScript.vue')
},
{
  path: '/payment/success',
  name: 'PaymentSuccess',
  component: () => import('@/views/payment/PaymentSuccess.vue')
},
{
  path: '/payment/cancel',
  name: 'PaymentCancel',
  component: () => import('@/views/payment/PaymentCancel.vue')
},
{
  path: '/payment/config',
  name: 'PaymentConfig',
  component: () => import('@/views/payment/PaymentConfig.vue')
}


]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 🧠 Auth Guard pour protéger les routes
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  if (!auth.user && auth.token) {
    await auth.fetchProfile()
  }

  const isAuth = !!auth.user

  if (!isAuth && to.path !== '/login' && to.path !== '/register' && to.path !== '/verify-email') {
    return next('/login')
  }

  next()
})

export default router
