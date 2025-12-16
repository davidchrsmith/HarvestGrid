# HarvestGrid Setup Guide

## Security Notice
**NEVER commit your `.env.local` file to GitHub!** It contains sensitive API keys and database credentials.

## Environment Variables Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Get your Supabase credentials:**
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy your Project URL and anon/public key
   
3. **Fill in `.env.local` with your actual values**

4. **In v0:** All environment variables are automatically provided via the Vars section

5. **When deploying to Vercel:**
   - Go to your project settings
   - Add all environment variables from `.env.local`
   - Or connect your Supabase integration for automatic setup

## What Each Variable Does

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL (safe to expose in browser)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key (safe to expose, has RLS protection)
- `SUPABASE_SERVICE_ROLE_KEY` - **NEVER expose this in client code!** Server-only for admin operations
- `NEXT_PUBLIC_SITE_URL` - Your production domain (use localhost for development)

## Database Setup

Run the SQL scripts in order (001-014) in your Supabase SQL editor to create all necessary tables.
