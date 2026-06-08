<template>
  <q-page padding class="page-shell">
    <PageHeader
      :eyebrow="$t('nav.calendar')"
      :title="$t('calendar.title')"
      :subtitle="$t('calendar.subtitle')"
    />
    <div class="row q-col-gutter-lg">
      <div v-for="month in months" :key="month.key" class="col-12 col-xl-6">
        <q-card flat bordered>
          <q-card-section
            ><div class="section-title text-capitalize">{{ month.label }}</div></q-card-section
          >
          <div class="calendar-grid">
            <div v-for="weekday in weekdays" :key="weekday" class="calendar-weekday">
              {{ weekday }}
            </div>
            <div v-for="blank in month.offset" :key="`blank-${blank}`" />
            <div
              v-for="day in month.days"
              :key="day.key"
              class="calendar-day"
              :class="{ today: day.today }"
            >
              <div class="text-weight-medium">{{ day.number }}</div>
              <span class="shift-dot" :style="{ background: day.color }" />
              <div class="calendar-shift">{{ day.name }}</div>
            </div>
          </div>
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
import { dateKey, shiftCodeForDate } from 'src/core/schedule';

const app = useAppStore();
const { t, locale } = useI18n();
const now = new Date();
const weekdays = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value, { weekday: 'short' });
  return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(2024, 0, index + 1)));
});
const months = computed(() =>
  [0, 1].map((offset) => {
    const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    return {
      key: dateKey(first),
      label: new Intl.DateTimeFormat(locale.value, { month: 'long', year: 'numeric' }).format(
        first,
      ),
      offset: (first.getDay() + 6) % 7,
      days: Array.from({ length: count }, (_, index) => {
        const date = new Date(first.getFullYear(), first.getMonth(), index + 1);
        const code = shiftCodeForDate(date, app.pattern);
        const shift = app.shifts.find((item) => item.id === code);
        return {
          key: dateKey(date),
          number: index + 1,
          today: dateKey(date) === dateKey(now),
          name: shift ? (shift.nameKey ? t(shift.nameKey) : shift.name) : t('shifts.off'),
          color: shift?.color ?? '#95a1ad',
        };
      }),
    };
  }),
);
</script>
