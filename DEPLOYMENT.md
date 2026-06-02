# 🚀 Production Deployment Guide: Vercel, Render & GitHub Pages

This guide explains how to deploy the **Real-Time Ethanol & Molasses Production Dashboard** in a split production environment:
- **React Frontend**: Deployed on **GitHub Pages** (or **Vercel** / **Netlify**) for ultra-fast, edge-optimized static delivery.
- **Django REST Backend + WebSockets (Channels)**: Deployed on **Render** (or Railway) running Daphne ASGI, connected to a PostgreSQL database and a Redis server.

We have already configured your repository to support this split-hosting architecture out of the box while fully preserving local development capabilities.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    User([Browser Client])
    Vercel[Vercel / GitHub Pages<br/>app.yourdomain.com]
    Render[Render ASGI Server<br/>api.yourdomain.com]
    Redis[(Render Redis<br/>WebSocket Bus)]
    DB[(Render PostgreSQL<br/>Database)]

    User -->|1. Request Site Assets| Vercel
    User -->|2. REST HTTP API Requests| Render
    User -->|3. Real-Time WebSockets| Render
    Render ↔|Publish/Subscribe| Redis
    Render ↔|Read/Write| DB
```

---

## 🔑 Required Production Environment Variables

### 1️⃣ React Frontend (Vercel / GitHub Pages Dashboard)
Configure these variables in your hosting environment:

| Variable Name | Type | Recommended Value | Purpose |
| :--- | :--- | :--- | :--- |
| **`VITE_STANDALONE`** | Plain Text | `true` | Tells Vite to build standard index/assets in `dist` instead of bundling into Django's static files. |
| **`VITE_API_BASE`** | Plain Text | `https://your-backend.onrender.com/api` | The root path of your live Django backend API. |
| **`VITE_WS_HOST`** | Plain Text | `your-backend.onrender.com` | The domain of your backend (without protocol/paths) to connect the WebSocket stream. |

### 2️⃣ Django Backend (Render Dashboard)
Configure these variables in your Render Web Service settings (these are automatically preconfigured if you use the one-click Blueprint):

| Variable Name | Type | Recommended Value / Source | Purpose |
| :--- | :--- | :--- | :--- |
| **`DEBUG`** | Plain Text | `False` | Disables verbose error pages and enforces production security policies. |
| **`SECRET_KEY`** | Secret | *Auto-generated random string* | Used by Django to secure sessions and signatures. |
| **`ALLOWED_HOSTS`** | Plain Text | `your-backend.onrender.com,your-username.github.io` | Comma-separated list of host/domain names that this Django site can serve. |
| **`CORS_ALLOWED_ORIGINS`** | Plain Text | `https://your-username.github.io,https://your-vercel.vercel.app` | Comma-separated list of origin domains permitted to make cross-site API requests. |
| **`CORS_ALLOW_ALL_ORIGINS`** | Plain Text | `False` | Secures your backend by only allowing your trusted frontend domains. |
| **`DATABASE_URL`** | Secret | *Bound from Render PostgreSQL* | Connection string for your managed PostgreSQL production database. |
| **`REDIS_URL`** | Secret | *Bound from Render Redis* | Connection string for your production Redis memory-cache coordination. |

---

## ⚡ One-Click Backend Deployment (Render Blueprint)

We have provided a unified `render.yaml` Blueprint in the root of the repository. This file automates the creation of all three backend components (Daphne Web Service + PostgreSQL Database + Redis Channel Layer) in a single operation!

### Steps to Deploy:
1. Push your updated code to your GitHub repository.
2. Log in to the **[Render Dashboard](https://dashboard.render.com/)**.
3. Click **New +** and select **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically parse `render.yaml` and provision:
   - **`ethanol-molasses-db`** (PostgreSQL database)
   - **`ethanol-molasses-redis`** (Redis cache layer)
   - **`ethanol-molasses-backend`** (Python ASGI web service)
6. Under the Web Service dashboard, click **Environment** and update the settings:
   - Change `ALLOWED_HOSTS` to your custom domains or Render URL.
   - Set `CORS_ALLOWED_ORIGINS` to your GitHub Pages or Vercel URL.
7. Render will automatically run the build command (`./build.sh`) to migrate database schemas and collect static files, and start the ASGI listener via Daphne.

> [!TIP]
> **Executable Build Script Permission:**
> Render builds inside Linux containers. If you encounter a `Permission Denied` error when Render attempts to run `./build.sh`, run this command in your local terminal and push the change to GitHub:
> ```bash
> git update-index --chmod=+x build.sh
> git commit -m "fix: make build.sh executable"
> git push
> ```

---

## 🐙 Option A: Deploy Frontend to GitHub Pages (GitHub Live)

We have configured `vite.config.js` and `package.json` to support **GitHub Pages** (your "GitHub Live" deploy) automatically. It dynamically reads your repository name from the `"homepage"` key in `package.json` and adjusts Vite asset links accordingly to prevent `404 Not Found` errors.

### Steps to Deploy:
1. Ensure your repository `"homepage"` in `ethanol/frontend/package.json` matches your GitHub URL:
   ```json
   "homepage": "https://webhostmediacompany.github.io/E.M-Analysis-data/"
   ```
2. Navigate to your root directory and run the deployment script:
   ```bash
   npm run deploy:frontend
   ```
   *This automatically installs dependencies, builds your standalone React app in production mode with assets configured for `/E.M-Analysis-data/`, and pushes the compilation output to the `gh-pages` branch on GitHub!*
3. Go to your GitHub repository page → **Settings** → **Pages**:
   - Under **Build and deployment** → **Source**, select **Deploy from a branch**.
   - Under **Branch**, select **`gh-pages`** and folder **`/ (root)`**.
   - Click **Save**.
4. Your React frontend will be live in minutes at: `https://webhostmediacompany.github.io/E.M-Analysis-data/`!

---

## 🖥️ Option B: Deploy Frontend to Vercel

Vercel is another highly popular host for React applications, integrating directly with your repository.

### Steps to Deploy:
1. Log in to the **[Vercel Dashboard](https://vercel.com/)**.
2. Click **Add New** and select **Project**.
3. Import your GitHub repository.
4. Configure the Project Settings:
   - **Framework Preset**: `Vite` (automatically detected).
   - **Root Directory**: Select **`ethanol/frontend`** (this is vital, as Vercel must build within the frontend subdirectory).
   - **Build Command**: `npm run build` (runs `vite build --mode standalone`).
   - **Output Directory**: `dist` (auto-detected).
5. Expand the **Environment Variables** section and add:
   - `VITE_STANDALONE` = `true`
   - `VITE_API_BASE` = `https://your-backend.onrender.com/api` (use your actual Render backend URL)
   - `VITE_WS_HOST` = `your-backend.onrender.com` (use your actual Render backend domain)
6. Click **Deploy**.
7. Vercel will compile the standalone bundles and output a live, global domain (e.g. `https://your-project.vercel.app`).

---

## 🌐 DNS Custom Domain Configuration

To map custom subdomains (e.g. `app.yourdomain.com` for frontend and `api.yourdomain.com` for backend) under your own domain name:

### 1. The Frontend (GitHub Pages / Vercel)
- Map your main domain or subdomain to your host:
  - For **GitHub Pages**: Add a **CNAME record** pointing to `<username>.github.io` (e.g. `webhostmediacompany.github.io`).
  - For **Vercel**: Add a **CNAME record** pointing to `cname.vercel-dns.com`.

### 2. The Backend (Render)
- Map your API subdomain (e.g. `api.yourdomain.com`) to Render:
  - Add a **CNAME record** pointing to `your-backend-subdomain.onrender.com`.

Update your backend environment variables (`CORS_ALLOWED_ORIGINS` and `ALLOWED_HOSTS`) to match your custom domains once they propagate!

---

## 🧪 Post-Deployment Verification Checklist

1. **Verify API Connection**:
   - Access `https://your-backend.onrender.com/api/readings/`.
   - Ensure it returns a successful JSON status or authentication challenge, rather than a 500 error.
2. **Verify Static Admin Panel**:
   - Access `https://your-backend.onrender.com/admin/`.
   - Ensure the Django admin portal loads with styles and graphics fully rendered (WhiteNoise verification).
3. **Verify CORS and WS Stream**:
   - Open your deployed frontend site in a browser.
   - Inspect the page and open the **Browser Console** (F12).
   - Verify there are no red CORS blocks.
   - Confirm you see `[WS] Connected` in the console, indicating that the WebSocket stream is successfully coordinating with Daphne!
