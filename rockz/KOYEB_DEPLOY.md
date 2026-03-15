# Deploy Rockz to Koyeb (Free, Always On, No Card Needed)

## What you need
- A free GitHub account (https://github.com) — no card
- A free Koyeb account (https://koyeb.com) — no card

---

## Step 1 — Put Rockz on GitHub

1. Go to https://github.com and sign in (or create a free account)
2. Click the **+** button in the top right → **New repository**
3. Name it `rockz`, set it to **Public**, click **Create repository**
4. On your computer, open a terminal in the rockz folder and run:
   ```
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/YOURUSERNAME/rockz.git
   git push -u origin main
   ```
   (Replace YOURUSERNAME with your actual GitHub username)

   > If you don't have Git installed: https://git-scm.com/downloads

---

## Step 2 — Deploy on Koyeb

1. Go to https://koyeb.com and sign up with your email (no card!)
2. Click **Create App**
3. Choose **GitHub** as the source
4. Connect your GitHub account and select your `rockz` repo
5. Koyeb will auto-detect it's a Node.js app
6. Set these settings:
   - **Run command:** `node server/index.js`
   - **Port:** `3000`
   - **Instance type:** Free
7. Click **Deploy**
8. Wait about 2 minutes

---

## Step 3 — Open your app!

Koyeb gives you a URL like:
**https://rockz-yourname.koyeb.app**

That's your permanent public link — works on any device, anywhere, 24/7, for free!

---

## Updating the app later

Whenever you change the code, just run:
```
git add .
git commit -m "update"
git push
```
Koyeb automatically redeploys — no extra steps needed.

---

## Troubleshooting

**App won't start?**
- Make sure the run command is exactly: `node server/index.js`
- Check the logs in the Koyeb dashboard

**Can't connect GitHub?**
- Go to GitHub → Settings → Applications → Authorize Koyeb

**Messages not saving after redeploy?**
- Koyeb's free tier doesn't have persistent storage
- Messages will reset on redeploy (this is a free tier limitation)
- For persistent messages, consider adding a free database like Supabase later
