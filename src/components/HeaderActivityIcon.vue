<template>
  <div
    class="header-activity"
    role="group"
    aria-label="Варианты анимаций состояния смены"
  >
    <div
      v-for="(item, key) in activities"
      :key="key"
      class="header-activity__item"
      :class="{
        'header-activity__item--active': key === displayedActivity,
        'header-activity__item--framed': true,
      }"
    >
      <img
        v-if="key === 'waiting'"
        class="header-activity__icon header-activity__icon--waiting"
        :src="item.src"
        :alt="item.label"
        :title="item.label"
      />
      <component
        v-else
        :is="'lord-icon'"
        class="header-activity__icon"
        :class="{
          'header-activity__icon--sleep': key === 'sleep',
          'header-activity__icon--rigged': key === 'rigged',
        }"
        :src="item.src"
        :aria-label="item.label"
        :title="item.label"
        trigger="loop"
        stroke="bold"
      />
      <span v-if="key === 'rigged'" class="header-activity__ball" aria-hidden="true" />
      <span v-if="key === 'sleep'" class="header-activity__sleep-mark" aria-hidden="true">
        Z
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { defineElement } from '@lordicon/element';

type HeaderActivity = 'sleep' | 'leave' | 'work';
type DisplayedActivity = 'sleep' | 'leave' | 'waiting' | 'rigged';

const props = defineProps<{ activity: HeaderActivity }>();

if (!customElements.get('lord-icon')) defineElement();

const activities: Record<DisplayedActivity, { label: string; src: string }> = {
  sleep: {
    label: 'Смена закончилась — время отдохнуть',
    src: '/icon-preview/free-sleep.json',
  },
  leave: {
    label: 'Котик идёт на работу',
    src: '/icon-preview/free-door.json',
  },
  waiting: {
    label: 'Котик лежит и играет с мячиком — рабочий день',
    src: '/icon-preview/free-waiting.gif',
  },
  rigged: {
    label: 'Настраиваемый котик из идущего кота — тест игры с мячиком',
    src: '/icon-preview/free-door.json',
  },
};

const displayedActivity = computed<DisplayedActivity>(() => {
  if (props.activity === 'sleep') return 'sleep';
  if (props.activity === 'leave') return 'leave';
  return 'waiting';
});
</script>

<style scoped>
.header-activity {
  display: flex;
  width: 220px;
  height: 55px;
  flex: 0 0 220px;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
  overflow: hidden;
}

.header-activity__item {
  position: relative;
  width: 52px;
  height: 52px;
  opacity: 0.72;
  overflow: hidden;
}

.header-activity__item--active {
  opacity: 1;
}

.header-activity__item--framed {
  border: 1px solid rgb(31 57 76 / 14%);
  border-radius: 50%;
  background: #fff;
  opacity: 1;
  box-shadow:
    0 2px 5px rgb(7 24 36 / 24%),
    inset 0 0 0 1px rgb(255 255 255 / 80%);
}

.header-activity__icon {
  display: block;
  width: 100%;
  height: 100%;
}

.header-activity__icon--sleep {
  transform: scale(1.35);
}

.header-activity__icon--waiting {
  object-fit: contain;
  transform: scale(1.28);
}

.header-activity__icon--rigged {
  transform: translate(-3px, 3px) scale(1.08);
}

.header-activity__ball {
  position: absolute;
  right: 2px;
  bottom: 10px;
  width: 9px;
  height: 9px;
  border: 1px solid rgb(76 6 25 / 82%);
  border-radius: 50%;
  background: #750826;
  box-shadow: inset -2px -2px 0 rgb(65 4 22 / 32%);
  animation: rigged-ball-play 1.15s ease-in-out infinite;
}

@keyframes rigged-ball-play {
  0%,
  100% {
    transform: translate(-7px, 1px) rotate(0deg);
  }

  42% {
    transform: translate(1px, -2px) rotate(125deg);
  }

  68% {
    transform: translate(-2px, 0) rotate(205deg);
  }
}

.header-activity__sleep-mark {
  position: absolute;
  top: 2px;
  left: 15px;
  color: #3448c5;
  font-size: 17px;
  font-weight: 900;
  line-height: 1;
  -webkit-text-stroke: 0.6px #fff;
  text-shadow:
    0 1px 1px rgb(255 255 255 / 100%),
    0 0 2px rgb(255 255 255 / 95%);
  transform-origin: 50% 100%;
  animation: sleep-mark-rise 2.2s ease-in-out infinite;
}

@keyframes sleep-mark-rise {
  0% {
    transform: translate(0, 8px) scale(0.38) rotate(-12deg);
    opacity: 0;
  }

  12% {
    opacity: 0.95;
  }

  38% {
    transform: translate(6px, 3px) scale(0.72) rotate(-5deg);
    opacity: 1;
  }

  72% {
    transform: translate(14px, -5px) scale(1.12) rotate(1deg);
    opacity: 1;
  }

  100% {
    transform: translate(21px, -11px) scale(1.48) rotate(7deg);
    opacity: 0;
  }
}

@media (max-width: 599px) {
  .header-activity {
    width: 176px;
    height: 50px;
    flex-basis: 176px;
  }

  .header-activity__item {
    width: 42px;
    height: 42px;
  }

  .header-activity__sleep-mark {
    top: 1px;
    left: 12px;
    font-size: 15px;
  }
}
</style>
