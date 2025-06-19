# PrepAI Project Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Development Workflow](#development-workflow)
7. [Production Deployment](#production-deployment)

## Prerequisites
- Node.js v18+
- npm v9+
- PostgreSQL 14+
- Supabase account

## Environment Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/prepAI.git
   cd prepAI
   ```

2. Create environment files:
   ```bash
   cp .env.example .env
   touch .env.test
   ```

3. Set up Supabase:
   - Create new project in Supabase dashboard
   - Enable required extensions (pgvector, pg_trgm)
   - Get project URL and anon key

## Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize database schema:
   ```bash
   npx prisma migrate dev
   ```

## Configuration
### Environment Variables
Configure `.env` file with these required variables:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Database Configuration
DATABASE_URL=postgres://user:password@localhost:5432/prepai
```

### Test Configuration
Configure `.env.test` for testing:
```bash
NODE_ENV=test
DATABASE_URL=postgres://user:password@localhost:5432/prepai_test
```

## Testing
1. Run unit tests:
   ```bash
   npm test
   ```

2. Run integration tests:
   ```bash
   npm run test:integration
   ```

## Development Workflow
1. Start development server:
   ```bash
   npm run dev
   ```

2. Access the application:
   ```bash
   open http://localhost:3000
   ```

## Production Deployment
1. Build the application:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

3. Configure process manager (PM2 recommended):
   ```bash
   pm2 start npm --name "prepai" -- start