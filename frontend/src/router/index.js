import { createRouter, createWebHistory } from 'vue-router'

import LoginPage from '../views/LoginView.vue'
import SignupPage from '../views/SignupView.vue'
import PasswordPage from '../views/PasswordView.vue'
import GamePlayView from '@/views/GamePlayView.vue'
import HomeView from '@/views/Homeview.vue'
import FAQView from '@/views/FAQView.vue'


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
    },
    {
      path: "/home",
      component: HomeView,
    },
    {
      path: "/faq",
      component: FAQView,
    }

  ]
})

export default router