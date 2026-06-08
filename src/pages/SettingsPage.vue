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
          <q-card-section>
            <div class="section-title">{{ $t('settings.workplace') }}</div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-md">
            <q-select
              :model-value="app.data.settings.workplaceType"
              outlined
              emit-value
              map-options
              class="col-12 col-md-6"
              :options="workplaceOptions"
              :label="$t('settings.workplace')"
              @update:model-value="app.setWorkplace"
            />
            <q-input
              v-if="app.data.settings.workplaceType === 'custom'"
              v-model="app.data.settings.workplaceName"
              outlined
              class="col-12 col-md-6"
              :label="$t('settings.workplaceName')"
            />
            <div v-else class="col-12 col-md-6 row items-center">
              <q-btn
                outline
                color="primary"
                icon="restart_alt"
                :label="$t('settings.resetDhl')"
                @click="app.resetDhlSchedule"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-lg-6">
        <q-card flat bordered>
          <q-card-section
            ><div class="section-title">{{ $t('settings.general') }}</div></q-card-section
          >
          <q-card-section class="q-gutter-md">
            <q-select
              v-model="app.data.settings.locale"
              outlined
              emit-value
              map-options
              :options="localeOptions"
              :label="$t('settings.language')"
              @update:model-value="changeLocale"
            />
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
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-lg-6">
        <q-card flat bordered>
          <q-card-section
            ><div class="section-title">{{ $t('settings.transport') }}</div></q-card-section
          >
          <q-card-section class="q-gutter-md">
            <q-btn-toggle
              v-model="app.data.transport.mode"
              spread
              no-caps
              toggle-color="primary"
              :options="transportOptions"
            />
            <q-input
              v-model.number="app.data.transport.preparationMinutes"
              outlined
              type="number"
              :label="$t('settings.preparation')"
              suffix="min"
            />
            <q-input
              v-if="app.data.transport.mode === 'car'"
              v-model.number="app.data.transport.carTravelMinutes"
              outlined
              type="number"
              :label="$t('settings.travel')"
              suffix="min"
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="section-title">{{ $t('settings.shifts') }}</div>
              <q-btn
                v-if="app.data.settings.workplaceType === 'custom'"
                flat
                color="primary"
                icon="add"
                :label="$t('settings.addShift')"
                @click="app.addShift"
              />
            </div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-md">
            <div v-for="shift in app.data.shifts" :key="shift.id" class="col-12 col-md-4">
              <q-card flat class="shift-settings" :style="{ borderTopColor: shift.color }">
                <q-card-section class="q-gutter-md">
                  <div class="row items-center no-wrap q-gutter-sm">
                    <q-input
                      v-model="shift.name"
                      dense
                      outlined
                      class="col"
                      :label="$t('settings.shiftName')"
                    />
                    <q-btn
                      v-if="app.data.settings.workplaceType === 'custom'"
                      flat
                      round
                      color="negative"
                      icon="delete"
                      :disable="app.data.shifts.length === 1"
                      @click="app.removeShift(shift.id)"
                    />
                  </div>
                  <q-input
                    v-model="shift.startTime"
                    outlined
                    type="time"
                    :label="$t('settings.start')"
                  />
                  <q-input
                    v-model="shift.endTime"
                    outlined
                    type="time"
                    :label="$t('settings.end')"
                  />
                  <q-input
                    v-model="shift.departureTime"
                    outlined
                    type="time"
                    :label="$t('settings.busTime')"
                  />
                  <q-input
                    v-model="shift.wakeTime"
                    outlined
                    type="time"
                    :label="$t('settings.wakeTime')"
                  />
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from 'components/PageHeader.vue';
import { useAppStore } from 'stores/app-store';
import type { Locale } from 'src/models/app';

const app = useAppStore();
const { t, locale } = useI18n();
const localeOptions = [
  { label: 'Русский', value: 'ru-RU' },
  { label: 'Українська', value: 'uk-UA' },
  { label: 'English', value: 'en-US' },
  { label: 'Slovenčina', value: 'sk-SK' },
];
const themeOptions = computed(() => [
  { label: t('settings.system'), value: 'system' },
  { label: t('settings.light'), value: 'light' },
  { label: t('settings.dark'), value: 'dark' },
]);
const workplaceOptions = computed(() => [
  { label: 'DHL', value: 'dhl' },
  { label: t('settings.customWorkplace'), value: 'custom' },
]);
const transportOptions = computed(() => [
  { label: t('settings.bus'), value: 'bus', icon: 'directions_bus' },
  { label: t('settings.car'), value: 'car', icon: 'directions_car' },
]);
function changeLocale(value: Locale) {
  locale.value = value;
  app.setLocale(value);
}
</script>
