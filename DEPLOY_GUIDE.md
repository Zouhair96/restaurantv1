# How to Deploy YumYum to Netlify (The Professional Way)

This method ensures your **Login Functions** works perfectly by syncing your code to GitHub, then letting Netlify build it automatically.

## Phase 1: Install Git (Required)
You cannot use GitHub without this tool on your computer.

1.  **Download Git**: [Click here to download (Windows)](https://git-scm.com/download/win)
2.  **Install**: Run the installer. Keep clicking "Next" (default settings are fine).
3.  **Restart**: **Crucial!** You must close your code editor (VS Code) and Terminal completely, then open them again.

## Phase 2: Create a GitHub Repository
1.  Log in to [GitHub.com](https://github.com).
2.  Click the **+** icon (top right) -> **New repository**.
3.  Repository name: `restaurant-app`
4.  Visibility: **Public** or **Private** (Free is fine).
5.  **Do NOT** check "Add a README", "Add .gitignore", or "Add license". Keep it empty.
6.  Click **Create repository**.
7.  Copy the URL (e.g., `https://github.com/YourName/restaurant-app.git`).

## Phase 3: Connect Your Code (Terminal)
Open your terminal in Visual Studio Code (`Ctrl + ` or `Terminal > New Terminal`) and run these commands **one by one**:

```bash
# 1. Initialize Git in your folder
git init

# 2. Add all your files
git add .

# 3. Save your changes
git commit -m "First commit - YumYum App"

# 4. Rename branch to main
git branch -M main

# 5. Connect to your GitHub Repo (REPLACE THE URL BELOW!)
git remote add origin https://github.com/YOUR_USERNAME/restaurant-app.git

# 6. Upload your code
git push -u origin main
```
*Note: If `git push` asks for a password, you might need to sign in via the browser pop-up.*

## Phase 4: Netlify
1.  Log in to [Netlify.com](https://www.netlify.com/).
2.  Click **"Add new site"** > **"Import from Git"**.
3.  Choose **GitHub**.
4.  Authorization window will pop up -> Click **Authorize Netlify**.
5.  Search for your repo `restaurant-app` and select it.
6.  **Settings (Netlify should auto-detect these)**:
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
7.  Click **Deploy Site**.

## Success! 🎉
Netlify will now build your site AND your functions (`netlify/functions`). Your login system will work perfectly!
