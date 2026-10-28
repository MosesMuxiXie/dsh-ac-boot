/**
 * DeepSeek Harness — Ace Combat-style opening sequence (browser half).
 *
 * Four cinematic beats painted from Agnes key art:
 *
 *   1. brief   — holographic mission table, wordmark uplink
 *   2. launch  — carrier deck, launch clearance, system check
 *   3. ascent  — storm climb, operator access / identity
 *   4. title   — sunset above the clouds, mission title
 *
 * The run belongs to the application launch: BootHost records a flag in
 * sessionStorage when the sequence starts, so waking from sleep, restoring the
 * tray window or reloading the page never replays it. Only a plugin hot
 * refresh (an explicit authoring action) previews a new build again.
 *
 * Original generated artwork only: no game screenshots, fonts, audio, logos or
 * trademarks. The imagery ships as local assets served by the Host half.
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
    const ART_VERSION = '13';
    const ASSET_BASE = (() => {
      try {
        return window.__ACB_ASSET_BASE || '/acb/assets/';
      } catch (error) {
        return '/acb/assets/';
      }
    })();

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
      { id: 'launch', at: 2600 },
      { id: 'ascent', at: 6200 },
      { id: 'title', at: 9800 },
    ];
    const PHASE_TIMES = PHASES.map((phase) => phase.at);
    const REDUCED_PHASES = [0, 1100, 2300, 3400];

    const ZH = {
      'aria.label': 'DeepSeek Harness 开机动画',
      'aria.skip': '跳过开机动画',
      'skip.label': '跳过',
      'brief.kicker': '战术简报 // 本地战区',
      'brief.op': '作战 // 第一缕光',
      'brief.zh': '本地环境初始化 · 安全启动',
      'brief.link': '指挥链路建立中',
      'brief.clearance': '等待起飞许可',
      'launch.mission': '任务 01 // 第一缕光',
      'launch.clearance': '起飞许可',
      'launch.zh': '弹出准备 · 系统自检',
      'launch.cat': '弹射器就绪',
      'launch.throttle': '油门 100%',
      'launch.ready': '就绪',
      'ascent.kicker': '操作员权限',
      'ascent.identity': '身份校验通过',
      'ascent.cred': '本机凭据已恢复',
      'ascent.profile': '本机配置',
      'ascent.granted': '访问许可',
      'ascent.zh': '身份校验通过 · 正在进入工作区',
      'title.kicker': '任务 01 // 第一缕光',
      'title.mission': '任务完成',
      'title.chip1': '会话已恢复',
      'title.chip2': '工作区就绪',
      'title.chip3': '界面待命',
      'title.prompt': '按 Enter 继续',
      'title.auto': '自动继续',
      'title.zh': '系统就绪 · 即将进入工作区',
      'hud.build': '版本 13.0 // 本地',
      'hud.op': '行动 // 第一缕光',
      'hud.link': '链路安全',
      'hud.theater': '本地战区 // 06',
    };

    const EN = {
      'aria.label': 'DeepSeek Harness boot sequence',
      'aria.skip': 'Skip the boot sequence',
      'skip.label': 'SKIP',
      'brief.kicker': 'TACTICAL BRIEFING // LOCAL THEATER',
      'brief.op': 'OPERATION // FIRST LIGHT',
      'brief.zh': 'LOCAL ENVIRONMENT INITIALIZATION',
      'brief.link': 'ESTABLISHING COMMAND LINK',
      'brief.clearance': 'AWAITING LAUNCH CLEARANCE',
      'launch.mission': 'MISSION 01 // FIRST LIGHT',
      'launch.clearance': 'LAUNCH CLEARANCE',
      'launch.zh': 'SYSTEM CHECK · ALL STATIONS READY',
      'launch.cat': 'CATAPULT READY',
      'launch.throttle': 'THROTTLE 100%',
      'launch.ready': 'READY',
      'ascent.kicker': 'OPERATOR ACCESS',
      'ascent.identity': 'IDENTITY VERIFIED',
      'ascent.cred': 'CREDENTIALS RESTORED',
      'ascent.profile': 'LOCAL PROFILE',
      'ascent.granted': 'ACCESS GRANTED',
      'ascent.zh': 'OPERATOR VERIFIED · ENTERING WORKSPACE',
      'title.kicker': 'MISSION 01 // FIRST LIGHT',
      'title.mission': 'MISSION ACCOMPLISHED',
      'title.chip1': 'SESSIONS RESTORED',
      'title.chip2': 'WORKSPACE READY',
      'title.chip3': 'INTERFACE STANDBY',
      'title.prompt': 'PRESS ENTER TO CONTINUE',
      'title.auto': 'AUTO CONTINUE',
      'title.zh': 'SYSTEM READY · ENTERING WORKSPACE',
      'hud.build': 'BUILD 13.0 // LOCAL',
      'hud.op': 'OPERATION // FIRST LIGHT',
      'hud.link': 'LINK SECURE',
      'hud.theater': 'LOCAL THEATER // 06',
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

    /** Preload the four backdrops; the overlay renders gradients until they land. */
    function preloadArt() {
      try {
        const files = ['briefing', 'deck', 'ascent', 'horizon'];
        for (const file of files) {
          const image = new Image();
          image.src = ASSET_BASE + file + '.jpg?v=' + ART_VERSION;
        }
      } catch (error) {
        /* images are optional */
      }
    }

    const EMBLEM = h(
      'svg',
      { className: 'acb-emblem', viewBox: '0 0 96 96', 'aria-hidden': true },
      h('circle', { cx: '48', cy: '48', r: '44', className: 'acb-emblem-ring' }),
      h('circle', { cx: '48', cy: '48', r: '34', className: 'acb-emblem-ring acb-emblem-ring-2' }),
      h('path', {
        className: 'acb-emblem-wing',
        d: 'M48 16 L56 34 L78 40 L56 46 L48 80 L40 46 L18 40 L40 34 Z',
      }),
      h('path', { className: 'acb-emblem-core', d: 'M48 36 L53 44 L48 58 L43 44 Z' }),
    );

    function Art({ name, className }) {
      return h('div', {
        className: 'acb-art ' + (className || ''),
        style: { backgroundImage: 'url("' + ASSET_BASE + name + '.jpg?v=' + ART_VERSION + '")' },
        'aria-hidden': true,
      });
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

    function HudChrome({ t, phaseId }) {
      const midKey =
        {
          brief: 'brief.kicker',
          launch: 'launch.mission',
          ascent: 'ascent.kicker',
          title: 'title.mission',
        }[phaseId] || 'brief.kicker';
      return h(
        React.Fragment,
        null,
        h('div', { className: 'acb-letterbox acb-letterbox-top', 'aria-hidden': true }),
        h('div', { className: 'acb-letterbox acb-letterbox-bottom', 'aria-hidden': true }),
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
            h('span', null, t('hud.op')),
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
        h(Art, { name: 'briefing' }),
        h('div', { className: 'acb-brief-grade', 'aria-hidden': true }),
        h(
          'div',
          { className: 'acb-brief-inner' },
          h('div', { className: 'acb-brief-holo', 'aria-hidden': true }, EMBLEM),
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
            h('div', { className: 'acb-brief-rule', 'aria-hidden': true }, h('i', null)),
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
        ),
      );
    }

    function LaunchScene({ active, past, t }) {
      const stages = [
        { en: 'PROFILE READ', zh: '读取用户配置' },
        { en: 'SERVICES START', zh: '启动本地服务' },
        { en: 'WORKSPACE INDEX', zh: '索引工作区' },
        { en: 'DISPLAY SYNC', zh: '界面就绪' },
      ];
      return h(
        Scene,
        { id: 'launch', active, past },
        h(Art, { name: 'deck' }),
        h('div', { className: 'acb-launch-grade', 'aria-hidden': true }),
        h('div', { className: 'acb-launch-scan', 'aria-hidden': true }),
        h(
          'div',
          { className: 'acb-reticle', 'aria-hidden': true },
          h('i', { className: 'acb-reticle-ring' }),
          h('i', { className: 'acb-reticle-ring acb-reticle-ring-2' }),
          h('i', { className: 'acb-reticle-bracket tl' }),
          h('i', { className: 'acb-reticle-bracket tr' }),
          h('i', { className: 'acb-reticle-bracket bl' }),
          h('i', { className: 'acb-reticle-bracket br' }),
          h('span', { className: 'acb-reticle-tag' }, 'TGT // LOCAL PROFILE'),
          h('span', { className: 'acb-reticle-tag acb-reticle-tag-right' }, t('launch.throttle')),
        ),
        h(
          'div',
          { className: 'acb-launch-copy' },
          h('div', { className: 'acb-kicker' }, t('launch.mission')),
          h('div', { className: 'acb-stamp' }, t('launch.clearance')),
          h('div', { className: 'acb-launch-zh' }, t('launch.zh')),
          h(
            'ul',
            { className: 'acb-check-list' },
            stages.map(function (stage, index) {
              return h(
                'li',
                { key: stage.en, style: { '--acb-i': index } },
                h('span', { className: 'acb-check' }, '✓'),
                h('span', null, stage.en),
                h('em', null, stage.zh),
              );
            }),
          ),
          h(
            'div',
            { className: 'acb-launch-bars' },
            h('i', null),
            h('i', null),
            h('i', null),
            h('i', null),
            h('i', null),
            h('i', null),
          ),
          h('div', { className: 'acb-launch-cat' }, t('launch.cat')),
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

    function AscentScene({ active, past, t }) {
      const rows = [t('ascent.identity'), t('ascent.cred'), t('ascent.profile')];
      return h(
        Scene,
        { id: 'ascent', active, past },
        h(Art, { name: 'ascent' }),
        h('div', { className: 'acb-ascent-grade', 'aria-hidden': true }),
        h(Radar),
        h(
          'div',
          { className: 'acb-ascent-copy' },
          h('div', { className: 'acb-kicker' }, t('ascent.kicker')),
          h(
            'div',
            { className: 'acb-access-card' },
            h('div', { className: 'acb-access-head' }, t('ascent.kicker'), h('i', null)),
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
            h('div', { className: 'acb-access-stamp' }, t('ascent.granted')),
          ),
          h('div', { className: 'acb-ascent-zh' }, t('ascent.zh')),
          h(
            'div',
            { className: 'acb-telemetry', 'aria-hidden': true },
            h('span', null, 'ALT 12,400M'),
            h('span', null, 'SPD 940KM/H'),
            h('span', null, 'MISSION T+00:06'),
          ),
        ),
      );
    }

    function TitleScene({ active, past, t }) {
      return h(
        Scene,
        { id: 'title', active, past },
        h(Art, { name: 'horizon' }),
        h('div', { className: 'acb-title-grade', 'aria-hidden': true }),
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
          h('div', { className: 'acb-title-rule', 'aria-hidden': true }, h('i', null)),
          h('p', { className: 'acb-title-note' }, t('title.zh')),
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
          h('div', { className: 'acb-title-mission' }, t('title.mission')),
        ),
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
        // A remount can interrupt a run before it finishes — the shell may
        // replace slot renderers while the client modules finish loading.
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
        h(HudChrome, { t: t2, phaseId: phaseId }),
        h(
          'div',
          { className: 'acb-stage' },
          h(BriefScene, { t: t2, active: phase === 0, past: phase > 0 }),
          h(LaunchScene, { t: t2, active: phase === 1, past: phase > 1 }),
          h(AscentScene, { t: t2, active: phase === 2, past: phase > 2 }),
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
.acb-root{position:fixed;inset:0;z-index:9000;overflow:hidden;background:#030608;
  color:#eef8fd;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Cascadia Mono",monospace;
  font-size:12px;line-height:1.5;letter-spacing:.06em;--acb-amber:#ffab4a;--acb-cyan:#7fe9ff;
  --acb-dim:rgba(202,232,244,.62);user-select:none;cursor:default;}
.acb-root *{box-sizing:border-box;}
.acb-root button{font:inherit;}
.acb-root.acb-leaving{animation:acbRootOut .8s ease forwards;}
.acb-root.acb-quick{animation:acbRootQuick .24s ease forwards;}
@keyframes acbRootOut{to{opacity:0}}
@keyframes acbRootQuick{to{opacity:0}}
.acb-stage{position:absolute;inset:0;}
.acb-scene{position:absolute;inset:0;opacity:0;visibility:hidden;transition:opacity .55s ease,visibility .55s;
  overflow:hidden;}
.acb-scene.is-past{opacity:0;visibility:hidden;}
.acb-scene.is-active{opacity:1;visibility:visible;z-index:2;}
.acb-art{position:absolute;inset:-4%;background-position:center;background-size:cover;background-repeat:no-repeat;
  transform:scale(1.06);will-change:transform;filter:saturate(.96) contrast(1.04);}
.acb-scene-brief .acb-art{animation:acbArtDrift 9s ease-out both;}
.acb-scene-launch .acb-art{animation:acbArtPush 8s cubic-bezier(.2,.6,.3,1) both;}
.acb-scene-ascent .acb-art{animation:acbArtShake 7s ease-in-out both;}
.acb-scene-title .acb-art{animation:acbArtDrift 10s ease-out both;}
@keyframes acbArtDrift{from{transform:scale(1.12) translate3d(-1.5%,1.5%,0)}to{transform:scale(1.04) translate3d(1%,-1%,0)}}
@keyframes acbArtPush{from{transform:scale(1.02) translate3d(0,2%,0)}to{transform:scale(1.14) translate3d(0,-2%,0)}}
@keyframes acbArtShake{0%{transform:scale(1.16) translate3d(-1%,1%,0)}25%{transform:scale(1.18) translate3d(1.4%,-1%,0)}
  50%{transform:scale(1.14) translate3d(-1.2%,.8%,0)}75%{transform:scale(1.19) translate3d(1%,-1.2%,0)}
  100%{transform:scale(1.12) translate3d(0,0,0)}}
.acb-scene-brief::after,.acb-scene-launch::after,.acb-scene-ascent::after,.acb-scene-title::after{
  content:"";position:absolute;inset:0;z-index:1;pointer-events:none;}
.acb-scene-brief::after{background:linear-gradient(90deg,rgba(2,8,12,.95) 0%,rgba(2,8,12,.55) 42%,rgba(2,8,12,.18) 70%,rgba(2,8,12,.72) 100%),
  linear-gradient(180deg,rgba(2,8,12,.82),transparent 34%,transparent 66%,rgba(2,8,12,.92));}
.acb-scene-launch::after{background:linear-gradient(180deg,rgba(2,7,11,.78),transparent 38%,transparent 66%,rgba(2,7,11,.92)),
  linear-gradient(90deg,rgba(2,7,11,.72),transparent 46%,rgba(2,7,11,.42));}
.acb-scene-ascent::after{background:linear-gradient(90deg,rgba(2,8,12,.9),rgba(2,8,12,.28) 52%,rgba(2,8,12,.72)),
  linear-gradient(180deg,rgba(2,8,12,.68),transparent 40%,transparent 70%,rgba(2,8,12,.88));}
.acb-scene-title::after{background:linear-gradient(180deg,rgba(2,6,9,.72),transparent 32%,transparent 62%,rgba(2,6,9,.9)),
  radial-gradient(56% 48% at 50% 46%,rgba(2,6,9,0) 0%,rgba(2,6,9,.18) 60%,rgba(2,6,9,.58) 100%);}
.acb-letterbox{position:absolute;left:0;right:0;height:6.5vh;z-index:6;background:#020506;pointer-events:none;}
.acb-letterbox-top{top:0;box-shadow:0 1px 0 rgba(255,171,74,.16);}
.acb-letterbox-bottom{bottom:0;box-shadow:0 -1px 0 rgba(127,233,255,.14);}
.acb-scan{position:absolute;inset:0;z-index:7;pointer-events:none;opacity:.5;
  background:repeating-linear-gradient(0deg,rgba(127,233,255,.035) 0 1px,transparent 1px 4px);
  animation:acbScan 9s linear infinite;}
@keyframes acbScan{from{transform:translateY(0)}to{transform:translateY(8px)}}
.acb-grain{position:absolute;inset:-20%;z-index:8;pointer-events:none;opacity:.05;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='.9'/></svg>");
  animation:acbGrain 1.2s steps(3) infinite;}
@keyframes acbGrain{0%{transform:translate3d(0,0,0)}33%{transform:translate3d(-1.5%,1%,0)}66%{transform:translate3d(1%,-1.5%,0)}100%{transform:translate3d(0,0,0)}}
.acb-vignette{position:absolute;inset:0;z-index:7;pointer-events:none;
  background:radial-gradient(78% 68% at 50% 48%,transparent 40%,rgba(0,0,0,.55) 100%);}
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
.acb-chrome-mid{flex:1;text-align:center;color:rgba(127,233,255,.5);font-size:8px;}
.acb-chrome-right{display:flex;align-items:center;gap:18px;}
.acb-clock{color:rgba(238,248,253,.85);}
.acb-chrome-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(127,233,255,.28),transparent);}
.acb-chrome-build{color:rgba(255,171,74,.66);}
.acb-skip{position:absolute;right:26px;bottom:calc(6.5vh + 44px);z-index:12;pointer-events:auto;
  background:rgba(2,8,12,.45);border:1px solid rgba(127,233,255,.22);color:rgba(196,230,242,.62);
  padding:6px 12px;font-size:9px;letter-spacing:.24em;text-transform:uppercase;border-radius:2px;cursor:pointer;
  backdrop-filter:blur(6px);transition:border-color .2s,color .2s;}
.acb-skip:hover{border-color:rgba(255,171,74,.56);color:#ffe4c2;}
.acb-sweep{position:absolute;top:0;bottom:0;left:0;right:0;z-index:11;pointer-events:none;
  background:linear-gradient(100deg,transparent 38%,rgba(255,186,100,.22) 48%,rgba(255,244,220,.6) 50%,rgba(255,186,100,.22) 52%,transparent 62%);
  mix-blend-mode:screen;animation:acbSweep .9s cubic-bezier(.3,.1,.2,1) both;}
@keyframes acbSweep{from{transform:translateX(-110%);opacity:0}18%{opacity:1}to{transform:translateX(110%);opacity:0}}
.acb-flash{position:absolute;inset:0;z-index:11;pointer-events:none;background:rgba(255,241,224,.32);
  animation:acbFlash .8s ease both;}
@keyframes acbFlash{from{opacity:0}12%{opacity:.85}to{opacity:0}}
.acb-kicker{font-size:10px;letter-spacing:.4em;color:var(--acb-amber);text-transform:uppercase;
  text-shadow:0 0 18px rgba(255,171,74,.36);}
.acb-brief-inner{position:absolute;inset:0;z-index:3;display:flex;align-items:center;gap:6vw;padding:0 7vw 2vh;}
.acb-brief-holo{flex:0 0 auto;width:min(300px,26vw);height:min(300px,26vw);display:grid;place-items:center;
  filter:drop-shadow(0 0 30px rgba(127,233,255,.22));}
.acb-emblem{width:100%;height:100%;}
.acb-emblem-ring{fill:none;stroke:rgba(127,233,255,.5);stroke-width:1.1;
  stroke-dasharray:4 7;animation:acbSpin 26s linear infinite;transform-origin:48px 48px;}
.acb-emblem-ring-2{stroke:rgba(255,171,74,.46);stroke-dasharray:2 6;animation-duration:18s;animation-direction:reverse;}
@keyframes acbSpin{to{transform:rotate(360deg)}}
.acb-emblem-wing{fill:none;stroke:var(--acb-amber);stroke-width:1.6;stroke-linejoin:round;
  filter:drop-shadow(0 0 8px rgba(255,171,74,.5));opacity:.92;}
.acb-emblem-core{fill:rgba(127,233,255,.22);stroke:rgba(211,248,255,.85);stroke-width:1.2;}
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
.acb-launch-copy{position:absolute;left:6vw;bottom:15vh;z-index:3;max-width:min(460px,44vw);}
.acb-stamp{display:inline-block;margin-top:14px;padding:8px 16px;border:1px solid rgba(255,171,74,.7);
  color:#ffd9a8;font-size:clamp(16px,2vw,26px);letter-spacing:.24em;text-transform:uppercase;
  background:rgba(255,120,30,.08);box-shadow:0 0 40px rgba(255,120,30,.16) inset;
  animation:acbStamp .5s cubic-bezier(.2,1.4,.4,1) .35s both;}
@keyframes acbStamp{from{opacity:0;transform:scale(1.3)}to{opacity:1;transform:scale(1)}}
.acb-launch-zh{margin-top:12px;font-size:12px;letter-spacing:.2em;color:rgba(202,232,244,.6);}
.acb-check-list{list-style:none;margin:22px 0 0;padding:0;display:grid;gap:8px;font-size:10px;letter-spacing:.2em;}
.acb-check-list li{display:flex;align-items:center;gap:10px;color:rgba(211,248,255,.7);
  opacity:0;transform:translateX(-12px);animation:acbRow .45s ease forwards;
  animation-delay:calc(.5s + var(--acb-i) * .22s);}
.acb-check-list li em{margin-left:auto;font-style:normal;color:rgba(202,232,244,.4);letter-spacing:.12em;}
.acb-check{color:var(--acb-amber);text-shadow:0 0 10px rgba(255,171,74,.6);}
@keyframes acbRow{to{opacity:1;transform:translateX(0)}}
.acb-launch-bars{display:flex;gap:4px;width:min(340px,34vw);margin-top:22px;}
.acb-launch-bars i{flex:1;height:4px;background:rgba(127,233,255,.16);transform-origin:left;
  animation:acbSeg .7s ease forwards;animation-delay:.9s;}
.acb-launch-bars i:nth-child(2){animation-delay:1s}
.acb-launch-bars i:nth-child(3){animation-delay:1.1s}
.acb-launch-bars i:nth-child(4){animation-delay:1.2s}
.acb-launch-bars i:nth-child(5){animation-delay:1.3s}
.acb-launch-bars i:nth-child(6){animation-delay:1.4s}
@keyframes acbSeg{from{background:rgba(127,233,255,.16);transform:scaleY(.4)}
  to{background:linear-gradient(90deg,rgba(127,233,255,.9),var(--acb-amber));transform:scaleY(1)}}
.acb-launch-cat{margin-top:12px;font-size:9px;letter-spacing:.3em;color:rgba(255,171,74,.72);}
.acb-reticle{position:absolute;left:50%;top:46%;width:min(310px,30vw);height:min(310px,30vw);
  transform:translate(-50%,-50%);z-index:3;pointer-events:none;}
.acb-reticle-ring{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(127,233,255,.34);
  border-left-color:transparent;border-right-color:transparent;animation:acbSpin 9s linear infinite;}
.acb-reticle-ring-2{inset:14%;border:1px dashed rgba(255,171,74,.42);animation-direction:reverse;animation-duration:14s;}
.acb-reticle-bracket{position:absolute;width:34px;height:34px;border:2px solid rgba(255,255,255,.8);
  filter:drop-shadow(0 0 8px rgba(127,233,255,.5));}
.acb-reticle-bracket.tl{left:6%;top:6%;border-right:0;border-bottom:0;}
.acb-reticle-bracket.tr{right:6%;top:6%;border-left:0;border-bottom:0;}
.acb-reticle-bracket.bl{left:6%;bottom:6%;border-right:0;border-top:0;}
.acb-reticle-bracket.br{right:6%;bottom:6%;border-left:0;border-top:0;}
.acb-reticle-tag{position:absolute;left:50%;bottom:-26px;transform:translateX(-50%);font-size:9px;
  letter-spacing:.28em;color:rgba(255,255,255,.72);white-space:nowrap;}
.acb-reticle-tag-right{left:auto;right:-8%;top:50%;bottom:auto;transform:translateY(-50%);color:rgba(255,171,74,.8);}
.acb-launch-scan{position:absolute;left:0;right:0;height:2px;z-index:2;top:30%;opacity:.5;
  background:linear-gradient(90deg,transparent,rgba(127,233,255,.5),transparent);
  animation:acbDrop 4.6s cubic-bezier(.4,0,.2,1) infinite;}
@keyframes acbDrop{0%{transform:translateY(0);opacity:0}12%{opacity:.6}80%{opacity:.35}100%{transform:translateY(46vh);opacity:0}}
.acb-launch-grade{position:absolute;inset:0;z-index:1;background:
  radial-gradient(30% 24% at 50% 74%,rgba(255,122,26,.28),transparent 70%),
  radial-gradient(58% 44% at 52% 42%,rgba(96,196,255,.08),transparent 72%);}
.acb-radar{position:absolute;right:6vw;bottom:16vh;width:min(190px,17vw);height:min(190px,17vw);
  z-index:3;border-radius:50%;border:1px solid rgba(127,233,255,.24);
  background:radial-gradient(circle,rgba(2,10,14,.2) 0 42%,rgba(2,10,14,.55));
  box-shadow:inset 0 0 40px rgba(127,233,255,.08);}
.acb-radar::before,.acb-radar::after{content:"";position:absolute;inset:18%;border-radius:50%;
  border:1px solid rgba(127,233,255,.14);}
.acb-radar::after{inset:38%;}
.acb-radar-sweep{position:absolute;inset:0;border-radius:50%;
  background:conic-gradient(from 0deg,rgba(255,171,74,.42),rgba(255,171,74,.08) 26deg,transparent 56deg);
  animation:acbSpin 4.8s linear infinite;}
.acb-radar-blip{position:absolute;width:6px;height:6px;border-radius:50%;background:var(--acb-amber);
  box-shadow:0 0 10px rgba(255,171,74,.9);animation:acbBlip 2.4s ease-in-out infinite;}
.acb-radar-blip-a{left:30%;top:36%;animation-delay:.3s}
.acb-radar-blip-b{left:62%;top:54%;animation-delay:.9s}
.acb-radar-blip-c{left:46%;top:70%;animation-delay:1.5s}
@keyframes acbBlip{0%,100%{opacity:.2}50%{opacity:1}}
.acb-radar span{position:absolute;left:50%;bottom:-20px;transform:translateX(-50%);font-size:8px;
  letter-spacing:.26em;color:rgba(127,233,255,.5);white-space:nowrap;}
.acb-ascent-copy{position:absolute;left:6vw;top:50%;transform:translateY(-50%);z-index:3;max-width:min(440px,42vw);}
.acb-access-card{margin-top:18px;border:1px solid rgba(127,233,255,.2);background:rgba(2,9,13,.62);
  padding:18px 20px 16px;backdrop-filter:blur(10px);box-shadow:0 20px 60px rgba(0,0,0,.5);}
.acb-access-head{display:flex;align-items:center;gap:10px;font-size:9px;letter-spacing:.32em;
  color:rgba(255,171,74,.82);text-transform:uppercase;}
.acb-access-head i{flex:1;height:1px;background:linear-gradient(90deg,rgba(255,171,74,.5),transparent);}
.acb-access-card ul{list-style:none;margin:14px 0 0;padding:0;display:grid;gap:9px;}
.acb-access-card li{display:flex;align-items:center;gap:10px;font-size:10px;letter-spacing:.2em;
  color:rgba(202,232,244,.72);opacity:0;transform:translateY(6px);
  animation:acbRowY .4s ease forwards;animation-delay:calc(.5s + var(--acb-i) * .24s);}
@keyframes acbRowY{to{opacity:1;transform:translateY(0)}}
.acb-access-stamp{margin-top:16px;padding:6px 12px;display:inline-block;border:1px solid rgba(255,171,74,.6);
  color:#ffd9a8;font-size:12px;letter-spacing:.26em;background:rgba(255,120,30,.08);
  animation:acbStamp .5s cubic-bezier(.2,1.4,.4,1) 1.3s both;}
.acb-ascent-zh{margin-top:16px;font-size:12px;letter-spacing:.2em;color:rgba(202,232,244,.58);}
.acb-telemetry{display:flex;gap:20px;margin-top:18px;font-size:9px;letter-spacing:.22em;color:rgba(127,233,255,.5);}
.acb-ascent-grade{position:absolute;inset:0;z-index:1;
  background:radial-gradient(44% 40% at 60% 42%,rgba(120,200,255,.12),transparent 72%),
  linear-gradient(0deg,rgba(2,8,12,.4),transparent 42%);}
.acb-title-wrap{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:3;
  width:min(1000px,90vw);text-align:center;}
.acb-ghost{position:absolute;left:50%;top:50%;transform:translate(-50%,-56%);font-family:"Segoe UI",system-ui,sans-serif;
  font-weight:800;font-size:clamp(160px,26vw,380px);line-height:1;color:rgba(255,255,255,.045);
  -webkit-text-stroke:1px rgba(127,233,255,.12);pointer-events:none;}
.acb-title-kicker{margin-bottom:18px;}
.acb-title{font-family:"Segoe UI",system-ui,-apple-system,sans-serif;margin:0;line-height:.9;font-weight:700;}
.acb-title-main{display:block;font-size:clamp(44px,6.6vw,96px);letter-spacing:.2em;padding-left:.2em;
  color:#f2fbff;text-shadow:0 20px 60px rgba(0,0,0,.75),0 0 40px rgba(127,233,255,.18);
  clip-path:inset(0 100% 0 0);animation:acbWord 1.1s cubic-bezier(.23,1,.32,1) .1s forwards;}
.acb-title-sub{display:block;margin-top:8px;font-size:clamp(13px,1.5vw,19px);letter-spacing:1em;
  padding-left:.5em;color:var(--acb-amber);text-shadow:0 0 30px rgba(255,171,74,.5);
  animation:acbFadeUp .8s ease .5s both;}
@keyframes acbFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.acb-title-rule{width:min(480px,46vw);height:1px;margin:22px auto 0;transform:scaleX(0);
  background:linear-gradient(90deg,transparent,rgba(255,171,74,.9),rgba(127,233,255,.9),transparent);
  animation:acbRule .9s ease .55s forwards;}
.acb-title-note{margin:14px 0 0;font-size:12px;letter-spacing:.2em;color:rgba(202,232,244,.66);}
.acb-chips{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;margin-top:20px;}
.acb-chips span{font-size:9px;letter-spacing:.24em;color:rgba(211,248,255,.72);padding:6px 12px;
  border:1px solid rgba(127,233,255,.2);background:rgba(127,233,255,.05);
  opacity:0;animation:acbFadeUp .45s ease forwards;animation-delay:calc(.8s + var(--acb-i) * .14s);}
.acb-prompt{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:26px;
  font-size:10px;letter-spacing:.3em;color:rgba(238,248,253,.72);}
.acb-prompt-key{color:var(--acb-amber);font-size:14px;}
.acb-prompt-caret{width:7px;height:14px;background:var(--acb-amber);animation:acbCaret 1.1s steps(2) infinite;}
@keyframes acbCaret{0%,49%{opacity:1}50%,100%{opacity:0}}
.acb-auto{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:14px;
  font-size:8px;letter-spacing:.3em;color:rgba(127,233,255,.5);}
.acb-auto-track{width:180px;height:2px;background:rgba(127,233,255,.14);overflow:hidden;}
.acb-auto-track i{display:block;height:100%;transform-origin:left;transform:scaleX(0);
  background:linear-gradient(90deg,rgba(127,233,255,.8),var(--acb-amber));
  animation:acbBar 5s linear .1s forwards;}
.acb-title-mission{margin-top:18px;font-size:9px;letter-spacing:.36em;color:rgba(255,171,74,.7);}
.acb-title-flare{position:absolute;left:50%;top:34%;width:60vw;height:40vh;transform:translate(-50%,-50%);
  z-index:1;pointer-events:none;mix-blend-mode:screen;
  background:radial-gradient(46% 42% at 50% 50%,rgba(255,196,120,.22),transparent 72%);}
.acb-title-grade{position:absolute;inset:0;z-index:1;
  background:linear-gradient(0deg,rgba(2,7,10,.72),transparent 42%),
  radial-gradient(48% 38% at 56% 30%,rgba(255,150,60,.16),transparent 70%);}
.acb-root.acb-static .acb-art{animation:none;transform:scale(1.04);}
.acb-root.acb-static .acb-sweep,.acb-root.acb-static .acb-grain,.acb-root.acb-static .acb-scan{display:none;}
@media (max-width:760px){
  .acb-chrome{left:18px;right:18px;font-size:7px;}
  .acb-chrome-mid{display:none;}
  .acb-brackets{inset:calc(6.5vh + 12px) 14px;}
  .acb-brief-inner{padding:0 6vw;gap:5vw;}
  .acb-brief-holo{width:30vw;height:30vw;}
  .acb-launch-copy,.acb-ascent-copy{max-width:52vw;}
  .acb-radar{width:26vw;height:26vw;right:5vw;}
  .acb-skip{right:14px;bottom:calc(6.5vh + 36px);}
}
@media (prefers-reduced-motion:reduce){
  .acb-root *,.acb-root *::before,.acb-root *::after{animation-duration:.001s!important;
    animation-delay:0s!important;animation-iteration-count:1!important;transition-duration:.001s!important;}
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
