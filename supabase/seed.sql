insert into public.articles (
  title,
  subtitle,
  slug,
  excerpt,
  category,
  tags,
  author_name,
  hero_image_alt,
  status,
  featured,
  read_time_minutes,
  seo_title,
  seo_description,
  content_blocks,
  published_at
) values
(
  'The Lead Leg Is Not Just a Brace',
  'A placeholder exploration of how force, timing, and trunk position can shape a pitcher''s delivery.',
  'the-lead-leg-is-not-just-a-brace',
  'Placeholder article copy for demonstrating how a dense pitching concept can become visual, readable, and coachable.',
  'Pitching',
  array['pitching', 'lead leg', 'force'],
  'TJ Galenti',
  'Abstract pitching biomechanics motion map',
  'published',
  true,
  4,
  'The Lead Leg Is Not Just a Brace',
  'Placeholder pitching biomechanics article for the TJ Galenti editorial platform.',
  '[
    {"id":"lead-heading","type":"heading","level":2,"text":"Placeholder: what the lead leg is doing"},
    {"id":"lead-paragraph","type":"paragraph","text":"This is intentionally fake placeholder content. Replace it with TJ''s actual explanation of lead-leg timing, pelvis deceleration, trunk organization, and how those pieces show up in athlete-specific assessments."},
    {"id":"lead-takeaway","type":"key_takeaway","title":"Practical takeaway","body":"Placeholder: the goal is not to copy a visual position. The goal is to understand whether the movement solves the athlete''s delivery problem."},
    {"id":"lead-data","type":"data_callout","eyebrow":"Example callout","title":"Metrics need context","body":"Placeholder copy for a metric explanation. This should become a TJ-authored interpretation of what matters, what does not, and what changes the training decision.","stats":[{"label":"Window","value":"Fake","context":"demo only"},{"label":"Signal","value":"Contextual","context":"not a claim"}]}
  ]'::jsonb,
  now()
),
(
  'What Hip-Shoulder Separation Actually Means',
  'A placeholder article for making a commonly repeated phrase more precise.',
  'what-hip-shoulder-separation-actually-means',
  'Demo content showing how a biomechanics article can separate useful coaching language from oversimplified cues.',
  'Biomechanics',
  array['biomechanics', 'rotation', 'sequencing'],
  'TJ Galenti',
  'Abstract rotational sequencing chart',
  'published',
  false,
  3,
  'What Hip-Shoulder Separation Actually Means',
  'Placeholder biomechanics article for the TJ Galenti editorial platform.',
  '[
    {"id":"hip-heading","type":"heading","level":2,"text":"Placeholder: define the phrase before coaching it"},
    {"id":"hip-body","type":"paragraph","text":"This placeholder section should be replaced with TJ''s actual framework. It exists only to show typography, spacing, and block rendering for a technical article."},
    {"id":"hip-note","type":"biomech_note","title":"Biomech note","body":"Placeholder expert note. Use this format for nuance, caveats, and athlete-specific interpretation."}
  ]'::jsonb,
  now()
),
(
  'Why Swing Decisions Start Before the Swing',
  'A placeholder hitting piece about perception, timing, and movement options.',
  'why-swing-decisions-start-before-the-swing',
  'Demo article copy for a hitting category card, built to be replaced by TJ''s real writing and visuals.',
  'Hitting',
  array['hitting', 'decision-making', 'timing'],
  'TJ Galenti',
  'Abstract hitting decision timeline',
  'published',
  false,
  3,
  'Why Swing Decisions Start Before the Swing',
  'Placeholder hitting article for the TJ Galenti editorial platform.',
  '[
    {"id":"swing-heading","type":"heading","level":2,"text":"Placeholder: decisions are movement problems"},
    {"id":"swing-body","type":"paragraph","text":"This is placeholder copy. The final article should explain the real concept with examples, visuals, and constraints that make the training decision clearer."},
    {"id":"swing-list","type":"bullet_list","items":["Placeholder constraint","Placeholder visual cue","Placeholder training question"]}
  ]'::jsonb,
  now()
)
on conflict (slug) do nothing;
