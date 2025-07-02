# AI Interview Prep Platform

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/prepai.git
   ```

2. Install dependencies:
   ```bash
   cd prepai
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Development Setup

### Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Configure required environment variables in `.env`:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Optional Development Variables
   ```

3. Verify all required variables are set:
   ```bash
   npm run check-env
   ```

### Testing Configuration

1. Set up test environment variables:
   ```bash
   echo "NODE_ENV=test" >> .env.test
   ```

2. Run the test suite:
   ```bash
   npm test
   ```

### Application Execution

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Access the application at:
   ```bash
   open http://localhost:3000
   ```

## Production Configuration

### CI/CD Pipeline Setup

1. Add these secrets to your CI/CD environment:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Example GitHub Actions configuration:
   ```yaml
   env:
     NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
     NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
     NODE_ENV: production
   ```

## Verification Checklist

1. Validate environment configuration:
   ```bash
   npm run validate-config
   ```

2. Test application startup without `.env` file:
   ```bash
   rm -f .env && npm run dev
   ```

3. Verify production build:
   ```bash
   npm run build && npm start
   ```