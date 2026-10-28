// Agnes image generator for the boot-sequence key art (development helper).
//
// Usage:
//   $env:AGNES_API_KEY = '<key>'
//   node scripts/agnes-gen.mjs <outDir> [names...]
//
// Names: horizon, deck, ascent, briefing (omit to generate all four).
// The key is read from the environment and never written to disk.
import fs from 'node:fs';
import path from 'node:path';

const baseURL = 'https://api.agnes-ai.cn/v1';
const model = 'agnes-image-2.5-flash';
const key = process.env.AGNES_API_KEY;
if (!key) {
  console.error('AGNES_API_KEY is not set');
  process.exit(1);
}

const OUT = process.argv[2] || path.resolve('out');
const only = process.argv.slice(3);
fs.mkdirSync(OUT, { recursive: true });

const PROMPTS = {
  horizon: {
    size: '1280x720',
    prompt:
      'Cinematic aerial-combat game title-screen artwork: the silhouette of an original fictional fighter jet flying high above an endless sea of clouds at sunset, a huge glowing orange horizon, long contrails, anamorphic lens flare, deep teal sky above, volumetric clouds, dramatic backlight, widescreen composition with open negative space in the center for a title, ultra-detailed original concept art, no text, no logos, no insignia, no real-world aircraft markings',
  },
  deck: {
    size: '1280x720',
    prompt:
      'Cinematic military-aviation key art: an original fictional fighter jet on a dark aircraft-carrier flight deck at dawn, steam rising from the catapult, amber runway lights reflected on the wet deck, deck-crew silhouettes, deep blue storm sky with breaking amber light, dramatic rim lighting, low angle, widescreen 16:9, ultra-detailed original concept art, no text, no logos, no insignia, no real-world aircraft markings',
  },
  ascent: {
    size: '1280x720',
    prompt:
      'Cinematic aerial-combat game key art: an original fictional fighter jet climbing through a storm cloud layer at extreme speed, bright afterburner, spiral contrails, lightning glow, dramatic low angle from below, deep blue and amber palette, motion energy, widescreen 16:9, ultra-detailed original concept art, no text, no logos, no insignia, no real-world aircraft markings',
  },
  briefing: {
    size: '1280x720',
    prompt:
      'Cinematic tactical mission-briefing room: top-down view of a dark holographic war table projecting a glowing topographic map with waypoint markers and route lines, cyan and amber light, classified folders and a flight helmet on the table, volumetric haze, dramatic military command atmosphere, widescreen 16:9, ultra-detailed original concept art, no text, no legible letters, no logos',
  },
};

async function generate(name, spec) {
  const body = {
    model,
    prompt: spec.prompt,
    size: spec.size,
    extra_body: { response_format: 'url' },
  };
  const response = await fetch(baseURL + '/images/generations', {
    method: 'POST',
    headers: {
      authorization: 'Bearer ' + key,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(240000),
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!response.ok) throw new Error('upstream HTTP ' + response.status + ': ' + text.slice(0, 400));
  const url = data?.data?.[0]?.url || data?.url;
  if (!url) throw new Error('no image url: ' + text.slice(0, 400));
  const image = await fetch(url, { signal: AbortSignal.timeout(240000) });
  if (!image.ok) throw new Error('download HTTP ' + image.status);
  const buffer = Buffer.from(await image.arrayBuffer());
  const target = path.join(OUT, name + '.png');
  fs.writeFileSync(target, buffer);
  return { target, bytes: buffer.length, url };
}

for (const name of only.length ? only : Object.keys(PROMPTS)) {
  const spec = PROMPTS[name];
  if (!spec) {
    console.log('SKIP unknown', name);
    continue;
  }
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      console.log('generating', name, 'attempt', attempt);
      const result = await generate(name, spec);
      console.log('OK', name, result.bytes, result.target);
      console.log('   url:', result.url);
      break;
    } catch (error) {
      console.log('ERR', name, String(error.message || error).slice(0, 500));
      if (attempt === 3) break;
      await new Promise((resolve) => setTimeout(resolve, 8000 * attempt));
    }
  }
}
