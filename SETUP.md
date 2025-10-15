# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Set Up Authentication (Clerk)

1. Go to https://clerk.com and create a free account
2. Create a new application
3. Copy your keys:
   - Go to **API Keys** in the sidebar
   - Copy `CLERK_SECRET_KEY`
   - Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
4. Update `.env` file with these keys

### Step 2: Set Up Database

**Option A: Use Supabase (Recommended - Free)**

1. Go to https://supabase.com
2. Create a new project
3. Wait for database to initialize (~2 minutes)
4. Go to **Settings** > **Database**
5. Copy the **Connection String** (under Connection Pooling)
6. Update `.env` with:
   ```
   DATABASE_URL="your-connection-string"
   DATABASE_DIRECT_URL="your-connection-string"
   ```
7. Enable pgvector:
   - Go to **Database** > **Extensions**
   - Search for "vector" and enable it

**Option B: Use Local PostgreSQL**

```bash
# Install PostgreSQL
brew install postgresql@15  # macOS
# or
sudo apt-get install postgresql-15  # Ubuntu

# Start PostgreSQL
brew services start postgresql@15  # macOS
# or
sudo systemctl start postgresql  # Ubuntu

# Create database
createdb synapse

# Enable vector extension
psql synapse
CREATE EXTENSION vector;
\q
```

Update `.env`:
```
DATABASE_URL="postgresql://your-username@localhost:5432/synapse"
```

### Step 3: Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### Step 4: Generate Encryption Key

```bash
# On Linux/macOS
openssl rand -base64 32

# Copy the output and update ENCRYPTION_MASTER_KEY in .env
```

### Step 5: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 and sign up!

## 🎯 What You Can Do Now

✅ **Sign up and create an account** (via Clerk)
✅ **Create your first Golden Thread**
✅ **View the dashboard**
✅ **Explore the tRPC API** (fully type-safe)

## 🔧 Optional Enhancements

### Add Redis (for caching and rate limiting)

```bash
# Install Redis
brew install redis  # macOS
sudo apt-get install redis  # Ubuntu

# Start Redis
brew services start redis  # macOS
sudo systemctl start redis  # Ubuntu

# Update .env
REDIS_URL="redis://localhost:6379"
```

### Add AI Features

Get API keys:
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/settings/keys

Update `.env`:
```
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
```

## 📊 Database Management

```bash
# View database in browser
npx prisma studio

# Create a migration (for production)
npx prisma migrate dev --name init

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## 🐛 Troubleshooting

### "prisma generate failed"
```bash
npm install @prisma/client
npx prisma generate
```

### "Cannot connect to database"
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Test connection: `psql "your-connection-string"`

### "Clerk keys not working"
- Ensure you copied the correct keys
- Check there are no extra spaces
- Restart dev server after updating .env

### "Port 3000 already in use"
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## 📚 Next Steps

1. **Add Integrations**: Start with GitHub (easiest)
2. **Build UI Components**: Dashboard, thread cards
3. **Connect Real Tools**: Link your actual Figma/Linear accounts
4. **Set Up Webhooks**: For real-time updates

Check the main [README.md](./README.md) for full documentation!
