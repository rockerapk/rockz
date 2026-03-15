# Deploy ZappChat to the Cloud (FREE) — Step by Step

This puts your app on the internet so you can access it from anywhere,
on any device, without your computer needing to be on.

## What you need
- A free GitHub account (github.com)
- A free Railway account (railway.app)
- About 10 minutes

---

## Step 1 — Install Git
Download and install Git from: https://git-scm.com/downloads
(Click "Download for Windows" or your OS. Install with default options.)

## Step 2 — Create a GitHub repository
1. Go to https://github.com and sign in
2. Click the "+" button (top right) → "New repository"
3. Name it: zappchat
4. Leave everything else as default
5. Click "Create repository"

## Step 3 — Upload your code to GitHub
Open a terminal in your zappchat folder and run these commands one by one:

    git init
    git add .
    git commit -m "first commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/zappchat.git
    git push -u origin main

(Replace YOUR_USERNAME with your actual GitHub username)

## Step 4 — Deploy on Railway (free hosting)
1. Go to https://railway.app and sign in with GitHub
2. Click "New Project"
3. Click "Deploy from GitHub repo"
4. Select your "zappchat" repository
5. Railway will automatically detect Node.js and start deploying
6. Wait about 1-2 minutes for it to build

## Step 5 — Get your public URL
1. In Railway, click on your project
2. Click "Settings" → "Domains"
3. Click "Generate Domain"
4. You'll get a URL like: https://zappchat-production-abc1.up.railway.app

Open that URL on ANY device — phone, tablet, computer — and it just works!

## That's it!
- Your chat history is saved on Railway's servers
- The app runs 24/7 even when your computer is off
- Railway's free plan gives you $5/month credit which is plenty for this app
- Share the URL with a friend to actually chat with someone!

## Troubleshooting
- If you see "Application Error": wait 2 minutes and refresh
- If npm install fails: make sure your package.json is in the root folder
- If the app loads but can't connect: check Railway logs for errors
