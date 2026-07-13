import type { RouteRecordRaw } from 'vue-router';
import { appReadiness } from 'src/services/app-readiness';

const routes: RouteRecordRaw[] = [
  {
    path: '/onboarding',
    component: () => import('pages/OnboardingPage.vue'),
  },
  {
    path: '/owner-analytics',
    meta: { public: true },
    component: () => import('pages/AdminAnalyticsPage.vue'),
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => appReadiness.loadRoute('/') },
      { path: 'tomorrow', component: () => appReadiness.loadRoute('/tomorrow') },
      { path: 'calendar', component: () => appReadiness.loadRoute('/calendar') },
      { path: 'statistics', component: () => appReadiness.loadRoute('/statistics') },
      { path: 'patterns', component: () => appReadiness.loadRoute('/patterns') },
      { path: 'reminders', component: () => appReadiness.loadRoute('/reminders') },
      { path: 'alarms', component: () => appReadiness.loadRoute('/alarms') },
      { path: 'whats-new', component: () => appReadiness.loadRoute('/whats-new') },
      { path: 'support', component: () => appReadiness.loadRoute('/support') },
      { path: 'settings', component: () => appReadiness.loadRoute('/settings') },
      { path: 'privacy', component: () => appReadiness.loadRoute('/privacy') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
