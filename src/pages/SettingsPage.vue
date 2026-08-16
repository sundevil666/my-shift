<template>
  <q-page padding class="page-shell settings-page">
    <PageHeader
      :eyebrow="$t('nav.settings')"
      :title="$t('settings.title')"
      :subtitle="$t('settings.subtitle')"
    />

    <q-card flat bordered class="settings-tabs-card">
      <q-tabs
        v-model="activeTab"
        align="left"
        no-caps
        inline-label
        outside-arrows
        mobile-arrows
        active-color="primary"
        indicator-color="primary"
        class="settings-tabs"
      >
        <q-tab name="patterns" icon="repeat" :label="$t('nav.patterns')" />
        <q-tab name="reminders" icon="notifications_active" :label="$t('nav.reminders')" />
        <q-tab name="general" icon="tune" :label="$t('nav.settings')" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated class="settings-tab-panels">
        <q-tab-panel name="patterns">
          <PatternsPage embedded />
        </q-tab-panel>
        <q-tab-panel name="reminders">
          <RemindersPage embedded />
        </q-tab-panel>
        <q-tab-panel name="general" />
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageHeader from 'components/PageHeader.vue';
import PatternsPage from 'pages/PatternsPage.vue';
import RemindersPage from 'pages/RemindersPage.vue';

type SettingsTab = 'patterns' | 'reminders' | 'general';

const route = useRoute();
const router = useRouter();
const tabs: SettingsTab[] = ['patterns', 'reminders', 'general'];

const activeTab = computed<SettingsTab>({
  get() {
    const tab = String(route.query.tab ?? 'general') as SettingsTab;
    return tabs.includes(tab) ? tab : 'general';
  },
  set(tab) {
    void router.replace({ path: '/settings', query: { ...route.query, tab } });
  },
});
</script>

<style scoped lang="scss">
.settings-tabs-card {
  overflow: hidden;
}

.settings-tabs {
  min-height: 58px;
}

.settings-tab-panels,
.settings-tab-panels :deep(.q-panel) {
  background: transparent;
}

.settings-tab-panels :deep(.q-tab-panel) {
  padding: 24px;
}

.settings-tab-panels :deep(.settings-tab-page) {
  width: 100%;
}

@media (max-width: 599px) {
  .settings-page {
    padding: 16px 12px 28px;
  }

  .settings-tab-panels :deep(.q-tab-panel) {
    padding: 14px;
  }
}
</style>
