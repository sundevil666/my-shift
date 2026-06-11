<template>
  <div ref="root" class="language-picker" :class="{ 'language-picker--open': isOpen }">
    <div
      class="language-picker__options"
      role="radiogroup"
      :aria-label="t('settings.language')"
      :aria-hidden="!isOpen"
    >
      <button
        v-for="(option, index) in availableLocales"
        :key="option.value"
        type="button"
        class="language-picker__option"
        :style="{ '--option-order': index }"
        role="radio"
        :aria-checked="false"
        :aria-label="option.label"
        :tabindex="isOpen ? 0 : -1"
        @click="changeLocale(option.value)"
      >
        {{ option.short }}
        <q-tooltip>{{ option.label }}</q-tooltip>
      </button>
    </div>
    <button
      type="button"
      class="language-picker__trigger"
      :aria-label="`${t('settings.language')}: ${activeLocale.label}`"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <q-icon name="language" size="18px" />
      <span>{{ activeLocale.short }}</span>
      <q-tooltip>{{ t('settings.language') }}: {{ activeLocale.label }}</q-tooltip>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppStore } from 'stores/app-store';
import type { Locale } from 'src/models/app';

const app = useAppStore();
const { t, locale } = useI18n();
const root = ref<HTMLElement>();
const isOpen = ref(false);
const localeOptions: { label: string; short: string; value: Locale }[] = [
  { label: 'Русский', short: 'RU', value: 'ru-RU' },
  { label: 'Українська', short: 'UA', value: 'uk-UA' },
  { label: 'English', short: 'EN', value: 'en-US' },
  { label: 'Slovenčina', short: 'SK', value: 'sk-SK' },
];

const currentLocale = computed(() => app.data.settings.locale);
const activeLocale = computed(
  () => localeOptions.find((option) => option.value === currentLocale.value) ?? localeOptions[0]!,
);
const availableLocales = computed(() =>
  localeOptions.filter((option) => option.value !== currentLocale.value),
);

function applyLocale(value: Locale) {
  locale.value = value;
  app.setLocale(value);
}

function changeLocale(value: Locale) {
  isOpen.value = false;

  const startViewTransition = (
    document as Document & {
      startViewTransition?: (callback: () => void) => void;
    }
  ).startViewTransition;

  if (startViewTransition) {
    startViewTransition.call(document, () => applyLocale(value));
    return;
  }

  document.documentElement.classList.add('locale-transitioning');
  window.setTimeout(() => {
    applyLocale(value);
    requestAnimationFrame(() => document.documentElement.classList.remove('locale-transitioning'));
  }, 90);
}

function closeOnOutsideClick(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) isOpen.value = false;
}

function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') isOpen.value = false;
}

onMounted(() => {
  document.addEventListener('pointerdown', closeOnOutsideClick);
  document.addEventListener('keydown', closeOnEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeOnOutsideClick);
  document.removeEventListener('keydown', closeOnEscape);
});
</script>
