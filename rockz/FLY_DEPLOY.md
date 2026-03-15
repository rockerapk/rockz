# Deploy Rockz to Fly.io (Always Free & Always On)

## One-time setup

### Step 1 — Create a free Fly.io account
Go to https://fly.io and sign up. You'll need to add a credit card
but you will NOT be charged — the free tier covers this app easily.

### Step 2 — Install the Fly CLI
- **Windows:** Open PowerShell and run:
  ```
  powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
  ```
- **Mac:** Open Terminal and run:
  ```
  brew install flyctl
  ```
  (If you don't have Homebrew: https://brew.sh)

### Step 3 — Log in to Fly
```
fly auth login
```
This opens your browser to log in.

### Step 4 — Go to the Rockz folder
```
cd path/to/rockz
```

### Step 5 — Launch the app (first time only)
```
fly launch --name rockz-chat --region iad --now
```
- If it asks "would you like to overwrite fly.toml?" → type N
- If it asks about Postgres/Redis → type N
- Wait 1–2 minutes for it to deploy

### Step 6 — Open your app!
```
fly open
```
Or just go to: https://rockz-chat.fly.dev

---

## After the first deploy — updating the app

If you ever change the code and want to redeploy:
```
fly deploy
```

## Check if it's running
```
fly status
```

## View logs
```
fly logs
```

---

## Notes
- Your app runs at https://rockz-chat.fly.dev (public URL, works on any device)
- Messages are saved inside the container — they persist between restarts
- The app stays on 24/7 for free as long as you stay within Fly's free limits
- Free tier includes: 3 shared VMs, 160GB outbound transfer/month — way more than enough
