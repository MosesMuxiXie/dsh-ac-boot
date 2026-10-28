# Agnes generation notes

v0.14.0 uses two abstract plates in `assets/`, generated with the Agnes image
model `agnes-image-2.5-flash` through `POST /v1/images/generations`:

| Output | Requested size | Prompt (verbatim) |
| --- | --- | --- |
| `assets/terrain.jpg` | `1280x720` | Cinematic top-down terrain relief texture for a fictional tactical map: rugged mountain ridges and valleys seen from directly above, deep teal stone with warm amber valleys and thin cyan ridge highlights, subtle topographic striations, abstract aerial cartography, high detail, moody cinematic light, no text, no labels, no roads, no borders, no coastlines, no symbols, widescreen 16:9 |
| `assets/holo.jpg` | `1280x720` | Abstract holographic tactical command display floating in dark space: layered translucent map grids, glowing topographic contour lines, small readout panels and reticles, cyan and amber light, volumetric haze, depth of field, no text, no letters, no numbers, no aircraft, no people, cinematic, widescreen 16:9, deep black background |

Request body:

```json
{
  "model": "agnes-image-2.5-flash",
  "prompt": "<prompt>",
  "size": "1280x720",
  "extra_body": { "response_format": "url" }
}
```

Each response carries a `data[0].url` image; the PNG was downloaded once,
converted to JPEG (quality 90) and committed under `assets/`. Requested frames
came back 1312×736. No seed was fixed, so a regeneration produces different
variations — iterate on the prompt, then bump `ART_VERSION` in `client.js`.

`scripts/agnes-gen.mjs` is the small generator used for this (it reads
`AGNES_API_KEY` from the environment and never writes the key to disk).

## Retired in v0.14.0

v0.13.0 shipped four literal combat-aviation key art plates (mission table,
carrier deck, storm climb, sunset horizon). The direction of this project is an
in-world **tactical briefing interface**, not photographic aircraft, so those
plates were removed from `assets/` and their prompts are kept only in the
v0.13.0 tag. The replacement set above is deliberately abstract: terrain and a
holographic command table, with every UI element drawn in code.
