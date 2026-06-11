<template>
  <q-page padding class="page-shell calendar-page">
    <PageHeader
      :eyebrow="$t('nav.calendar')"
      :title="$t('calendar.title')"
      :subtitle="$t('calendar.subtitle')"
    >
      <div class="calendar-legend" :aria-label="$t('calendar.legend')">
        <div
          v-for="item in legendItems"
          :key="item.id"
          class="calendar-legend__item"
          :style="{ '--shift-color': item.color, '--shift-text': item.textColor }"
        >
          <span class="calendar-legend__swatch" />
          <div>
            <div class="calendar-legend__name">{{ item.name }}</div>
            <div v-if="item.time" class="calendar-legend__time">{{ item.time }}</div>
          </div>
        </div>
      </div>
    </PageHeader>
    <div class="calendar-year">
      <q-card v-for="month in months" :key="month.key" flat bordered class="calendar-month">
        <div class="calendar-month__title text-capitalize">{{ month.label }}</div>
        <div class="calendar-grid">
          <div v-for="weekday in weekdays" :key="weekday" class="calendar-weekday">
            {{ weekday }}
          </div>
          <div v-for="blank in month.offset" :key="`blank-${blank}`" />
          <div
            v-for="day in month.days"
            :key="day.key"
            class="calendar-day"
            :class="{ today: day.today, past: day.past }"
            :style="{ '--shift-color': day.color, '--shift-text': day.textColor }"
          >
            <div class="calendar-day__number">{{ day.number }}</div>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from 'components/PageHeader.vue';
import { useAppStore } from 'stores/app-store';
import { dateKey, shiftCodeForDate } from 'src/core/schedule';
import { colorForShift, shiftColors } from 'src/core/shift-colors';

const app = useAppStore();
const { t, locale } = useI18n();
const now = new Date();
const dayOffColor = shiftColors.off;

const textColorFor = (color: string) => {
  const hex = color.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(hex)) return '#17242a';
  const channels = [0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
  const [red = 0, green = 0, blue = 0] = channels;
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;
  return luminance > 155 ? '#17242a' : '#ffffff';
};

const legendItems = computed(() => [
  ...app.shifts.map((shift) => ({
    id: shift.id,
    name: shift.nameKey ? t(shift.nameKey) : shift.name,
    time: `${shift.startTime}–${shift.endTime}`,
    color: colorForShift(shift.id),
    textColor: textColorFor(colorForShift(shift.id)),
  })),
  {
    id: 'off',
    name: t('shifts.off'),
    time: '',
    color: dayOffColor,
    textColor: textColorFor(dayOffColor),
  },
]);

const weekdays = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value, { weekday: 'short' });
  return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(2024, 0, index + 1)));
});
const months = computed(() =>
  Array.from({ length: 12 }, (_, offset) => {
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
        return {
          key: dateKey(date),
          number: index + 1,
          today: dateKey(date) === dateKey(now),
          past:
            date.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(),
          color: colorForShift(code),
          textColor: textColorFor(colorForShift(code)),
        };
      }),
    };
  }),
);
</script>
