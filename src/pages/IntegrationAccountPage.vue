<template>
  <div class="integration-page q-pa-md">
    <q-card flat bordered class="integration-card">
      <q-card-section>
        <div class="text-h5">Аккаунт и API</div>
        <p class="text-grey-7 q-mb-none">Войдите через Google, чтобы безопасно синхронизировать график и подключать другие приложения.</p>
      </q-card-section>
      <q-separator />
      <q-card-section v-if="session">
        <div class="row items-center q-gutter-md">
          <q-avatar v-if="session.user.picture"><img :src="session.user.picture" alt="" /></q-avatar>
          <div><strong>{{ session.user.name || session.user.email }}</strong><div class="text-grey-7">{{ session.user.email }}</div></div>
        </div>
        <q-banner v-if="syncState" rounded class="bg-green-1 text-positive q-mt-md">График синхронизирован.</q-banner>
        <div class="row q-gutter-sm q-mt-md">
          <q-btn color="primary" label="Синхронизировать сейчас" :loading="syncing" @click="syncNow" />
          <q-btn flat label="Выйти" @click="signOut" />
          <q-btn flat to="/api-docs" label="Документация API" />
        </div>
        <div v-if="grants.length" class="q-mt-lg">
          <div class="text-subtitle1 q-mb-sm">Подключённые приложения</div>
          <q-list bordered separator>
            <q-item v-for="grant in grants" :key="grant.clientId">
              <q-item-section><q-item-label>{{ grant.clientName }}</q-item-label><q-item-label caption>{{ grant.scope }}</q-item-label></q-item-section>
              <q-item-section side><q-btn flat color="negative" label="Отозвать" @click="revoke(grant.clientId)" /></q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>
      <q-card-section v-else>
        <div v-if="!configured" class="text-negative">Google Sign-In ещё не настроен владельцем сервера.</div>
        <div ref="googleButton" class="q-mt-md" />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { useAppStore } from 'stores/app-store';
import { authenticateWithGoogle, integrationSession, signOutIntegration, syncActivity, type IntegrationSession } from 'src/services/integration-account';

const app = useAppStore();
const googleButton = ref<HTMLElement>();
const session = ref<IntegrationSession | null>(integrationSession());
const syncing = ref(false);
const syncState = ref(false);
const grants = ref<Array<{ clientId: string; clientName: string; scope: string }>>([]);
const configured = computed(() => Boolean(process.env.GOOGLE_CLIENT_ID));

onMounted(() => { loadGoogle(); void loadGrants(); });

function loadGoogle() {
  if (!configured.value || session.value) return;
  const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]');
  if (existing) return existing.addEventListener('load', renderGoogleButton, { once: true });
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.dataset.googleIdentity = 'true';
  script.onload = renderGoogleButton;
  document.head.appendChild(script);
}

function renderGoogleButton() {
  if (!googleButton.value || !window.google) return;
  window.google.accounts.id.initialize({ client_id: process.env.GOOGLE_CLIENT_ID, callback: ({ credential }) => void onCredential(credential) });
  window.google.accounts.id.renderButton(googleButton.value, { theme: 'outline', size: 'large', text: 'signin_with' });
}

async function onCredential(credential: string) {
  session.value = await authenticateWithGoogle(credential);
  await nextTick();
  await syncNow();
}

async function syncNow() {
  syncing.value = true;
  syncState.value = await syncActivity(app.data);
  syncing.value = false;
}

async function loadGrants() {
  if (!session.value) return;
  const response = await fetch('/api/account/grants', { headers: { Authorization: `Bearer ${session.value.accessToken}` } });
  if (response.ok) grants.value = ((await response.json()) as { grants: typeof grants.value }).grants;
}

async function revoke(clientId: string) {
  if (!session.value) return;
  const response = await fetch('/api/account/grants', {
    method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.value.accessToken}` }, body: JSON.stringify({ clientId }),
  });
  if (response.ok) await loadGrants();
}

function signOut() {
  signOutIntegration();
  session.value = null;
  syncState.value = false;
  void nextTick(loadGoogle);
}
</script>

<style scoped>
.integration-page { max-width: 760px; margin: 0 auto; }
.integration-card { border-radius: 18px; }
</style>
