<template>
  <component :is="embedded ? 'div' : 'q-page'" :class="embedded ? 'settings-tab-page' : 'page-shell'" :padding="!embedded">
    <PageHeader
      v-if="!embedded"
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
      </q-list>
      <q-slide-transition>
        <div v-show="app.activeProfile.reminders.enabled" class="reminders-settings">
          <q-card-section class="reminders-section-heading">
            <q-icon name="alarm" color="negative" size="24px" />
            <div>
              <div class="section-title">{{ $t('reminders.alarmSection') }}</div>
              <div class="supporting-text">{{ $t('reminders.alarmSectionHint') }}</div>
            </div>
          </q-card-section>
          <q-list separator>
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
                    !app.activeProfile.reminders.enabled ||
                    !app.activeProfile.transport.alarmEnabled
                  "
                />
              </q-item-section>
              <q-item-section side
                ><q-toggle
                  v-model="app.activeProfile.transport.alarmEnabled"
                  :disable="!app.activeProfile.reminders.enabled"
              /></q-item-section>
            </q-item>
          </q-list>

          <AlarmCenterPage embedded />

          <q-card-section
            class="reminders-section-heading reminders-section-heading--notifications"
          >
            <q-icon name="notifications_active" color="primary" size="24px" />
            <div>
              <div class="section-title">{{ $t('reminders.notificationSection') }}</div>
              <div class="supporting-text">{{ $t('reminders.notificationSectionHint') }}</div>
            </div>
          </q-card-section>
          <q-list separator>
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
                    !app.activeProfile.reminders.enabled ||
                    !app.activeProfile.reminders.shiftEndEnabled
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
                <q-item-label>{{ $t('reminders.arrival') }}</q-item-label>
                <q-item-label caption>{{ $t('reminders.arrivalHint') }}</q-item-label>
                <div class="reminder-row-controls">
                  <q-input
                    v-model.number="app.activeProfile.reminders.arrivalAfterShiftEndMinutes"
                    dense
                    outlined
                    type="number"
                    min="0"
                    suffix="min"
                    :label="$t('reminders.afterShiftEnd')"
                    :disable="!app.activeProfile.reminders.arrivalEnabled"
                  />
                  <q-btn-toggle
                    v-model="app.activeProfile.reminders.arrivalMode"
                    unelevated
                    toggle-color="primary"
                    :options="arrivalModeOptions"
                    :disable="!app.activeProfile.reminders.arrivalEnabled"
                  />
                </div>
              </q-item-section>
              <q-item-section side
                ><q-toggle v-model="app.activeProfile.reminders.arrivalEnabled"
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
        </div>
      </q-slide-transition>
    </q-card>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AlarmCenterPage from 'pages/AlarmCenterPage.vue';

withDefaults(defineProps<{ embedded?: boolean }>(), { embedded: false });
import PageHeader from 'components/PageHeader.vue';
import { requestReminderPermission } from 'src/services/reminders/reminder-feedback';
import { syncPushReminders } from 'src/services/push-notifications';
import { useAppStore } from 'stores/app-store';
import { useI18n } from 'vue-i18n';
const app = useAppStore();
const { t } = useI18n();

const arrivalModeOptions = computed(() => [
  { label: t('reminders.arrivalModeNotification'), value: 'notification' },
  { label: t('reminders.arrivalModeAlarm'), value: 'alarm' },
]);

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

<style scoped lang="scss">
.reminder-row-controls {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(150px, 220px) max-content;
  margin-top: 10px;
}

.reminders-settings {
  border-top: 1px solid var(--q-separator-color, rgba(0, 0, 0, 0.12));
}

.reminders-section-heading {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding-bottom: 6px;
}

.reminders-section-heading--notifications {
  border-top: 1px solid var(--q-separator-color, rgba(0, 0, 0, 0.12));
  margin-top: 12px;
}

@media (max-width: 599px) {
  .reminder-row-controls {
    grid-template-columns: 1fr;
  }

  :deep(.q-card .q-item) {
    align-items: flex-start;
    padding: 10px;
  }

  :deep(.q-card .q-item__section--side) {
    padding-left: 6px;
  }

  :deep(.q-card .q-input) {
    margin-top: 8px;
  }

  :deep(.q-btn-toggle) {
    width: 100%;
  }
}
</style>
