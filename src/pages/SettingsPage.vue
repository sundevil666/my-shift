<template>
  <q-page padding class="page-shell">
    <PageHeader
      :eyebrow="$t('nav.settings')"
      :title="$t('settings.title')"
      :subtitle="$t('settings.subtitle')"
    />
    <div class="row q-col-gutter-lg">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section><div class="section-title">{{ $t('settings.workplace') }}</div></q-card-section>
          <q-card-section class="row q-col-gutter-md">
            <q-input
              :model-value="app.activeProfile.workplaceName"
              outlined
              disable
              class="col-12 col-md-6"
              :label="$t('settings.workplace')"
            />
            <div class="col-12 col-md-6 row items-center supporting-text">
              {{ $t('settings.scheduleVersion') }}: {{ scheduleDate }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-6">
        <q-card flat bordered>
          <q-card-section><div class="section-title">{{ $t('settings.general') }}</div></q-card-section>
          <q-card-section class="q-gutter-md">
            <q-select
              v-model="app.data.settings.theme"
              outlined
              emit-value
              map-options
              :options="themeOptions"
              :label="$t('settings.theme')"
              @update:model-value="app.setTheme"
            />
            <q-input
              v-model.number="app.data.settings.sleepHours"
              outlined
              type="number"
              :min="4"
              :max="12"
              :label="$t('settings.sleepHours')"
              suffix="h"
            />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-6">
        <q-card flat bordered>
          <q-card-section><div class="section-title">{{ $t('settings.transport') }}</div></q-card-section>
          <q-card-section class="q-gutter-md">
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
              emit-value
              map-options
              :options="stopOptions"
              :label="$t('onboarding.stop')"
              @filter="filterStops"
              @update:model-value="selectStop"
            />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <q-card flat bordered>
          <q-card-section class="row items-center justify-between q-gutter-sm">
            <div class="section-title">{{ $t('settings.timing') }}</div>
            <q-toggle
              v-model="app.activeProfile.reminders.enabled"
              :label="$t('settings.timingEnabled')"
            />
          </q-card-section>
          <q-card-section class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-toggle
                v-model="app.activeProfile.transport.alarmEnabled"
                :disable="!app.activeProfile.reminders.enabled"
                :label="$t('settings.alarmEnabled')"
              />
              <q-input
                v-model.number="app.activeProfile.transport.alarmBeforeReferenceMinutes"
                outlined
                type="number"
                min="0"
                :disable="
                  !app.activeProfile.reminders.enabled ||
                  !app.activeProfile.transport.alarmEnabled
                "
                :label="$t('settings.alarmBefore')"
                suffix="min"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-toggle
                v-model="app.activeProfile.transport.leaveReminderEnabled"
                :disable="!app.activeProfile.reminders.enabled"
                :label="$t('settings.leaveEnabled')"
              />
              <q-input
                v-model.number="app.activeProfile.transport.leaveBeforeReferenceMinutes"
                outlined
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
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="section-title">{{ $t('settings.notificationTest') }}</div>
            <div class="supporting-text">{{ $t('settings.notificationTestHint') }}</div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-btn
                class="app-action-button full-width"
                color="negative"
                icon="alarm"
                no-caps
                :label="$t('settings.testAlarm')"
                @click="testAlarm"
              />
            </div>
            <div class="col-12 col-sm-6">
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
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from 'components/PageHeader.vue';
import { DHL_SCHEDULE_VALID_FROM, dhlBusRoutes } from 'src/core/dhl-bus-routes';
import { matchesSearch } from 'src/core/search';
import { showReminderFeedback } from 'src/services/reminders/reminder-feedback';
import { useAppStore } from 'stores/app-store';

const app = useAppStore();
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
const routeOptions = computed(() =>
  dhlBusRoutes
    .filter((route) => matchesSearch(`${route.code} ${route.name}`, routeQuery.value))
    .map((route) => ({ label: `${route.code} — ${route.name}`, value: route.id })),
);
const allStops = computed(() =>
  dhlBusRoutes
    .filter((route) => !app.activeProfile.transport.busRouteId || route.id === app.activeProfile.transport.busRouteId)
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
function testAlarm() {
  showReminderFeedback({
    body: t('settings.testAlarmMessage'),
    id: `my-shift:test-alarm:${Date.now()}`,
    kind: 'alarm',
  });
}
function testNotification() {
  showReminderFeedback({
    body: t('settings.testNotificationMessage'),
    id: `my-shift:test-notification:${Date.now()}`,
    kind: 'notification',
  });
}
</script>
