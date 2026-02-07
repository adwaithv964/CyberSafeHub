---
description: How to deploy the backend to Render using Docker (Blueprint)
---

Since your app requires **LibreOffice** for PDF conversions, you **must** use Docker on Render. Standard Node.js servers cannot run LibreOffice.

Fortunately, your project is already set up for this!

### Step 1: Ensure Code is Pushed
Make sure all your latest changes (including `Dockerfile` and `render.yaml`) are pushed to GitHub.

### Step 2: Open Render Dashboard
1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** button in the top right.
3. Select **Blueprint**.

### Step 3: Connect Repository
1. Connect your `CyberSafeHub` repository.
2. Render will automatically detect the `render.yaml` file in your project root.

### Step 4: Apply Blueprint
1. Give your service a name (e.g., `cybersafehub-backend-docker`).
2. Click **Apply**.
3. Render will verify the inputs and ask for approval.

### Step 5: Wait for Build
1. Render will now build your **Docker Image**. This takes longer than usual (5-10 minutes) because it is installing LibreOffice and other tools.
2. Once the deploy says "Live", your backend is ready!

### Step 6: Update Frontend
1. Copy the **new URL** of your Docker backend from the Render dashboard (e.g., `https://cybersafehub-backend-docker.onrender.com`).
2. Go to Vercel (Frontend).
3. Update the `VITE_API_BASE_URL` Environment Variable to this new URL.
4. Redeploy Frontend.

### Troubleshooting
- If the build fails, check the logs. It usually means a timeout on the Free tier. If so, try deploying again; sometimes the apt-get install takes too long.
