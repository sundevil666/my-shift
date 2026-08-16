<template>
  <div class="connect-page flex flex-center q-pa-md">
    <q-card flat bordered class="connect-card">
      <q-card-section>
        <div class="text-overline text-primary">MY SHIFT CONNECT</div>
        <div class="text-h5 q-mb-sm">{{ t('integration.connect.title') }}</div>
        <p v-if="client">
          {{ t('integration.connect.requestPrefix') }} <strong>{{ client.name }}</strong>
          {{ t('integration.connect.requestSuffix') }}
        </p>
        <q-banner v-else-if="error" rounded class="bg-red-1 text-negative">{{ error }}</q-banner>
      </q-card-section>
      <q-separator />
      <q-card-section v-if="client && !session">
        <p>{{ t('integration.connect.googleFirst') }}</p>
        <div ref="googleButton" />
      </q-card-section>
      <q-card-section v-else-if="client && session">
        <div class="text-grey-7 q-mb-md">
          {{ t('integration.connect.signedInAs', { email: session.user.email }) }}
        </div>
        <ul>
          <li>{{ t('integration.connect.scopeWork') }}</li>
          <li>{{ t('integration.connect.scopeSleep') }}</li>
          <li>{{ t('integration.connect.scopeTravel') }}</li>
        </ul>
        <div class="row q-gutter-sm q-mt-lg">
          <q-btn
            color="primary"
            :label="t('integration.connect.allow')"
            :loading="authorizing"
            @click="authorize"
          />
          <q-btn flat :label="t('common.cancel')" @click="cancel" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useAppStore } from 'stores/app-store';
import {
  authenticateWithGoogle,
  integrationSession,
  syncActivity,
  type IntegrationSession,
} from 'src/services/integration-account';

const route = useRoute();
const { t } = useI18n();
const app = useAppStore();
const googleButton = ref<HTMLElement>();
const session = ref<IntegrationSession | null>(integrationSession());
const client = ref<{ id: string; name: string; scope: string } | null>(null);
const error = ref('');
const authorizing = ref(false);
const parameter = (name: string) =>
  typeof route.query[name] === 'string' ? String(route.query[name]) : '';

onMounted(async () => {
  const response = await fetch(
    `/api/oauth/client?client_id=${encodeURIComponent(parameter('client_id'))}&redirect_uri=${encodeURIComponent(parameter('redirect_uri'))}`,
  );
  if (!response.ok) return void (error.value = t('integration.connect.invalidClient'));
  client.value = (await response.json()) as { id: string; name: string; scope: string };
  if (!session.value) loadGoogle();
});

function loadGoogle() {
  if (!process.env.GOOGLE_CLIENT_ID)
    return void (error.value = t('integration.connect.googleUnavailable'));
  const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]');
  if (existing) return existing.addEventListener('load', renderGoogle, { once: true });
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.dataset.googleIdentity = 'true';
  script.onload = renderGoogle;
  document.head.appendChild(script);
}

function renderGoogle() {
  if (!window.google || !googleButton.value) return;
  window.google.accounts.id.initialize({
    client_id: process.env.GOOGLE_CLIENT_ID,
    callback: ({ credential }) => void login(credential),
  });
  window.google.accounts.id.renderButton(googleButton.value, { theme: 'outline', size: 'large' });
}

async function login(credential: string) {
  session.value = await authenticateWithGoogle(credential);
  await syncActivity(app.data);
  await nextTick();
}

async function authorize() {
  if (!session.value) return;
  authorizing.value = true;
  await syncActivity(app.data);
  const response = await fetch('/api/oauth/authorize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.value.accessToken}`,
    },
    body: JSON.stringify({
      clientId: parameter('client_id'),
      redirectUri: parameter('redirect_uri'),
      state: parameter('state'),
      scope: parameter('scope'),
      codeChallenge: parameter('code_challenge'),
      codeChallengeMethod: parameter('code_challenge_method'),
    }),
  });
  const result = (await response.json()) as { redirectTo?: string; error?: string };
  authorizing.value = false;
  if (!response.ok || !result.redirectTo)
    return void (error.value = result.error ?? t('integration.connect.authorizeFailed'));
  window.location.assign(result.redirectTo);
}

function cancel() {
  const redirect = parameter('redirect_uri');
  if (!redirect) return;
  const url = new URL(redirect);
  url.searchParams.set('error', 'access_denied');
  url.searchParams.set('state', parameter('state'));
  window.location.assign(url);
}
</script>

<style scoped>
.connect-page {
  min-height: 100vh;
  background: linear-gradient(145deg, #eef6ff, #f8fbff);
}
.connect-card {
  width: min(560px, 100%);
  border-radius: 20px;
}
</style>
