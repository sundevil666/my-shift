<template>
  <component :is="embedded ? 'div' : 'q-page'" :class="embedded ? 'settings-tab-page' : 'page-shell'" :padding="!embedded">
    <PageHeader
      v-if="!embedded"
      :eyebrow="$t('nav.patterns')"
      :title="$t('patterns.title')"
      :subtitle="$t('patterns.subtitle')"
    />
    <q-card flat bordered>
      <q-card-section class="row q-col-gutter-md">
        <q-input
          v-model="app.activeProfile.pattern.name"
          outlined
          class="col-12 col-sm-6"
          :label="$t('patterns.name')"
        />
        <q-input
          v-model="app.activeProfile.pattern.startDate"
          outlined
          type="date"
          class="col-12 col-sm-6"
          :label="$t('patterns.startDate')"
        />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="section-title q-mb-sm">{{ $t('patterns.sequence') }}</div>
        <div class="row q-gutter-sm">
          <q-chip
            v-for="(code, index) in app.activeProfile.pattern.sequence"
            :key="`${code}-${index}`"
            removable
            color="primary"
            text-color="white"
            @remove="remove(index)"
          >
            {{ shiftName(code) }}
          </q-chip>
        </div>
        <div class="row q-gutter-sm q-mt-md">
          <q-btn
            v-for="option in options"
            :key="option.code"
            outline
            color="primary"
            class="app-action-button"
            :label="option.name"
            @click="app.activeProfile.pattern.sequence.push(option.code)"
          />
        </div>
      </q-card-section>
    </q-card>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from 'components/PageHeader.vue';
import { useAppStore } from 'stores/app-store';
import type { ShiftCode } from 'src/models/app';

withDefaults(defineProps<{ embedded?: boolean }>(), { embedded: false });

const app = useAppStore();
const { t } = useI18n();
const shiftName = (code: ShiftCode) => {
  const shift = app.shifts.find((item) => item.id === code);
  return shift ? (shift.nameKey ? t(shift.nameKey) : shift.name) : t('shifts.off');
};
const options = computed<{ code: ShiftCode; name: string }[]>(() => [
  ...app.shifts.map((shift) => ({
    code: shift.id,
    name: shift.nameKey ? t(shift.nameKey) : shift.name,
  })),
  { code: 'off', name: t('shifts.off') },
]);
function remove(index: number) {
  if (app.activeProfile.pattern.sequence.length > 1) {
    app.activeProfile.pattern.sequence.splice(index, 1);
  }
}
</script>
