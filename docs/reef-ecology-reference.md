# Reef Ecology Reference: Living Ecosystem Visualization
### Source of Truth for Visual Behavior — Three.js Coral Reef Renderer

**Project:** living-ecosystem  
**Document Version:** 1.0  
**Date:** 2026-04-08  
**Primary Sources:** UNESCO World Heritage Centre (Tubbataha Nomination Dossier), Global Coral Reef Monitoring Network (GCRMN), Reef Check Philippines, Unico Conservation Foundation SPR Reports, IUCN World Heritage Outlook (2020), Smithsonian Ocean Portal, PubMed/PMC peer-reviewed literature

---

## 1. SITE IDENTIFICATION

### Selected Reef: Tubbataha Reefs Natural Park, Sulu Sea, Philippines

**Why Tubbataha Was Chosen Over Cahuita and Ningaloo**

Three candidate reefs were evaluated. Cahuita National Park (Costa Rica, Caribbean coast) hosts 35 coral species and 123 fish species — a relatively depauperate Atlantic reef that has suffered documented decline from sedimentation and agrochemical runoff. Its Caribbean species palette lacks the visual richness needed for a compelling 3D scene. Ningaloo Reef (Western Australia) is ecologically spectacular and thoroughly studied by CSIRO, with 300+ coral species; however, its defining megafauna (whale sharks, manta rays) are primarily pelagic and seasonal, and the reef community's visual "language" — dominated by branching and massive Indo-Pacific corals — is broadly shared with Tubbataha. Ningaloo also has fewer published datasets on fish-community behavioral ecology, particularly for schooling dynamics.

Tubbataha was selected for the following reasons:

1. **Richest species inventory of any Pacific atoll in published literature.** UNESCO and peer-reviewed monitoring confirm 360 coral species and 600 fish species within 97,030 ha — the highest documented per-unit-area diversity in the Coral Triangle, which itself holds 75% of the world's reef coral species and 40% of its reef fish species (Coral Triangle Initiative, 2009).
2. **Longitudinal monitoring data.** Reef Check Philippines and the Tubbataha Protected Area Management Board (TPAMB) have conducted surveys since 2000, with hard coral cover data published across multiple decades, including responses to the 1998, 2001, 2006, 2017, 2020, and 2024 bleaching events. Unico Conservation Foundation's 2018 Species Population Report (SPR) provides quantitative fish density and coral cover data by site.
3. **Visual distinctiveness.** The atoll architecture — vertical 100 m drop-off walls, shallow lagoon flats, rubble zones, and sand aprons — provides layered depth zones. The coral assemblage is dominated by large branching and tabular Acropora fields in the shallows, transitioning to massive Porites domes at 12–20 m, and fan-draped walls below 20 m.
4. **Full ecological cascade documentation.** IUCN's 2020 World Heritage Outlook assessment details bleaching history, Crown-of-Thorns starfish (CoTS) outbreak (2009), USS Guardian grounding damage (2013), and recovery trajectories — providing a complete sequence of stress and recovery events.
5. **Exceptional schooling megafauna.** Scalloped hammerhead schools of up to 700 individuals, bumphead parrotfish herds of 20–100, barracuda spirals, and whitetip reef shark nocturnal packs are all formally documented at this site.

---

### GPS Coordinates and Physical Structure

| Feature | Detail |
|---|---|
| Central coordinates | 8°57′12″N, 119°52′3″E |
| North Atoll center | ~9°00′N, 119°51′E |
| South Atoll center | ~8°47′N, 119°52′E |
| Jessie Beazley Reef | ~9°13′N, 119°51′E (20 km north of North Atoll) |
| Total protected area | 97,030 ha (enlarged 2006 from original 332 km²) |
| Distance from nearest land | 150 km southeast of Puerto Princesa, Palawan |

**Structural geology:** Tubbataha sits on the Cagayan Ridge, an extinct submarine volcano. The atolls follow Darwin's classical atoll formation model: fringing reef → barrier reef → atoll as the volcanic substrate subsided. The result is a staircase-like wall structure with "steps" at depth intervals of 5–8 m reflecting past sea level stands. The wall descends nearly vertically for 100 m before plunging into surrounding bathymetry of 750–1,000+ m.

**North Atoll dimensions:** 16 km long × 4.5 km wide. Contains Bird Islet (0.3 ha coralline sand cay).

---

### Key Physical Parameters

| Parameter | Value / Range | Visual Implication |
|---|---|---|
| Depth (reef flat) | 0.3–3 m | Brilliant light saturation; extreme thermal variability |
| Depth (reef crest) | 1–7 m | Dense Acropora branching zone; breaking wave energy |
| Depth (upper slope) | 7–20 m | Primary coral zone; Porites domes; cleaner wrasse stations |
| Depth (mid-wall) | 20–50 m | Gorgonian fans; plate corals; shark patrolling depth |
| Depth (deep wall) | 50–100 m | Sparse coral; crinoids; hammerhead aggregations |
| Water temperature | 26–30 °C (annual) | Bleaching threshold: ≥30.5 °C for 4+ weeks |
| — Winter average | 28.2 °C | Below bleaching threshold |
| — Summer peak | 29.6 °C | Marginal thermal stress possible |
| Visibility | 20–40 m (typically 30+ m) | Exceptional; allows 70 m walls to look like 30 m |
| Currents | Mild to strong; variable by site | Feeds gorgonians; drives schooling behavior; drift diving |
| Diving season | March–June only | Strong pelagic aggregations during this window |
| Oceanic context | Isolated atoll, open Sulu Sea | No riverine sediment; no agricultural runoff; pristine clarity |

**Water clarity note:** The extreme isolation of Tubbataha means virtually zero terrestrial nutrient input. Turbidity readings during monitoring periods are consistently at the lower end of measurable range — visibility above 30 m is the norm, not the exception. This makes water column rendering a key health indicator: clear blue-indigo water is the default "healthy" state.

---

## 2. SPECIES INVENTORY

### 2A. Corals (4 species)

---

#### Species 1: Acropora hyacinthus — Plate Table Coral ("Hyacinth Table")

**Scientific name:** *Acropora hyacinthus* (Dana, 1846)  
**Common name:** Hyacinth Table Coral; Tabletop Coral  
**Family:** Acroporidae

**Visual description:**  
The most architecturally dramatic coral at Tubbataha. Colonies form wide, nearly horizontal plate tables composed of fine lattice-work branching with an open, airy internal structure. Individual branches terminate in small upright corallites arranged in a rosette pattern. Mature colonies reach 1–4 m in diameter; colonies exceeding 2 m are common on undisturbed outer slopes at 5–15 m depth. Color is typically a uniform pale brown to cream, often with ice-blue, violet, or pale pink growing margins at the plate tips — the color difference between living edge and interior plateau is a reliable species marker. Under direct sunlight at shallow depth (5–10 m), the growing margins appear luminous and slightly translucent.

Spatial character: Tables often grow in overlapping tiers, the larger elder colonies below and younger colonies perching on them, creating a layered canopy structure that fish shelter under. The space beneath a large table colony is dim, fish-rich, and visually distinct from the sun-lit reef above.

**Health indicators:**  
- Healthy: Even cream-brown or teal coloration across the plate surface; bright, often blue-tinged growing margins; the plate surface hosts encrusting organisms without dead patches; polyp extension visible at night
- Stressed (pre-bleach): Growing margins lose their color distinction first; the plate becomes uniformly pale tan; the coral appears "flat" — less differentiation of zones
- Mild bleaching: Patchy pale areas (20–40% of plate surface); often begins toward the center of the plate where water flow is lowest, working outward
- Partial bleach: Interior of table turns chalk white while margins may retain faint color; the coral looks like a disc with a white center
- Full bleach: Entire table turns brilliant, matte white; the lattice structure becomes very visible as there is no color to create visual depth; the table looks "skeletal"
- Algae overgrowth: Dead tables are first colonized by thin green turf algae (uniform dark green fur 1–2 mm tall), then by fleshy brown Lobophora or filamentous red algae. Within 3–6 months, a dead table can be entirely encrusted with dark brown or olive-green macroalgae, making it visually almost indistinguishable from rubble except for the plate shape still visible beneath the growth.

**Acropora bleaching susceptibility note:** *Acropora* is among the most bleaching-susceptible coral genera. Rapid photoinhibition occurs within 48–72 hours of temperature exceeding 1°C above the maximum monthly mean. This makes *A. hyacinthus* a "sentinel" species — its bleaching appears before more resilient genera.

---

#### Species 2: Acropora brueggemanni — Branching Staghorn Coral

**Scientific name:** *Acropora brueggemanni* (Brook, 1893)  
**Common name:** Branching Staghorn; Bottlebrush Coral  
**Family:** Acroporidae

**Visual description:**  
The most abundant Acropora at Tubbataha, according to site descriptions from Tubbataha dive records. Forms dense three-dimensional thicket colonies with upright, cylindrical branches 5–20 cm long radiating from a basal trunk. Branches are uniform in diameter (~1 cm), slightly tapered at tips. Colony form is bushy-to-columnar, typically 40–90 cm tall and 50–150 cm wide. Color ranges from greenish-brown to pale blue-gray (the blue-gray morph is notably beautiful under filtered sunlight), sometimes with yellow-orange branch tips. Under strong current, branches are oriented with tips pointing slightly upcurrent.

At depths of 3–7 m, *A. brueggemanni* can form dense monospecific stands covering many square meters. This is the coral that defines the "staghorn thicket" visual zone on healthy upper Tubbataha slopes — an almost forest-like arrangement where visibility into the thicket falls below 0.5 m.

**Health indicators:**  
- Healthy: Dense branch architecture with uniform coloration; fish visible threading through branches (chromis, damsels, juvenile wrasse)
- Stressed: Branches begin to pale from tips inward; the tips are the first cells to bleach due to elevated temperatures at extremities; color gradient from pale tip to colored base
- Partial bleach: Upper canopy of thicket bleaches while lower/shaded portions retain color; colony appears "frosted" on top
- Full bleach: Entire colony turns white; the branch architecture becomes hyper-visible as a three-dimensional white skeleton — visually distinctive from the white plate of *A. hyacinthus*
- Dead colony: White skeleton weathers to gray, then is colonized by green turf algae from base upward; in 2–3 months a dead staghorn stand becomes a "gray mat" rather than a white thicket; by 6–12 months it may crumble into rubble as boring organisms weaken the branches

---

#### Species 3: Porites lobata — Massive Boulder Coral

**Scientific name:** *Porites lobata* (Dana, 1846)  
**Common name:** Massive Porites; Boulder Coral; Lobate Star Coral  
**Family:** Poritidae

**Visual description:**  
The most structurally imposing coral on the reef. Colonies are hemispherical domes that grow slowly (5–10 mm per year in diameter), resulting in massive boulders at 12–20 m depth that may represent centuries of continuous growth. Typical large colonies at Tubbataha: 1–3 m diameter, 0.5–2 m tall. Exceptional individuals reach 4–5 m diameter. Surface texture is closely knit, small-polyped (polyps 1–2 mm diameter), giving the colony a matte, slightly grainy appearance reminiscent of a rough stone. Color is generally yellow-green, tan, or pale brown — subdued and earthy. At healthy sites, the very surface of the colony (the outermost millimeter of living tissue) has a faint fluorescent green or cream cast compared to the interior.

Spatial character: Large Porites boulders are islands of structural complexity at mid-depth. Hawksbill turtles graze on the algae growing around their bases. Napoleon wrasse patrol between Porites heads. The domes are visually "anchoring" features in the mid-slope zone.

**Health indicators:**  
- Healthy: Uniform tan-olive-green coloration; living edge visible as slightly lighter zone; smooth surface detail; no bare white areas; often colonized on upper surface by sparse encrusting organisms
- Stressed: Slightly paler overall; may show "white pox" disease patches (circular white lesions 5–30 cm) as immune function drops under thermal stress
- Partial bleach: Patchy white areas, often on the sunniest exposed top of the dome while shaded flanks retain color; the patchy pattern is distinctive from *Acropora* bleaching which tends to be uniform across branch surfaces
- Full bleach: Brilliant white dome — very striking given the large mass; the dome may remain structurally intact even after bleaching mortality, persisting as a white landmark for years
- Recovery appearance: More resilient to bleaching than *Acropora* (Porites lobata is one of the more resistant coral species). Recovery begins as brownish tissue re-extends from living margins; visible as a tan halo growing inward over white areas. Time to full visual recovery: 12–18 months for partial bleach; 3–5 years for near-total bleach of large colony.

**Ecological note:** Dead Porites domes become "bioeroded castles" — their massive structure persists after death but is slowly honeycombed by sponges, boring bivalves (Lithophaga), and worms, creating a complex of holes and channels that fish inhabit. A large dead Porites dome can support more fish than an equivalent area of live coral through sheer structural complexity.

---

#### Species 4: Subergorgia mollis — Giant Sea Fan

**Scientific name:** *Subergorgia mollis* (Nutting, 1910)  
**Common name:** Giant Sea Fan; Gorgonian Fan  
**Family:** Subergorgiidae

**Visual description:**  
Found at 15–40 m depth on Tubbataha's vertical walls, these gorgonian octocorals are among the most visually dramatic invertebrates on the deep wall. Colonies form a single-plane fan of dichotomously branching skeletal branches, oriented perpendicular to prevailing current. Typical dimensions: 0.5–2.5 m tall, similar spread. In strong-current zones (which Tubbataha regularly experiences), fans can reach 3 m across. The axis is rigid and dark (golden-brown to black), covered with living polyp tissue in cream, orange, or yellow. Each tiny polyp (1–2 mm, 8 white-tipped tentacles) extends into the current to filter plankton — visible as a delicate fringe when extended, retracted as bumps when contracted.

Color palette: Cream-yellow to deep saffron-orange. At Tubbataha specifically, dive reports describe large purple and orange gorgonians — the purple are likely *Acabaria* or related genera; deep orange fans are most striking against the blue wall water.

Under current: The entire fan oscillates slowly in the current direction — a large fan sways 10–20 cm amplitude at typical Tubbataha current speeds. This slow oscillation, synchronized across multiple fans on the wall, is one of the most visually distinctive behaviors to render.

**Health indicators:**  
- Healthy: Polyps fully extended; fan structure intact; no bare axis sections; color uniform (orange, cream, or yellow depending on species)
- Stressed: Polyps retract into skeleton; color fades; a stressed fan looks like bare, gray-brown skeleton branches — the same shape but without the living texture
- Disease/sediment impact: "Black band disease" cuts dark bands across the fan axis, leaving bare white axis in its wake — visually striking in a morbid way. Sediment smothering leaves fans looking "dusted" and gray
- Degraded state: Fans on degraded walls are often bare skeleton — the fan shape persists but is ghostly pale-gray, no polyps, possibly colonized by encrusting algae

---

### 2B. Fish (5 species)

---

#### Species 5: Bolbometopon muricatum — Bumphead Parrotfish (Schooling species)

**Scientific name:** *Bolbometopon muricatum* (Valenciennes, 1840)  
**Common name:** Bumphead Parrotfish; Green Humphead Parrotfish  
**Family:** Scaridae  
**Role in visualization:** Primary schooling herbivore; key "health pulse" species

**Visual description:**  
The largest parrotfish in the world, and visually one of the most spectacular reef fish. Adults reach 1–1.3 m in length, 30–75 kg in mass. The most identifying feature is the pronounced "bump" on the forehead — a bony protrusion used to headbutt coral during feeding (audible underwater as a hollow crack). Body coloration is green to blue-green, the scales edged slightly darker creating a subtle net pattern. The beak — formed from fused teeth — is green-blue and visually very prominent given the large head. Trailing edges of the tail fin have white or pale blue trailing filaments. Juveniles are dark brown with three rows of white spots; sub-adults transition through mottled brown-green.

During spawning: Males display a "blanched face" — the green head lightens to pale yellow-white — with white vertical bars appearing along the flanks. Females show barring along the dorsal flank.

**Typical behavior at Tubbataha:**  
Groups of 20–75 individuals (historical records suggest up to 250 before overfishing at unprotected sites). At Tubbataha, healthy herds of 20–50 individuals are documented in the 2018 SPR. The school moves as a coordinated grazing front across the reef crest and shallow slope, working methodically at roughly walking speed. Each individual bites off chunks of live coral or algae-encrusted dead coral; the biting action is visible from above as a series of small white scars left behind. The school leaves a trail of fine white carbonate sand (parrotfish excrement — adult individuals produce up to 5 tonnes of sand per year). Groups rest overnight in shallow sandy lagoon areas or near caves; they emerge at dawn as a cohesive mass and move toward feeding grounds.

Schooling dynamics for boids implementation:
- Formation type: Loose aggregation, not tight schooling — individuals maintain ~0.5–1 m separation while feeding, closing to 0.3 m during movement
- Heading coherence: Moderate; group moves with clear directionality but individuals deviate ±20–30° to bite targets
- Speed: Slow to moderate (0.5–1.5 body lengths/second while feeding; 2–3 BL/s when repositioning)
- School shape: Approximately elliptical with 3:1 length-to-width ratio in movement direction; broadens when feeding
- Response to stress: In degraded reef conditions with less live coral, school size shrinks (remaining individuals form smaller subgroups of 5–15); movement speed increases and feeding bouts shorten as forage quality drops

**Behavior under stress (reef degradation):**  
*Bolbometopon muricatum* is among the first large fish to disappear from degraded reefs due to its dependence on high live coral cover. Studies across the Indo-Pacific show it is absent from reefs with <20% live hard coral cover. At Tubbataha, their continued presence (documented in 2018 SPR) is considered a strong indicator of reef health. Under degradation:
1. School size drops from 20–50 to 5–15 individuals
2. Group becomes more scattered (reduced cohesion); grazing front breaks down
3. Species disappears from the site entirely below a live coral threshold (~15–20%)

---

#### Species 6: Cheilinus undulatus — Napoleon Wrasse (Solitary/territorial species)

**Scientific name:** *Cheilinus undulatus* (Rüppell, 1835)  
**Common name:** Napoleon Wrasse; Humphead Wrasse; Maori Wrasse  
**Family:** Labridae  
**Role in visualization:** Solitary indicator species; visual "keystone" presence/absence marker

**Visual description:**  
One of the largest reef fish, listed as Endangered on IUCN Red List. Adults reach 1.8–2.3 m in length and up to 191 kg in mass. The most distinctive features: a large rounded hump on the forehead that develops with age (juveniles lack it; the hump grows continuously throughout life), thick rubbery lips, and two dark-blue to black irregular stripes behind the eye. Body coloration in adults is a deep, rich blue-green to teal with yellow reticulated (net-pattern) lines on the head; blue scales on the body have dark posterior edges creating a subtle fish-scale layered effect. Large individuals appear almost purplish-blue in open water, lightening to teal-green near the reef. The massive size combined with the distinctive hump and lip structure makes it unmistakable.

Under sunlight: The yellow facial reticulation "glows" against the blue-green body. This face pattern is unique to each individual (used for photo-ID studies).

Juveniles: Pale greenish-white with irregular black-outlined dark patches — completely different appearance from adults. They occupy shallower, sandier habitats. Rarely seen due to the population's conservation status.

**Typical behavior at Tubbataha:**  
Adults are largely solitary. They patrol defined home ranges of 1–16 km², making slow, deliberate circuits of outer reef slopes and channel edges. Typically encountered alone or in pairs (male-female pair bond observed around patch reefs). Their movement is unhurried — they appear "at home" on the reef, not reactive to divers at protected sites like Tubbataha. They probe coral crevices with their robust lips, extracting prey (sea urchins, crabs, molluscs, even toxic crown-of-thorns starfish and boxfish that other species cannot eat). Napoleon wrasse are documented crown-of-thorns starfish predators — a significant ecological service.

Active during daylight hours. At dusk, they retreat to specific sleeping caves or ledges which they use repeatedly, sometimes for years.

**Behavior under stress:**  
Napoleon wrasse are the first large reef fish to be targeted by spearfishing and live fish trade at unprotected sites. Their slow reproduction (5+ years to sexual maturity) means recovery from population loss takes decades. On degraded or exploited reefs, they simply disappear. At Tubbataha, their presence — documented with increased sightings in 2018 compared to 2008 — is a direct metric of reef protection effectiveness.

Visual indicator in degraded state: Absence. If Napoleon wrasse are absent from a scene, the reef is either degraded or over-exploited. If present but solitary and moving rapidly (rather than leisurely), it indicates elevated stress.

---

#### Species 7: Labroides dimidiatus — Bluestreak Cleaner Wrasse (Cleaner species)

**Scientific name:** *Labroides dimidiatus* (Valenciennes, 1839)  
**Common name:** Bluestreak Cleaner Wrasse; Common Cleaner Wrasse  
**Family:** Labridae  
**Role in visualization:** Operating cleaning stations; behavioral indicator of reef mutualism; health-state indicator

**Visual description:**  
Small (8–14 cm), slender fish with one of the most recognizable color patterns in the ocean: a black lateral stripe running from the snout tip through the eye to the tail, broadening posteriorly, on a white body that grades to electric blue on the upper half from mid-body rearward. The contrast between the black stripe and the iridescent blue upper body is striking and remains visible from several meters away. Juveniles are similar but with more black on the body.

The color pattern functions as a "uniform" — other fish recognize it as the signal of a cleaner. Mimics (such as the sabre-tooth blenny *Aspidontus taeniatus*, which has near-identical coloration) exploit this recognition to bite other fish rather than clean them.

**Typical behavior at Tubbataha (Cleaning Station Operation):**  
Individual cleaner wrasse establish and defend a "cleaning station" — typically a prominent coral head, large Porites dome surface, or gorgonian base — and advertise their services with a distinctive "dance": an exaggerated undulating swimming motion where the rear half of the body waves while the fish hover in place, sometimes described as "flapping" or "bouncing."

Client fish approach the station, adopting a characteristic pose: hovering nearly motionless, often head-up or head-down at an angle (the angle varies by species), fins extended, mouth and gill covers slightly open. Large predatory fish — groupers, sharks, barracuda, moray eels — are regular clients and are perfectly passive while being cleaned. Manta rays hover at stations in a circular pattern, making repeated passes.

The cleaner moves over the client's body, gills, and inside the mouth, picking off ectoparasites (isopods, copepods), mucus, and dead tissue. Sessions last 30 seconds to several minutes. A busy cleaning station services dozens of clients per hour. At Tubbataha's "Black Rock" site, cleaning stations servicing manta rays have been specifically documented.

A signaling behavior: The cleaner uses a "headbutt" — a gentle prod of the fin — to direct the client's attention to a problem area; and performs a tactile vibration of the pectoral fins against the client's skin (thought to be a reassurance/communication signal).

**Behavior under stress (reef degradation):**  
Cleaner wrasse are among the most robust reef fish and persist in degraded habitats. However, client diversity and cleaning frequency both decline as reef fish communities simplify. A cleaning station on a degraded reef may service only small resident fish rather than the diverse parade of species (sharks, mantas, large groupers) that characterize healthy-reef stations.

In severe degradation, the cleaning station itself disappears — not because the cleaner wrasse dies, but because the structural complexity of the coral head it operates from is gone. The behavior requires a recognizable landmark that clients can navigate to; rubble fields do not support this.

---

#### Species 8: Sphyraena barracuda — Great Barracuda (Schooling/aggregating species)

**Scientific name:** *Sphyraena barracuda* (Edwards, 1771)  
**Common name:** Great Barracuda; Cuda  
**Family:** Sphyraenidae  
**Role in visualization:** Schooling vortex formation; predator-prey interaction visual

**Visual description:**  
Adults are 1–1.5 m in length (occasionally 2 m), torpedo-shaped with a large pointed head and strongly jutting lower jaw exposing fang-like teeth. Body is silver to gunmetal gray on the sides, slightly greenish on the dorsal surface, white belly. Irregular dark bars or patches on the flanks, more pronounced in adults. The lateral line (a sensory organ running along the flank) is a thin, visible line on the otherwise smooth silver flank. Two dorsal fins widely separated; the caudal fin is deeply forked and powerful. Eyes are large and pale amber to gold — visually striking at close range.

In a school: Individuals align so precisely that the school from a distance appears as a single undulating silver sheet or cylinder. At Tubbataha, schooling barracuda are most frequently encountered mid-water along the wall edge at 10–30 m depth, rotating in a slow tornado-like vortex — the classic "barracuda tornado" formation that is one of the most photographed sights in diving.

**The barracuda tornado — specific visual mechanics:**  
Large aggregations of juvenile to sub-adult great barracuda (up to several hundred individuals, though typical Tubbataha schools are 50–200 individuals) form a slowly rotating cylindrical column in mid-water. The cylinder is typically 3–8 m diameter and 5–15 m tall. Individuals swim nose-to-tail in concentric circles; the outermost individuals face slightly outward while inner individuals face inward, creating a layered rotation. The school rotates at roughly 0.5–1 revolution per minute. The collective silver flash of turning bodies creates a strobe-like visual effect when sunlight hits the school.

**Schooling dynamics for boids implementation:**  
- Vortex formation: Cohesion force should dominate over alignment to produce tight circular motion; each individual's "desired position" is a point on a circle rather than in a line
- Separation distance: 0.5–1.5 body lengths between adjacent individuals
- Speed uniformity: Very high — individuals in a rotating school match speed with extraordinary precision; variance in speed breaks the visual coherence
- Response to threat: A shadow or sudden approach causes the school to "burst" outward radially, then rapidly re-coagulate into the formation. This flash-expansion is a characteristic defensive response
- Under healthy conditions: Tight formation, consistent rotation direction and speed
- Under degraded conditions (reduced prey): School fragments into smaller groups of 10–30 that move more erratically, without the sustained rotation behavior; less directional coherence

**Behavior under stress:**  
As reef fish populations decline, barracuda schools have less prey density to justify aggregation near the reef. Schools thin out, move to deeper water or open ocean, and the spectacular tornado formations occur less frequently and for shorter durations.

---

#### Species 9: Triaenodon obesus — Whitetip Reef Shark (Nocturnal hunting species)

**Scientific name:** *Triaenodon obesus* (Rüppell, 1837)  
**Common name:** Whitetip Reef Shark  
**Family:** Carcharhinidae  
**Role in visualization:** Nocturnal behavioral transition; apex presence indicator

**Visual description:**  
Small to medium shark, typically 1.2–1.6 m, rarely to 2 m. Body is slender and cylindrical compared to other requiem sharks, with a short, blunt snout and large oval eyes. Distinctive white tips on the first dorsal fin and the upper lobe of the caudal fin — unmistakable when seen against dark water. Body color is dark brownish-gray dorsally with a few irregular dark blotches, shading to cream-white on the belly. The white fin tips appear luminous even in low light, making this species identifiable at range.

Unlike most sharks, whitetip reef sharks can rest motionless on the bottom (they pump water over their gills without swimming), so they are frequently seen lying in groups of 2–20 on sandy ledges or piled inside caves during the day.

**Typical behavior at Tubbataha:**  
Day: Resting in small groups (2–15) on ledges, inside caverns, or on sand patches adjacent to the reef. Their typical "day pose" is side by side or stacked, oriented into any gentle current. They appear sluggish and inattentive during daytime hours.

Dusk: As light fades, individuals begin to stir. By 30 minutes post-sunset, the resting aggregation has dispersed.

Night: Highly active. Small groups of 3–8 sharks systematically hunt the reef, swimming into crevices and under coral overhangs, chasing fish into the open. Group coordination is not highly cooperative (each shark hunts for itself), but multiple sharks working the same coral head simultaneously "flush" prey from all directions, incidentally benefiting the group. The hunting action is vigorous and agile — they contort their bodies to reach into narrow crevices, dislodging coral rubble.

**Behavior under stress:**  
Whitetip reef sharks are sensitive to human disturbance (spearfishing, net fishing, shark finning) and disappear from exploited reefs. Their presence at Tubbataha in high numbers (surveys record them in 71.7% of dive surveys) is a direct product of the marine reserve's no-take status. In the visualization, their absence from the scene is an indicator of high exploitation/degradation pressure.

---

### 2C. Invertebrates (3 species)

---

#### Species 10: Tridacna gigas — Giant Clam

**Scientific name:** *Tridacna gigas* (Linnaeus, 1758)  
**Common name:** Giant Clam  
**Family:** Tridacnidae  
**Conservation status:** CITES Appendix II; protected at Tubbataha

**Visual description:**  
The world's largest bivalve, with shells reaching 120 cm across and weighing over 200 kg. At Tubbataha, *T. gigas* individuals of 60–90 cm are commonly observed, with occasional large elders exceeding a meter. The exterior shell surface is ridged and cream-white; what makes the giant clam visually extraordinary is the exposed mantle tissue between the shell valves. The mantle is highly pigmented with zooxanthellae in a spectacular array of patterns: electric blue, iridescent green, golden yellow, deep purple, or combinations thereof — no two individuals have identical patterns. The mantle edge is scalloped and wavy, creating a frilled border around the opening.

The mantle is covered in iridescent cells (iridophores) that focus light into the zooxanthellae packed just below the surface — the iridescent shimmer is not just aesthetic but functional, acting as a light-focusing lens for photosynthesis. This means giant clam mantles actively "glow" in different light conditions: under oblique morning or afternoon light, the iridophores scatter light dramatically.

Behavioral note: The clam slowly closes its valves when approached, the mantle retreating first. The closing speed is proportional to the perceived threat. Undisturbed clams are fully open and still; the slightest shadow causes a perceptible flinch of the mantle edge.

**Ecological role:**  
Giant clams are "ecosystem engineers." They increase topographic heterogeneity of the reef; act as zooxanthellae reservoirs (releasing Symbiodinium into the water column during spawning events); filter significant volumes of water; and produce large amounts of calcium carbonate shell material incorporated into reef framework. Their shells persist for centuries after the animal's death, providing shelter cavities.

**Behavior under stress:**  
Seven species of giant clams are documented at Tubbataha (all CITES-listed). Giant clam populations have been devastated at unprotected Philippines reefs by collection for food and the ornamental trade. Their presence at Tubbataha is another reserve-success metric. Clams on bleached reefs lose their zooxanthellae just as corals do — the vibrantly colored mantle fades to cream-gray or white-yellow during stress. In prolonged stress, the mantle retracts and the clam's shell may remain open slightly at all times as muscle control weakens — the "gaping clam" is a stress indicator.

---

#### Species 11: Acanthaster planci — Crown-of-Thorns Starfish

**Scientific name:** *Acanthaster planci* (Linnaeus, 1758)  
**Common name:** Crown-of-Thorns Starfish (CoTS)  
**Family:** Acanthasteridae  
**Role in visualization:** Stress/degradation indicator; bloom event visual

**Visual description:**  
Multi-armed sea star with 8–21 arms; diameter up to 70 cm (typically 25–40 cm at Tubbataha). The entire dorsal surface is covered with long, sharp spines (up to 6 cm) that are venomous. Color is highly variable: can be red-orange, blue-gray, violet-purple, green-orange, or combinations; color is correlated with diet (coral tissue ingested affects coloration). The oral surface (underside) is white-cream with hundreds of short tube feet. The visual impression of a large CoTS on a coral head is dramatic — a spiny, multi-armed disc draped across the coral surface, with a ring of "bare white" dead coral skeleton immediately beneath it where digestion has occurred. A single CoTS feeding track leaves a ghostly white scar on an otherwise colored coral.

**Ecological role and outbreak dynamics:**  
At low "background" densities (1–2 per hectare), CoTS are natural components of the reef. They are prey for the Napoleon wrasse (which can eat them due to their tough lips/teeth) and the Titan triggerfish. Outbreak density: >15 per hectare. In the 2009 Tubbataha CoTS outbreak (reported by UNESCO's State of Conservation), multiple individuals were observed simultaneously on single coral heads at the NR-2 (Ranger Station) site — a visually striking spectacle of orange-red multi-armed forms converging on the coral.

A single large individual can consume 12 m² of coral tissue per year. An outbreak of 15+ per hectare can strip 90% of living coral within months.

**Behavior under stress/bloom conditions:**  
During outbreak conditions, CoTS move in loosely aggregated groups ("waves") across the reef face, following chemical trails to coral-rich areas. Individual starfish are visible feeding on corals throughout the day and night. The "bleached" white patches they leave behind are an early visual indicator of an outbreak in progress — white scars 30–60 cm in diameter appearing on otherwise healthy coral heads.

---

#### Species 12: Diadema setosum — Long-Spined Sea Urchin

**Scientific name:** *Diadema setosum* (Leske, 1778)  
**Common name:** Long-Spined Sea Urchin; Black Sea Urchin  
**Family:** Diadematidae  
**Role in visualization:** Benthic density indicator; algae-grazer

**Visual description:**  
Test (body) 4–8 cm diameter, jet black. Spines extremely long (10–30 cm), thin, hollow, and very dark — almost iridescent black. The oral surface (base) has five "teeth" (Aristotle's lantern) with which it scrapes algae from hard surfaces. The aboral surface has a blue iridescent ring ("anal ring") around the anus which pulses with bioluminescent light at night. Spines are mildly venomous and can penetrate neoprene. Tube feet visible between spine bases.

In high density on healthy reefs, urchins are often visible in crevices and under coral overhangs by day, emerging at night to graze. A patch of reef with 5–10 urchins per square meter of crevice area is a sign of structural complexity and reasonable grazer pressure.

**Ecological role:**  
*Diadema* is among the most important herbivores on Indo-Pacific reefs. By grazing microalgae from bare substrate, they create settlement surfaces for coral recruits. Dense urchin populations correlate with higher coral recruitment success and lower macroalgae cover.

**Behavior under stress:**  
*Diadema* populations crashed massively in the Caribbean in 1983 due to a species-specific water-borne pathogen (99% mortality); no equivalent pandemic has struck Indo-Pacific populations. However, collection for food and loss of structural complexity (which they use for refuge) reduces populations in degraded reefs. Their absence correlates with unchecked macroalgae growth. On a degraded reef, the visual indicator is: no urchins visible in crevices; macroalgae covering bare substrate surfaces that would otherwise be urchin-grazed clean.

---

### 2D. Algae (2 species/groups)

---

#### Species 13: Halimeda spp. — Calcareous Green Algae

**Scientific name:** *Halimeda* spp. (including *H. opuntia*, *H. discoidea*, *H. macroloba*)  
**Common name:** Cactus Algae; Halimeda  
**Family:** Halimedaceae

**Visual description:**  
*Halimeda* consists of chains of bright green, coin-to-lens shaped calcified segments 5–15 mm in diameter. The plant grows in fans, tangles, or upright branching arrangements 5–20 cm tall. The green is clear and vivid — one of the few genuinely bright greens visible on the reef floor. Between coral heads and on sandy patches between reefs, *Halimeda* forms dense low "meadows" or scattered clumps. The segments feel rigid (calcified) and crumble to white calcium carbonate segments after the plant dies — these dead Halimeda segments contribute significantly to reef sand (up to 90% of sand on some beaches consists of old Halimeda segments).

At Tubbataha, *Halimeda* is tracked in benthic surveys alongside corals, dead corals, abiotic material, and macroalgae, meaning it is an explicitly documented component of the monitored benthic community.

**Role in reef health (healthy state):**  
In a healthy reef, *Halimeda* occupies interstitial sand patches and rubble zones between coral colonies, and it is present but not dominant. It contributes to carbonate production (each plant is a calcium carbonate structure), provides complex 3D structure in sand zones for small invertebrates, and is grazed by some herbivores. Its vivid green color provides visual contrast to the brown/cream coral and white sand background in a healthy scene.

**Appearance in degraded state:**  
As live coral cover declines and herbivore populations diminish, *Halimeda* and fleshy macroalgae (particularly Lobophora and Dictyota species — see below) expand onto dead coral surfaces. In moderately degraded reefs, patches of *Halimeda* begin to grow directly on dead coral skeleton surfaces — an early sign of transition. A degraded reef has *Halimeda* climbing over and replacing what was coral; the bright green becomes a symbol of transformation rather than health. Recent monitoring at Tubbataha detected small but significant increases in algae alongside declining hard coral cover in certain areas, using *Halimeda* expansion as an indicator.

---

#### Species 14: Fleshy Brown Macroalgae — Lobophora / Dictyota

**Scientific name:** *Lobophora variegata* (Lamouroux), *Dictyota* spp.  
**Common name:** Brown Macroalgae; Leather Algae  
**Family:** Dictyotaceae

**Visual description:**  
*Lobophora variegata* grows as flat, overlapping lobes or fans 2–10 cm across, encrusting dead coral and hard substrate in smooth, leathery sheets. Color: olive-brown to dark brown with a slightly lighter central zone. Surface texture: smooth and rubbery, with a faint concentric banding pattern visible in some morphs. *Dictyota* spp. grow as branching flat blades 3–8 cm long, yellowish-brown to medium brown, with an iridescent blue or gold sheen under certain light angles (this iridescence is real and visually notable).

In a degraded reef, these algae replace the vivid cream, tan, and pink tones of living coral with a monotone olive-brown palette. A heavily algae-dominated reef can look "fur-covered" — a low-relief mat of brown growth replacing what was a complex 3D coral architecture.

**Role and appearance in healthy vs. degraded states:**  
- Healthy reef: Rare; only on patches of long-dead coral skeleton; easily controlled by herbivore grazing from parrotfish, surgeonfish, and urchins; occupies <5% of substrate
- Mildly degraded: Expands onto recently bleached coral skeleton within 2–4 weeks of coral death; creates a dark brown "halo" around dead coral patches; occupies 10–25% of substrate
- Heavily degraded: Dominant substrate cover (up to 40–60% of substrate); the reef has a flat, brown, low-relief appearance; coral recruits cannot settle through the algal mat; the "phase shift" from coral-dominated to algae-dominated has occurred

---

## 3. ECOLOGICAL DYNAMICS

### 3A. Priority Order of Environmental Parameters Driving Reef Health

Based on GCRMN global assessments, ISRS Briefing Paper 3 on Water Quality, and published literature:

| Priority | Parameter | Mechanism | Visual Consequence |
|---|---|---|---|
| 1 | **Sea Surface Temperature** | Drives zooxanthellae expulsion (bleaching) and coral mortality; threshold: 1–2°C above maximum monthly mean for 4+ weeks | Coral color loss; bleaching events; mass mortality |
| 2 | **Water Clarity / Turbidity** | High sediment loads attenuate light needed for zooxanthellae photosynthesis; fine particles also smother coral tissue | Reduced visual range; gray-green water tones; coral covered in sediment |
| 3 | **Nutrient Levels** | Elevated nitrogen/phosphorus accelerate macroalgae growth, increase bioerosion rates, and can support coral-pathogenic microbes | Algae explosion; competitive overgrowth of coral; reduced coral color saturation |
| 4 | **pH (Ocean Acidification)** | Reduces availability of carbonate ions needed for calcification; slows coral growth and reef cementation | Structural fragility (not directly visible but weakens long-term structural forms) |
| 5 | **Currents** | Deliver larvae, food, and oxygen; remove waste and sediment; drive gorgonian feeding behavior | Absent at Tubbataha: loss of current would reduce food delivery to fans and planktivores, but Tubbataha's open-ocean position makes current a constant |

**Tubbataha-specific note:** Because Tubbataha is a remote oceanic atoll with no freshwater input, parameters 2, 3, and 5 are currently excellent. The primary vulnerability is temperature (parameter 1). The 2024 bleaching event at Tubbataha was driven entirely by thermal stress from El Niño-enhanced warming — not turbidity or nutrients.

---

### 3B. Coral Bleaching Timeline — Precise Visual Stages

The following timeline is synthesized from NOAA coral bleaching documentation, CoralWatch monitoring protocols, Smithsonian Ocean bleaching pages, and published papers (Hughes et al., 2017; Palumbi et al., 2014; Glynn, 1993).

**Thermal trigger:** Water temperature sustains ≥1°C above maximum monthly mean for 4+ weeks. At Tubbataha, the maximum monthly mean is approximately 29.5–30°C, so bleaching threshold is approximately 30.5°C sustained.

---

**Stage 0 — Normal (Pre-Stress)**  
Duration: Baseline state  
Visual: Corals show full zooxanthellae-derived coloration. *Acropora* tables are cream-brown with vivid blue-pink margins. Branching colonies are blue-gray to brown-gold. *Porites* domes are tan-olive with a faint green cast. The reef has a warm, earth-toned palette with high spatial color variation.  
Water: Crystal clear, blue-indigo, no color tint.

**Stage 1 — Mild Thermal Stress (Pre-Bleach Fluorescence)**  
Duration: Days 0–14 of thermal anomaly  
Visual: Some *Acropora* species (particularly fast-bleaching *A. hyacinthus*) produce fluorescent pigments as a stress response, appearing bright blue, pink, yellow, or even electric green — a phenomenon called "colorful bleaching." This counter-intuitive brightening is a real, documented phenomenon. The coral doesn't look sick — it looks almost artificially vivid. This is the last sign before bleaching proper. Water clarity unchanged.  
Key visual cue: Certain coral colonies appear unexpectedly bright pink or blue; inconsistent "hot spots" of vivid color amid normal-looking reef.

**Stage 2 — Early Bleaching**  
Duration: Days 7–21 (overlaps Stage 1; Acropora bleaches before Porites)  
Visual: Tissue begins to pale as zooxanthellae density drops. Color loss begins at high-stress microhabitats: sun-exposed table tops, branch tips, areas of lowest water flow. The coral appears "washed out" — the same hues but significantly desaturated. Not yet white, more like a faded, bleached-out version of its normal color. *Acropora* tips turning cream-white while bases remain brownish. *Porites* tops pale while flanks retain color.  
Water: Still clear. No visible change.

**Stage 3 — Partial Bleaching**  
Duration: Days 14–45  
Visual: 20–60% of colony surface is chalk-white while remaining areas retain normal or slightly faded coloration. The contrast between white and colored portions is stark. For table corals, the white zone is often the center (lowest flow); for branching corals, the upper third. For Porites domes, the sun-facing top is white while shaded flanks are tanned. The reef landscape has a "patchy" white appearance — scattered white areas amid otherwise normal-looking coral.  
Fish behavior: No change yet at this stage.

**Stage 4 — Full Bleaching**  
Duration: Days 30–90 (peak bleach; coral is alive but without zooxanthellae)  
Visual: Entire colony surface is brilliant, matte white. The coral skeleton shape is fully visible through the transparent tissue. Bleached reef looks like a "white garden" — all the three-dimensional complexity of the reef is preserved, but every coral surface is the same brilliant white. No color differentiation between species; only shape distinguishes them. The visual effect is striking and eerie — a perfect reef that has had all color removed.  
Water: Still clear at Tubbataha (temperature-driven, not sediment-driven). If anything, the white substrate creates unusual brightness in the shallow zones.  
Fish behavior: Some small reef fish (especially coral-dependent species like coral gobies, *Gobiodon* spp.) begin to vacate coral colonies that bleach. Planktivores schooling above the reef show no immediate change.

**Stage 5 — Death and Algae Colonization (if conditions do not improve)**  
Duration: Days 45–90 (coral death may occur); algae colonization: Weeks 1–24 post-death  
Visual progression after death:
- Week 1–2: Dead white skeleton begins to be colonized by pioneer algae. First sign: a faint greenish film (cyanobacteria, filamentous algae) appears over the white surface — the surface now looks "gray-white" rather than brilliant white
- Week 3–6: Turf algae (dense, short, 1–3 mm) covers most dead surfaces in olive-green to dark green. The dead coral architecture is now green-furred, still largely retaining its 3D shape
- Month 2–4: Larger macroalgae (*Lobophora*, *Dictyota*) begin to colonize. Brown leathery lobes appear on flat surfaces; the structure begins to look "shaggy" and brown-green
- Month 4–12: Dead tabletop corals are now unrecognizable — brown-furred flat discs. Dead branching colonies are matted with algae; branch tips may begin to break off. Dead Porites domes are green-brown mounds. The reef visually has shifted from "colorful 3D" to "brown textured mat"
- Year 1–3: Structural erosion begins. Branches crumble; tables lose their edges; the reef becomes lower-relief, smoother. Rubble zones expand.

**Stage 6 — Algae Domination (Phase-Shifted Reef)**  
Duration: Years 1–10+ if conditions don't improve  
Visual: The reef is a mosaic of dead/algae-covered coral structure and rubble. Live coral patches survive in shaded locations, deeper zones, or as stress-tolerant species (massive *Porites* that partially survived). The background color of the reef is olive-brown to dark brown. Fleshy macroalgae (*Lobophora*, *Dictyota*, *Sargassum*) are the visual dominant. Fish diversity and density are radically lower. The "visual loudness" of the reef is gone — instead of dozens of bright colors moving in 3D, there is a subdued, almost monochrome brown landscape.

---

### 3C. Fish Population Response to Coral Decline

Based on published studies (Pratchett et al., 2008 PubMed 17566781; Frisch et al., 2016 Frontiers; Gil et al., research from Yale E360; Fabricius et al. 2005):

**Response sequence (from first decline to worst):**

1. **Obligate coral-associated species disappear first (0–30% coral loss)**  
   Coral gobies (*Gobiodon* spp., *Paragobiodon* spp.) — small fish that live exclusively in live coral branches — immediately vacate bleached colonies. These are tiny (2–4 cm) fish that are invisible in a healthy reef but their disappearance is the first signal. Also: *Chromis* damsels thin out from above bleached corals within weeks.

2. **Large obligate coral feeders decline (30–50% coral loss)**  
   *Bolbometopon muricatum* (bumphead parrotfish) school sizes drop; individuals move to remaining live coral patches. *Chaetodon* butterflyfishes (which feed specifically on coral polyps) lose body condition and redistribute. Napoleon wrasse appear less frequently.

3. **Mid-trophic planktivores fragment schools (40–60% coral loss)**  
   Schooling planktivores (*Chromis* species, *Pseudanthias* squarefoot anthias) reduce school size. The schools that used to hover in tight formations above coral canopies become looser, lower in density, and more erratic in movement. The structural complexity that gave them refuge is degrading.

4. **Predator-prey balance shifts (50–70% coral loss)**  
   With less structural complexity for prey fish to hide in, predators (groupers, snappers, whitetip sharks) initially have easier hunting — but the prey biomass is declining. Herbivores (surgeonfish, smaller parrotfish, *Siganus* rabbitfish) may temporarily increase as algae expands, giving herbivores more to eat.

5. **Herbivore-dominant community establishes (70%+ coral loss, algae dominant)**  
   The fish community reorganizes around the algae-dominated substrate. Herbivore biomass (surgeonfish, smaller parrotfish) may be high but coral-dependent predators, cleaners (due to reduced client diversity), and pelagic-dependent species all reduce. Total species richness falls 30–60% compared to healthy state. Shoaling/schooling behavior changes: planktivore school sizes are now small (5–20 fish) and scattered.

**Key threshold:** Studies suggest that below approximately 20–25% live coral cover, the fish community begins its phase-shift to an algae-adapted community. Above that threshold, fish communities can sustain reasonably healthy structure. Tubbataha currently maintains 49–56% live hard coral cover across monitored sites (2018 SPR data) — well above this threshold.

---

### 3D. Schooling Behavior Specifics for Boids Implementation

**Reference for the simulation:** Tubbataha's primary schooling species available for modeling are the bumphead parrotfish herd, great barracuda tornado, scalloped hammerhead school, and schooling chromis damsels.

---

**Healthy Reef — Boids Parameters**

| Behavior | Barracuda Tornado | Bumphead Herd | Chromis/Anthias Cloud |
|---|---|---|---|
| School size | 50–200 | 20–75 | 50–500 |
| Separation distance | 0.5–1.5 BL | 0.5–1.0 BL | 0.3–0.8 BL |
| Alignment weight | HIGH (0.7–0.9) | MEDIUM (0.4–0.6) | HIGH (0.6–0.8) |
| Cohesion weight | HIGH (0.7–0.9) | MEDIUM (0.4–0.6) | HIGH (0.7–0.9) |
| Separation weight | MEDIUM (0.3–0.5) | LOW-MEDIUM (0.3–0.5) | MEDIUM (0.4–0.6) |
| Motion type | Rotating vortex; consistent rotation | Slow grazing front; directional | Hovering cloud above coral; oscillating |
| Speed variance | Very LOW (<5%) | LOW-MEDIUM (10–20%) | MEDIUM (15–25%) |
| Formation geometry | Cylinder/torus | Elongated ellipse | Irregular sphere/cloud |
| Directional coherence | Very HIGH | HIGH | HIGH |

**Stressed/Degraded Reef — Boids Parameter Changes**

| Parameter | Change | Effect |
|---|---|---|
| School size | Reduce by 40–70% | Fewer agents; smaller schools |
| Separation distance | INCREASE by 50–100% | Looser, more scattered formation |
| Alignment weight | DECREASE by 30–50% | More erratic individual headings |
| Cohesion weight | DECREASE by 30–50% | School fragments into sub-groups |
| Separation weight | INCREASE slightly | Avoidance-dominant behavior |
| Motion type | Disrupted; no stable pattern | Random or broken rotation/march |
| Speed variance | HIGH (30–50%) | Individuals at very different speeds |
| Formation geometry | Dissolves; becomes irregular cluster or dispersed individuals | |
| Directional coherence | LOW | School "wanders" without purpose |

**Implementation guidance:**  
The transition between healthy and stressed boids behavior should be parameter-interpolated rather than discrete. A reef at 0.5 on the Cohesion parameter map (see Section 4) should use parameters interpolated between the two states above. The key visual "tells" of a healthy school that degrade progressively are: (1) size shrinks, (2) rotation/formation loses precision, (3) individuals at the periphery start acting independently, (4) the core of the school thins and fragments.

**Scalloped hammerhead school (special case):**  
Hammerhead aggregations at Tubbataha occur at depth (30–70 m) along the wall and at Jessie Beazley Reef. School sizes: 20–100+ at Tubbataha (up to 700 at some Coral Triangle seamounts). The formation is not a tight school but a loose aggregation that circles slowly around a central point (the seamount or wall feature). Individuals maintain 2–4 m separation. The school has a strong center-of-mass they orbit, not a linear heading. In healthy conditions, the school is large and the orbit radius is tight (50–100 m diameter). In stressed/disturbed conditions, individuals scatter and the orbit breaks down — the school dissolves into singles or pairs.

---

### 3E. Cascade Effects — Degradation Sequence

The following sequence is the authoritative order for this visualization. Each arrow represents the transition to the next stage.

**→ Stage 1: Temperature rise / thermal event (Days 1–14)**  
First visual: Colorful bleaching (fluorescent pinks, blues on stressed Acropora). Water still crystalline.  
Fish behavior: Unchanged.

**→ Stage 2: Bleaching begins (Weeks 2–6)**  
First visual: Patchy white on Acropora; Porites tops pale. Table corals develop white centers. Sea fans and giant clams are not yet visibly affected.  
Fish behavior: Coral gobies and small damselfish begin vacating bleaching colonies; subtle scatter in the chromis clouds above.

**→ Stage 3: Widespread bleaching (Weeks 4–12)**  
Visual: 30–80% of Acropora is white. Porites partially bleached. The reef goes from earth-toned to a surreal white garden. Fish behavior: Bumphead parrotfish school size visibly smaller. Barracuda school thins slightly. Cleaning stations less busy. Napoleon wrasse sightings less frequent.

**→ Stage 4: Coral mortality begins (Weeks 8–16, if temperature persists)**  
Visual: White surfaces begin developing gray-green film (algae pioneer colonization). First dead Acropora structures show green turf. Live coral patches remain but in refugia (shaded areas, deeper zones, robust Porites). Fish: obligate coral-associated fish (coral gobies, some butterflyfishes) populations crash. School sizes at 50% of baseline.

**→ Stage 5: Algae expansion (Months 2–6)**  
Visual: Dead coral surfaces transition from green turf to brown macroalgae (Lobophora, Dictyota). Reef transitions from white-and-normal to brown-textured. *Halimeda* expands from interstitial zones onto dead surfaces. Water may remain clear (Tubbataha, no terrestrial input) or begin to show slight green tint if algae-derived nutrients are high.  
Fish: Mid-trophic planktivore schools at 30–40% of baseline size. Herbivores (surgeonfish, smaller parrotfish) may temporarily increase as algae provides food.

**→ Stage 6: Phase shift (Months 6–24)**  
Visual: Algae-dominated substrate with isolated live coral pockets. Low-relief, brown landscape. Structural complexity reduced as dead coral erodes. Rubble zones expand. Water clarity slightly reduced — algae-derived organic particles increase turbidity marginally.  
Fish: Species-poor community. No large schooling formations. No Napoleon wrasse. No bumphead parrotfish. Barracuda dispersed. Whitetip reef sharks absent. Herbivorous fish numerically dominant but ecologically simplified.

---

### 3F. Recovery Timeline

**Recovery is non-linear and depends on:**
- Absence of repeat bleaching events (the primary limiter)
- Herbivore fish biomass (urchins and parrotfish control algae competitively during recovery)
- Availability of coral larvae (Tubbataha's remote position and remaining populations mean larvae supply is adequate in most scenarios)
- Water quality (Tubbataha: excellent; no new threat from terrestrial input)

| Component | Recovery Timeline | Visual Signal of Recovery |
|---|---|---|
| Algae recedes from dead coral surface | 1–3 months (if herbivores intact) | Bare dead skeleton re-emerges through algae; gray-white patches appear in brown mat |
| Crustose coralline algae (CCA) colonizes dead surfaces | 2–6 months | Pink/mauve encrusting layer over bare dead skeleton — a positive sign |
| First coral recruits visible | 6–18 months | Tiny (3–8 mm) white dots on CCA surfaces — require magnification/close approach |
| Coral recruits visible to naked eye | 18 months – 3 years | Coin-sized patches of color on previously bare surfaces |
| Reef structural complexity begins recovering | 3–7 years | Branching structure begins to rebuild; table coral juveniles visible; Porites domes grow outward |
| Obligate coral-associated fish return | 2–5 years (after coral recruits establish) | Coral gobies return; chromis clouds re-establish above recovering coral |
| Large reef fish return (Napoleon wrasse, bumphead parrotfish) | 5–15 years | Bumphead herd size recovers to 15–20; Napoleon wrasse sighted again |
| Full coral cover recovery | 9–15 years (without repeat disturbance) | Live hard coral cover exceeds 40%; reef visually indistinguishable from pre-bleach state |

**Recovery visual sequence for animation:**  
1. Algae mat develops faded look → 2. Pink CCA spots appear through algae → 3. Tiny white coral recruits visible → 4. Recruits grow into small colored colonies → 5. Structural complexity increases → 6. Color palette of reef rebounds → 7. Fish schools re-form and grow → 8. Apex species (Napoleon, bumphead, sharks) return

---

## 4. PARAMETER MAPPING TABLE

The visualization maps three organizational survey questions to three reef parameters. The tables below define the exact visual state for each parameter value.

---

### Parameter 0: FULFILLMENT → Coral Vitality
*Survey Question: "How meaningful does your work feel?"*  
*Ecological proxy: Live hard coral cover, coral color saturation, bleaching state*

| Value | Ecosystem Visual State | Specific Visual Cues | Species Visible / Absent | Lighting & Water |
|---|---|---|---|---|
| **0.0** | Phase-shifted, algae-dominated reef. Coral effectively absent. | Substrate 60–80% covered by dark olive-brown macroalgae (*Lobophora*, *Dictyota*). Dead Porites domes are recognizable shapes but covered in brown fur. Dead table corals are flat brown discs. Rubble zones dominant. No live coral color visible except in deepest shaded areas. | Absent: Bumphead parrotfish, Napoleon wrasse, coral gobies, most butterflyfishes. Present: Surgeonfish (in loose groups), rabbitfish, small wrasses foraging in algae; rare CoTS visible. | Dim, greenish-gray water tint (algae-derived turbidity). Flat, low-contrast lighting. Reduced light penetration. |
| **0.25** | Heavily bleached reef post-thermal event. Significant coral mortality in progress. | 40–60% of corals are brilliant white (bleached). Some corals visibly beginning algae colonization (gray-green film on previously white skeleton). A few live coral pockets remain — visible as colored "islands" in white landscape. Table coral shapes intact but white. Giant clams with pale/retracted mantles. | Absent: Bumphead parrotfish (school <5), Napoleon wrasse rare. Present: Some chromis damsels but scattered (not schooling); surgeonfish; small cleaner wrasse at stations with few clients; whitetip sharks rare. | Clear water but with eerie brightness — the white coral substrate bounces light strongly upward, creating a washed-out, high-key illumination. Warm water color (bleaching events correlate with warm, calm conditions). |
| **0.50** | Moderately stressed reef. Mix of healthy and bleached/recovering coral. | ~40% live hard coral (comparable to lower Tubbataha sites in stressed years). Patchy bleaching: some Acropora tables with white centers and colored margins; Porites domes with pale tops; branching colonies partially bleached. Brown algae visible on 20–30% of dead surfaces. Giant clams with reduced mantle color. Gorgonian fans present but some with retracted polyps. | Present: Bumphead parrotfish herd of 8–15; Napoleon wrasse present but elusive; barracuda school of 30–50 (loose formation); whitetip sharks daytime resting visible; cleaner wrasse operating with moderate traffic. Absent: Whale sharks, scalloped hammerheads (rare). | Clear, warm-blue water. Normal lighting but some warm-yellow cast reflecting off partially bleached substrate. Good visibility (25+ m). |
| **0.75** | Healthy reef, slightly below peak. Strong live coral cover with minor stress indicators. | ~50–55% live hard coral. Acropora tables with full color plus blue-pink growing margins. Branching staghorn thickets dense and well-colored. Porites domes tan-olive with healthy surface detail. Giant clams with vivid mantle colors (blue, green, gold). Gorgonian fans fully extended, polyps visible. Very minimal bare substrate. | Present: Bumphead parrotfish herd of 20–40; Napoleon wrasse patrol visible 1–2 per dive; barracuda school 50–100 in loose tornado; chromis and anthias clouds above coral; whitetip sharks resting in groups; cleaner wrasse active stations with groupers, turtles as clients. | Deep blue-indigo water with excellent clarity (30+ m visibility). Strong light shafts. Rich color palette — warm corals below, cool blue above. |
| **1.0** | Peak health reef. Tubbataha optimal condition (equivalent to best 2018 SPR sites, 55–60% LHC). | Dense live coral across all depth zones. Acropora hyacinthus tables in stacked tiers with luminous blue-pink margins. Staghorn thickets of deep blue-gray. Massive Porites domes with perfect tan-olive coloration. Giant clam mantles in full electric blue/gold/green display. Gorgonian fans swaying in current with every polyp extended. Halimeda in interstitial zones only — vivid green accents. No visible dead coral surfaces. | All species present at peak density: Bumphead parrotfish herd 40–75; Napoleon wrasse 1–3 visible; barracuda tornado at full size (100–200 fish, tight rotation); scalloped hammerhead school in blue water at depth; chromis/anthias clouds dense above coral canopy; cleaning stations busy with sharks, mantas, turtles as clients; whitetip shark groups resting and evening hunt visible; giant clams fully open. | Perfect crystal-clear blue-indigo water (40+ m visibility). Strong light shafts illuminating the coral at 5–15 m. Vivid chromatic contrast between the warm reef palette and the cold blue of open water. A "cathedral" quality to the light at depth. |

---

### Parameter 1: COHESION → Fish Population & Schooling
*Survey Question: "How connected do you feel to people you work with?"*  
*Ecological proxy: Fish school density, formation coherence, inter-species mutualism activity*

| Value | Ecosystem Visual State | Specific Visual Cues | Species Visible / Absent | Lighting & Water |
|---|---|---|---|---|
| **0.0** | Deserted reef. Fish populations collapsed. No schooling behavior visible. | Individual fish only — small, isolated. Surgeonfish scattered across algae-covered substrate. No mid-water schooling formations. No cleaning station activity. No large aggregations anywhere in scene. | Present: Scattered surgeonfish, small wrasses, a few isolated damselfish in corners of remaining structure. Absent: Bumphead herds, barracuda schools, chromis clouds, Napoleon wrasse, sharks, manta rays, cleaning station fish. | Any water/light quality — the emptiness is behavioral, not physical. The scene feels abandoned. |
| **0.25** | Fragmented schools. Small groups, no coherent formations. | Barracuda visible as loose groups of 10–20, no tornado formation. Bumphead parrotfish as solitary individuals or pairs (not a herd). Chromis damsels in micro-groups of 5–15 scattered among coral. Cleaning stations occasionally active but with only small fish. No planktivore clouds. | Present in low numbers: Small parrotfish groups, isolated Napoleon wrasse (if reef quality supports), scattered chromis. Absent: Schooling formations (barracuda tornado, bumphead herd), scalloped hammerhead school, cleaning station traffic from megafauna. | Neutral water quality. Behavior-driven emptiness. |
| **0.50** | Moderate schooling activity. Schools present but smaller than optimal. | Barracuda school of 30–60 individuals in a loose, irregular spiral (not tight tornado). Bumphead herd of 10–20 with moderate formation coherence. Chromis clouds at medium density. Two or three cleaning stations active with moderate client traffic (groupers, turtles). Whitetip shark group of 3–6 resting visibly. | Present: Most species but at reduced density. Napoleon wrasse present. Cleaner wrasse active. Sharks present. Absent at this level: Scalloped hammerhead school (requires high cohesion), manta ray aggregation at cleaning station. | Normal water quality. |
| **0.75** | Strong schooling behavior. Tight formations and active mutualism. | Barracuda tornado: 80–120 fish, tight rotation with visible silver synchrony. Bumphead herd: 25–50 with coordinated grazing front. Chromis/anthias clouds dense and pulsing above coral canopy. Cleaner wrasse stations busy with all sizes of client fish, including occasional turtle. One Napoleon wrasse visible per scene area. Whitetip shark group of 8–12 resting. | All common species present at good density. Possible: scalloped hammerhead group at depth (5–10 individuals visible). Cleaning station traffic includes large species. | Clear water enhances visual impact of tight schools — silver flashes from barracuda tornado visible at distance. |
| **1.0** | Peak schooling and mutualism. All formations at maximum coherence. | Barracuda tornado: 150–200 fish, hyper-synchronized, slow deliberate rotation clearly visible. Bumphead herd: 50–75 individuals in coordinated grazing front with audible reef-biting. Chromis/anthias clouds thick above every major coral head. Scalloped hammerhead school of 20–40 visible at depth. Manta ray at cleaning station in circular hover pattern with 3–5 mantas queued. Cleaning stations servicing sharks, turtles, large groupers simultaneously. Whitetip shark pack of 15+ visible in resting aggregate. | All species at peak density and behavior. Multiple Napoleon wrasse visible. Giant clams with maximum mantle display (iridescent). School formations exhibit maximum geometric precision. | Crystal water maximizes the visual impact of schooling silver flash from barracuda. Deep blue penetrates to maximum depth, silhouetting hammerheads dramatically. |

---

### Parameter 2: MISSION CONFIDENCE → Water Clarity & Environment
*Survey Question: "How confident are you the company is heading in the right direction?"*  
*Ecological proxy: Water clarity/turbidity, light quality, overall environmental condition*

| Value | Ecosystem Visual State | Specific Visual Cues | Species Visible / Absent | Lighting & Water |
|---|---|---|---|---|
| **0.0** | Catastrophic turbidity. Near-zero visibility. Reef in darkness. | Water is murky green-brown. Visibility: <2 m. A diver could not see their hand at arm's length from full extension. Reef structure invisible from any distance. Suspended particles visible as moving specks in low ambient light. Coral surfaces coated in fine brown sediment (sedimentation smothering). Particulate matter visible settling on flat surfaces. | All species functionally invisible at visual range. Feeding behavior disrupted (filter feeders retracted; planktivores cannot find food; predators' hunting disrupted). No schooling visible. The ecosystem continues to exist but cannot be "seen." | Near-total darkness at depth. Surface light barely penetrates. Green-brown color cast. No light shafts. Flat, diffuse illumination at maximum <1 m depth. |
| **0.25** | Poor water quality. Elevated turbidity and nutrient levels. Visible haze. | Water is murky green-gray. Visibility: 5–10 m. Distant coral structures visible as blurry shapes only. Algae growth accelerated on visible coral surfaces. Gorgonian fans still present but fewer polyps extended (reduced current food quality). Fine particulate matter visible throughout water column. Coral surfaces have thin sediment film on horizontal surfaces. Giant clams partially open (reduced water quality triggers caution). | Present but limited visual range: Fish visible only close-up. Schooling formations smaller and closer to substrate (less mid-water exposure). Gorgonian polyps partially retracted. Napoleon wrasse present but behavior uncertain. Cleaning stations reduced activity. | Green-gray water tint. Weak light shafts — visible but diffuse and short. No dramatic blue penetration. Depth feels compressive — no sense of infinite blue below. |
| **0.50** | Moderate clarity. Slightly reduced from ideal but functional reef conditions. | Water is blue-green rather than pure blue-indigo. Visibility: 15–20 m. Distant reef structures visible but lack the crisp clarity of peak conditions. Gorgonian fans well-established on walls. Coral colors slightly desaturated from ambient green-blue light cast. Giant clams normally open. Fine particulate matter not visible; no sediment film. | All species present and visible within reduced range. Schooling formations visible at shorter distance. Normal behavior across all species. Diving "envelope" is tighter but conditions remain healthy. | Blue-green water. Some light shafts but softer. Visibility creates moderate "depth mystery" — features at 15–20 m visible but less crisp. Wall still dramatic but horizon limited. |
| **0.75** | Good clarity. Near-optimal water quality. | Water is clear deep blue. Visibility: 25–35 m. Distant coral structures visible with good detail. Gorgonian fans swaying visibly on deep wall. Light shafts prominent — 5–8 distinct shafts visible simultaneously penetrating from surface. Giant clams fully open with vivid mantle display. All benthic zones visible simultaneously from mid-water. | All species present in full activity. Hammerhead school at depth visible as distant silhouettes against blue. Barracuda tornado visible at 25 m range. Wall drops clearly visible to 30+ m. | Blue water. Strong light shafts. Good depth of field. The reef communicates the feeling of openness and clarity. |
| **1.0** | Perfect clarity. Tubbataha peak-season conditions. | Water is brilliant blue-indigo — the quintessential "Tubbataha blue." Visibility: 35–40+ m. The 100 m wall appears in its full scale (perceptually compressed to appear 30 m but fully detailed). Gorgonian fans at 25–35 m visible and fully detailed from 20 m away. Light shafts are crisp, well-defined columns 40–60 m long, creating cathedral-quality illumination. Giant clams open, mantle iridescence visible from 5+ m. Surface light sparkle visible from depth (caustic patterns on shallow reef). | Full species inventory present and visible at maximum range. Barracuda tornado visible at 30 m distance as a cohesive silver cylinder. Scalloped hammerhead school silhouetted against deep blue at 40 m distance. Napoleon wrasse visible as a distinct large fish at 25 m range. Every coral color saturated — the scene is visually "loud." | Crystal-clear blue-indigo. Maximum light shaft drama. Caustic patterns on shallow reef floor. The blue of open water off the wall edge is a deep, saturated indigo-navy that grades to black at depth. |

---

## 5. SIDE QUEST VISUAL EVENTS

The following are real, documented ecological events that occur at or near Tubbataha Reefs Natural Park. Each is rare enough to justify being a "reward" event while being spectacular enough to serve as a visual payoff for a completed side quest.

---

### Event 1: Mass Coral Spawning — "The Snowstorm"

**Scientific basis:**  
Synchronized broadcast spawning is one of the most extraordinary events in the ocean. Multiple coral species simultaneously release gametes (egg-sperm bundles) into the water column over 1–5 nights following the full moon in the spring, coordinated by temperature, moonlight, and day length. In the Philippines, Acropora spawning events have been recorded 9–11 days after the March full moon; researchers documented at least 8 *Acropora* species spawning simultaneously in the Sulu Sea (Research publication: Coral spawning and spawn-slick observation in the Philippines, ResearchGate).

**What it looks like:**  
At dusk (approximately 2000 hours), individual coral polyps eject tiny buoyant bundles — each 1–3 mm diameter, bright pink, orange, or cream — which rise slowly from the coral surface in columns. Within 30 minutes, bundles from thousands of colonies create the effect of an "underwater snowstorm" or "upward-falling snow globe" — billions of small spheres ascending uniformly through the water column. The bundles are buoyant (fat-filled) and drift visibly with any current.

At the surface, bundles accumulate into a visible spawn slick — a pink-white scum layer on the water surface that can stretch for hundreds of meters downwind. Back below, the water column at mid-depth is thick with rising bundles — visibility through the gamete cloud drops to 2–5 m, not from turbidity but from the density of particles.

**Three.js implementation guidance:**  
- Particle system: 50,000–200,000 pink/orange/cream spherical particles (radius 0.5–2 units at reef scale)
- Behavior: Each particle rises at 0.05–0.15 m/s with slight lateral drift (current) and gentle random wobble. Not uniform — staggered release from each coral colony
- Origin: Particles emit from each live coral colony surface; density proportional to coral coverage
- Color: Pink (#FFB3C1), orange-cream (#FFDAB9), white-cream (#FFF5E4) — vary by "species"
- Visual effect should look like upward snow with gentle lateral drift; bundles visible as individual spheres close-up, merging into colored haze at distance
- Duration in nature: 1–5 nights; main event each night lasts approximately 1–2 hours
- Suggested display duration: 3–4 minutes (compressed to the peak hour)

**Rarity / trigger:**  
In nature: Once per year, lunar-triggered, at exact temperature conditions. Visible to divers only a few nights per year. Entirely predictable only in retrospect. For the visualization, appropriately rare — perhaps the rarest event trigger.

**Species involved:** Multiple Acropora species (*A. hyacinthus*, *A. brueggemanni*, *A. florida*, others), some Porites, various other broadcast-spawning corals. Bumphead parrotfish, wrasses, and other fish feed on bundles (visible as fish swarming upward through the rising gamete cloud — an active feeding frenzy in reverse-direction).

---

### Event 2: Bumphead Parrotfish Spawning Aggregation — "The Dawn Charge"

**Scientific basis:**  
Giant bumphead parrotfish form pre-dawn spawning aggregations at specific locations on Tubbataha's reef. Research (PMC4250069; Bolbometopon muricatum spawning aggregation ecology, Palau) documents aggregations of 50–1,200 individuals gathering at channel mouths and reef promontories in the early morning hours (0600–0935 local time), concentrated around the full and last quarter moon. Males develop a blanched white face and white vertical body bars as breeding coloration.

**What it looks like:**  
At dawn, the aggregation assembles from the reef: groups of bumphead parrotfish converge from different directions onto the aggregation site, coalescing into a tight milling mass. Males actively court females, performing slow ascending "loops" from the reef bottom to within 0.5–1 m of the surface in an exaggerated, slow-motion swimming display — their huge green-blue bodies rising and falling in slow arcs. When a pair is ready, they swim upward side by side and release gametes near the surface, sometimes actually breaching the surface in the act. The entire aggregation is extraordinarily loud — the reef cracking, biting sounds of 50–100 large parrotfish feeding and moving is audible from 30 m away.

**Three.js implementation guidance:**  
- 50–100 large bumphead parrotfish agents converging to a single reef location
- Male agents (50% of total): Blanched face (desaturate green head to cream-yellow), white vertical body bars added
- Courtship loop animation: Individual agents perform slow ascending spiral from bottom (−5 m from reef surface) to −0.5 m from water surface, then descend; loop takes 30–60 seconds
- Spawning pair: Two agents approach, align, rise together in 45-degree ascent, reach surface, brief surface break (agent reaches 0), gamete particle burst (white cloud, 200–500 small particles), descend
- Background behavior: Remaining agents mill slowly in the formation area, loosely circling
- Duration in nature: 3–4 hours (0600–0935); suggested display duration: 2–3 minutes

**Rarity / trigger:**  
Lunar-dependent; occurs monthly around full/last quarter moon at specific sites. Rarely witnessed by divers due to early dawn timing and the need to be at the exact aggregation site. At protected sites like Tubbataha, aggregations are large; at unprotected sites, this behavior has been extirpated.

**Species involved:** *Bolbometopon muricatum* (primary). Attracted observers: Napoleon wrasse (opportunistic feeding), grey reef sharks (attracted to spawning activity), barracuda schooling nearby.

---

### Event 3: Manta Ray Cleaning Station — "The Spa Queue"

**Scientific basis:**  
At Tubbataha's Black Rock site, a well-documented cleaning station services oceanic and reef manta rays (*Manta birostris* and *Mobula alfredi*). Up to 66–80% of identified individual manta rays at productive cleaning stations have been documented visiting multiple times (Frontiers in Fish Science, 2024, Bird's Head Seascape study). Mantas form literal queues at busy stations, waiting their turn.

**What it looks like:**  
A 2–5 m diameter coral head or gorgonian cluster is the station. 3–6 manta rays hover in the water column above the station at different depths, moving in slow, overlapping circles with 5–10 m radius. The manta at the lowest point — closest to the cleaning station — is "in service": hovering nearly motionless, both cephalic fins extended forward and curled inward (from rolled/folded into the "ram" position to the "feeding/cleaning" position), mouth open wide, gill slits flared. The manta's wingspan is 2–4 m; seen from below, the white patterned ventral surface is visible. The cleaner wrasse moves across the manta's dorsal surface, gills, and occasionally into the open mouth.

Above, 2–4 more mantas orbit in slow patient circles at 3–8 m altitude above the station, occasionally dipping lower as if checking when it's their turn. The wingspans of multiple mantas in close proximity create a remarkable sense of scale — vast diamond shapes moving in slow synchronized arcs.

**Three.js implementation guidance:**  
- Cleaning station: A specific coral head location (a large Porites dome is suitable)
- Station cleaner wrasse: 2–3 cleaner wrasse in exaggerated "dance" animation at the station surface
- Manta queue: 3–5 manta ray agents in wide (8–12 m radius) slow circular orbits at 3–8 m above station; circular motion at 0.3–0.5 m/s
- Active client: 1 manta per turn descending to hover at 1–2 m above station; cephalic fins extended; hovering with minimal tail movement; duration 1–5 minutes per client
- Transition: When active client departs, next manta in queue descends; smooth spiral descent animation
- Duration in nature: Station operates throughout the day; manta visits are 1–5 minutes each
- Suggested display duration: 3–4 minutes, showing 2–3 manta transitions

**Rarity / trigger:**  
Cleaning stations are predictable features of healthy reefs, but manta aggregations at them require: active cleaner wrasse population, high manta density, and high water quality. The simultaneous presence of multiple mantas queuing is genuinely unusual. For the visualization, this event could be triggered by combined high Cohesion AND high Mission Confidence parameters.

**Species involved:** *Mobula alfredi* (reef manta ray), *Manta birostris* (oceanic manta ray), *Labroides dimidiatus* (bluestreak cleaner wrasse). Attending observers: hawksbill turtles occasionally join cleaning queues; Napoleon wrasse present nearby.

---

### Event 4: Whitetip Reef Shark Nocturnal Hunt — "The Night Pack"

**Scientific basis:**  
After dark at Tubbataha, whitetip reef sharks (*Triaenodon obesus*) that spent the day resting in their caves emerge and hunt the reef in small coordinated groups. Whitetip reef sharks are well-documented as nocturnal cooperative hunters (elasmo-research.org; multiple behavioral studies). Their hunting involves 3–8 sharks working the same coral head simultaneously, each pursuing prey into different crevices — a behavior described as "surrounding" the coral.

**What it looks like:**  
From a diver's viewpoint (or camera): The reef at night is dark, lit only by ambient bioluminescence and the low ambient light penetrating from above. The scene is dark blue-indigo, with coral shapes visible primarily by form.

4–8 whitetip reef sharks, each 1.2–1.6 m, move rapidly over and through the reef structure. Their white-tipped fins catch what little light exists — intermittent white flashes as they turn and roll. The group converges on a single coral head: one shark pushes its blunt snout forcefully into a crevice; another circles the other side; a third rises over the top; the coral physically shudders as the shark pushes against it. A prey fish (small grouper, wrasse, or goatfish) bolts from the crevice — immediately two or three sharks pursue it simultaneously into open water.

The bioluminescent cue: As sharks and their prey move rapidly through plankton-rich water, dinoflagellate bioluminescence creates flashes of blue-green light in the sharks' wakes and at the points of water disturbance. This is a real phenomenon at Tubbataha — fast-moving objects at night create brief bioluminescent trails.

**Three.js implementation guidance:**  
- Time: Night scene; shift sky/ambient to very dark blue-black
- 4–8 whitetip shark agents; each 1.2–1.6 m, slender grey with white-tipped dorsal and caudal fins
- Behavior: Coordinated convergence on a reef structure; high-speed (3–5 m/s) approach followed by slow (0.5–1 m/s) investigative circling; sudden fast pursuit sequences (up to 8 m/s for 2–3 seconds)
- Bioluminescent trail: Each shark and rapidly moving fish leaves a brief (0.5–1.5 s) trail of emissive blue-green particles (hex #40E0D0 to #0080FF) that fade quickly; density of particles proportional to movement speed
- Coral physical interaction: Sharks visible "pressing" into coral structures; brief camera shake or object movement animation
- Ambient light: Minimal — reef visible by form only; sharks' white fin tips as the primary visual "lights"
- Duration: Hunt sequences occur throughout the night; suggested display: 2–3 minutes, showing 2–3 prey flush/chase sequences

**Rarity / trigger:**  
Night behavior only; not visible during typical daytime visualization. The full nocturnal hunt with bioluminescent display is rarely witnessed. This would be an appropriate night-only side quest event.

**Species involved:** *Triaenodon obesus* (whitetip reef sharks), prey fish (small groupers *Cephalopholis* spp., wrasses *Thalassoma* spp., sleeping parrotfish *Scarus* spp. in their mucus cocoons). Bioluminescent dinoflagellates (Noctiluca scintillans and related genera, present throughout the Sulu Sea).

---

### Event 5: Scalloped Hammerhead Shark School — "The Deep Vortex"

**Scientific basis:**  
Scalloped hammerhead sharks (*Sphyrna lewini*) aggregate in large schools at Tubbataha's Malayan Wall and Jessie Beazley Reef, particularly along deep wall sections at 30–70 m depth. Schools of 20–100+ individuals are documented at Tubbataha (Guide to the Philippines, diving accounts); globally, schools at similar seamount sites reach 700 individuals (ICES Journal of Marine Science, 2023; University of California papers on Gulf of California aggregations). Schools consist primarily of females.

**What it looks like:**  
Descending along Tubbataha's wall at 30–50 m depth, in the deep blue where sunlight has become directional and blue-dominant, a dark "cloud" appears in the mid-water. As it resolves, it becomes recognizable as dozens of large sharks — 2–3 m individuals — circling slowly in a loose elliptical school. The hammerhead's silhouette is immediately identifiable: the wide cephalofoil (hammer) creates a distinctive T-shaped frontal profile that no other animal has. In a school, the overlapping T-shapes at different angles and depths create a complex visual — a fractal-like pattern of hammer shapes at varying distances and orientations.

The school moves as a slow vortex: individuals circle a central axis slowly (taking 2–4 minutes per orbit), maintaining 2–4 m separation. The outer edge of the school is at 15–20 m radius from center; the school may span 30–40 m across and 10–20 m vertically. Against the deep blue wall backdrop, the gray-brown school appears to float, slowly rotating — a mesmerizing, scale-defying sight.

**Three.js implementation guidance:**  
- Depth: 35–60 m; render at depth with appropriate light attenuation (deep blue-filtered light)
- 30–80 shark agents; each 2.2–2.8 m, classic hammerhead silhouette
- Color: Upper body gray-brown (hex #7B8B6F to #8B9690), white belly, slight iridescence on dorsal surface in filtered light
- Formation: Loose vortex — each agent orbits a central point with radius 15–25 m; orbit period 90–180 seconds per revolution; agents maintain loose separation (2–4 m), occasional close passes
- Speed: 0.5–1.0 m/s constant; very smooth, no acceleration events (school mode is passive)
- Light: At this depth, shafts of light from above are thin beams; the school is partially in and out of these beams, creating dramatic intermittent illumination of individual sharks
- Visual drama: The T-shaped silhouette of each shark against the deep indigo water is the key visual element — maximize profile visibility
- Duration: Schools maintain formation for hours; suggested display: 3–4 minutes of slow rotation, with camera slowly circling the school

**Rarity / trigger:**  
Hammerhead schools are present March–June at Tubbataha (the diving season) but require descent to 30–50 m along the wall — not visible from the shallow reef. For the visualization, triggering this requires all three parameters at high values (high Fulfillment + high Cohesion + high Mission Confidence = perfect reef = reward of the deep school).

**Species involved:** *Sphyrna lewini* (scalloped hammerhead shark), attended by grey reef sharks (*Carcharhinus amblyrhynchos*) and occasional silvertip sharks (*Carcharhinus albimarginatus*) at the school periphery.

---

### Event 6: Crown-of-Thorns Starfish Control Event — "The Wrasse Strike"

**Scientific basis:**  
Napoleon wrasse (*Cheilinus undulatus*) are one of the very few natural predators of crown-of-thorns starfish (CoTS). Their thick lips and robust teeth allow them to consume the venomous, spine-covered *Acanthaster planci* without harm — a predation event that cannot be performed by virtually any other reef fish. This ecological service is documented in multiple reviews of CoTS control (AIMS CoTS reports; Côté & Maljković, 2010). The Napoleon wrasse's role as a CoTS predator is considered a keystone ecological function that links the population of an apex herbivore with the control of the worst single biotic threat to Indo-Pacific coral reefs.

**What it looks like:**  
A single large Napoleon wrasse (1.8–2 m, deep blue-green body, distinctive facial hump and yellow-line reticulation) approaches a crown-of-thorns starfish on the reef surface. The CoTS is vivid: red-orange with venomous black-tipped spines, 30–40 cm across, currently feeding on a coral head (visible as a white "feeding scar" beneath it).

The Napoleon wrasse approaches slowly, then with a rapid turn engages the starfish with its thick lips — gripping a central body section or an arm and pulling. The CoTS curls its arms defensively, spines erected at maximum. The wrasse continues to maneuver, biting and repositioning, its large mouth capable of wrapping around the starfish body. The ingestion is not graceful — it takes several bites and 2–5 minutes to consume a large CoTS — but the outcome is unambiguous. The wrasse swims away; the coral head, previously being consumed, begins to recover.

This is simultaneously visually dramatic (a large predator consuming a venomous, spiny prey item) and ecologically profound (a single wrasse act spares potentially 12 m² of annual coral from a single CoTS).

**Three.js implementation guidance:**  
- Setup: A large *Porites* dome with a Crown-of-Thorns starfish on its surface; white bare-skeleton feeding scar visible under the CoTS
- Napoleon wrasse: 1.8 m, deep blue-green body, yellow facial reticulation, prominent hump; approaches from mid-water in a slow arc
- CoTS: 35–45 cm, orange-red with dark-tipped spines; animate arms curling defensively when wrasse approaches
- Predation sequence: Wrasse close approach → wide mouth gape → grab animation → shaking head motion → 3–5 bite animations over 30–60 seconds → CoTS model diminishes/disappears
- Post-consumption: Wrasse moves on, leaving the coral surface intact; the feeding scar on the coral begins a faint re-pigmentation animation (slow, 20–30 second return of color at the scar edge)
- Duration in nature: Full consumption 2–10 minutes; suggested display: 2–3 minutes (compressed)

**Rarity / trigger:**  
This event requires both a CoTS present (a stress indicator) and a Napoleon wrasse present (a high reef quality indicator) — a contradictory pairing that represents a reef under moderate stress but still protected. It could be triggered by a specific survey state: high Fulfillment (Napoleon wrasse present) combined with moderate Mission Confidence (some degradation occurring). The "control event" is the narrative of the reef defending itself.

**Species involved:** *Cheilinus undulatus* (Napoleon/humphead wrasse), *Acanthaster planci* (crown-of-thorns starfish), indirect beneficiary: *Acropora hyacinthus* or *Porites lobata* being protected from further CoTS feeding.

---

## Appendix: Key Sources and Monitoring Programs

**Primary ecological sources consulted:**
- UNESCO World Heritage Centre — Tubbataha Reefs Natural Park nomination dossier and State of Conservation reports (2009, 2020): [https://whc.unesco.org/en/list/653/](https://whc.unesco.org/en/list/653/)
- IUCN World Heritage Outlook 2020 — Tubbataha Reefs Natural Park: [https://worldheritageoutlook.iucn.org/node/1062](https://worldheritageoutlook.iucn.org/node/1062)
- Unico Conservation Foundation 2018 SPR Report Tubbataha: [https://unicoconservationfoundation.org.au/philippine-reefs/2018-spr-report-tubbataha/](https://unicoconservationfoundation.org.au/philippine-reefs/2018-spr-report-tubbataha/)
- Smithsonian Ocean — Tubbataha Reefs Natural Park: [https://ocean.si.edu/ecosystems/coral-reefs/tubbataha-reefs-natural-park-philippines](https://ocean.si.edu/ecosystems/coral-reefs/tubbataha-reefs-natural-park-philippines)
- GCRMN (Global Coral Reef Monitoring Network) — global reef status reports; [https://gcrmn.net/](https://gcrmn.net/)
- ReefCheck Philippines monitoring program
- Fabricius et al., 2005 — water quality effects on reefs
- Hughes et al., 2017 — global bleaching and thermal stress
- PMC4250069 — Spawning aggregation of bumphead parrotfish *Bolbometopon muricatum*
- Frontiers in Conservation Science 2023 — shoaling size reduction under reef degradation (doi: 10.3389/fcosc.2023.1229513)
- Coral spawning Philippines: ResearchGate publication 315096085
- Dive-the-world.com Tubbataha diving guide: [https://www.dive-the-world.com/diving-sites-philippines-tubbataha.php](https://www.dive-the-world.com/diving-sites-philippines-tubbataha.php)
- ICES Journal of Marine Science 2023 — scalloped hammerhead school characterization (doi: 10.1093/icesjms/fsad135)
- AIMS Crown-of-Thorns Starfish program: [https://www.aims.gov.au/research-topics/marine-life/crown-thorns-starfish](https://www.aims.gov.au/research-topics/marine-life/crown-thorns-starfish)

---

*This document reflects the state of Tubbataha Reefs Natural Park as of published monitoring through 2024 (including the 2024 bleaching event). Any significant new bleaching events or major ecological changes post-2024 should be incorporated into future revisions.*
