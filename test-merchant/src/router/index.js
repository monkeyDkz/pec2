import { createRouter, createWebHistory } from 'vue-router'

// Pages
import Home from '../views/Home.vue'
import CredentialsConfig from '../views/CredentialsConfig.vue'
import ConfigurationComplete from '../views/ConfigurationComplete.vue'
import Shop from '../views/Shop.vue'
import Cart from '../views/Cart.vue'
import CartManagement from '../views/CartManagement.vue'
import TransactionManagement from '../views/TransactionManagement.vue'
import TransactionsComplete from '../views/TransactionsComplete.vue'
import WebhookManagement from '../views/WebhookManagement.vue'
import PaymentReturn from '../views/PaymentReturn.vue'
import PaymentCancel from '../views/PaymentCancel.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/config',
    name: 'CredentialsConfig',
    component: CredentialsConfig
  },
  {
    path: '/configuration',
    name: 'ConfigurationComplete',
    component: ConfigurationComplete
  },
  {
    path: '/shop',
    name: 'Shop',
    component: Shop
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart
  },
  {
    path: '/cart-management',
    name: 'CartManagement',
    component: CartManagement
  },
  {
    path: '/transactions',
    name: 'TransactionManagement',
    component: TransactionManagement
  },
  {
    path: '/transactions-complete',
    name: 'TransactionsComplete',
    component: TransactionsComplete
  },
  {
    path: '/webhooks',
    name: 'WebhookManagement',
    component: WebhookManagement
  },
  {
    path: '/payment-return',
    name: 'PaymentReturn',
    component: PaymentReturn
  },
  {
    path: '/payment-cancel',
    name: 'PaymentCancel',
    component: PaymentCancel
  },
  {
    path: '/webhook',
    name: 'WebhookEndpoint',
    component: WebhookManagement
  },
  // Redirections pour compatibilité
  {
    path: '/credentials',
    redirect: '/config'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
