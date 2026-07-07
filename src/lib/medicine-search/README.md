# Medicine search

Client-side, typo-tolerant medicine search. The doctor's per-keystroke search runs
entirely in the browser against a cached snapshot of the medicine directory; the
server endpoint (`GET /medicine/search`) is only a fallback for a user's first visit
before the snapshot finishes downloading.

The matching/ranking/caching mechanics live in the shared engine `src/lib/search-core/`
(`rank.ts`, `normalize.ts`, `distance.ts`, `snapshot-cache.ts`, `index-store.ts`). This
folder is just the medicine *configuration* of that engine — investigation search
(`src/lib/investigation-search/`) is a second configuration of the same engine.

## Data flow

1. `index-store.ensureMedicineIndex()` (a `createSearchIndex` from the shared engine) loads
   the snapshot from the IndexedDB cache, re-downloaded from `GET /medicine/snapshot` only
   when `GET /medicine/snapshot/version` reports a new version.
2. `config.ts` declares the searchable fields (brand = prefix, generic = substring); the
   engine normalizes each into separator-insensitive keys once at build time.
3. The engine ranks matches per keystroke via the shared ladder below.
4. `useMedicineSearch()` exposes `search()`, falling back to the server until the index is ready.

## Ranking ladder — single source of truth

This ladder (in `src/lib/search-core/rank.ts`) is mirrored by the backend tiered query
(`olive-backend/app/services/medicine_search.py`). Keep the two in sync; changing one
without the other breaks parity between the local index and the fallback.

| Tier | Meaning | Brand (trade) | Generic |
|---|---|:---:|:---:|
| 0 | exact (normalized key equals query key) | ✅ | ✅ |
| 1 | query is the first whole word | ✅ | ✅ |
| 2 | prefix (key starts with query key) | ✅ | ✅ |
| 3 | query starts a later word | — | ✅ |
| 4 | substring (query key anywhere) | — | ✅ |
| 5 | fuzzy (≤2 edits / trigram-similar) | ✅ | ✅ |

Ties break by: tier → edit distance → **brand match first** → shorter name → alphabetical.
Brand wins ties because Bangladesh doctors prescribe by brand name, so typing "nap"
should surface **Napa** above a brand whose *generic* merely starts with "nap" (e.g. an
 Naproxen product).

- **Normalization** is separator-insensitive: `napa extra` ≡ `napa-extra` ≡ `napaextra`.
- **Brand = prefix** (precision), **generic = substring** (recall) — matching DIMS and MedEx.
- **Fuzzy** only kicks in for queries ≥4 chars and only when literal matches are scarce,
  so the common case stays cheap. Typo tolerance is anchored to the start of the name
  (compares the query against the leading portion), so a trailing strength like
  "Paracetamol 500 mg" never inflates the edit distance.

## Parity checklist

Keywords that work on DIMS or MedEx must work here. Manual smoke set:

- `nap`, `napa` → `Napa` ranks above `Napa Extra`
- `napa extra`, `napa-extra` → same single result
- `paracetmol`, `paracetalmol` (typo) → `Paracetamol`
- `omeprazoxe` (tail typo) → `Omeprazole`
- `acetamol` (generic substring) → paracetamol products
- a 2–3 char query returns >20 results that are all reachable by scrolling
