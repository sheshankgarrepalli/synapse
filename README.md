# Synapse - Enterprise Integration Platform

> **Golden Threads** connecting design and development tools to eliminate context switching

Synapse is an enterprise-grade integration platform that connects 8 best-in-class tools (Figma, Linear, GitHub, Slack, Notion, Zoom, Dovetail, Mixpanel) through persistent, intelligent "Golden Threads" - maintaining complete project context from user research through deployed code.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)

## ✨ Features

### Core Features

- **Golden Threads**: Persistent connections across all 8 tools
- **AI Semantic Search**: Natural language queries across your entire product history
- **Visual Automation Builder**: No-code workflows with pre-built templates
- **Real-time Collaboration**: Live presence, comments, and updates
- **Universal Dashboard**: Single view of all connected tools
- **Smart Insights**: AI-powered pattern detection and recommendations

### Integrations (8 Tools)

1. **Figma** - Design files and prototypes
2. **Linear** - Issues and project tracking
3. **GitHub** - Code, PRs, and releases
4. **Slack** - Messages and conversations
5. **Notion** - Documentation and wikis
6. **Zoom** - Meetings and recordings
7. **Dovetail** - User research insights
8. **Mixpanel** - Analytics and metrics

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **tRPC** - End-to-end type-safe APIs
- **React Query** - Server state management
- **Zustand** - Client state management

### Backend
- **Next.js API Routes** - Serverless functions
- **tRPC v10** - Type-safe API layer
- **Prisma 5** - Database ORM
- **PostgreSQL 15** - Primary database
- **Redis** - Caching and rate limiting
- **Socket.io** - Real-time WebSocket server

### AI & ML
- **OpenAI** - Embeddings (text-embedding-3-small)
- **Anthropic Claude** - Complex queries and summaries
- **pgvector** - Vector similarity search

### Infrastructure
- **Vercel** - Frontend hosting (free tier)
- **Railway/DigitalOcean** - Backend services ($90-180/mo)
- **Supabase/Neon** - PostgreSQL database ($0-69/mo)
- **Cloudflare R2** - Object storage ($30/mo)
- **Upstash Redis** - Caching ($0-10/mo)

**Total Infrastructure Cost**: $130-355/month (Month 1-3)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL 15+ (local or hosted)
- Redis (optional but recommended)
- Git

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd synapse
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Environment Variables](#environment-variables))

4. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# (Optional) Seed the database
npm run db:seed
```

5. **Start development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🗄 Database Setup

### Local PostgreSQL

```bash
# Install PostgreSQL
brew install postgresql@15  # macOS
# or
sudo apt-get install postgresql-15  # Ubuntu

# Create database
createdb synapse

# Enable pgvector extension
psql synapse
CREATE EXTENSION vector;
```

### Hosted PostgreSQL (Recommended)

**Option 1: Supabase (Free tier available)**

1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Enable pgvector extension from Database > Extensions

**Option 2: Neon (Free tier available)**

1. Sign up at [neon.tech](https://neon.tech)
2. Create new project
3. Get connection string
4. pgvector is pre-installed

## 🔐 Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/synapse"
DATABASE_DIRECT_URL="postgresql://user:password@localhost:5432/synapse"

# Auth (Clerk)
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENCRYPTION_MASTER_KEY="<generate with: openssl rand -base64 32>"
NODE_ENV="development"
```

### Optional Variables

```bash
# Redis (for caching and rate limiting)
REDIS_URL="redis://localhost:6379"

# AI (for semantic search)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Storage (Cloudflare R2)
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="synapse-dev"

# Integrations (OAuth - get from respective platforms)
FIGMA_CLIENT_ID="..."
FIGMA_CLIENT_SECRET="..."
LINEAR_CLIENT_ID="..."
LINEAR_CLIENT_SECRET="..."
GITHUB_APP_ID="..."
GITHUB_PRIVATE_KEY="..."
SLACK_CLIENT_ID="..."
SLACK_CLIENT_SECRET="..."
NOTION_CLIENT_ID="..."
NOTION_CLIENT_SECRET="..."
ZOOM_CLIENT_ID="..."
ZOOM_CLIENT_SECRET="..."
```

## 💻 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
npm run db:push      # Push Prisma schema to database
npm run db:migrate   # Create migration
npm run db:studio    # Open Prisma Studio
npm run websocket    # Start WebSocket server (separate terminal)
```

### Development Workflow

1. **Backend Changes**: Edit files in `src/server/api/routers/`
2. **Frontend Changes**: Edit files in `src/pages/` or `src/components/`
3. **Database Changes**: Edit `prisma/schema.prisma` then run `npm run db:push`
4. **Type Safety**: tRPC automatically syncs types between frontend and backend

### Database Management

```bash
# View database in browser
npm run db:studio

# Create a migration
npm run db:migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## 🚢 Deployment

### 1. Vercel (Frontend)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### 2. Railway (Backend Services)

1. Sign up at [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Add environment variables
4. Deploy automatically on push

### 3. Database (Supabase/Neon)

Already set up in [Database Setup](#database-setup)

### 4. Storage (Cloudflare R2)

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Create R2 bucket
3. Generate API tokens
4. Add credentials to environment variables

## 📁 Project Structure

```
synapse/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   │   ├── prisma.ts         # Database client
│   │   ├── cache.ts          # Redis caching
│   │   ├── encryption.ts     # Token encryption
│   │   └── utils.ts          # Helper functions
│   ├── pages/                 # Next.js pages
│   │   ├── api/              # API routes
│   │   │   └── trpc/         # tRPC endpoint
│   │   ├── index.tsx         # Home page
│   │   ├── _app.tsx          # App wrapper
│   │   └── _document.tsx     # HTML document
│   ├── server/               # Backend logic
│   │   └── api/
│   │       ├── routers/      # tRPC routers
│   │       │   ├── threads.ts      # Golden Threads
│   │       │   ├── items.ts        # Connected Items
│   │       │   ├── comments.ts     # Comments
│   │       │   ├── search.ts       # Search
│   │       │   ├── integrations.ts # Integrations
│   │       │   ├── automations.ts  # Automations
│   │       │   ├── organizations.ts
│   │       │   └── analytics.ts
│   │       ├── root.ts       # Root router
│   │       └── trpc.ts       # tRPC config
│   ├── styles/               # CSS files
│   │   └── globals.css
│   └── utils/                # Frontend utilities
│       └── api.ts            # tRPC client
├── websocket-server/         # WebSocket server
│   └── index.ts
├── .env.example              # Environment template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── README.md
```

## 📚 API Documentation

### tRPC Routers

All API routes are type-safe through tRPC. Access them via the `api` object:

```typescript
import { api } from '@/utils/api';

// Use in React components
const { data, isLoading } = api.threads.list.useQuery({
  limit: 20,
  status: 'in_progress',
});

// Mutations
const createThread = api.threads.create.useMutation({
  onSuccess: () => {
    // Handle success
  },
});

createThread.mutate({
  title: 'New Feature',
  description: 'Building checkout flow',
  tags: ['checkout', 'payments'],
});
```

### Available Routers

- `api.threads.*` - Golden Thread management
- `api.items.*` - Connected item management
- `api.comments.*` - Comment system
- `api.search.*` - Semantic search
- `api.integrations.*` - Integration management
- `api.automations.*` - Automation workflows
- `api.organizations.*` - Organization settings
- `api.analytics.*` - Analytics and metrics

## 🏗 Implementation Timeline

### Weeks 1-2: Foundation ✅
- [x] Infrastructure setup
- [x] Database schema
- [x] Authentication
- [x] Basic Next.js app
- [x] tRPC API layer

### Weeks 3-4: Core Features
- [ ] Golden Thread CRUD
- [ ] Dashboard UI
- [ ] Thread timeline view
- [ ] Real-time updates

### Weeks 5-6: Tier 1 Integrations
- [ ] GitHub OAuth + webhooks
- [ ] Slack OAuth + webhooks
- [ ] Linear OAuth + webhooks
- [ ] Connected items sync

### Weeks 7-8: Tier 2 + AI
- [ ] Figma integration
- [ ] Notion integration
- [ ] Semantic search (embeddings)
- [ ] AI insights

### Weeks 9-10: Tier 3 + Automation
- [ ] Zoom, Dovetail, Mixpanel
- [ ] Visual automation builder
- [ ] Automation engine
- [ ] Pre-built templates

### Weeks 11-12: Polish & Launch
- [ ] Security hardening
- [ ] Performance optimization
- [ ] Onboarding flow
- [ ] Production deployment

## 📝 License

Proprietary - All rights reserved

## 🤝 Contributing

This is a private project. Contact the team for contribution guidelines.

## 📧 Support

For questions or support, contact: [your-email@example.com]

---

**Built with ❤️ using Next.js, tRPC, and Prisma**
