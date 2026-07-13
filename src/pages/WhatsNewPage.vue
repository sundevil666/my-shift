<template>
  <q-page padding class="page-shell whats-new-page">
    <PageHeader
      :eyebrow="$t('nav.whatsNew')"
      :title="$t('whatsNew.title')"
      :subtitle="$t('whatsNew.subtitle')"
    >
      <q-chip color="primary" text-color="white" icon="verified">
        v{{ CURRENT_APP_VERSION }}
      </q-chip>
    </PageHeader>

    <q-card flat bordered class="useful-card">
      <q-card-section>
        <div class="text-overline text-primary">{{ $t('whatsNew.useful.eyebrow') }}</div>
        <h2>{{ $t('whatsNew.useful.title') }}</h2>
        <p>{{ $t('whatsNew.useful.subtitle') }}</p>
        <div class="useful-card__grid">
          <div v-for="tip in usefulTips" :key="tip.title" class="useful-card__item">
            <q-icon :name="tip.icon" color="primary" size="24px" />
            <div>
              <strong>{{ $t(tip.title) }}</strong>
              <p>{{ $t(tip.text) }}</p>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="mobile-install-card">
      <q-card-section>
        <div class="text-overline text-primary">{{ $t('mobileInstall.eyebrow') }}</div>
        <h2>{{ $t('mobileInstall.title') }}</h2>
        <p>{{ $t('mobileInstall.subtitle') }}</p>
      </q-card-section>

      <q-tabs
        v-model="platform"
        dense
        no-caps
        align="left"
        active-color="primary"
        indicator-color="primary"
        class="mobile-platform-tabs"
      >
        <q-tab name="android" icon="android" label="Android" />
        <q-tab name="ios" icon="phone_iphone" label="iPhone / iOS" />
        <q-tab name="desktop" icon="laptop_mac" :label="$t('mobileInstall.desktopTab')" />
      </q-tabs>

      <q-separator />
      <q-tab-panels v-model="platform" animated class="mobile-install-panels">
        <q-tab-panel v-for="target in platforms" :key="target" :name="target">
          <template v-if="target === 'android'">
            <q-banner v-if="nativeAndroid" rounded class="mobile-install-card__update">
              <template #avatar>
                <q-icon
                  :name="availableAndroidUpdate ? 'system_update' : 'verified'"
                  :color="availableAndroidUpdate ? 'primary' : 'positive'"
                />
              </template>
              <div class="mobile-install-card__update-body">
                <div>
                  <strong>
                    {{
                      availableAndroidUpdate
                        ? $t('mobileInstall.updateAvailableTitle', {
                            version: availableAndroidUpdate.version,
                          })
                        : $t('mobileInstall.upToDateTitle')
                    }}
                  </strong>
                  <p>
                    {{
                      availableAndroidUpdate
                        ? $t('mobileInstall.updateAvailableText', {
                            current: CURRENT_APP_VERSION,
                            version: availableAndroidUpdate.version,
                          })
                        : $t('mobileInstall.upToDateText', { version: CURRENT_APP_VERSION })
                    }}
                  </p>
                </div>
                <q-btn
                  v-if="availableAndroidUpdate"
                  unelevated
                  no-caps
                  color="primary"
                  icon="system_update"
                  :label="$t('mobileInstall.updateApk')"
                  :loading="installingVersion === availableAndroidUpdate.version"
                  @click="installAndroidRelease(availableAndroidUpdate)"
                />
                <q-btn
                  v-else
                  outline
                  no-caps
                  color="primary"
                  icon="refresh"
                  :label="$t('mobileInstall.checkUpdates')"
                  :loading="checkingAndroidUpdate"
                  @click="loadMobileReleases"
                />
              </div>
            </q-banner>
            <p class="mobile-install-card__note">{{ $t('mobileInstall.androidNote') }}</p>
            <q-banner rounded class="mobile-install-card__warning">
              <template #avatar><q-icon name="warning_amber" color="warning" /></template>
              {{ $t('mobileInstall.risk') }}
            </q-banner>
          </template>

          <div v-else-if="target === 'ios'" class="pwa-install-guide">
            <div class="pwa-install-guide__title">
              <q-icon name="ios_share" color="primary" />
              <strong>{{ $t('mobileInstall.iosPwaTitle') }}</strong>
            </div>
            <div class="pwa-install-guide__intro">
              <p>{{ $t('mobileInstall.iosNote') }}</p>
            </div>
            <ol>
              <li>{{ $t('mobileInstall.iosStepOpen') }}</li>
              <li>{{ $t('mobileInstall.iosStepShare') }}</li>
              <li>{{ $t('mobileInstall.iosStepHome') }}</li>
              <li>{{ $t('mobileInstall.iosStepConfirm') }}</li>
            </ol>
            <q-banner rounded class="pwa-install-guide__note">
              <template #avatar><q-icon name="notifications_active" color="primary" /></template>
              {{ $t('mobileInstall.iosNotifications') }}
            </q-banner>
          </div>

          <div v-else class="pwa-install-guide">
            <div class="pwa-install-guide__title">
              <q-icon name="install_desktop" color="primary" />
              <strong>{{ $t('mobileInstall.desktopPwaTitle') }}</strong>
            </div>
            <div class="pwa-install-guide__intro">
              <p>{{ $t('mobileInstall.desktopNote') }}</p>
              <q-btn
                unelevated
                no-caps
                color="primary"
                icon="install_desktop"
                :label="$t('mobileInstall.desktopInstallButton')"
                :disable="isInstalledApp"
                @click="installDesktopPwa"
              >
                <q-tooltip v-if="isInstalledApp">
                  {{ $t('mobileInstall.pwaInstalled') }}
                </q-tooltip>
                <q-tooltip v-else-if="!installPrompt">
                  {{ $t('mobileInstall.pwaInstallUnavailable') }}
                </q-tooltip>
              </q-btn>
            </div>
            <ol>
              <li>{{ $t('mobileInstall.desktopStepOpen') }}</li>
              <li>{{ $t('mobileInstall.desktopStepInstall') }}</li>
              <li>{{ $t('mobileInstall.desktopStepConfirm') }}</li>
              <li>{{ $t('mobileInstall.desktopStepLaunch') }}</li>
            </ol>
            <q-banner rounded class="pwa-install-guide__note">
              <template #avatar><q-icon name="sync" color="primary" /></template>
              {{ $t('mobileInstall.desktopSync') }}
            </q-banner>
          </div>

          <q-tabs
            v-if="target === 'android' && hasAdvancedRelease(target)"
            v-model="channel"
            dense
            no-caps
            align="left"
            active-color="primary"
            indicator-color="primary"
          >
            <q-tab name="stable" :label="$t('mobileInstall.stable')" />
            <q-tab name="advanced" :label="$t('mobileInstall.advanced')" />
          </q-tabs>

          <div v-if="target === 'android'" class="mobile-release-list">
            <article
              v-for="release in releasesFor(target)"
              :key="`${target}:${channel}:${release.version}`"
              class="mobile-release"
            >
              <div>
                <div class="mobile-release__version">
                  <strong>v{{ release.version }}</strong>
                  <q-badge
                    :color="channel === 'stable' ? 'positive' : 'warning'"
                    :label="$t(`mobileInstall.${channel}`)"
                  />
                </div>
                <time :datetime="release.date">{{ formatDate(release.date) }}</time>
              </div>
              <q-btn
                v-if="release.url"
                unelevated
                no-caps
                color="primary"
                icon="download"
                :href="
                  nativeAndroid && target === 'android'
                    ? undefined
                    : (trackedDownloadUrl(release) ?? undefined)
                "
                :target="nativeAndroid && target === 'android' ? undefined : '_blank'"
                :rel="nativeAndroid && target === 'android' ? undefined : 'noopener'"
                :label="$t('mobileInstall.downloadApk')"
                :loading="installingVersion === release.version"
                @click="
                  nativeAndroid && target === 'android' ? installAndroidRelease(release) : undefined
                "
              />
            </article>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <section class="release-list" :aria-label="$t('whatsNew.history')">
      <section v-for="group in releaseGroups" :key="group.date" class="release-group">
        <time class="release-group__date" :datetime="group.date">{{ formatDate(group.date) }}</time>
        <div class="release-group__items">
          <q-card
            v-for="release in group.releases"
            :key="release.version"
            flat
            bordered
            class="release-card"
          >
            <q-card-section>
              <div class="release-card__meta">
                <q-badge color="primary">v{{ release.version }}</q-badge>
              </div>
              <h2>{{ $t(release.title) }}</h2>
              <ul>
                <li v-for="feature in release.features" :key="feature">{{ $t(feature) }}</li>
              </ul>
            </q-card-section>
          </q-card>
        </div>
      </section>
    </section>

    <q-card flat bordered class="feedback-card">
      <q-card-section>
        <div class="text-overline text-primary">{{ $t('feedback.eyebrow') }}</div>
        <h2>{{ $t('feedback.title') }}</h2>
        <p>{{ $t('feedback.subtitle') }}</p>
      </q-card-section>
      <q-form class="feedback-form" @submit.prevent="submitFeedback">
        <q-card-section class="feedback-form__grid">
          <q-input
            v-model.trim="form.name"
            outlined
            :label="$t('feedback.name')"
            maxlength="100"
            :rules="[requiredRule, nameRule]"
          />
          <q-input
            v-model.trim="form.email"
            outlined
            type="email"
            :label="$t('feedback.email')"
            maxlength="160"
            :rules="[requiredRule, emailRule]"
          />
          <q-input
            v-model.trim="form.message"
            outlined
            type="textarea"
            autogrow
            class="feedback-form__message"
            :label="$t('feedback.message')"
            maxlength="4000"
            counter
            :rules="[requiredRule, messageRule]"
          />
          <q-input
            v-model.trim="form.answer"
            outlined
            inputmode="numeric"
            class="feedback-form__captcha"
            :label="$t('feedback.captcha', { question: challenge?.question ?? '…' })"
            :disable="!challenge"
            :rules="[requiredRule]"
          />
          <input
            v-model="form.website"
            class="feedback-honeypot"
            tabindex="-1"
            autocomplete="off"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn
            unelevated
            no-caps
            color="primary"
            type="submit"
            icon="send"
            :label="$t('feedback.send')"
            :loading="sending"
            :disable="!challenge"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import PageHeader from 'components/PageHeader.vue';
import { CURRENT_ANDROID_VERSION_CODE, CURRENT_APP_VERSION } from 'src/services/app-update';
import { loadFeedbackChallenge, sendFeedback, type FeedbackChallenge } from 'src/services/feedback';
import {
  canInstallNativeAndroidUpdate,
  installNativeAndroidUpdate,
} from 'src/services/native-updater';
import {
  loadReleaseManifest,
  latestAvailableRelease,
  trackedDownloadUrl,
  type MobileRelease,
  type MobileReleaseManifest,
  type ReleaseChannel as Channel,
  type ReleasePlatform as Platform,
} from 'src/services/release-manifest';
import {
  isPwaInstalled,
  pwaInstallPrompt,
  registerPwaInstallListeners,
  requestPwaInstall,
} from 'src/services/pwa-install';
import { useAppStore } from 'stores/app-store';

const app = useAppStore();
const $q = useQuasar();
const { locale, t } = useI18n();
const challenge = ref<FeedbackChallenge | null>(null);
const sending = ref(false);
const nativeAndroid = canInstallNativeAndroidUpdate();
const installingVersion = ref<string | null>(null);
const checkingAndroidUpdate = ref(false);
const installPrompt = pwaInstallPrompt;
const isInstalledApp = isPwaInstalled;
const platforms = ['android', 'ios', 'desktop'] as const;
type InstallPlatform = (typeof platforms)[number];

const platform = ref<InstallPlatform>(detectPlatform());
const channel = ref<Channel>('stable');
const mobileReleases = ref<MobileReleaseManifest>({
  android: { stable: [], advanced: [] },
  ios: { stable: [], advanced: [] },
});
const form = reactive({ name: '', email: '', message: '', answer: '', website: '' });
const usefulTips = [
  {
    icon: 'system_update',
    title: 'whatsNew.useful.updatesTitle',
    text: 'whatsNew.useful.updatesText',
  },
  {
    icon: 'backup',
    title: 'whatsNew.useful.backupTitle',
    text: 'whatsNew.useful.backupText',
  },
  {
    icon: 'install_mobile',
    title: 'whatsNew.useful.installTitle',
    text: 'whatsNew.useful.installText',
  },
  {
    icon: 'share',
    title: 'whatsNew.useful.shareTitle',
    text: 'whatsNew.useful.shareText',
  },
] as const;
const releases = [
  {
    version: '0.1.8',
    date: '2026-07-13',
    title: 'whatsNew.releases.v018.title',
    features: [
      'whatsNew.releases.v018.arrivalReminders',
      'whatsNew.releases.v018.androidAlarms',
      'whatsNew.releases.v018.alarmTest',
      'whatsNew.releases.v018.desktopInstall',
      'whatsNew.releases.v018.polish',
    ],
  },
  {
    version: '0.1.5',
    date: '2026-06-14',
    title: 'whatsNew.releases.v015.title',
    features: [
      'whatsNew.releases.v015.startupCheck',
      'whatsNew.releases.v015.safeInstall',
      'whatsNew.releases.v015.privateSupport',
      'whatsNew.releases.v015.anonymousAnalytics',
      'whatsNew.releases.v015.privateDiagnostics',
    ],
  },
  {
    version: '0.1.4',
    date: '2026-06-14',
    title: 'whatsNew.releases.v014.title',
    features: [
      'whatsNew.releases.v014.systemShare',
      'whatsNew.releases.v014.platformLink',
      'whatsNew.releases.v014.fallback',
    ],
  },
  {
    version: '0.1.1',
    date: '2026-06-13',
    title: 'whatsNew.releases.v011.title',
    features: [
      'whatsNew.releases.v011.nativeUpdate',
      'whatsNew.releases.v011.backup',
      'whatsNew.releases.v011.signing',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-06-13',
    title: 'whatsNew.releases.v010.title',
    features: [
      'whatsNew.releases.v010.changelog',
      'whatsNew.releases.v010.feedback',
      'whatsNew.releases.v010.updates',
      'whatsNew.releases.v010.install',
    ],
  },
  {
    version: '0.0.1',
    date: '2026-06-01',
    title: 'whatsNew.releases.v001.title',
    features: [
      'whatsNew.releases.v001.schedule',
      'whatsNew.releases.v001.calendar',
      'whatsNew.releases.v001.reminders',
      'whatsNew.releases.v001.statistics',
    ],
  },
] as const;
const releaseGroups = computed(() => {
  const groups = new Map<string, Array<(typeof releases)[number]>>();

  for (const release of releases) {
    const group = groups.get(release.date) ?? [];
    group.push(release);
    groups.set(release.date, group);
  }

  return [...groups].map(([date, groupedReleases]) => ({ date, releases: groupedReleases }));
});
const availableAndroidUpdate = computed(() =>
  latestAvailableRelease(mobileReleases.value.android.stable, CURRENT_ANDROID_VERSION_CODE),
);

const requiredRule = (value: string) => Boolean(value?.trim()) || t('feedback.validation.required');
const nameRule = (value: string) => value.trim().length >= 2 || t('feedback.validation.name');
const emailRule = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || t('feedback.validation.email');
const messageRule = (value: string) =>
  value.trim().length >= 10 || t('feedback.validation.message');

onMounted(() => {
  registerPwaInstallListeners();
  void refreshChallenge();
  void loadMobileReleases();
});

function detectPlatform(): InstallPlatform {
  if (typeof navigator === 'undefined') return 'android';
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ? 'ios' : 'android';
}

function releasesFor(target: Platform) {
  return mobileReleases.value[target][channel.value];
}

function hasAdvancedRelease(target: Platform) {
  return mobileReleases.value[target].advanced.some((release) => Boolean(release.url));
}

async function loadMobileReleases() {
  checkingAndroidUpdate.value = true;
  try {
    const manifest = await loadReleaseManifest();
    if (manifest) mobileReleases.value = manifest;
  } finally {
    checkingAndroidUpdate.value = false;
  }
}

async function installAndroidRelease(release: MobileRelease) {
  if (!release.url || !release.sha256) return;
  installingVersion.value = release.version;
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
  } finally {
    installingVersion.value = null;
  }
}

async function installDesktopPwa() {
  const result = await requestPwaInstall();
  if (result === 'unavailable') {
    $q.notify({
      type: 'info',
      icon: 'install_desktop',
      message: t('mobileInstall.pwaInstallUnavailable'),
    });
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

async function refreshChallenge() {
  form.answer = '';
  try {
    challenge.value = await loadFeedbackChallenge();
  } catch {
    challenge.value = null;
    $q.notify({ type: 'negative', message: t('feedback.challengeError') });
  }
}

async function submitFeedback() {
  if (!challenge.value) return;
  sending.value = true;
  try {
    await sendFeedback({
      ...form,
      challengeToken: challenge.value.token,
    });
    form.name = '';
    form.email = '';
    form.message = '';
    form.website = '';
    $q.notify({ type: 'positive', message: t('feedback.success') });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t(
        error instanceof Error && error.message === 'rate-limit'
          ? 'feedback.rateLimit'
          : 'feedback.error',
      ),
    });
  } finally {
    sending.value = false;
    await refreshChallenge();
  }
}
</script>
