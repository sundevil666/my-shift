<template>
  <q-page class="page-shell alarm-center-page">
    <page-header
      eyebrow="Android"
      title="Будильники"
      subtitle="Управление Android-будильником My Shift, мелодией, вибрацией и обновлением APK."
    />

    <div class="settings-grid">
      <q-card flat bordered class="settings-card">
        <q-card-section class="settings-card__header">
          <div class="section-title">Установленные будильники My Shift</div>
          <div class="supporting-text">
            Здесь видны будильники, которые помнит приложение. Они управляются My Shift, поэтому в
            Android Clock могут не отображаться.
          </div>
        </q-card-section>
        <q-card-section class="settings-card__body q-gutter-md">
          <q-banner rounded class="settings-android-alarm-status" :class="alarmReady ? 'settings-android-alarm-status--ready' : ''">
            <template #avatar>
              <q-icon :name="alarmReady ? 'verified' : 'warning'" />
            </template>
            {{ alarmReady ? $t('settings.androidAlarmReady') : $t('settings.androidAlarmNeedsSetup') }}
          </q-banner>
          <q-btn v-if="!alarmReady" class="app-action-button full-width" color="primary" icon="alarm_add" no-caps :label="$t('settings.openExactAlarmSettings')" @click="openExactAlarmSettings" />

          <div class="alarm-center-list">
            <q-card v-for="item in alarmItems" :key="item.scope" flat bordered class="alarm-center-item">
              <q-card-section>
                <div class="alarm-center-item__top">
                  <q-icon :name="item.icon" size="26px" color="primary" />
                  <div>
                    <div class="alarm-center-item__title">{{ item.title }}</div>
                    <div class="supporting-text">{{ item.id || 'Не установлен' }}</div>
                  </div>
                </div>
                <div class="alarm-center-item__time">{{ item.time || '--:--' }}</div>
                <div class="supporting-text">{{ item.message || item.emptyText }}</div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="settings-card">
        <q-card-section class="settings-card__header">
          <div class="section-title">Звук и поведение</div>
          <div class="supporting-text">Выберите мелодию, проверьте её и настройте вибрацию.</div>
        </q-card-section>
        <q-card-section class="settings-card__body settings-tests">
          <q-btn class="app-action-button full-width" color="secondary" icon="music_note" no-caps :label="$t('settings.chooseAlarmSound')" @click="chooseAlarmSound" />
          <div class="alarm-center-preview">
            <q-btn class="app-action-button" color="primary" icon="play_arrow" no-caps label="Прослушать" :disable="previewPlaying" @click="previewAlarmSound" />
            <q-btn outline class="app-action-button" color="primary" icon="stop" no-caps label="Стоп" :disable="!previewPlaying" @click="stopAlarmPreview" />
          </div>
          <q-toggle
            :model-value="vibrationEnabled"
            color="primary"
            icon="vibration"
            label="Вибрация"
            @update:model-value="setVibration"
          />
          <q-toggle
            :model-value="volumeRampEnabled"
            color="primary"
            icon="trending_up"
            label="Плавное увеличение громкости"
            @update:model-value="setVolumeRamp"
          />
          <q-btn outline class="app-action-button full-width" color="primary" icon="settings" no-caps :label="$t('settings.openAndroidSoundSettings')" @click="openAlarmSettings" />
        </q-card-section>
      </q-card>

      <q-card flat bordered class="settings-card">
        <q-card-section class="settings-card__header">
          <div class="section-title">Обновление приложения</div>
          <div class="supporting-text">Текущая версия: v{{ currentVersion }}</div>
        </q-card-section>
        <q-card-section class="settings-card__body settings-tests">
          <q-banner rounded class="mobile-install-card__update">
            <template #avatar>
              <q-icon :name="availableUpdate ? 'system_update' : 'verified'" :color="availableUpdate ? 'primary' : 'positive'" />
            </template>
            <div class="mobile-install-card__update-body">
              <div>
                <strong>{{ availableUpdate ? `Доступно обновление v${availableUpdate.version}` : 'APK актуален' }}</strong>
                <p>{{ availableUpdate ? `Установлено: v${currentVersion}. Новый APK: v${availableUpdate.version}.` : `Установленная версия: v${currentVersion}.` }}</p>
              </div>
              <q-btn v-if="availableUpdate" unelevated no-caps color="primary" icon="system_update" label="Обновить" :loading="installing" @click="installUpdate" />
              <q-btn v-else outline no-caps color="primary" icon="refresh" label="Проверить" :loading="checkingUpdate" @click="loadUpdates" />
            </div>
          </q-banner>
        </q-card-section>
      </q-card>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import PageHeader from 'components/PageHeader.vue';
import { CURRENT_ANDROID_VERSION_CODE, CURRENT_APP_VERSION } from 'src/services/app-update';
import { installNativeAndroidUpdate } from 'src/services/native-updater';
import {
  latestAvailableRelease,
  loadReleaseManifest,
  trackedDownloadUrl,
  type MobileRelease,
} from 'src/services/release-manifest';
import {
  chooseAndroidAlarmSound,
  getAndroidAlarmDiagnostics,
  openAndroidAlarmSettings,
  openAndroidExactAlarmSettings,
  previewAndroidAlarmSound,
  setAndroidAlarmOptions,
  stopAndroidAlarmPreview,
  type AndroidSystemAlarmStatus,
} from 'src/services/native-notifications';
import { useAppStore } from 'stores/app-store';

const $q = useQuasar();
const { t } = useI18n();
const app = useAppStore();
const diagnostics = ref<AndroidSystemAlarmStatus>({ canSetAlarm: false, hasCustomSound: false });
const checkingUpdate = ref(false);
const installing = ref(false);
const previewPlaying = ref(false);
const availableUpdate = ref<MobileRelease | null>(null);
const currentVersion = CURRENT_APP_VERSION;
const alarmReady = computed(() => Boolean(diagnostics.value.canScheduleExactAlarms ?? diagnostics.value.canSetAlarm));
const vibrationEnabled = computed(() => diagnostics.value.vibrationEnabled ?? true);
const volumeRampEnabled = computed(() => diagnostics.value.volumeRampEnabled ?? true);
const alarmItems = computed(() => [
  {
    scope: 'regular',
    icon: 'work_history',
    title: 'Рабочий будильник',
    id: diagnostics.value.lastAlarmId,
    time: formatAlarmTime(diagnostics.value.lastAlarmTimestamp),
    message: diagnostics.value.lastAlarmMessage,
    emptyText: 'Рабочий будильник сейчас не запланирован.',
  },
]);

void refreshDiagnostics();
void loadUpdates();
window.addEventListener('focus', refreshDiagnosticsSoon);
document.addEventListener('visibilitychange', refreshDiagnosticsWhenVisible);

onBeforeUnmount(() => {
  void stopAndroidAlarmPreview();
  window.removeEventListener('focus', refreshDiagnosticsSoon);
  document.removeEventListener('visibilitychange', refreshDiagnosticsWhenVisible);
});

async function refreshDiagnostics() {
  diagnostics.value = await getAndroidAlarmDiagnostics();
}

function refreshDiagnosticsSoon() {
  void refreshDiagnostics();
}

function refreshDiagnosticsWhenVisible() {
  if (!document.hidden) void refreshDiagnostics();
}

async function chooseAlarmSound() {
  const selected = await chooseAndroidAlarmSound();
  await refreshDiagnostics();
  $q.notify({ type: selected ? 'positive' : 'warning', message: t(selected ? 'settings.alarmSoundSelected' : 'settings.alarmSoundNotSelected') });
}

async function previewAlarmSound() {
  const started = await previewAndroidAlarmSound();
  previewPlaying.value = started;
  $q.notify({ type: started ? 'positive' : 'warning', message: started ? 'Мелодия запущена.' : 'Не удалось запустить мелодию.' });
}

async function stopAlarmPreview() {
  await stopAndroidAlarmPreview();
  previewPlaying.value = false;
}

async function setVibration(value: boolean) {
  const saved = await setAndroidAlarmOptions({ vibrationEnabled: value });
  await refreshDiagnostics();
  $q.notify({ type: saved ? 'positive' : 'warning', message: saved ? 'Настройка вибрации сохранена.' : 'Не удалось сохранить вибрацию.' });
}

async function setVolumeRamp(value: boolean) {
  const saved = await setAndroidAlarmOptions({ volumeRampEnabled: value });
  await refreshDiagnostics();
  $q.notify({ type: saved ? 'positive' : 'warning', message: saved ? 'Настройка громкости сохранена.' : 'Не удалось сохранить громкость.' });
}

async function openAlarmSettings() {
  const opened = await openAndroidAlarmSettings();
  $q.notify({ type: opened ? 'positive' : 'warning', message: t(opened ? 'settings.androidSoundSettingsOpened' : 'settings.androidSoundSettingsFailed') });
}

async function openExactAlarmSettings() {
  const opened = await openAndroidExactAlarmSettings();
  $q.notify({ type: opened ? 'positive' : 'warning', message: t(opened ? 'settings.exactAlarmSettingsOpened' : 'settings.exactAlarmSettingsFailed') });
}

async function loadUpdates() {
  checkingUpdate.value = true;
  try {
    const manifest = await loadReleaseManifest();
    availableUpdate.value = latestAvailableRelease(manifest?.android.stable ?? [], CURRENT_ANDROID_VERSION_CODE);
  } finally {
    checkingUpdate.value = false;
  }
}

async function installUpdate() {
  if (!availableUpdate.value?.url || !availableUpdate.value.sha256) return;
  installing.value = true;
  try {
    await installNativeAndroidUpdate(
      trackedDownloadUrl(availableUpdate.value, true) ?? availableUpdate.value.url,
      availableUpdate.value.sha256,
      app.data,
    );
  } catch (error) {
    $q.notify({
      type: 'warning',
      message: t(error instanceof Error && error.message.includes('install-permission-required') ? 'mobileInstall.allowInstall' : 'mobileInstall.installError'),
    });
  } finally {
    installing.value = false;
  }
}

function formatAlarmTime(timestamp?: number) {
  if (!timestamp) return '';
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}
</script>

<style scoped>
.alarm-center-list {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.alarm-center-item {
  border-radius: 8px;
}

.alarm-center-item__top {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.alarm-center-item__title {
  font-weight: 700;
}

.alarm-center-item__time {
  margin-top: 16px;
  font-size: 28px;
  font-weight: 800;
}

.alarm-center-preview {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
</style>
