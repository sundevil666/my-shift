<template>
  <q-page padding class="page-shell">
    <PageHeader
      :eyebrow="$t('nav.reminders')"
      :title="$t('reminders.title')"
      :subtitle="$t('reminders.subtitle')"
    />
    <q-card flat bordered>
      <q-list separator>
        <q-item tag="label">
          <q-item-section
            ><q-item-label>{{ $t('reminders.enabled') }}</q-item-label></q-item-section
          >
          <q-item-section side
            ><q-toggle
              v-model="app.activeProfile.reminders.enabled"
              @update:model-value="requestNotificationPermission"
          /></q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>{{ $t('reminders.beforeDeparture') }}</q-item-label>
            <q-slider
              v-model="app.activeProfile.reminders.beforeDepartureMinutes"
              :min="5"
              :max="120"
              :step="5"
              label
            />
          </q-item-section>
          <q-item-section side>{{ app.activeProfile.reminders.beforeDepartureMinutes }} min</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>{{ $t('reminders.beforeShift') }}</q-item-label>
            <q-item-label caption>{{ $t('reminders.beforeShiftHint') }}</q-item-label>
          </q-item-section>
          <q-item-section side>10 min</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>{{ $t('reminders.beforeShiftEnd') }}</q-item-label>
            <q-item-label caption>{{ $t('reminders.beforeShiftEndHint') }}</q-item-label>
          </q-item-section>
          <q-item-section side>20 min</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>{{ $t('reminders.firstBreak') }}</q-item-label>
            <q-item-label caption>{{ $t('reminders.firstBreakHint') }}</q-item-label>
          </q-item-section>
          <q-item-section side>2 h 15 min</q-item-section>
        </q-item>
      </q-list>
      <q-card-section class="supporting-text"
        ><q-icon name="info" class="design-icon q-mr-sm" />{{
          $t('reminders.webNote')
        }}</q-card-section
      >
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import PageHeader from 'components/PageHeader.vue';
import { useAppStore } from 'stores/app-store';
const app = useAppStore();

async function requestNotificationPermission(enabled: boolean) {
  if (!enabled || !('Notification' in window)) return;
  const permission =
    Notification.permission === 'default'
      ? await Notification.requestPermission()
      : Notification.permission;
  if (permission !== 'granted') app.activeProfile.reminders.enabled = false;
}
</script>
