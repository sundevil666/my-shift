<template>
  <main class="page-shell onboarding-page q-pa-md">
    <div class="onboarding-wrap">
      <div class="onboarding-controls">
        <LanguageToggle />
        <q-btn
          outline
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
        <q-btn
          outline
          round
          class="app-icon-button app-icon-button--danger"
          color="negative"
          icon="restart_alt"
          :aria-label="$t('settings.resetApplication')"
          @click="app.resetApplication"
        >
          <q-tooltip>{{ $t('settings.resetApplication') }}</q-tooltip>
        </q-btn>
      </div>

      <PageHeader
        eyebrow="My Shift"
        :title="$t('onboarding.title')"
        :subtitle="$t('onboarding.subtitle')"
      />

      <q-card flat bordered>
        <q-card-section class="q-gutter-lg">
          <q-select
            v-model="company"
            outlined
            emit-value
            map-options
            :options="companyOptions"
            :label="$t('onboarding.company')"
          />
          <q-btn
            outline
            disable
            class="app-action-button"
            icon="add_business"
            :label="$t('onboarding.customSoon')"
          />

          <q-btn-toggle
            v-if="company"
            v-model="transportMode"
            spread
            no-caps
            toggle-color="primary"
            :options="transportOptions"
          />

          <template v-if="company && transportMode === 'bus'">
            <q-select
              v-model="routeId"
              use-input
              fill-input
              hide-selected
              outlined
              emit-value
              map-options
              input-debounce="0"
              :options="routeOptions"
              :label="$t('onboarding.route')"
              @filter="filterRoutes"
              @update:model-value="onRouteSelected"
            />
            <q-select
              v-model="stopKey"
              use-input
              fill-input
              hide-selected
              outlined
              emit-value
              map-options
              input-debounce="0"
              :options="stopOptions"
              :label="$t('onboarding.stop')"
              @filter="filterStops"
              @update:model-value="onStopSelected"
            />
          </template>

          <q-select
            v-if="company && transportMode"
            v-model="currentShiftId"
            outlined
            emit-value
            map-options
            :options="shiftOptions"
            :label="$t('onboarding.currentShift')"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            unelevated
            color="primary"
            class="app-action-button"
            icon-right="arrow_forward"
            :disable="!canComplete"
            :label="$t('onboarding.continue')"
            @click="complete"
          />
        </q-card-actions>
      </q-card>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import LanguageToggle from 'components/LanguageToggle.vue';
import PageHeader from 'components/PageHeader.vue';
import { dhlBusRoutes } from 'src/core/dhl-bus-routes';
import { matchesSearch } from 'src/core/search';
import { useAppStore } from 'stores/app-store';
import type { TransportMode } from 'src/models/app';

const app = useAppStore();
const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();
const company = ref<'dhl' | null>(null);
const transportMode = ref<TransportMode | null>(null);
const routeId = ref<string | null>(null);
const stopKey = ref<string | null>(null);
const currentShiftId = ref<string | null>(null);
const routeQuery = ref('');
const stopQuery = ref('');

function toggleTheme() {
  app.setTheme($q.dark.isActive ? 'light' : 'dark');
}

const companyOptions = [{ label: 'DHL', value: 'dhl' }];
const transportOptions = computed(() => [
  { label: t('settings.bus'), value: 'bus', icon: 'directions_bus' },
  { label: t('settings.car'), value: 'car', icon: 'directions_car' },
]);
const shiftOptions = computed(() =>
  app.shifts.map((shift) => ({
    label: shift.nameKey ? t(shift.nameKey) : shift.name,
    value: shift.id,
  })),
);
const routeOptions = computed(() =>
  dhlBusRoutes
    .filter((route) => matchesSearch(`${route.code} ${route.name}`, routeQuery.value))
    .map((route) => ({ label: `${route.code} — ${route.name}`, value: route.id })),
);
const allStops = computed(() =>
  dhlBusRoutes
    .filter((route) => !routeId.value || route.id === routeId.value)
    .flatMap((route) =>
      route.stops.map((stop) => ({
        label: `${stop.name} — ${route.code}`,
        value: `${route.id}|${stop.id}`,
        routeId: route.id,
        stopId: stop.id,
      })),
    ),
);
const stopOptions = computed(() =>
  allStops.value.filter((stop) => matchesSearch(stop.label, stopQuery.value)),
);
const canComplete = computed(
  () =>
    company.value &&
    transportMode.value &&
    currentShiftId.value &&
    (transportMode.value === 'car' || (routeId.value && stopKey.value)),
);

function filterRoutes(value: string, update: (callback: () => void) => void) {
  update(() => (routeQuery.value = value));
}
function filterStops(value: string, update: (callback: () => void) => void) {
  update(() => (stopQuery.value = value));
}
function onRouteSelected() {
  if (stopKey.value && !stopKey.value.startsWith(`${routeId.value}|`)) stopKey.value = null;
}
function onStopSelected(value: string | null) {
  if (value) routeId.value = value.split('|')[0] ?? null;
}
function complete() {
  if (!canComplete.value || !transportMode.value || !currentShiftId.value) return;
  app.completeOnboarding({
    transportMode: transportMode.value,
    currentShiftId: currentShiftId.value,
    busRouteId: transportMode.value === 'bus' ? routeId.value : null,
    busStopId: transportMode.value === 'bus' ? (stopKey.value?.split('|')[1] ?? null) : null,
  });
  void router.replace('/');
}
</script>
