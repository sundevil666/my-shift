<template>
  <q-page padding class="page-shell privacy-page">
    <PageHeader
      :eyebrow="$t('privacy.eyebrow')"
      :title="$t('privacy.title')"
      :subtitle="$t('privacy.subtitle')"
    />
    <q-card flat bordered class="privacy-card">
      <q-card-section class="privacy-card__content">
        <h2>{{ $t('privacy.localTitle') }}</h2>
        <p>{{ $t('privacy.localText') }}</p>
        <h2>{{ $t('privacy.pushTitle') }}</h2>
        <p>{{ $t('privacy.pushText') }}</p>
        <h2>{{ $t('privacy.feedbackTitle') }}</h2>
        <p>{{ $t('privacy.feedbackText') }}</p>
        <h2>{{ $t('privacy.analyticsTitle') }}</h2>
        <p>{{ $t('privacy.analyticsText') }}</p>
        <h2>{{ $t('privacy.controlTitle') }}</h2>
        <p>{{ $t('privacy.controlText') }}</p>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import PageHeader from 'components/PageHeader.vue';
</script>

<style scoped>
.privacy-card__content {
  display: grid;
  gap: 6px;
}

.privacy-card__content h2 {
  margin: 12px 0 0;
  font-size: 1.1rem;
  line-height: 1.3;
}

.privacy-card__content h2:first-child {
  margin-top: 0;
}

.privacy-card__content p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.55;
}

@media (max-width: 599px) {
  .privacy-card__content h2 {
    margin-top: 10px;
    font-size: 1.05rem;
  }

  .privacy-card__content p {
    font-size: 0.92rem;
    line-height: 1.5;
  }
}
</style>
