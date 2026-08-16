<template>
  <div class="docs-page">
    <header class="docs-hero">
      <q-btn flat round icon="arrow_back" to="/" aria-label="Назад" />
      <div><div class="text-overline">MY SHIFT DEVELOPERS</div><h1>Activity API</h1><p>Расписание, сон, дорога и свободные окна — с разрешения пользователя.</p></div>
    </header>
    <main class="docs-grid">
      <nav><a href="#start">Начало</a><a href="#oauth">OAuth 2.0</a><a href="#activity">Activity</a><a href="#schema">Ответ</a><a href="#errors">Ошибки</a></nav>
      <article>
        <section id="start">
          <h2>Начало работы</h2>
          <p>Передайте владельцу My Shift название приложения и HTTPS redirect URI. Вы получите <code>client_id</code>. Email пользователя не является ключом и не передаётся в Activity API.</p>
          <q-banner rounded class="bg-blue-1 text-primary">Scope первой версии: <code>activity:read</code>. Токен относится только к пользователю, который дал согласие.</q-banner>
        </section>
        <section id="oauth">
          <h2>OAuth 2.0 + PKCE</h2>
          <p>Создайте случайный <code>code_verifier</code> длиной 43–128 символов и его SHA-256 <code>code_challenge</code>. Откройте URL в системном браузере:</p>
          <pre>{{ authorizeExample }}</pre>
          <p>Callback получит <code>code</code> и <code>state</code>. Сравните state, затем обменяйте одноразовый код:</p>
          <pre>{{ tokenExample }}</pre>
          <pre>{{ tokenResponse }}</pre>
          <p>Access token действует 1 час. Refresh token одноразовый и ротируется при обновлении.</p>
        </section>
        <section id="activity">
          <h2>Получение активности</h2>
          <pre>GET /api/v1/activity?from=2026-08-10&amp;to=2026-08-16
Authorization: Bearer mys_access_...</pre>
          <p>Диапазон включительный. Для экономной синхронизации отправляйте полученный ETag в <code>If-None-Match</code>; без изменений сервер вернёт <code>304</code>.</p>
        </section>
        <section id="schema">
          <h2>Схема ответа</h2>
          <pre>{{ activityResponse }}</pre>
          <h3>Фиксированные значения</h3>
          <p><code>timeline.type</code>: sleep, awake, work, work_break, commute, day_off, vacation, sick_leave, unknown.</p>
          <p><code>lessonAvailability</code>: recommended, available, short_lesson, not_recommended, unavailable, unknown.</p>
          <p><code>source</code>: user_setting, schedule или estimated. <code>confidence</code> — число от 0 до 1. Не используйте приблизительный сон как точный будильник.</p>
        </section>
        <section id="errors">
          <h2>Ошибки</h2>
          <table><tbody><tr><td>400</td><td>Некорректный диапазон или OAuth-запрос</td></tr><tr><td>401</td><td>Токен отсутствует, истёк или отозван</td></tr><tr><td>404</td><td>График ещё не синхронизирован</td></tr><tr><td>304</td><td>Данные не изменились</td></tr></tbody></table>
          <p>Формат ошибки: <code>{ "error": "machine_readable_code" }</code>.</p>
        </section>
      </article>
    </main>
  </div>
</template>

<script setup lang="ts">
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
.docs-page { color: #16243a; background: #f7f9fc; min-height: 100vh; }
.docs-hero { padding: 44px max(24px, calc((100vw - 1120px) / 2)); display: flex; gap: 20px; color: white; background: linear-gradient(120deg, #123b66, #1769aa); }
.docs-hero h1 { margin: 0; font-size: clamp(2rem, 5vw, 3.6rem); }.docs-hero p { font-size: 1.1rem; opacity: .86; }
.docs-grid { max-width: 1120px; margin: auto; padding: 40px 24px 80px; display: grid; grid-template-columns: 180px 1fr; gap: 48px; }
nav { position: sticky; top: 24px; align-self: start; display: grid; gap: 12px; } nav a { color: #42617e; text-decoration: none; }
section { margin-bottom: 56px; scroll-margin-top: 24px; } h2 { font-size: 1.8rem; } h3 { margin-top: 28px; }
pre { overflow-x: auto; padding: 20px; border-radius: 12px; background: #122033; color: #dbeafe; line-height: 1.55; } code { font-family: ui-monospace, monospace; }
table { border-collapse: collapse; width: 100%; } td { padding: 12px; border-bottom: 1px solid #dce3ec; }
@media (max-width: 720px) { .docs-grid { grid-template-columns: 1fr; } nav { position: static; grid-template-columns: repeat(3, auto); overflow-x: auto; } }
</style>
