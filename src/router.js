import { createRouter, createWebHistory } from 'vue-router'
import ReviewQueueView from './views/ReviewQueueView.vue'
import AgentProcessingView from './views/AgentProcessingView.vue'
import EncounterReviewView from './views/EncounterReviewView.vue'
import EncounterPreviewView from './views/EncounterPreviewView.vue'
import DashboardView from './views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: DashboardView, meta: { title: 'Dashboard' } },
    { path: '/queue', redirect: '/encounters' },
    { path: '/encounters', component: ReviewQueueView, meta: { title: 'Encounters' } },
    { path: '/encounters/:id/processing', component: AgentProcessingView, meta: { title: 'Agents Working' } },
    { path: '/encounters/:id/preview', component: EncounterPreviewView, meta: { title: 'Final Note Review' } },
    { path: '/encounters/:id', component: EncounterReviewView, meta: { title: 'Encounter Edit' } },
    { path: '/:pathMatch(.*)*', redirect: '/encounters' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = `${to.meta.title || 'Scribe Portal'} · Otangeles Note+`
})

export default router
