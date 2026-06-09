<template>
  <q-page padding class="page-shell">
    <PageHeader
      :eyebrow="todayLabel"
      :title="$t('dashboard.title')"
      :subtitle="$t('dashboard.subtitle')"
    />

    <q-card flat bordered class="q-mb-lg">
      <q-card-section class="row q-col-gutter-md items-center">
        <div class="col-12 col-md">
          <div class="text-overline">{{ app.activeProfile.workplaceName }}</div>
          <div class="section-title">
            {{ transportSummary }}
          </div>
          <div v-if="selectedStop" class="supporting-text q-mt-xs">
            {{ selectedStop.name }} · {{ $t('dashboard.scheduleFrom') }}
            {{ scheduleDateLabel }}
          </div>
        </div>
        <div class="col-auto">
          <q-btn flat color="primary" icon="tune" :label="$t('nav.settings')" to="/settings" />
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="row items-center justify-between q-col-gutter-md">
          <div class="col">
            <div class="section-title">{{ $t('dashboard.myShift') }}</div>
          </div>
          <div class="col-auto">
            <q-toggle v-model="shiftEditing" :label="$t('dashboard.changeShift')" color="primary" />
          </div>
        </div>
        <div class="shift-selector q-mt-md" :class="{ 'shift-selector--editing': shiftEditing }">
          <q-btn
            v-for="option in shiftOptions"
            :key="option.value"
            no-caps
            unelevated
            class="shift-selector__button"
            :class="{ 'shift-selector__button--active': option.value === currentShiftCode }"
            :color="option.value === currentShiftCode ? 'primary' : undefined"
            :outline="option.value !== currentShiftCode"
            :disable="!shiftEditing"
            :label="option.label"
            @click="selectShift(option.value)"
          />
        </div>
      </q-card-section>
    </q-card>

    <q-card flat class="hero-card text-white q-mb-lg">
      <q-card-section class="row items-center q-col-gutter-lg">
        <div class="col-12 col-md-7">
          <div class="text-overline">{{ heroTitle }}</div>
          <div class="text-h3 text-weight-bold q-mt-sm">{{ displayedShiftName }}</div>
          <div class="text-h6 q-mt-sm">{{ displayedShiftDate }} · {{ time(heroTarget) }}</div>
        </div>
        <div class="col-12 col-md-5 text-md-right">
          <div class="text-caption text-white-7">{{ heroCountdownLabel }}</div>
          <div class="hero-countdown">{{ heroCountdown }}</div>
        </div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="item in countdowns" :key="item.label" class="col-12 col-sm-4">
        <CountdownCard v-bind="item" />
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-7">
        <q-card flat bordered>
          <q-card-section>
            <div class="section-title">{{ $t('dashboard.sleepPlan') }}</div>
            <div class="supporting-text q-mt-xs">{{ $t('dashboard.sleepHint') }}</div>
          </q-card-section>
          <q-list separator>
            <q-item v-for="option in sleepOptions" :key="option.hours">
              <q-item-section avatar
                ><q-icon name="bedtime" color="deep-purple-5"
              /></q-item-section>
              <q-item-section>{{ option.hours }} {{ $t('common.hours') }}</q-item-section>
              <q-item-section side class="text-weight-bold">{{ option.time }}</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
      <div class="col-12 col-md-5">
        <q-card flat bordered>
          <q-card-section>
            <div class="section-title">{{ $t('dashboard.schedulePreview') }}</div>
          </q-card-section>
          <q-list>
            <q-item v-for="day in weekPreview" :key="day.key">
              <q-item-section>{{ day.label }}</q-item-section>
              <q-item-section side>
                <q-badge
                  rounded
                  :style="{ background: day.color, color: readableTextColor(day.color) }"
                >
                  {{ day.name }}
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
          <q-card-actions align="right">
            <q-btn flat color="primary" :label="$t('common.openCalendar')" to="/calendar" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from 'components/PageHeader.vue';
import CountdownCard from 'components/CountdownCard.vue';
import { useAppStore } from 'stores/app-store';
import type { ShiftCode } from 'src/models/app';
import { DHL_SCHEDULE_VALID_FROM, dhlBusRoutes } from 'src/core/dhl-bus-routes';
import {
  addMinutes,
  currentWorkingShift,
  formatCountdown,
  nextWorkingShift,
  shiftCodeForDate,
  shiftDateTime,
  shiftEndDateTime,
} from 'src/core/schedule';

const app = useAppStore();
const { t, locale } = useI18n();
const now = ref(new Date());
const shiftEditing = ref(false);
const timer = window.setInterval(() => (now.value = new Date()), 30_000);
onBeforeUnmount(() => window.clearInterval(timer));

const currentShiftCode = computed(() => shiftCodeForDate(now.value, app.pattern));
const shiftOptions = computed(() =>
  app.shifts.map((shift) => ({
    label: shift.nameKey ? t(shift.nameKey) : shift.name,
    value: shift.id,
  })),
);
function selectShift(code: ShiftCode) {
  app.setCurrentShift(code);
  shiftEditing.value = false;
}

const currentShift = computed(() => currentWorkingShift(now.value, app.pattern, app.shifts));
const nextShift = computed(() =>
  currentShift.value ? null : nextWorkingShift(now.value, app.pattern, app.shifts),
);
const displayedShift = computed(() => currentShift.value ?? nextShift.value);
const shiftStart = computed(() =>
  nextShift.value
    ? shiftDateTime(nextShift.value.date, nextShift.value.shift.startTime)
    : now.value,
);
const heroTarget = computed(() =>
  currentShift.value
    ? shiftEndDateTime(currentShift.value.date, currentShift.value.shift)
    : shiftStart.value,
);
const selectedRoute = computed(() =>
  dhlBusRoutes.find((route) => route.id === app.activeProfile.transport.busRouteId),
);
const selectedStop = computed(() =>
  selectedRoute.value?.stops.find(
    (stop) => stop.id === app.activeProfile.transport.busStopId,
  ),
);
const referenceTime = computed(() => {
  if (!nextShift.value) return now.value;
  if (app.activeProfile.transport.mode === 'bus' && selectedStop.value) {
    const busTime = selectedStop.value.times[nextShift.value.shift.id];
    if (busTime) return shiftDateTime(nextShift.value.date, busTime);
  }
  return shiftStart.value;
});
const alarmTime = computed(() =>
  nextShift.value
    ? addMinutes(
        referenceTime.value,
        -app.activeProfile.transport.alarmBeforeReferenceMinutes,
      )
    : now.value,
);
const leaveHome = computed(() =>
  nextShift.value
    ? addMinutes(
        referenceTime.value,
        -app.activeProfile.transport.leaveBeforeReferenceMinutes,
      )
    : now.value,
);
const displayedShiftName = computed(() =>
  displayedShift.value
    ? displayedShift.value.shift.nameKey
      ? t(displayedShift.value.shift.nameKey)
      : displayedShift.value.shift.name
    : t('shifts.off'),
);
const displayedShiftDate = computed(() =>
  displayedShift.value
    ? new Intl.DateTimeFormat(locale.value, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(heroTarget.value)
    : '',
);
const heroTitle = computed(() =>
  currentShift.value ? t('dashboard.currentShift') : t('dashboard.nextShift'),
);
const heroCountdownLabel = computed(() =>
  currentShift.value ? t('dashboard.untilShiftEnd') : t('dashboard.untilShift'),
);
const todayLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value, { weekday: 'long', day: 'numeric', month: 'long' }).format(
    now.value,
  ),
);
const untilShift = computed(() => formatCountdown(shiftStart.value, now.value));
const heroCountdown = computed(() => formatCountdown(heroTarget.value, now.value));
const time = (date: Date) =>
  new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }).format(date);
const readableTextColor = (color: string) => {
  const hex = color.replace('#', '');
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;
  return luminance > 150 ? '#17242a' : '#ffffff';
};
const countdowns = computed(() =>
  currentShift.value
    ? [
        {
          icon: 'schedule',
          label: t('dashboard.untilShiftEnd'),
          value: heroCountdown.value,
          time: time(heroTarget.value),
        },
      ]
    : [
        {
          icon: 'directions_bus',
          label: t('dashboard.untilTransport'),
          value: formatCountdown(referenceTime.value, now.value),
          time: time(referenceTime.value),
        },
        {
          icon: 'alarm',
          label: t('dashboard.untilWake'),
          value: formatCountdown(alarmTime.value, now.value),
          time: time(alarmTime.value),
        },
        ...(app.activeProfile.transport.leaveReminderEnabled
          ? [{
          icon: 'directions_walk',
          label: t('dashboard.untilLeave'),
          value: formatCountdown(leaveHome.value, now.value),
          time: time(leaveHome.value),
        }]
          : [{
          icon: 'schedule',
          label: t('dashboard.untilShift'),
          value: untilShift.value,
          time: time(shiftStart.value),
        }]),
      ],
);
const sleepOptions = computed(() =>
  [app.data.settings.sleepHours, 7, 6]
    .filter((hours, index, values) => values.indexOf(hours) === index)
    .map((hours) => ({ hours, time: time(addMinutes(alarmTime.value, -hours * 60)) })),
);
const transportSummary = computed(() =>
  app.activeProfile.transport.mode === 'bus'
    ? `${selectedRoute.value?.code ?? ''} — ${selectedRoute.value?.name ?? ''}`
    : t('settings.car'),
);
const scheduleDateLabel = new Intl.DateTimeFormat(locale.value).format(
  new Date(`${DHL_SCHEDULE_VALID_FROM}T00:00:00`),
);
const weekPreview = computed(() =>
  Array.from({ length: 5 }, (_, index) => {
    const date = new Date(now.value);
    date.setDate(date.getDate() + index);
    const code = shiftCodeForDate(date, app.pattern);
    const shift = app.shifts.find((item) => item.id === code);
    return {
      key: date.toISOString(),
      label: new Intl.DateTimeFormat(locale.value, { weekday: 'short', day: 'numeric' }).format(
        date,
      ),
      name: shift ? (shift.nameKey ? t(shift.nameKey) : shift.name) : t('shifts.off'),
      color: shift?.color ?? '#95a1ad',
    };
  }),
);
</script>
