<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/125b1d33-abd4-4658-b216-08868819f4cc

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy On Fly.io

This app is configured to run on Fly.io with the current Express server and a persistent SQLite volume.

1. Install and authenticate `flyctl`.
2. Review the app name in [fly.toml](/Users/ganeshadmin/Downloads/daas---technology-&-data-solutions/fly.toml) and change it if Fly says it is unavailable.
3. Set your production secrets:
   `fly secrets set SESSION_SECRET=your-long-random-secret`
   `fly secrets set GEMINI_API_KEY=your-gemini-key`
4. Create the persistent volume in the same region as `primary_region`:
   `fly volumes create daas_data --region bom --size 3 --app <your-fly-app-name>`
5. Deploy:
   `fly deploy`

The app stores its production SQLite database at `/data/portal.sqlite` on the Fly volume, so the admin portal and login system continue to work after restarts.

## Deploy On Render

This repository also includes a Render Blueprint for hosting the full Express application on Render Free with a hosted Postgres database such as Supabase Free.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/weututiy-arch/daas-data-as-a-service)

Free hosting flow:

1. Create a Supabase project and copy its Postgres connection string.
2. Open the Render deploy link above and deploy the Blueprint from this repository.
3. In Render, set `DATABASE_URL` to your Supabase connection string.
4. Set `SESSION_SECRET` to a long random string.
5. `GEMINI_API_KEY` is optional. If you skip it, the site uses the existing image fallbacks.

Notes:

1. Render Free web services sleep when idle, so the first request after inactivity will wake the app up.
2. Local development still falls back to SQLite automatically when `DATABASE_URL` is not set.
