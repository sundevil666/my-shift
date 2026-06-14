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

      <q-card-section class="support-methods">
        <div class="support-methods__heading">
          <div>
            <h2>{{ $t('support.methodsTitle') }}</h2>
            <p>{{ $t('support.methodsText') }}</p>
          </div>
          <q-chip icon="euro" color="primary" text-color="white">
            {{ $t('support.euroOnly') }}
          </q-chip>
        </div>

        <div class="support-accounts">
          <article v-for="account in accounts" :key="account.id" class="support-account">
            <div class="support-account__title">
              <q-icon :name="account.icon" />
              <div>
                <strong>{{ $t(account.title) }}</strong>
                <small>{{ $t(account.subtitle) }}</small>
              </div>
            </div>

            <dl>
              <div v-for="field in account.fields" :key="field.label" class="support-detail">
                <dt>{{ $t(field.label) }}</dt>
                <dd>
                  <span>{{ field.value }}</span>
                  <q-btn
                    v-if="field.copy"
                    flat
                    round
                    dense
                    icon="content_copy"
                    :aria-label="$t('support.copy')"
                    @click="copyValue(field.value)"
                  >
                    <q-tooltip>{{ $t('support.copy') }}</q-tooltip>
                  </q-btn>
                </dd>
              </div>
            </dl>
          </article>
        </div>

        <q-banner rounded class="support-transfer-note">
          <template #avatar><q-icon name="verified_user" color="primary" /></template>
          {{ $t('support.transferNote') }}
        </q-banner>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { copyToClipboard, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import PageHeader from 'components/PageHeader.vue';

const $q = useQuasar();
const { t } = useI18n();

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

const accounts = [
  {
    id: 'slovak-bank',
    icon: 'account_balance',
    title: 'support.accounts.slovak.title',
    subtitle: 'support.accounts.slovak.subtitle',
    fields: [
      { label: 'support.fields.iban', value: 'SK83 0900 0000 0052 3003 3548', copy: true },
      { label: 'support.fields.currency', value: 'EUR', copy: false },
    ],
  },
  {
    id: 'revolut',
    icon: 'payments',
    title: 'support.accounts.revolut.title',
    subtitle: 'support.accounts.revolut.subtitle',
    fields: [
      { label: 'support.fields.iban', value: 'LT98 3250 0443 3790 9986', copy: true },
      { label: 'support.fields.currency', value: 'EUR', copy: false },
    ],
  },
] as const;

async function copyValue(value: string) {
  await copyToClipboard(value);
  $q.notify({
    type: 'positive',
    message: t('support.copied'),
    timeout: 1_500,
  });
}
</script>
