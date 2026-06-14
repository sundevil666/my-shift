<template>
  <q-page padding class="admin-analytics-page">
    <div class="admin-analytics-shell">
      <div class="admin-analytics-brand">
        <AppLogo class="admin-analytics-logo" />
        <div>
          <div class="text-overline text-primary">My Shift</div>
          <h1>Статистика приложения</h1>
          <p>Закрытая панель владельца</p>
        </div>
      </div>

      <q-card v-if="checking" flat bordered class="admin-login-card">
        <q-card-section class="text-center q-pa-xl">
          <q-spinner color="primary" size="42px" />
        </q-card-section>
      </q-card>

      <q-card v-else-if="!authenticated" flat bordered class="admin-login-card">
        <q-form @submit.prevent="login">
          <q-card-section>
            <h2>Вход</h2>
            <p>Введите пароль администратора. Он проверяется только на сервере.</p>
            <q-input
              v-model="password"
              outlined
              autofocus
              :type="showPassword ? 'text' : 'password'"
              label="Пароль"
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
              label="Открыть статистику"
              :loading="loggingIn"
              :disable="!password"
            />
          </q-card-actions>
        </q-form>
      </q-card>

      <template v-else>
        <div class="admin-analytics-actions">
          <span>Данные обновляются по запросу</span>
          <q-btn flat no-caps icon="refresh" label="Обновить" :loading="loading" @click="refresh" />
          <q-btn flat no-caps icon="logout" label="Выйти" @click="logout" />
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
              <h2>Платформы</h2>
              <div v-for="item in summary.platforms" :key="item.platform" class="admin-data-row">
                <span>{{ platformLabel(item.platform) }}</span>
                <strong>{{ item.installations }}</strong>
              </div>
            </q-card-section>
          </q-card>
          <q-card flat bordered>
            <q-card-section>
              <h2>Версии</h2>
              <div v-for="item in summary.versions" :key="item.app_version" class="admin-data-row">
                <span>v{{ item.app_version }}</span>
                <strong>{{ item.installations }}</strong>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <q-card v-if="summary" flat bordered class="admin-activity-card">
          <q-card-section>
            <h2>Активность за 30 дней</h2>
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
            <p v-else class="text-grey-7">Данных пока нет.</p>
          </q-card-section>
        </q-card>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import AppLogo from 'components/AppLogo.vue';
import {
  checkAdminSession,
  loadAnalyticsSummary,
  loginToAnalytics,
  logoutFromAnalytics,
  type AnalyticsSummary,
} from 'src/services/admin-analytics';

const checking = ref(true);
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
        { icon: 'install_mobile', label: 'Установки', value: totals.installations },
        { icon: 'download', label: 'Скачивания APK', value: totals.downloads },
        { icon: 'today', label: 'Активны сегодня', value: totals.active_1d },
        { icon: 'date_range', label: 'Активны за 7 дней', value: totals.active_7d },
        { icon: 'calendar_month', label: 'Активны за 30 дней', value: totals.active_30d },
      ]
    : [];
});
const maxDailyActive = computed(() =>
  Math.max(1, ...(summary.value?.daily.map((item) => item.active) ?? [1])),
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
    loginError.value = error instanceof Error && error.message === 'invalid-password'
      ? 'Неверный пароль'
      : error instanceof Error && error.message === 'too-many-attempts'
        ? 'Слишком много попыток. Попробуйте через 15 минут.'
        : 'Не удалось войти. Попробуйте ещё раз.';
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
      loadError.value = 'Не удалось загрузить статистику.';
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
  return { android: 'Android', ios: 'iPhone', pwa: 'PWA', web: 'Веб' }[platform] ?? platform;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
</script>
