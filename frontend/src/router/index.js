import { createRouter, createWebHistory } from 'vue-router'

import LoginPage from '../views/LoginView.vue'
import SignupPage from '../views/SignupView.vue'
import PasswordPage from '../views/PasswordView.vue'
import GamePlayView from '@/views/GamePlayView.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: LoginPage
    },
    {
      path: '/signup',
      component: SignupPage
    },
    {
      path: '/password',
      component: PasswordPage
    },
    {
      path: "/game",
      component: GamePlayView,
    }
  ]
})

export default router