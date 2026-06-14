# My Shift

Local-first shift planner distributed as an installable Quasar PWA.

## Development

```bash
npm install
npm run dev
```

Checks and production build:

```bash
npm run check
```

Enable the repository's Git hooks after cloning:

```bash
npm run setup:hooks
```

The pre-push hook scans Git-tracked files for secrets, then runs ESLint, TypeScript checks, all
unit tests and the production PWA build. Git cancels the push if any check fails.

## Web Push setup

Background reminders use Vercel Functions, Upstash Redis and Upstash QStash.
QStash schedules each reminder individually, so the project does not require a
paid per-minute Vercel Cron job.

1. Create an Upstash Redis database and enable QStash.
2. Run `npm run generate:vapid` once.
3. Add the variables from `.env.example` to the Vercel Production environment.
4. Set `VAPID_SUBJECT` to a contact URI such as `mailto:admin@example.com`.
5. Set `PUBLIC_APP_ORIGIN` to the canonical HTTPS origin used by QStash callbacks.
6. Deploy the `main` branch.
7. Open the installed PWA, explicitly enable cloud push, and press **Notification test**
   to grant permission
   and schedule reminders for the next 14 days.

The PWA resynchronizes future reminders whenever the local schedule changes.
On iOS, Web Push requires the app to be installed on the Home Screen. Delivery
also remains subject to the user's notification, Focus and sound settings.

## Android releases

Android release metadata is controlled from the root `package.json`:

- `version` becomes Android `versionName`.
- `androidVersionCode` must increase for every APK release.

Release signing uses the ignored files
`src-capacitor/android/my-shift-release.jks` and
`src-capacitor/android/keystore.properties`. Keep an encrypted backup of both files. Losing the
keystore makes it impossible to install future updates over existing installations.

Every push to `main` runs `.github/workflows/android-release.yml`, creates a monotonically
increasing Android `versionCode`, builds a signed APK, calculates SHA-256 and publishes the APK
and `mobile-releases.json` in the latest GitHub Release. Configure these repository secrets:

- `ANDROID_KEYSTORE_BASE64`: base64-encoded `my-shift-release.jks`.
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

The app verifies SHA-256 before opening Android's installer and tries the latest GitHub Release,
the raw repository manifest and the current domain in that order.

Installed Android releases download the next APK, save a native backup of all user settings, and
open the Android package installer. Android always requires the user to confirm installation.

## Domain migration and privacy

Schedule data remains local. The Privacy section in Settings can export a versioned JSON backup
on the old domain and import it on the new domain. Browser storage and notification permissions
cannot be transferred automatically between unrelated domains by design.

Cloud push is opt-in. Disabling consent cancels scheduled QStash messages and unsubscribes the
browser. Feedback sends the entered name, email and message through Resend.
Unexpected application errors send a limited technical report through Resend. Reports contain the
error message and stack trace, app version, platform and page URL without query parameters. They do
not include schedule data, settings or local storage.

## Feedback email setup

The feedback form sends messages through Resend to `sundevildi@gmail.com`.
Add these variables to the Vercel Production environment:

- `RESEND_API_KEY`: Resend API key.
- `FEEDBACK_FROM_EMAIL`: verified sender, for example `My Shift <feedback@example.com>`.
- `FEEDBACK_CAPTCHA_SECRET`: a long random secret used to sign captcha challenges.

The same Resend configuration is used for automatic error reports sent to
`sundevildi@gmail.com`.
