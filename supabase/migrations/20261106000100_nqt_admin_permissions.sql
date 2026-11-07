begin;

alter table public.study_days enable row level security;
alter table public.vocabularies enable row level security;
alter table public.vocabulary_days enable row level security;
alter table public.word_progress enable row level security;
alter table public.study_sessions enable row level security;
alter table public.user_settings enable row level security;

-- Permissive policies combine with OR. Remove every old policy on app tables
-- before installing the complete NQT policy set.
do $$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('study_days','vocabularies','vocabulary_days','word_progress','study_sessions','user_settings')
  loop
    execute format('drop policy if exists %I on %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
  end loop;
end $$;

create policy "curriculum_read_days" on public.study_days
for select to authenticated using (true);
create policy "open_content_insert_days" on public.study_days
for insert to authenticated with check (user_id = (select auth.uid()));
create policy "open_content_update_days" on public.study_days
for update to authenticated using (true) with check (true);
create policy "open_content_delete_days" on public.study_days
for delete to authenticated using (true);

create policy "curriculum_read_words" on public.vocabularies
for select to authenticated using (true);
create policy "open_content_insert_words" on public.vocabularies
for insert to authenticated with check (user_id = (select auth.uid()));
create policy "open_content_update_words" on public.vocabularies
for update to authenticated using (true) with check (true);
create policy "open_content_delete_words" on public.vocabularies
for delete to authenticated using (true);

create policy "curriculum_read_word_days" on public.vocabulary_days
for select to authenticated using (true);
create policy "open_content_insert_word_days" on public.vocabulary_days
for insert to authenticated with check (user_id = (select auth.uid()));
create policy "open_content_update_word_days" on public.vocabulary_days
for update to authenticated using (true) with check (true);
create policy "open_content_delete_word_days" on public.vocabulary_days
for delete to authenticated using (true);

-- Remove only composite foreign keys from word_progress to vocabularies.
-- Keep unrelated constraints intact.
do $$
declare
  constraint_row record;
begin
  for constraint_row in
    select conname
    from pg_constraint
    where conrelid = 'public.word_progress'::regclass
      and confrelid = 'public.vocabularies'::regclass
      and contype = 'f'
      and array_length(conkey, 1) > 1
  loop
    execute format('alter table public.word_progress drop constraint %I', constraint_row.conname);
  end loop;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.word_progress'::regclass
      and confrelid = 'public.vocabularies'::regclass
      and contype = 'f'
      and array_length(conkey, 1) = 1
  ) then
    alter table public.word_progress
      add constraint word_progress_vocabulary_id_fkey
      foreign key (vocabulary_id) references public.vocabularies(id) on delete cascade;
  end if;
end $$;

create policy "progress_read_self" on public.word_progress
for select to authenticated using (user_id = (select auth.uid()));
create policy "progress_insert_self" on public.word_progress
for insert to authenticated with check (user_id = (select auth.uid()));
create policy "progress_update_self" on public.word_progress
for update to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
create policy "progress_delete_self" on public.word_progress
for delete to authenticated using (user_id = (select auth.uid()));

create policy "sessions_read_self" on public.study_sessions
for select to authenticated using (user_id = (select auth.uid()));
create policy "sessions_insert_self" on public.study_sessions
for insert to authenticated with check (user_id = (select auth.uid()));
create policy "sessions_update_self" on public.study_sessions
for update to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
create policy "sessions_delete_self" on public.study_sessions
for delete to authenticated using (user_id = (select auth.uid()));

create policy "settings_read_self" on public.user_settings
for select to authenticated using (user_id = (select auth.uid()));
create policy "settings_insert_self" on public.user_settings
for insert to authenticated with check (user_id = (select auth.uid()));
create policy "settings_update_self" on public.user_settings
for update to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
create policy "settings_delete_self" on public.user_settings
for delete to authenticated using (user_id = (select auth.uid()));

-- Atomic progress update prevents lost updates between tabs.
create or replace function public.apply_word_progress(p_vocabulary_id uuid, p_is_correct boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  learner_id uuid := auth.uid();
begin
  if learner_id is null then
    raise exception 'authentication required';
  end if;
  if not exists (select 1 from public.vocabularies where id = p_vocabulary_id) then
    raise exception 'vocabulary not found';
  end if;

  insert into public.word_progress (
    user_id, vocabulary_id, correct_count, incorrect_count,
    mastery_level, last_reviewed_at, next_review_at
  ) values (
    learner_id, p_vocabulary_id,
    case when p_is_correct then 1 else 0 end,
    case when p_is_correct then 0 else 1 end,
    case when p_is_correct then 1 else 0 end,
    now(), now() + interval '1 day'
  )
  on conflict (user_id, vocabulary_id) do update set
    correct_count = public.word_progress.correct_count + case when p_is_correct then 1 else 0 end,
    incorrect_count = public.word_progress.incorrect_count + case when p_is_correct then 0 else 1 end,
    mastery_level = case when p_is_correct
      then least(5, public.word_progress.mastery_level + 1)
      else greatest(0, public.word_progress.mastery_level - 1)
    end,
    last_reviewed_at = now(),
    next_review_at = now() + case
      when not p_is_correct then interval '1 day'
      when public.word_progress.mastery_level + 1 >= 5 then interval '30 days'
      when public.word_progress.mastery_level + 1 = 4 then interval '14 days'
      when public.word_progress.mastery_level + 1 = 3 then interval '7 days'
      when public.word_progress.mastery_level + 1 = 2 then interval '3 days'
      else interval '1 day'
    end;
end;
$$;

revoke all on function public.apply_word_progress(uuid, boolean) from public;
grant execute on function public.apply_word_progress(uuid, boolean) to authenticated;

grant select, insert, update, delete on public.study_days, public.vocabularies, public.vocabulary_days to authenticated;
grant select, insert, update, delete on public.word_progress, public.study_sessions, public.user_settings to authenticated;

commit;

-- Audit after migration:
-- select schemaname, tablename, policyname, roles, cmd, qual, with_check
-- from pg_policies where schemaname = 'public' order by tablename, policyname;
