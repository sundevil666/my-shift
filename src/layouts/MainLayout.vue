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
          :to="item.to"
          exact
          active-class="nav-active"
        >
          <q-item-section avatar><q-icon :name="item.icon" class="design-icon" /></q-item-section>
          <q-item-section>{{ $t(item.label) }}</q-item-section>
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
          to="/support"
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
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
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
  CURRENT_APP_VERSION,
  type AppUpdateDetail,
} from 'src/services/app-update';
import {
  canInstallNativeAndroidUpdate,
  installNativeAndroidUpdate,
} from 'src/services/native-updater';
import {
  currentWorkingShift,
  nextWorkingShift,
  resolvedShiftCodeForDate,
} from 'src/core/schedule';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const drawerOpen = ref(false);
const $q = useQuasar();
const router = useRouter();
const { locale, t } = useI18n();
const app = useAppStore();
const now = ref(new Date());
const titleColonVisible = ref(true);
const hiddenEvents = ref<Array<{ kind: Exclude<DayPlanEventKind, 'sleep'>; target: Date }>>([]);
const installPrompt = ref<BeforeInstallPromptEvent | null>(null);
const isInstalledApp = ref(
  window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true),
);
const userAgent = navigator.userAgent;
const isAndroid = /Android/i.test(userAgent);
const showAndroidInstall = computed(() => isAndroid && !isInstalledApp.value);
const productName = 'My Shift';
const androidDownloadUrl =
  'https://raw.githubusercontent.com/sundevil666/my-shift/main/public/downloads/my-shift-android-0.1.5.apk';
let startupUpdateChecked = false;
const dateTimer = window.setInterval(() => {
  now.value = new Date();
  if (now.value.getSeconds() === 0) app.applyShiftAtmosphere(now.value);
}, 1_000);
const titleBlinkTimer = window.setInterval(() => {
  titleColonVisible.value = !titleColonVisible.value;
}, 500);
const todayLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now.value),
);
const currentShiftCode = computed(() =>
  resolvedShiftCodeForDate(now.value, app.pattern, app.activeProfile.calendarOverrides),
);
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
const titleEvent = computed(
  () =>
    titlePlan.value?.events.find(
      (event) => event.kind !== 'sleep' && event.target.getTime() > now.value.getTime(),
    ) ?? null,
);
const titleEventLabel = computed(() => {
  if (!titleEvent.value || titleEvent.value.kind === 'sleep') return '';
  const keys = {
    wake: 'dashboard.eventShort.wake',
    leave: 'dashboard.eventShort.leave',
    transport: 'dashboard.eventShort.transport',
    shift: 'dashboard.eventShort.shift',
    break: 'dashboard.eventShort.break',
    'shift-end': 'dashboard.eventShort.shiftEnd',
  } as const;
  return t(keys[titleEvent.value.kind]);
});
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
  return `${countdown} · ${titleEventLabel.value} | ${productName}`;
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
};
document.addEventListener('visibilitychange', syncAfterVisibilityChange);
const showAppUpdateDialog = (event: CustomEvent<AppUpdateDetail>) => {
  const detail = event.detail;
  const incompatible = !detail.compatible;

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
  void checkForStartupUpdate();
});
const captureInstallPrompt = (event: Event) => {
  event.preventDefault();
  installPrompt.value = event as BeforeInstallPromptEvent;
};
const markAppInstalled = () => {
  installPrompt.value = null;
  isInstalledApp.value = true;
};
window.addEventListener('beforeinstallprompt', captureInstallPrompt);
window.addEventListener('appinstalled', markAppInstalled);
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
  document.removeEventListener('visibilitychange', syncAfterVisibilityChange);
  window.removeEventListener(APP_UPDATE_AVAILABLE_EVENT, showAppUpdateDialog);
  window.removeEventListener('beforeinstallprompt', captureInstallPrompt);
  window.removeEventListener('appinstalled', markAppInstalled);
  document.title = productName;
});

const navigation = [
  { label: 'nav.dashboard', icon: 'space_dashboard', to: '/' },
  { label: 'nav.tomorrow', icon: 'next_plan', to: '/tomorrow' },
  { label: 'nav.calendar', icon: 'calendar_month', to: '/calendar' },
  { label: 'nav.statistics', icon: 'query_stats', to: '/statistics' },
  { label: 'nav.patterns', icon: 'repeat', to: '/patterns' },
  { label: 'nav.reminders', icon: 'notifications_active', to: '/reminders' },
  { label: 'nav.whatsNew', icon: 'new_releases', to: '/whats-new' },
  { label: 'nav.settings', icon: 'tune', to: '/settings' },
];
function toggleTheme() {
  app.setTheme($q.dark.isActive ? 'light' : 'dark');
}

async function installAndroidApp() {
  const prompt = installPrompt.value;
  if (!prompt) return;

  await prompt.prompt();
  const choice = await prompt.userChoice;
  installPrompt.value = null;
  if (choice.outcome === 'accepted') isInstalledApp.value = true;
}

interface StartupRelease {
  version: string;
  url: string | null;
  status: 'available' | 'preparing';
}

interface StartupReleaseManifest {
  android?: {
    stable?: StartupRelease[];
  };
}

function compareVersions(left: string, right: string) {
  const leftParts = left.split('.').map(Number);
  const rightParts = right.split('.').map(Number);
  const length = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

async function checkForStartupUpdate() {
  if (startupUpdateChecked) return;
  startupUpdateChecked = true;

  if (canInstallNativeAndroidUpdate()) {
    try {
      const response = await fetch(`/mobile-releases.json?time=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!response.ok) return;
      const manifest = (await response.json()) as StartupReleaseManifest;
      const release = manifest.android?.stable?.find(
        (item) =>
          item.status === 'available' &&
          Boolean(item.url) &&
          compareVersions(item.version, CURRENT_APP_VERSION) > 0,
      );
      if (!release?.url) return;

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
      }).onOk(() => void installStartupAndroidUpdate(release.url!));
    } catch {
      // Starting the app remains possible while offline.
    }
    return;
  }

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration?.update();
    } catch {
      // Starting the PWA remains possible while offline.
    }
  }
}

async function installStartupAndroidUpdate(url: string) {
  try {
    await installNativeAndroidUpdate(url, app.data);
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
    ? androidDownloadUrl
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
