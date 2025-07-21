import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Auth Views
import Login from '@/views/auth/Login.vue'

// User Views  
import UserDashboard from '@/views/user/Dashboard.vue'

// Admin Views
import AdminDashboard from '@/views/admin/Dashboard.vue'

// Merchant Views (à créer)
const MerchantDashboard = () => import('@/views/merchant/Dashboard.vue')

const routes = [
  // Routes publiques
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false, redirectIfAuth: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false, redirectIfAuth: true }
  },
  {
    path: '/verify-email',
    name: 'VerifyEmail',
    component: VerifyEmail,
    meta: { requiresAuth: false }
  },
  {
    path: '/merchant-selection',
    name: 'MerchantSelection',
    component: MerchantSelection,
    meta: { requiresAuth: true }
  },
  {
    path: '/apply-merchant',
    name: 'MerchantApplication',
    component: MerchantApplication,
    meta: { requiresAuth: true }
  },
  {
    path: '/api-test',
    name: 'ApiTest',
    component: ApiTest,
    meta: { requiresAuth: false }
  },

  // Routes Admin
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { 
      requiresAuth: true, 
      requiresRole: 'admin',
      title: 'Administration - Dashboard'
    }
  },
  {
    path: '/admin/merchant-requests',
    name: 'AdminMerchantRequests',
    component: AdminMerchantRequests,
    meta: { 
      requiresAuth: true, 
      requiresRole: 'admin',
      title: 'Administration - Demandes Marchands'
    }
  },
  {
    path: '/admin/merchants',
    name: 'AdminMerchantManagement',
    component: AdminMerchantManagement,
    meta: { 
      requiresAuth: true, 
      requiresRole: 'admin',
      title: 'Administration - Gestion Marchands'
    }
  },
  {
    path: '/admin/transactions',
    name: 'AdminTransactionManagement',
    component: AdminTransactionManagement,
    meta: { 
      requiresAuth: true, 
      requiresRole: 'admin',
      title: 'Administration - Gestion Transactions'
    }
  },
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: AdminSettings,
    meta: { 
      requiresAuth: true, 
      requiresRole: 'admin',
      title: 'Administration - Paramètres'
    }
  },

  // Routes Merchant
  {
    path: '/merchant',
    name: 'MerchantDashboard',
    component: MerchantDashboard,
    meta: { 
      requiresAuth: true, 
      requiresRole: ['merchant', 'admin'],
      title: 'Marchand - Dashboard'
    }
  },
  {
    path: '/merchant/transactions',
    name: 'MerchantTransactions',
    component: MerchantTransactions,
    meta: { 
      requiresAuth: true, 
      requiresRole: ['merchant', 'admin'],
      title: 'Marchand - Transactions'
    }
  },
  {
    path: '/merchant/settings',
    name: 'MerchantSettings',
    component: MerchantSettings,
    meta: { 
      requiresAuth: true, 
      requiresRole: ['merchant', 'admin'],
      title: 'Marchand - Paramètres'
    }
  },
  {
    path: '/merchant/integration',
    name: 'MerchantIntegration',
    component: MerchantIntegration,
    meta: { 
      requiresAuth: true, 
      requiresRole: ['merchant', 'admin'],
      title: 'Marchand - Intégration'
    }
  },

  // Route de fallback
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navigation
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated
  const userRole = store.getters.userRole
  
  // Mise à jour du titre de la page
  if (to.meta.title) {
    document.title = `${to.meta.title} - Payment Platform`
  } else {
    document.title = 'Payment Platform'
  }

  // Vérification de l'authentification
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  // Redirection si déjà connecté
  if (to.meta.redirectIfAuth && isAuthenticated) {
    if (userRole === 'admin') {
      next('/admin')
    } else if (userRole === 'merchant') {
      next('/merchant')
    } else {
      next('/')
    }
    return
  }

  // Vérification des rôles
  if (to.meta.requiresRole && isAuthenticated) {
    const requiredRoles = Array.isArray(to.meta.requiresRole) 
      ? to.meta.requiresRole 
      : [to.meta.requiresRole]
    
    if (!requiredRoles.includes(userRole)) {
      // Redirection vers le dashboard approprié
      if (userRole === 'admin') {
        next('/admin')
      } else if (userRole === 'merchant') {
        next('/merchant')
      } else {
        next('/')
      }
      return
    }
  }

  next()
})

export default router