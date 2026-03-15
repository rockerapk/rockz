# Deploy Rockz to Glitch + Supabase (Free, No Card!)

You need two free accounts: Supabase (database) and Glitch (hosting).
Both are free and neither requires a credit card.

---

## PART 1 — Set up Supabase (your database)

### Step 1 — Create a Supabase account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (free, no card)

### Step 2 — Create a new project
1. Click "New project"
2. Name it `rockz`
3. Set a database password (save it somewhere)
4. Choose a region close to you
5. Click "Create new project" — wait about 1 minute

### Step 3 — Create the database tables
1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Paste this SQL and click **Run**:

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

### Step 4 — Get your Supabase keys
1. Click **Project Settings** (gear icon) in the left sidebar
2. Click **API**
3. Copy these two values (you'll need them soon):
   - **Project URL** (looks like: https://abcdefgh.supabase.co)
   - **anon public** key (a long string starting with "eyJ...")

---

## PART 2 — Deploy on Glitch

### Step 5 — Create a Glitch account
1. Go to https://glitch.com
2. Sign in with GitHub (free, no card)

### Step 6 — Import Rockz into Glitch
1. Click **New project** → **Import from GitHub**
2. If you have Rockz on GitHub already, paste the repo URL
   - OR: Click **New project** → **glitch-hello-node** to start fresh,
     then manually upload the files

   **Easiest way — use Glitch's terminal:**
   1. Create a new project → **glitch-hello-node**
   2. Click **Tools** → **Terminal**
   3. Run these commands one by one:
      ```
      rm -rf *
      git clone https://github.com/YOURUSERNAME/rockz.git .
      refresh
      ```

### Step 7 — Add your Supabase keys to Glitch
This is the most important step!

1. In your Glitch project, click on the **.env** file in the left sidebar
2. Add these lines (replace with your actual values from Step 4):
   ```
   SUPABASE_URL=https://abcdefgh.supabase.co
   SUPABASE_KEY=eyJyourverylongkeyhere...
   JWT_SECRET=pick-any-random-words-here-123
   ```
3. Glitch saves this automatically — these are secret and nobody else can see them

### Step 8 — Set the start command
1. Open the `glitch.json` file (or create it) and make sure it says:
   ```json
   {
     "install": "npm install",
     "start": "node server/index.js"
   }
   ```

### Step 9 — Open your app!
1. Click **Share** in the top right
2. Copy your Live Site URL (looks like: https://rockz-sparkly-cat.glitch.me)
3. Open it — you should see the Rockz login screen!

---

## Using Rockz

- Register an account on your computer
- Register a different account on your phone
- Find each other in the user list and start chatting!
- Messages are saved to Supabase forever — even if Glitch restarts

---

## Notes

- Glitch sleeps after 5 min of no activity — first load after sleep takes ~15 seconds
- Once awake, it stays on as long as someone is using it
- Calls will NOT drop mid-call due to sleeping (the app stays awake while in use)
- To keep it awake longer: go to glitch.com and open your project page occasionally
