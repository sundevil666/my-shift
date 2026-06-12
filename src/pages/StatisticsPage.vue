<template>
  <q-page padding class="page-shell statistics-page">
    <PageHeader
      :eyebrow="$t('nav.statistics')"
      :title="$t('statistics.title')"
      :subtitle="$t('statistics.subtitle')"
    />

    <q-card flat bordered class="statistics-setup">
      <q-card-section class="statistics-setup__tenure">
        <div class="statistics-setup__icon"><q-icon name="workspace_premium" /></div>
        <div>
          <span>{{ $t('statistics.employmentDuration') }}</span>
          <strong>{{ tenureLabel }}</strong>
          <small>{{ $t('statistics.sinceDate', { date: formatDate(profile.employmentStartDate) }) }}</small>
        </div>
      </q-card-section>
      <q-card-section class="statistics-setup__dates">
        <q-input
          v-model="profile.employmentStartDate"
          outlined dense type="date"
          :max="todayKey"
          :label="$t('statistics.employmentStart')"
          @update:model-value="keepDatesValid"
        />
        <q-input
          v-model="profile.trackingStartDate"
          outlined dense type="date"
          :min="profile.employmentStartDate"
          :max="todayKey"
          :label="$t('statistics.trackingStart')"
        />
      </q-card-section>
      <div class="statistics-setup__note">
        <q-icon name="lock" />
        {{ $t('statistics.localNote') }}
      </div>
    </q-card>

    <q-btn-toggle
      v-model="period"
      class="statistics-period"
      spread no-caps unelevated
      toggle-color="primary"
      :options="periodOptions"
    />

    <div class="statistics-range">
      {{ $t('statistics.accountedFrom', { date: formatDate(stats.from) }) }}
      <span>·</span>
      {{ formatUnit(daysAccounted, 'day') }}
    </div>

    <div class="statistics-summary">
      <article v-for="item in summaryCards" :key="item.label" class="statistics-card">
        <q-icon :name="item.icon" :style="{ color: item.color }" />
        <div>
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </div>
      </article>
    </div>

    <div class="statistics-details">
      <q-card flat bordered class="statistics-panel">
        <q-card-section>
          <div class="section-title">{{ $t('statistics.shiftBreakdown') }}</div>
          <div class="statistics-shifts">
            <div v-for="shift in shiftBreakdown" :key="shift.id" class="statistics-shift">
              <div class="statistics-shift__heading">
                <span class="statistics-shift__dot" :style="{ background: shift.color }" />
                <strong>{{ shift.name }}</strong>
                <span>{{ shift.count }}</span>
              </div>
              <q-linear-progress rounded size="9px" :value="shift.ratio" :color="shift.quasarColor" track-color="grey-3" />
              <small>{{ $t('statistics.hoursCount', { hours: formatNumber(shift.hours) }) }}</small>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="statistics-panel">
        <q-card-section>
          <div class="section-title">{{ $t('statistics.absences') }}</div>
          <div class="statistics-absences">
            <div v-for="item in absenceItems" :key="item.label">
              <span><q-icon :name="item.icon" :color="item.color" />{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
          <div class="statistics-hint">{{ $t('statistics.markedOnlyHint') }}</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from 'components/PageHeader.vue';
import { calculateWorkStatistics, daysBetween, employmentDuration } from 'src/core/statistics';
import { colorForShift } from 'src/core/shift-colors';
import { dateKey } from 'src/core/schedule';
import type { StatisticsPeriod } from 'src/core/statistics';
import { useAppStore } from 'stores/app-store';

const app = useAppStore();
const { t, locale } = useI18n();
const profile = computed(() => app.activeProfile).value;
const period = ref<StatisticsPeriod>('month');
const todayKey = dateKey(new Date());
const stats = computed(() => calculateWorkStatistics(profile, period.value));
const tenure = computed(() => employmentDuration(profile.employmentStartDate));
const daysAccounted = computed(() => daysBetween(stats.value.from, stats.value.to));
const periodOptions = computed(() => [
  { label: t('statistics.thisMonth'), value: 'month' },
  { label: t('statistics.thisYear'), value: 'year' },
  { label: t('statistics.allTime'), value: 'all' },
]);
const tenureLabel = computed(() => {
  const parts = [
    tenure.value.years ? formatUnit(tenure.value.years, 'year') : '',
    tenure.value.months ? formatUnit(tenure.value.months, 'month') : '',
    !tenure.value.years && !tenure.value.months
      ? formatUnit(tenure.value.days, 'day')
      : '',
  ].filter(Boolean);
  return parts.join(' ');
});
const summaryCards = computed(() => [
  { icon: 'work_history', color: '#2563eb', value: stats.value.totalShifts, label: t('statistics.workedShifts') },
  { icon: 'schedule', color: '#7c3aed', value: formatNumber(stats.value.totalHours), label: t('statistics.workedHours') },
  { icon: 'weekend', color: '#64748b', value: stats.value.scheduledDaysOff + stats.value.overrides['day-off'], label: t('statistics.daysOff') },
  { icon: 'add_task', color: '#059669', value: stats.value.overrides['extra-shift'], label: t('statistics.extraShifts') },
]);
const shiftBreakdown = computed(() => {
  const max = Math.max(1, ...stats.value.shifts.map((item) => item.count));
  return stats.value.shifts.map((item, index) => {
    const shift = profile.shifts.find((candidate) => candidate.id === item.id);
    return {
      ...item,
      name: shift ? (shift.nameKey ? t(shift.nameKey) : shift.name) : item.id,
      color: colorForShift(item.id),
      quasarColor: ['blue-6', 'amber-7', 'deep-purple-5'][index] ?? 'primary',
      ratio: item.count / max,
    };
  });
});
const absenceItems = computed(() => [
  { icon: 'medical_services', color: 'negative', label: t('statistics.sickLeave'), value: stats.value.overrides['sick-leave'] },
  { icon: 'beach_access', color: 'orange', label: t('statistics.vacation'), value: stats.value.overrides.vacation },
  { icon: 'event_busy', color: 'blue-grey', label: t('statistics.markedDaysOff'), value: stats.value.overrides['day-off'] },
]);

function keepDatesValid() {
  if (profile.trackingStartDate < profile.employmentStartDate) {
    profile.trackingStartDate = profile.employmentStartDate;
  }
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(`${value}T12:00:00`));
}
function formatNumber(value: number) {
  return new Intl.NumberFormat(locale.value, { maximumFractionDigits: 1 }).format(value);
}
function formatUnit(value: number, unit: 'day' | 'month' | 'year') {
  return new Intl.NumberFormat(locale.value, {
    style: 'unit',
    unit,
    unitDisplay: 'long',
  }).format(value);
}
</script>

<style scoped lang="scss">
.statistics-page { max-width: 1180px; margin: 0 auto; }
.statistics-setup { display: grid; grid-template-columns: 1fr 1.35fr; overflow: hidden; }
.statistics-setup__tenure { display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, color-mix(in srgb, var(--q-primary) 14%, transparent), transparent); }
.statistics-setup__icon { display: grid; width: 52px; height: 52px; flex: 0 0 52px; place-items: center; border-radius: 16px; color: white; background: var(--q-primary); font-size: 1.7rem; }
.statistics-setup__tenure span, .statistics-setup__tenure small { display: block; color: var(--app-muted); }
.statistics-setup__tenure strong { display: block; margin: 3px 0; font-size: 1.45rem; }
.statistics-setup__dates { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-items: center; }
.statistics-setup__note { grid-column: 1 / -1; display: flex; gap: 7px; align-items: center; padding: 9px 16px; color: var(--app-muted); background: var(--app-surface-soft); font-size: .78rem; }
.statistics-period { width: min(100%, 520px); margin: 18px 0 8px; border: 1px solid var(--app-border); border-radius: 12px; }
.statistics-range { color: var(--app-muted); font-size: .82rem; }
.statistics-range span { padding: 0 5px; }
.statistics-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 14px 0; }
.statistics-card { display: flex; align-items: center; gap: 13px; min-height: 100px; padding: 17px; border: 1px solid var(--app-border); border-radius: 18px; background: var(--app-surface); }
.statistics-card > .q-icon { font-size: 1.8rem; }
.statistics-card strong, .statistics-card span { display: block; }
.statistics-card strong { font-size: 1.7rem; line-height: 1; }
.statistics-card span { margin-top: 6px; color: var(--app-muted); font-size: .82rem; }
.statistics-details { display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; }
.statistics-shifts { display: grid; gap: 17px; margin-top: 16px; }
.statistics-shift__heading { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; }
.statistics-shift__heading strong { flex: 1; }
.statistics-shift__dot { width: 10px; height: 10px; border-radius: 50%; }
.statistics-shift small { display: block; margin-top: 5px; color: var(--app-muted); }
.statistics-absences { display: grid; gap: 8px; margin-top: 14px; }
.statistics-absences > div { display: flex; align-items: center; justify-content: space-between; padding: 13px; border-radius: 13px; background: var(--app-surface-soft); }
.statistics-absences span { display: flex; align-items: center; gap: 9px; }
.statistics-absences strong { font-size: 1.25rem; }
.statistics-hint { margin-top: 12px; color: var(--app-muted); font-size: .78rem; line-height: 1.4; }
@media (max-width: 800px) {
  .statistics-setup, .statistics-details { grid-template-columns: 1fr; }
  .statistics-summary { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 599px) {
  .statistics-page { padding: 12px; }
  .statistics-setup__tenure { padding: 16px 13px; }
  .statistics-setup__dates { grid-template-columns: 1fr; padding: 12px 13px; }
  .statistics-period { margin-top: 14px; }
  .statistics-period :deep(.q-btn) { min-height: 46px; padding: 6px; font-size: .78rem; }
  .statistics-summary { gap: 8px; margin-top: 12px; }
  .statistics-card { min-height: 88px; padding: 13px 10px; gap: 9px; }
  .statistics-card > .q-icon { font-size: 1.45rem; }
  .statistics-card strong { font-size: 1.45rem; }
  .statistics-card span { font-size: .75rem; }
}
</style>
