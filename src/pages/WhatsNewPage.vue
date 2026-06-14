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
      </q-tabs>

      <q-separator />
      <q-tab-panels v-model="platform" animated class="mobile-install-panels">
        <q-tab-panel v-for="target in platforms" :key="target" :name="target">
          <template v-if="target === 'android'">
            <p class="mobile-install-card__note">{{ $t('mobileInstall.androidNote') }}</p>
            <q-banner rounded class="mobile-install-card__warning">
              <template #avatar><q-icon name="warning_amber" color="warning" /></template>
              {{ $t('mobileInstall.risk') }}
            </q-banner>
          </template>

          <div v-else class="ios-install-guide">
            <div class="ios-install-guide__title">
              <q-icon name="ios_share" color="primary" />
              <strong>{{ $t('mobileInstall.iosPwaTitle') }}</strong>
            </div>
            <p>{{ $t('mobileInstall.iosNote') }}</p>
            <ol>
              <li>{{ $t('mobileInstall.iosStepOpen') }}</li>
              <li>{{ $t('mobileInstall.iosStepShare') }}</li>
              <li>{{ $t('mobileInstall.iosStepHome') }}</li>
              <li>{{ $t('mobileInstall.iosStepConfirm') }}</li>
            </ol>
            <q-banner rounded class="ios-install-guide__note">
              <template #avatar><q-icon name="notifications_active" color="primary" /></template>
              {{ $t('mobileInstall.iosNotifications') }}
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
                :href="nativeAndroid && target === 'android' ? undefined : release.url"
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
      <q-card v-for="release in releases" :key="release.version" flat bordered class="release-card">
        <q-card-section>
          <div class="release-card__meta">
            <q-badge color="primary">v{{ release.version }}</q-badge>
            <time :datetime="release.date">{{ formatDate(release.date) }}</time>
          </div>
          <h2>{{ $t(release.title) }}</h2>
          <ul>
            <li v-for="feature in release.features" :key="feature">{{ $t(feature) }}</li>
          </ul>
        </q-card-section>
      </q-card>
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
          <input v-model="form.website" class="feedback-honeypot" tabindex="-1" autocomplete="off" />
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
import { onMounted, reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import PageHeader from 'components/PageHeader.vue';
import { CURRENT_APP_VERSION } from 'src/services/app-update';
import {
  loadFeedbackChallenge,
  sendFeedback,
  type FeedbackChallenge,
} from 'src/services/feedback';
import {
  canInstallNativeAndroidUpdate,
  installNativeAndroidUpdate,
} from 'src/services/native-updater';
import { useAppStore } from 'stores/app-store';

const app = useAppStore();
const $q = useQuasar();
const { locale, t } = useI18n();
const challenge = ref<FeedbackChallenge | null>(null);
const sending = ref(false);
const nativeAndroid = canInstallNativeAndroidUpdate();
const installingVersion = ref<string | null>(null);
const platforms = ['android', 'ios'] as const;
type Platform = (typeof platforms)[number];
type Channel = 'stable' | 'advanced';
interface MobileRelease {
  version: string;
  date: string;
  url: string | null;
  status: 'available' | 'preparing';
}
type MobileReleaseManifest = Record<Platform, Record<Channel, MobileRelease[]>>;

const platform = ref<Platform>(detectPlatform());
const channel = ref<Channel>('stable');
const mobileReleases = ref<MobileReleaseManifest>({
  android: { stable: [], advanced: [] },
  ios: { stable: [], advanced: [] },
});
const form = reactive({ name: '', email: '', message: '', answer: '', website: '' });
const releases = [
  {
    version: '0.1.5',
    date: '2026-06-14',
    title: 'whatsNew.releases.v015.title',
    features: [
      'whatsNew.releases.v015.startupCheck',
      'whatsNew.releases.v015.safeInstall',
      'whatsNew.releases.v015.privateSupport',
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
    version: '0.1.3',
    date: '2026-06-14',
    title: 'whatsNew.releases.v013.title',
    features: [
      'whatsNew.releases.v013.bankDetails',
      'whatsNew.releases.v013.copy',
      'whatsNew.releases.v013.voluntary',
    ],
  },
  {
    version: '0.1.2',
    date: '2026-06-14',
    title: 'whatsNew.releases.v012.title',
    features: [
      'whatsNew.releases.v012.supportPage',
      'whatsNew.releases.v012.supportButton',
      'whatsNew.releases.v012.futurePayments',
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

const requiredRule = (value: string) => Boolean(value?.trim()) || t('feedback.validation.required');
const nameRule = (value: string) => value.trim().length >= 2 || t('feedback.validation.name');
const emailRule = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || t('feedback.validation.email');
const messageRule = (value: string) =>
  value.trim().length >= 10 || t('feedback.validation.message');

onMounted(() => {
  void refreshChallenge();
  void loadMobileReleases();
});

function detectPlatform(): Platform {
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
  try {
    const response = await fetch(`/mobile-releases.json?time=${Date.now()}`, {
      cache: 'no-store',
    });
    if (response.ok) mobileReleases.value = (await response.json()) as MobileReleaseManifest;
  } catch {
    // The page remains usable when release metadata is temporarily unavailable.
  }
}

async function installAndroidRelease(release: MobileRelease) {
  if (!release.url) return;
  installingVersion.value = release.version;
  try {
    await installNativeAndroidUpdate(release.url, app.data);
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
      message: t(error instanceof Error && error.message === 'rate-limit'
        ? 'feedback.rateLimit'
        : 'feedback.error'),
    });
  } finally {
    sending.value = false;
    await refreshChallenge();
  }
}
</script>
