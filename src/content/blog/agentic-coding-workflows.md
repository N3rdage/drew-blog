---
title: 'Agentic coding workflows: the context is the codebase'
description: 'The most valuable artifact in an AI-first project is not the code the agent writes. It is the context you maintain for it.'
pubDate: 'Jun 04 2026'
heroImage: '../../assets/hero-images/agentic-coding-hero.png'
---

I'm building two projects almost entirely AI-first at the moment, and the thing that has surprised me is not how much code the agent writes. It's where the real work moved to.

The work moved into context.

When you pair with a coding agent every day, the bottleneck stops being "can it write the function" and becomes "does it know what we already decided, what done looks like, and which of the forty things in my head is actually next." That's not a model problem. That's a documentation-and-discipline problem — which, after a couple of decades shipping software in regulated environments, is a problem I already knew how to solve. It just has a new name.

## The repo is the operating system

I keep a single private repo that acts as the source of truth for everything — the plan, the decisions, the positioning, the app spec. The rule written at the top of it is blunt: *if it's not here, it doesn't exist.* The README is the anchor. When I lose the thread, I go back to it. When the agent loses the thread, I point it back to it.

That last part is the whole trick. A good agentic workflow starts every task by reading the canonical state before doing anything, and prefers the source of truth over whatever stale snapshot it was handed. The instruction I give is close to:

> The canonical source of truth is this repo. Files in your context may be stale. Before relying on the plan or decisions, fetch the current README and DECISIONS, plus whichever file the task touches, and prefer them over the snapshot.

That one paragraph removes an entire category of failure — the agent confidently acting on something I changed last week.

## Done looks like: \_\_\_

I track work as GitHub Issues, and nothing interesting gets started without a clear completion statement. The contract is simple: before you begin anything, you have to be able to fill in the blank.

```markdown
## Done looks like:
- [ ] First real post published to silly.ninja
- [ ] hello-world heroImage schema bug fixed (build passes `astro check`)
- [ ] RSS feed validates

Label: phase-1-now
```

If I can't write the "done looks like" line, the task isn't ready. It gets labelled `rabbit-hole` and parked — good idea, wrong time — rather than derailing the afternoon. This is an ADHD-shaped guardrail dressed up as engineering hygiene, and it works on the agent for the same reason it works on me: an underspecified goal is an invitation to wander.

## Decisions get logged, not remembered

The other half is a decisions log. Every meaningful choice gets a dated entry with the options considered, what I picked, the reason, and the condition that would make me revisit it:

```markdown
### App stack
**Date:** 2026-04-29
**Options considered:** Remix + Supabase, Next.js (App Router) + Supabase
**Chosen:** Next.js (App Router) + Supabase
**Reason:** Larger ecosystem, well-documented pairing, resume-legible
without a real learning-curve penalty for a solo dev juggling contracts.
**Revisit if:** App Router fundamentally changes, or Remix becomes dominant.
```

In a regulated SaMD context you do this because traceability is the job — you have to show why a thing is the way it is. In an AI-first project you do it because the agent has no memory between sessions, and "why did we choose this" is the most expensive question to re-answer from scratch. Same artifact, two reasons, both good.

## Agents don't excuse you from the standards — they raise the stakes

The temptation with a fast agent is to let quality slide because output is cheap. I've made the opposite a standing rule: best engineering practice wins by default, and any shortcut has to be named as tech debt *at the moment it's introduced*, not retrofitted into the story later. An agent will happily generate a plausible shortcut and never mention the cost. You have to be the one who keeps the ledger honest.

## What I'm still figuring out

I don't have a clean answer yet for how much context is too much — there's a real cost to a 700-line instruction file, and I suspect a lot of mine is dead weight. I'm also still working out where the memory files themselves should live, and how public to make them. The direction of travel is public; the timing is a decision I haven't logged yet.

If you want to watch the experiment unfold, the projects are under [github.com/N3rdage](https://github.com/N3rdage). More soon.
