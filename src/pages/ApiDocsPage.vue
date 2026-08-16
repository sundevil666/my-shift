<template>
  <div class="docs-page">
    <header class="docs-hero">
      <q-btn flat round icon="arrow_back" to="/" :aria-label="t('apiDocs.back')" />
      <div>
        <div class="text-overline">MY SHIFT DEVELOPERS</div>
        <h1>Activity API</h1>
        <p>{{ t('apiDocs.subtitle') }}</p>
      </div>
    </header>
    <main class="docs-grid">
      <nav aria-label="API documentation">
        <a href="#start">{{ t('apiDocs.navStart') }}</a
        ><a href="#oauth">OAuth 2.0</a><a href="#activity">Activity</a
        ><a href="#schema">{{ t('apiDocs.navResponse') }}</a
        ><a href="#errors">{{ t('apiDocs.errorsTitle') }}</a>
      </nav>
      <article>
        <section id="start">
          <h2>{{ t('apiDocs.startTitle') }}</h2>
          <p>{{ t('apiDocs.startText') }}</p>
          <q-banner rounded class="bg-blue-1 text-primary"
            >{{ t('apiDocs.scopePrefix') }} <code>activity:read</code>.
            {{ t('apiDocs.scopeSuffix') }}</q-banner
          >
        </section>
        <section id="oauth">
          <h2>OAuth 2.0 + PKCE</h2>
          <p>{{ t('apiDocs.pkceCreate') }}</p>
          <pre>{{ authorizeExample }}</pre>
          <p>{{ t('apiDocs.pkceCallback') }}</p>
          <pre>{{ tokenExample }}</pre>
          <pre>{{ tokenResponse }}</pre>
          <p>{{ t('apiDocs.tokenLifetime') }}</p>
        </section>
        <section id="activity">
          <h2>{{ t('apiDocs.activityTitle') }}</h2>
          <pre>
GET /api/v1/activity?from=2026-08-10&amp;to=2026-08-16
Authorization: Bearer mys_access_...</pre
          >
          <p>{{ t('apiDocs.activityText') }}</p>
        </section>
        <section id="schema">
          <h2>{{ t('apiDocs.schemaTitle') }}</h2>
          <pre>{{ activityResponse }}</pre>
          <h3>{{ t('apiDocs.fixedValues') }}</h3>
          <p>
            <code>timeline.type</code>: sleep, awake, work, work_break, commute, day_off, vacation,
            sick_leave, unknown.
          </p>
          <p>
            <code>lessonAvailability</code>: recommended, available, short_lesson, not_recommended,
            unavailable, unknown.
          </p>
          <p>
            <code>source</code>: user_setting, schedule, estimated. {{ t('apiDocs.sourceText') }}
          </p>
        </section>
        <section id="errors">
          <h2>{{ t('apiDocs.errorsTitle') }}</h2>
          <table>
            <tbody>
              <tr>
                <td>400</td>
                <td>{{ t('apiDocs.error400') }}</td>
              </tr>
              <tr>
                <td>401</td>
                <td>{{ t('apiDocs.error401') }}</td>
              </tr>
              <tr>
                <td>404</td>
                <td>{{ t('apiDocs.error404') }}</td>
              </tr>
              <tr>
                <td>304</td>
                <td>{{ t('apiDocs.error304') }}</td>
              </tr>
            </tbody>
          </table>
          <p>{{ t('apiDocs.errorFormat') }} <code>{ "error": "machine_readable_code" }</code>.</p>
        </section>
      </article>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const authorizeExample = `https://my-shift-iota.vercel.app/#/connect
  ?client_id=learning-app
  &redirect_uri=https%3A%2F%2Flearning.example.com%2Foauth%2Fcallback
  &scope=activity%3Aread
  &state=RANDOM_CSRF_VALUE
  &code_challenge=BASE64URL_SHA256_VERIFIER
  &code_challenge_method=S256`;
const tokenExample = `POST https://my-shift-iota.vercel.app/api/oauth/token
Content-Type: application/json

{"grant_type":"authorization_code","client_id":"learning-app",
 "redirect_uri":"https://learning.example.com/oauth/callback",
 "code":"mys_code_...","code_verifier":"ORIGINAL_PKCE_VERIFIER"}`;
const tokenResponse = `{"access_token":"mys_access_...","token_type":"Bearer",
 "expires_in":3600,"refresh_token":"mys_refresh_...","scope":"activity:read"}`;
const activityResponse = `{
  "schemaVersion": "1.0",
  "generatedAt": "2026-08-15T12:30:00.000Z",
  "dataVersion": "sha256-version",
  "user": {"id":"uuid","timezone":"Europe/Bratislava","locale":"ru-RU"},
  "range": {"from":"2026-08-10","to":"2026-08-16"},
  "preferences": {"sleepDurationMinutes":480},
  "days": [{
    "date":"2026-08-10", "dayType":"workday",
    "shift":{"id":"shift-3","name":"Night shift","startsAt":"...","endsAt":"...","isNightShift":true,"source":"schedule","status":"scheduled"},
    "sleep":{"startsAt":"...","endsAt":"...","durationMinutes":480,"source":"estimated","confidence":0.7},
    "wakeUp":{"at":"...","source":"user_setting","confidence":1},
    "commuteToWork":{"transport":"bus","startsAt":"...","endsAt":"...","durationMinutes":53,"route":{},"stop":{}},
    "workBreaks":[{"id":"first-break","startsAt":"...","endsAt":"...","durationMinutes":30,"source":"estimated","confidence":0.6}],
    "commuteHome":null,
    "timeline":[{"type":"work","startsAt":"...","endsAt":"...","lessonAvailability":"unavailable"}],
    "recommendedLearningWindows":[{"startsAt":"...","endsAt":"...","recommendedDurationMinutes":30,"priority":100,"reason":"awake_before_work"}]
  }]
}`;
</script>

<style scoped>
.docs-page {
  color: #16243a;
  background: #f7f9fc;
  min-height: 100vh;
  overflow-x: hidden;
}
.docs-hero {
  padding: 44px max(24px, calc((100vw - 1120px) / 2));
  display: flex;
  align-items: flex-start;
  gap: 20px;
  color: white;
  background: linear-gradient(120deg, #123b66, #1769aa);
}
.docs-hero > div {
  min-width: 0;
}
.docs-hero h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.6rem);
  line-height: 1.08;
}
.docs-hero p {
  margin: 16px 0 0;
  font-size: 1.1rem;
  opacity: 0.86;
}
.docs-grid {
  max-width: 1120px;
  margin: auto;
  padding: 40px 24px 80px;
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 48px;
}
.docs-grid > * {
  min-width: 0;
}
nav {
  position: sticky;
  top: 24px;
  align-self: start;
  display: grid;
  gap: 12px;
}
nav a {
  padding: 4px 0;
  color: #42617e;
  text-decoration: none;
}
nav a:hover,
nav a:focus-visible {
  color: #1769aa;
  text-decoration: underline;
  text-underline-offset: 4px;
}
article {
  min-width: 0;
  overflow-wrap: anywhere;
}
section {
  margin-bottom: 56px;
  scroll-margin-top: 24px;
}
h2 {
  font-size: 1.8rem;
}
h3 {
  margin-top: 28px;
}
pre {
  box-sizing: border-box;
  max-width: 100%;
  margin: 16px 0;
  overflow-x: auto;
  padding: 20px;
  border-radius: 12px;
  background: #122033;
  color: #dbeafe;
  font-size: 0.875rem;
  line-height: 1.55;
  white-space: pre;
  overscroll-behavior-inline: contain;
}
code {
  font-family: ui-monospace, monospace;
}
table {
  border-collapse: collapse;
  width: 100%;
}
td {
  padding: 12px;
  border-bottom: 1px solid #dce3ec;
  vertical-align: top;
}
td:first-child {
  width: 64px;
  color: #1769aa;
  font-weight: 700;
}
@media (max-width: 720px) {
  .docs-hero {
    padding: 32px 20px;
    gap: 12px;
  }
  .docs-hero .q-btn {
    margin-left: -10px;
  }
  .docs-hero h1 {
    font-size: clamp(2rem, 11vw, 2.75rem);
  }
  .docs-hero p {
    font-size: 1rem;
    line-height: 1.55;
  }
  .docs-grid {
    width: 100%;
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 24px 20px 56px;
  }
  nav {
    position: static;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    gap: 8px;
    overflow-x: auto;
    margin: 0 -20px;
    padding: 0 20px 10px;
    scrollbar-width: thin;
  }
  nav a {
    padding: 7px 12px;
    border: 1px solid #dce3ec;
    border-radius: 999px;
    background: white;
  }
  section {
    margin-bottom: 44px;
  }
  h2 {
    font-size: 1.55rem;
    line-height: 1.25;
  }
  pre {
    margin-inline: 0;
    padding: 16px;
    border-radius: 10px;
    font-size: 0.8125rem;
  }
}
</style>
