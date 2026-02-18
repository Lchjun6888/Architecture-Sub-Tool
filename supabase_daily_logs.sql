-- Create daily_logs table
create table public.daily_logs (
  id bigint not null,
  user_id uuid references auth.users not null,
  date date not null,
  content jsonb default '{}'::jsonb,
  total_days integer default 0,
  current_day integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public.daily_logs enable row level security;

-- Create policies
create policy "Users can view their own logs"
on public.daily_logs for select
using (auth.uid() = user_id);

create policy "Users can insert their own logs"
on public.daily_logs for insert
with check (auth.uid() = user_id);

create policy "Users can update their own logs"
on public.daily_logs for update
using (auth.uid() = user_id);

create policy "Users can delete their own logs"
on public.daily_logs for delete
using (auth.uid() = user_id);
