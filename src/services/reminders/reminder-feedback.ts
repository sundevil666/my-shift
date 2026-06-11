import { Notify } from 'quasar';

export type ReminderKind = 'alarm' | 'notification';

interface ReminderFeedback {
  body: string;
  id: string;
  kind: ReminderKind;
}

let audioContext: AudioContext | null = null;

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

function playReminderSound(kind: ReminderKind) {
  const repeats = kind === 'alarm' ? 3 : 1;
  for (let index = 0; index < repeats; index += 1) {
    window.setTimeout(playFrogChirp, index * 650);
  }
}

export function showReminderFeedback(reminder: ReminderFeedback) {
  playReminderSound(reminder.kind);
  Notify.create({
    message: reminder.body,
    caption: 'My Shift',
    icon: reminder.kind === 'alarm' ? 'alarm' : 'notifications_active',
    position: reminder.kind === 'alarm' ? 'top-right' : 'bottom-left',
    timeout: 5_000,
    classes:
      reminder.kind === 'alarm'
        ? 'shift-notification shift-notification--alarm'
        : 'shift-notification shift-notification--reminder',
  });

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('My Shift', {
      body: reminder.body,
      icon: '/icons/favicon.svg',
      tag: reminder.id,
    });
  }
}
