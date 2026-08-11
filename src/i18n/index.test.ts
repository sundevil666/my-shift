import { describe, expect, it } from 'vitest';
import { createI18n } from 'vue-i18n';

import messages from './index';

function leafKeys(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === 'object' && child !== null ? leafKeys(child, path) : [path];
  });
}

function leafText(value: object): string {
  return Object.values(value)
    .flatMap((child) =>
      typeof child === 'object' && child !== null ? leafText(child) : String(child),
    )
    .join('\n');
}

describe('locale messages', () => {
  it('keeps every locale schema complete', () => {
    const expected = leafKeys(messages['en-US']).sort();
    for (const localeMessages of Object.values(messages)) {
      expect(leafKeys(localeMessages).sort()).toEqual(expected);
    }
  });

  it('does not contain Cyrillic text in English or Slovak', () => {
    expect(leafText(messages['en-US'])).not.toMatch(/[А-Яа-яЁёІіЇїЄєҐґ]/);
    expect(leafText(messages['sk-SK'])).not.toMatch(/[А-Яа-яЁёІіЇїЄєҐґ]/);
  });

  it('switches rendered messages when locale changes', () => {
    const i18n = createI18n({ legacy: false, locale: 'ru-RU', messages });
    expect(i18n.global.t('alarmCenter.title')).toBe('Будильники');

    i18n.global.locale.value = 'sk-SK';
    expect(i18n.global.t('alarmCenter.title')).toBe('Budíky');

    i18n.global.locale.value = 'uk-UA';
    expect(i18n.global.t('alarmCenter.title')).toBe('Будильники');

    i18n.global.locale.value = 'en-US';
    expect(i18n.global.t('alarmCenter.title')).toBe('Alarms');
  });
});
