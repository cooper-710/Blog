"use client";

import { FormEvent, useMemo, useState } from "react";
import { SITE_CONTACT_EMAIL } from "@/lib/site-copy";

const initialValues = {
  name: "",
  email: "",
  phone: "",
  role: "",
  organization: "",
  level: "",
  focus: "",
  timeline: "",
  message: ""
};

type FormValues = typeof initialValues;

function formatBody(values: FormValues) {
  return [
    "Work With TJ Inquiry",
    "",
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    `Phone: ${values.phone || "Not provided"}`,
    `Role: ${values.role || "Not provided"}`,
    `Athlete / Team / Organization: ${values.organization || "Not provided"}`,
    `Level: ${values.level || "Not provided"}`,
    `Primary Focus: ${values.focus || "Not provided"}`,
    `Timeline: ${values.timeline || "Not provided"}`,
    "",
    "Notes:",
    values.message || "Not provided"
  ].join("\n");
}

export function WorkInquiryForm() {
  const [values, setValues] = useState<FormValues>(initialValues);

  const mailtoHref = useMemo(() => {
    const subjectName = values.name.trim() || "New Inquiry";
    const subject = `Work With TJ inquiry from ${subjectName}`;
    return `mailto:${SITE_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formatBody(values))}`;
  }, [values]);

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.href = mailtoHref;
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[34px] border border-stone/80 bg-paper p-5 shadow-soft sm:p-7">
      <div className="rounded-[28px] border border-stone/70 bg-ivory/70 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Intake Sheet</p>
        <h2 className="mt-3 font-serif text-4xl leading-tight text-ink text-balance">What is your inquiry?</h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-charcoal">
            Name
            <input
              required
              value={values.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="focus-ring rounded-2xl border border-stone bg-ivory px-4 py-3 text-base font-normal text-ink outline-none transition focus:border-teal"
              placeholder="Your name"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-charcoal">
            Email
            <input
              required
              type="email"
              value={values.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="focus-ring rounded-2xl border border-stone bg-ivory px-4 py-3 text-base font-normal text-ink outline-none transition focus:border-teal"
              placeholder="you@example.com"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-charcoal">
            Phone
            <input
              value={values.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className="focus-ring rounded-2xl border border-stone bg-ivory px-4 py-3 text-base font-normal text-ink outline-none transition focus:border-teal"
              placeholder="Optional"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-charcoal">
            I am a
            <select
              value={values.role}
              onChange={(event) => updateField("role", event.target.value)}
              className="focus-ring rounded-2xl border border-stone bg-ivory px-4 py-3 text-base font-normal text-ink outline-none transition focus:border-teal"
            >
              <option value="">Select one</option>
              <option>Athlete</option>
              <option>Parent</option>
              <option>Coach</option>
              <option>Team / Organization</option>
              <option>Agent / Advisor</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-charcoal">
            Athlete / Team / Organization
            <input
              value={values.organization}
              onChange={(event) => updateField("organization", event.target.value)}
              className="focus-ring rounded-2xl border border-stone bg-ivory px-4 py-3 text-base font-normal text-ink outline-none transition focus:border-teal"
              placeholder="Name, team, or group"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-charcoal">
            Level
            <select
              value={values.level}
              onChange={(event) => updateField("level", event.target.value)}
              className="focus-ring rounded-2xl border border-stone bg-ivory px-4 py-3 text-base font-normal text-ink outline-none transition focus:border-teal"
            >
              <option value="">Select one</option>
              <option>MLB / Pro</option>
              <option>College</option>
              <option>High School</option>
              <option>Youth</option>
              <option>Coach / Staff</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-charcoal">
            Primary Focus
            <select
              value={values.focus}
              onChange={(event) => updateField("focus", event.target.value)}
              className="focus-ring rounded-2xl border border-stone bg-ivory px-4 py-3 text-base font-normal text-ink outline-none transition focus:border-teal"
            >
              <option value="">Select one</option>
              <option>Pitching</option>
              <option>Hitting</option>
              <option>Throwing</option>
              <option>Strength / Training</option>
              <option>Biomechanics Assessment</option>
              <option>Mocap</option>
              <option>Team Consulting</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-charcoal">
            Timeline
            <select
              value={values.timeline}
              onChange={(event) => updateField("timeline", event.target.value)}
              className="focus-ring rounded-2xl border border-stone bg-ivory px-4 py-3 text-base font-normal text-ink outline-none transition focus:border-teal"
            >
              <option value="">Select one</option>
              <option>As soon as possible</option>
              <option>Next few weeks</option>
              <option>Offseason planning</option>
              <option>Just gathering info</option>
            </select>
          </label>
        </div>

        <label className="mt-4 grid gap-2 text-sm font-semibold text-charcoal">
          What should TJ know?
          <textarea
            value={values.message}
            onChange={(event) => updateField("message", event.target.value)}
            className="focus-ring min-h-36 resize-y rounded-2xl border border-stone bg-ivory px-4 py-3 text-base font-normal leading-7 text-ink outline-none transition focus:border-teal"
            placeholder="Goals, current issues, links to video, team context, or anything else useful."
          />
        </label>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="focus-ring inline-flex w-fit rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory shadow-[0_16px_36px_rgba(17,17,17,0.14)] transition duration-200 hover:-translate-y-0.5 hover:bg-clay"
          >
            Send Email
          </button>
        </div>
      </div>
    </form>
  );
}
