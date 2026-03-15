# Run Rockz on GitHub Codespaces (Free, No Card!)

## What you get
- 60 free hours per month (resets every month)
- A real Linux VM in the cloud
- A public URL anyone can access
- VS Code in your browser
- No credit card needed

---

## PART 1 — Set up Supabase (saves your messages)

### Step 1 — Create a Supabase account
1. Go to https://supabase.com
2. Click "Start your project" → sign up with GitHub (free, no card)

### Step 2 — Create a new project
1. Click "New project"
2. Name it `rockz`
3. Pick any region, set a password, click "Create new project"
4. Wait about 1 minute for it to set up

### Step 3 — Create the database tables
1. Click **SQL Editor** in the left sidebar
2. Click **New query**
3. Paste this and click **Run**:

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  from_user TEXT NOT NULL,
  to_user TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Step 4 — Get your keys
1. Click **Project Settings** (gear icon) → **API**
2. Copy and save these somewhere:
   - **Project URL** (like https://abcdefg.supabase.co)
   - **anon public** key (long string starting with eyJ...)

---

## PART 2 — Put Rockz on GitHub

### Step 5 — Create a GitHub account
Go to https://github.com and sign up (free, no card)

### Step 6 — Create a new repository
1. Click the **+** button top right → **New repository**
2. Name it `rockz`
3. Set it to **Public**
4. Click **Create repository**

### Step 7 — Upload the Rockz files
On the new repo page, click **uploading an existing file**
then drag and drop ALL the files from the rockz folder into it.
Click **Commit changes**.

---

## PART 3 — Launch Codespaces

### Step 8 — Open a Codespace
1. Go to your rockz repo on GitHub
2. Click the green **Code** button
3. Click the **Codespaces** tab
4. Click **Create codespace on main**
5. Wait about 1 minute — it opens VS Code in your browser!

### Step 9 — Add your Supabase keys
In the Codespace, you'll see a terminal at the bottom. Type:
```
cp .env.example .env
```
Then click on the `.env` file in the left panel and fill it in:
```
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_KEY=eyJyour_long_key_here
JWT_SECRET=any-random-words-you-want-123
```
Save the file (Ctrl+S).

### Step 10 — Start Rockz!
In the terminal at the bottom, type:
```
npm start
```

You'll see a popup saying "Port 3000 is available" — click **Open in Browser**
OR click the **Ports** tab at the bottom and click the globe icon next to port 3000.

### Step 11 — Make the URL public
1. Click the **Ports** tab at the bottom of Codespaces
2. Right-click on port 3000
3. Click **Port Visibility** → **Public**

Now anyone can use your Rockz URL! It looks like:
https://yourname-rockz-abc123.github.dev

---

## Every time you want to use Rockz

1. Go to https://github.com/codespaces
2. Click on your existing rockz codespace (don't create a new one each time!)
3. Wait for it to load
4. In the terminal: `npm start`
5. Click Open in Browser / make port public
6. Done!

---

## Tips to save your free hours

- Always **stop** your codespace when done (don't just close the tab)
  → Go to https://github.com/codespaces → click the three dots → Stop
- It auto-suspends after 30 minutes of inactivity anyway
- 60 hours/month = 2 hours per day — plenty for casual use
- Hours reset on the 1st of every month

---

## Notes
- The Codespace URL changes slightly each time you restart — share the new one
- Messages are saved in Supabase forever (even when Codespace is stopped)
- Calls work great while the Codespace is running
