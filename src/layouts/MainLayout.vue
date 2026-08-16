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
          <span class="header-shift-field">
            <small>{{ headerShiftKindLabel }}</small>
            <strong>{{ headerShiftName }}</strong>
          </span>
          <span v-if="headerEventCountdown" class="header-shift-field">
            <small>{{ headerEventLabel }}</small>
            <strong>{{ headerEventCountdown }}</strong>
          </span>
        </div>
        <q-btn
          v-if="showAndroidInstall"
          unelevated
          no-caps
          icon="install_mobile"
          class="header-install-button"
          :label="$t('install.android')"
          :disable="!installPrompt"
          @click="installAndroidApp"
        >
          <q-tooltip v-if="!installPrompt">{{ $t('install.androidUnavailable') }}</q-tooltip>
        </q-btn>
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
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawerOpen" show-if-above :width="260" bordered class="app-drawer">
      <q-list padding>
        <q-item
          v-for="item in navigation"
          :key="item.to"
          v-ripple
          clickable
          :to="isRouteAvailable(item.to) ? item.to : undefined"
          :aria-disabled="!isRouteAvailable(item.to)"
          :class="{ 'nav-pending': !isRouteAvailable(item.to) }"
          exact
          active-class="nav-active"
          @click="notifyUnavailable(item.to)"
        >
          <q-item-section avatar><q-icon :name="item.icon" class="design-icon" /></q-item-section>
          <q-item-section>{{ $t(item.label) }}</q-item-section>
          <q-item-section v-if="!isRouteAvailable(item.to)" side>
            <q-spinner-dots v-if="readiness.state.loading" size="20px" />
            <q-icon v-else name="cloud_off" />
          </q-item-section>
        </q-item>
      </q-list>
      <div class="drawer-actions">
        <q-btn
          flat
          no-caps
          icon="ios_share"
          class="drawer-action__button"
          :label="$t('share.button')"
          @click="shareApp"
        />
        <q-btn
          flat
          no-caps
          icon="favorite_border"
          color="primary"
          class="drawer-action__button"
          :label="$t('support.button')"
          :aria-disabled="!isRouteAvailable('/support')"
          :to="isRouteAvailable('/support') ? '/support' : undefined"
          @click="notifyUnavailable('/support')"
        />
      </div>
      <SidebarShiftCard />
      <div
        v-if="app.saveStatus !== 'idle'"
        class="drawer-footer storage-status gt-sm"
        :class="`storage-status--${app.saveStatus}`"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <q-spinner v-if="app.saveStatus === 'saving'" size="18px" />
        <q-icon v-else :name="saveStatusIcon" class="design-icon" />
        <div>
          <strong>{{ $t(`storage.${app.saveStatus}`) }}</strong>
          <small>{{ $t('storage.localOnly') }}</small>
        </div>
      </div>
    </q-drawer>

    <q-page-container class="app-page-container">
      <div class="app-moire" aria-hidden="true" />
      <q-banner
        v-if="readiness.state.started && !readiness.state.complete"
        rounded
        class="app-download-banner"
        role="status"
        aria-live="polite"
      >
        <template #avatar>
          <q-spinner v-if="readiness.state.loading" color="primary" size="28px" />
          <q-icon v-else name="cloud_off" color="warning" size="28px" />
        </template>
        <strong>
          {{ $t(readiness.state.failed ? 'appDownload.pausedTitle' : 'appDownload.title') }}
        </strong>
        <div>
          {{
            $t(readiness.state.failed ? 'appDownload.pausedMessage' : 'appDownload.message', {
              loaded: readiness.loaded.value,
              total: readiness.total,
            })
          }}
        </div>
        <q-linear-progress
          rounded
          size="8px"
          class="q-mt-sm"
          :value="readiness.progress.value / 100"
          color="primary"
          track-color="grey-4"
        />
        <template v-if="readiness.state.failed" #action>
          <q-btn
            flat
            color="primary"
            :label="$t('appDownload.retry')"
            :loading="readiness.state.loading"
            @click="retryAppDownload"
          />
        </template>
      </q-banner>
      <q-banner v-if="showIosNotificationPrompt" rounded class="ios-notification-prompt">
        <template #avatar>
          <q-icon name="notifications_active" color="primary" />
        </template>
        <strong>{{ $t('notifications.iosTitle') }}</strong>
        <div>{{ iosNotificationMessage }}</div>
        <template #action>
          <q-btn
            unelevated
            color="primary"
            icon="notifications_active"
            :label="$t('notifications.iosEnable')"
            :loading="enablingIosNotifications"
            :disable="notificationPermission === 'denied'"
            @click="enableIosNotifications"
          />
        </template>
      </q-banner>
      <router-view />
    </q-page-container>

    <div
      v-if="pwaUpdateAvailable"
      class="pwa-update-indicator"
      role="status"
      aria-live="polite"
      :aria-label="$t('updates.installingIndicator')"
    >
      <q-icon name="sync" size="22px" />
      <q-tooltip>{{ $t('updates.installingIndicator') }}</q-tooltip>
    </div>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core';
import { copyToClipboard, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { RouterView, useRouter } from 'vue-router';
import LanguageToggle from 'components/LanguageToggle.vue';
import SidebarShiftCard from 'components/SidebarShiftCard.vue';
import AppLogo from 'components/AppLogo.vue';
import { useAppStore } from 'stores/app-store';
import { buildWorkDayPlan } from 'src/core/day-plan';
import type { DayPlanEventKind } from 'src/core/day-plan';
import {
  activateAppUpdate,
  APP_UPDATE_AVAILABLE_EVENT,
  CURRENT_ANDROID_VERSION_CODE,
  type AppUpdateDetail,
} from 'src/services/app-update';
import {
  canInstallNativeAndroidUpdate,
  installNativeAndroidUpdate,
} from 'src/services/native-updater';
import {
  latestAvailableRelease,
  loadReleaseManifest,
  trackedDownloadUrl,
  type MobileRelease,
} from 'src/services/release-manifest';
import {
  currentWorkingShift,
  formatCountdown,
  nextWorkingShift,
  resolvedShiftCodeForDate,
} from 'src/core/schedule';
import { requestReminderPermission } from 'src/services/reminders/reminder-feedback';
import { syncPushReminders } from 'src/services/push-notifications';
import { appReadiness } from 'src/services/app-readiness';
import {
  isPwaInstalled,
  pwaInstallPrompt,
  registerPwaInstallListeners,
  requestPwaInstall,
  unregisterPwaInstallListeners,
} from 'src/services/pwa-install';

const drawerOpen = ref(false);
const $q = useQuasar();
const router = useRouter();
const { locale, t } = useI18n();
const app = useAppStore();
const readiness = appReadiness;
const pwaUpdateAvailable = ref(false);
const now = ref(new Date());
const titleColonVisible = ref(true);
const hiddenEvents = ref<Array<{ kind: Exclude<DayPlanEventKind, 'sleep'>; target: Date }>>([]);
const installPrompt = pwaInstallPrompt;
const isInstalledApp = isPwaInstalled;
const isNativeApp = Capacitor.isNativePlatform();
const userAgent = navigator.userAgent;
const isAndroid = /Android/i.test(userAgent);
const isIos = /iPad|iPhone|iPod/i.test(userAgent);
const showAndroidInstall = computed(() => isAndroid && !isNativeApp && !isInstalledApp.value);
const notificationPermission = ref<NotificationPermission | 'unsupported'>(
  'Notification' in window ? Notification.permission : 'unsupported',
);
const enablingIosNotifications = ref(false);
const showIosNotificationPrompt = computed(
  () =>
    isIos &&
    isInstalledApp.value &&
    app.activeProfile.reminders.enabled &&
    (notificationPermission.value !== 'granted' || !app.data.settings.cloudPushConsent),
);
const iosNotificationMessage = computed(() =>
  notificationPermission.value === 'denied'
    ? t('notifications.iosDenied')
    : t('notifications.iosMessage'),
);
const productName = 'My Shift';
const CapacitorApp = registerPlugin<{
  addListener(
    eventName: 'appStateChange',
    listener: (state: { isActive: boolean }) => void,
  ): Promise<PluginListenerHandle>;
}>('App');
const androidDownloadUrl = ref<string | null>(null);
const automaticAndroidUpdateCheckInterval = 5 * 60_000;
let lastAutomaticAndroidUpdateCheck = 0;
let promptedAndroidUpdateVersionCode = 0;
let automaticAndroidUpdateCheck: Promise<void> | null = null;
let automaticPwaUpdateCheck: Promise<void> | null = null;
let nativeAppStateListener: Promise<PluginListenerHandle> | null = null;
const dateTimer = window.setInterval(() => {
  now.value = new Date();
  if (now.value.getSeconds() === 0) app.applyShiftAtmosphere(now.value);
}, 1_000);
const titleBlinkTimer = window.setInterval(() => {
  titleColonVisible.value = !titleColonVisible.value;
}, 500);
const automaticUpdateTimer = window.setInterval(() => {
  void checkForAutomaticUpdate();
}, 60_000);
const todayLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now.value),
);

async function enableIosNotifications() {
  enablingIosNotifications.value = true;
  try {
    const permission = await requestReminderPermission();
    notificationPermission.value = permission;
    if (permission !== 'granted') return;

    app.data.settings.cloudPushConsent = true;
    const synced = await syncPushReminders(app.activeProfile, app.data.settings.locale);
    if (!synced) {
      $q.notify({ type: 'warning', message: t('notifications.iosSyncFailed') });
    }
  } finally {
    enablingIosNotifications.value = false;
  }
}

function refreshNotificationPermission() {
  notificationPermission.value =
    'Notification' in window ? Notification.permission : 'unsupported';
}
const currentShiftCode = computed(() =>
  resolvedShiftCodeForDate(now.value, app.pattern, app.activeProfile.calendarOverrides),
);
const currentShift = computed(() =>
  app.shifts.find((shift) => shift.id === currentShiftCode.value),
);
const nextHeaderShift = computed(() =>
  currentShift.value
    ? null
    : nextWorkingShift(
        now.value,
        app.pattern,
        app.shifts,
        app.activeProfile.calendarOverrides,
      ),
);
const headerShift = computed(() => currentShift.value ?? nextHeaderShift.value?.shift ?? null);
const headerShiftName = computed(() => {
  const shift = headerShift.value;
  return shift ? (shift.nameKey ? t(shift.nameKey) : shift.name) : t('shifts.off');
});
const headerShiftKindLabel = computed(() =>
  t(nextHeaderShift.value ? 'dashboard.nextShift' : 'dashboard.myShift'),
);
const titlePlan = computed(() => {
  const shift =
    currentWorkingShift(
      now.value,
      app.pattern,
      app.shifts,
      app.activeProfile.calendarOverrides,
    ) ??
    nextWorkingShift(
      now.value,
      app.pattern,
      app.shifts,
      app.activeProfile.calendarOverrides,
    );
  return shift
    ? buildWorkDayPlan({
        date: shift.date,
        pattern: app.pattern,
        shifts: app.shifts,
        overrides: app.activeProfile.calendarOverrides,
        transport: app.activeProfile.transport,
        sleepHours: app.data.settings.sleepHours,
      })
    : null;
});
const headerActivity = computed<'sleep' | 'leave' | 'work'>(() => {
  const plan = titlePlan.value;
  if (!plan) return 'sleep';

  const timestamp = now.value.getTime();
  if (timestamp < plan.alarmTime.getTime()) return 'sleep';
  if (timestamp < plan.leaveHome.getTime()) return 'leave';
  if (timestamp < plan.shiftEnd.getTime()) return 'work';
  return 'sleep';
});
const titleActivityIcon = computed(() => {
  const icons = {
    sleep: '🛏️',
    leave: '🚪',
    work: '🐈',
  } as const;
  return icons[headerActivity.value];
});
const titleEvent = computed(
  () =>
    titlePlan.value?.events.find(
      (event) => event.kind !== 'sleep' && event.target.getTime() > now.value.getTime(),
    ) ?? null,
);
const headerEventLabel = computed(() => {
  if (!titleEvent.value || titleEvent.value.kind === 'sleep') return '';
  const keys = {
    wake: 'dashboard.untilWake',
    leave: 'dashboard.untilLeave',
    transport: 'dashboard.untilTransport',
    shift: 'dashboard.untilShift',
    break: 'dashboard.untilFirstBreak',
    'shift-end': 'dashboard.untilShiftEnd',
  } as const;
  return t(keys[titleEvent.value.kind]);
});
const headerEventCountdown = computed(() =>
  titleEvent.value ? formatCountdown(titleEvent.value.target, now.value) : '',
);
const eventLabel = (kind: Exclude<DayPlanEventKind, 'sleep'>) => {
  const keys = {
    wake: 'dashboard.eventShort.wake',
    leave: 'dashboard.eventShort.leave',
    transport: 'dashboard.eventShort.transport',
    shift: 'dashboard.eventShort.shift',
    break: 'dashboard.eventShort.break',
    'shift-end': 'dashboard.eventShort.shiftEnd',
  } as const;
  return t(keys[kind]);
};
const missedHiddenEvents = computed(() =>
  hiddenEvents.value.filter((event) => event.target.getTime() <= now.value.getTime()),
);
const browserTitle = computed(() => {
  const missedEvent = missedHiddenEvents.value[0];
  if (document.hidden && missedEvent) {
    const alarm = titleColonVisible.value ? '⏰' : '🔔';
    return `${alarm} ${eventLabel(missedEvent.kind)} | ${productName}`;
  }
  if (!titleEvent.value) return productName;
  const totalMinutes = Math.max(
    0,
    Math.ceil((titleEvent.value.target.getTime() - now.value.getTime()) / 60_000),
  );
  const separator = titleColonVisible.value ? ':' : ' ';
  const countdown = `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}${separator}${String(totalMinutes % 60).padStart(2, '0')}`;
  return `${countdown} · ${titleActivityIcon.value} | ${productName}`;
});
const syncAfterVisibilityChange = () => {
  now.value = new Date();
  titleColonVisible.value = true;

  if (document.hidden) {
    hiddenEvents.value =
      titlePlan.value?.events
        .filter(
          (event): event is { kind: Exclude<DayPlanEventKind, 'sleep'>; target: Date } =>
            event.kind !== 'sleep' && event.target.getTime() > now.value.getTime(),
        )
        .map((event) => ({ kind: event.kind, target: new Date(event.target) })) ?? [];
    return;
  }

  const occurredEvents = hiddenEvents.value.filter(
    (event) => event.target.getTime() <= now.value.getTime(),
  );
  hiddenEvents.value = [];
  occurredEvents.forEach((event) => {
    $q.notify({
      group: false,
      message: t('dashboard.eventOccurred', { event: eventLabel(event.kind) }),
      caption: new Intl.DateTimeFormat(locale.value, {
        hour: '2-digit',
        minute: '2-digit',
      }).format(event.target),
      icon: 'alarm',
      color: 'warning',
      textColor: 'dark',
      position: 'top-right',
      timeout: 0,
      closeBtn: true,
      classes: 'shift-notification shift-notification--alarm',
    });
  });
  void checkForAutomaticUpdate();
};
document.addEventListener('visibilitychange', syncAfterVisibilityChange);
const showAppUpdateDialog = (event: CustomEvent<AppUpdateDetail>) => {
  const detail = event.detail;
  const incompatible = !detail.compatible;
  pwaUpdateAvailable.value = true;

  $q.dialog({
    title: t(incompatible ? 'updates.incompatibleTitle' : 'updates.title'),
    message: t(incompatible ? 'updates.incompatibleMessage' : 'updates.message', {
      version: detail.release ?? t('updates.newVersion'),
    }),
    cancel: {
      flat: true,
      label: t('updates.whatsNew'),
    },
    ok: {
      color: incompatible ? 'negative' : 'primary',
      label: t(incompatible ? 'updates.updateAndReset' : 'updates.updateNow'),
    },
    persistent: true,
  })
    .onOk(() => {
      const activated = activateAppUpdate(detail, incompatible);
      if (!activated) {
        $q.notify({
          type: 'negative',
          message: t('updates.backupFailed'),
        });
      }
    })
    .onCancel(() => void router.push('/whats-new'));
};
window.addEventListener(APP_UPDATE_AVAILABLE_EVENT, showAppUpdateDialog);

onMounted(() => {
  registerPwaInstallListeners();
  refreshNotificationPermission();
  window.addEventListener('focus', handleWindowFocus);
  if (isNativeApp) {
    nativeAppStateListener = CapacitorApp.addListener('appStateChange', handleNativeAppStateChange);
  }
  void checkForAutomaticUpdate({ force: true });
  void startAppDownload();
  window.addEventListener('online', handleOnline);
  window.addEventListener('app-route-unavailable', showUnavailableNotification);
});
const saveStatusIcon = computed(() =>
  app.saveStatus === 'error' ? 'error_outline' : 'verified_user',
);

watch(browserTitle, (title) => (document.title = title), { immediate: true });

watch(
  () => app.saveStatus,
  (status) => {
    if (status === 'saved') {
      $q.notify({
        group: 'local-save',
        message: t('storage.savedToast'),
        caption: t('storage.localOnly'),
        icon: 'check_circle',
        color: 'positive',
        textColor: 'white',
        position: 'bottom-right',
        timeout: 1400,
        classes: 'storage-notification storage-notification--saved',
      });
    } else if (status === 'error') {
      $q.notify({
        group: 'local-save',
        message: t('storage.error'),
        caption: t('storage.errorHint'),
        icon: 'error_outline',
        color: 'negative',
        textColor: 'white',
        position: 'bottom-right',
        timeout: 5000,
        classes: 'storage-notification storage-notification--error',
      });
    }
  },
);

onBeforeUnmount(() => {
  window.clearInterval(dateTimer);
  window.clearInterval(titleBlinkTimer);
  window.clearInterval(automaticUpdateTimer);
  document.removeEventListener('visibilitychange', syncAfterVisibilityChange);
  window.removeEventListener(APP_UPDATE_AVAILABLE_EVENT, showAppUpdateDialog);
  unregisterPwaInstallListeners();
  void nativeAppStateListener?.then((listener) => listener.remove());
  window.removeEventListener('focus', handleWindowFocus);
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('app-route-unavailable', showUnavailableNotification);
  document.title = productName;
});

const navigation = [
  { label: 'nav.dashboard', icon: 'space_dashboard', to: '/' },
  { label: 'nav.tomorrow', icon: 'next_plan', to: '/tomorrow' },
  { label: 'nav.calendar', icon: 'calendar_month', to: '/calendar' },
  { label: 'nav.statistics', icon: 'query_stats', to: '/statistics' },
  { label: 'nav.whatsNew', icon: 'new_releases', to: '/whats-new' },
  { label: 'nav.settings', icon: 'tune', to: '/settings' },
  { label: 'nav.privacy', icon: 'privacy_tip', to: '/privacy' },
];
const isRouteAvailable = (path: string) => readiness.isAvailable(path);
const showUnavailableNotification = () => {
  $q.notify({
    group: 'app-download',
    type: 'warning',
    icon: 'cloud_off',
    message: t('appDownload.unavailable'),
    caption: t('appDownload.unavailableHint'),
    timeout: 4000,
  });
};
const notifyUnavailable = (path: string) => {
  if (!isRouteAvailable(path)) showUnavailableNotification();
};
async function startAppDownload() {
  await readiness.preload();
  if (readiness.state.complete) {
    $q.notify({
      group: 'app-download',
      type: 'positive',
      icon: 'offline_pin',
      message: t('appDownload.complete'),
      timeout: 3500,
    });
  }
}
function retryAppDownload() {
  void startAppDownload();
}
function handleWindowFocus() {
  refreshNotificationPermission();
  void checkForAutomaticUpdate();
}
function handleOnline() {
  retryAppDownload();
  void checkForAutomaticUpdate({ force: true });
}
function handleNativeAppStateChange(state: { isActive: boolean }) {
  if (!state.isActive) return;
  refreshNotificationPermission();
  void checkForAutomaticUpdate({ force: true });
}
function toggleTheme() {
  app.setTheme($q.dark.isActive ? 'light' : 'dark');
}

async function installAndroidApp() {
  await requestPwaInstall();
}

async function checkForAutomaticUpdate(options: { force?: boolean } = {}) {
  if (canInstallNativeAndroidUpdate()) {
    await checkForAutomaticAndroidUpdate(options);
  } else {
    await checkForAutomaticPwaUpdate();
  }
}

async function checkForAutomaticPwaUpdate() {
  if (!('serviceWorker' in navigator)) return;
  if (automaticPwaUpdateCheck) return automaticPwaUpdateCheck;

  automaticPwaUpdateCheck = (async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration?.update();
    } catch {
      // Starting the PWA remains possible while offline.
    } finally {
      automaticPwaUpdateCheck = null;
    }
  })();

  return automaticPwaUpdateCheck;
}

async function checkForAutomaticAndroidUpdate(options: { force?: boolean } = {}) {
  const elapsed = Date.now() - lastAutomaticAndroidUpdateCheck;
  if (!options.force && elapsed < automaticAndroidUpdateCheckInterval) return;
  if (automaticAndroidUpdateCheck) return automaticAndroidUpdateCheck;

  automaticAndroidUpdateCheck = (async () => {
    lastAutomaticAndroidUpdateCheck = Date.now();
    try {
      const manifest = await loadReleaseManifest();
      const releases = manifest?.android.stable ?? [];
      const latestRelease = latestAvailableRelease(releases);
      androidDownloadUrl.value = latestRelease ? trackedDownloadUrl(latestRelease) : null;
      const release = latestAvailableRelease(releases, CURRENT_ANDROID_VERSION_CODE);
      if (!release || release.versionCode === promptedAndroidUpdateVersionCode) return;

      promptedAndroidUpdateVersionCode = release.versionCode;
      $q.dialog({
        title: t('updates.startupTitle'),
        message: t('updates.startupMessage', { version: release.version }),
        cancel: {
          flat: true,
          label: t('updates.later'),
        },
        ok: {
          color: 'primary',
          label: t('updates.downloadAndInstall'),
        },
        persistent: true,
      }).onOk(() => void installStartupAndroidUpdate(release));
    } catch {
      // Starting the app remains possible while offline.
    } finally {
      automaticAndroidUpdateCheck = null;
    }
  })();

  await automaticAndroidUpdateCheck;
}

async function installStartupAndroidUpdate(release: MobileRelease) {
  if (!release.url || !release.sha256) return;
  try {
    await installNativeAndroidUpdate(
      trackedDownloadUrl(release, true) ?? release.url,
      release.sha256,
      app.data,
    );
  } catch (error) {
    $q.notify({
      type: 'warning',
      message: t(
        error instanceof Error && error.message.includes('install-permission-required')
          ? 'mobileInstall.allowInstall'
          : 'mobileInstall.installError',
      ),
    });
  }
}

async function shareApp() {
  const isNativeAndroid = window.location.protocol === 'capacitor:' && isAndroid;
  const url = isNativeAndroid
    ? androidDownloadUrl.value ?? `${window.location.origin}/#/whats-new`
    : `${window.location.origin}${window.location.pathname}#/whats-new`;
  const shareData = {
    title: t('share.title'),
    text: t('share.text'),
    url,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
    }
  }

  await copyToClipboard(url);
  $q.notify({
    type: 'positive',
    message: t('share.copied'),
    timeout: 1_500,
  });
}

</script>
