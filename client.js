/**
 * DeepSeek Harness — tactical-briefing opening sequence (browser half).
 *
 * The look is an in-world mission briefing, not a flight-photo slideshow:
 * a holographic command table, a live tactical theater map, operator access
 * clearance, then the mission title. No aircraft are placed on screen; the
 * map, panels, waypoints, radar and HUD are all drawn here, while Agnes paints
 * the terrain relief and the holographic table plate used as textures.
 *
 * Four beats:
 *
 *   1. brief   — encrypted uplink, wordmark over the holographic table
 *   2. theater — full-bleed theater map: terrain, regions, route, waypoints
 *   3. console — operator access, systems check, radar, classification
 *   4. title   — mission-start title over the muted map
 *
 * The run belongs to the application launch: BootHost records a flag in
 * sessionStorage when the sequence starts, so waking from sleep, restoring the
 * tray window or reloading the page never replays it. Only a plugin hot
 * refresh (an explicit authoring action) previews a new build again.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-ac-boot',
  factory(require) {
    const React = require('react');
    const ReactDOM = require('react-dom');
    const h = React.createElement;
    const { useState, useEffect, useLayoutEffect, useRef, useCallback } = React;

    const NS = 'ac-boot';
    const DURATION_MS = 15000;
    const REDUCED_MS = 5200;
    const FADE_MS = 800;
    const SKIP_FADE_MS = 240;
    const ORDER = 9000;
    const GUARD = '__dshAcBootRuntimeV4';
    const BOOT_FLAG_KEY = 'acb-boot-played';
    const ART_VERSION = '14';
    const ASSET_BASE = (() => {
      try {
        return window.__ACB_ASSET_BASE || '/acb/assets/';
      } catch (error) {
        return '/acb/assets/';
      }
    })();

    function asset(name) {
      return ASSET_BASE + name + '.jpg?v=' + ART_VERSION;
    }

    const buildId =
      'acb-' +
      (typeof performance !== 'undefined' && performance.now
        ? Math.round(performance.now()).toString(36)
        : Date.now().toString(36)) +
      '-' +
      Math.random().toString(36).slice(2, 7);
    let HOT_RELOAD = false;
    try {
      const previous = window.__ACB_BUILD_ID || '';
      window.__ACB_BUILD_ID = buildId;
      HOT_RELOAD = !!previous && previous !== buildId;
    } catch (error) {
      HOT_RELOAD = false;
    }

    const PHASES = [
      { id: 'brief', at: 0 },
      { id: 'theater', at: 2600 },
      { id: 'console', at: 8200 },
      { id: 'title', at: 11400 },
    ];
    const PHASE_TIMES = PHASES.map((phase) => phase.at);
    const REDUCED_PHASES = [0, 1100, 2700, 3700];

    const ZH = {
      'aria.label': 'DeepSeek Harness 开机动画',
      'aria.skip': '跳过开机动画',
      'skip.label': '跳过',
      'hud.op': '行动 // 第一缕光',
      'hud.build': '版本 19.0 // 本地',
      'hud.theater': '本地战区 // 06',
      'hud.link': '链路安全',
      'brief.kicker': '战术简报 // 本地战区',
      'brief.op': '行动 // 第一缕光',
      'brief.zh': '作战简报 · 本地战区',
      'brief.link': '加密上行链路建立中',
      'brief.clearance': '简报准备中',
      'theater.kicker': '战区态势',
      'theater.title': '本地战区',
      'theater.caption': 'LOCAL COMMAND RE-ESTABLISHES THE THEATER LINK. ALL STATIONS REPORT READY.',
      'theater.caption.zh': '本地指挥部重建战区链路 · 各站报告就绪',
      'intel.header': '目标情报',
      'intel.tgt': '目标',
      'intel.tgt.value': '本地战区',
      'intel.mission': '任务',
      'intel.mission.value': '01 // 第一缕光',
      'intel.op': '行动',
      'intel.op.value': '系统初始化',
      'intel.status': '状态',
      'intel.status.value': '绿色',
      'data.header': '简报数据',
      'legend.active': '节点',
      'legend.route': '航线',
      'legend.grid': '战区网格',
      'console.kicker': '操作员权限',
      'console.identity': '身份校验通过',
      'console.cred': '本机凭据已恢复',
      'console.profile': '本机配置',
      'console.granted': '访问许可',
      'console.zh': '身份校验通过 · 正在载入简报',
      'console.check': '系统检查',
      'console.classified': '机密 // 战术简报',
      'title.kicker': '任务 01 // 第一缕光',
      'title.mission': '任务开始',
      'title.chip1': '简报已确认',
      'title.chip2': '工作区就绪',
      'title.chip3': '界面待命',
      'title.prompt': '按 Enter 继续',
      'title.auto': '自动继续',
      'title.zh': '系统就绪 · 即将进入工作区',
      'title.start': '任务开始',
    };

    const EN = {
      'aria.label': 'DeepSeek Harness boot sequence',
      'aria.skip': 'Skip the boot sequence',
      'skip.label': 'SKIP',
      'hud.op': 'OPERATION // FIRST LIGHT',
      'hud.build': 'BUILD 19.0 // LOCAL',
      'hud.theater': 'LOCAL THEATER // 06',
      'hud.link': 'LINK SECURE',
      'brief.kicker': 'TACTICAL BRIEFING // LOCAL THEATER',
      'brief.op': 'OPERATION // FIRST LIGHT',
      'brief.zh': 'MISSION BRIEFING · LOCAL THEATER',
      'brief.link': 'ESTABLISHING ENCRYPTED UPLINK',
      'brief.clearance': 'AWAITING BRIEFING',
      'theater.kicker': 'THEATER OVERVIEW',
      'theater.title': 'LOCAL THEATER',
      'theater.caption': 'LOCAL COMMAND RE-ESTABLISHES THE THEATER LINK. ALL STATIONS REPORT READY.',
      'theater.caption.zh': '本地指挥部重建战区链路 · 各站报告就绪',
      'intel.header': 'TGT INFO',
      'intel.tgt': 'TGT',
      'intel.tgt.value': 'LOCAL THEATER',
      'intel.mission': 'MISSION',
      'intel.mission.value': '01 // FIRST LIGHT',
      'intel.op': 'OPERATION',
      'intel.op.value': 'SYSTEM INIT',
      'intel.status': 'STATUS',
      'intel.status.value': 'GREEN',
      'data.header': 'BRIEFING DATA',
      'legend.active': 'ACTIVE NODE',
      'legend.route': 'ROUTE',
      'legend.grid': 'THEATER GRID',
      'console.kicker': 'OPERATOR ACCESS',
      'console.identity': 'IDENTITY VERIFIED',
      'console.cred': 'CREDENTIALS RESTORED',
      'console.profile': 'LOCAL PROFILE',
      'console.granted': 'ACCESS GRANTED',
      'console.zh': 'OPERATOR VERIFIED · LOADING BRIEFING',
      'console.check': 'SYSTEMS CHECK',
      'console.classified': 'CLASSIFIED // TACTICAL BRIEFING',
      'title.kicker': 'MISSION 01 // FIRST LIGHT',
      'title.mission': 'MISSION START',
      'title.chip1': 'BRIEFING CONFIRMED',
      'title.chip2': 'WORKSPACE READY',
      'title.chip3': 'INTERFACE STANDBY',
      'title.prompt': 'PRESS ENTER TO CONTINUE',
      'title.auto': 'AUTO CONTINUE',
      'title.zh': 'SYSTEM READY · ENTERING WORKSPACE',
      'title.start': 'MISSION START',
    };

    function runtime() {
      if (!window[GUARD]) {
        window[GUARD] = {
          hasPlayed: false,
          running: false,
          lastFinishedAt: 0,
          lastStartedAt: 0,
        };
      }
      return window[GUARD];
    }

    function bootAlreadyPlayed() {
      try {
        return window.sessionStorage.getItem(BOOT_FLAG_KEY) === '1';
      } catch (error) {
        return false;
      }
    }

    function markBootPlayed() {
      try {
        window.sessionStorage.setItem(BOOT_FLAG_KEY, '1');
      } catch (error) {
        /* degrades to once per page load */
      }
    }

    function removeBootSplash() {
      try {
        const nodes = document.querySelectorAll('[data-acb-boot-splash]');
        for (const node of nodes) node.remove();
      } catch (error) {
        /* the splash is optional */
      }
    }

    function pad2(value) {
      return String(value).padStart(2, '0');
    }

    function clockLabel() {
      try {
        const now = new Date();
        return pad2(now.getHours()) + ':' + pad2(now.getMinutes());
      } catch (error) {
        return '--:--';
      }
    }

    function prefersReducedMotion() {
      try {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      } catch (error) {
        return false;
      }
    }

    function preloadArt() {
      try {
        for (const name of ['terrain', 'holo']) {
          const image = new Image();
          image.src = asset(name);
        }
      } catch (error) {
        /* images are optional */
      }
    }

    // Fictional theater. Coastlines are procedurally generated (never real
    // geography); the interface is a holographic mission overlay: graticule,
    // satellite rails, highlighted sector, city tags and data-node bursts.
    // The Agnes terrain texture is clipped inside the main landmass only.
    function seeded(seed) {
      let state = seed >>> 0;
      return function () {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 4294967296;
      };
    }

    function blobPath(cx, cy, radius, seed, options) {
      const rand = seeded(seed);
      const opts = options || {};
      const harmonics = [];
      for (let k = 2; k <= 7; k += 1) {
        harmonics.push({
          k: k,
          amp: (0.05 + rand() * 0.13) / Math.pow(k, 0.72),
          phase: rand() * Math.PI * 2,
        });
      }
      const elongation = opts.elongation || 1;
      const rotation = opts.rotation || 0;
      const steps = 150;
      const parts = [];
      for (let i = 0; i < steps; i += 1) {
        const angle = (i / steps) * Math.PI * 2;
        let r = 1;
        for (let index = 0; index < harmonics.length; index += 1) {
          r += harmonics[index].amp * Math.sin(harmonics[index].k * angle + harmonics[index].phase);
        }
        r += (rand() - 0.5) * 0.03;
        const lx = Math.cos(angle) * radius * r * elongation;
        const ly = Math.sin(angle) * radius * r;
        const x = cx + lx * Math.cos(rotation) - ly * Math.sin(rotation);
        const y = cy + lx * Math.sin(rotation) + ly * Math.cos(rotation);
        parts.push((i === 0 ? 'M ' : 'L ') + x.toFixed(1) + ' ' + y.toFixed(1));
      }
      parts.push('Z');
      return parts.join(' ');
    }

    const LANDS = [
      { key: 'main', d: blobPath(985, 430, 268, 11, { elongation: 1.62, rotation: -0.12 }), major: true },
      { key: 'west', d: blobPath(268, 305, 172, 23, { elongation: 1.34, rotation: 0.22 }), major: true },
      { key: 'south', d: blobPath(625, 848, 148, 37, { elongation: 1.75, rotation: 0.06 }), major: true },
      { key: 'north', d: blobPath(1128, 62, 118, 41, { elongation: 1.45, rotation: -0.42 }), major: true },
      { key: 'east', d: blobPath(1452, 474, 82, 53, { elongation: 1.15, rotation: 0.58 }), major: false },
      { key: 'is1', d: blobPath(1462, 706, 58, 67, {}), major: false },
      { key: 'is2', d: blobPath(210, 612, 64, 71, { elongation: 1.3, rotation: -0.3 }), major: false },
      { key: 'is3', d: blobPath(120, 128, 46, 83, {}), major: false },
      { key: 'is4', d: blobPath(368, 700, 40, 97, {}), major: false },
      { key: 'is5', d: blobPath(842, 96, 44, 101, {}), major: false },
      { key: 'is6', d: blobPath(1250, 792, 62, 103, {}), major: false },
      { key: 'is7', d: blobPath(1076, 742, 34, 107, {}), major: false },
      { key: 'is8', d: blobPath(1408, 240, 30, 109, {}), major: false },
      { key: 'is9', d: blobPath(486, 752, 26, 113, {}), major: false },
      { key: 'is10', d: blobPath(1512, 350, 22, 127, {}), major: false },
      { key: 'is11', d: blobPath(668, 96, 24, 131, {}), major: false },
    ];

    const HIGHLIGHTS = [
      {
        key: 'local',
        d: blobPath(724, 392, 104, 211, { elongation: 1.16, rotation: -0.18 }),
        clip: 'acbClip-main',
        label: 'LOCAL THEATER',
        lx: 724,
        ly: 352,
      },
    ];

    const NODES = [
      { x: 762, y: 392, hub: true, tag: 'TGT-01', name: '' },
      { x: 1088, y: 338, hub: true, tag: 'TGT-02', name: 'NORTH RIDGE' },
      { x: 958, y: 598, hub: true, tag: 'TGT-03', name: 'CENTRAL' },
      { x: 296, y: 302, hub: true, tag: 'TGT-04', name: 'WEST COMMAND' },
      { x: 646, y: 320, tag: 'TGT-05', name: 'NORTHGATE' },
      { x: 1218, y: 452, tag: 'TGT-06', name: 'EAST PORT' },
      { x: 700, y: 566, tag: 'TGT-07', name: 'RIVER' },
      { x: 1010, y: 690, tag: 'TGT-08', name: 'DELTA' },
      { x: 1286, y: 344, tag: 'TGT-09', name: 'EAST RIDGE' },
      { x: 620, y: 828, tag: 'TGT-10', name: 'SOUTH COAST' },
      { x: 1132, y: 104, tag: 'TGT-11', name: 'NORTH GATE' },
      { x: 1452, y: 474, tag: 'TGT-12', name: 'EAST ISLE' },
    ];

    const CITIES = [
      { x: 884, y: 262, name: 'NORTHGATE', anchor: 'start' },
      { x: 1146, y: 404, name: 'PORT ARDEN', anchor: 'start' },
      { x: 758, y: 650, name: 'HALCYON', anchor: 'start' },
      { x: 232, y: 250, name: 'WESTPORT', anchor: 'start' },
      { x: 1186, y: 770, name: 'MERIDIAN', anchor: 'start' },
      { x: 900, y: 520, name: 'VESPER', anchor: 'start' },
    ];

    const SAT_ROWS = [
      'SAT-01  0x3F2A  14:32:08  OK',
      'SAT-02  0x7C11  14:32:09  OK',
      'SAT-03  0x2E94  14:32:09  SYNC',
      'SAT-04  0x91B0  14:32:10  OK',
      'SAT-05  0x4D6C  14:32:11  OK',
      'SAT-06  0x08FA  14:32:12  LINK',
      'SAT-07  0xA31E  14:32:13  OK',
      'SAT-08  0x5B77  14:32:14  OK',
      'SAT-09  0xC042  14:32:15  SYNC',
      'SAT-10  0x1D6B  14:32:16  OK',
      'SAT-11  0x86E9  14:32:17  OK',
      'SAT-12  0x33D4  14:32:18  LINK',
    ];

    const NODE_ROWS = [
      'TGT-01  LOCAL THEATER  READY',
      'TGT-02  NORTH RIDGE    READY',
      'TGT-03  CENTRAL        READY',
      'TGT-04  WEST COMMAND   READY',
      'TGT-05  NORTHGATE      READY',
      'TGT-06  EAST PORT      SYNC',
    ];

    const PLATE_ROWS = ['LAT   41.2 N', 'LON  118.6 E', 'GRID  06 / OMEGA', 'SEC   41-06', 'ALT   12,400 M', 'UPLINK 3.8 Gb/s'];

    const GRID_ROWS = ['SECTOR 06 // LOCAL', 'ZONE   ALPHA', 'NODES  12 / 12', 'LINK   06 ACTIVE'];

    const GRATICULE_X = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500];
    const GRATICULE_Y = [100, 200, 300, 400, 500, 600, 700, 800];

    function TheaterMap({ t }) {
      const rand = seeded(4211);
      const lands = LANDS.map(function (land) {
        return h(
          'g',
          { key: land.key },
          h('path', { className: 'acb-land-halo', d: land.d }),
          h('path', { className: 'acb-land', d: land.d }),
        );
      });
      const clipDefs = LANDS.filter(function (land) {
        return land.key === 'main' || land.key === 'west' || land.key === 'east';
      }).map(function (land) {
        return h('clipPath', { key: 'clip-' + land.key, id: 'acbClip-' + land.key }, h('path', { d: land.d }));
      });
      const highlights = HIGHLIGHTS.map(function (item, index) {
        return h(
          'g',
          { key: item.key, clipPath: 'url(#' + item.clip + ')' },
          h(
            'g',
            { className: 'acb-highlight-rise', clipPath: 'url(#acbRiseClip)' },
            h('path', { className: 'acb-highlight-glow', d: item.d, style: { '--acb-i': index } }),
            h('path', { className: 'acb-highlight', d: item.d }),
            h('text', { className: 'acb-highlight-label', x: item.lx, y: item.ly, textAnchor: 'middle' }, item.label),
          ),
        );
      });
      const graticule = [];
      for (let i = 0; i < GRATICULE_X.length; i += 1) {
        const x = GRATICULE_X[i];
        const major = x % 300 === 100;
        graticule.push(h('line', { key: 'vx' + x, className: major ? 'major' : '', x1: x, y1: 0, x2: x, y2: 900 }));
        graticule.push(h('text', { key: 'vxt' + x, x: x + 4, y: 24 }, String(x / 10).padStart(3, '0') + '°E'));
        graticule.push(h('text', { key: 'vxb' + x, x: x + 4, y: 884 }, String(x / 10).padStart(3, '0') + '°E'));
      }
      for (let i = 0; i < GRATICULE_Y.length; i += 1) {
        const y = GRATICULE_Y[i];
        const major = y % 300 === 100;
        graticule.push(h('line', { key: 'hy' + y, className: major ? 'major' : '', x1: 0, y1: y, x2: 1600, y2: y }));
        graticule.push(h('text', { key: 'hyt' + y, x: 20, y: y - 4 }, String(60 - i * 5).padStart(2, '0') + '°N'));
      }
      graticule.push(h('line', { key: 'axis-x', className: 'axis', x1: 0, y1: 450, x2: 1600, y2: 450 }));
      graticule.push(h('line', { key: 'axis-y', className: 'axis', x1: 800, y1: 0, x2: 800, y2: 900 }));
      const nodes = NODES.map(function (node, index) {
        const count = node.hub ? 200 : 96;
        const rays = [];
        for (let ray = 0; ray < count; ray += 1) {
          const angle = (ray / count) * Math.PI * 2 + index * 0.37;
          const tier = ray % 10 === 0 ? 'long' : ray % 3 === 0 ? 'mid' : 'fine';
          let length = 24 + ((ray * 37 + index * 53) % 110);
          if (tier === 'mid') length = 96 + ((ray * 61 + index * 17) % 190);
          if (tier === 'long') length = 210 + ((ray * 89 + index * 41) % 300);
          if (ray % 30 === 0) length += 140;
          rays.push(
            h('line', {
              key: 'ray' + ray,
              className: tier + (ray % 30 === 0 ? ' hot' : ''),
              x1: 0,
              y1: 0,
              x2: (Math.cos(angle) * length).toFixed(1),
              y2: (Math.sin(angle) * length).toFixed(1),
            }),
          );
        }
        for (let spike = 0; spike < 4; spike += 1) {
          const angle = (spike * Math.PI) / 2 + (node.hub ? 0.12 : 0.2);
          const length = node.hub ? 620 : 300;
          rays.push(
            h('line', {
              key: 'spike' + spike,
              className: 'spike',
              x1: 0,
              y1: 0,
              x2: (Math.cos(angle) * length).toFixed(1),
              y2: (Math.sin(angle) * length).toFixed(1),
            }),
          );
        }
        return h(
          'g',
          {
            key: node.tag,
            className: 'acb-node' + (node.hub ? ' is-hub' : ''),
            style: { '--acb-i': index },
            transform: 'translate(' + node.x + ' ' + node.y + ')',
          },
          h('circle', { className: 'acb-node-halo', r: node.hub ? 74 : 44, fill: 'url(#acbNodeGlow)' }),
          h('circle', { className: 'acb-node-halo acb-node-halo-core', r: node.hub ? 34 : 22, fill: 'url(#acbNodeCore)' }),
          h('g', { className: 'acb-node-rays' }, rays),
          h('circle', { className: 'acb-node-ring', r: node.hub ? 9 : 5.5 }),
          h('circle', { className: 'acb-node-dot', r: node.hub ? 6.2 : 2.4 }),
          node.hub
            ? h('text', { className: 'acb-node-tag', x: 14, y: -10 }, node.tag)
            : null,
          node.hub && node.name
            ? h('text', { className: 'acb-node-label', x: 14, y: 2 }, node.name)
            : null,
        );
      });
      const seedRays = [];
      for (let ray = 0; ray < 240; ray += 1) {
        const angle = (ray / 240) * Math.PI * 2 + 0.17;
        const long = ray % 8 === 0;
        const length = long ? 320 + ((ray * 47) % 300) : 40 + ((ray * 61) % 240);
        seedRays.push(
          h('line', {
            key: 'seed-ray-' + ray,
            className: long ? 'hot' : '',
            x1: 0,
            y1: 0,
            x2: (Math.cos(angle) * length).toFixed(1),
            y2: (Math.sin(angle) * length).toFixed(1),
          }),
        );
      }
      const seed = h(
        'g',
        { className: 'acb-seed-anchor', transform: 'translate(762 392)' },
        h(
          'g',
          { className: 'acb-seed-dome-wrap' },
          h('circle', { className: 'acb-seed-dome', r: 240, fill: 'url(#acbDomeFill)' }),
          h('circle', { className: 'acb-seed-dome-rim', r: 240 }),
          h('circle', { className: 'acb-seed-dome-inner', r: 172 }),
        ),
        h(
          'g',
          { className: 'acb-seed' },
          h('circle', { className: 'acb-seed-halo acb-seed-halo-far', r: 176, fill: 'url(#acbSeedGlow)' }),
          h('circle', { className: 'acb-seed-halo acb-seed-halo-mid', r: 82, fill: 'url(#acbSeedGlow)' }),
          h('circle', { className: 'acb-seed-halo acb-seed-halo-near', r: 38, fill: 'url(#acbSeedCore)' }),
          h('circle', { className: 'acb-seed-ring', r: 18 }),
          h('g', { className: 'acb-seed-rays' }, seedRays),
        ),
        h(
          'g',
          { className: 'acb-seed-coregroup' },
          h('circle', { className: 'acb-seed-flare', r: 24, fill: 'url(#acbSeedCore)' }),
          h('circle', { className: 'acb-seed-core', r: 9 }),
          h('circle', { className: 'acb-seed-core-inner', r: 4 }),
        ),
      );
      const cities = CITIES.map(function (city) {
        return h(
          'g',
          { key: city.name, className: 'acb-city' },
          h('circle', { cx: city.x, cy: city.y, r: 1.8 }),
          h(
            'text',
            { x: city.x + 8, y: city.y + 3, textAnchor: city.anchor },
            city.name,
          ),
        );
      });
      return h(
        'div',
        { className: 'acb-map', 'aria-hidden': true },
        h(
          'div',
          { className: 'acb-map-plane' },
          h(
            'svg',
            { className: 'acb-map-svg', viewBox: '0 0 1600 900', preserveAspectRatio: 'xMidYMid slice' },
            h(
              'defs',
              null,
              h(
                'radialGradient',
                { id: 'acbSea', cx: '50%', cy: '46%', r: '72%' },
                h('stop', { offset: '0%', stopColor: '#061722' }),
                h('stop', { offset: '58%', stopColor: '#030b14' }),
                h('stop', { offset: '100%', stopColor: '#010509' }),
              ),
              h(
                'pattern',
                { id: 'acbTerrainPat', patternUnits: 'userSpaceOnUse', width: 1600, height: 900 },
                h('image', { href: asset('terrain'), width: 1600, height: 900, preserveAspectRatio: 'xMidYMid slice' }),
              ),
              h(
                'radialGradient',
                { id: 'acbGlowMagenta' },
                h('stop', { offset: '0%', stopColor: 'rgba(235,92,158,.55)' }),
                h('stop', { offset: '55%', stopColor: 'rgba(180,50,120,.22)' }),
                h('stop', { offset: '100%', stopColor: 'rgba(60,10,40,0)' }),
              ),
              h(
                'radialGradient',
                { id: 'acbNodeGlow' },
                h('stop', { offset: '0%', stopColor: 'rgba(255,255,255,1)' }),
                h('stop', { offset: '34%', stopColor: 'rgba(170,238,255,.4)' }),
                h('stop', { offset: '100%', stopColor: 'rgba(30,90,120,0)' }),
              ),
              h(
                'radialGradient',
                { id: 'acbNodeCore' },
                h('stop', { offset: '0%', stopColor: 'rgba(255,255,255,.98)' }),
                h('stop', { offset: '28%', stopColor: 'rgba(224,252,255,.6)' }),
                h('stop', { offset: '100%', stopColor: 'rgba(120,220,255,0)' }),
              ),
              h(
                'radialGradient',
                { id: 'acbSeedGlow' },
                h('stop', { offset: '0%', stopColor: 'rgba(255,255,255,1)' }),
                h('stop', { offset: '24%', stopColor: 'rgba(198,246,255,.58)' }),
                h('stop', { offset: '100%', stopColor: 'rgba(60,150,190,0)' }),
              ),
              h(
                'radialGradient',
                { id: 'acbSeedCore' },
                h('stop', { offset: '0%', stopColor: '#ffffff' }),
                h('stop', { offset: '22%', stopColor: 'rgba(255,255,255,.99)' }),
                h('stop', { offset: '44%', stopColor: 'rgba(224,251,255,.72)' }),
                h('stop', { offset: '72%', stopColor: 'rgba(150,225,255,.22)' }),
                h('stop', { offset: '100%', stopColor: 'rgba(120,220,255,0)' }),
              ),
              h(
                'radialGradient',
                { id: 'acbDomeFill', cx: '50%', cy: '46%', r: '52%' },
                h('stop', { offset: '0%', stopColor: 'rgba(200,242,255,.05)' }),
                h('stop', { offset: '58%', stopColor: 'rgba(170,228,255,.11)' }),
                h('stop', { offset: '86%', stopColor: 'rgba(200,242,255,.19)' }),
                h('stop', { offset: '96%', stopColor: 'rgba(240,253,255,.38)' }),
                h('stop', { offset: '100%', stopColor: 'rgba(255,255,255,0)' }),
              ),
              h(
                'clipPath',
                { id: 'acbRiseClip' },
                h('rect', { className: 'acb-rise-rect', x: 0, y: 0, width: 1600, height: 900 }),
              ),
              h(
                'filter',
                { id: 'acbCoastGlow', x: '-20%', y: '-20%', width: '140%', height: '140%' },
                h('feGaussianBlur', { stdDeviation: 4.5, result: 'blur' }),
                h('feMerge', null, h('feMergeNode', { in: 'blur' }), h('feMergeNode', { in: 'SourceGraphic' })),
              ),
              h(
                'filter',
                { id: 'acbSoftGlow', x: '-30%', y: '-30%', width: '160%', height: '160%' },
                h('feGaussianBlur', { stdDeviation: 8, result: 'blur' }),
                h('feMerge', null, h('feMergeNode', { in: 'blur' }), h('feMergeNode', { in: 'SourceGraphic' })),
              ),
              clipDefs,
            ),
            h('rect', { width: 1600, height: 900, fill: 'url(#acbSea)' }),
            h('g', { className: 'acb-graticule' }, graticule),
            h('g', { className: 'acb-lands' }, lands),
            h(
              'g',
              { clipPath: 'url(#acbClip-main)' },
              h('path', { d: LANDS[0].d, fill: 'url(#acbTerrainPat)', className: 'acb-land-tex' }),
            ),
            h('g', { className: 'acb-highlights' }, highlights),
            h('g', { className: 'acb-nodes' }, nodes),
            seed,
            h('g', { className: 'acb-cities' }, cities),
          ),
        ),
      );
    }
    const HOLO = h('div', {
      className: 'acb-holo',
      style: { backgroundImage: 'url("' + asset('holo') + '")' },
      'aria-hidden': true,
    });

    function HudChrome({ t, phaseId }) {
      const midKey =
        {
          brief: 'brief.kicker',
          theater: 'theater.title',
          console: 'console.kicker',
          title: 'title.mission',
        }[phaseId] || 'brief.kicker';
      return h(
        React.Fragment,
        null,
        h('div', { className: 'acb-shade', 'aria-hidden': true }),
        h('div', { className: 'acb-scan', 'aria-hidden': true }),
        h('div', { className: 'acb-grain', 'aria-hidden': true }),
        h('div', { className: 'acb-vignette', 'aria-hidden': true }),
        h(
          'div',
          { className: 'acb-brackets', 'aria-hidden': true },
          h('i', { className: 'acb-bracket tl' }),
          h('i', { className: 'acb-bracket tr' }),
          h('i', { className: 'acb-bracket bl' }),
          h('i', { className: 'acb-bracket br' }),
        ),
        h(
          'header',
          { className: 'acb-chrome acb-chrome-top', 'aria-hidden': true },
          h(
            'div',
            { className: 'acb-brand' },
            h('span', { className: 'acb-brand-mark' }),
            h('b', null, 'DEEPSEEK'),
            h('em', null, 'HARNESS'),
          ),
          h('div', { className: 'acb-chrome-mid' }, t(midKey)),
          h(
            'div',
            { className: 'acb-chrome-right' },
            h('span', { className: 'acb-chrome-tag' }, t('console.classified')),
            h('span', { className: 'acb-clock' }, clockLabel()),
          ),
        ),
        h(
          'footer',
          { className: 'acb-chrome acb-chrome-bottom', 'aria-hidden': true },
          h('span', null, t('hud.theater')),
          h('span', { className: 'acb-chrome-line' }),
          h('span', null, t('hud.link')),
          h('span', { className: 'acb-chrome-build' }, t('hud.build')),
        ),
      );
    }

    function BriefScene({ active, past, t }) {
      return h(
        Scene,
        { id: 'brief', active, past },
        h(
          'div',
          { className: 'acb-brief-inner' },
          h('div', { className: 'acb-brief-holo', 'aria-hidden': true }, h('div', { className: 'acb-orbit-ring' }), h('div', { className: 'acb-orbit-ring acb-orbit-ring-2' })),
          h(
            'div',
            { className: 'acb-brief-copy' },
            h('div', { className: 'acb-kicker' }, t('brief.kicker')),
            h(
              'div',
              { className: 'acb-wordmark', 'aria-label': 'DEEPSEEK HARNESS' },
              h('span', { className: 'acb-wordmark-main' }, 'DEEPSEEK'),
              h('span', { className: 'acb-wordmark-sub' }, 'HARNESS'),
            ),
            h('div', { className: 'acb-brief-rule', 'aria-hidden': true }),
            h('div', { className: 'acb-brief-op' }, t('brief.op')),
            h('div', { className: 'acb-brief-zh' }, t('brief.zh')),
            h(
              'div',
              { className: 'acb-brief-status' },
              h('span', { className: 'acb-pulse' }),
              h('span', null, t('brief.link')),
            ),
            h(
              'div',
              { className: 'acb-progress' },
              h('i', { className: 'acb-progress-fill' }),
              h('span', { className: 'acb-progress-label' }, t('brief.clearance')),
            ),
          ),
          h(
            'div',
            { className: 'acb-brief-data' },
            h('div', { className: 'acb-panel-head' }, 'BRIEFING DATA', h('i', null)),
            h(
              'ul',
              { className: 'acb-data-list' },
              [
                ['TGT', 'LOCAL THEATER'],
                ['GRID', '06 // ALPHA'],
                ['UPLINK', 'ENCRYPTED'],
                ['STATUS', 'GREEN'],
              ].map(function (row, index) {
                return h(
                  'li',
                  { key: row[0], style: { '--acb-i': index } },
                  h('b', null, row[0]),
                  h('span', null, row[1]),
                );
              }),
            ),
          ),
        ),
      );
    }

    function TheaterScene({ active, past, t }) {
      return h(
        Scene,
        { id: 'theater', active, past },
        h(
          'div',
          { className: 'acb-rails acb-rails-left', 'aria-hidden': true },
          h('div', { className: 'acb-rail-mark' }, h('i', null), 'DSH // LOCAL COMMAND'),
          h('div', { className: 'acb-rail-head' }, 'SAT DATA LINK'),
          h('div', { className: 'acb-rail-sub' }, 'UPLOAD STATUS // 06'),
          h(
            'ul',
            { className: 'acb-rail-list' },
            SAT_ROWS.map(function (row, index) {
              return h('li', { key: 'sat-' + index, style: { '--acb-i': index } }, row);
            }),
          ),
          h('div', { className: 'acb-rail-head acb-rail-head-gap' }, 'NODE STATUS'),
          h(
            'ul',
            { className: 'acb-rail-list' },
            NODE_ROWS.map(function (row, index) {
              return h('li', { key: 'node-row-' + index, style: { '--acb-i': index } }, row);
            }),
          ),
        ),
        h(
          'div',
          { className: 'acb-rails acb-rails-right', 'aria-hidden': true },
          h('div', { className: 'acb-rail-head' }, 'PLATE 06 // LOCAL'),
          h(
            'ul',
            { className: 'acb-rail-list' },
            PLATE_ROWS.map(function (row, index) {
              return h('li', { key: 'plate-' + index, style: { '--acb-i': index } }, row);
            }),
          ),
          h('div', { className: 'acb-rail-head acb-rail-head-gap' }, 'THEATER GRID'),
          h(
            'ul',
            { className: 'acb-rail-list' },
            GRID_ROWS.map(function (row, index) {
              return h('li', { key: 'grid-' + index, style: { '--acb-i': index } }, row);
            }),
          ),
        ),
        h(
          'div',
          { className: 'acb-caption' },
          h('p', { className: 'acb-caption-en' }, t('theater.caption')),
          h('p', { className: 'acb-caption-zh' }, t('theater.caption.zh')),
        ),
      );
    }

    function Radar() {
      return h(
        'div',
        { className: 'acb-radar', 'aria-hidden': true },
        h('i', { className: 'acb-radar-sweep' }),
        h('i', { className: 'acb-radar-blip acb-radar-blip-a' }),
        h('i', { className: 'acb-radar-blip acb-radar-blip-b' }),
        h('i', { className: 'acb-radar-blip acb-radar-blip-c' }),
        h('span', null, 'RADAR // 06'),
      );
    }

    function ConsoleScene({ active, past, t }) {
      const rows = [t('console.identity'), t('console.cred'), t('console.profile')];
      return h(
        Scene,
        { id: 'console', active, past },
        h('div', { className: 'acb-classified', 'aria-hidden': true }, 'CLASSIFIED'),
        h(
          'div',
          { className: 'acb-console-left' },
          h('div', { className: 'acb-kicker' }, t('console.kicker')),
          h(
            'div',
            { className: 'acb-access-card' },
            h('div', { className: 'acb-access-head' }, 'IDENTITY // CACHED', h('i', null)),
            h(
              'ul',
              null,
              rows.map(function (row, index) {
                return h(
                  'li',
                  { key: row, style: { '--acb-i': index } },
                  h('span', { className: 'acb-check' }, '✓'),
                  h('span', null, row),
                );
              }),
            ),
            h('div', { className: 'acb-access-stamp' }, t('console.granted')),
          ),
          h('div', { className: 'acb-console-zh' }, t('console.zh')),
        ),
        h(
          'div',
          { className: 'acb-console-right' },
          h('div', { className: 'acb-panel-head' }, t('console.check'), h('i', null)),
          h(
            'ul',
            { className: 'acb-check-list' },
            NODES.slice(0, 5).map(function (node, index) {
              return h(
                'li',
                { key: node.tag, style: { '--acb-i': index } },
                h('span', { className: 'acb-check' }, '✓'),
                h('span', null, node.tag + ' // ' + node.name),
                h('em', null, 'READY'),
              );
            }),
          ),
          h(Radar),
          h(
            'div',
            { className: 'acb-telemetry', 'aria-hidden': true },
            h('span', null, 'ALT 12,400M'),
            h('span', null, 'GRID 06'),
            h('span', null, 'T+00:07'),
          ),
        ),
      );
    }

    function TitleScene({ active, past, t }) {
      return h(
        Scene,
        { id: 'title', active, past },
        h('div', { className: 'acb-title-flare', 'aria-hidden': true }),
        h(
          'div',
          { className: 'acb-title-wrap' },
          h('div', { className: 'acb-ghost', 'aria-hidden': true }, '01'),
          h('div', { className: 'acb-kicker acb-title-kicker' }, t('title.kicker')),
          h(
            'h2',
            { className: 'acb-title', 'aria-label': 'DEEPSEEK HARNESS' },
            h('span', { className: 'acb-title-main' }, 'DEEPSEEK'),
            h('span', { className: 'acb-title-sub' }, 'HARNESS'),
          ),
          h('div', { className: 'acb-title-rule', 'aria-hidden': true }),
          h('p', { className: 'acb-title-note' }, t('title.zh')),
          h('div', { className: 'acb-title-start' }, t('title.start')),
          h(
            'div',
            { className: 'acb-chips' },
            ['title.chip1', 'title.chip2', 'title.chip3'].map(function (key, index) {
              return h('span', { key, style: { '--acb-i': index } }, t(key));
            }),
          ),
          h(
            'div',
            { className: 'acb-prompt' },
            h('span', { className: 'acb-prompt-key', 'aria-hidden': true }, '↵'),
            h('span', null, t('title.prompt')),
            h('i', { className: 'acb-prompt-caret', 'aria-hidden': true }),
          ),
          h(
            'div',
            { className: 'acb-auto', 'aria-hidden': true },
            h('span', null, t('title.auto')),
            h('div', { className: 'acb-auto-track' }, h('i', null)),
          ),
        ),
      );
    }

    function Scene({ id, active, past, children }) {
      return h(
        'section',
        {
          className:
            'acb-scene acb-scene-' + id + (active ? ' is-active' : '') + (past ? ' is-past' : ''),
          'data-scene': id,
          'aria-hidden': active ? undefined : 'true',
        },
        children,
      );
    }

    function BootHost({ t, getActive, subscribeLocale }) {
      const [runId, setRunId] = useState(0);
      const bootAllowedRef = useRef(false);

      const start = useCallback(() => {
        const rt = runtime();
        if (rt.running) return;
        rt.running = true;
        rt.hasPlayed = true;
        rt.lastStartedAt = Date.now();
        markBootPlayed();
        preloadArt();
        setRunId((value) => value + 1);
      }, []);

      const finish = useCallback(() => {
        const rt = runtime();
        rt.running = false;
        rt.lastFinishedAt = Date.now();
      }, []);

      useEffect(() => {
        const rt = runtime();
        const interrupted = rt.hasPlayed && rt.lastStartedAt > 0 && rt.lastFinishedAt === 0;
        rt.running = false;

        // The opening belongs to the application launch. A page load inside an
        // already-started window session (wake from sleep, tray restore, manual
        // refresh) keeps the sessionStorage flag and skips it.
        const played = bootAlreadyPlayed();
        const allowed = HOT_RELOAD || !played || interrupted;
        bootAllowedRef.current = allowed;

        if (!allowed) {
          removeBootSplash();
        } else if (!document.hidden) {
          start();
        }

        const onVisibility = () => {
          if (document.hidden) return;
          const state = runtime();
          if (state.running) return;
          const waiting =
            !state.hasPlayed || (state.lastStartedAt > 0 && state.lastFinishedAt === 0);
          if (bootAllowedRef.current && waiting) start();
        };

        document.addEventListener('visibilitychange', onVisibility);
        return () => {
          document.removeEventListener('visibilitychange', onVisibility);
        };
      }, [start]);

      useEffect(() => {
        const replay = function () {
          try {
            const rt = runtime();
            rt.running = false;
            start();
          } catch (error) {
            /* ignore */
          }
        };
        try {
          window.__ACB_REPLAY = replay;
        } catch (error) {
          /* ignore */
        }
        const onHotkey = function (event) {
          if (event.ctrlKey && event.altKey && event.shiftKey && (event.key === 'b' || event.key === 'B')) {
            event.preventDefault();
            replay();
          }
        };
        window.addEventListener('keydown', onHotkey);
        return function () {
          window.removeEventListener('keydown', onHotkey);
          try {
            if (window.__ACB_REPLAY === replay) delete window.__ACB_REPLAY;
          } catch (error) {
            /* ignore */
          }
        };
      }, [start]);

      if (runId === 0) return null;

      return h(React.Fragment, null, [
        h('style', { key: 'css', dangerouslySetInnerHTML: { __html: CSS } }),
        h(Sequence, {
          key: 'run-' + runId,
          t,
          getActive,
          subscribeLocale,
          onDone: finish,
        }),
      ]);
    }

    function Sequence({ t, getActive, subscribeLocale, onDone }) {
      const [reduced] = useState(prefersReducedMotion);
      const duration = reduced ? REDUCED_MS : DURATION_MS;
      const phaseTimes = reduced ? REDUCED_PHASES : PHASE_TIMES;
      const fadeAt = duration - (reduced ? 420 : FADE_MS);

      const [phase, setPhase] = useState(0);
      const [leaving, setLeaving] = useState(false);
      const [quick, setQuick] = useState(false);
      const [gone, setGone] = useState(false);
      const [localeTick, setLocaleTick] = useState(0);

      const phaseRef = useRef(0);
      const stopped = useRef(false);
      const doneRef = useRef(false);
      const fadeStarted = useRef(false);
      const skipTimer = useRef(null);

      const translate = useCallback(
        function (key) {
          let active = '';
          try {
            active = getActive() || '';
          } catch (error) {
            active = '';
          }
          const dict = /^zh/i.test(active) ? ZH : EN;
          try {
            const value = t(key);
            if (typeof value === 'string' && value !== key) return value;
          } catch (error) {
            /* fall through to the bundled dictionary */
          }
          return Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : key;
        },
        [t, getActive, localeTick],
      );

      const finish = useCallback(
        function () {
          if (doneRef.current) return;
          doneRef.current = true;
          try {
            onDone();
          } catch (error) {
            /* the host controller must not crash the page */
          }
        },
        [onDone],
      );

      const skip = useCallback(
        function (event) {
          if (event && event.preventDefault) event.preventDefault();
          stopped.current = true;
          setQuick(true);
          setLeaving(true);
          finish();
          if (skipTimer.current) clearTimeout(skipTimer.current);
          skipTimer.current = setTimeout(function () {
            setGone(true);
          }, SKIP_FADE_MS);
        },
        [finish],
      );

      useLayoutEffect(
        function () {
          removeBootSplash();
        },
        [],
      );

      useEffect(
        function () {
          let raf = 0;
          let alive = true;
          let last = performance.now();
          let elapsed = 0;
          const tick = function (timestamp) {
            if (!alive || stopped.current) return;
            const delta = Math.min(1000, Math.max(0, timestamp - last));
            last = timestamp;
            if (!document.hidden) elapsed += delta;

            let nextPhase = 0;
            for (let index = 0; index < phaseTimes.length; index += 1) {
              if (elapsed >= phaseTimes[index]) nextPhase = index;
            }
            if (nextPhase !== phaseRef.current) {
              phaseRef.current = nextPhase;
              setPhase(nextPhase);
            }

            if (!fadeStarted.current && elapsed >= fadeAt) {
              fadeStarted.current = true;
              setLeaving(true);
            }

            if (elapsed >= duration) {
              finish();
              setGone(true);
              alive = false;
              return;
            }
            raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
          return function () {
            alive = false;
            cancelAnimationFrame(raf);
          };
        },
        [duration, fadeAt, finish, phaseTimes],
      );

      useEffect(
        function () {
          if (typeof subscribeLocale !== 'function') return undefined;
          try {
            return subscribeLocale(function () {
              setLocaleTick(function (value) {
                return value + 1;
              });
            });
          } catch (error) {
            return undefined;
          }
        },
        [subscribeLocale],
      );

      useEffect(
        function () {
          const onKey = function (event) {
            if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') skip(event);
          };
          window.addEventListener('keydown', onKey, true);
          return function () {
            window.removeEventListener('keydown', onKey, true);
          };
        },
        [skip],
      );

      useEffect(
        function () {
          return function () {
            if (skipTimer.current) clearTimeout(skipTimer.current);
          };
        },
        [],
      );

      if (gone) return null;

      const phaseId = PHASES[phase] ? PHASES[phase].id : 'title';
      const t2 = translate;

      const root = h(
        'div',
        {
          className:
            'acb-root' +
            (leaving ? ' acb-leaving' : '') +
            (quick ? ' acb-quick' : '') +
            (reduced ? ' acb-static' : ''),
          'data-phase': phaseId,
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': t2('aria.label'),
          onPointerDown: skip,
        },
        HOLO,
        h(TheaterMap, { t: t2 }),
        h(HudChrome, { t: t2, phaseId }),
        h(
          'div',
          { className: 'acb-stage' },
          h(BriefScene, { t: t2, active: phase === 0, past: phase > 0 }),
          h(TheaterScene, { t: t2, active: phase === 1, past: phase > 1 }),
          h(ConsoleScene, { t: t2, active: phase === 2, past: phase > 2 }),
          h(TitleScene, { t: t2, active: phase === 3, past: phase > 3 }),
        ),
        h('div', { key: 'sweep-' + phase, className: 'acb-sweep', 'aria-hidden': true }),
        leaving ? h('div', { key: 'flash', className: 'acb-flash', 'aria-hidden': true }) : null,
        h(
          'button',
          {
            type: 'button',
            className: 'acb-skip',
            'aria-label': t2('aria.skip'),
            onClick: function (event) {
              event.stopPropagation();
              skip(event);
            },
          },
          t2('skip.label') + ' // ESC',
        ),
      );

      return ReactDOM.createPortal(root, document.body);
    }

    class Boundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { failed: false };
      }
      static getDerivedStateFromError() {
        return { failed: true };
      }
      componentDidCatch(error) {
        try {
          window.__acbError = error && error.message ? error.message : String(error);
        } catch (nested) {
          /* ignore */
        }
      }
      render() {
        if (this.state.failed) return null;
        return this.props.children;
      }
    }

    const CSS = String.raw`
.acb-root{position:fixed;inset:0;z-index:9000;overflow:hidden;background:#02070b;
  color:#eef8fd;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Cascadia Mono",monospace;
  font-size:12px;line-height:1.5;letter-spacing:.06em;--acb-amber:#ffab4a;--acb-cyan:#7fe9ff;
  --acb-magenta:#e2568f;user-select:none;cursor:default;}
.acb-root *{box-sizing:border-box;}
.acb-root button{font:inherit;}
.acb-root.acb-leaving{animation:acbRootOut .8s ease forwards;}
.acb-root.acb-quick{animation:acbRootQuick .24s ease forwards;}
@keyframes acbRootOut{to{opacity:0}}
@keyframes acbRootQuick{to{opacity:0}}
.acb-holo{position:absolute;inset:-6%;z-index:0;background-position:center;background-size:cover;
  opacity:.58;filter:saturate(.95) contrast(1.02);transition:opacity 1s ease,filter 1s ease;
  pointer-events:none;}
.acb-holo::after{content:"";position:absolute;inset:0;
  background:radial-gradient(60% 55% at 52% 46%,rgba(2,8,12,.02),rgba(2,7,11,.62) 82%,#02070b 100%);}
.acb-root[data-phase="theater"] .acb-holo{opacity:.06;filter:blur(2px);}
.acb-root[data-phase="console"] .acb-holo{opacity:.28;filter:saturate(.8);}
.acb-root[data-phase="title"] .acb-holo{opacity:.2;filter:blur(1px);}
.acb-map{position:absolute;inset:0;z-index:1;pointer-events:none;
  transition:opacity .9s ease,filter .9s ease;}
.acb-map-plane{position:absolute;inset:-9% -6%;transform-origin:50% 46%;
  transition:transform .9s cubic-bezier(.2,.6,.2,1);
  transform:perspective(1700px) rotateX(7deg) scale(1.04);}
.acb-map-svg{width:100%;height:100%;display:block;}
.acb-root[data-phase="brief"] .acb-map{opacity:.34;filter:blur(1.2px) saturate(.95);}
.acb-root[data-phase="brief"] .acb-map-plane{transform:perspective(1700px) rotateX(17deg) scale(1.24);}
.acb-root[data-phase="theater"] .acb-map{opacity:1;filter:none;}
.acb-root[data-phase="theater"] .acb-map-plane{transform:perspective(1700px) rotateX(5deg) scale(1.03);}
.acb-root[data-phase="console"] .acb-map{opacity:.32;filter:blur(1px);}
.acb-root[data-phase="console"] .acb-map-plane{transform:perspective(1700px) rotateX(10deg) scale(1.1);}
.acb-root[data-phase="title"] .acb-map{opacity:.26;filter:blur(1.6px);}
.acb-root[data-phase="title"] .acb-map-plane{transform:perspective(1700px) rotateX(12deg) scale(1.14);}
.acb-graticule line{stroke:rgba(96,190,255,.09);stroke-width:1;}
.acb-graticule line.major{stroke:rgba(96,200,255,.16);}
.acb-graticule line.axis{stroke:rgba(140,230,255,.22);stroke-dasharray:7 7;}
.acb-graticule text{fill:rgba(150,215,245,.38);font-size:7.5px;letter-spacing:.16em;}
.acb-land{fill:rgba(5,16,27,.74);stroke:rgba(184,246,255,.9);stroke-width:1.05;}
.acb-land-halo{fill:none;stroke:rgba(88,208,255,.32);stroke-width:5;filter:url(#acbSoftGlow);}
.acb-land-tex{opacity:.14;filter:hue-rotate(150deg) saturate(.55) brightness(.8);}
.acb-highlights{opacity:1;transition:opacity .5s ease;}
.acb-root[data-phase="brief"] .acb-highlights{opacity:0;}
.acb-highlight{fill:rgba(200,60,130,.19);stroke:rgba(255,120,180,.58);stroke-width:1;stroke-dasharray:5 5;}
.acb-highlight-glow{fill:url(#acbGlowMagenta);mix-blend-mode:screen;opacity:.68;}
.acb-highlight-label{fill:rgba(255,170,205,.9);font-size:10px;letter-spacing:.24em;text-transform:uppercase;}
.acb-rise-rect{transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(1);}
.acb-root[data-phase="theater"] .acb-rise-rect{animation:acbRegionRise 1.6s cubic-bezier(.2,.75,.2,1) 1.55s both;}
@keyframes acbRegionRise{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.acb-root[data-phase="theater"] .acb-highlight{animation:acbHighlightIn 1.1s ease .95s both;}
@keyframes acbHighlightIn{from{opacity:0}to{opacity:1}}
.acb-root[data-phase="theater"] .acb-highlight-glow{animation:acbHighlightBloom 4.2s ease 1.55s both;}
@keyframes acbHighlightBloom{0%{opacity:0}22%{opacity:1}62%{opacity:.8}100%{opacity:.5}}
.acb-root[data-phase="theater"] .acb-highlight-label{animation:acbLabelIn .8s ease 2s both;}
@keyframes acbLabelIn{from{opacity:0}to{opacity:1}}
.acb-city circle{fill:rgba(220,250,255,.9);}
.acb-city text{fill:rgba(196,238,255,.62);font-size:8px;letter-spacing:.14em;}
.acb-node{opacity:.92;}
.acb-root[data-phase="brief"] .acb-node{opacity:0;}
.acb-node-rays{opacity:0;transform-box:fill-box;transform-origin:center;}
.acb-node-rays line{stroke:rgba(190,240,255,.2);stroke-width:.65;}
.acb-node-rays line.mid{stroke:rgba(214,250,255,.28);stroke-width:.78;}
.acb-node-rays line.long{stroke:rgba(238,253,255,.44);stroke-width:.92;}
.acb-node-rays line.hot{stroke:rgba(255,255,255,.66);stroke-width:1.15;}
.acb-node-rays line.spike{stroke:rgba(255,255,255,.34);stroke-width:.9;}
.acb-node-ring{fill:rgba(4,14,22,.5);stroke:rgba(190,246,255,.6);stroke-width:1;}
.acb-node-dot{fill:#e8fdff;filter:drop-shadow(0 0 6px #fff) drop-shadow(0 0 18px rgba(235,252,255,1)) drop-shadow(0 0 40px rgba(150,228,255,.8));}
.acb-node.is-hub .acb-node-dot{filter:drop-shadow(0 0 8px #fff) drop-shadow(0 0 24px rgba(235,252,255,1)) drop-shadow(0 0 56px rgba(150,228,255,.9));}
.acb-node-ring,.acb-node-dot{transform-box:fill-box;transform-origin:center;}
.acb-node-halo{mix-blend-mode:screen;opacity:0;transform-box:fill-box;transform-origin:center;}
.acb-node-halo-core{mix-blend-mode:screen;opacity:0;transform-box:fill-box;transform-origin:center;}
.acb-node.is-hub .acb-node-halo{opacity:.66;}
.acb-node.is-hub .acb-node-halo-core{opacity:.7;}
.acb-node-label{fill:rgba(214,246,255,.85);font-size:8.5px;letter-spacing:.16em;}
.acb-node-tag{fill:rgba(255,190,130,.68);font-size:7px;letter-spacing:.14em;}
.acb-root[data-phase="brief"] .acb-node-label,
.acb-root[data-phase="brief"] .acb-node-tag{opacity:0;}
.acb-root[data-phase="theater"] .acb-node .acb-node-ring,
.acb-root[data-phase="theater"] .acb-node .acb-node-dot{animation:acbNodeCoreIn .55s ease calc(1.85s + var(--acb-i) * .08s) both;}
@keyframes acbNodeCoreIn{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}
.acb-root[data-phase="theater"] .acb-node .acb-node-halo,
.acb-root[data-phase="theater"] .acb-node .acb-node-halo-core{animation:acbNodeHaloIn 2.2s ease calc(1.62s + var(--acb-i) * .09s) both;}
@keyframes acbNodeHaloIn{0%{opacity:0;transform:scale(.4)}22%{opacity:.95;transform:scale(1.1)}55%{opacity:.7;transform:scale(1)}100%{opacity:0;transform:scale(1.15)}}
.acb-root[data-phase="theater"] .acb-node .acb-node-rays{animation:acbNodeRaysOut 1.7s ease calc(1.68s + var(--acb-i) * .09s) both;}
@keyframes acbNodeRaysOut{0%{opacity:0;transform:scale(.05)}16%{opacity:1;transform:scale(1)}42%{opacity:.95;transform:scale(1.01)}100%{opacity:0;transform:scale(1.08)}}
.acb-root[data-phase="theater"] .acb-node.is-hub .acb-node-halo{animation-name:acbNodeHaloHub;}
@keyframes acbNodeHaloHub{0%{opacity:0;transform:scale(.4)}20%{opacity:1;transform:scale(1.12)}55%{opacity:.85;transform:scale(1)}100%{opacity:.5;transform:scale(1.05)}}
.acb-root[data-phase="theater"] .acb-node.is-hub .acb-node-halo-core{animation-name:acbNodeHaloCoreHub;}
@keyframes acbNodeHaloCoreHub{0%{opacity:0;transform:scale(.4)}20%{opacity:1;transform:scale(1.15)}45%{opacity:.9;transform:scale(1)}100%{opacity:.6;transform:scale(1.08)}}
.acb-root[data-phase="theater"] .acb-node-label,
.acb-root[data-phase="theater"] .acb-node-tag{animation:acbLabelIn .8s ease calc(2.6s + var(--acb-i) * .05s) both;}
.acb-seed-anchor{pointer-events:none;}
.acb-seed-dome-wrap{opacity:0;transform-box:fill-box;transform-origin:center;}
.acb-root[data-phase="theater"] .acb-seed-dome-wrap{animation:acbDomeGrow 3.4s cubic-bezier(.2,.6,.2,1) 1.05s both;}
@keyframes acbDomeGrow{
  0%{opacity:0;transform:scale(.07)}
  9%{opacity:.9;transform:scale(.2)}
  38%{opacity:.85;transform:scale(.78)}
  62%{opacity:.7;transform:scale(1.16)}
  82%{opacity:.35;transform:scale(1.5)}
  100%{opacity:0;transform:scale(1.72)}
}
.acb-seed-dome{fill:url(#acbDomeFill);}
.acb-seed-dome-rim{fill:none;stroke:rgba(228,252,255,.42);stroke-width:1.3;filter:drop-shadow(0 0 12px rgba(170,240,255,.6));}
.acb-seed-dome-inner{fill:none;stroke:rgba(180,236,255,.22);stroke-width:.8;stroke-dasharray:3 7;
  transform-box:fill-box;transform-origin:center;animation:acbSpin 60s linear infinite;}
.acb-seed-coregroup{opacity:0;}
.acb-root[data-phase="theater"] .acb-seed-coregroup{animation:acbSeedCoreFade 3.5s linear .95s both;}
@keyframes acbSeedCoreFade{0%{opacity:0}6%{opacity:1}72%{opacity:1}88%{opacity:.9}100%{opacity:0}}
.acb-seed{opacity:0;transform-box:fill-box;transform-origin:center;}
.acb-root[data-phase="theater"] .acb-seed{animation:acbSeedRise 3.4s cubic-bezier(.2,.7,.25,1) .95s both;}
@keyframes acbSeedRise{
  0%{opacity:0;transform:scale(.25)}
  8%{opacity:1;transform:scale(.8)}
  18%{opacity:1;transform:scale(1.02)}
  28%{opacity:1;transform:scale(1.1)}
  45%{opacity:1;transform:scale(1.16)}
  62%{opacity:1;transform:scale(1.22)}
  80%{opacity:1;transform:scale(1.32)}
  100%{opacity:0;transform:scale(1.65)}
}
.acb-seed-halo{mix-blend-mode:screen;}
.acb-root[data-phase="theater"] .acb-seed-halo-far{animation:acbSeedHaloFar 1.8s ease 1.9s both;}
@keyframes acbSeedHaloFar{from{opacity:.7}to{opacity:0}}
.acb-root[data-phase="theater"] .acb-seed-halo-mid{animation:acbSeedHaloMid 1.8s ease 1.85s both;}
@keyframes acbSeedHaloMid{from{opacity:.92}to{opacity:0}}
.acb-root[data-phase="theater"] .acb-seed-halo-near{animation:acbSeedHaloNear 1.7s ease 1.8s both;}
@keyframes acbSeedHaloNear{from{opacity:1}to{opacity:0}}
.acb-seed-halo-far{opacity:.7;}
.acb-seed-halo-mid{opacity:.92;}
.acb-seed-halo-near{opacity:1;}
.acb-seed-ring{fill:none;stroke:rgba(255,255,255,.7);stroke-width:.8;stroke-dasharray:2 4;}
.acb-seed-flare{mix-blend-mode:screen;}
.acb-seed-core{fill:#ffffff;filter:drop-shadow(0 0 5px #fff) drop-shadow(0 0 16px #fff) drop-shadow(0 0 48px rgba(220,250,255,1)) drop-shadow(0 0 96px rgba(150,228,255,.85));}
.acb-seed-core-inner{fill:#ffffff;}
.acb-seed-rays{opacity:0;transform-box:fill-box;transform-origin:center;}
.acb-seed-rays line{stroke:rgba(208,248,255,.3);stroke-width:.65;}
.acb-seed-rays line.hot{stroke:rgba(255,255,255,.7);stroke-width:1;}
.acb-root[data-phase="theater"] .acb-seed-rays{animation:acbSeedRays 1.6s ease 1s both;}
@keyframes acbSeedRays{0%{opacity:0;transform:scale(.08)}12%{opacity:1;transform:scale(1)}40%{opacity:1;transform:scale(1.02)}100%{opacity:0;transform:scale(1.16)}}
.acb-rails{position:absolute;top:15vh;z-index:4;width:200px;font-size:7.5px;line-height:1.75;
  letter-spacing:.1em;color:rgba(176,230,250,.62);pointer-events:none;text-shadow:0 0 8px rgba(0,0,0,.9);line-height:1.9;}
.acb-rails-left{left:24px;text-align:left;border-left:1px solid rgba(96,200,255,.24);padding-left:14px;}
.acb-rails::before{content:"";position:absolute;top:-22px;bottom:-22px;left:-28px;right:-26px;z-index:-1;pointer-events:none;
  background:linear-gradient(90deg,rgba(1,6,10,.92),rgba(1,6,10,.6) 62%,rgba(1,6,10,0));backdrop-filter:blur(2px);}
.acb-rails-right::before{left:-26px;right:-28px;
  background:linear-gradient(270deg,rgba(1,6,10,.92),rgba(1,6,10,.6) 62%,rgba(1,6,10,0));backdrop-filter:blur(2px);}
.acb-rails-right{right:24px;text-align:right;border-right:1px solid rgba(96,200,255,.22);padding-right:14px;}
.acb-rail-mark{display:flex;align-items:center;gap:8px;font-size:8px;letter-spacing:.26em;
  color:rgba(220,248,255,.7);margin-bottom:16px;}
.acb-rail-mark i{width:9px;height:9px;border:1px solid rgba(255,171,74,.8);transform:rotate(45deg);display:inline-block;}
.acb-rail-head{display:flex;align-items:center;gap:8px;font-size:8px;letter-spacing:.26em;
  color:rgba(210,244,255,.8);text-transform:uppercase;margin-top:6px;}
.acb-rail-head::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,rgba(96,200,255,.4),transparent);}
.acb-rails-right .acb-rail-head::after{background:linear-gradient(270deg,rgba(96,200,255,.4),transparent);}
.acb-rail-sub{font-size:6.5px;color:rgba(150,210,235,.36);letter-spacing:.2em;margin-top:2px;}
.acb-rail-head-gap{margin-top:18px;}
.acb-rail-list{list-style:none;margin:6px 0 0;padding:0;}
.acb-rail-list li{opacity:0;animation:acbRailIn .5s ease forwards;animation-delay:calc(.2s + var(--acb-i) * .06s);white-space:pre;}
.acb-rails-right .acb-rail-list li{text-align:right;}
@keyframes acbRailIn{to{opacity:1}}
.acb-caption{position:absolute;left:50%;bottom:calc(6.5vh + 54px);transform:translateX(-50%);z-index:4;
  width:min(920px,82vw);text-align:center;pointer-events:none;text-shadow:0 2px 14px rgba(0,0,0,.9);}
.acb-caption-en{margin:0;font-family:"Segoe UI",system-ui,sans-serif;font-size:clamp(13px,1.15vw,17px);
  letter-spacing:.04em;color:#eef9ff;font-weight:400;}
.acb-caption-zh{margin:6px 0 0;font-size:10px;letter-spacing:.16em;color:rgba(190,230,245,.5);}
.acb-shade{position:absolute;inset:0;z-index:2;pointer-events:none;
  background:linear-gradient(180deg,rgba(2,6,9,.5),transparent 26%,transparent 70%,rgba(2,6,9,.62));}
.acb-scan{position:absolute;inset:0;z-index:7;pointer-events:none;opacity:.45;
  background:repeating-linear-gradient(0deg,rgba(127,233,255,.03) 0 1px,transparent 1px 4px);
  animation:acbScan 9s linear infinite;}
@keyframes acbScan{from{transform:translateY(0)}to{transform:translateY(8px)}}
.acb-grain{position:absolute;inset:-20%;z-index:8;pointer-events:none;opacity:.05;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='.9'/></svg>");
  animation:acbGrain 1.2s steps(3) infinite;}
@keyframes acbGrain{0%{transform:translate3d(0,0,0)}33%{transform:translate3d(-1.5%,1%,0)}66%{transform:translate3d(1%,-1.5%,0)}100%{transform:translate3d(0,0,0)}}
.acb-vignette{position:absolute;inset:0;z-index:7;pointer-events:none;
  background:radial-gradient(80% 70% at 50% 48%,transparent 42%,rgba(0,0,0,.5) 100%);}
.acb-brackets{position:absolute;inset:calc(6.5vh + 18px) 26px;z-index:9;pointer-events:none;}
.acb-bracket{position:absolute;width:46px;height:46px;border:1px solid rgba(255,171,74,.55);}
.acb-bracket.tl{left:0;top:0;border-right:0;border-bottom:0;}
.acb-bracket.tr{right:0;top:0;border-left:0;border-bottom:0;}
.acb-bracket.bl{left:0;bottom:0;border-right:0;border-top:0;}
.acb-bracket.br{right:0;bottom:0;border-left:0;border-top:0;}
.acb-chrome{position:absolute;left:30px;right:30px;z-index:10;display:flex;align-items:center;
  justify-content:space-between;gap:18px;font-size:9px;letter-spacing:.3em;text-transform:uppercase;
  color:rgba(196,230,242,.6);pointer-events:none;}
.acb-chrome-top{top:calc(6.5vh + 16px);}
.acb-chrome-bottom{bottom:calc(6.5vh + 14px);}
.acb-brand{display:flex;align-items:center;gap:8px;color:rgba(238,248,253,.85);}
.acb-brand-mark{width:7px;height:7px;background:var(--acb-amber);box-shadow:0 0 12px rgba(255,171,74,.8);transform:rotate(45deg);}
.acb-brand b{font-weight:600;letter-spacing:.24em;}
.acb-brand em{font-style:normal;color:var(--acb-amber);letter-spacing:.24em;}
.acb-chrome-mid{flex:1;text-align:center;color:rgba(127,233,255,.55);font-size:8px;}
.acb-chrome-right{display:flex;align-items:center;gap:18px;}
.acb-chrome-tag{color:rgba(255,171,74,.65);}
.acb-clock{color:rgba(238,248,253,.85);}
.acb-chrome-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(127,233,255,.28),transparent);}
.acb-chrome-build{color:rgba(255,171,74,.66);}
.acb-skip{position:absolute;right:26px;bottom:calc(6.5vh + 44px);z-index:12;pointer-events:auto;
  background:rgba(2,8,12,.45);border:1px solid rgba(127,233,255,.22);color:rgba(196,230,242,.62);
  padding:6px 12px;font-size:9px;letter-spacing:.24em;text-transform:uppercase;border-radius:2px;cursor:pointer;
  backdrop-filter:blur(6px);transition:border-color .2s,color .2s;}
.acb-skip:hover{border-color:rgba(255,171,74,.56);color:#ffe4c2;}
.acb-sweep{position:absolute;top:0;bottom:0;left:0;right:0;z-index:11;pointer-events:none;
  background:linear-gradient(100deg,transparent 38%,rgba(255,186,100,.18) 48%,rgba(255,244,220,.5) 50%,rgba(255,186,100,.18) 52%,transparent 62%);
  mix-blend-mode:screen;animation:acbSweep .9s cubic-bezier(.3,.1,.2,1) both;}
@keyframes acbSweep{from{transform:translateX(-110%);opacity:0}18%{opacity:1}to{transform:translateX(110%);opacity:0}}
.acb-flash{position:absolute;inset:0;z-index:11;pointer-events:none;background:rgba(255,241,224,.24);
  animation:acbFlash .8s ease both;}
@keyframes acbFlash{from{opacity:0}12%{opacity:.85}to{opacity:0}}
.acb-stage{position:absolute;inset:0;z-index:3;}
.acb-scene{position:absolute;inset:0;opacity:0;visibility:hidden;transition:opacity .35s ease,visibility .35s;}
.acb-scene.is-past{opacity:0;visibility:hidden;}
.acb-scene.is-active{opacity:1;visibility:visible;}
.acb-kicker{font-size:10px;letter-spacing:.4em;color:var(--acb-amber);text-transform:uppercase;
  text-shadow:0 0 18px rgba(255,171,74,.36);}
.acb-brief-inner{position:absolute;inset:0;display:flex;align-items:center;gap:5vw;padding:0 7vw 2vh;}
.acb-brief-data{position:absolute;right:6vw;top:22vh;width:min(260px,22vw);}
.acb-brief-holo{flex:0 0 auto;width:min(320px,26vw);height:min(320px,26vw);position:relative;}
.acb-orbit-ring{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(127,233,255,.4);
  border-left-color:transparent;border-right-color:transparent;animation:acbSpin 22s linear infinite;}
.acb-orbit-ring-2{inset:14%;border:1px dashed rgba(255,171,74,.45);animation-direction:reverse;animation-duration:16s;}
@keyframes acbSpin{to{transform:rotate(360deg)}}
.acb-brief-copy{min-width:0;}
.acb-wordmark{margin-top:20px;line-height:.86;}
.acb-wordmark-main{display:block;font-family:"Segoe UI",system-ui,-apple-system,sans-serif;font-weight:700;
  font-size:clamp(48px,7vw,104px);letter-spacing:.16em;padding-left:.16em;
  background:linear-gradient(180deg,#ffffff 0%,#eefaff 34%,#bfeefd 52%,#7fb9c9 56%,#d9f8ff 64%,#ffffff 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 16px 44px rgba(0,0,0,.7));clip-path:inset(0 100% 0 0);
  animation:acbWord 1.05s cubic-bezier(.23,1,.32,1) .05s forwards;}
.acb-wordmark-sub{display:block;margin-top:10px;font-size:clamp(13px,1.7vw,21px);letter-spacing:.85em;
  padding-left:.3em;color:var(--acb-amber);text-shadow:0 0 26px rgba(255,171,74,.4);
  animation:acbFadeUp .8s ease .45s both;}
@keyframes acbWord{to{clip-path:inset(0 0 0 0)}}
@keyframes acbFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.acb-brief-rule{width:min(420px,36vw);height:1px;margin:22px 0 0;
  background:linear-gradient(90deg,rgba(255,171,74,.85),rgba(127,233,255,.55),transparent);
  transform:scaleX(0);transform-origin:left;animation:acbRule .8s ease .5s forwards;}
@keyframes acbRule{to{transform:scaleX(1)}}
.acb-brief-op{margin-top:16px;font-size:11px;letter-spacing:.34em;color:rgba(211,248,255,.78);}
.acb-brief-zh{margin-top:8px;font-size:12px;letter-spacing:.18em;color:rgba(202,232,244,.58);}
.acb-brief-status{display:flex;align-items:center;gap:10px;margin-top:26px;font-size:10px;
  letter-spacing:.26em;color:rgba(255,171,74,.78);}
.acb-pulse{width:7px;height:7px;border-radius:50%;background:var(--acb-amber);
  box-shadow:0 0 12px rgba(255,171,74,.9);animation:acbPulse 1.6s ease-in-out infinite;}
@keyframes acbPulse{0%,100%{opacity:.4;transform:scale(.8)}50%{opacity:1;transform:scale(1.1)}}
.acb-progress{position:relative;width:min(340px,40vw);height:2px;margin-top:18px;background:rgba(127,233,255,.14);}
.acb-progress-fill{display:block;height:100%;transform-origin:left;transform:scaleX(0);
  background:linear-gradient(90deg,rgba(127,233,255,.85),var(--acb-amber));
  animation:acbBar 2.4s cubic-bezier(.77,0,.175,1) .3s forwards;}
@keyframes acbBar{to{transform:scaleX(1)}}
.acb-progress-label{position:absolute;right:0;top:8px;font-size:8px;letter-spacing:.24em;color:rgba(202,232,244,.44);}
.acb-intel{position:absolute;left:4vw;top:20vh;width:min(260px,22vw);}
.acb-intel-list{margin:14px 0 0;}
.acb-intel-list div{display:flex;justify-content:space-between;gap:12px;padding:7px 0;
  border-bottom:1px solid rgba(127,233,255,.1);opacity:0;animation:acbRowY .4s ease forwards;
  animation-delay:calc(.15s + var(--acb-i) * .12s);}
.acb-intel-list dt{font-size:9px;letter-spacing:.24em;color:rgba(202,232,244,.44);}
.acb-intel-list dd{margin:0;font-size:10px;letter-spacing:.12em;color:rgba(216,246,255,.82);text-align:right;}
.acb-intel-note{margin-top:14px;font-size:9px;letter-spacing:.24em;color:rgba(255,171,74,.6);}
.acb-data{position:absolute;right:4vw;top:18vh;width:min(300px,25vw);}
.acb-panel-head{display:flex;align-items:center;gap:10px;font-size:9px;letter-spacing:.3em;
  color:rgba(255,171,74,.82);text-transform:uppercase;}
.acb-panel-head i{flex:1;height:1px;background:linear-gradient(90deg,rgba(255,171,74,.5),transparent);}
.acb-data-list{list-style:none;margin:14px 0 0;padding:0;display:grid;gap:8px;}
.acb-data-list li{display:flex;align-items:center;gap:8px;font-size:9px;letter-spacing:.14em;
  color:rgba(202,232,244,.66);opacity:0;animation:acbRowY .4s ease forwards;
  animation-delay:calc(.2s + var(--acb-i) * .14s);}
.acb-data-list b{color:rgba(255,196,120,.85);font-weight:500;}
.acb-data-list span:last-child{color:rgba(216,246,255,.75);}
.acb-check{color:var(--acb-amber);text-shadow:0 0 10px rgba(255,171,74,.6);}
@keyframes acbRowY{to{opacity:1;transform:translateY(0)}}
.acb-data-bar{width:100%;height:2px;margin-top:16px;background:rgba(127,233,255,.12);overflow:hidden;}
.acb-data-bar i{display:block;height:100%;transform-origin:left;transform:scaleX(0);
  background:linear-gradient(90deg,rgba(127,233,255,.8),var(--acb-amber));
  animation:acbBar 3s cubic-bezier(.77,0,.175,1) .5s forwards;}
.acb-legend{position:absolute;left:4vw;right:4vw;bottom:calc(6.5vh + 46px);display:flex;align-items:center;
  gap:22px;font-size:8px;letter-spacing:.24em;color:rgba(202,232,244,.5);text-transform:uppercase;}
.acb-legend span{display:flex;align-items:center;gap:8px;}
.acb-legend .dot{width:7px;height:7px;border-radius:50%;display:inline-block;}
.dot-a{background:var(--acb-amber);box-shadow:0 0 10px rgba(255,171,74,.8);}
.dot-b{background:rgba(255,196,120,.7);}
.dot-c{background:rgba(127,233,255,.5);}
.acb-legend-right{margin-left:auto;color:rgba(255,171,74,.6);}
.acb-classified{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-7deg);
  font-family:"Segoe UI",system-ui,sans-serif;font-weight:800;font-size:clamp(90px,12vw,190px);
  letter-spacing:.1em;color:transparent;-webkit-text-stroke:1px rgba(255,171,74,.09);
  white-space:nowrap;pointer-events:none;z-index:0;}
.acb-console-left{position:absolute;left:6vw;top:50%;transform:translateY(-50%);z-index:3;max-width:min(420px,40vw);}
.acb-access-card{margin-top:18px;border:1px solid rgba(127,233,255,.2);background:rgba(2,9,13,.66);
  padding:18px 20px 16px;backdrop-filter:blur(10px);box-shadow:0 20px 60px rgba(0,0,0,.5);}
.acb-access-head{display:flex;align-items:center;gap:10px;font-size:9px;letter-spacing:.32em;
  color:rgba(255,171,74,.82);text-transform:uppercase;}
.acb-access-head i{flex:1;height:1px;background:linear-gradient(90deg,rgba(255,171,74,.5),transparent);}
.acb-access-card ul{list-style:none;margin:14px 0 0;padding:0;display:grid;gap:9px;}
.acb-access-card li{display:flex;align-items:center;gap:10px;font-size:10px;letter-spacing:.2em;
  color:rgba(202,232,244,.72);opacity:0;transform:translateY(6px);
  animation:acbRowY .4s ease forwards;animation-delay:calc(.5s + var(--acb-i) * .24s);}
.acb-access-stamp{margin-top:16px;padding:6px 12px;display:inline-block;border:1px solid rgba(255,171,74,.6);
  color:#ffd9a8;font-size:12px;letter-spacing:.26em;background:rgba(255,120,30,.08);
  animation:acbStamp .5s cubic-bezier(.2,1.4,.4,1) 1.3s both;}
@keyframes acbStamp{from{opacity:0;transform:scale(1.3)}to{opacity:1;transform:scale(1)}}
.acb-console-zh{margin-top:16px;font-size:12px;letter-spacing:.2em;color:rgba(202,232,244,.58);}
.acb-console-right{position:absolute;right:6vw;top:50%;transform:translateY(-50%);z-index:3;
  width:min(320px,27vw);}
.acb-check-list{list-style:none;margin:14px 0 0;padding:0;display:grid;gap:8px;font-size:9px;letter-spacing:.16em;}
.acb-check-list li{display:flex;align-items:center;gap:8px;color:rgba(211,248,255,.7);
  opacity:0;transform:translateX(-10px);animation:acbRow .45s ease forwards;
  animation-delay:calc(.4s + var(--acb-i) * .16s);}
.acb-check-list li em{margin-left:auto;font-style:normal;color:rgba(202,232,244,.4);letter-spacing:.06em;}
@keyframes acbRow{to{opacity:1;transform:translateX(0)}}
.acb-radar{position:relative;right:auto;bottom:auto;width:140px;height:140px;border-radius:50%;
  margin:26px 0 0 auto;
  border:1px solid rgba(127,233,255,.24);
  background:radial-gradient(circle,rgba(2,10,14,.2) 0 42%,rgba(2,10,14,.55));
  box-shadow:inset 0 0 40px rgba(127,233,255,.08);}
.acb-radar::before,.acb-radar::after{content:"";position:absolute;inset:18%;border-radius:50%;
  border:1px solid rgba(127,233,255,.14);}
.acb-radar::after{inset:38%;}
.acb-radar-sweep{position:absolute;inset:0;border-radius:50%;
  background:conic-gradient(from 0deg,rgba(255,171,74,.42),rgba(255,171,74,.08) 26deg,transparent 56deg);
  animation:acbSpin 4.8s linear infinite;}
.acb-radar-blip{position:absolute;width:5px;height:5px;border-radius:50%;background:var(--acb-amber);
  box-shadow:0 0 10px rgba(255,171,74,.9);animation:acbBlip 2.4s ease-in-out infinite;}
.acb-radar-blip-a{left:30%;top:36%;animation-delay:.3s}
.acb-radar-blip-b{left:62%;top:54%;animation-delay:.9s}
.acb-radar-blip-c{left:46%;top:70%;animation-delay:1.5s}
@keyframes acbBlip{0%,100%{opacity:.2}50%{opacity:1}}
.acb-radar span{position:absolute;left:50%;bottom:-20px;transform:translateX(-50%);font-size:8px;
  letter-spacing:.26em;color:rgba(127,233,255,.5);white-space:nowrap;}
.acb-telemetry{display:flex;justify-content:flex-end;gap:18px;margin-top:28px;font-size:9px;letter-spacing:.2em;color:rgba(127,233,255,.5);}
.acb-title-wrap{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:3;
  width:min(1000px,90vw);text-align:center;}
.acb-ghost{position:absolute;left:50%;top:50%;transform:translate(-50%,-56%);
  font-family:"Segoe UI",system-ui,sans-serif;font-weight:800;font-size:clamp(160px,26vw,380px);
  line-height:1;color:rgba(255,255,255,.022);-webkit-text-stroke:1px rgba(127,233,255,.06);pointer-events:none;}
.acb-title-kicker{margin-bottom:18px;}
.acb-title{font-family:"Segoe UI",system-ui,-apple-system,sans-serif;margin:0;line-height:.9;font-weight:700;}
.acb-title-main{display:block;font-size:clamp(44px,6.6vw,96px);letter-spacing:.2em;padding-left:.2em;
  color:#f2fbff;text-shadow:0 20px 60px rgba(0,0,0,.75),0 0 40px rgba(127,233,255,.18);
  clip-path:inset(0 100% 0 0);animation:acbWord 1.1s cubic-bezier(.23,1,.32,1) .1s forwards;}
.acb-title-sub{display:block;margin-top:8px;font-size:clamp(13px,1.5vw,19px);letter-spacing:1em;
  padding-left:.5em;color:var(--acb-amber);text-shadow:0 0 30px rgba(255,171,74,.5);
  animation:acbFadeUp .8s ease .5s both;}
.acb-title-rule{width:min(480px,46vw);height:1px;margin:22px auto 0;transform:scaleX(0);
  background:linear-gradient(90deg,transparent,rgba(255,171,74,.9),rgba(127,233,255,.9),transparent);
  animation:acbRule .9s ease .55s forwards;}
.acb-title-start{margin-top:18px;display:inline-block;padding:7px 18px;border:1px solid rgba(255,171,74,.65);
  color:#ffd9a8;font-size:clamp(13px,1.6vw,19px);letter-spacing:.3em;background:rgba(255,120,30,.07);
  animation:acbStamp .5s cubic-bezier(.2,1.4,.4,1) .9s both;}
.acb-title-note{margin:14px 0 0;font-size:12px;letter-spacing:.2em;color:rgba(202,232,244,.66);}
.acb-chips{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;margin-top:18px;}
.acb-chips span{font-size:9px;letter-spacing:.24em;color:rgba(211,248,255,.72);padding:6px 12px;
  border:1px solid rgba(127,233,255,.2);background:rgba(127,233,255,.05);
  opacity:0;animation:acbFadeUp .45s ease forwards;animation-delay:calc(1s + var(--acb-i) * .14s);}
.acb-prompt{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:22px;
  font-size:10px;letter-spacing:.3em;color:rgba(238,248,253,.72);}
.acb-prompt-key{color:var(--acb-amber);font-size:14px;}
.acb-prompt-caret{width:7px;height:14px;background:var(--acb-amber);animation:acbCaret 1.1s steps(2) infinite;}
@keyframes acbCaret{0%,49%{opacity:1}50%,100%{opacity:0}}
.acb-auto{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:14px;
  font-size:8px;letter-spacing:.3em;color:rgba(127,233,255,.5);}
.acb-auto-track{width:180px;height:2px;background:rgba(127,233,255,.14);overflow:hidden;}
.acb-auto-track i{display:block;height:100%;transform-origin:left;transform:scaleX(0);
  background:linear-gradient(90deg,rgba(127,233,255,.8),var(--acb-amber));
  animation:acbBar 3.6s linear .2s forwards;}
.acb-title-flare{position:absolute;left:50%;top:36%;width:60vw;height:40vh;transform:translate(-50%,-50%);
  z-index:1;pointer-events:none;mix-blend-mode:screen;
  background:radial-gradient(46% 42% at 50% 50%,rgba(255,196,120,.16),transparent 72%);}
.acb-root.acb-static .acb-map{filter:none;}
.acb-root.acb-static .acb-sweep,.acb-root.acb-static .acb-grain,.acb-root.acb-static .acb-scan{display:none;}
@media (max-width:760px){
  .acb-chrome{left:18px;right:18px;font-size:7px;}
  .acb-chrome-mid,.acb-chrome-tag{display:none;}
  .acb-brackets{inset:calc(6.5vh + 12px) 14px;}
  .acb-brief-inner{padding:0 6vw;gap:4vw;}
  .acb-brief-holo{width:26vw;height:26vw;}
  .acb-intel,.acb-data{top:16vh;width:36vw;}
  .acb-intel{left:4vw;}
  .acb-data{right:4vw;}
  .acb-console-left{left:5vw;max-width:52vw;}
  .acb-console-right{right:5vw;width:36vw;}
  .acb-radar{display:none;}
  .acb-telemetry{margin-top:20px;flex-wrap:wrap;gap:10px;}
  .acb-skip{right:14px;bottom:calc(6.5vh + 36px);}
}
@media (prefers-reduced-motion:reduce){
  .acb-root *,.acb-root *::before,.acb-root *::after{animation-duration:.001s!important;
    animation-delay:0s!important;animation-iteration-count:1!important;transition-duration:.001s!important;}
  .acb-root .acb-map{filter:none;}
}
`;

    function apply(ctx) {
      let translate;
      try {
        translate = ctx.locale.bind(NS);
      } catch (error) {
        translate = function (key) {
          return key;
        };
      }

      const getActive = function () {
        try {
          const snapshot = ctx.locale.getLocale();
          return (snapshot && snapshot.active) || '';
        } catch (error) {
          try {
            return navigator.language || 'en';
          } catch (nested) {
            return 'en';
          }
        }
      };

      const subscribeLocale = function (listener) {
        try {
          if (typeof ctx.locale.subscribe === 'function') return ctx.locale.subscribe(listener);
        } catch (error) {
          /* locale subscription is optional */
        }
        return function () {};
      };

      ctx.effect(function () {
        const disposers = [];
        try {
          disposers.push(ctx.locale.register(NS, 'zh', ZH));
        } catch (error) {
          console.warn('[ac-boot] zh dictionary was not registered', error);
        }
        try {
          disposers.push(ctx.locale.register(NS, 'en', EN));
        } catch (error) {
          console.warn('[ac-boot] en dictionary was not registered', error);
        }
        return function () {
          for (const dispose of disposers) {
            try {
              dispose();
            } catch (error) {
              /* idempotent by contract */
            }
          }
        };
      }, 'ac-boot: dictionaries');

      ctx.slots.inject('shell.overlay', function () {
        return ctx.slots.register({ name: 'shell.overlay', id: 'ac-boot', order: ORDER }, function () {
          return h(
            Boundary,
            null,
            h(BootHost, {
              t: translate,
              getActive: getActive,
              subscribeLocale: subscribeLocale,
            }),
          );
        });
      });
    }

    return {
      name: 'ac-boot',
      inject: ['slots', 'locale'],
      apply: apply,
    };
  },
});
