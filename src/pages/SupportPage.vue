<template>
  <q-page padding class="page-shell support-page">
    <PageHeader
      :eyebrow="$t('support.eyebrow')"
      :title="$t('support.title')"
      :subtitle="$t('support.subtitle')"
    />

    <q-card flat bordered class="support-card">
      <q-card-section class="support-card__intro">
        <q-icon name="favorite_border" class="support-card__icon" />
        <h2>{{ $t('support.voluntaryTitle') }}</h2>
        <p>{{ $t('support.voluntaryText') }}</p>

        <div class="support-principles">
          <div v-for="item in principles" :key="item.title" class="support-principle">
            <q-icon :name="item.icon" />
            <strong>{{ $t(item.title) }}</strong>
            <p>{{ $t(item.text) }}</p>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="support-coming">
        <q-banner rounded class="bg-primary-1 text-dark">
          <template #avatar><q-icon name="payments" color="primary" /></template>
          <strong>{{ $t('support.methodsTitle') }}</strong>
          <div>{{ $t('support.methodsText') }}</div>
        </q-banner>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import PageHeader from 'components/PageHeader.vue';

const principles = [
  {
    icon: 'volunteer_activism',
    title: 'support.principles.choiceTitle',
    text: 'support.principles.choiceText',
  },
  {
    icon: 'lock_open',
    title: 'support.principles.accessTitle',
    text: 'support.principles.accessText',
  },
  {
    icon: 'construction',
    title: 'support.principles.purposeTitle',
    text: 'support.principles.purposeText',
  },
] as const;
</script>
