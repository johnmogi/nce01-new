# Nexus Central Engine

Phase 1 is a deterministic, card-driven dungeon crawler backend with an admin-facing API.

## Run it

```text
npm install
npm run dev
npm test
```

The Next.js admin console is served at `http://localhost:3000`. Do not open the old UI as a `file://` URL; the typed interface and `/api/runs` route are served by Next.

For a production check:

```text
npm run build
npm start
```

The legacy engine API remains available with `npm run api:start` when a standalone Node API process is needed.

The Next admin console uses these typed routes:

- `POST /api/runs` — create and store a deterministic run
- `POST /api/game` — reveal or resolve a room for a stored run
- `POST /api/generate-monster` — generate an elemental monster from a source card

## Expansion content model

Gameplay cards remain canonical. Names and thematic definitions are presentation/content data: for example, an Ace of Fire is represented mechanically as rank `A` / value `1` / suit `clubs`; “Ace of Fire” is a display vocabulary choice.

Core content is loaded from `data/expansions/core/`. Each expansion is a folder with a `manifest.json` and JSON tables for cards, monsters, items, and traps. Add a future expansion by adding another manifest folder; the engine registry discovers it without changing generator logic. The same generator contract is used for all three content families:

```text
card/rank + suit/element + seed -> mechanics + cosmetic vocabulary
```

## Initial API

- `GET /health` — service health check
- `GET /api/admin/rules` — current Phase 1 defaults
- `GET /api/admin/precompiled-runs` — three fixed debug seeds
- `POST /api/runs` — create a seeded run
- `GET /api/runs/:runId` — inspect a run
- `POST /api/runs/:runId/rooms/:row-:column` — flip a room card and resolve its 1d6 event
- `POST /api/runs/:runId/rooms/:row-:column/resolve` — resolve a monster or trap with committed hand cards
- `PUT /api/admin/rules` — update Phase 1 TDS values
- `GET /api/admin/log` — inspect admin activity
- `POST /api/admin/simulate` — execute a deterministic batch of 1–1000 debug runs

Example run payload:

```json
{
  "seed": 1001,
  "character": {
    "name": "Aeris",
    "class": "elf",
    "element": "air",
    "gender": "female"
  }
}
```

Phase 1 deliberately keeps mixed lineages, extra health, and multiplayer disabled behind future rule toggles. Room resolution uses the Phase 1 elemental cycle (water > fire > earth > air > water), PV tiers (1–3 / 4–6 / 7–9), and a strict “surpass the resistance” default.
# nce01-new
