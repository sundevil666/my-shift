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
