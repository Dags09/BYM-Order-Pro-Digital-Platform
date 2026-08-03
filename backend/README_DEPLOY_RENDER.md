# Deploy Backend to Render

## Required environment variables

Set these values in Render dashboard for your backend service:

- `PORT` (Render provides a port automatically; set to `10000` or leave unset if service supports it)
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRES_IN`
- `FRONTEND_URL`
- `EMAIL_USER`
- `EMAIL_PASS`
- `SMTP_HOST` (optional, default: `smtp.gmail.com`)
- `SMTP_PORT` (optional, default: `587`)
- `SMTP_FROM` (optional)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Render service settings

- Environment: `Node`
- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: `backend`

If your backend is not in the repository root, use the service settings to point at the `backend` folder.
