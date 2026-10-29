# CampusLoop — NxtWave Growth Intern Challenge Prototype

CampusLoop is a lightweight campus growth and referral attribution system built for NxtWave's 7-day acquisition challenge: **reaching 500 final-year engineering student registrations** for the free workshop *"Build Your First AI Project in 60 Minutes"* with a budget of ₹2,000.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Installation
In the project root directory:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Environment Setup
The project uses a root `.env` file:
```env
PORT=3001
ADMIN_TOKEN=campusloop-admin-2024
BASE_URL=http://localhost:5173
CAMPAIGN_GOAL=500
CAMPAIGN_START_DATE=2026-11-01
CAMPAIGN_DAYS=7
```

### 3. Seed Demo Data
Populate the database with 10 standard campus ambassadors (`AMB001` through `AMB010`), 250 realistic student registrations across 10 top engineering colleges, and 4 daily growth experiment logs:
```bash
node server/seed.js
```
*(All seed records are flagged `is_demo = 1` and strictly separated from genuine campaign numbers).*

### 4. Running the Application
Run both backend and frontend concurrently:
```bash
npm run dev
```
- **Student Registration Page:** [http://localhost:5173](http://localhost:5173)
- **Tracked Ambassador Referral:** [http://localhost:5173/?ref=AMB001&src=whatsapp_group](http://localhost:5173/?ref=AMB001&src=whatsapp_group)
- **Admin Growth Dashboard:** [http://localhost:5173/admin](http://localhost:5173/admin) (Token: `campusloop-admin-2024`)
- **Backend Health Check:** [http://localhost:3001/api/health](http://localhost:3001/api/health)

### 5. Running Automated Test Suite
Execute the automated test suite covering all 10 challenge criteria (28 assertions):
```bash
node test_suite.js
```

---

## 🏛️ Architecture & Attribution Workflow

```
┌────────────────────────────────────────────────────────┐
│                   React + Vite Client                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────┐ │
│  │ Registration Page│  │ Confirmation Hub │  │ Admin │ │
│  │ + 60-Min Agenda  │  │ & Share Kit (QR) │  │ Portal│ │
│  └──────────────────┘  └──────────────────┘  └───────┘ │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON)
┌───────────────────────────┴────────────────────────────┐
│                  Node.js / Express API                 │
│  - Captures 'ref' & 'src' from query params            │
│  - Generates unique student code: 'STU_XXXXXX'         │
│  - Server-side email & batch validation                │
│  - Strict duplicate rejection via UNIQUE(email)        │
│  - Bearer / Header Admin Authentication                │
│  - CSV streaming export with RFC 5322 quotes           │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│              SQLite (campusloop.db via WAL)            │
│  Tables: registrations, ambassadors, experiment_log    │
│  Columns: referral_code (referrer), own_referral_code  │
└────────────────────────────────────────────────────────┘
```

---

## 🧪 Verification & Audit Guide

1. **New Registration & Referral Attribution**:
   - Open: `http://localhost:5173/?ref=AMB001&src=whatsapp_group`
   - Notice the top banner: *"Referred by Priya Sharma (JNTU Hyderabad)"*.
   - Review the visible 60-minute workshop agenda and prerequisites.
   - Enter name, email, college, batch 2026, and submit.
   - You land on `/success` with your own unique referral code (`STU_XXXXXX`) and scannable QR code.

2. **Duplicate Prevention**:
   - Re-submit the exact same email at `http://localhost:5173`.
   - The application returns an explicit 409 Conflict: *"This email is already registered under the name..."*.

3. **Ambassador Leaderboard & Dynamic Toggle**:
   - Log into `/admin` using token: `campusloop-admin-2024`.
   - When **"Show synthetic demo records"** is checked: stats and charts reflect combined volume (250 demo + live).
   - When **unchecked**: stats and charts reflect strictly verified live registrations.
   - Priya Sharma (`AMB001`) shows verified referral leads in both modes.

---

## 🌐 Public Deployment Configuration

To deploy CampusLoop to production (e.g. Render, Railway, Fly.io, or VPS) with functional public referral links:

### 1. Environment Variables Required
Set the following on your hosting dashboard:
- `PORT`: Provided by host (default `3001`)
- `NODE_ENV`: `production`
- `ADMIN_TOKEN`: A strong secret token for campaign operator access (e.g. `nxtwave-growth-928491`)
- `BASE_URL`: **Your live production URL** (e.g. `https://campusloop.onrender.com` without trailing slash)
- `CAMPAIGN_GOAL`: `500`
- `CAMPAIGN_START_DATE`: `2026-11-01`
- `CAMPAIGN_DAYS`: `7`

### 2. Public Referral Link Behavior
- The backend dynamically resolves the request's `x-forwarded-proto` and `x-forwarded-host` headers to construct public URLs, falling back to `BASE_URL`.
- The client success page checks `window.location.origin` and automatically prevents any `localhost` links from leaking into public WhatsApp shares or QR codes.

### 3. Deploying on Render with Persistent Disk (Recommended)

Render provides unified full-stack hosting with persistent disk storage for SQLite:

#### Method 1: Automatic Blueprint Deployment (render.yaml)
1. Push your repository to GitHub / GitLab.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** → **Blueprint**.
3. Select your repository. Render automatically reads [render.yaml](file:///c:/Users/ullas/Desktop/NxtWave/render.yaml), provisions the Starter Web Service, mounts the `/data` persistent disk, and generates a cryptographically secure 32-character `ADMIN_TOKEN`.

#### Method 2: Manual Web Service Setup
1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the following fields:
   - **Name:** `campusloop`
   - **Runtime:** `Node`
   - **Instance Type:** `Starter` *(required for persistent disk support)*
   - **Build Command:** `npm run install:all && npm run build`
   - **Start Command:** `node server/index.js`
4. Under **Advanced** → **Disks**, click **Add Disk**:
   - **Name:** `campusloop-data`
   - **Mount Path:** `/data`
   - **Size:** `1 GB`
5. Under **Environment Variables**, set:
   - `NODE_ENV`: `production`
   - `DATABASE_PATH`: `/data/campusloop.db`
   - `ADMIN_TOKEN`: `[Set a secure custom secret, min 16 characters]`
   - `CAMPAIGN_GOAL`: `500`
   - `CAMPAIGN_START_DATE`: `2026-11-01`
   - `CAMPAIGN_DAYS`: `7`
6. Click **Deploy Web Service**.

#### Seeding Ambassadors on Render (Optional First-Time Setup)
To populate the 10 standard campus ambassadors (`AMB001`–`AMB010`) in the persistent disk database:
- Open the service **Shell** tab in Render and run:
  ```bash
  node server/seed.js
  ```
