<template>
  <q-page padding class="page-shell dashboard-page">
    <section class="mobile-shift-overview lt-sm">
      <div class="mobile-shift-overview__context">
        <div class="mobile-shift-overview__workplace">
          <span>{{ todayLabel }}</span>
          <strong>{{ app.activeProfile.workplaceName }}</strong>
        </div>
        <q-btn
          flat
          no-caps
          class="mobile-shift-overview__shift"
          :aria-label="$t('dashboard.changeShift')"
        >
          <span>
            <small>{{ $t('dashboard.myShift') }}</small>
            <strong>{{ displayedShiftName }}</strong>
          </span>
          <q-icon name="expand_more" />
          <q-menu anchor="bottom right" self="top right">
            <q-list class="sidebar-shift-menu">
              <q-item
                v-for="option in shiftOptions"
                :key="option.value"
                v-close-popup
                clickable
                :active="option.value === currentScheduleShiftCode"
                active-class="sidebar-shift-menu__active"
                @click="app.setCurrentShift(option.value)"
              >
                <q-item-section>{{ option.label }}</q-item-section>
                <q-item-section v-if="option.value === currentScheduleShiftCode" side>
                  <q-icon name="check" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <div v-if="activeEvent" class="mobile-next-event">
        <div class="mobile-next-event__icon">
          <q-icon :name="activeEvent.icon" />
        </div>
        <div class="mobile-next-event__body">
          <span>{{ $t('dashboard.nextEvent') }}</span>
          <strong>{{ activeEvent.label }}</strong>
          <div class="mobile-next-event__countdown">
            {{ activeEvent.countdown.main }}
            <Transition name="second-tick" mode="out-in">
              <small :key="activeEvent.countdown.seconds">
                {{ activeEvent.countdown.seconds }}s
              </small>
            </Transition>
          </div>
        </div>
        <div class="mobile-next-event__time">{{ activeEvent.time }}</div>
      </div>
    </section>

    <section class="day-plan">
      <div class="day-plan__heading">
        <div>
          <h2>{{ $t('dashboard.title') }}</h2>
          <p>{{ $t('dashboard.subtitle') }}</p>
        </div>
      </div>

      <div class="event-list">
        <div
          v-for="(item, index) in countdowns"
          :key="item.label"
          class="event-row"
          :class="{
            'event-row--active': index === activeEventIndex,
            'event-row--past': item.target.getTime() <= now.getTime(),
          }"
        >
          <div class="event-row__marker">
            <q-icon :name="item.icon" class="design-icon" />
          </div>
          <div class="event-row__content">
            <div class="event-row__label">
              {{ item.label }}
              <span class="event-row__status lt-sm">
                {{
                  item.target.getTime() <= now.getTime()
                    ? $t('dashboard.passed')
                    : index === activeEventIndex
                      ? $t('dashboard.next')
                      : ''
                }}
              </span>
            </div>
            <div class="event-row__countdown">
              <span>{{ item.countdown.main }}</span>
              <span v-if="index === activeEventIndex" class="event-row__seconds-wrap">
                <Transition name="second-tick" mode="out-in">
                  <span :key="item.countdown.seconds" class="event-row__seconds">
                    {{ item.countdown.seconds }}s
                  </span>
                </Transition>
              </span>
            </div>
          </div>
          <div class="event-row__time">{{ item.time }}</div>
        </div>
      </div>
    </section>

    <div class="row q-col-gutter-md dashboard-secondary">
      <div class="col-12 col-md-7">
        <q-card flat bordered>
          <q-card-section>
            <div class="section-title">{{ $t('dashboard.sleepPlan') }}</div>
            <div class="supporting-text q-mt-xs">{{ $t('dashboard.sleepHint') }}</div>
          </q-card-section>
          <q-list separator>
            <q-item v-for="option in sleepOptions" :key="option.hours">
              <q-item-section avatar
                ><q-icon name="bedtime" color="deep-purple-5" class="design-icon"
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
            <q-btn
              unelevated
              color="primary"
              class="app-action-button"
              :label="$t('common.openCalendar')"
              to="/calendar"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
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
  shiftCodeForDate,
  shiftDateTime,
  shiftEndDateTime,
} from 'src/core/schedule';

const app = useAppStore();
const { t, locale } = useI18n();
const now = ref(new Date());
const timer = window.setInterval(() => (now.value = new Date()), 1_000);
onBeforeUnmount(() => window.clearInterval(timer));

const currentShift = computed(() => currentWorkingShift(now.value, app.pattern, app.shifts));
const nextShift = computed(() =>
  currentShift.value ? null : nextWorkingShift(now.value, app.pattern, app.shifts),
);
const displayedShift = computed(() => currentShift.value ?? nextShift.value);
const currentScheduleShiftCode = computed(() => shiftCodeForDate(now.value, app.pattern));
const shiftOptions = computed(() =>
  app.shifts.map((shift) => ({
    label: shift.nameKey ? t(shift.nameKey) : shift.name,
    value: shift.id,
  })),
);
const displayedShiftName = computed(() => {
  const shift = displayedShift.value?.shift;
  return shift ? (shift.nameKey ? t(shift.nameKey) : shift.name) : t('shifts.off');
});
const todayLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }).format(now.value),
);
const shiftStart = computed(() =>
  displayedShift.value
    ? shiftDateTime(displayedShift.value.date, displayedShift.value.shift.startTime)
    : now.value,
);
const firstBreakTime = computed(() =>
  addMinutes(shiftStart.value, FIRST_BREAK_AFTER_SHIFT_START_MINUTES),
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
  if (!displayedShift.value) return now.value;
  if (app.activeProfile.transport.mode === 'bus' && selectedStop.value) {
    const busTime = selectedStop.value.times[displayedShift.value.shift.id];
    if (busTime) return shiftDateTime(displayedShift.value.date, busTime);
  }
  return shiftStart.value;
});
const alarmTime = computed(() =>
  displayedShift.value
    ? addMinutes(
        referenceTime.value,
        -app.activeProfile.transport.alarmBeforeReferenceMinutes,
      )
    : now.value,
);
const leaveHome = computed(() =>
  displayedShift.value
    ? addMinutes(
        referenceTime.value,
        -app.activeProfile.transport.leaveBeforeReferenceMinutes,
      )
    : now.value,
);
const time = (date: Date) =>
  new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }).format(date);
const countdownWithSeconds = (target: Date) => {
  const totalSeconds = Math.max(0, Math.floor((target.getTime() - now.value.getTime()) / 1_000));
  return {
    main: formatCountdown(target, now.value),
    seconds: String(totalSeconds % 60).padStart(2, '0'),
  };
};
const readableTextColor = (color: string) => {
  const hex = color.replace('#', '');
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;
  return luminance > 150 ? '#17242a' : '#ffffff';
};
const countdowns = computed(() =>
  [
    {
      icon: 'alarm',
      label: t('dashboard.untilWake'),
      countdown: countdownWithSeconds(alarmTime.value),
      time: time(alarmTime.value),
      kind: 'wake',
      target: alarmTime.value,
    },
    ...(app.activeProfile.transport.leaveReminderEnabled
      ? [
          {
            icon: 'directions_walk',
            label: t('dashboard.untilLeave'),
            countdown: countdownWithSeconds(leaveHome.value),
            time: time(leaveHome.value),
            kind: 'leave',
            target: leaveHome.value,
          },
        ]
      : []),
    {
      icon: app.activeProfile.transport.mode === 'bus' ? 'directions_bus' : 'directions_car',
      label: t('dashboard.untilTransport'),
      countdown: countdownWithSeconds(referenceTime.value),
      time: time(referenceTime.value),
      kind: 'transport',
      target: referenceTime.value,
    },
    {
      icon: 'schedule',
      label: t('dashboard.untilShift'),
      countdown: countdownWithSeconds(shiftStart.value),
      time: time(shiftStart.value),
      kind: 'shift',
      target: shiftStart.value,
    },
    {
      icon: 'free_breakfast',
      label: t('dashboard.untilFirstBreak'),
      countdown: countdownWithSeconds(firstBreakTime.value),
      time: time(firstBreakTime.value),
      kind: 'break',
      target: firstBreakTime.value,
    },
    {
      icon: 'event_available',
      label: t('dashboard.untilShiftEnd'),
      countdown: countdownWithSeconds(heroTarget.value),
      time: time(heroTarget.value),
      kind: 'shift-end',
      target: heroTarget.value,
    },
  ],
);
const activeEventIndex = computed(() =>
  countdowns.value.findIndex((item) => item.target.getTime() > now.value.getTime()),
);
const activeEvent = computed(() =>
  activeEventIndex.value >= 0 ? countdowns.value[activeEventIndex.value] : null,
);
const sleepOptions = computed(() =>
  [app.data.settings.sleepHours, 7, 6]
    .filter((hours, index, values) => values.indexOf(hours) === index)
    .map((hours) => ({ hours, time: time(addMinutes(alarmTime.value, -hours * 60)) })),
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
