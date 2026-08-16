<template>
  <q-page padding class="page-shell settings-page">
    <PageHeader
      :eyebrow="$t('nav.settings')"
      :title="$t('settings.title')"
      :subtitle="$t('settings.subtitle')"
    />

    <q-card flat bordered class="settings-tabs-card">
      <q-tabs
        v-model="activeTab"
        align="left"
        no-caps
        inline-label
        outside-arrows
        mobile-arrows
        active-color="primary"
        indicator-color="primary"
        class="settings-tabs"
      >
        <q-tab name="patterns" icon="repeat" :label="$t('nav.patterns')" />
        <q-tab name="reminders" icon="notifications_active" :label="$t('nav.reminders')" />
        <q-tab name="variables" icon="tune" :label="$t('settings.variables')" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated class="settings-tab-panels">
        <q-tab-panel name="patterns">
          <PatternsPage embedded />
        </q-tab-panel>
        <q-tab-panel name="reminders">
          <RemindersPage embedded />
        </q-tab-panel>
        <q-tab-panel name="variables">
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

      <q-card v-if="false" flat bordered class="settings-card settings-card--notifications">
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
              class="settings-notification settings-notification--wide"
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
              <q-input
                v-model.number="app.activeProfile.reminders[notification.minutesModel]"
                class="settings-notification__input"
                outlined
                dense
                type="number"
                min="0"
                max="1440"
                :disable="
                  !app.activeProfile.reminders.enabled ||
                  !app.activeProfile.reminders[notification.model]
                "
                :label="$t('settings.notifyBefore')"
                suffix="min"
              />
            </div>
            <div class="settings-notification settings-notification--wide">
              <q-item dense>
                <q-item-section>
                  <q-item-label class="settings-notification__title">
                    <q-icon name="person_pin_circle" color="primary" />
                    <span>{{ $t('settings.arrivalEnabled') }}</span>
                  </q-item-label>
                  <q-item-label caption>{{ $t('settings.arrivalHint') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="app.activeProfile.reminders.arrivalEnabled" />
                </q-item-section>
              </q-item>
              <div class="settings-notification__split">
                <q-input
                  v-model.number="app.activeProfile.reminders.arrivalAfterShiftEndMinutes"
                  class="settings-notification__input"
                  outlined
                  dense
                  type="number"
                  min="0"
                  max="1440"
                  :disable="!app.activeProfile.reminders.arrivalEnabled"
                  :label="$t('settings.arrivalAfter')"
                  suffix="min"
                />
                <q-btn-toggle
                  v-model="app.activeProfile.reminders.arrivalMode"
                  unelevated
                  toggle-color="primary"
                  :options="arrivalModeOptions"
                  :disable="!app.activeProfile.reminders.arrivalEnabled"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card v-if="false" flat bordered class="settings-card settings-card--tests">
        <q-card-section class="settings-card__header">
          <div class="section-title">{{ $t('settings.notificationTest') }}</div>
          <div class="supporting-text">
            {{
              isAndroidNative
                ? $t('settings.androidAlarmCenterHint')
                : $t('settings.notificationTestHint')
            }}
          </div>
        </q-card-section>
        <q-card-section class="settings-card__body settings-tests">
          <q-banner
            v-if="isAndroidNative"
            rounded
            class="settings-android-alarm-status"
            :class="androidAlarmReady ? 'settings-android-alarm-status--ready' : ''"
          >
            <template #avatar>
              <q-icon :name="androidAlarmReady ? 'verified' : 'warning'" />
            </template>
            {{
              androidAlarmReady
                ? $t('settings.androidAlarmReady')
                : $t('settings.androidAlarmNeedsSetup')
            }}
          </q-banner>
          <q-banner v-else-if="isAndroidDevice" rounded class="settings-android-alarm-status">
            <template #avatar>
              <q-icon name="install_mobile" />
            </template>
            {{ $t('settings.androidNativeRequired') }}
          </q-banner>
          <div class="settings-runtime">
            {{ $t('settings.runtimeInfo', { version: appVersion, platform: runtimePlatform }) }}
          </div>
          <div v-if="isAndroidNative">
            <q-btn
              class="app-action-button full-width"
              color="primary"
              icon="alarm"
              no-caps
              :label="$t('settings.openAlarmCenter')"
              to="/alarms"
            />
          </div>
          <div v-else>
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

      <q-card flat bordered class="settings-card">
        <q-card-section class="settings-card__header">
          <div class="section-title">Аккаунт и Activity API</div>
          <div class="supporting-text">Google-вход, синхронизация графика и подключения других приложений.</div>
        </q-card-section>
        <q-card-section class="settings-card__body">
          <q-btn color="primary" icon="account_circle" class="app-action-button" label="Открыть аккаунт" to="/account" />
          <q-btn flat icon="api" class="app-action-button q-ml-sm" label="Документация API" to="/api-docs" />
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

      <q-card flat bordered class="settings-card settings-card--privacy">
        <q-card-section class="settings-card__header">
          <div class="section-title">{{ $t('privacy.title') }}</div>
          <div class="supporting-text">{{ $t('privacy.consentHint') }}</div>
        </q-card-section>
        <q-card-section class="settings-card__body q-gutter-md">
          <q-toggle
            :model-value="app.data.settings.cloudPushConsent"
            :label="$t('privacy.cloudPushConsent')"
            @update:model-value="updateCloudPushConsent"
          />
          <div class="settings-privacy-actions">
            <q-btn
              outline
              no-caps
              icon="download"
              :label="$t('privacy.exportData')"
              @click="exportData"
            />
            <q-btn
              outline
              no-caps
              icon="cloud_upload"
              :label="$t('privacy.exportToCloud')"
              @click="exportToCloud"
            />
            <q-btn
              outline
              no-caps
              icon="upload"
              :label="$t('privacy.importData')"
              @click="migrationInput?.click()"
            />
            <q-btn flat no-caps icon="privacy_tip" :label="$t('privacy.title')" to="/privacy" />
            <input
              ref="migrationInput"
              type="file"
              accept="application/json,.json"
              hidden
              @change="importData"
            />
          </div>
        </q-card-section>
      </q-card>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <q-dialog v-model="exportDialogOpen">
      <q-card class="settings-export-dialog">
        <q-card-section>
          <div class="section-title">{{ $t('privacy.exportReadyTitle') }}</div>
          <p class="supporting-text">
            {{ $t('privacy.exportReadyText', { filename: exportFilename }) }}
          </p>
        </q-card-section>
        <q-card-section>
          <q-input
            :model-value="exportPayload"
            readonly
            outlined
            autogrow
            type="textarea"
            class="settings-export-dialog__payload"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps :label="$t('common.cancel')" v-close-popup />
          <q-btn
            outline
            no-caps
            icon="content_copy"
            :label="$t('privacy.copyExport')"
            @click="copyExportData"
          />
          <q-btn
            outline
            no-caps
            icon="cloud_upload"
            :label="$t('privacy.exportToCloud')"
            @click="shareExportData"
          />
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="download"
            :label="$t('privacy.downloadExport')"
            @click="downloadExportData"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { copyToClipboard, useQuasar } from 'quasar';
import PageHeader from 'components/PageHeader.vue';
import PatternsPage from 'pages/PatternsPage.vue';
import RemindersPage from 'pages/RemindersPage.vue';
import { DHL_SCHEDULE_VALID_FROM, dhlBusRoutes } from 'src/core/dhl-bus-routes';
import { matchesSearch } from 'src/core/search';
import {
  requestReminderPermission,
  showReminderFeedback,
} from 'src/services/reminders/reminder-feedback';
import { getAndroidSystemAlarmStatus, isNativeAndroidApp } from 'src/services/native-notifications';
import { syncPushReminders } from 'src/services/push-notifications';
import { removePushSubscription } from 'src/services/push-notifications';
import { parseMigration, serializeMigration } from 'src/services/data-migration';
import { useAppStore } from 'stores/app-store';

const app = useAppStore();
const $q = useQuasar();
const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
type SettingsTab = 'patterns' | 'reminders' | 'variables';
const tabs: SettingsTab[] = ['patterns', 'reminders', 'variables'];
const activeTab = computed<SettingsTab>({
  get() {
    const requestedTab = route.query.tab === 'general' ? 'variables' : route.query.tab;
    const tab = String(requestedTab ?? 'variables') as SettingsTab;
    return tabs.includes(tab) ? tab : 'variables';
  },
  set(tab) {
    void router.replace({ path: '/settings', query: { ...route.query, tab } });
  },
});
const routeQuery = ref('');
const stopQuery = ref('');
const migrationInput = ref<HTMLInputElement | null>(null);
const exportDialogOpen = ref(false);
const exportFilename = ref('');
const exportPayload = ref('');
const isAndroidNative = isNativeAndroidApp();
const isAndroidDevice = /Android/i.test(navigator.userAgent);
const appVersion = process.env.APP_VERSION;
const runtimePlatform = isAndroidNative
  ? 'APK Android'
  : isAndroidDevice
    ? 'PWA/Web Android'
    : 'Web/PWA';
const androidAlarmCanSet = ref(false);
const androidAlarmReady = computed(() => androidAlarmCanSet.value);
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
    minutesModel: 'shiftStartBeforeMinutes' as const,
    icon: 'work',
    label: t('settings.shiftStartEnabled'),
    hint: t('settings.shiftStartHint'),
  },
  {
    model: 'firstBreakEnabled' as const,
    minutesModel: 'firstBreakBeforeMinutes' as const,
    icon: 'coffee',
    label: t('settings.firstBreakEnabled'),
    hint: t('settings.firstBreakHint'),
  },
  {
    model: 'shiftEndEnabled' as const,
    minutesModel: 'shiftEndBeforeMinutes' as const,
    icon: 'logout',
    label: t('settings.shiftEndEnabled'),
    hint: t('settings.shiftEndHint'),
  },
]);
const arrivalModeOptions = computed(() => [
  { label: t('settings.arrivalModeNotification'), value: 'notification' },
  { label: t('settings.arrivalModeAlarm'), value: 'alarm' },
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

if (isAndroidNative) {
  void refreshAndroidAlarmStatus();
  window.addEventListener('focus', refreshAndroidAlarmStateSoon);
  document.addEventListener('visibilitychange', refreshAndroidAlarmStateWhenVisible);
}

onBeforeUnmount(() => {
  if (!isAndroidNative) return;
  window.removeEventListener('focus', refreshAndroidAlarmStateSoon);
  document.removeEventListener('visibilitychange', refreshAndroidAlarmStateWhenVisible);
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
  if (isAndroidDevice && !isAndroidNative) {
    $q.notify({
      type: 'warning',
      icon: 'install_mobile',
      message: t('settings.androidNativeRequired'),
      timeout: 7000,
    });
    return;
  }

  if (isAndroidNative) {
    $q.notify({
      type: 'info',
      icon: 'alarm',
      message: t('settings.openAlarmCenterHint'),
    });
    return;
  }

  await showReminderFeedback({
    body: t('settings.testAlarmMessage'),
    id: `my-shift:test-alarm:${Date.now()}`,
    kind: 'alarm',
    stopLabel: t('settings.stopAlarm'),
  });
}

async function refreshAndroidAlarmStatus() {
  const status = await getAndroidSystemAlarmStatus();
  androidAlarmCanSet.value = status.canSetAlarm;
}
function refreshAndroidAlarmStateSoon() {
  void refreshAndroidAlarmStatus();
}
function refreshAndroidAlarmStateWhenVisible() {
  if (document.hidden) return;
  void refreshAndroidAlarmStatus();
}
async function testNotification() {
  const permission = await requestReminderPermission();
  if (permission === 'granted' && app.data.settings.cloudPushConsent) {
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

async function updateCloudPushConsent(value: boolean) {
  app.data.settings.cloudPushConsent = value;
  if (value) {
    await syncPushReminders(app.activeProfile, app.data.settings.locale);
  } else {
    await removePushSubscription();
  }
}

function exportData() {
  prepareExportData();
  exportDialogOpen.value = true;
}

async function exportToCloud() {
  prepareExportData();
  await shareExportData();
}

function prepareExportData() {
  exportPayload.value = serializeMigration(app.data);
  exportFilename.value = `my-shift-data-${new Date().toISOString().slice(0, 10)}.json`;
}

async function copyExportData() {
  await copyToClipboard(exportPayload.value);
  $q.notify({ type: 'positive', message: t('privacy.exportCopied') });
}

async function shareExportData() {
  const file = new File([exportBlob()], exportFilename.value, { type: 'application/json' });
  if (!navigator.canShare?.({ files: [file] })) {
    $q.notify({ type: 'warning', message: t('privacy.cloudExportUnavailable') });
    await copyExportData();
    return;
  }
  try {
    await navigator.share({
      files: [file],
      title: t('privacy.exportData'),
    });
  } catch (error) {
    if (!(error instanceof DOMException && error.name === 'AbortError')) {
      await copyExportData();
    }
  }
}

function downloadExportData() {
  const url = URL.createObjectURL(exportBlob());
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = exportFilename.value;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.append(anchor);
  anchor.click();
  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 1000);
}

function exportBlob() {
  return new Blob([exportPayload.value], { type: 'application/json' });
}

async function importData(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  const imported = parseMigration(await file.text());
  if (!imported) {
    $q.notify({ type: 'negative', message: t('privacy.importError') });
    return;
  }
  app.importUserData(imported);
  $q.notify({ type: 'positive', message: t('privacy.importSuccess') });
}
</script>

<style scoped lang="scss">
.settings-page {
  max-width: 1600px;
}

.settings-tabs-card {
  overflow: hidden;
}

.settings-tabs {
  min-height: 58px;
}

.settings-tab-panels,
.settings-tab-panels :deep(.q-panel) {
  background: transparent;
}

.settings-tab-panels :deep(.q-tab-panel) {
  padding: 24px;
}

.settings-tab-panels :deep(.settings-tab-page) {
  width: 100%;
}

.settings-page :deep(.page-heading) {
  margin-bottom: 10px;
}

.settings-page :deep(.page-title) {
  font-size: clamp(1.45rem, 3vw, 2.2rem);
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
  grid-column: span 4;
}

.settings-card--privacy {
  grid-column: span 8;
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

.settings-notification__split {
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(150px, 1fr) max-content;
  align-items: center;
}

.settings-tests {
  grid-template-columns: 1fr;
}

.settings-runtime {
  color: var(--app-text-muted);
  font-size: 0.78rem;
  line-height: 1.3;
}

.settings-alarm-debug {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.settings-alarm-debug__actions {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.settings-alarm-debug__field {
  min-width: 0;
}

.settings-alarm-debug__field :deep(textarea) {
  max-height: 220px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.72rem;
  line-height: 1.35;
}

.settings-android-alarm-status {
  color: #92400e;
  background: #fffbeb;
}

.settings-android-alarm-status--ready {
  color: #166534;
  background: #f0fdf4;
}

.settings-privacy-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
  .settings-card--tests,
  .settings-card--reset,
  .settings-card--privacy {
    grid-column: 1 / -1;
  }

  .settings-tests {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .settings-alarm-debug {
    grid-column: 1 / -1;
  }
}

@media (max-width: 599px) {
  .settings-notification__split {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .settings-card--workplace,
  .settings-card--general,
  .settings-card--transport,
  .settings-card--notifications,
  .settings-card--tests,
  .settings-card--reset,
  .settings-card--privacy {
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
    padding: 10px 12px;
  }

  .settings-tab-panels :deep(.q-tab-panel) {
    padding: 12px;
  }

  .settings-page :deep(.page-title) {
    font-size: 1.55rem;
    line-height: 1.12;
  }

  .settings-grid {
    gap: 8px;
  }

  .settings-card__header {
    padding: 10px 10px 6px;
  }

  .settings-card__body {
    padding: 6px 10px 10px;
  }

  .settings-notifications__header {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .settings-notifications__header :deep(.q-toggle) {
    align-self: stretch;
    justify-content: space-between;
  }

  .settings-notifications__header :deep(.q-toggle__label) {
    flex: 1 1 auto;
  }

  .settings-notifications {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .settings-notification,
  .settings-notification--wide {
    grid-column: auto;
    padding: 6px;
  }

  .settings-tests {
    grid-template-columns: 1fr;
  }

  .settings-alarm-debug__actions {
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

  .settings-notification :deep(.q-item) {
    align-items: flex-start;
    padding: 2px;
  }

  .settings-notification :deep(.q-item__section--side) {
    padding-left: 6px;
  }

  .settings-notification__title {
    gap: 6px;
    line-height: 1.18;
  }

  .settings-notification__title .q-icon {
    font-size: 1.2rem;
  }

  .settings-notification__input {
    margin: 4px 0 0;
  }

  .settings-notification__split :deep(.q-btn-toggle) {
    width: 100%;
  }
}
</style>
