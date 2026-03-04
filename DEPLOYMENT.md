# Deploy Comic-Space for a live demo (GitHub Pages + Render)

Use this guide to get a **live demo link** for your CV: frontend on **GitHub Pages**, API on **Render**.

---

## 1. Deploy the API on Render

1. **MongoDB**: Create a free database at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Create a cluster, get the connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/comicSpaceDB`).

2. **Render**:
   - Go to [render.com](https://render.com) and sign in with GitHub.
   - **New** → **Blueprint** → connect the **Comic-Space** repo.
   - Render will read `render.yaml`. Add an **Environment Variable**:
     - Key: `MONGODB_URI`  
     - Value: your MongoDB Atlas connection string
   - Click **Apply**. Render will build and deploy the API.

3. **Get your API URL**: After deploy, the service will have a URL like `https://comic-space-api-xxxx.onrender.com`. Copy it (no trailing slash).

---

## 2. Deploy the frontend to GitHub Pages

1. **Repo settings**:
   - In your GitHub repo: **Settings** → **Pages**.
   - Under **Build and deployment**, set **Source** to **GitHub Actions**.

2. **Secrets** (so the frontend knows where the API is):
   - **Settings** → **Secrets and variables** → **Actions**.
   - **New repository secret** and add:
     - Name: `REACT_APP_GRAPHQL_URI`  
       Value: `https://YOUR-RENDER-URL.onrender.com/graphql`  
       (use the URL from step 1.3)
     - Name: `REACT_APP_GRAPHQL_WS_URI`  
       Value: `wss://YOUR-RENDER-URL.onrender.com/graphql`  
       (same host, `wss://` and path `/graphql`)

3. **Optional – GitHub Pages URL**:  
   Your live site will be at `https://<YOUR_GITHUB_USERNAME>.github.io/Comic-Space/`.  
   In `client/package.json`, set `"homepage"` to that URL (replace `YOUR_GITHUB_USERNAME`):
   ```json
   "homepage": "https://YOUR_GITHUB_USERNAME.github.io/Comic-Space"
   ```

4. **Deploy**: Push to the `main` branch (or run the **Deploy to GitHub Pages** workflow manually from the **Actions** tab). The workflow will build the client with your API URL and deploy to GitHub Pages.

---

## 3. Your live demo link

- **Frontend (for CV)**: `https://<YOUR_GITHUB_USERNAME>.github.io/Comic-Space/`
- **API**: `https://your-render-service.onrender.com` (optional to share; frontend uses it automatically)

**Note**: On the free tier, Render may spin down the API after inactivity. The first request after a while can take 30–60 seconds; then it’s fast again.
