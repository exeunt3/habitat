# Living Ecosystem Visualization — Claude Code Build Prompts

Use these prompts sequentially in Claude Code. Each prompt builds on the previous work. Wait for each to complete before moving to the next.

---

## Prompt 1: Project Scaffolding

```
Create a new full-stack project called "living-ecosystem" with the following structure:

- Frontend: React + TypeScript + Vite
- 3D Engine: React Three Fiber (@react-three/fiber) + drei (@react-three/drei)
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL with Prisma ORM
- Monorepo structure with /client and /server directories

Set up the following Prisma schema:
- Deployment: id, name, theme (string), questions (JSON array), submissionFrequency (enum: DAILY, WEEKLY), decayRate (float), driftSpeed (float), createdAt
- Token: id, deploymentId, token (unique string), issued (boolean default true), used (boolean default false), createdAt
- Response: id, deploymentId, token (string), answers (JSON - array of {questionIndex, value}), submittedAt
- SideQuest: id, deploymentId, title, description, deadline (datetime), completed (boolean), completedAt (nullable), createdAt
- User: id, email, deploymentId, role (enum: MEMBER, MANAGER), createdAt

Include scripts for dev, build, and database migration. Install all dependencies. Initialize the database and run migrations.
```

---

## Prompt 2: Blind Token Anonymity System

```
In the living-ecosystem project, build the blind token anonymity system in the server:

The flow:
1. Authenticated user hits POST /api/tokens/request with their JWT
2. Server checks if this user already has an unused token for the current cycle (week). If yes, return error.
3. Server generates a cryptographically random token (crypto.randomUUID), stores it in the Token table with NO reference to the user ID. Only stores deploymentId, token string, and timestamps.
4. Server marks in a separate CycleParticipation table (userId, deploymentId, cycleId) that this user has received a token this cycle. This table knows WHO got a token but NOT which token.
5. Returns the token to the client.

Then for submission:
1. POST /api/responses/submit — accepts {token, answers} with NO auth headers
2. Server validates the token exists, belongs to the deployment, and is unused
3. Stores the response with the token (for dedup only), marks token as used
4. Returns success

The key property: there is no join possible between CycleParticipation (which has userId) and Token/Response (which has the token string). They are architecturally unlinkable.

Also implement a cycle calculation utility that determines the current cycle ID based on deployment frequency (weekly = ISO week number + year).

Write tests for the full flow confirming unlinkability.
```

---

## Prompt 3: Aggregation Engine

```
In the living-ecosystem project, build the aggregation engine as a server module at /server/src/engine/aggregation.ts:

The engine exposes a function getCurrentState(deploymentId) that returns the current visual parameter values.

Logic:
1. Fetch all responses for the current cycle and previous N cycles (configurable, default 4 weeks)
2. For each question, collect all response values (1-10 scale)
3. Apply trimmed mean: sort values, drop top 10% and bottom 10%, average the rest
4. Apply temporal weighting: current cycle responses have weight 1.0, previous cycle 0.7, two cycles ago 0.4, three cycles ago 0.2
5. Apply decay: if no responses exist for the current cycle, multiply the previous state by a decay factor (configurable, default 0.95 per day since last response)
6. Normalize final values to 0.0-1.0 range

The output shape:
{
  deploymentId: string,
  timestamp: ISO string,
  parameters: {
    [questionIndex: number]: {
      name: string,
      value: number, // 0.0 to 1.0
      trend: "rising" | "falling" | "stable",
      responseCount: number
    }
  },
  overallHealth: number, // 0.0 to 1.0, average of all parameters
  activeSideQuests: SideQuest[],
  completedSideQuestsThisCycle: SideQuest[]
}

Create an API endpoint GET /api/state/:deploymentId that returns this.

Also create a simple in-memory cache that recalculates every 5 minutes (the "quick drift" — state changes within the hour but not instantly).
```

---

## Prompt 4: Authentication and User Management

```
In the living-ecosystem project, build authentication:

- Magic link email auth (use nodemailer with a configurable SMTP transport, default to console logging the link in dev)
- POST /api/auth/request — takes email, finds user, generates a time-limited token (15 min), "sends" magic link
- GET /api/auth/verify/:token — validates token, returns JWT
- JWT contains userId, deploymentId, role (MEMBER or MANAGER)
- Middleware that protects routes requiring auth

Manager-only routes:
- POST /api/sidequests — create a side quest
- PATCH /api/sidequests/:id/complete — mark complete
- GET /api/admin/participation — returns how many users have submitted this cycle (count only, no identities of who said what)

Member routes:
- POST /api/tokens/request (from prompt 2)
- GET /api/state/:deploymentId (public, no auth required actually — anyone with the URL can view the tank)

Build a simple deployment seeding script that creates a deployment with the three MVP questions ("How meaningful does your work feel right now?", "How connected do you feel to the people you work with?", "How confident are you that the company is heading in the right direction?"), and seeds 5-10 test users with emails.
```

---

## Prompt 5: Feedback Form UI

```
In the living-ecosystem client, build the feedback submission flow:

Pages:
1. /login — email input, requests magic link, shows "check your email" message
2. /submit — the feedback form (only accessible with a valid anonymous token)

The /submit page flow:
- On mount, call POST /api/tokens/request with the user's JWT to get an anonymous token
- Store the token in memory (not localStorage)
- Clear the JWT from state — from this point forward, the session is anonymous
- Display the 3 questions, each with a smooth 1-10 slider
- Sliders should feel tactile and satisfying — use a custom slider component, not browser default. Circular thumb, subtle haptic-feeling transitions, current value displayed.
- No labels like "bad/good" on the endpoints — just the numbers 1-10
- Minimal UI: white background, clean typography, generous spacing
- Submit button sends POST /api/responses/submit with just {token, answers}
- On success, show a brief, warm confirmation ("Thank you. The tank has been fed.") then redirect to the tank view

The form should feel calm and considered, not like a corporate survey.
```

---

## Prompt 6: Ecological Research Document

```
I need you to research and produce a detailed ecological reference document for our underwater visualization MVP.

Research a specific, real, well-documented tropical coral reef ecosystem. Good candidates: Cahuita National Park reef (Costa Rica), Tubbataha Reef (Philippines), or Ningaloo Reef (Australia). Pick the one with the best-documented ecological dynamics.

Produce a markdown document at /docs/reef-ecology-reference.md containing:

1. SITE IDENTIFICATION: Specific reef name, location, coordinates, key characteristics, why it's notable

2. SPECIES INVENTORY (10-15 key species):
   - 3-4 coral species with visual descriptions, health indicators, bleaching behavior
   - 4-5 fish species including at least one schooling species, one solitary species, one cleaner species
   - 2-3 invertebrates (sea urchins, starfish, shrimp)
   - 1-2 plant/algae species

3. ECOLOGICAL DYNAMICS:
   - What environmental parameters drive reef health (water clarity, temperature, nutrient levels)
   - How coral bleaching progresses (timeline, visual stages)
   - How fish populations respond to coral decline
   - Schooling behavior patterns under healthy vs. stressed conditions
   - Cascade effects: what fails first, what follows
   - Recovery timelines when conditions improve

4. PARAMETER MAPPING TABLE:
   Map our three organizational questions to ecological parameters:
   - "How meaningful does your work feel?" (fulfillment) → coral vitality parameters
   - "How connected do you feel to people you work with?" (cohesion) → fish population/schooling parameters
   - "How confident are you the company is heading in the right direction?" (mission) → water clarity/environmental parameters

   For each, specify: what the visual looks like at values 0.0, 0.25, 0.5, 0.75, 1.0

5. SIDE QUEST VISUAL EVENTS:
   List 5-6 real ecological phenomena that could serve as side quest rewards (e.g., manta ray visit, bioluminescent plankton bloom, turtle nesting, cleaning station activation). For each, describe what it looks like and how long it lasts.

Cite real ecological studies where possible. This document will be the source of truth for all visual behavior in the MVP.
```

---

## Prompt 7: Three.js Underwater Scene — Environment Foundation

```
In the living-ecosystem client, build the core underwater scene using React Three Fiber.

Create a component at /client/src/scene/ReefScene.tsx that renders a full underwater environment:

WATER EFFECTS:
- Volumetric fog with blue-green tint, density driven by a "waterClarity" parameter (0-1)
- Caustic light patterns on the sea floor (use animated shader or projected texture)
- Gentle particle system for floating sediment/plankton (density increases as clarity decreases)
- Subtle color grading: warm golden tones when healthy, cold blue-grey when degraded
- God rays from the surface (volumetric light shafts)

LIGHTING:
- Directional light from above simulating sunlight through water (intensity driven by waterClarity)
- Subtle ambient light so nothing is pitch black even at low clarity
- Animated caustic pattern that plays across the sea floor and coral surfaces

CAMERA:
- Slow, ambient camera movement — gentle drift and sway as if floating underwater
- No user camera controls on the projection view
- The camera should slowly cycle through 3-4 viewpoints over several minutes, with very smooth transitions

SEA FLOOR:
- A terrain mesh with sandy texture
- Some rocky formations as base geometry for coral placement
- Scale: the scene should feel like looking into a ~6 foot wide section of reef

The scene should accept a "parameters" prop:
{
  coralHealth: number, // 0-1
  fishPopulation: number, // 0-1
  waterClarity: number, // 0-1
  activeSideQuestEvent: string | null
}

For now, just have the environment respond to waterClarity. We'll add coral and fish in the next prompts.

The scene should look beautiful at waterClarity=1.0. Test by creating a simple page at /tank that renders the scene fullscreen with no UI.
```

---

## Prompt 8: Three.js Underwater Scene — Coral System

```
In the living-ecosystem project, build the coral system referencing /docs/reef-ecology-reference.md for species accuracy.

Create a component /client/src/scene/CoralSystem.tsx:

Using the species from the ecology reference document, create 3-4 distinct coral types as procedural or simple geometry:
- Branching coral (like staghorn/Acropora) — generated from recursive branching algorithm
- Brain/boulder coral — sphere-based with displacement
- Fan coral — flat plane with organic edge shape
- Soft coral — cylinder with gentle wave animation

Each coral type should:
- Be placed procedurally across the reef floor (10-20 coral objects total)
- Have a color that transitions based on the coralHealth parameter:
  - 1.0: vibrant species-accurate colors (warm oranges, purples, greens)
  - 0.5: muted, pale versions
  - 0.0: white/grey (bleached), some geometry reduction (branches simplified)
- Have subtle ambient animation (gentle sway in current) that reduces with lower health
- The transition between health states should be smooth and continuous, not stepped

The branching coral is the most important — it should look organic and detailed. Use a recursive L-system or similar generative approach. The branches should thin and some should disappear at low health values.

Add some sea grass/algae patches on the sandy floor that also respond to coral health (lush green at high, brown/sparse at low).

Test with a slider controlling coralHealth 0-1 in dev mode.
```

---

## Prompt 9: Three.js Underwater Scene — Fish System

```
In the living-ecosystem project, build the fish system referencing /docs/reef-ecology-reference.md.

Create /client/src/scene/FishSystem.tsx:

Implement a boids-based flocking system with these behaviors:
- Separation: fish avoid getting too close to each other
- Alignment: fish match velocity of nearby fish
- Cohesion: fish steer toward center of nearby group

The fishPopulation parameter (0-1) controls:
- COUNT: at 1.0, 25-30 fish visible. At 0.5, 12-15. At 0.0, 2-3 lonely fish.
- SCHOOLING TIGHTNESS: at 1.0, fish form tight coordinated schools with aligned direction. At 0.5, loose groups. At 0.0, scattered individuals moving erratically.
- SPEED: at 1.0, calm purposeful movement. At 0.0, darting anxious movement.
- PROXIMITY TO REEF: at 1.0, fish stay close to coral, sheltering. At 0.0, fish drift away from reef structure.

Fish visual:
- Simple elongated geometry (ellipsoid or low-poly fish shape)
- 3-4 color varieties matching species from the ecology doc
- Subtle tail animation (oscillating sine wave on the mesh)
- One larger "hero" fish that moves independently from the school (a solitary species from the doc)

The school should feel alive — not robotic. Add slight randomness to individual fish behavior within the boid rules. Occasionally a fish should break from the school briefly and rejoin.

Fish should respect scene boundaries and avoid coral geometry (simple bounding box avoidance).

Test with a slider controlling fishPopulation 0-1 in dev mode.
```

---

## Prompt 10: Connecting Data to Visuals

```
In the living-ecosystem project, connect the aggregation engine to the 3D scene.

1. Create a React context /client/src/context/EcosystemState.tsx that:
   - Polls GET /api/state/:deploymentId every 60 seconds
   - Stores the current parameter values
   - Provides a hook useEcosystemState() that returns the current values
   - Implements client-side interpolation: when new values arrive, smoothly lerp from current to new over 30 seconds (this creates the organic drift feeling)

2. Create the tank view page at /client/src/pages/TankView.tsx:
   - Fullscreen, no UI, no cursor — this is the wall projection view
   - Renders ReefScene with parameters driven by the ecosystem state context
   - Maps the three API parameters to the three visual parameters:
     - Question 0 (fulfillment) → coralHealth
     - Question 1 (cohesion) → fishPopulation
     - Question 2 (mission confidence) → waterClarity

3. Create the dashboard view at /client/src/pages/Dashboard.tsx:
   - Split layout: 3D scene on top (60% height), data panel below
   - Data panel shows:
     - Three horizontal bars showing current values for each question (no numbers, just colored bars)
     - Trend arrows (rising/falling/stable) next to each
     - Active side quests with progress/deadline
     - "Last fed: X hours ago" indicator showing time since last submission
   - Minimal, calm design — not a corporate dashboard

4. Create route at /tank/:deploymentId for projection view, /dashboard/:deploymentId for dashboard view.

Seed the database with some test response data across several weeks so the tank has something to show.
```

---

## Prompt 11: Side Quest System

```
In the living-ecosystem project, build the side quest system end to end.

Backend (already has routes from prompt 4, extend if needed):
- When a side quest is marked complete, store a SideQuestEvent record with an eventType drawn from the ecology reference doc's visual events list
- GET /api/state should include the most recently completed side quest event if it was completed within the last 48 hours

Frontend — Manager interface at /manage/:deploymentId:
- Simple form to create a side quest: title, description, deadline
- List of active and completed side quests
- "Complete" button on each active quest
- Requires manager auth

Frontend — Tank visual events:
- Create /client/src/scene/SideQuestEvents.tsx
- When activeSideQuestEvent is present in the ecosystem state, trigger a visual event in the scene
- Implement at least 3 events from the ecology doc, for example:
  1. "manta_ray" — a large manta ray glides slowly through the scene, circles once, exits
  2. "bioluminescence" — plankton particles begin glowing for 2-3 minutes then fade
  3. "turtle_visit" — a sea turtle swims through, pauses near coral, continues on
- Events should feel special and transient — they appear, play out over 2-5 minutes, then naturally end
- They should be beautiful enough that someone in the office says "oh look at that"

Use simple but expressive geometry for the visiting creatures. They don't need to be photorealistic but should move convincingly.
```

---

## Prompt 12: Polish and Deployment

```
In the living-ecosystem project, do a polish pass and prepare for deployment:

VISUAL POLISH:
- Add post-processing: subtle bloom, chromatic aberration, vignette, depth of field
- Add ambient underwater audio option (can be toggled, off by default on projection view)
- Ensure the scene runs at 60fps on a mid-range machine
- Add a gentle "breathing" animation to the overall scene — very slow oscillation of light intensity and fog density so the tank feels alive even when parameters are stable
- Smooth out any jerky transitions between parameter states

UX POLISH:
- The feedback form should work well on mobile (employees submitting from their phones)
- The projection view should auto-hide the cursor after 3 seconds
- The projection view should prevent screen sleep/screensaver
- Add a simple /setup page that lets you create a new deployment with custom name and questions

CONFIGURATION:
- Environment variables for: DATABASE_URL, SMTP settings, JWT_SECRET, PORT
- Default deployment seed script
- README.md with setup instructions

DOCKER:
- Dockerfile for the full application (client + server)
- docker-compose.yml with the app + PostgreSQL
- Should be deployable with a single `docker-compose up`

Test the full flow: create deployment → add users → login → get token → submit feedback → see tank respond.
```

---

## Prompt 13: Demo Data Generator

```
In the living-ecosystem project, build a demo/simulation mode for pitching and testing:

Create a script at /server/src/scripts/simulate.ts that:

1. Creates a deployment called "Demo Company" with the 3 standard questions
2. Generates 12 weeks of simulated response data for 30 employees with a realistic narrative arc:
   - Weeks 1-3: Healthy company. All three parameters high (7-9 range with normal variance)
   - Weeks 4-6: A rough patch. Fulfillment drops first (4-6), others start to follow with a lag
   - Week 7: A side quest is created and completed — brief improvement
   - Weeks 8-10: Cohesion drops (leadership change simulation). Fish scatter while coral partially recovers
   - Weeks 11-12: Recovery arc. All parameters trending back up but not yet at starting levels

3. Also create a "live demo" mode: a flag that when enabled, auto-generates one new response every 30 seconds with values that slowly improve, so the tank visibly responds during a pitch meeting.

This should make for a compelling demo where you can show the full 12-week history in the dashboard and then switch to the live tank view to watch it respond in real time.
```

---

## Notes on Usage

- Run these prompts in order. Each builds on the last.
- After each prompt, review the output, test it, and fix any issues before moving on.
- Prompt 6 (ecological research) can be run in parallel with prompts 1-5 since it produces a reference document, not code.
- The most iteration-heavy prompts will be 7, 8, and 9 (the visual scene). Expect to go back and forth with Claude Code on these to get the aesthetics right.
- Prompt 13 (demo data) is critical for pitching — build it before any investor or mentor conversations.
