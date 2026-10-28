/**
 * Host half of the Ace Combat-style boot bundle.
 *
 * Two responsibilities only, both deliberately trivial:
 *
 *   - contribute the pre-boot splash (one html row + one style row) through
 *     `webserver/index-inject`, so the first painted frame is the tactical
 *     uplink instead of the raw `Loading plugins…` card;
 *   - serve the four Agnes-painted backdrops from `assets/` under
 *     `/acb/assets/…`.
 *
 * This half never reads the workspace registry, never runs a snapshot and
 * never awaits anything during activation. The DSH desktop treats a failed or
 * slow startup entry as fatal, so the boot plugin must not be able to delay a
 * Host start: `inject` declares the one service it uses and every callback body
 * is guarded.
 *
 * Note: the desktop shell caches the injection rows when the Host process
 * starts, so a changed splash needs one full application restart.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EARLY_CSS, EARLY_HTML } from './boot-splash.js';

export const name = 'ac-boot';

// Cordis reads every declared service as required. The web server is present
// in every interface this bundle can load into (the documentation lists it in
// the app-boot required set), so this cannot hold activation hostage.
export const inject = ['webServer'];

// The web server's prefix table matches `path === prefix` or
// `path.startsWith(prefix + '/')`, so the route is registered without a
// trailing slash and the handler accepts the public `/acb/assets/...` form.
const ASSET_PREFIX = '/acb/assets';
const ASSET_ROOT = fileURLToPath(new URL('./assets/', import.meta.url));
const ASSET_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

function send(res, status, body) {
  try {
    res.writeHead(status, {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    });
    res.end(body);
  } catch (error) {
    /* the request may already be gone */
  }
}

/**
 * Serve one backdrop from this package's assets directory.
 *
 * Only a flat file name with a known image extension is accepted; the resolved
 * path must stay inside ASSET_ROOT. The client appends a version query, and the
 * files never change within a build, so a long-lived immutable cache is safe.
 */
function serveBootArt(req, res) {
  try {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    if (!url.pathname.startsWith(ASSET_PREFIX + '/')) {
      send(res, 404, 'not found');
      return;
    }
    let name = decodeURIComponent(url.pathname.slice(ASSET_PREFIX.length + 1));
    name = name.replace(/\\/g, '/');
    if (!name || name.includes('/') || name.startsWith('.')) {
      send(res, 404, 'not found');
      return;
    }
    const type = ASSET_TYPES[path.extname(name).toLowerCase()];
    if (!type) {
      send(res, 404, 'not found');
      return;
    }
    const file = path.join(ASSET_ROOT, name);
    if (!file.startsWith(ASSET_ROOT)) {
      send(res, 404, 'not found');
      return;
    }
    readFile(file).then(
      function (bytes) {
        try {
          res.writeHead(200, {
            'content-type': type,
            'content-length': bytes.length,
            'cache-control': 'public, max-age=31536000, immutable',
            'x-content-type-options': 'nosniff',
          });
          res.end(bytes);
        } catch (error) {
          /* the client disconnected */
        }
      },
      function () {
        send(res, 404, 'not found');
      },
    );
  } catch (error) {
    send(res, 404, 'not found');
  }
}

export function apply(ctx) {
  ctx.on('webserver/index-inject', (table) => {
    try {
      table.push({ kind: 'html', placement: 'body', html: EARLY_HTML });
      table.push({ kind: 'style', text: EARLY_CSS });
    } catch (error) {
      try {
        console.warn('[ac-boot] pre-boot splash was not injected', error);
      } catch (nested) {
        /* ignore */
      }
    }
  });

  try {
    ctx.effect(function () {
      return ctx.webServer.register({
        kind: 'prefix',
        path: ASSET_PREFIX,
        handler: serveBootArt,
      });
    }, 'ac-boot: boot art');
  } catch (error) {
    try {
      console.warn('[ac-boot] boot art route was not registered', error);
    } catch (nested) {
      /* ignore */
    }
  }
}
