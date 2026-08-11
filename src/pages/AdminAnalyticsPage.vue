<template>
  <main class="admin-analytics-page q-pa-md">
    <div class="admin-analytics-shell">
      <div class="admin-analytics-brand">
        <AppLogo class="admin-analytics-logo" />
        <div>
          <div class="text-overline text-primary">My Shift</div>
          <h1>{{ t('admin.title') }}</h1>
          <p>{{ t('admin.subtitle') }}</p>
        </div>
        <q-btn
          flat
          no-caps
          icon="home"
          :label="t('admin.home')"
          class="admin-home-button"
          href="/#/"
        />
      </div>

      <q-card v-if="checking" flat bordered class="admin-login-card">
        <q-card-section class="text-center q-pa-xl">
          <q-spinner color="primary" size="42px" />
        </q-card-section>
      </q-card>

      <q-card v-else-if="!authenticated" flat bordered class="admin-login-card">
        <q-form @submit.prevent="login">
          <q-card-section>
            <h2>{{ t('admin.login') }}</h2>
            <p>{{ t('admin.loginHint') }}</p>
            <q-input
              v-model="password"
              outlined
              autofocus
              :type="showPassword ? 'text' : 'password'"
              :label="t('admin.password')"
              autocomplete="current-password"
              :error="Boolean(loginError)"
              :error-message="loginError"
            >
              <template #append>
                <q-btn
                  flat
                  round
                  dense
                  :icon="showPassword ? 'visibility_off' : 'visibility'"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </q-card-section>
          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn
              unelevated
              no-caps
              color="primary"
              type="submit"
              :label="t('admin.open')"
              :loading="loggingIn"
              :disable="!password"
            />
          </q-card-actions>
        </q-form>
      </q-card>

      <template v-else>
        <div class="admin-analytics-actions">
          <span>{{ t('admin.onRequest') }}</span>
          <q-btn
            flat
            no-caps
            icon="refresh"
            :label="t('admin.refresh')"
            :loading="loading"
            @click="refresh"
          />
          <q-btn flat no-caps icon="logout" :label="t('admin.logout')" @click="logout" />
        </div>

        <q-banner v-if="loadError" rounded class="bg-negative text-white q-mb-md">
          {{ loadError }}
        </q-banner>

        <div v-if="summary" class="admin-metric-grid">
          <q-card v-for="metric in metrics" :key="metric.label" flat bordered>
            <q-card-section>
              <q-icon :name="metric.icon" color="primary" size="28px" />
              <strong>{{ metric.value }}</strong>
              <span>{{ metric.label }}</span>
            </q-card-section>
          </q-card>
        </div>

        <div v-if="summary" class="admin-detail-grid">
          <q-card flat bordered>
            <q-card-section>
              <h2>{{ t('admin.platforms') }}</h2>
              <div v-for="item in summary.platforms" :key="item.platform" class="admin-data-row">
                <span>{{ platformLabel(item.platform) }}</span>
                <strong>{{ item.installations }}</strong>
              </div>
            </q-card-section>
          </q-card>
          <q-card flat bordered>
            <q-card-section>
              <h2>{{ t('admin.versions') }}</h2>
              <div v-for="item in summary.versions" :key="item.app_version" class="admin-data-row">
                <span>v{{ item.app_version }}</span>
                <strong>{{ item.installations }}</strong>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div v-if="summary" class="admin-detail-grid">
          <q-card flat bordered>
            <q-card-section>
              <h2>{{ t('admin.retention') }}</h2>
              <div v-for="item in retentionMetrics" :key="item.label" class="admin-data-row">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
              <p class="admin-card-note">
                {{ t('admin.retentionHint') }}
              </p>
            </q-card-section>
          </q-card>
          <q-card flat bordered>
            <q-card-section>
              <h2>{{ t('admin.androidUpdates') }}</h2>
              <div
                v-for="item in summary.versionChanges"
                :key="`${item.from_version}:${item.to_version}`"
                class="admin-data-row"
              >
                <span>v{{ item.from_version }} → v{{ item.to_version }}</span>
                <strong>{{ item.updates }}</strong>
              </div>
              <p v-if="!summary.versionChanges.length" class="text-grey-7">
                {{ t('admin.noUpdates') }}
              </p>
            </q-card-section>
          </q-card>
        </div>

        <q-card v-if="summary" flat bordered class="admin-activity-card">
          <q-card-section>
            <h2>{{ t('admin.insights') }}</h2>
            <ul class="admin-insight-list">
              <li v-for="insight in insights" :key="insight">{{ insight }}</li>
            </ul>
          </q-card-section>
        </q-card>

        <q-card v-if="summary" flat bordered class="admin-activity-card">
          <q-card-section>
            <h2>{{ t('admin.newInstalls') }}</h2>
            <div v-if="summary.newInstallations.length" class="admin-activity-list">
              <div v-for="item in [...summary.newInstallations].reverse()" :key="item.install_date">
                <time>{{ formatDate(item.install_date) }}</time>
                <q-linear-progress
                  rounded
                  size="10px"
                  color="positive"
                  :value="item.installations / maxDailyInstallations"
                />
                <strong>{{ item.installations }}</strong>
              </div>
            </div>
            <p v-else class="text-grey-7">{{ t('admin.noData') }}</p>
          </q-card-section>
        </q-card>

        <q-card v-if="summary" flat bordered class="admin-activity-card">
          <q-card-section>
            <h2>{{ t('admin.activity') }}</h2>
            <div v-if="summary.daily.length" class="admin-activity-list">
              <div v-for="item in [...summary.daily].reverse()" :key="item.activity_date">
                <time>{{ formatDate(item.activity_date) }}</time>
                <q-linear-progress
                  rounded
                  size="10px"
                  color="primary"
                  :value="item.active / maxDailyActive"
                />
                <strong>{{ item.active }}</strong>
              </div>
            </div>
            <p v-else class="text-grey-7">{{ t('admin.noData') }}</p>
          </q-card-section>
        </q-card>
      </template>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AppLogo from 'components/AppLogo.vue';
import {
  checkAdminSession,
  loadAnalyticsSummary,
  loginToAnalytics,
  logoutFromAnalytics,
  type AnalyticsSummary,
} from 'src/services/admin-analytics';

const checking = ref(true);
const { t, locale } = useI18n();
const authenticated = ref(false);
const loggingIn = ref(false);
const loading = ref(false);
const password = ref('');
const showPassword = ref(false);
const loginError = ref('');
const loadError = ref('');
const summary = ref<AnalyticsSummary | null>(null);

const metrics = computed(() => {
  const totals = summary.value?.totals;
  return totals
    ? [
        { icon: 'install_mobile', label: t('admin.installations'), value: totals.installations },
        { icon: 'download', label: t('admin.downloads'), value: totals.downloads },
        {
          icon: 'system_update_alt',
          label: t('admin.successfulUpdates'),
          value: totals.successful_updates,
        },
        { icon: 'today', label: t('admin.activeToday'), value: totals.active_1d },
        { icon: 'date_range', label: t('admin.active7'), value: totals.active_7d },
        { icon: 'calendar_month', label: t('admin.active30'), value: totals.active_30d },
      ]
    : [];
});
const retentionMetrics = computed(() => {
  const retention = summary.value?.retention;
  if (!retention) return [];
  return [
    retentionMetric(t('admin.d1'), retention.retained_d1, retention.eligible_d1),
    retentionMetric(t('admin.d7'), retention.retained_d7, retention.eligible_d7),
    retentionMetric(t('admin.d30'), retention.retained_d30, retention.eligible_d30),
  ];
});
const insights = computed(() => {
  if (!summary.value) return [];
  const { totals, retention, versions } = summary.value;
  const result: string[] = [];
  if (totals.installations < 10) {
    result.push(t('admin.insightFew'));
  }
  if (totals.downloads > 0 && totals.installations === 0) {
    result.push(t('admin.insightDownloads'));
  }
  if (retention.eligible_d1 > 0) {
    const rate = retention.retained_d1 / retention.eligible_d1;
    result.push(rate >= 0.4 ? t('admin.insightGoodD1') : t('admin.insightLowD1'));
  }
  if (versions.length > 1) {
    result.push(t('admin.insightVersions'));
  }
  if (totals.inactive_30d > 0) {
    result.push(t('admin.insightInactive', { count: totals.inactive_30d }));
  }
  if (!result.length) result.push(t('admin.insightNone'));
  return result;
});
const maxDailyActive = computed(() =>
  Math.max(1, ...(summary.value?.daily.map((item) => item.active) ?? [1])),
);
const maxDailyInstallations = computed(() =>
  Math.max(1, ...(summary.value?.newInstallations.map((item) => item.installations) ?? [1])),
);

onMounted(async () => {
  try {
    authenticated.value = await checkAdminSession();
    if (authenticated.value) await refresh();
  } finally {
    checking.value = false;
  }
});

async function login() {
  loggingIn.value = true;
  loginError.value = '';
  try {
    await loginToAnalytics(password.value);
    authenticated.value = true;
    password.value = '';
    await refresh();
  } catch (error) {
    loginError.value =
      error instanceof Error && error.message === 'invalid-password'
        ? t('admin.invalidPassword')
        : error instanceof Error && error.message === 'too-many-attempts'
          ? t('admin.tooManyAttempts')
          : t('admin.loginFailed');
  } finally {
    loggingIn.value = false;
  }
}

async function refresh() {
  loading.value = true;
  loadError.value = '';
  try {
    summary.value = await loadAnalyticsSummary();
  } catch (error) {
    if (error instanceof Error && error.message === 'unauthorized') {
      authenticated.value = false;
      summary.value = null;
    } else {
      loadError.value = t('admin.loadFailed');
    }
  } finally {
    loading.value = false;
  }
}

async function logout() {
  await logoutFromAnalytics();
  authenticated.value = false;
  summary.value = null;
}

function platformLabel(platform: string) {
  return (
    { android: 'Android', ios: 'iPhone', pwa: 'PWA', web: t('admin.web') }[platform] ?? platform
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function retentionMetric(label: string, retained: number, eligible: number) {
  return {
    label,
    value: eligible
      ? `${Math.round((retained / eligible) * 100)}% (${retained}/${eligible})`
      : t('admin.tooEarly'),
  };
}
</script>
