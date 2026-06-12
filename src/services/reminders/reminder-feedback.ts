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

export function unlockReminderAudio() {
  audioContext ??= new AudioContext();
  if (audioContext.state === 'suspended') void audioContext.resume();
}

function playFrogChirp() {
  unlockReminderAudio();
  if (!audioContext || audioContext.state !== 'running') return;

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
    window.setTimeout(playFrogChirp, index * 650);
  }
}

function stopAlarmSound() {
  if (alarmTimer === null) return;
  window.clearInterval(alarmTimer);
  alarmTimer = null;
}

function playReminderSound(kind: ReminderKind) {
  if (kind === 'notification') {
    playFrogChirp();
    return;
  }

  stopAlarmSound();
  playAlarmSequence();
  alarmTimer = window.setInterval(playAlarmSequence, 2_400);
}

export function showReminderFeedback(reminder: ReminderFeedback) {
  playReminderSound(reminder.kind);

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
    new Notification('My Shift', {
      body: reminder.body,
      icon: '/icons/favicon.svg',
      tag: reminder.id,
    });
  }
}
