---
name: think
description: Structured problem breakdown using the best mentor-question frameworks. Forces ruthless self-honesty through GROW, Seven Coaching Questions (Bungay Stanier), 5/10 Whys, Reflective Inquiry loops (Reynolds), Reframe-Before-Solve (HBR), Cole Jaczko's 22 purpose questions, Jason Cohen break-your-brain questions, Osaretin founder whys, BambuluMen 10-why protocol, Thieblot's 3 daily questions, Nick Huber street scanner, Purpose/Mission/Vision trio, Eisenhower matrix. Use when overwhelmed, stuck on a decision, doubting a goal, hunting a root cause, or zooming out on the business. Triggers on "/think", "think this through", "break this down", "I'm overwhelmed", "help me decide", "what should I do about X", "pressure test this", "dig into this", "am I chasing the right thing", "too many things happening", "I'm stuck".
trigger: /think
---

# /think - Scenario Breakdown

The point: every time the user is overwhelmed, stuck, or uncertain, route them through the right mentor-question framework instead of improvising. Pick one flow, run it fully, end with an action.

## Invocation

```
/think                                   # opens with Bungay Stanier kickstart: "What's on your mind?"
/think <problem in natural language>     # skip kickstart, go straight to triage
```

## Rules

1. **One question at a time** unless the flow explicitly says "give the list to answer async" (only Flow C Cole Jaczko 22 does this).
2. **"What" not "why" for emotion-adjacent questions** (Reynolds: "why" triggers defence).
3. **Loop the core question 3-5 times** per Reynolds. First answer is reactive. Real answer sits 3 layers down.
4. **End every session** with the Learning Question: "What was most useful from this?"
5. **Do not write to the vault by default.** Session is ephemeral. Only save if the user says "capture this" or "save this" - then write summary to `<vault>/memory/YYYY-MM-DD.md` and append action items to `<vault>/Inbox.md`.
6. Follow the voice rules in the repo `CLAUDE.md`. No em dashes, no AI cliches.

## Triage gate (ask ONE question to route)

After the kickstart answer, pick the flow:

| Matt says... | Flow |
|-----|-----|
| "too much happening", "losing track", "overwhelmed", "drowning" | **Flow A - Overwhelm triage** |
| "should I X or Y", "stuck on a decision", "not sure which way" | **Flow B - Decision pressure-test** |
| "is this even what I want", "am I chasing the right thing", "lost my why" | **Flow C - Goal fidelity** |
| "thing keeps breaking", "same issue every week", "need root cause" | **Flow D - Root cause** |
| "am I thinking too small", "what am I missing", "zoom me out" | **Flow E - Founder zoom-out** |

If unclear after one routing question, default to **Flow A**.

---

## Flow A - Overwhelm triage

**When to use:** business has too many things happening, mental RAM full, cannot see what matters.

### Step 1: Bungay Stanier three anchors (one at a time, wait for answer between each)

1. **Kickstart:** What's on your mind? (if not already answered)
2. **Focus:** What's the real challenge here for you? (ask this 2-3 times if the first answer is surface-level)
3. **Foundation:** What do you want?

### Step 2: Eisenhower dump

Ask: "List every thing pulling at your attention right now. Don't filter. I'll sort them."

Then sort into 4 quadrants:
- **Q1 Urgent + Important** → do today
- **Q2 Not Urgent + Important** → schedule
- **Q3 Urgent + Not Important** → delegate or kill
- **Q4 Not Urgent + Not Important** → delete

Push back if Q1 has more than 3 items - it doesn't.

### Step 3: Strategic Question

"If you're saying yes to [top Q1 item], what are you saying no to this week?"

Make the no explicit. Write it down.

### Step 4: Learning Question

"What was most useful from this breakdown?"

---

## Flow B - Decision pressure-test

**When to use:** stuck between options, need to commit.

### Step 1: Full GROW pass

**G - Goal**
- What do you want to achieve here?
- What does success look like?
- How will you know you've got it?

**R - Reality**
- What's really going on right now?
- What have you tried so far?
- What's the evidence for what you just said?
- Who else is involved?

**O - Options**
- What could you do?
- What else? (AWE question - repeat 3 times)
- What would you do if you had unlimited time and money?
- What have you seen work in similar situations?

**W - Will**
- Which option are you picking?
- On 1-10, how committed are you?
- What would take that number to 10?
- When exactly will you start?

### Step 2: Jason Cohen break-your-brain (run the chosen option through these)

1. If you could only ship one thing this year, what would it be?
2. What if you charged 10x more?
3. What if competitors copied everything tomorrow - what's left?
4. What if you had to ship a complete MVP in 2 weeks?
5. What would you change if consequences didn't matter?
6. What's the one thing that could kill your company?
7. What if you optimised entirely for the customer's outcome?

The question Matt doesn't want to answer is where his real goal hides. Dig there.

### Step 3: Learning Question.

---

## Flow C - Goal fidelity

**When to use:** doubting whether the goal is actually Matt's, or borrowed from X / influencer noise / society.

### Step 1: Osaretin's 5 founder whys (one at a time)

Applied to whatever goal Matt names:

1. Why this?
2. Why do you think **you** are the best person to do this?
3. Why do you think this is the best way to do it?
4. Why now?
5. Why not something else?

Any answer that is wobbly, rehearsed, or vague = flag it. Come back to it after step 2.

### Step 2: BambuluMen 10-why chain

"Pick the goal. I'm going to ask Why? ten times. Real burning desires survive the chain. Fake ones collapse by the 5th."

Ask literally "Why?" after every answer. Ten iterations. If Matt hits bedrock early (runs out of real answers), the goal is borrowed.

### Step 3: Cole Jaczko's 22 (async list)

This one breaks the one-question rule. Present the full list. Tell Matt: "Go for a long walk. Answer all 22 brutally honestly. Come back."

> **Precursor:** Guarantee yourself all the financial success you're after. Now: what do you actually want to do? Be specific. What emails are you writing? What meetings? With whom?

1. What matters most to you?
2. Who do you want to be?
3. How do you want to spend your time?
4. How DON'T you want to spend your time?
5. What gives you the most energy?
6. What do you think money gives you, and why?
7. How rich do you want to be?
8. How do you plan to balance making money vs time / youth / experiences?
9. What would you be doing if money wasn't a thing?
10. What would you do if you knew you couldn't fail?
11. What is your superpower?
12. What will you regret not doing on your deathbed?
13. If you weren't doing what you're doing right now, what would you be doing?
14. What motivates you? Why?
15. What's your $X amount where you consider yourself "set"? Why?
16. If you had to work on something for the next 10 years, what would it be?
17. What's stopping you?
18. What have you thought about every day of the past year? Those are your passions. Follow them.
19. What would you do differently today if your older self time-travelled to you?
20. What are you most grateful for?
21. What was the best day of your life?
22. What is your biggest dream? What did you dream of as a kid?

### Step 4: Mentor check

"Are you satisfied that you've set up a version of success that is solely defined by you - not by X, not by your peers, not by what you think you should want?"

### Step 5: Learning Question.

---

## Flow D - Root cause

**When to use:** same problem keeps recurring, surface fixes not holding.

### Step 1: State the symptom

"In one sentence, what's the thing that keeps happening?"

### Step 2: 5 Whys

Ask Why? literally five times. Don't accept "because that's just how it is". If an answer is a symptom rather than a cause, flag it and keep digging.

Example pattern:
- Symptom: clients keep churning after month 3
- Why 1? Onboarding doesn't set expectations
- Why 2? We haven't written the onboarding script
- Why 3? We change the offer every 2 weeks so the script would go stale
- Why 4? We haven't locked the offer because we're still testing positioning
- Why 5? We skipped doing customer research before launching
- Root: missing customer research, not missing onboarding doc

### Step 3: HBR Reframe

"Before you solve this, generate three alternate framings of what the problem actually is. Use:"

- **What if...?** (remove a constraint - what if we had unlimited budget / 10x the team / one month to live)
- **How might we...?** (invite options rather than solutions)
- **Who is this a problem for, really?** (is it the customer, Matt, the team, the investor?)

Pick whichever reframe feels most honest. Solve that one.

### Step 4: Strategic Question + Will (what will you do, by when, how will you know it worked)

### Step 5: Learning Question.

---

## Flow E - Founder zoom-out

**When to use:** suspicion of thinking too small, need to check ambition level and positioning.

### Step 1: Purpose / Mission / Vision trio

- **Purpose:** Why do we exist?
- **Mission:** What do we do, and how?
- **Vision:** What will the future look like if we succeed?

All three. Matt answers each in 2 sentences max.

### Step 2: Thieblot's 3 daily questions

1. How ambitious is my idea?
2. Do I have the right team, and am I in the right place?
3. How can I go even faster?

### Step 3: Nick Huber street scanner

"Pick a real business near you right now - a cafe, a shop, a service. Walk through it mentally. Answer:"

- How does this make money?
- Revenue estimate? Employees? Costs? Startup cost? Rent? Profit estimate?
- How would **I** run it better?

Apply the same lens to Matt's own business as if he were the outsider walking in for the first time. What would he see?

### Step 4: Learning Question.

---

## Output contract

**Default:** nothing written. Session is ephemeral. User walks away with clarity, not a file.

**On "capture this" or "save this":**

1. Append one-liner to today's journal (`<install-path>/memory/YYYY-MM-DD.md`):
   ```
   - /think session: <flow name> on <topic>. Decision: <action>.
   ```

2. Write full session log to `<vault>/Log-think-YYYY-MM-DD.md` (or equivalent per the active vault taxonomy) with frontmatter:
   ```yaml
   ---
   type: log
   tags: [think, breakdown, <flow-specific>]
   date: YYYY-MM-DD
   ---
   ```

3. Append any action items to `<vault>/Inbox.md` with `#todo`.

4. Never hallucinate wikilinks. Only link to notes that exist.

## Telegram availability

Auto-discovered by the nello-claw Telegram daemon. After install, restart the daemon to pick it up:

```bash
launchctl kickstart -k gui/$UID/com.nello-claw.server
```

On Telegram, trigger phrases like "I'm overwhelmed", "break this down", "help me think through X" will fire this skill.

## Why this matters

Per [[Wiki-Concept-Build-Research-Base-First]], Nath's #1 advice: build the system so every repeat task produces comparable output on a consistent workflow. `/think` is the mentor-questioning equivalent of `/research`. Without it, Matt is improvising his own self-coaching every time a scenario gets heavy. With it, each breakdown runs the same proven flow and compounds via the Journal + Inbox loop.

## Related skills

- **`/research`** - the web/QMD equivalent. Use when the question is external ("what does Haynes say about X").
- **`/process-dumps`** - use when Matt has already dumped raw thoughts to `Dumps/` and wants structure.
- **`/checkpoint`** - use at the end of a heavy session to save state before clearing context.
