import { computed, reactive, readonly } from 'vue';
import type { Component } from 'vue';

export type AppRoutePath =
  | '/'
  | '/tomorrow'
  | '/calendar'
  | '/statistics'
  | '/patterns'
  | '/reminders'
  | '/whats-new'
  | '/support'
  | '/settings'
  | '/privacy';

type RouteLoader = () => Promise<Component>;

const routeLoaders: Record<AppRoutePath, RouteLoader> = {
  '/': () => import('pages/DashboardPage.vue'),
  '/tomorrow': () => import('pages/TomorrowPage.vue'),
  '/calendar': () => import('pages/CalendarPage.vue'),
  '/statistics': () => import('pages/StatisticsPage.vue'),
  '/patterns': () => import('pages/PatternsPage.vue'),
  '/reminders': () => import('pages/RemindersPage.vue'),
  '/whats-new': () => import('pages/WhatsNewPage.vue'),
  '/support': () => import('pages/SupportPage.vue'),
  '/settings': () => import('pages/SettingsPage.vue'),
  '/privacy': () => import('pages/PrivacyPage.vue'),
};

const preloadOrder = Object.keys(routeLoaders) as AppRoutePath[];
const state = reactive({
  started: false,
  loading: false,
  complete: false,
  failed: false,
  available: new Set<AppRoutePath>(['/']),
});

let preloadPromise: Promise<void> | null = null;

export const appReadiness = {
  state: readonly(state),
  total: preloadOrder.length,
  loaded: computed(() => state.available.size),
  progress: computed(() => Math.round((state.available.size / preloadOrder.length) * 100)),
  isAvailable(path: string) {
    return state.available.has(path as AppRoutePath);
  },
  loadRoute(path: AppRoutePath) {
    return routeLoaders[path]();
  },
  async preload() {
    if (state.complete) return;
    if (preloadPromise) return preloadPromise;

    state.started = true;
    state.loading = true;
    state.failed = false;
    preloadPromise = (async () => {
      for (const path of preloadOrder) {
        if (state.available.has(path)) continue;
        try {
          await routeLoaders[path]();
          state.available.add(path);
        } catch {
          state.failed = true;
          break;
        }
      }
      state.complete = state.available.size === preloadOrder.length;
      state.loading = false;
      preloadPromise = null;
    })();

    return preloadPromise;
  },
};

