# DEADLIGHT — Outpost defense

A complete, endless top-down defense game. Defend Outpost 09, collect salvage and buy repairs or weapon upgrades between assaults. Ordinary infected arrive first; runners enter at wave 3 and brutes at wave 5. Both the outpost and the player must survive. Player health is displayed separately.

## Play locally

Open `dist/index.html` directly in a modern desktop browser, or install Node.js and run:

```
npm run dev
```

Visit http://127.0.0.1:4173. No dependency installation or build is required.

WASD / arrows move; mouse aims; left-click or hold fires; R reloads; Escape pauses. Empty magazines reload automatically. Ammunition reserves are unlimited. SOUND ON/OFF toggles synthesized sound. Losing browser focus pauses both combat and preparation. Resume explicitly. Diagonal movement is normalized; aiming respects the letterboxed map at any window size. Keyboard and mouse are required; touch controls are not advertised or implemented.

Each wave clear grants salvage and an 18-second preparation window. Buy any affordable upgrades, or start early. Fire-rate upgrades cap at ten levels. Repair restores up to 300 of 1000 integrity. Score is kill salvage value × 10 plus wave number × 250 for each completed wave. Best score is saved on game over when local storage is available.

## Vercel

Import this `deadlight` folder into a Vercel project (or set the repository Root Directory to `deadlight`). Choose Framework Preset **Other**, leave the build command empty and use **dist** as Output Directory. The included `vercel.json` also declares `dist`. No environment variables, backend, accounts within the game, or paid services are required. Files are prepared only; nothing has been deployed.

## itch.io

Upload `deadlight-itch.zip` to an itch.io project with Kind of project **HTML**. Mark the ZIP **This file will be played in the browser**. Choose an embedded viewport around 1280 × 800, enable fullscreen, and leave mobile support off. The ZIP has `index.html`, `style.css`, and `game.js` at its root. All paths are relative; no network assets are loaded. Click into the game iframe for keyboard focus.

## Validation

Run `npm run check` and `npm test`. The dependency-free Node test suite simulates the DOM/canvas and checks 41 scenarios: initial wave, normalized movement and bounds, aiming and shooting, reload, enemy approach, hits and kill rewards, wave rewards, all four upgrades, pause and resume, preparation timeout, enemy-type progression, base destruction, restart, focus loss, and rendering calls at two viewport sizes.

The test bridge is enabled only with `?test` and is absent in ordinary play. Browser visual QA could not be completed because the provided browser could not reach the local preview server. Automated rendering checks validate API execution, not appearance or real audio output. Recommended review: play several waves in Chrome/Firefox, resize the window, toggle audio, and test the ZIP in an itch.io draft before publication.

## Assets

All game artwork is drawn procedurally with Canvas. Sound is synthesized through Web Audio. No external fonts, images, libraries or licensed asset packs are required. The existing local title/HUD design was reused and completed. Source files and tests are included in the project; only runtime files are in the itch.io ZIP.

## Human encounters and recruitment

Partway through each wave, 3–6 hostile humans arrive from one edge. Orange rings and HOSTILE HUMAN labels distinguish them from blue recruited allies and red infected civilians. They chase the player and attack at close range for 8 damage, with a shared 0.7-second damage cooldown. You start with 100 player health; reaching zero ends the run. Player shots can stop hostile humans. Recruited allies never attack you.

Get within 72 map units and tap E to recruit the nearest human. Each press recruits exactly one, with a 0.65-second cooldown; holding the key cannot recruit a group. They do not join automatically. Each recruit restores up to 60 camp health and 5 player health. Completing a wave restores up to 20 player health. Hostile encounters freeze during the preparation shop, pause, and city expeditions. Nearby recruitment takes priority over the E car interaction.

The camp starts with five places. Once full, construction begins automatically and takes two subsequent completed waves. Expansions add five places and enlarge the camp. Recruitment is blocked while full, and waiting humans remain hostile. After an expansion, each human still requires a separate E press. Five recruited people unlock the city car.

Recruited defenders patrol outside the barricades, approach zombies, and fire blue tracer rounds from their own weapons. Total firing rate scales up to the equivalent of eight defenders. Trees and bushes around the camp are decorative and do not block movement or bullets.

## Infected civilians

Hostile infected civilians arrive mid-wave in a separate group on the opposite map edge from recruitable hostile humans. Red rings, X markings, red clothing, and INFECTED labels distinguish them from orange recruitable humans and blue recruited allies. They attack the camp, cannot join it, and must be eliminated to complete the wave. Friendly defenders target them too. Their live count appears separately in the HUD; kills award salvage and score. Three additional checks cover separated arrivals, camp attacks, wave blocking, and kill rewards.


## City car — unlock at 5 people

After five survivors have joined, find the car southeast of camp. Stand nearby and press E to drive into the city. WASD or arrow keys drive, with normalized diagonal speed and building collisions. Collect gold crates for 40 salvage each. Running over infected earns kills and score but damages the car. Return to the green west exit and press E to bank your cargo. A wreck automatically tows you home with half the cargo. Each camp wave allows one city trip; complete another wave to resupply the city. Camp combat and construction progression freeze while you are away. Escape and tab focus loss still pause the game. Existing camp expansions continue automatically: each full camp gains five places after two more completed waves. Four new automated tests cover unlock requirements, movement, buildings, camp freezing, loot, pause, return, trip limits, wreck recovery, and restart.


Five additional automated checks cover human attacks, damage cooldowns, one-at-a-time recruitment, key-repeat handling, range and pause restrictions, self-defense, ally behavior, player death, and restart. Earlier recruitment checks were updated to require explicit input.

## Drawing zombies toward humans

When the player is within 230 map units of a zombie, it targets the nearest living human within 300 units instead of the base. Both unrecruited humans and blue allied defenders are at risk. Move away and the zombie returns to attacking the camp. Humans take melee damage on the normal zombie attack cooldown. Civilians have 40 health; defenders have 80 health with visible health bars. Dead defenders reduce the camp population and are not replaced automatically. Human deaths caused by zombies award no player kill rewards. Four added checks cover proximity targeting, returning to base targeting, civilian deaths, and permanent defender losses.

