-- Sample blog posts from eight faculties, so the blog has something to show.
-- Run AFTER schema.sql and blog.sql, and after at least one account has signed up.
-- Paste into: Supabase dashboard -> SQL Editor -> New query -> Run.
--
-- * All posts are credited to your admin/author account (or, if there is none,
--   the oldest account). Change v_author below to pick someone else.
-- * Safe to run more than once: posts that already exist are skipped.
-- * The text is made-up sample content. To remove it all later, run:
--       delete from public.posts where slug like '%-sample';

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

  insert into public.posts
    (author_id, title, subtitle, slug, content, cover_image_url,
     published, published_at, created_at, updated_at)
  values

  -- 1. Engineering ---------------------------------------------------------
  (v_author,
   'Inside the Robotics Lab: How First-Years Built a Working Rover',
   'Eight weeks, one borrowed workshop and a lot of solder. Here is how the Engineering rover project came together.',
   'engineering-robotics-rover-sample',
   $body$*Faculty of Engineering and the Built Environment*

When the first-year design module announced that every team would build a rover that could cross a rough obstacle course, most of us assumed it would be a paper exercise. It was not. Eight weeks later, fourteen teams rolled their machines into the workshop, and nine of them actually finished the course.

## Week one: more questions than answers

Our team of five started with a whiteboard and no idea how to size a motor. We learned quickly that a rover is a chain of small decisions: wheel diameter changes torque, torque changes battery life, and battery life changes how heavy the frame can be.

![Engineers reviewing a large structural frame](https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg?auto=compress&cs=tinysrgb&w=1400)

## What we would tell the next group

- **Test early, even with cardboard.** Our first chassis was cut from a packing box and it exposed three design flaws in one afternoon.
- **Label every wire.** Four hours of the final weekend went on tracing one loose connection.
- **Book the workshop in advance.** The 3D printers are free, but the queue is not.

> "The best moment was not the finish line. It was the first time the wheels turned and everything we had drawn actually moved."

## Want to join in?

The Engineering class reps are running a drop-in session every Thursday where second-years walk newcomers through the tools. No experience needed, just curiosity and closed shoes.$body$,
   'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=1600',
   true, now() - interval '3 days', now() - interval '3 days', now() - interval '3 days'),

  -- 2. Health Sciences -----------------------------------------------------
  (v_author,
   'Surviving Your First Clinical Rotation',
   'Practical advice from third-years who have been through the early shifts and the nerves.',
   'health-sciences-first-clinical-rotation-sample',
   $body$*Faculty of Health Sciences*

Your first clinical rotation is exciting, tiring and a little terrifying, often all before lunch. We asked third-year students what they wish someone had told them, and the same few answers kept coming up.

## Before you start

Pack the night before and check your uniform requirements twice. A comfortable pair of shoes matters more than anything else on your list. Learn the route to your placement and do the trip once at the same time of day you will travel.

## On the ward

1. **Introduce yourself to everyone.** Nurses, porters and cleaners all know things the textbooks do not.
2. **Ask before you act.** Confidence is good; guessing is not.
3. **Write things down.** Names, procedures and questions to look up later.

## Looking after yourself

Long shifts drain you. Eat real meals, drink water, and sleep. If something upsets you, talk to a supervisor or a class rep. Every student on your rotation has felt the same way at some point.

> "Nobody expects you to know everything. They expect you to be safe, curious and kind."

Your class reps are collecting rotation tips in a shared document. Send us yours and we will add them for the next intake.$body$,
   'https://images.pexels.com/photos/4778611/pexels-photo-4778611.jpeg?auto=compress&cs=tinysrgb&w=1600',
   true, now() - interval '9 days', now() - interval '9 days', now() - interval '9 days'),

  -- 3. Commerce ------------------------------------------------------------
  (v_author,
   'Making a Student Allowance Last the Whole Month',
   'A class rep''s no-nonsense guide to budgeting, from the first of the month to the thirtieth.',
   'commerce-student-budgeting-sample',
   $body$*Faculty of Commerce and Management*

Running out of money in week three is so common that some of us plan around it. It does not have to be that way. You do not need a finance degree to budget well, though if you are in our faculty you may as well practise what you study.

## Start with what comes in

Write down everything that arrives each month: allowance, bursary, part-time pay. Then list what must go out: rent, transport, data, food. What is left is your real spending money, and it is usually smaller than you think.

## A simple split

- **50% needs:** rent, food, transport
- **30% wants:** takeaways, outings, subscriptions
- **20% savings or debt:** even R100 builds the habit

Those numbers are a starting point. Adjust them to your situation, but keep the three groups.

## Small habits that add up

1. Check your bank balance every Sunday evening.
2. Cook in batches and share groceries with housemates.
3. Cancel subscriptions you forgot you had.
4. Use student discounts. Always ask.

## Free help

The Commerce faculty runs a free budgeting workshop each semester, and the SRC can point you to emergency funds if things get tight. Asking early is never embarrassing.$body$,
   'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=1600',
   true, now() - interval '15 days', now() - interval '15 days', now() - interval '12 days'),

  -- 4. Law -----------------------------------------------------------------
  (v_author,
   'Moot Court Season: What the Finalists Wish They Had Known',
   'Preparation tips, nerves and the one habit that separated the finalists from everyone else.',
   'law-moot-court-lessons-sample',
   $body$*Faculty of Law*

Moot court has a reputation for being intimidating, and it earns it. You stand up in front of a bench, a judge interrupts your best argument in the first thirty seconds, and you are expected to keep going. We spoke to this year's finalists about how they got through it.

## Know the record better than the other side

Every finalist said the same thing: read the case file until you can find any paragraph without searching. Judges can tell within minutes who has done the reading.

## Practise being interrupted

Most people rehearse a speech. The finalists rehearsed a conversation. They asked friends to cut in at random and then practised returning to their point without losing the thread.

## The habit that mattered

- **Write your answers to the five hardest questions** before you ever stand up.
- **Time yourself out loud**, not in your head.
- **Thank the bench**, even when a question feels like an attack.

> "A judge's question is not an obstacle. It is a gift telling you exactly what they need to be convinced."

## Getting involved

Next year's teams will be formed in the first month of term. If you are nervous, join as a researcher first. Many of this year's speakers started there.$body$,
   'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600',
   true, now() - interval '22 days', now() - interval '22 days', now() - interval '22 days'),

  -- 5. Humanities ----------------------------------------------------------
  (v_author,
   'Why the Humanities Festival Matters More Than Ever',
   'Three days of readings, debates and exhibitions, and how you can take part.',
   'humanities-festival-sample',
   $body$*Faculty of Humanities*

People like to ask what you can do with a humanities degree. Our answer is simple: you learn to read carefully, argue fairly and tell a story people want to hear. Those skills are useful everywhere, and the Humanities Festival is where we show them off.

## What is on

- **Open-mic readings** in the courtyard each lunchtime
- **A student debate** on whether history should be taught as a single story
- **An exhibition** of photography, zines and short films made by students across the faculty
- **Workshops** on writing for the web, interview technique and public speaking

## Who can take part

Anyone. You do not need to study literature, history or languages. Engineers have read poetry at past festivals, and a first-year from Science once won the debate.

## How to join

1. Pick something you want to share: a poem, a photograph, a question.
2. Send a short description to your faculty class rep.
3. Come to the planning meeting and meet the other contributors.

> "We are not trying to prove that the humanities matter. We are inviting everyone to feel it for three days."

Volunteers are also needed to set up, welcome visitors and run the registration table. Even an hour helps.$body$,
   'https://images.pexels.com/photos/5940721/pexels-photo-5940721.jpeg?auto=compress&cs=tinysrgb&w=1600',
   true, now() - interval '30 days', now() - interval '30 days', now() - interval '30 days'),

  -- 6. Science -------------------------------------------------------------
  (v_author,
   'Counting Bees: Our Citizen Science Project on Campus',
   'Faculty of Science students are surveying pollinators across the gardens, and you can join in.',
   'science-campus-bee-survey-sample',
   $body$*Faculty of Science*

Pollinators quietly keep a huge share of our food supply going, and nobody has properly counted them on campus. So the biology society decided to do it themselves. The survey is simple, takes about twenty minutes, and anyone can help.

## How the survey works

1. Choose a flowerbed and mark out a one-metre square.
2. Watch it for ten minutes and note every insect that lands on a flower.
3. Photograph anything you cannot identify.
4. Enter your counts into the shared sheet.

## What we have found so far

Early results show far more variety near the indigenous plantings than around the lawns. That supports something ecologists have long suggested: **diverse planting supports diverse wildlife.**

## Why it matters beyond campus

- Our data helps the grounds team decide where to plant next season.
- Students practise real field methods: sampling, recording and reporting.
- Everything we collect can feed into a national database for researchers.

> "Science is not only done in laboratories. Sometimes it is done kneeling next to a flowerbed with a stopwatch."

## Join a session

Sessions run on Wednesday afternoons. We provide ID guides and clipboards. Wear a hat and bring water, and do not worry if you cannot tell a hoverfly from a honeybee yet. Nobody can at first.$body$,
   'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1600',
   true, now() - interval '38 days', now() - interval '38 days', now() - interval '31 days'),

  -- 7. Education -----------------------------------------------------------
  (v_author,
   'Your First Week in a Real Classroom',
   'What practicum students learn in the first five days, and how to prepare.',
   'education-first-week-classroom-sample',
   $body$*Faculty of Education*

Years of lectures and lesson plans lead to one moment: you walk into a classroom full of children who are looking at you, waiting. Here is what students who have just finished their first practicum week would like you to know.

## Day one is about listening

You are not expected to teach on the first day. Watch how your mentor teacher greets the class, handles transitions and deals with noise. Write down what works.

![Children working together on a creative activity](https://images.pexels.com/photos/8612990/pexels-photo-8612990.jpeg?auto=compress&cs=tinysrgb&w=1400)

## Learn names fast

Make a seating plan and use it. Children notice when you remember their names, and it makes managing the room much easier.

## Plan more than you need

- Have a short extra activity ready for when the lesson finishes early.
- Prepare your materials the night before.
- Keep your instructions to one step at a time.

## Be kind to yourself

Your first lessons will not be perfect. That is fine. Ask your mentor for one thing to improve each day and one thing you did well.

> "The children do not need a flawless teacher. They need a patient one who is glad to see them."

If you are about to start your placement, come to the Education class reps' lunchtime chat. Third-years will share their lesson plans and answer your questions.$body$,
   'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1600',
   true, now() - interval '46 days', now() - interval '46 days', now() - interval '46 days'),

  -- 8. Information Technology ---------------------------------------------
  (v_author,
   'Hackathon Weekend: 36 Hours, 12 Teams, One Winner',
   'A recap of the IT hackathon, and what the winning team did differently.',
   'it-hackathon-recap-sample',
   $body$*Faculty of Information Technology*

Thirty-six hours, a lot of coffee and twelve teams with one goal: build something useful for students. This year's hackathon produced a study planner, a lost-and-found app, a campus bus tracker and a few projects we are still trying to explain.

## The winning idea

The winners built a tool that turns a course outline into a personal study timetable. You enter your test dates, and it spreads revision across the weeks, automatically leaving room for rest days.

![A laptop and devices on a desk during the event](https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=1400)

## What they did differently

1. **They picked one problem.** Several teams tried to build five features. The winners built one and polished it.
2. **They tested with real students** on Saturday afternoon and changed the design before dinner.
3. **They practised the demo.** Their three-minute pitch had a clear problem, a live demo and a next step.

## Tips for next year

- Form a team with different skills: design, backend, frontend and someone who enjoys presenting.
- Sleep. The teams that stayed up all night were the ones whose demos crashed.
- Use free tools and templates rather than building everything from scratch.

> "We did not win because we wrote the most code. We won because we solved a problem we had ourselves."

Beginners were welcome and several first-years placed in the top five. Registration for next year opens at the start of second semester, and the IT class reps will share the dates on the blog.$body$,
   'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=1600',
   true, now() - interval '1 day', now() - interval '1 day', now() - interval '1 day')

  on conflict (slug) do nothing;

  raise notice 'Sample posts added (existing ones were skipped).';
end
$seed$;

-- Check the result:
-- select title, slug, published_at from public.posts order by published_at desc;
