/**
 * Host half of the boot-sequence animation bundle.
 *
 * The only Host responsibility is the pre-boot splash: it contributes one
 * <style> and one <body> fragment through `webserver/index-inject`. The web
 * server renders those rows into its index; the Desktop host collects
 * `ctx.webServer.collectIndexInjections()` at Host start and hands the rows to
 * the desktop shell, whose frontend applies them before it creates the
 * `Loading plugins…` boot card.
 *
 * The client half removes the splash when the 15 second boot sequence starts.
 *
 * Note: the desktop shell caches the injection rows when the Host process
 * starts, so a changed splash needs one full application restart. Refreshing
 * the page alone reuses the cached rows.
 */
import { EARLY_CSS, EARLY_HTML } from './boot-splash.js';

function workspaceSnapshot(ctx) {
  try {
    const registry =
      ctx.workspaceRegistry || (typeof ctx.get === 'function' ? ctx.get('workspaceRegistry') : undefined);
    if (!registry || typeof registry.list !== 'function') return null;
    const rows = registry
      .list()
      .map((workspace) => ({
        title: workspace.title || workspace.path || 'LOCAL WORKSPACE',
        path: workspace.path || '',
        sessions: Array.isArray(workspace.sessionIds) ? workspace.sessionIds.length : 0,
        updatedAt: workspace.updatedAt || '',
      }))
      .filter((row) => row.title)
      .sort((a, b) => b.sessions - a.sessions || a.title.localeCompare(b.title));
    return rows;
  } catch (error) {
    try {
      console.warn('[ac-boot] workspace snapshot was not injected', error);
    } catch (nested) {
      /* ignore */
    }
    return null;
  }
}

export function apply(ctx) {
  ctx.on('webserver/index-inject', (table) => {
    try {
      table.push({ kind: 'html', placement: 'body', html: EARLY_HTML });
      table.push({ kind: 'style', text: EARLY_CSS });
      const rows = workspaceSnapshot(ctx);
      if (rows && rows.length > 0) {
        const json = JSON.stringify(rows)
          .replace(/</g, '\\u003c')
          .replace(/\u2028/g, '\\u2028')
          .replace(/\u2029/g, '\\u2029');
        table.push({
          kind: 'script',
          placement: 'body',
          text: 'window.__ACB_WORKSPACES=' + json + ';',
        });
      }
    } catch (error) {
      // A failed splash/data row must never make the Web UI fail to render.
      try {
        console.warn('[ac-boot] pre-boot splash was not injected', error);
      } catch (nested) {
        /* ignore */
      }
    }
  });

  // Live snapshot for the client map: read at request time so the workspace
  // regions reflect the registry when the boot animation starts, not only the
  // global cached at Host start.
  try {
    const web =
      ctx.webServer || (typeof ctx.get === 'function' ? ctx.get('webServer') : undefined);
    if (web && typeof web.register === 'function') {
      ctx.effect(function () {
        return web.register({
          kind: 'exact',
          path: '/acb/workspaces',
          handler: function (req, res) {
            try {
              const rows = workspaceSnapshot(ctx) || [];
              res.writeHead(200, {
                'content-type': 'application/json; charset=utf-8',
                'cache-control': 'no-store',
              });
              res.end(JSON.stringify({ list: rows, at: Date.now() }));
            } catch (error) {
              try {
                res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
                res.end('{"list":[]}');
              } catch (nested) {
                /* ignore */
              }
            }
          },
        });
      }, 'ac-boot: workspace map data');
    }
  } catch (error) {
    try {
      console.warn('[ac-boot] workspace data route was not registered', error);
    } catch (nested) {
      /* ignore */
    }
  }
}
