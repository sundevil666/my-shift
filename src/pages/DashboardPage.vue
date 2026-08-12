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
            <Transition v-if="activeEvent.countdown.showSeconds" name="second-tick" mode="out-in">
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
        <q-btn
          outline
          color="primary"
          icon="edit_calendar"
          :label="$t('dashboard.changeOnlyThisWeek')"
          @click="openWeekEditor"
        />
      </div>

      <div v-if="currentWeekOverride" class="week-override-notice">
        <q-icon name="edit_calendar" />
        <div>
          <strong>{{ $t('dashboard.weekChangedManually') }}</strong>
          <span>
            {{
              $t('dashboard.scheduledAndActual', {
                scheduled: scheduledWeekShiftName,
                actual: currentWeekShiftName,
              })
            }}
          </span>
        </div>
        <q-btn
          flat
          color="negative"
          :label="$t('dashboard.cancelWeekChange')"
          @click="cancelWeekOverride"
        />
      </div>

      <div class="event-list">
        <div
          v-for="(item, index) in countdowns"
          :key="item.label"
          class="event-row"
          :class="{
            'event-row--active': index === activeEventIndex,
            'event-row--past': item.target.getTime() <= now.getTime(),
            [`event-row--${item.type}`]: true,
          }"
        >
          <div class="event-row__marker">
            <q-icon :name="item.icon" class="design-icon" />
          </div>
          <div class="event-row__content">
            <div class="event-row__label">
              {{ item.label }}
              <span class="event-row__priority">
                {{ $t(`dashboard.timelineType.${item.type}`) }}
              </span>
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
              <span
                v-if="index === activeEventIndex && item.countdown.showSeconds"
                class="event-row__seconds-wrap"
              >
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
                  class="schedule-preview-badge"
                  :class="day.overrideType ? `override-${day.overrideType}` : ''"
                  :style="{ background: day.color, color: readableTextColor(day.color) }"
                >
                  <q-icon v-if="day.overrideIcon" :name="day.overrideIcon" />
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

    <q-dialog v-model="weekEditorOpen">
      <q-card class="calendar-editor">
        <q-card-section class="calendar-editor__header">
          <div>
            <div class="calendar-editor__eyebrow">
              {{ $t('dashboard.changeOnlyThisWeek') }}
            </div>
            <div class="calendar-editor__date">{{ currentWeekLabel }}</div>
          </div>
          <q-btn v-close-popup flat round dense icon="close" :aria-label="$t('common.cancel')" />
        </q-card-section>
        <q-card-section class="calendar-editor__body">
          <div class="calendar-editor__schedule">
            <span>{{ $t('dashboard.scheduledShift') }}</span>
            <strong>{{ scheduledWeekShiftName }}</strong>
          </div>
          <q-select
            v-model="weekShiftId"
            outlined
            emit-value
            map-options
            :options="shiftOptions"
            :label="$t('dashboard.actualShift')"
          />
          <div class="supporting-text">{{ $t('dashboard.weekChangeHint') }}</div>
        </q-card-section>
        <q-card-actions class="calendar-editor__actions">
          <q-btn
            v-if="currentWeekOverride"
            flat
            color="negative"
            :label="$t('dashboard.cancelWeekChange')"
            @click="cancelWeekOverride"
          />
          <q-space />
          <q-btn v-close-popup flat :label="$t('common.cancel')" />
          <q-btn
            unelevated
            color="primary"
            :label="$t('dashboard.applyWeekChange')"
            :disable="!weekShiftId"
            @click="saveWeekOverride"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useAppStore } from 'stores/app-store';
import { buildWorkDayPlan } from 'src/core/day-plan';
import {
  addMinutes,
  calendarOverridesInRange,
  dateKey,
  currentWorkingShift,
  FIRST_BREAK_AFTER_SHIFT_START_MINUTES,
  formatCountdown,
  nextWorkingShift,
  resolvedShiftCodeForDate,
  shiftEndDateTime,
  shiftCodeForDate,
  weekDateRange,
} from 'src/core/schedule';
import { overrideColors } from 'src/core/calendar-overrides';

const app = useAppStore();
const { t, locale } = useI18n();
const $q = useQuasar();
const now = ref(new Date());
const weekEditorOpen = ref(false);
const weekShiftId = ref<string | null>(null);
const timer = window.setInterval(() => (now.value = new Date()), 1_000);
onBeforeUnmount(() => window.clearInterval(timer));

const currentShift = computed(() =>
  currentWorkingShift(now.value, app.pattern, app.shifts, app.activeProfile.calendarOverrides),
);
const nextShift = computed(() =>
  currentShift.value
    ? null
    : nextWorkingShift(now.value, app.pattern, app.shifts, app.activeProfile.calendarOverrides),
);
const displayedShift = computed(() => currentShift.value ?? nextShift.value);
const displayedPlan = computed(() =>
  displayedShift.value
    ? buildWorkDayPlan({
        date: displayedShift.value.date,
        pattern: app.pattern,
        shifts: app.shifts,
        overrides: app.activeProfile.calendarOverrides,
        transport: app.activeProfile.transport,
        sleepHours: app.data.settings.sleepHours,
      })
    : null,
);
const currentScheduleShiftCode = computed(() =>
  resolvedShiftCodeForDate(now.value, app.pattern, app.activeProfile.calendarOverrides),
);
const shiftOptions = computed(() =>
  app.shifts.map((shift) => ({
    label: shift.nameKey ? t(shift.nameKey) : shift.name,
    value: shift.id,
  })),
);
const currentWeekRange = computed(() => weekDateRange(now.value));
const currentWeekOverride = computed(() =>
  app.activeProfile.calendarOverrides.find(
    (item) =>
      item.type === 'week-shift' &&
      item.startDate === currentWeekRange.value.startDate &&
      item.endDate === currentWeekRange.value.endDate,
  ),
);
const scheduledWeekShiftCode = computed(() => shiftCodeForDate(now.value, app.pattern));
const shiftName = (code: string | undefined) => {
  const shift = app.shifts.find((item) => item.id === code);
  return shift ? (shift.nameKey ? t(shift.nameKey) : shift.name) : t('shifts.off');
};
const scheduledWeekShiftName = computed(() => shiftName(scheduledWeekShiftCode.value));
const currentWeekShiftName = computed(() => shiftName(currentWeekOverride.value?.shiftId));
const currentWeekLabel = computed(() => {
  const start = new Date(`${currentWeekRange.value.startDate}T12:00:00`);
  const end = new Date(`${currentWeekRange.value.endDate}T12:00:00`);
  const formatter = new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short' });
  return `${formatter.format(start)} – ${formatter.format(end)}`;
});
const displayedShiftName = computed(() => {
  const shift = displayedShift.value?.shift;
  return shift ? (shift.nameKey ? t(shift.nameKey) : shift.name) : t('shifts.off');
});

function commitWeekOverride(overridesToReplace: string[]) {
  if (!weekShiftId.value) return;
  app.replaceCalendarOverrides(
    {
      id: currentWeekOverride.value?.id ?? crypto.randomUUID(),
      type: 'week-shift',
      ...currentWeekRange.value,
      shiftId: weekShiftId.value,
    },
    overridesToReplace,
  );
  weekEditorOpen.value = false;
}

function openWeekEditor() {
  weekShiftId.value =
    currentWeekOverride.value?.shiftId ??
    (scheduledWeekShiftCode.value === 'off' ? app.shifts[0]?.id : scheduledWeekShiftCode.value) ??
    null;
  weekEditorOpen.value = true;
}

function saveWeekOverride() {
  const overlapping = calendarOverridesInRange(
    currentWeekRange.value.startDate,
    currentWeekRange.value.endDate,
    app.activeProfile.calendarOverrides,
  );
  if (!overlapping.length) {
    commitWeekOverride([]);
    return;
  }
  $q.dialog({
    title: t('dashboard.replaceWeekChangeTitle'),
    message: t('dashboard.replaceWeekChangeMessage'),
    cancel: { flat: true, label: t('common.cancel') },
    ok: { color: 'primary', label: t('dashboard.replaceWeekChange') },
    persistent: true,
  }).onOk(() => commitWeekOverride(overlapping.map((item) => item.id)));
}

function cancelWeekOverride() {
  if (currentWeekOverride.value) app.removeCalendarOverride(currentWeekOverride.value.id);
  weekEditorOpen.value = false;
}
const todayLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }).format(now.value),
);
const shiftStart = computed(() => displayedPlan.value?.shiftStart ?? now.value);
const firstBreakTime = computed(
  () =>
    displayedPlan.value?.firstBreak ??
    addMinutes(shiftStart.value, FIRST_BREAK_AFTER_SHIFT_START_MINUTES),
);
const heroTarget = computed(() =>
  currentShift.value
    ? shiftEndDateTime(currentShift.value.date, currentShift.value.shift)
    : (displayedPlan.value?.shiftEnd ?? shiftStart.value),
);
const referenceTime = computed(() => displayedPlan.value?.referenceTime ?? now.value);
const alarmTime = computed(() => displayedPlan.value?.alarmTime ?? now.value);
const leaveHome = computed(() => displayedPlan.value?.leaveHome ?? now.value);
const time = (date: Date) =>
  new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }).format(date);
const countdownWithSeconds = (target: Date) => {
  const totalSeconds = Math.max(0, Math.floor((target.getTime() - now.value.getTime()) / 1_000));
  return {
    main: formatCountdown(target, now.value),
    seconds: String(totalSeconds % 60).padStart(2, '0'),
    showSeconds: totalSeconds < 86_400,
  };
};
const readableTextColor = (color: string) => {
  const hex = color.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(hex)) return '#17242a';
  const luminance = [0, 2, 4]
    .map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index]!, 0);
  const contrastWithWhite = 1.05 / (luminance + 0.05);
  const contrastWithDark = (luminance + 0.05) / 0.064;
  return contrastWithWhite >= contrastWithDark ? '#ffffff' : '#17242a';
};
type TimelineItem = {
  icon: string;
  label: string;
  kind: string;
  type: 'alarm' | 'notification' | 'event';
  target: Date;
};

const timelineItem = (
  item: TimelineItem,
): TimelineItem & { countdown: ReturnType<typeof countdownWithSeconds>; time: string } => ({
  ...item,
  countdown: countdownWithSeconds(item.target),
  time: time(item.target),
});

const countdowns = computed(() => {
  const remindersEnabled = app.activeProfile.reminders.enabled;
  const items: TimelineItem[] = [
    ...(remindersEnabled && app.activeProfile.transport.alarmEnabled
      ? [
          {
            icon: 'alarm',
            label: t('dashboard.wakeAlarm'),
            kind: 'wake',
            type: 'alarm' as const,
            target: alarmTime.value,
          },
        ]
      : []),
    ...(remindersEnabled && app.activeProfile.transport.leaveReminderEnabled
      ? [
          {
            icon: 'notifications_active',
            label: t('dashboard.leaveNotification', {
              minutes: app.activeProfile.transport.leaveBeforeReferenceMinutes,
            }),
            kind: 'leave',
            type: 'notification' as const,
            target: leaveHome.value,
          },
        ]
      : []),
    {
      icon: app.activeProfile.transport.mode === 'bus' ? 'directions_bus' : 'directions_car',
      label:
        app.activeProfile.transport.mode === 'bus'
          ? t('dashboard.transportEventBus')
          : t('dashboard.transportEventCar'),
      kind: 'transport',
      type: 'event',
      target: referenceTime.value,
    },
    ...(remindersEnabled && app.activeProfile.reminders.shiftStartEnabled
      ? [
          {
            icon: 'notifications_active',
            label: t('dashboard.shiftStartNotification', {
              minutes: app.activeProfile.reminders.shiftStartBeforeMinutes,
            }),
            kind: 'shift-reminder',
            type: 'notification' as const,
            target: addMinutes(
              shiftStart.value,
              -app.activeProfile.reminders.shiftStartBeforeMinutes,
            ),
          },
        ]
      : []),
    {
      icon: 'schedule',
      label: t('dashboard.shiftStartEvent'),
      kind: 'shift',
      type: 'event',
      target: shiftStart.value,
    },
    ...(remindersEnabled && app.activeProfile.reminders.firstBreakEnabled
      ? [
          {
            icon: 'notifications_active',
            label: t('dashboard.firstBreakNotification', {
              minutes: app.activeProfile.reminders.firstBreakBeforeMinutes,
            }),
            kind: 'break-reminder',
            type: 'notification' as const,
            target: addMinutes(
              firstBreakTime.value,
              -app.activeProfile.reminders.firstBreakBeforeMinutes,
            ),
          },
        ]
      : []),
    {
      icon: 'free_breakfast',
      label: t('dashboard.firstBreakEvent'),
      kind: 'break',
      type: 'event',
      target: firstBreakTime.value,
    },
    ...(remindersEnabled && app.activeProfile.reminders.shiftEndEnabled
      ? [
          {
            icon: 'notifications_active',
            label: t('dashboard.shiftEndNotification', {
              minutes: app.activeProfile.reminders.shiftEndBeforeMinutes,
            }),
            kind: 'shift-end-reminder',
            type: 'notification' as const,
            target: addMinutes(
              heroTarget.value,
              -app.activeProfile.reminders.shiftEndBeforeMinutes,
            ),
          },
        ]
      : []),
    {
      icon: 'event_available',
      label: t('dashboard.shiftEndEvent'),
      kind: 'shift-end',
      type: 'event',
      target: heroTarget.value,
    },
  ];

  return items
    .sort((left, right) => left.target.getTime() - right.target.getTime())
    .map(timelineItem);
});
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
    const override = app.activeProfile.calendarOverrides.find(
      (item) => item.startDate <= dateKey(date) && item.endDate >= dateKey(date),
    );
    const code = resolvedShiftCodeForDate(date, app.pattern, app.activeProfile.calendarOverrides);
    const shift = app.shifts.find((item) => item.id === code);
    return {
      key: date.toISOString(),
      label: new Intl.DateTimeFormat(locale.value, { weekday: 'short', day: 'numeric' }).format(
        date,
      ),
      name: override
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
          : t('shifts.off'),
      color: override ? overrideColors[override.type] : (shift?.color ?? '#95a1ad'),
      overrideType: override?.type,
      overrideIcon: override
        ? {
            'day-off': 'weekend',
            vacation: 'beach_access',
            'sick-leave': 'medical_services',
            'extra-shift': 'add_task',
            'week-shift': 'edit_calendar',
          }[override.type]
        : '',
    };
  }),
);
</script>
