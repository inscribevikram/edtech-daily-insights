# EdTech Daily Sales Insights App

A lightweight web app that scans EdTech/publishing news, procurement, and funding
sources every day and surfaces **account-level buying signals** for inside sales
outreach — tailored to Excelsoft's target regions (UK, Europe, USA, Middle East,
APAC, India, Africa, Australia).

## What it gives you daily
For each detected signal, the dashboard shows:
- **Region** and **Segment** (K-12, Higher Ed, Corporate L&D, Publishing, Government/B2G)
- **Company name** (auto-extracted from the headline)
- **Buying signal type** (Tender/RFP, Funding, Hiring, Digital Transformation, Partnership, Expansion) with an urgency **score**
- **Outreach angle** — a ready-to-use reasoning line for your first message
- **Suggested prospect role** (e.g. Head of L&D, Procurement Officer) to search for
- **One-click LinkedIn search link** pre-filled with company + role
- Source headline + link for context, and an enrichment note pointing to Apollo/Sales Navigator for name, email, and LinkedIn URL

Prospect name, business email, and personal LinkedIn URL are intentionally
**not scraped automatically** (GDPR + platform ToS risk). Instead the app hands you
a pre-qualified company + role + angle, and a one-click LinkedIn search — you then
enrich via Apollo (your existing workflow) in under a minute.

## Architecture
- **Next.js** app (works on Vercel or Netlify) — `pages/index.js` is the dashboard, `pages/api/insights.js` serves data.
- **scripts/generateInsights.js** — a Node script that pulls RSS feeds from `lib/sources.js` (built from your `source_map_regions.csv`), matches text against `lib/signals.js` keyword rules, and writes `data/latest.json`.
- **GitHub Actions** (`.github/workflows/daily-insights.yml`) runs the script every day at ~9 AM IST and commits fresh data — free and works with GitHub Pages/Netlify/Vercel static hosting.
- Non-RSS sources (tenders, procurement portals) are flagged in `lib/sources.js` for manual/Perplexity-assisted daily checks, since most government portals don't expose feeds.

## Deploy steps
1. Push this folder to a new GitHub repo.
2. **Vercel**: Import repo → framework auto-detected as Next.js → deploy. Enable the Vercel Cron in `vercel.json` (needs a paid plan) OR rely on the GitHub Action instead.
3. **Netlify**: Import repo → build command `npm run build`, publish `.next`, install `@netlify/plugin-nextjs`.
4. Enable the GitHub Action (already included) — it runs daily and commits `data/latest.json`; both Netlify and Vercel auto-redeploy on push.
5. Locally test with `npm install && npm run generate && npm run dev`.

## Extending it
- Add more RSS-enabled sources to `lib/sources.js`.
- Add new keyword rules to `lib/signals.js` to catch more buying signals (e.g. "budget approved", "pilot program").
- Swap the JSON file store for Google Sheets (via `googleapis`, already in dependencies) if you want to edit/enrich rows manually in the sheet you're used to.
- Add an Apollo API call in `generateInsights.js` to auto-enrich the top-scoring companies with real prospect contacts (requires Apollo API key + credits).

## v1.1 update: Apollo enrichment + Google Sheets sync

### Apollo integration (`lib/apollo.js`)
- Top N highest-scoring leads each day are auto-enriched with a real **prospect name, title, LinkedIn URL, and business email** using Apollo's People Search + Match APIs.
- Set `APOLLO_API_KEY` and `APOLLO_ENRICH_TOP_N` (default 10) to control API credit usage — only the hottest leads get enriched, everything else falls back to the LinkedIn search-link approach.

### Google Sheets sync (`lib/sheets.js`)
- Every run appends the day's insights (including enriched prospect data) as new rows to a Google Sheet you own, building a historical, filterable log alongside your existing spreadsheet workflow.
- Requires a Google Cloud service account with Sheets API access, shared as an editor on the target sheet: set `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`.

### Setting secrets
Add `APOLLO_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID` as **GitHub Actions secrets** (Repo Settings > Secrets and variables > Actions) so the daily workflow can use them without exposing them in code. For local testing, copy `.env.example` to `.env.local` and fill in real values.