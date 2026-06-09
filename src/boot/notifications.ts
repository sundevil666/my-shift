import { defineBoot } from '#q-app/wrappers';
import { watch } from 'vue';
import { currentWorkingShift, dateKey, shiftDateTime } from 'src/core/schedule';
import { useAppStore } from 'stores/app-store';

const FIRST_BREAK_REMINDER_MINUTES = 130;
const SENT_KEY_PREFIX = 'my-shift:first-break-reminder:';
const notificationBodies = {
  'en-US': 'First break starts in 5 minutes',
  'ru-RU': 'Первый перерыв через 5 минут',
  'uk-UA': 'Перша перерва через 5 хвилин',
  'sk-SK': 'Prvá prestávka sa začne o 5 minút',
} as const;

export default defineBoot(({ store }) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  const app = useAppStore(store);
  let timer: number | null = null;

  const schedule = () => {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }

    if (!app.activeProfile.reminders.enabled || Notification.permission !== 'granted') return;

    const now = new Date();
    const current = currentWorkingShift(now, app.pattern, app.shifts);
    if (!current) return;

    const shiftStart = shiftDateTime(current.date, current.shift.startTime);
    const reminderAt = new Date(
      shiftStart.getTime() + FIRST_BREAK_REMINDER_MINUTES * 60_000,
    );
    const delay = reminderAt.getTime() - now.getTime();
    const sentKey = `${SENT_KEY_PREFIX}${dateKey(current.date)}:${current.shift.id}`;

    if (delay <= 0 || localStorage.getItem(sentKey)) return;

    timer = window.setTimeout(() => {
      new Notification('My Shift', {
        body: notificationBodies[app.data.settings.locale],
        icon: '/icons/favicon-128x128.png',
        tag: sentKey,
      });
      localStorage.setItem(sentKey, '1');
      timer = null;
    }, delay);
  };

  watch(
    () => [
      app.activeProfile.reminders.enabled,
      app.activeProfile.pattern.startDate,
      app.activeProfile.pattern.sequence.join(','),
      app.activeProfile.shifts.map((shift) => `${shift.id}:${shift.startTime}`).join(','),
    ],
    schedule,
    { immediate: true },
  );

  window.addEventListener('focus', schedule);
  document.addEventListener('visibilitychange', schedule);
});
