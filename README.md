# My Shift

Local-first shift planner distributed as an installable Quasar PWA.

## Development

```bash
npm install
npm run dev
```

Checks and production build:

```bash
npm run lint
npm run build
```

## Web Push setup

Background reminders use Vercel Functions, Upstash Redis and Upstash QStash.
QStash schedules each reminder individually, so the project does not require a
paid per-minute Vercel Cron job.

1. Create an Upstash Redis database and enable QStash.
2. Run `npm run generate:vapid` once.
3. Add the variables from `.env.example` to the Vercel Production environment.
4. Set `VAPID_SUBJECT` to a contact URI such as `mailto:admin@example.com`.
5. Deploy the `main` branch.
6. Open the installed PWA and press **Notification test** to grant permission
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

Installed Android releases download the next APK, save a native backup of all user settings, and
open the Android package installer. Android always requires the user to confirm installation.

## Feedback email setup

The feedback form sends messages through Resend to `sundevildi@gmail.com`.
Add these variables to the Vercel Production environment:

- `RESEND_API_KEY`: Resend API key.
- `FEEDBACK_FROM_EMAIL`: verified sender, for example `My Shift <feedback@example.com>`.
- `FEEDBACK_CAPTCHA_SECRET`: a long random secret used to sign captcha challenges.
