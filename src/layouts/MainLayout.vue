<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="app-header">
      <q-toolbar class="q-px-lg">
        <q-btn flat dense round icon="menu" class="lt-md" @click="drawerOpen = !drawerOpen" />
        <q-toolbar-title class="brand">
          <q-avatar color="primary" text-color="white" icon="schedule" size="38px" />
          <div>
            <strong>{{ $t('app.name') }}</strong
            ><small>{{ $t('app.tagline') }}</small>
          </div>
        </q-toolbar-title>
        <LanguageToggle class="q-mr-sm" />
        <q-btn
          flat
          round
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          :aria-label="$q.dark.isActive ? $t('settings.light') : $t('settings.dark')"
          @click="toggleTheme"
        />
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
          <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>
          <q-item-section>{{ $t(item.label) }}</q-item-section>
        </q-item>
      </q-list>
      <div class="drawer-footer">
        <q-icon name="verified_user" color="positive" />
        <span>Local-first · v0.1</span>
      </div>
    </q-drawer>

    <q-page-container><router-view /></q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import LanguageToggle from 'components/LanguageToggle.vue';
import { useAppStore } from 'stores/app-store';

const drawerOpen = ref(false);
const $q = useQuasar();
const app = useAppStore();
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
