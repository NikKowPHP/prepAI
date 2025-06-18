# AI Interview Prep Platform

## Setup Instructions

### Environment Configuration

1. Create a `.env` file in the root directory by copying the example:
   ```
   cp .env.example .env
   ```

2. Add your Supabase credentials to the `.env` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. For development, you can use the example file as a reference:
   ```
   cat .env.example
   ```

### Running the Application

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open your browser and navigate to http://localhost:3000

## CI/CD Configuration

To add Supabase credentials to your CI/CD pipeline:

1. In your CI/CD service (e.g., GitHub Actions, GitLab CI), add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Reference these variables in your CI/CD configuration file:
   ```yaml
   env:
     NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
     NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}