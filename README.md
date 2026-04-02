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

This repository also includes a Render Blueprint for hosting the full Express + SQLite application with a persistent disk.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/weututiy-arch/daas-data-as-a-service)

Notes:

1. Render persistent disks are available on paid web services, so this path is for the full portal-enabled website, not a static-only deploy.
2. During the first deploy, Render will prompt you for `SESSION_SECRET` and `GEMINI_API_KEY`.
3. The Blueprint mounts persistent storage at `/app/data`, and the app stores its SQLite database at `/app/data/portal.sqlite`.
