begin;

-- The application intentionally exposes /admin without an admin login.
-- Supabase Anonymous Sign-Ins still provide auth.uid() for ownership fields,
-- learner progress, sessions and settings.

drop policy if exists "curriculum_insert_days" on public.study_days;
drop policy if exists "curriculum_update_days" on public.study_days;
drop policy if exists "curriculum_delete_days" on public.study_days;

drop policy if exists "curriculum_insert_words" on public.vocabularies;
drop policy if exists "curriculum_update_words" on public.vocabularies;
drop policy if exists "curriculum_delete_words" on public.vocabularies;

drop policy if exists "curriculum_insert_word_days" on public.vocabulary_days;
drop policy if exists "curriculum_update_word_days" on public.vocabulary_days;
drop policy if exists "curriculum_delete_word_days" on public.vocabulary_days;

drop policy if exists "open_content_insert_days" on public.study_days;
drop policy if exists "open_content_update_days" on public.study_days;
drop policy if exists "open_content_delete_days" on public.study_days;
drop policy if exists "open_content_insert_words" on public.vocabularies;
drop policy if exists "open_content_update_words" on public.vocabularies;
drop policy if exists "open_content_delete_words" on public.vocabularies;
drop policy if exists "open_content_insert_word_days" on public.vocabulary_days;
drop policy if exists "open_content_update_word_days" on public.vocabulary_days;
drop policy if exists "open_content_delete_word_days" on public.vocabulary_days;

create policy "open_content_insert_days" on public.study_days
for insert to authenticated
with check (user_id = (select auth.uid()));
create policy "open_content_update_days" on public.study_days
for update to authenticated using (true) with check (true);
create policy "open_content_delete_days" on public.study_days
for delete to authenticated using (true);

create policy "open_content_insert_words" on public.vocabularies
for insert to authenticated
with check (user_id = (select auth.uid()));
create policy "open_content_update_words" on public.vocabularies
for update to authenticated using (true) with check (true);
create policy "open_content_delete_words" on public.vocabularies
for delete to authenticated using (true);

create policy "open_content_insert_word_days" on public.vocabulary_days
for insert to authenticated
with check (user_id = (select auth.uid()));
create policy "open_content_update_word_days" on public.vocabulary_days
for update to authenticated using (true) with check (true);
create policy "open_content_delete_word_days" on public.vocabulary_days
for delete to authenticated using (true);

commit;

-- SECURITY NOTE:
-- Every visitor receives an anonymous authenticated session and can therefore
-- create, edit or delete shared curriculum through Supabase. Reintroduce an
-- admin policy before publishing this application to an untrusted audience.
