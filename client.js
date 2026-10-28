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
      { id: 'theater', at: 2800 },
      { id: 'console', at: 7200 },
      { id: 'title', at: 10800 },
    ];
    const PHASE_TIMES = PHASES.map((phase) => phase.at);
    const REDUCED_PHASES = [0, 1100, 2300, 3400];

    const ZH = {
      'aria.label': 'DeepSeek Harness 开机动画',
      'aria.skip': '跳过开机动画',
      'skip.label': '跳过',
      'hud.op': '行动 // 第一缕光',
      'hud.build': '版本 14.0 // 本地',
      'hud.theater': '本地战区 // 06',
      'hud.link': '链路安全',
      'brief.kicker': '战术简报 // 本地战区',
      'brief.op': '行动 // 第一缕光',
      'brief.zh': '作战简报 · 本地战区',
      'brief.link': '加密上行链路建立中',
      'brief.clearance': '简报准备中',
      'theater.kicker': '战区态势',
      'theater.title': '本地战区',
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
      'hud.build': 'BUILD 14.0 // LOCAL',
      'hud.theater': 'LOCAL THEATER // 06',
      'hud.link': 'LINK SECURE',
      'brief.kicker': 'TACTICAL BRIEFING // LOCAL THEATER',
      'brief.op': 'OPERATION // FIRST LIGHT',
      'brief.zh': 'MISSION BRIEFING · LOCAL THEATER',
      'brief.link': 'ESTABLISHING ENCRYPTED UPLINK',
      'brief.clearance': 'AWAITING BRIEFING',
      'theater.kicker': 'THEATER OVERVIEW',
      'theater.title': 'LOCAL THEATER',
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

    // Fictional theater landmass. The tactical map is original linework; the
    // Agnes terrain texture is clipped inside it.
    const CONTINENT =
      'M 260 300 C 240 250 300 210 355 225 C 395 175 490 185 520 235 ' +
      'C 585 195 675 205 710 250 C 780 230 835 265 855 320 C 925 330 965 290 1025 315 ' +
      'C 1090 310 1130 355 1165 395 C 1235 395 1285 430 1300 485 C 1360 505 1375 565 1330 605 ' +
      'C 1360 660 1320 715 1255 715 C 1220 765 1145 780 1095 750 C 1045 790 965 780 925 740 ' +
      'C 870 775 800 760 765 720 C 710 750 640 730 615 690 C 555 710 495 680 475 640 ' +
      'C 420 660 360 625 350 585 C 295 570 275 520 295 480 C 250 455 250 395 295 385 ' +
      'C 265 355 265 320 260 300 Z';

    const REGIONS = [
      { d: 'M 290 250 L 700 225 L 765 455 L 410 570 Z', fill: 'rgba(44,150,170,.2)' },
      { d: 'M 700 225 L 1050 300 L 1080 520 L 765 455 Z', fill: 'rgba(60,180,195,.16)' },
      { d: 'M 410 570 L 765 455 L 905 700 L 555 705 Z', fill: 'rgba(40,140,165,.18)' },
      { d: 'M 765 455 L 1080 520 L 1180 705 L 905 700 Z', fill: 'rgba(70,190,205,.13)' },
    ];
    const PRIMARY_SECTOR = 'M 760 300 L 900 460 L 760 620 L 620 460 Z';

    const NODES = [
      { x: 430, y: 330, code: 'TGT-01', en: 'PROFILE', zh: '读取配置' },
      { x: 640, y: 290, code: 'TGT-02', en: 'SERVICES', zh: '启动服务' },
      { x: 860, y: 360, code: 'TGT-03', en: 'WORKSPACE', zh: '索引工作区' },
      { x: 1030, y: 470, code: 'TGT-04', en: 'SESSION', zh: '恢复会话' },
      { x: 820, y: 600, code: 'TGT-05', en: 'DISPLAY', zh: '界面同步' },
      { x: 520, y: 560, code: 'TGT-06', en: 'LINK', zh: '链路建立' },
    ];

    const ROUTE =
      'M 430 330 C 500 300 575 285 640 290 C 730 298 800 320 860 360 ' +
      'C 930 400 990 430 1030 470 C 960 530 880 580 820 600 ' +
      'C 720 630 610 600 520 560 C 470 520 430 420 430 330';

    function TheaterMap({ t }) {
      const hash = React.useMemo ? React.useMemo(() => Math.random(), []) : 1;
      const regions = REGIONS.map(function (region, index) {
        return h('path', {
          key: 'region-' + index,
          d: region.d,
          fill: region.fill,
          stroke: region.stroke || 'rgba(127,233,255,.16)',
          strokeWidth: region.stroke ? 1 : 0.6,
        });
      });
      const route = h('g', { className: 'acb-map-route' }, [
        h('path', {
          key: 'glow',
          d: ROUTE,
          fill: 'none',
          stroke: 'rgba(255,171,74,.35)',
          strokeWidth: 6,
          filter: 'url(#acbSoftGlow)',
        }),
        h('path', {
          key: 'dash',
          d: ROUTE,
          fill: 'none',
          stroke: 'rgba(255,196,120,.9)',
          strokeWidth: 1.6,
          strokeDasharray: '8 8',
          className: 'acb-route-dash',
        }),
      ]);
      const nodeGroups = NODES.map(function (node, index) {
        return h(
          'g',
          {
            key: node.code,
            className: 'acb-map-node',
            style: { '--acb-i': index },
            transform: 'translate(' + node.x + ' ' + node.y + ')',
          },
          h('circle', { className: 'acb-node-ping', r: 20 }),
          h('circle', { className: 'acb-node-ring', r: 12 }),
          h('circle', { className: 'acb-node-dot', r: 3.4 }),
          h('path', { className: 'acb-node-tick', d: 'M 0 -26 L 0 -16 M 0 26 L 0 16 M -26 0 L -16 0 M 26 0 L 16 0' }),
          h('text', { className: 'acb-node-code', x: 20, y: -6 }, node.code),
          h('text', { className: 'acb-node-name', x: 20, y: 9 }, node.en),
          h('text', { className: 'acb-node-zh', x: 20, y: 21 }, node.zh),
        );
      });

      return h(
        'div',
        { className: 'acb-map', 'aria-hidden': true },
        h(
          'svg',
          { className: 'acb-map-svg', viewBox: '0 0 1600 900', preserveAspectRatio: 'xMidYMid slice' },
          h(
            'defs',
            null,
            h(
              'linearGradient',
              { id: 'acbSea', x1: '0', y1: '0', x2: '1', y2: '1' },
              h('stop', { offset: '0%', stopColor: '#041018' }),
              h('stop', { offset: '55%', stopColor: '#030b12' }),
              h('stop', { offset: '100%', stopColor: '#01050a' }),
            ),
            h(
              'radialGradient',
              { id: 'acbLandShade', cx: '50%', cy: '46%', r: '70%' },
              h('stop', { offset: '0%', stopColor: 'rgba(2,10,14,.1)' }),
              h('stop', { offset: '62%', stopColor: 'rgba(2,8,12,.45)' }),
              h('stop', { offset: '100%', stopColor: 'rgba(1,5,8,.92)' }),
            ),
            h(
              'pattern',
              { id: 'acbTerrainPat', patternUnits: 'userSpaceOnUse', width: 1600, height: 900 },
              h('image', { href: asset('terrain'), width: 1600, height: 900, preserveAspectRatio: 'xMidYMid slice' }),
            ),
            h(
              'pattern',
              { id: 'acbGrid', patternUnits: 'userSpaceOnUse', width: 80, height: 80 },
              h('path', { d: 'M 80 0 L 0 0 0 80', fill: 'none', stroke: 'rgba(127,233,255,.045)', strokeWidth: 1 }),
            ),
            h('clipPath', { id: 'acbLandClip' }, h('path', { d: CONTINENT })),
            h(
              'filter',
              { id: 'acbCoastGlow', x: '-20%', y: '-20%', width: '140%', height: '140%' },
              h('feGaussianBlur', { stdDeviation: 5, result: 'blur' }),
              h('feMerge', null, h('feMergeNode', { in: 'blur' }), h('feMergeNode', { in: 'SourceGraphic' })),
            ),
            h(
              'filter',
              { id: 'acbSoftGlow', x: '-30%', y: '-30%', width: '160%', height: '160%' },
              h('feGaussianBlur', { stdDeviation: 8, result: 'blur' }),
              h('feMerge', null, h('feMergeNode', { in: 'blur' }), h('feMergeNode', { in: 'SourceGraphic' })),
            ),
            h(
              'filter',
              { id: 'acbRegionBlur', x: '-10%', y: '-10%', width: '120%', height: '120%' },
              h('feGaussianBlur', { stdDeviation: 18 }),
            ),
          ),
          h('rect', { width: 1600, height: 900, fill: 'url(#acbSea)' }),
          h('rect', { width: 1600, height: 900, fill: 'url(#acbGrid)' }),
          h('ellipse', { cx: 800, cy: 470, rx: 660, ry: 400, fill: 'rgba(18,66,86,.16)', filter: 'url(#acbSoftGlow)' }),
          h('path', { d: CONTINENT, fill: 'url(#acbTerrainPat)', opacity: 0.74 }),
          h(
            'g',
            { clipPath: 'url(#acbLandClip)' },
            h('g', { filter: 'url(#acbRegionBlur)' }, regions.map(function (region) { return region; })),
            h('path', {
              key: 'primary-sector',
              d: PRIMARY_SECTOR,
              fill: 'rgba(190,60,120,.17)',
              stroke: 'rgba(230,90,150,.34)',
              strokeWidth: 1,
              strokeDasharray: '7 6',
            }),
          ),
          h('path', { d: CONTINENT, fill: 'url(#acbLandShade)', opacity: 0.55 }),
          h('path', {
            d: CONTINENT,
            fill: 'none',
            stroke: 'rgba(127,233,255,.55)',
            strokeWidth: 5,
            opacity: 0.3,
            filter: 'url(#acbSoftGlow)',
          }),
          h('path', {
            d: CONTINENT,
            fill: 'none',
            stroke: 'rgba(168,245,255,.92)',
            strokeWidth: 1.4,
            filter: 'url(#acbCoastGlow)',
          }),
          route,
          h('g', { className: 'acb-map-nodes' }, nodeGroups),
          h(
            'g',
            { className: 'acb-map-ticks' },
            h('path', { d: 'M 80 0 L 80 18 M 0 80 L 18 80 M 1520 0 L 1520 18 M 1600 80 L 1582 80', stroke: 'rgba(127,233,255,.3)' }),
            h('path', { d: 'M 80 900 L 80 882 M 0 820 L 18 820 M 1520 900 L 1520 882 M 1600 820 L 1582 820', stroke: 'rgba(127,233,255,.3)' }),
            h('text', { x: 96, y: 26 }, 'GRID 06 // LOCAL THEATER'),
            h('text', { x: 96, y: 886 }, 'SCALE 1:250 000'),
            h('text', { x: 1600 - 96, y: 26, textAnchor: 'end' }, 'OPERATION // FIRST LIGHT'),
            h('text', { x: 1600 - 96, y: 886, textAnchor: 'end' }, 'SEC ' + String(40 + Math.round(hash * 9)).padStart(2, '0')),
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
          'aside',
          { className: 'acb-intel' },
          h('div', { className: 'acb-panel-head' }, t('intel.header'), h('i', null)),
          h(
            'dl',
            { className: 'acb-intel-list' },
            [
              ['intel.tgt', 'intel.tgt.value'],
              ['intel.mission', 'intel.mission.value'],
              ['intel.op', 'intel.op.value'],
              ['intel.status', 'intel.status.value'],
            ].map(function (pair, index) {
              return h(
                'div',
                { key: pair[0], style: { '--acb-i': index } },
                h('dt', null, t(pair[0])),
                h('dd', null, t(pair[1])),
              );
            }),
          ),
          h('div', { className: 'acb-intel-note' }, t('theater.kicker')),
        ),
        h(
          'aside',
          { className: 'acb-data' },
          h('div', { className: 'acb-panel-head' }, t('data.header'), h('i', null)),
          h(
            'ul',
            { className: 'acb-data-list' },
            NODES.slice(0, 5).map(function (node, index) {
              return h(
                'li',
                { key: node.code, style: { '--acb-i': index } },
                h('span', { className: 'acb-check' }, '✓'),
                h('b', null, node.code),
                h('span', null, node.en),
              );
            }),
          ),
          h('div', { className: 'acb-data-bar' }, h('i', null)),
        ),
        h(
          'div',
          { className: 'acb-legend', 'aria-hidden': true },
          h('span', null, h('i', { className: 'dot dot-a' }), t('legend.active')),
          h('span', null, h('i', { className: 'dot dot-b' }), t('legend.route')),
          h('span', null, h('i', { className: 'dot dot-c' }), t('legend.grid')),
          h('span', { className: 'acb-legend-right' }, 'LIVE // BRIEFING'),
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
                { key: node.code, style: { '--acb-i': index } },
                h('span', { className: 'acb-check' }, '✓'),
                h('span', null, node.code + ' // ' + node.en),
                h('em', null, node.zh),
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
  transition:opacity .9s ease,filter .9s ease,transform 1.2s ease;transform-origin:56% 50%;}
.acb-map-svg{width:100%;height:100%;display:block;}
.acb-root[data-phase="brief"] .acb-map{opacity:.36;filter:blur(1.2px) saturate(.9);transform:scale(1.14);}
.acb-root[data-phase="theater"] .acb-map{opacity:1;filter:none;transform:scale(1.02);}
.acb-root[data-phase="console"] .acb-map{opacity:.34;filter:blur(1px);transform:scale(1.08);}
.acb-root[data-phase="title"] .acb-map{opacity:.26;filter:blur(1.6px);transform:scale(1.12);}
.acb-map-route{opacity:.9;}
.acb-route-dash{animation:acbDash 6s linear infinite;}
@keyframes acbDash{to{stroke-dashoffset:-96}}
.acb-map-node{opacity:.35;transition:opacity .6s ease;}
.acb-map-node .acb-node-ping{fill:none;stroke:rgba(127,233,255,.5);stroke-width:1;
  transform-box:fill-box;transform-origin:center;animation:acbPing 3s ease-out infinite;
  animation-delay:calc(var(--acb-i) * .18s);}
.acb-map-node .acb-node-ring{fill:rgba(2,10,14,.55);stroke:rgba(255,171,74,.8);stroke-width:1.1;}
.acb-map-node .acb-node-dot{fill:var(--acb-amber);filter:drop-shadow(0 0 6px rgba(255,171,74,.9));}
.acb-map-node .acb-node-tick{stroke:rgba(127,233,255,.5);stroke-width:1;}
.acb-node-code{fill:rgba(255,196,120,.8);font-size:9px;letter-spacing:.18em;}
.acb-node-name{fill:rgba(216,246,255,.82);font-size:10px;letter-spacing:.16em;}
.acb-node-zh{fill:rgba(160,208,222,.5);font-size:9px;letter-spacing:.06em;}
.acb-root[data-phase="theater"] .acb-map-node{opacity:.72;}
.acb-root[data-phase="theater"] .acb-map-node:first-child{animation:acbNodeIn .5s ease forwards;}
.acb-root[data-phase="theater"] .acb-map-node:nth-child(2){animation:acbNodeIn .5s ease .18s forwards;}
.acb-root[data-phase="theater"] .acb-map-node:nth-child(3){animation:acbNodeIn .5s ease .36s forwards;}
.acb-root[data-phase="theater"] .acb-map-node:nth-child(4){animation:acbNodeIn .5s ease .54s forwards;}
.acb-root[data-phase="theater"] .acb-map-node:nth-child(5){animation:acbNodeIn .5s ease .72s forwards;}
.acb-root[data-phase="theater"] .acb-map-node:nth-child(6){animation:acbNodeIn .5s ease .9s forwards;}
@keyframes acbNodeIn{from{opacity:.2}to{opacity:1}}
@keyframes acbPing{0%{transform:scale(.5);opacity:.7}70%{transform:scale(1.6);opacity:0}100%{transform:scale(1.6);opacity:0}}
.acb-map-ticks text{fill:rgba(127,233,255,.4);font-size:9px;letter-spacing:.22em;}
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
.acb-scene{position:absolute;inset:0;opacity:0;visibility:hidden;transition:opacity .55s ease,visibility .55s;}
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
.acb-telemetry{display:flex;justify-content:flex-end;gap:18px;margin-top:18px;font-size:9px;letter-spacing:.2em;color:rgba(127,233,255,.5);}
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
