<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="app-header">
      <q-toolbar class="q-px-lg">
        <q-btn
          flat
          dense
          round
          icon="menu"
          class="app-icon-button lt-md"
          :aria-label="$t('common.openMenu')"
          @click="drawerOpen = !drawerOpen"
        >
          <q-tooltip>{{ $t('common.openMenu') }}</q-tooltip>
        </q-btn>
        <q-toolbar-title class="brand">
          <AppLogo class="brand__logo" />
          <div>
            <strong>{{ todayLabel }}</strong>
            <small>{{ app.activeProfile.workplaceName }}</small>
          </div>
        </q-toolbar-title>
        <div class="header-shift-badge" aria-live="polite">
          <q-icon :name="currentShiftIcon" class="design-icon" />
          <span>{{ currentShiftLabel }}</span>
        </div>
        <LanguageToggle class="q-mr-sm" />
        <q-btn
          flat
          round
          class="app-icon-button"
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          :aria-label="$q.dark.isActive ? $t('settings.light') : $t('settings.dark')"
          @click="toggleTheme"
        >
          <q-tooltip>
            {{ $q.dark.isActive ? $t('settings.light') : $t('settings.dark') }}
          </q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          class="app-icon-button app-icon-button--danger"
          icon="restart_alt"
          color="negative"
          :aria-label="$t('settings.resetApplication')"
          @click="app.resetApplication"
        >
          <q-tooltip>{{ $t('settings.resetApplication') }}</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawerOpen" show-if-above :width="260" bordered class="app-drawer">
      <q-list padding>
        <q-item
          v-for="item in navigation"
          :key="item.to"
          v-ripple
          clickable
          :to="item.to"
          exact
          active-class="nav-active"
        >
          <q-item-section avatar><q-icon :name="item.icon" class="design-icon" /></q-item-section>
          <q-item-section>{{ $t(item.label) }}</q-item-section>
        </q-item>
      </q-list>
      <SidebarShiftCard />
      <div class="drawer-footer">
        <q-icon name="verified_user" color="positive" class="design-icon" />
        <span>Local-first · v0.1</span>
      </div>
    </q-drawer>

    <q-page-container class="app-page-container">
      <div class="app-moire" aria-hidden="true" />
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import LanguageToggle from 'components/LanguageToggle.vue';
import SidebarShiftCard from 'components/SidebarShiftCard.vue';
import AppLogo from 'components/AppLogo.vue';
import { useAppStore } from 'stores/app-store';
import { shiftCodeForDate } from 'src/core/schedule';

const drawerOpen = ref(false);
const $q = useQuasar();
const { locale, t } = useI18n();
const app = useAppStore();
const now = ref(new Date());
const dateTimer = window.setInterval(() => {
  now.value = new Date();
  app.applyShiftAtmosphere(now.value);
}, 60_000);
const todayLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now.value),
);
const currentShiftCode = computed(() => shiftCodeForDate(now.value, app.pattern));
const currentShift = computed(() =>
  app.shifts.find((shift) => shift.id === currentShiftCode.value),
);
const currentShiftLabel = computed(() => {
  const shift = currentShift.value;
  return shift ? (shift.nameKey ? t(shift.nameKey) : shift.name) : t('shifts.off');
});
const currentShiftIcon = computed(() => {
  if (currentShiftCode.value === 'shift-1') return 'wb_sunny';
  if (currentShiftCode.value === 'shift-2') return 'light_mode';
  if (currentShiftCode.value === 'shift-3') return 'dark_mode';
  return 'weekend';
});

onBeforeUnmount(() => window.clearInterval(dateTimer));

const navigation = [
  { label: 'nav.dashboard', icon: 'space_dashboard', to: '/' },
  { label: 'nav.calendar', icon: 'calendar_month', to: '/calendar' },
  { label: 'nav.patterns', icon: 'repeat', to: '/patterns' },
  { label: 'nav.reminders', icon: 'notifications_active', to: '/reminders' },
  { label: 'nav.settings', icon: 'tune', to: '/settings' },
];
function toggleTheme() {
  app.setTheme($q.dark.isActive ? 'light' : 'dark');
}
</script>
