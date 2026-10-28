# Agnes generation notes

The four backdrops in `assets/` were generated with the Agnes image model
`agnes-image-2.5-flash` through `POST /v1/images/generations`:

| Output | Requested size | Prompt (verbatim) |
| --- | --- | --- |
| `assets/briefing.jpg` | `1280x720` | Cinematic tactical mission-briefing room: top-down view of a dark holographic war table projecting a glowing topographic map with waypoint markers and route lines, cyan and amber light, classified folders and a flight helmet on the table, volumetric haze, dramatic military command atmosphere, widescreen 16:9, ultra-detailed original concept art, no text, no legible letters, no logos |
| `assets/deck.jpg` | `1280x720` | Cinematic military-aviation key art: an original fictional fighter jet on a dark aircraft-carrier flight deck at dawn, steam rising from the catapult, amber runway lights reflected on the wet deck, deck-crew silhouettes, deep blue storm sky with breaking amber light, dramatic rim lighting, low angle, widescreen 16:9, ultra-detailed original concept art, no text, no logos, no insignia, no real-world aircraft markings |
| `assets/ascent.jpg` | `1280x720` | Cinematic aerial-combat game key art: an original fictional fighter jet climbing through a storm cloud layer at extreme speed, bright afterburner, spiral contrails, lightning glow, dramatic low angle from below, deep blue and amber palette, motion energy, widescreen 16:9, ultra-detailed original concept art, no text, no logos, no insignia, no real-world aircraft markings |
| `assets/horizon.jpg` | `1280x720` | Cinematic aerial-combat game title-screen artwork: the silhouette of an original fictional fighter jet flying high above an endless sea of clouds at sunset, a huge glowing orange horizon, long contrails, anamorphic lens flare, deep teal sky above, volumetric clouds, dramatic backlight, widescreen composition with open negative space in the center for a title, ultra-detailed original concept art, no text, no logos, no insignia, no real-world aircraft markings |

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
