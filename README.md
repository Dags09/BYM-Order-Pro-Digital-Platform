# BYM Order Pro Digital Platform

This repository contains the backend (Express + MongoDB) and frontend (React + Vite) for BYM Order Pro Digital Platform.

This README explains how to deploy the backend to Render and the frontend to Vercel, plus how to run locally.

---

## Repo layout

- `backend/` — Node/Express API
- `frontend/` — React + Vite app

---

## Local development

1. Install dependencies for both projects:

```bash
# from repo root
cd backend
npm install
cd ../frontend
npm install
```

2. Run backend and frontend concurrently in separate terminals:

```bash
# Terminal 1 - backend
cd backend
npm run dev

# Terminal 2 - frontend
cd frontend
npm run dev
```

3. Ensure you have a `backend/.env` with required env vars (see `backend/.env.example`).

---

## Environment variables

Do NOT commit your real `.env` values. Use the following example files and set the real secrets in Render/Vercel.

- `backend/.env.example` — backend variable names and placeholder values
- `frontend/.env.example` — frontend variable names and placeholder values

When adding variables in Render, the left field is the variable name and the right field is its VALUE (secret string). Do not upload `.env` files to the web UI.

---

## Deploy Backend to Render

1. Push your repo to GitHub.
2. On Render, create a new **Web Service** and connect your GitHub repo `Dags09/BYM-Order-Pro-Digital-Platform`.
3. Set the Root Directory to `backend`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Set environment variables in the Render service settings (see `backend/.env.example`).
7. If you added `backend/render.yaml` to the repo, Render can use it to prefill service settings when creating the service.

Important backend env vars (use your real values in Render):

- `PORT` — leave unset (Render provides it) or set to `10000` locally
- `MONGODB_URI` — e.g. `mongodb+srv://user:pass@cluster0.mongodb.net/dbname?retryWrites=true&w=majority`
- `JWT_SECRET`
- `JWT_EXPIRES_IN` — e.g. `1d`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRES_IN` — e.g. `7d`
- `FRONTEND_URL` — your Vercel URL, e.g. `https://bym-frontend.vercel.app`
- `EMAIL_USER` — email address for sending
- `EMAIL_PASS` — email password or app password
- `SMTP_HOST` — optional, default `smtp.gmail.com`
- `SMTP_PORT` — optional, default `587`
- `SMTP_FROM` — optional
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

After deployment, Render will provide a public backend URL such as `https://bym-backend.onrender.com`.

---

## Deploy Frontend to Vercel

1. On Vercel, create a new project and connect your GitHub repo.
2. Set the Root Directory to `frontend`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Set environment variables in Vercel (Project Settings → Environment Variables):

- `VITE_API_URL` — the full backend API base path, e.g. `https://bym-backend.onrender.com/api/v1`

Note: Vite environment variables must be prefixed with `VITE_` to be exposed to the client.

---

## Example values (placeholder)

In Render/Vercel UI, set variables like:

- Name: `MONGODB_URI` Value: `mongodb+srv://<user>:<pass>@.../dbname?retryWrites=true&w=majority`
- Name: `JWT_SECRET` Value: `<a-long-random-secret>`
- Name: `FRONTEND_URL` Value: `https://your-frontend.vercel.app`
- Name: `VITE_API_URL` Value: `https://your-backend.onrender.com/api/v1`

---

## After deployment

- Update `FRONTEND_URL` in Render to match the Vercel frontend deployment (so CORS and socket origin work).
- Update `VITE_API_URL` in Vercel to point to your backend API base URL.

---

## Useful commands

```bash
# Build frontend for production locally
cd frontend
npm run build

# Run backend start (production)
cd backend
npm start
```

---

## Security notes

- Never commit `.env` files with secrets. `.gitignore` already includes `.env`.
- Use strong random secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET`.
- Rotate credentials if secrets are accidentally leaked.

---

If you want, I can:

- create `backend/.env.example` and `frontend/.env.example` now (no secrets),
- then commit and push these changes for you.

Tell me if you want me to add the example env files and commit them.
