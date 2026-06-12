<template>
  <q-page padding class="page-shell settings-page">
    <PageHeader
      :eyebrow="$t('nav.settings')"
      :title="$t('settings.title')"
      :subtitle="$t('settings.subtitle')"
    />
    <div class="settings-grid">
      <q-card flat bordered class="settings-card settings-card--workplace">
        <q-card-section class="settings-card__header">
          <div class="section-title">{{ $t('settings.workplace') }}</div>
        </q-card-section>
        <q-card-section class="settings-card__body settings-workplace">
          <q-input
            :model-value="app.activeProfile.workplaceName"
            outlined
            dense
            disable
            :label="$t('settings.workplace')"
          />
          <div class="supporting-text settings-workplace__schedule">
            {{ $t('settings.scheduleVersion') }}: {{ scheduleDate }}
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="settings-card settings-card--general">
        <q-card-section class="settings-card__header">
          <div class="section-title">{{ $t('settings.general') }}</div>
        </q-card-section>
        <q-card-section class="settings-card__body settings-fields settings-fields--two">
          <q-select
            v-model="app.data.settings.theme"
            outlined
            dense
            emit-value
            map-options
            :options="themeOptions"
            :label="$t('settings.theme')"
            @update:model-value="app.setTheme"
          />
          <q-input
            v-model.number="app.data.settings.sleepHours"
            outlined
            dense
            type="number"
            :min="4"
            :max="12"
            :label="$t('settings.sleepHours')"
            suffix="h"
          />
        </q-card-section>
      </q-card>

      <q-card flat bordered class="settings-card settings-card--transport">
        <q-card-section class="settings-card__header">
          <div class="section-title">{{ $t('settings.transport') }}</div>
        </q-card-section>
        <q-card-section class="settings-card__body settings-transport">
          <q-btn-toggle
            :model-value="app.activeProfile.transport.mode"
            spread
            no-caps
            toggle-color="primary"
            :options="transportOptions"
            @update:model-value="app.setTransportMode"
          />
          <q-select
            v-if="app.activeProfile.transport.mode === 'bus'"
            v-model="app.activeProfile.transport.busRouteId"
            use-input
            fill-input
            hide-selected
            outlined
            dense
            emit-value
            map-options
            :options="routeOptions"
            :label="$t('onboarding.route')"
            @filter="filterRoutes"
            @update:model-value="clearInvalidStop"
          />
          <q-select
            v-if="app.activeProfile.transport.mode === 'bus'"
            :model-value="stopKey"
            use-input
            fill-input
            hide-selected
            outlined
            dense
            emit-value
            map-options
            :options="stopOptions"
            :label="$t('onboarding.stop')"
            @filter="filterStops"
            @update:model-value="selectStop"
          />
        </q-card-section>
      </q-card>

      <q-card flat bordered class="settings-card settings-card--notifications">
        <q-card-section class="settings-card__header settings-notifications__header">
          <div>
            <div class="section-title">{{ $t('settings.timing') }}</div>
            <div class="supporting-text">{{ $t('settings.timingHint') }}</div>
          </div>
          <q-toggle
            v-model="app.activeProfile.reminders.enabled"
            :label="$t('settings.timingEnabled')"
          />
        </q-card-section>
        <q-card-section class="settings-card__body">
          <div class="settings-notifications">
            <div class="settings-notification settings-notification--wide">
              <q-item dense>
                <q-item-section>
                  <q-item-label class="settings-notification__title">
                    <q-icon name="alarm" color="negative" />
                    <span>{{ $t('settings.alarmEnabled') }}</span>
                  </q-item-label>
                  <q-item-label caption>{{ $t('settings.alarmHint') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    v-model="app.activeProfile.transport.alarmEnabled"
                    :disable="!app.activeProfile.reminders.enabled"
                  />
                </q-item-section>
              </q-item>
              <q-input
                v-model.number="app.activeProfile.transport.alarmBeforeReferenceMinutes"
                class="settings-notification__input"
                outlined
                dense
                type="number"
                min="0"
                :disable="
                  !app.activeProfile.reminders.enabled || !app.activeProfile.transport.alarmEnabled
                "
                :label="$t('settings.alarmBefore')"
                suffix="min"
              />
            </div>
            <div class="settings-notification settings-notification--wide">
              <q-item dense>
                <q-item-section>
                  <q-item-label class="settings-notification__title">
                    <q-icon name="directions_walk" color="primary" />
                    <span>{{ $t('settings.leaveEnabled') }}</span>
                  </q-item-label>
                  <q-item-label caption>{{ $t('settings.leaveHint') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    v-model="app.activeProfile.transport.leaveReminderEnabled"
                    :disable="!app.activeProfile.reminders.enabled"
                  />
                </q-item-section>
              </q-item>
              <q-input
                v-model.number="app.activeProfile.transport.leaveBeforeReferenceMinutes"
                class="settings-notification__input"
                outlined
                dense
                type="number"
                min="0"
                :disable="
                  !app.activeProfile.reminders.enabled ||
                  !app.activeProfile.transport.leaveReminderEnabled
                "
                :label="$t('settings.leaveBefore')"
                suffix="min"
              />
            </div>
            <div
              v-for="notification in notificationOptions"
              :key="notification.model"
              class="settings-notification"
            >
              <q-item dense>
                <q-item-section>
                  <q-item-label class="settings-notification__title">
                    <q-icon :name="notification.icon" color="primary" />
                    <span>{{ notification.label }}</span>
                  </q-item-label>
                  <q-item-label caption>{{ notification.hint }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    v-model="app.activeProfile.reminders[notification.model]"
                    :disable="!app.activeProfile.reminders.enabled"
                  />
                </q-item-section>
              </q-item>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="settings-card settings-card--tests">
        <q-card-section class="settings-card__header">
          <div class="section-title">{{ $t('settings.notificationTest') }}</div>
          <div class="supporting-text">{{ $t('settings.notificationTestHint') }}</div>
        </q-card-section>
        <q-card-section class="settings-card__body settings-tests">
          <div>
            <q-btn
              class="app-action-button full-width"
              color="negative"
              icon="alarm"
              no-caps
              :label="$t('settings.testAlarm')"
              @click="testAlarm"
            />
          </div>
          <div>
            <q-btn
              class="app-action-button full-width"
              color="primary"
              icon="notifications_active"
              no-caps
              :label="$t('settings.testNotification')"
              @click="testNotification"
            />
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="settings-card settings-card--reset">
        <q-card-section class="settings-card__header">
          <div class="section-title">{{ $t('settings.resetSection') }}</div>
          <div class="supporting-text">{{ $t('settings.resetHint') }}</div>
        </q-card-section>
        <q-card-section class="settings-card__body">
          <q-btn
            outline
            color="negative"
            icon="restart_alt"
            class="app-action-button"
            :label="$t('settings.resetApplication')"
            @click="confirmReset"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import PageHeader from 'components/PageHeader.vue';
import { DHL_SCHEDULE_VALID_FROM, dhlBusRoutes } from 'src/core/dhl-bus-routes';
import { matchesSearch } from 'src/core/search';
import {
  requestReminderPermission,
  showReminderFeedback,
} from 'src/services/reminders/reminder-feedback';
import { syncPushReminders } from 'src/services/push-notifications';
import { useAppStore } from 'stores/app-store';

const app = useAppStore();
const $q = useQuasar();
const { t, locale } = useI18n();
const routeQuery = ref('');
const stopQuery = ref('');
const scheduleDate = computed(() =>
  new Intl.DateTimeFormat(locale.value).format(new Date(`${DHL_SCHEDULE_VALID_FROM}T00:00:00`)),
);
const themeOptions = computed(() => [
  { label: t('settings.system'), value: 'system' },
  { label: t('settings.light'), value: 'light' },
  { label: t('settings.dark'), value: 'dark' },
]);
const transportOptions = computed(() => [
  { label: t('settings.bus'), value: 'bus', icon: 'directions_bus' },
  { label: t('settings.car'), value: 'car', icon: 'directions_car' },
]);
const notificationOptions = computed(() => [
  {
    model: 'shiftStartEnabled' as const,
    icon: 'work',
    label: t('settings.shiftStartEnabled'),
    hint: t('settings.shiftStartHint'),
  },
  {
    model: 'firstBreakEnabled' as const,
    icon: 'coffee',
    label: t('settings.firstBreakEnabled'),
    hint: t('settings.firstBreakHint'),
  },
  {
    model: 'shiftEndEnabled' as const,
    icon: 'logout',
    label: t('settings.shiftEndEnabled'),
    hint: t('settings.shiftEndHint'),
  },
]);
const routeOptions = computed(() =>
  dhlBusRoutes
    .filter((route) => matchesSearch(`${route.code} ${route.name}`, routeQuery.value))
    .map((route) => ({ label: `${route.code} — ${route.name}`, value: route.id })),
);
const allStops = computed(() =>
  dhlBusRoutes
    .filter(
      (route) =>
        !app.activeProfile.transport.busRouteId ||
        route.id === app.activeProfile.transport.busRouteId,
    )
    .flatMap((route) =>
      route.stops.map((stop) => ({
        label: `${stop.name} — ${route.code}`,
        value: `${route.id}|${stop.id}`,
      })),
    ),
);
const stopOptions = computed(() =>
  allStops.value.filter((stop) => matchesSearch(stop.label, stopQuery.value)),
);
const stopKey = computed(() => {
  const transport = app.activeProfile.transport;
  return transport.busRouteId && transport.busStopId
    ? `${transport.busRouteId}|${transport.busStopId}`
    : null;
});

function filterRoutes(value: string, update: (callback: () => void) => void) {
  update(() => (routeQuery.value = value));
}
function filterStops(value: string, update: (callback: () => void) => void) {
  update(() => (stopQuery.value = value));
}
function clearInvalidStop() {
  const transport = app.activeProfile.transport;
  const route = dhlBusRoutes.find((item) => item.id === transport.busRouteId);
  if (!route?.stops.some((stop) => stop.id === transport.busStopId)) transport.busStopId = null;
}
function selectStop(value: string | null) {
  if (!value) return;
  const [routeId, stopId] = value.split('|');
  app.activeProfile.transport.busRouteId = routeId ?? null;
  app.activeProfile.transport.busStopId = stopId ?? null;
}
async function testAlarm() {
  await showReminderFeedback({
    body: t('settings.testAlarmMessage'),
    id: `my-shift:test-alarm:${Date.now()}`,
    kind: 'alarm',
    stopLabel: t('settings.stopAlarm'),
  });
}
async function testNotification() {
  const permission = await requestReminderPermission();
  if (permission === 'granted') {
    await syncPushReminders(app.activeProfile, app.data.settings.locale);
  }
  if (permission !== 'granted') {
    $q.notify({
      type: 'warning',
      message: t(
        permission === 'unsupported'
          ? 'settings.notificationsUnsupported'
          : 'settings.notificationsPermissionRequired',
      ),
    });
  }
  await showReminderFeedback({
    body: t('settings.testNotificationMessage'),
    id: `my-shift:test-notification:${Date.now()}`,
    kind: 'notification',
  });
}
function confirmReset() {
  $q.dialog({
    title: t('settings.resetConfirmationTitle'),
    message: t('settings.resetConfirmation'),
    cancel: {
      flat: true,
      label: t('common.cancel'),
    },
    ok: {
      color: 'negative',
      label: t('settings.resetConfirm'),
    },
    persistent: true,
  }).onOk(() => app.resetApplication());
}
</script>

<style scoped lang="scss">
.settings-page {
  max-width: 1600px;
}

.settings-page :deep(.page-heading) {
  margin-bottom: 10px;
}

.settings-page :deep(.page-title) {
  font-size: clamp(1.75rem, 3vw, 2.2rem);
}

.settings-page :deep(.page-subtitle) {
  margin-top: 2px;
  font-size: 0.95rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 12px;
}

.settings-card {
  min-width: 0;
}

.settings-card--workplace {
  grid-column: span 4;
}

.settings-card--general {
  grid-column: span 4;
}

.settings-card--transport {
  grid-column: span 4;
}

.settings-card--notifications {
  grid-column: span 9;
}

.settings-card--tests {
  grid-column: span 3;
}

.settings-card--reset {
  grid-column: 1 / -1;
}

.settings-card__header {
  padding: 12px 14px 8px;
}

.settings-card__body {
  padding: 8px 14px 14px;
}

.settings-fields,
.settings-transport,
.settings-workplace,
.settings-tests {
  display: grid;
  gap: 10px;
}

.settings-fields--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.settings-workplace__schedule {
  display: flex;
  min-height: 40px;
  align-items: center;
}

.settings-transport {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.settings-transport > :first-child {
  grid-column: 1 / -1;
}

.settings-notifications__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.settings-notifications {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
}

.settings-notification {
  grid-column: span 2;
  min-width: 0;
  padding: 6px 8px 8px;
  background: var(--app-surface-soft);
  border: 1px solid var(--app-border);
  border-radius: 12px;
}

.settings-notification--wide {
  grid-column: span 3;
}

.settings-notification :deep(.q-item) {
  min-height: 48px;
  padding: 4px;
}

.settings-notification :deep(.q-item__section--side) {
  padding-left: 6px;
}

.settings-notification__title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.settings-notification__title .q-icon {
  flex: 0 0 auto;
  font-size: 1.35rem;
}

.settings-notification__input {
  margin: 4px;
}

.settings-tests {
  grid-template-columns: 1fr;
}

@media (max-width: 1199px) {
  .settings-card--workplace,
  .settings-card--general {
    grid-column: span 6;
  }

  .settings-card--transport {
    grid-column: 1 / -1;
  }

  .settings-card--notifications,
  .settings-card--tests {
    grid-column: 1 / -1;
  }

  .settings-tests {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .settings-card--workplace,
  .settings-card--general,
  .settings-card--transport,
  .settings-card--notifications,
  .settings-card--tests {
    grid-column: 1 / -1;
  }

  .settings-fields--two,
  .settings-transport {
    grid-template-columns: 1fr;
  }

  .settings-transport > :first-child {
    grid-column: auto;
  }

  .settings-notification,
  .settings-notification--wide {
    grid-column: span 3;
  }
}

@media (max-width: 599px) {
  .settings-page {
    padding: 12px;
  }

  .settings-grid {
    gap: 10px;
  }

  .settings-card__header {
    padding: 12px 12px 6px;
  }

  .settings-card__body {
    padding: 8px 12px 12px;
  }

  .settings-notifications__header {
    align-items: flex-start;
  }

  .settings-notifications {
    grid-template-columns: 1fr;
  }

  .settings-notification,
  .settings-notification--wide {
    grid-column: auto;
  }

  .settings-tests {
    grid-template-columns: 1fr;
  }

  .settings-transport :deep(.q-btn) {
    min-height: 52px;
    padding-inline: 8px;
    font-size: 0.9rem;
  }

  .settings-transport :deep(.q-btn .q-icon) {
    font-size: 1.2rem;
  }

  .settings-transport :deep(.q-btn__content) {
    flex-wrap: nowrap;
    gap: 6px;
  }

  .settings-notification__title .q-icon {
    font-size: 1.2rem;
  }
}
</style>
