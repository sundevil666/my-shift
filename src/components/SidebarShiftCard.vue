<template>
  <q-card flat class="sidebar-shift-card">
    <div class="sidebar-shift-card__selector">
      <div>
        <div class="sidebar-shift-card__selector-label">{{ $t('dashboard.myShift') }}</div>
        <div class="sidebar-shift-card__selector-value">{{ selectedShiftName }}</div>
      </div>
      <q-btn
        flat
        round
        dense
        icon="swap_horiz"
        class="sidebar-shift-card__selector-button"
        :aria-label="$t('dashboard.changeShift')"
      >
        <q-tooltip>{{ $t('dashboard.changeShift') }}</q-tooltip>
        <q-menu anchor="bottom right" self="top right">
          <q-list class="sidebar-shift-menu">
            <q-item
              v-for="option in shiftOptions"
              :key="option.value"
              v-close-popup
              clickable
              :active="option.value === currentShiftCode"
              active-class="sidebar-shift-menu__active"
              @click="app.setCurrentShift(option.value)"
            >
              <q-item-section>{{ option.label }}</q-item-section>
              <q-item-section v-if="option.value === currentShiftCode" side>
                <q-icon name="check" class="design-icon" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
    <q-card-section>
      <div class="sidebar-next-event">
        <div class="sidebar-next-event__heading">
          <q-icon :name="nextEvent.icon" class="sidebar-next-event__icon design-icon" />
          <div class="sidebar-next-event__label">{{ nextEvent.label }}</div>
        </div>
        <div class="sidebar-next-event__details">
          <div class="sidebar-next-event__countdown">
            <span>{{ countdown.main }}</span>
            <span class="sidebar-next-event__seconds-wrap">
              <Transition name="second-tick" mode="out-in">
                <span :key="countdown.seconds" class="sidebar-next-event__seconds">
                  {{ countdown.seconds }}s
                </span>
              </Transition>
            </span>
          </div>
          <div class="sidebar-next-event__time">{{ time(nextEvent.target) }}</div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppStore } from 'stores/app-store';
import { dhlBusRoutes } from 'src/core/dhl-bus-routes';
import {
  addMinutes,
  currentWorkingShift,
  FIRST_BREAK_AFTER_SHIFT_START_MINUTES,
  formatCountdown,
  nextWorkingShift,
  resolvedShiftCodeForDate,
  shiftDateTime,
  shiftEndDateTime,
} from 'src/core/schedule';

const app = useAppStore();
const { t, locale } = useI18n();
const now = ref(new Date());
const timer = window.setInterval(() => (now.value = new Date()), 1_000);

onBeforeUnmount(() => window.clearInterval(timer));

const currentShift = computed(() =>
  currentWorkingShift(
    now.value,
    app.pattern,
    app.shifts,
    app.activeProfile.calendarOverrides,
  ),
);
const currentShiftCode = computed(() =>
  resolvedShiftCodeForDate(now.value, app.pattern, app.activeProfile.calendarOverrides),
);
const shiftOptions = computed(() =>
  app.shifts.map((shift) => ({
    label: shift.nameKey ? t(shift.nameKey) : shift.name,
    value: shift.id,
  })),
);
const selectedShiftName = computed(
  () => shiftOptions.value.find((option) => option.value === currentShiftCode.value)?.label ?? '',
);
const nextShift = computed(() =>
  currentShift.value
    ? null
    : nextWorkingShift(
        now.value,
        app.pattern,
        app.shifts,
        app.activeProfile.calendarOverrides,
      ),
);
const displayedShift = computed(() => currentShift.value ?? nextShift.value);
const shiftStart = computed(() =>
  displayedShift.value
    ? shiftDateTime(displayedShift.value.date, displayedShift.value.shift.startTime)
    : now.value,
);
const firstBreakTime = computed(() =>
  addMinutes(shiftStart.value, FIRST_BREAK_AFTER_SHIFT_START_MINUTES),
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
  addMinutes(referenceTime.value, -app.activeProfile.transport.alarmBeforeReferenceMinutes),
);
const leaveHome = computed(() =>
  addMinutes(referenceTime.value, -app.activeProfile.transport.leaveBeforeReferenceMinutes),
);
const events = computed(() =>
  currentShift.value
    ? [
        ...(firstBreakTime.value.getTime() > now.value.getTime()
          ? [{ icon: 'free_breakfast', label: t('dashboard.untilFirstBreak'), target: firstBreakTime.value }]
          : []),
        {
          icon: 'schedule',
          label: t('dashboard.untilShiftEnd'),
          target: shiftEndDateTime(currentShift.value.date, currentShift.value.shift),
        },
      ]
    : [
        { icon: 'alarm', label: t('dashboard.untilWake'), target: alarmTime.value },
        ...(app.activeProfile.transport.leaveReminderEnabled
          ? [{ icon: 'directions_walk', label: t('dashboard.untilLeave'), target: leaveHome.value }]
          : []),
        {
          icon: app.activeProfile.transport.mode === 'bus' ? 'directions_bus' : 'directions_car',
          label: t('dashboard.untilTransport'),
          target: referenceTime.value,
        },
        { icon: 'schedule', label: t('dashboard.untilShift'), target: shiftStart.value },
        { icon: 'free_breakfast', label: t('dashboard.untilFirstBreak'), target: firstBreakTime.value },
      ],
);
const nextEvent = computed(
  () => events.value.find((event) => event.target.getTime() > now.value.getTime()) ?? events.value.at(-1)!,
);
const countdown = computed(() => {
  const totalSeconds = Math.max(
    0,
    Math.floor((nextEvent.value.target.getTime() - now.value.getTime()) / 1_000),
  );
  return {
    main: formatCountdown(nextEvent.value.target, now.value),
    seconds: String(totalSeconds % 60).padStart(2, '0'),
  };
});
const time = (date: Date) =>
  new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }).format(date);
</script>
