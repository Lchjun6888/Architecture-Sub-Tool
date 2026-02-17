---
description: ArchSub Supabase Database & Auth Integration Workflow
---

# ArchSub x Supabase Integration Workflow 🏗️

This workflow guides you through connecting Supabase for Authentication, User Profiles, and Usage Tracking.

## Phase 1: Supabase Tooling Setup
1. **Install Dependencies**
   // turbo
   `npm install @supabase/supabase-js`

2. **Initialize Supabase Client**
   - Create `src/lib/supabaseClient.js`
   - Add Supabase URL and Anon Key to `.env` file.

## Phase 2: Database Schema (SQL)
Run these queries in the Supabase SQL Editor:
```sql
-- Profiles table linked to Auth.users
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  plan_type text default 'free',
  updated_at timestamp with time zone
);

-- Usage statistics
create table usage_stats (
  user_id uuid references auth.users primary key,
  files_processed int default 0,
  lines_split int default 0,
  time_saved_minutes float default 0
);

-- Activity Logs
create table activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  action_type text,
  file_name text,
  created_at timestamp with time zone default now()
);
```

## Phase 3: Auth UI Implementation
1. Create `src/components/Auth.jsx` using Supabase Auth UI or a custom form.
2. Update `App.jsx` to handle session state:
   - If session exists: Show `DashboardLayout`
   - If no session: Show `LandingPage` (with Login button)

## Phase 4: Connecting the Dashboard (The "Jay Admin" replacement)
1. **Overview Data**: Fetch `usage_stats` and `profiles` in `DashboardOverview.jsx`.
2. **Settings**: Bind input fields to `profiles` table for real-time updates.
3. **Daily Logs**: Fetch `activity_logs` ordered by `created_at`.

## Phase 5: Production Sync
1. Set up LemonSqueezy Webhooks to update the `profiles.plan_type` to 'pro' upon successful payment.
2. Push final changes to GitHub.
