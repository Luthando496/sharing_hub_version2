-- Three sample study resources so the Browse page has more to show.
-- Run AFTER schema.sql, and after at least one account has signed up.
-- Paste into: Supabase dashboard -> SQL Editor -> New query -> Run.
--
-- * Credited to your admin/author account (or, if there is none, the oldest account).
-- * Safe to run more than once: rows that already exist are skipped.
-- * The files are public sample PDFs (not real course material), so every
--   download gives a small placeholder document. Replace them with real uploads
--   whenever you like. To remove these three rows later, run:
--       delete from public.resources where file_id like 'sample-%';

do $seed$
declare
  v_author uuid;
begin
  select id into v_author
    from public.profiles
   order by (role = 'admin') desc, (role = 'author') desc, created_at asc
   limit 1;

  if v_author is null then
    raise exception 'No accounts yet. Sign up on the site first, then run this again.';
  end if;

  insert into public.resources
    (author_id, title, description, category, type,
     file_url, file_id, file_name, file_size, file_type,
     thumbnail_url, downloads, created_at)
  select
    v_author, t.title, t.description, t.category, t.type,
    t.file_url, t.file_id, t.file_name, t.file_size, 'application/pdf',
    t.thumbnail_url, t.downloads, now() - t.age
  from (values
    ('Calculus I: Limits and Derivatives Cheat Sheet',
     'A two-page summary of limit laws, the power, product and chain rules, and worked examples for the most common test questions.',
     'Mathematics', 'Study Guide',
     'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
     'sample-calculus-cheat-sheet', 'calculus-limits-derivatives.pdf', 13264,
     'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=800',
     128, interval '12 days'),

    ('Python Basics: Loops, Lists and Functions',
     'Beginner notes with short code examples covering for and while loops, list operations and writing your first functions.',
     'Computer Science', 'Notes',
     'https://pdfobject.com/pdf/sample.pdf',
     'sample-python-basics', 'python-basics-notes.pdf', 18810,
     'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800',
     342, interval '6 days'),

    ('Organic Chemistry: Functional Groups Reference',
     'Quick-reference table of the main functional groups with structures, naming rules and typical reactions, handy for lab prep.',
     'Chemistry', 'Reference',
     'https://www.orimi.com/pdf-test.pdf',
     'sample-organic-chem-groups', 'functional-groups-reference.pdf', 20597,
     'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800',
     76, interval '2 days')
  ) as t(title, description, category, type,
         file_url, file_id, file_name, file_size,
         thumbnail_url, downloads, age)
  where not exists (
    select 1 from public.resources r where r.file_id = t.file_id
  );

  raise notice 'Sample resources added (existing ones were skipped).';
end
$seed$;

-- Check the result:
-- select title, category, type, downloads from public.resources order by created_at desc;
