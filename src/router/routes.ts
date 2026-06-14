import type { RouteRecordRaw } from 'vue-router';

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
      { path: '', component: () => import('pages/DashboardPage.vue') },
      { path: 'tomorrow', component: () => import('pages/TomorrowPage.vue') },
      { path: 'calendar', component: () => import('pages/CalendarPage.vue') },
      { path: 'statistics', component: () => import('pages/StatisticsPage.vue') },
      { path: 'patterns', component: () => import('pages/PatternsPage.vue') },
      { path: 'reminders', component: () => import('pages/RemindersPage.vue') },
      { path: 'whats-new', component: () => import('pages/WhatsNewPage.vue') },
      { path: 'support', component: () => import('pages/SupportPage.vue') },
      { path: 'settings', component: () => import('pages/SettingsPage.vue') },
      { path: 'privacy', component: () => import('pages/PrivacyPage.vue') },
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
