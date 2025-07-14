-- Create comments table
create table if not exists public.comments (
    id uuid default gen_random_uuid() primary key,
    photo_id uuid not null references public.photos(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.comments enable row level security;

-- Create policies
create policy "Comments are viewable by everyone."
    on public.comments for select
    using (true);

create policy "Users can insert their own comments."
    on public.comments for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own comments."
    on public.comments for update
    using (auth.uid() = user_id);

create policy "Users can delete their own comments."
    on public.comments for delete
    using (auth.uid() = user_id);

-- Create indexes
create index comments_photo_id_idx on public.comments(photo_id);
create index comments_user_id_idx on public.comments(user_id);