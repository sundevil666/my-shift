<template>
  <q-page padding class="page-shell">
    <PageHeader
      :eyebrow="$t('privacy.eyebrow')"
      :title="$t('privacy.title')"
      :subtitle="$t('privacy.subtitle')"
    />
    <q-card flat bordered>
      <q-card-section>
        <h2>{{ $t('privacy.localTitle') }}</h2>
        <p>{{ $t('privacy.localText') }}</p>
        <h2>{{ $t('privacy.pushTitle') }}</h2>
        <p>{{ $t('privacy.pushText') }}</p>
        <h2>{{ $t('privacy.feedbackTitle') }}</h2>
        <p>{{ $t('privacy.feedbackText') }}</p>
        <h2>{{ $t('privacy.controlTitle') }}</h2>
        <p>{{ $t('privacy.controlText') }}</p>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import PageHeader from 'components/PageHeader.vue';
</script>
