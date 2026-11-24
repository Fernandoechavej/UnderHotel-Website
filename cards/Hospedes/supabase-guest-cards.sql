create table if not exists public.guest_cards (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    status text not null default 'pending'
        check (status in ('pending', 'approved')),
    character_name text not null
        check (char_length(btrim(character_name)) between 1 and 80),
    ficha_text text not null default ''
        check (char_length(ficha_text) <= 12000),
    creator_name text not null default ''
        check (char_length(creator_name) <= 40),
    image_url text not null default ''
        check (image_url = '' or image_url ~ '^https://'),
    age text not null default ''
        check (char_length(age) <= 30),
    species text not null default ''
        check (char_length(species) <= 60),
    appearance text not null default ''
        check (char_length(appearance) <= 500),
    personality text not null default ''
        check (char_length(personality) <= 500),
    powers text not null default ''
        check (char_length(powers) <= 500),
    backstory text not null default ''
        check (char_length(backstory) <= 1000)
);

alter table public.guest_cards
    add column if not exists ficha_text text not null default ''
    check (char_length(ficha_text) <= 12000);

alter table public.guest_cards enable row level security;

drop policy if exists "Anyone can read approved guest cards" on public.guest_cards;
create policy "Anyone can read approved guest cards"
    on public.guest_cards
    for select
    to anon
    using (status = 'approved');

drop policy if exists "Anyone can submit pending guest cards" on public.guest_cards;
create policy "Anyone can submit pending guest cards"
    on public.guest_cards
    for insert
    to anon
    with check (status = 'pending');

grant select, insert on public.guest_cards to anon;
