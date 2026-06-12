<template>
  <q-page padding class="page-shell tomorrow-page">
    <div class="tomorrow-header">
      <div>
        <div class="tomorrow-header__eyebrow">{{ $t('tomorrow.eyebrow') }}</div>
        <h1>{{ formattedDate }}</h1>
        <p>{{ $t('tomorrow.subtitle') }}</p>
      </div>
      <q-btn
        flat
        no-caps
        icon="space_dashboard"
        :label="$t('tomorrow.openDashboard')"
        to="/"
        class="tomorrow-dashboard-link"
      />
    </div>
    <template v-if="plan">
      <section class="tomorrow-hero" :style="{ '--shift-color': plan.shift.color }">
        <div class="tomorrow-hero__icon"><q-icon name="work_history" /></div>
        <div class="tomorrow-hero__body">
          <span>{{ $t('tomorrow.nextShift') }}</span>
          <h2>{{ shiftName }}</h2>
          <strong>{{ time(plan.shiftStart) }}–{{ time(plan.shiftEnd) }}</strong>
        </div>
      </section>
      <section class="tomorrow-grid">
        <article v-for="item in details" :key="item.label" class="tomorrow-detail">
          <q-icon :name="item.icon" />
          <div>
            <span>{{ item.label }}</span
            ><strong>{{ item.value }}</strong
            ><small v-if="item.note">{{ item.note }}</small>
          </div>
        </article>
      </section>
      <section v-if="nextEvent" class="tomorrow-next">
        <div>
          <span>{{ $t('tomorrow.nextImportant') }}</span
          ><strong>{{ $t(`tomorrow.events.${nextEvent.kind}`) }}</strong>
        </div>
        <div class="tomorrow-next__time">{{ eventDate(nextEvent.target) }}</div>
      </section>
    </template>
    <section v-else class="tomorrow-off">
      <div class="tomorrow-off__icon"><q-icon name="weekend" /></div>
      <h2>{{ $t('tomorrow.dayOffTitle') }}</h2>
      <p>{{ offReason }}</p>
      <q-btn
        unelevated
        color="primary"
        no-caps
        icon="calendar_month"
        :label="$t('common.openCalendar')"
        to="/calendar"
      />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { buildWorkDayPlan, nearestUpcomingEvent } from 'src/core/day-plan';
import { calendarOverrideForDate } from 'src/core/schedule';
import { useAppStore } from 'stores/app-store';

const app = useAppStore();
const { t, locale } = useI18n();
const now = new Date();
const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
const plan = computed(() =>
  buildWorkDayPlan({
    date: tomorrow,
    pattern: app.pattern,
    shifts: app.shifts,
    overrides: app.activeProfile.calendarOverrides,
    transport: app.activeProfile.transport,
    sleepHours: app.data.settings.sleepHours,
  }),
);
const formattedDate = computed(() =>
  new Intl.DateTimeFormat(locale.value, { weekday: 'long', day: 'numeric', month: 'long' }).format(
    tomorrow,
  ),
);
const shiftName = computed(() =>
  plan.value
    ? plan.value.shift.nameKey
      ? t(plan.value.shift.nameKey)
      : plan.value.shift.name
    : '',
);
const time = (date: Date) =>
  new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }).format(date);
const nextEvent = computed(() => (plan.value ? nearestUpcomingEvent(plan.value, now) : null));
const eventDate = (date: Date) =>
  `${date.getDate() === now.getDate() ? t('tomorrow.tonight') : t('tomorrow.tomorrow')}, ${time(date)}`;
const details = computed(() => {
  if (!plan.value) return [];
  const item = plan.value;
  return [
    { icon: 'alarm', label: t('tomorrow.wakeUp'), value: time(item.alarmTime) },
    { icon: 'bedtime', label: t('tomorrow.sleep'), value: time(item.sleepTime) },
    { icon: 'directions_walk', label: t('tomorrow.leaveHome'), value: time(item.leaveHome) },
    {
      icon: item.transportMode === 'bus' ? 'directions_bus' : 'directions_car',
      label: t('tomorrow.transport'),
      value:
        item.transportMode === 'bus'
          ? item.busRouteCode
            ? t('tomorrow.busRoute', { route: item.busRouteCode })
            : t('tomorrow.bus')
          : t('tomorrow.byCar'),
      note:
        item.transportMode === 'bus'
          ? item.busStopName
            ? t('tomorrow.stop', { stop: item.busStopName })
            : t('tomorrow.stopNotSet')
          : t('tomorrow.carTravel', { minutes: item.carTravelMinutes }),
    },
  ];
});
const offReason = computed(() => {
  const override = calendarOverrideForDate(tomorrow, app.activeProfile.calendarOverrides);
  return override
    ? t('tomorrow.dayOffOverride', { reason: t(`calendar.types.${override.type}`) })
    : t('tomorrow.dayOffHint');
});
</script>
