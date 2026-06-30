import type { Article } from "@/lib/types";

const now = new Date().toISOString();

export const demoArticles: Article[] = [
  {
    id: "demo-lead-leg",
    title: "The Lead Leg Is Not Just a Brace",
    subtitle: "A placeholder exploration of how force, timing, and trunk position can shape a pitcher's delivery.",
    slug: "the-lead-leg-is-not-just-a-brace",
    excerpt:
      "Placeholder article copy for demonstrating how a dense pitching concept can become visual, readable, and coachable.",
    category: "Pitching",
    tags: ["pitching", "lead leg", "force"],
    author_name: "TJ Galenti",
    hero_image_url: null,
    hero_image_alt: "Abstract pitching biomechanics motion map",
    status: "published",
    featured: true,
    read_time_minutes: 4,
    seo_title: null,
    seo_description: null,
    content_blocks: [
      {
        id: "lead-heading",
        type: "heading",
        level: 2,
        text: "Placeholder: what the lead leg is doing"
      },
      {
        id: "lead-paragraph",
        type: "paragraph",
        text:
          "This is intentionally fake placeholder content. Replace it with TJ's actual explanation of lead-leg timing, pelvis deceleration, trunk organization, and how those pieces show up in athlete-specific assessments."
      },
      {
        id: "lead-takeaway",
        type: "key_takeaway",
        title: "Practical takeaway",
        body:
          "Placeholder: the goal is not to copy a visual position. The goal is to understand whether the movement solves the athlete's delivery problem."
      },
      {
        id: "lead-data",
        type: "data_callout",
        eyebrow: "Example callout",
        title: "Metrics need context",
        body:
          "Placeholder copy for a metric explanation. This should become a TJ-authored interpretation of what matters, what does not, and what changes the training decision.",
        stats: [
          { label: "Window", value: "Fake", context: "demo only" },
          { label: "Signal", value: "Contextual", context: "not a claim" }
        ]
      }
    ],
    published_at: now,
    created_at: now,
    updated_at: now
  },
  {
    id: "demo-hip-shoulder",
    title: "What Hip-Shoulder Separation Actually Means",
    subtitle: "A placeholder article for making a commonly repeated phrase more precise.",
    slug: "what-hip-shoulder-separation-actually-means",
    excerpt:
      "Demo content showing how a biomechanics article can separate useful coaching language from oversimplified cues.",
    category: "Biomechanics",
    tags: ["biomechanics", "rotation", "sequencing"],
    author_name: "TJ Galenti",
    hero_image_url: null,
    hero_image_alt: "Abstract rotational sequencing chart",
    status: "published",
    featured: false,
    read_time_minutes: 3,
    seo_title: null,
    seo_description: null,
    content_blocks: [
      {
        id: "hip-heading",
        type: "heading",
        level: 2,
        text: "Placeholder: define the phrase before coaching it"
      },
      {
        id: "hip-body",
        type: "paragraph",
        text:
          "This placeholder section should be replaced with TJ's actual framework. It exists only to show typography, spacing, and block rendering for a technical article."
      },
      {
        id: "hip-note",
        type: "biomech_note",
        title: "Biomech note",
        body:
          "Placeholder expert note. Use this format for nuance, caveats, and athlete-specific interpretation."
      }
    ],
    published_at: now,
    created_at: now,
    updated_at: now
  },
  {
    id: "demo-swing-decisions",
    title: "Why Swing Decisions Start Before the Swing",
    subtitle: "A placeholder hitting piece about perception, timing, and movement options.",
    slug: "why-swing-decisions-start-before-the-swing",
    excerpt:
      "Demo article copy for a hitting category card, built to be replaced by TJ's real writing and visuals.",
    category: "Hitting",
    tags: ["hitting", "decision-making", "timing"],
    author_name: "TJ Galenti",
    hero_image_url: null,
    hero_image_alt: "Abstract hitting decision timeline",
    status: "published",
    featured: false,
    read_time_minutes: 3,
    seo_title: null,
    seo_description: null,
    content_blocks: [
      {
        id: "swing-heading",
        type: "heading",
        level: 2,
        text: "Placeholder: decisions are movement problems"
      },
      {
        id: "swing-body",
        type: "paragraph",
        text:
          "This is placeholder copy. The final article should explain the real concept with examples, visuals, and constraints that make the training decision clearer."
      },
      {
        id: "swing-list",
        type: "bullet_list",
        items: ["Placeholder constraint", "Placeholder visual cue", "Placeholder training question"]
      }
    ],
    published_at: now,
    created_at: now,
    updated_at: now
  }
];
