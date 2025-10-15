# Self-Hosted Synapse (Zero External Dependencies)

If you want to run Synapse completely self-hosted without Clerk or Supabase, here's how:

## Architecture: Fully Self-Hosted

```
Your Infrastructure:
├── Application Server (Next.js)
├── PostgreSQL Database (local/VPS)
├── Redis (local/VPS)
├── Authentication (built-in)
└── File Storage (local/S3-compatible)
```

---

## Option 1: Replace Clerk with NextAuth.js

### Step 1: Install NextAuth

```bash
npm install next-auth
npm install @auth/prisma-adapter
```

### Step 2: Update Environment

```env
# Remove Clerk keys, add:
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"

# Email provider (for passwordless login)
EMAIL_SERVER="smtp://user:pass@smtp.example.com:587"
EMAIL_FROM="noreply@yourdomain.com"

# Or OAuth providers (still need these API keys)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

### Step 3: Authentication Implementation

We'd need to:
1. Create NextAuth configuration
2. Add session management to tRPC
3. Build login/signup UI
4. Add password hashing
5. Email verification system

**Time to implement:** ~1 week
**Complexity:** Medium

---

## Option 2: Fully Custom Authentication

Build everything from scratch:

### Features to Implement:

1. **User Registration**
   - Email/password signup
   - Password strength validation
   - Email verification tokens
   - Rate limiting

2. **Login System**
   - Secure password hashing (bcrypt)
   - Session tokens (JWT)
   - Refresh tokens
   - Remember me functionality

3. **Security Features**
   - CSRF protection
   - Brute force protection
   - Session management
   - Password reset flows

**Time to implement:** ~2-3 weeks
**Complexity:** High
**Risk:** Security vulnerabilities if not done perfectly

---

## Option 3: Replace Supabase with Local PostgreSQL

### Step 1: Install PostgreSQL Locally

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql@15

# Start service
sudo systemctl start postgresql  # Linux
brew services start postgresql@15  # macOS
```

### Step 2: Create Database & User

```bash
# Create database
sudo -u postgres createdb synapse

# Create user
sudo -u postgres psql
CREATE USER synapse_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE synapse TO synapse_user;

# Enable pgvector
\c synapse
CREATE EXTENSION vector;
\q
```

### Step 3: Update .env

```env
DATABASE_URL="postgresql://synapse_user:your_secure_password@localhost:5432/synapse"
DATABASE_DIRECT_URL="postgresql://synapse_user:your_secure_password@localhost:5432/synapse"
```

**Time to setup:** ~30 minutes
**Complexity:** Low
**This is actually recommended for production on your own VPS!**

---

## Complete Self-Hosted Stack

### Infrastructure You'll Need:

1. **Application Server**
   - VPS/Dedicated Server (DigitalOcean, Hetzner, AWS EC2)
   - 4GB+ RAM, 2+ CPU cores
   - Cost: ~$20-50/month

2. **Database Server** (can be same VPS)
   - PostgreSQL 15+
   - Regular backups (pg_dump automation)
   - Cost: Included in VPS

3. **Redis Server** (can be same VPS)
   - For caching and rate limiting
   - Cost: Included in VPS

4. **File Storage**
   - MinIO (S3-compatible, self-hosted)
   - Or use filesystem directly
   - Cost: Included in VPS

### Total Cost: ~$20-50/month
### Setup Time: ~1 day
### Maintenance: You handle updates, backups, security

---

## Recommended Approach: Hybrid

**Best of both worlds:**

```
Development:
├── Database: Local PostgreSQL (free)
├── Auth: Clerk (free tier, fast to set up)
└── Storage: Local filesystem

Staging:
├── Database: Supabase (free tier, easy backups)
├── Auth: Clerk (free tier, no maintenance)
└── Storage: Cloudflare R2 ($0.015/GB)

Production:
├── Database: Self-hosted PostgreSQL on VPS
├── Auth: Self-hosted NextAuth or custom
└── Storage: Self-hosted MinIO or S3
```

---

## Why Use External Services (Our Current Setup)?

### 1. **Speed to Market**
- Get to production in days, not months
- Focus on your unique features (Golden Threads)
- Not on commodity infrastructure

### 2. **Free Tiers**
- Clerk: Free up to 10,000 monthly active users
- Supabase: Free up to 500MB database
- Vercel: Free hosting for small projects

### 3. **Enterprise Features**
- Clerk includes: SSO, MFA, social logins, user management UI
- Supabase includes: Backups, monitoring, connection pooling
- Would take months to build yourself

### 4. **Security**
- These companies have security teams
- Regular audits and compliance
- Automatic security updates

### 5. **Scalability**
- Automatic scaling
- No ops work required
- Pay only for what you use

---

## Migration Path

Start with managed services → Migrate to self-hosted later:

### Phase 1: Launch (Month 1-3)
Use Clerk + Supabase to **get to market fast**

### Phase 2: Growth (Month 4-6)
Stay on managed services, focus on **user acquisition**

### Phase 3: Scale (Month 6+)
When you have **revenue and users**, migrate to:
- Self-hosted PostgreSQL
- Custom auth or NextAuth
- Own infrastructure

**Why?** By then you'll have:
- Revenue to pay for infrastructure
- Users to justify the effort
- Data to know what you actually need

---

## I Can Build Either Approach

**Option A: Keep current setup (Clerk + Supabase)**
- ✅ Fast to market
- ✅ Free to start
- ✅ Production-ready immediately
- ⏱️ Ready to run in 5 minutes

**Option B: Fully self-hosted**
- ✅ No external dependencies
- ✅ Full control
- ⚠️ More complex
- ⏱️ Ready in 1-2 weeks

**What would you prefer?**

1. Stick with Clerk/Supabase for now (get to market fast)
2. Build custom auth + use local PostgreSQL (full control)
3. Hybrid approach (local DB + Clerk for now)

I can implement any of these options!
