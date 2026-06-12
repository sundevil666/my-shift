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
          :class="item.overrideType ? `override-${item.overrideType}` : ''"
          :style="{ '--shift-color': item.color, '--shift-text': item.textColor }"
        >
          <span class="calendar-legend__swatch">
            <q-icon v-if="item.icon" :name="item.icon" />
          </span>
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
            :class="{
              today: day.today,
              past: day.past,
              overridden: day.override,
              [`override-${day.override?.type}`]: day.override,
            }"
            :style="{ '--shift-color': day.color, '--shift-text': day.textColor }"
            role="button"
            tabindex="0"
            :aria-label="day.ariaLabel"
            @click="openEditor(day.key)"
            @keydown.enter.prevent="openEditor(day.key)"
            @keydown.space.prevent="openEditor(day.key)"
          >
            <div class="calendar-day__number">{{ day.number }}</div>
            <q-icon v-if="day.override" :name="day.icon" class="calendar-day__override-icon" />
          </div>
        </div>
      </q-card>
    </div>

    <q-dialog v-model="editorOpen">
      <q-card class="calendar-editor">
        <q-card-section class="calendar-editor__header">
          <div>
            <div class="calendar-editor__eyebrow">{{ $t('calendar.editDay') }}</div>
            <div class="calendar-editor__date">{{ selectedDateLabel }}</div>
          </div>
          <q-btn v-close-popup flat round dense icon="close" :aria-label="$t('common.cancel')" />
        </q-card-section>

        <q-card-section class="calendar-editor__body">
          <div class="calendar-editor__schedule">
            <span>{{ $t('calendar.scheduledShift') }}</span>
            <strong>{{ scheduledShiftName }}</strong>
          </div>
          <q-option-group
            v-model="editorType"
            :options="overrideOptions"
            type="radio"
            color="primary"
            class="calendar-editor__options"
          />
          <q-select
            v-if="editorType === 'extra-shift'"
            v-model="editorShiftId"
            outlined
            emit-value
            map-options
            :options="shiftOptions"
            :label="$t('calendar.selectShift')"
          />
        </q-card-section>

        <q-card-actions class="calendar-editor__actions">
          <q-btn
            v-if="selectedOverride"
            flat
            color="negative"
            icon="delete_outline"
            :label="$t('calendar.deleteChange')"
            @click="deleteOverride"
          />
          <q-space />
          <q-btn
            flat
            icon="restart_alt"
            :label="$t('calendar.restoreSchedule')"
            @click="restoreSchedule"
          />
          <q-btn
            unelevated
            color="primary"
            :label="$t('calendar.saveChange')"
            :disable="editorType === 'extra-shift' && !editorShiftId"
            @click="saveOverride"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from 'components/PageHeader.vue';
import { useAppStore } from 'stores/app-store';
import {
  calendarOverrideForDate,
  dateKey,
  resolvedShiftCodeForDate,
  shiftCodeForDate,
} from 'src/core/schedule';
import { overrideColors } from 'src/core/calendar-overrides';
import { colorForShift, shiftColors } from 'src/core/shift-colors';
import type { CalendarOverrideType } from 'src/models/app';

const app = useAppStore();
const { t, locale } = useI18n();
const now = new Date();
const dayOffColor = shiftColors.off;
const editorOpen = ref(false);
const selectedDateKey = ref('');
const editorType = ref<CalendarOverrideType>('day-off');
const editorShiftId = ref<string | null>(null);

const overrideIcons: Record<CalendarOverrideType, string> = {
  'day-off': 'weekend',
  vacation: 'beach_access',
  'sick-leave': 'medical_services',
  'extra-shift': 'add_task',
  'week-shift': 'edit_calendar',
};

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
    overrideType: undefined,
    icon: '',
  })),
  {
    id: 'off',
    name: t('shifts.off'),
    time: '',
    color: dayOffColor,
    textColor: textColorFor(dayOffColor),
    overrideType: undefined,
    icon: '',
  },
  ...(['vacation', 'sick-leave', 'extra-shift', 'week-shift'] as CalendarOverrideType[]).map((type) => ({
    id: type,
    name: t(`calendar.types.${type}`),
    time: '',
    color: overrideColors[type],
    textColor: textColorFor(overrideColors[type]),
    overrideType: type,
    icon: overrideIcons[type],
  })),
]);

const selectedDate = computed(() =>
  selectedDateKey.value ? new Date(`${selectedDateKey.value}T12:00:00`) : null,
);
const selectedOverride = computed(() =>
  selectedDate.value
    ? app.activeProfile.calendarOverrides.find(
        (item) =>
          item.type !== 'week-shift' &&
          item.startDate <= selectedDateKey.value &&
          item.endDate >= selectedDateKey.value,
      )
    : undefined,
);
const selectedDateLabel = computed(() =>
  selectedDate.value
    ? new Intl.DateTimeFormat(locale.value, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(selectedDate.value)
    : '',
);
const scheduledShiftName = computed(() => {
  if (!selectedDate.value) return '';
  const code = shiftCodeForDate(selectedDate.value, app.pattern);
  const shift = app.shifts.find((item) => item.id === code);
  return shift ? (shift.nameKey ? t(shift.nameKey) : shift.name) : t('shifts.off');
});
const shiftOptions = computed(() =>
  app.shifts.map((shift) => ({
    label: shift.nameKey ? t(shift.nameKey) : shift.name,
    value: shift.id,
  })),
);
const overrideOptions = computed(() =>
  (['day-off', 'vacation', 'sick-leave', 'extra-shift'] as CalendarOverrideType[]).map(
    (type) => ({
      label: t(`calendar.types.${type}`),
      value: type,
    }),
  ),
);

function openEditor(key: string) {
  selectedDateKey.value = key;
  const existing = app.activeProfile.calendarOverrides.find(
    (item) => item.type !== 'week-shift' && item.startDate <= key && item.endDate >= key,
  );
  editorType.value = existing?.type ?? 'day-off';
  editorShiftId.value = existing?.shiftId ?? app.shifts[0]?.id ?? null;
  editorOpen.value = true;
}

function saveOverride() {
  if (!selectedDateKey.value) return;
  const existing = selectedOverride.value;
  app.saveCalendarOverride({
    id: existing?.id ?? crypto.randomUUID(),
    type: editorType.value,
    startDate: selectedDateKey.value,
    endDate: selectedDateKey.value,
    ...(editorType.value === 'extra-shift' && editorShiftId.value
      ? { shiftId: editorShiftId.value }
      : {}),
  });
  editorOpen.value = false;
}

function deleteOverride() {
  if (selectedOverride.value) app.removeCalendarOverride(selectedOverride.value.id);
  editorOpen.value = false;
}

function restoreSchedule() {
  if (selectedOverride.value) app.removeCalendarOverride(selectedOverride.value.id);
  editorOpen.value = false;
}

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
        const override = calendarOverrideForDate(
          date,
          app.activeProfile.calendarOverrides,
        );
        const code = resolvedShiftCodeForDate(
          date,
          app.pattern,
          app.activeProfile.calendarOverrides,
        );
        const shift = app.shifts.find((item) => item.id === code);
        const color = override ? overrideColors[override.type] : colorForShift(code);
        const name = override
          ? override.type === 'week-shift'
            ? shift
              ? t('calendar.weekShiftWithName', {
                  shift: shift.nameKey ? t(shift.nameKey) : shift.name,
                })
              : t('shifts.off')
            : override.type === 'extra-shift' && shift
            ? t('calendar.extraShiftWithName', {
                shift: shift.nameKey ? t(shift.nameKey) : shift.name,
              })
            : t(`calendar.types.${override.type}`)
          : shift
            ? shift.nameKey
              ? t(shift.nameKey)
              : shift.name
            : t('shifts.off');
        return {
          key: dateKey(date),
          number: index + 1,
          today: dateKey(date) === dateKey(now),
          past:
            date.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(),
          override,
          icon: override ? overrideIcons[override.type] : '',
          color,
          textColor: textColorFor(color),
          ariaLabel: `${new Intl.DateTimeFormat(locale.value, {
            day: 'numeric',
            month: 'long',
          }).format(date)}: ${name}`,
        };
      }),
    };
  }),
);
</script>
