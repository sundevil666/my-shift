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
        <q-item tag="label">
          <q-item-section>
            <q-item-label>{{ $t('reminders.alarm') }}</q-item-label>
            <q-item-label caption>{{ $t('reminders.alarmHint') }}</q-item-label>
            <q-input
              v-model.number="app.activeProfile.transport.alarmBeforeReferenceMinutes"
              dense
              outlined
              type="number"
              min="0"
              suffix="min"
              :disable="
                !app.activeProfile.reminders.enabled || !app.activeProfile.transport.alarmEnabled
              "
            />
          </q-item-section>
          <q-item-section side
            ><q-toggle
              v-model="app.activeProfile.transport.alarmEnabled"
              :disable="!app.activeProfile.reminders.enabled"
          /></q-item-section>
        </q-item>
        <q-item tag="label">
          <q-item-section>
            <q-item-label>{{ $t('reminders.leave') }}</q-item-label>
            <q-item-label caption>{{ $t('reminders.leaveHint') }}</q-item-label>
            <q-input
              v-model.number="app.activeProfile.transport.leaveBeforeReferenceMinutes"
              dense
              outlined
              type="number"
              min="0"
              suffix="min"
              :disable="
                !app.activeProfile.reminders.enabled ||
                !app.activeProfile.transport.leaveReminderEnabled
              "
            />
          </q-item-section>
          <q-item-section side
            ><q-toggle
              v-model="app.activeProfile.transport.leaveReminderEnabled"
              :disable="!app.activeProfile.reminders.enabled"
          /></q-item-section>
        </q-item>
        <q-item tag="label">
          <q-item-section>
            <q-item-label>{{ $t('reminders.beforeShift') }}</q-item-label>
            <q-item-label caption>{{ $t('reminders.beforeShiftHint') }}</q-item-label>
            <q-input
              v-model.number="app.activeProfile.reminders.shiftStartBeforeMinutes"
              dense
              outlined
              type="number"
              min="0"
              suffix="min"
              :disable="
                !app.activeProfile.reminders.enabled ||
                !app.activeProfile.reminders.shiftStartEnabled
              "
            />
          </q-item-section>
          <q-item-section side
            ><q-toggle
              v-model="app.activeProfile.reminders.shiftStartEnabled"
              :disable="!app.activeProfile.reminders.enabled"
          /></q-item-section>
        </q-item>
        <q-item tag="label">
          <q-item-section>
            <q-item-label>{{ $t('reminders.beforeShiftEnd') }}</q-item-label>
            <q-item-label caption>{{ $t('reminders.beforeShiftEndHint') }}</q-item-label>
            <q-input
              v-model.number="app.activeProfile.reminders.shiftEndBeforeMinutes"
              dense
              outlined
              type="number"
              min="0"
              suffix="min"
              :disable="
                !app.activeProfile.reminders.enabled || !app.activeProfile.reminders.shiftEndEnabled
              "
            />
          </q-item-section>
          <q-item-section side
            ><q-toggle
              v-model="app.activeProfile.reminders.shiftEndEnabled"
              :disable="!app.activeProfile.reminders.enabled"
          /></q-item-section>
        </q-item>
        <q-item tag="label">
          <q-item-section>
            <q-item-label>{{ $t('reminders.firstBreak') }}</q-item-label>
            <q-item-label caption>{{ $t('reminders.firstBreakHint') }}</q-item-label>
            <q-input
              v-model.number="app.activeProfile.reminders.firstBreakBeforeMinutes"
              dense
              outlined
              type="number"
              min="0"
              suffix="min"
              :disable="
                !app.activeProfile.reminders.enabled ||
                !app.activeProfile.reminders.firstBreakEnabled
              "
            />
          </q-item-section>
          <q-item-section side
            ><q-toggle
              v-model="app.activeProfile.reminders.firstBreakEnabled"
              :disable="!app.activeProfile.reminders.enabled"
          /></q-item-section>
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
import { requestReminderPermission } from 'src/services/reminders/reminder-feedback';
import { syncPushReminders } from 'src/services/push-notifications';
import { useAppStore } from 'stores/app-store';
const app = useAppStore();

async function requestNotificationPermission(enabled: boolean) {
  if (!enabled) return;
  const permission = await requestReminderPermission();
  if (permission !== 'granted') {
    app.activeProfile.reminders.enabled = false;
  } else {
    if (app.data.settings.cloudPushConsent) {
      await syncPushReminders(app.activeProfile, app.data.settings.locale);
    }
  }
}
</script>
