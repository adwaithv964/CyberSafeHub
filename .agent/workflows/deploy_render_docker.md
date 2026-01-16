---
description: How to deploy the backend to Render using Docker (Blueprint)
---

# Deploying to Render with Docker

Since we have created a `render.yaml` and `Dockerfile`, the easiest way to deploy is using a **Blueprint**.

1.  **Push Changes**: Ensure all recent file changes (Dockerfile, render.yaml, server code) are committed and pushed to your GitHub repository.

    ```bash
    git add .
    git commit -m "Prepare for Docker deployment"
    git push origin main
    ```

2.  **Open Render Dashboard**: Go to [dashboard.render.com](https://dashboard.render.com).

3.  **Create Blueprint**:
    *   Click **New +** button.
    *   Select **Blueprint**.
    *   Connect your existing GitHub repository (`CyberSafeHub`).

4.  **Configuration**:
    *   Render will automatically detect the `render.yaml` file.
    *   It will show the service `cybersafehub-backend` defined in the file.
    *   Click **Apply**.

5.  **Environment Variables**:
    *   The build might pause or fail if it needs the Database URL.
    *   Go to the newly created service in the Dashboard.
    *   Click **Environment**.
    *   Add `MONGODB_URI` with your connection string.
    *   (Optional) Update `CLAMAV_HOST` if you are running ClamAV separately, otherwise it defaults to localhost (which is fine inside the container if installed, but our Dockerfile currently only installs LibreOffice/FFmpeg. ClamAV might be missing from the Dockerfile. *Correction: Validated Dockerfile, ClamAV is not currently installed in the Dockerfile, so ClamAV scans might fail unless installed or disabled*).

6.  **Verify**:
    *   Watch the deployment logs.
    *   It will pull the Docker base image, install LibreOffice, and start the app.
    *   Once "Live", your specific LibreOffice conversions will work!

> **Note**: This Docker build is heavier than a standard Node build. It may take 3-5 minutes to build the first time.
