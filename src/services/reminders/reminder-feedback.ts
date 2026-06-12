import { Dialog, Notify } from 'quasar';

export type ReminderKind = 'alarm' | 'notification';

interface ReminderFeedback {
  body: string;
  id: string;
  kind: ReminderKind;
  stopLabel?: string;
}

let audioContext: AudioContext | null = null;
let alarmTimer: number | null = null;
let alarmDialog: ReturnType<typeof Dialog.create> | null = null;

export async function unlockReminderAudio(): Promise<boolean> {
  audioContext ??= new AudioContext();
  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
    } catch {
      return false;
    }
  }
  return audioContext.state === 'running';
}

async function playFrogChirp() {
  if (!(await unlockReminderAudio()) || !audioContext) return;

  const now = audioContext.currentTime;
  const gain = audioContext.createGain();
  const oscillator = audioContext.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(520, now);
  oscillator.frequency.exponentialRampToValueAtTime(240, now + 0.08);
  oscillator.frequency.exponentialRampToValueAtTime(430, now + 0.16);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.16, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.21);
}

function playAlarmSequence() {
  for (let index = 0; index < 3; index += 1) {
    window.setTimeout(() => void playFrogChirp(), index * 650);
  }
}

function stopAlarmSound() {
  if (alarmTimer === null) return;
  window.clearInterval(alarmTimer);
  alarmTimer = null;
}

async function playReminderSound(kind: ReminderKind) {
  if (kind === 'notification') {
    await playFrogChirp();
    return;
  }

  stopAlarmSound();
  playAlarmSequence();
  alarmTimer = window.setInterval(playAlarmSequence, 2_400);
}

export async function requestReminderPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;

  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export async function showReminderFeedback(reminder: ReminderFeedback) {
  await playReminderSound(reminder.kind);

  if (reminder.kind === 'alarm') {
    alarmDialog?.hide();
    alarmDialog = Dialog.create({
      title: 'My Shift',
      message: reminder.body,
      persistent: true,
      ok: {
        color: 'negative',
        icon: 'alarm_off',
        label: reminder.stopLabel ?? 'Stop alarm',
      },
    }).onOk(() => {
      stopAlarmSound();
      alarmDialog = null;
    });
  } else {
    Notify.create({
      message: reminder.body,
      caption: 'My Shift',
      icon: 'notifications_active',
      position: 'bottom-left',
      timeout: 5_000,
      classes: 'shift-notification shift-notification--reminder',
    });
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    const options: NotificationOptions = {
      body: reminder.body,
      icon: '/icons/my-shift-icon-v2-192.png',
      badge: '/icons/favicon-96x96.png',
      tag: reminder.id,
    };
    const registration = await navigator.serviceWorker?.ready.catch(() => null);
    if (registration) {
      await registration.showNotification('My Shift', options);
    } else {
      new Notification('My Shift', options);
    }
  }
}
