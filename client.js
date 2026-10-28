/**
 * DeepSeek Harness — boot sequence (browser half).
 *
 * A cinematic, game-style startup run that replaces the raw
 * `Loading plugins…` card with four full-screen moments:
 *
 *   1. logo      — DEEPSEEK / HARNESS wordmark reveal
 *   2. boot      — local boot sequence with progress and a live gauge
 *   3. login     — operator access card with credential restore
 *   4. title     — big title screen over a planet horizon, auto-continue
 *
 * Motion rules follow Emil Kowalski's animation guidance: predetermined
 * motion is expressed in CSS (off the main thread), only transform / opacity /
 * clip-path are animated, custom ease-out curves are used, entrances and exits
 * are asymmetric, and the reduced-motion variant keeps the content while
 * removing travel. The React loop only advances discrete phase classes — it
 * never writes per-frame styles or state.
 *
 * The Host half injects a static pre-boot splash before the frontend creates
 * its own boot card; this module removes that splash on its first layout pass.
 * The run belongs to the application launch: BootHost records a flag in
 * sessionStorage once the sequence starts, so waking from sleep, restoring the
 * tray window or reloading the page never replays it. Only a plugin hot
 * refresh (an explicit authoring action) previews a new build again.
 *
 * Original artwork only: no game screenshots, fonts, audio or trademarks.
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
    // The opening sequence belongs to one application launch, not to every
    // page surface that mounts later. The flag lives in sessionStorage: it
    // survives a reload / wake-driven repaint of the same window session but
    // disappears when the app is actually quit, so a fresh launch plays again.
    // The Host-side splash guard reads the same key before the first paint.
    const BOOT_FLAG_KEY = 'acb-boot-played';
    // A fresh id per plugin-module evaluation. If the same window evaluates a
    // newer client module (plugin-manager/hot refresh), the next BootHost mount
    // sees a different id and replays the sequence without a full app restart.
    const ACB_BUILD_ID =
      'acb-' +
      (typeof performance !== 'undefined' && performance.now
        ? Math.round(performance.now()).toString(36)
        : Date.now().toString(36)) +
      '-' +
      Math.random().toString(36).slice(2, 7);
    let ACB_HOT_RELOAD = false;
    try {
      const previousBuild = window.__ACB_BUILD_ID || '';
      window.__ACB_BUILD_ID = ACB_BUILD_ID;
      ACB_HOT_RELOAD = !!previousBuild && previousBuild !== ACB_BUILD_ID;
    } catch (error) {
      ACB_HOT_RELOAD = false;
    }

    // Phase boundaries in normal-motion milliseconds.
    const PHASES = [
      { id: 'logo', at: 0 },
      { id: 'boot', at: 2400 },
      { id: 'login', at: 5700 },
      { id: 'title', at: 9000 },
    ];
    const PHASE_TIMES = PHASES.map((phase) => phase.at);

    // Reduced motion still walks the same four screens, just faster and
    // without travelling elements.
    const REDUCED_PHASES = [0, 950, 1900, 3000];

    const ZH = {
      'aria.label': 'DeepSeek Harness 开机动画',
      'aria.skip': '跳过开机动画',
      'skip.label': '跳过',
      'chrome.boot': '开机序列',
      'logo.kicker': 'DEEPSEEK SYSTEMS',
      'logo.tagline': 'INITIALIZING DESKTOP ENVIRONMENT',
      'logo.zh': '本地环境初始化 · 安全启动',
      'boot.eyebrow': 'SYSTEM BOOT // 06',
      'boot.title': 'SYSTEM BOOT',
      'boot.subtitle': '正在启动工作环境',
      'boot.meter': 'BOOT SEQUENCE',
      'boot.done': '06 / 06',
      'boot.ready': 'READY',
      'boot.row1.en': 'PROFILE',
      'boot.row1.zh': '读取用户配置',
      'boot.row2.en': 'SERVICES',
      'boot.row2.zh': '启动本地服务',
      'boot.row3.en': 'WORKSPACE',
      'boot.row3.zh': '索引工作区',
      'boot.row4.en': 'SESSION',
      'boot.row4.zh': '恢复会话链路',
      'boot.state': 'OK',
      'login.kicker': 'OPERATOR ACCESS',
      'login.badge': 'LOCAL // DESKTOP-06',
      'login.eyebrow': 'IDENTITY // CACHED',
      'login.title': '欢迎回来',
      'login.subtitle': '本机会话已恢复，正在进入工作区。',
      'login.row1.en': 'IDENTITY VERIFIED',
      'login.row1.zh': '身份校验通过',
      'login.row2.en': 'CREDENTIALS RESTORED',
      'login.row2.zh': '本机凭据已恢复',
      'login.row3.en': 'LOCAL PROFILE',
      'login.row3.zh': '本机配置',
      'login.pending': 'AUTHENTICATING',
      'login.granted': 'ACCESS GRANTED',
      'title.kicker': 'DEEPSEEK HARNESS // DESKTOP 06',
      'title.subtitle': '系统就绪 · 即将进入工作区',
      'title.chip1': '会话已恢复',
      'title.chip2': '工作区就绪',
      'title.chip3': '界面待命',
      'title.prompt': '按 Enter 继续',
      'title.auto': 'AUTO CONTINUE',
      'chrome.build': 'BUILD 06.0 // LOCAL',
    };

    const EN = {
      'aria.label': 'DeepSeek Harness boot animation',
      'aria.skip': 'Skip the boot animation',
      'skip.label': 'SKIP',
      'chrome.boot': 'BOOT SEQUENCE',
      'logo.kicker': 'DEEPSEEK SYSTEMS',
      'logo.tagline': 'INITIALIZING DESKTOP ENVIRONMENT',
      'logo.zh': '',
      'boot.eyebrow': 'SYSTEM BOOT // 06',
      'boot.title': 'SYSTEM BOOT',
      'boot.subtitle': 'BRINGING THE LOCAL ENVIRONMENT ONLINE',
      'boot.meter': 'BOOT SEQUENCE',
      'boot.done': '06 / 06',
      'boot.ready': 'READY',
      'boot.row1.en': 'PROFILE',
      'boot.row1.zh': '',
      'boot.row2.en': 'SERVICES',
      'boot.row2.zh': '',
      'boot.row3.en': 'WORKSPACE',
      'boot.row3.zh': '',
      'boot.row4.en': 'SESSION',
      'boot.row4.zh': '',
      'boot.state': 'OK',
      'login.kicker': 'OPERATOR ACCESS',
      'login.badge': 'LOCAL // DESKTOP-06',
      'login.eyebrow': 'IDENTITY // CACHED',
      'login.title': 'WELCOME BACK',
      'login.subtitle': 'Your local session is restored. Entering the workspace.',
      'login.row1.en': 'IDENTITY VERIFIED',
      'login.row1.zh': '',
      'login.row2.en': 'CREDENTIALS RESTORED',
      'login.row2.zh': '',
      'login.row3.en': 'LOCAL PROFILE',
      'login.row3.zh': '',
      'login.pending': 'AUTHENTICATING',
      'login.granted': 'ACCESS GRANTED',
      'title.kicker': 'DEEPSEEK HARNESS // DESKTOP 06',
      'title.subtitle': 'ALL SYSTEMS READY',
      'title.chip1': 'SESSION RESTORED',
      'title.chip2': 'WORKSPACE READY',
      'title.chip3': 'UI STANDBY',
      'title.prompt': 'PRESS ENTER TO CONTINUE',
      'title.auto': 'AUTO CONTINUE',
      'chrome.build': 'BUILD 06.0 // LOCAL',
    };

    const BOOT_ROWS = [1, 2, 3, 4].map((index) => ({
      code: '0' + index,
      en: 'boot.row' + index + '.en',
      zh: 'boot.row' + index + '.zh',
    }));

    const LOGIN_ROWS = [1, 2, 3].map((index) => ({
      en: 'login.row' + index + '.en',
      zh: 'login.row' + index + '.zh',
    }));

    // Deterministic star field, generated once per module load.
    const STARS = (() => {
      const out = [];
      let seed = 0x9e3779b9;
      const next = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      for (let index = 0; index < 68; index += 1) {
        out.push({
          x: next() * 100,
          y: next() * 100,
          size: next() < 0.82 ? 1 : 2,
          opacity: 0.18 + next() * 0.62,
          duration: 3.2 + next() * 5.4,
          delay: -next() * 8,
        });
      }
      return out;
    })();

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function pad2(value) {
      return String(value).padStart(2, '0');
    }

    function pad3(value) {
      return String(value).padStart(3, '0');
    }

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
        // Storage can be unavailable (locked-down browser modes). The run then
        // plays once per page load instead of sticking forever.
        return false;
      }
    }

    function markBootPlayed() {
      try {
        window.sessionStorage.setItem(BOOT_FLAG_KEY, '1');
      } catch (error) {
        /* the once-per-launch guard degrades to once-per-page-load */
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

    function clockLabel() {
      try {
        const now = new Date();
        return pad2(now.getHours()) + ':' + pad2(now.getMinutes());
      } catch (error) {
        return '--:--';
      }
    }

    function StarField() {
      return h(
        'div',
        { className: 'acb-stars', 'aria-hidden': true },
        STARS.map(function (star, index) {
          return h('span', {
            key: index,
            style: {
              left: star.x.toFixed(2) + '%',
              top: star.y.toFixed(2) + '%',
              width: star.size + 'px',
              height: star.size + 'px',
              opacity: star.opacity.toFixed(2),
              animationDuration: star.duration.toFixed(2) + 's',
              animationDelay: star.delay.toFixed(2) + 's',
            },
          });
        }),
      );
    }

    function Backdrop() {
      const holo = [];
      for (let index = 0; index < 14; index += 1) {
        holo.push(
          h('i', {
            key: 'v' + index,
            style: { transform: 'rotateY(' + index * (180 / 14) + 'deg)' },
          }),
        );
      }
      for (let index = -2; index <= 2; index += 1) {
        holo.push(
          h('i', {
            key: 'h' + index,
            className: 'acb-holo-lat',
            style: {
              transform:
                'rotateX(90deg) translateZ(' +
                index * 13 +
                '%) scale(' +
                Math.cos(index * 0.42).toFixed(3) +
                ')',
            },
          }),
        );
      }
      return h(React.Fragment, null, [
        h(StarField, { key: 'stars' }),
        h('div', { key: 'aurora', className: 'acb-aurora', 'aria-hidden': true }),
        h('div', { key: 'ember', className: 'acb-ember', 'aria-hidden': true }),
        h('div', { key: 'haze', className: 'acb-haze', 'aria-hidden': true }),
        h(SpatialField, { key: 'space' }),
        h(
          'div',
          { key: 'holo', className: 'acb-holo-globe', 'aria-hidden': true },
          holo.concat([h('span', { key: 'orbit', className: 'acb-holo-orbit' })]),
        ),
        h(
          'div',
          { key: 'planet', className: 'acb-planet', 'aria-hidden': true },
          h('i', { key: 'sphere', className: 'acb-planet-sphere' }),
          h('i', { key: 'rim', className: 'acb-planet-rim' }),
          h('i', { key: 'beams', className: 'acb-beams' }),
        ),
        h('div', { key: 'orbit', className: 'acb-orbit', 'aria-hidden': true }, h('i', null)),
        h('div', { key: 'flare', className: 'acb-flare', 'aria-hidden': true }),
        h('div', { key: 'lens', className: 'acb-lens', 'aria-hidden': true }),
        h('div', { key: 'beam', className: 'acb-beam', 'aria-hidden': true }),
        h('div', { key: 'grid', className: 'acb-gridfloor', 'aria-hidden': true }),
        h('div', { key: 'grain', className: 'acb-grain', 'aria-hidden': true }),
        h('div', { key: 'cine', className: 'acb-cine', 'aria-hidden': true }),
        h('div', { key: 'scan', className: 'acb-scanlines', 'aria-hidden': true }),
        h('div', { key: 'vig', className: 'acb-vignette', 'aria-hidden': true }),
      ]);
    }

    function acbEase(t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function acbHeight(x, z) {
      return (
        (Math.sin(x * 0.0031 + 0.9) * 0.46 +
          Math.cos(z * 0.0027 - 0.6) * 0.34 +
          Math.sin((x + z) * 0.0016) * 0.28 +
          Math.sin(x * 0.0091 - z * 0.0047) * 0.1) *
        160
      );
    }

    function acbBuildField() {
      let seed = 0x51f15e1d;
      const rnd = function () {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      const far = [];
      const mid = [];
      for (let index = 0; index < 1350; index += 1) {
        const z = 1200 + rnd() * 1200;
        const x = (rnd() * 2 - 1) * 1900;
        far.push({
          x: x,
          y: acbHeight(x, z) + rnd() * 18,
          z: z,
          size: rnd() < 0.86 ? 1 : 2,
        });
      }
      for (let index = 0; index < 920; index += 1) {
        const z = 320 + rnd() * 760;
        const x = (rnd() * 2 - 1) * 1350;
        mid.push({
          x: x,
          y: acbHeight(x, z) + rnd() * 10,
          z: z,
          size: rnd() < 0.76 ? 1 : 2,
        });
      }
      const nodes = [];
      for (let index = 0; index < 9; index += 1) {
        const z = 520 + rnd() * 880;
        const x = (rnd() * 2 - 1) * 1020;
        nodes.push({ x: x, y: acbHeight(x, z) + 26, z: z, size: 2.4 });
      }
      const hub = { x: 0, y: acbHeight(0, 900) + 54, z: 900 };
      return { far: far, mid: mid, nodes: nodes, hub: hub };
    }

    function acbProject(point, cam, w, h) {
      const dz = point.z - cam.z;
      if (dz < 100) return null;
      const scale = (Math.min(w, h) * 1.02) / dz;
      return {
        x: w * 0.5 + (point.x - cam.x) * scale,
        y: h * 0.54 + (point.y - cam.y - dz * 0.19) * scale,
        scale: scale,
        dz: dz,
      };
    }

    function SpatialField() {
      const farRef = useRef(null);
      const midRef = useRef(null);
      useEffect(function () {
        const far = farRef.current;
        const mid = midRef.current;
        if (!far || !mid) return undefined;
        const field = acbBuildField();
        let reduced = false;
        try {
          reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        } catch (error) {
          reduced = false;
        }
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        let width = 1;
        let height = 1;
        let raf = 0;
        let alive = true;
        const started = performance.now();

        const resize = function () {
          width = Math.max(1, window.innerWidth);
          height = Math.max(1, window.innerHeight);
          const w = Math.round(width * dpr);
          const hh = Math.round(height * dpr);
          if (far.width !== w || far.height !== hh) {
            far.width = w;
            far.height = hh;
          }
          if (mid.width !== w || mid.height !== hh) {
            mid.width = w;
            mid.height = hh;
          }
        };

        const drawGrid = function (ctx, project, layer) {
          const near = layer === 'mid';
          const zStart = near ? 260 : 900;
          const zEnd = near ? 1250 : 2350;
          ctx.lineWidth = 1;
          ctx.strokeStyle = near ? 'rgba(90,170,200,0.075)' : 'rgba(76,136,166,0.05)';
          for (let x = -1800; x <= 1800; x += 240) {
            const a = project({ x: x, y: -70, z: zStart });
            const b = project({ x: x, y: -70, z: zEnd });
            if (a && b) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
          for (let z = zStart; z <= zEnd; z += near ? 120 : 180) {
            const a = project({ x: -1900, y: -70, z: z });
            const b = project({ x: 1900, y: -70, z: z });
            if (a && b) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        };

        const drawPoints = function (ctx, points, project, hub, lightOn, time, near, scanZ) {
          const pulse = 0.84 + 0.16 * Math.sin(time * 0.0011);
          for (let index = 0; index < points.length; index += 1) {
            const point = points[index];
            const q = project(point);
            if (!q) continue;
            if (q.x < -30 || q.x > width + 30 || q.y < -30 || q.y > height + 30) continue;
            const fog = Math.max(0.05, Math.min(1, 1 - q.dz / 3200));
            const dx = point.x - hub.x;
            const dy = point.y - hub.y;
            const dz = point.z - hub.z;
            const glow = 1 / (1 + (dx * dx + dy * dy + dz * dz) / 180000);
            const scan = scanZ > 0 && Math.abs(point.z - scanZ) < 90 ? 0.5 : 0;
            const alpha = (near ? 0.52 : 0.34) * fog * (0.42 + glow * 1.8 * lightOn * pulse + scan);
            if (alpha < 0.012) continue;
            const r = Math.round(92 + glow * 120 * lightOn + scan * 40);
            const g = Math.round(164 + glow * 78 * lightOn + scan * 28);
            const b = Math.round(198 + glow * 52 * lightOn);
            ctx.fillStyle =
              'rgba(' + r + ',' + g + ',' + b + ',' + Math.min(0.9, alpha).toFixed(3) + ')';
            const size = near
              ? (point.size > 1 ? 1.9 : 1.25) * Math.max(0.7, Math.min(2.2, q.scale * 0.55))
              : 1;
            ctx.fillRect(q.x, q.y, size, size);
          }
        };

        const drawNodes = function (ctx, project, hubPoint, lightOn, time) {
          if (!hubPoint) return;
          const breathe = 0.78 + 0.22 * Math.sin(time * 0.0009 - 1.2);
          for (let index = 0; index < field.nodes.length; index += 1) {
            const node = field.nodes[index];
            const q = project(node);
            if (!q) continue;
            ctx.strokeStyle = 'rgba(104,212,240,' + (0.055 + 0.06 * lightOn).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(hubPoint.x, hubPoint.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
            const halo = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, 22);
            halo.addColorStop(0, 'rgba(180,246,255,' + (0.28 * lightOn * breathe).toFixed(3) + ')');
            halo.addColorStop(0.35, 'rgba(80,196,230,' + (0.1 * lightOn).toFixed(3) + ')');
            halo.addColorStop(1, 'rgba(40,100,140,0)');
            ctx.fillStyle = halo;
            ctx.beginPath();
            ctx.arc(q.x, q.y, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(214,251,255,' + (0.55 + 0.35 * lightOn).toFixed(3) + ')';
            ctx.beginPath();
            ctx.arc(q.x, q.y, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
          const coreRadius = 78;
          const core = ctx.createRadialGradient(hubPoint.x, hubPoint.y, 0, hubPoint.x, hubPoint.y, coreRadius);
          core.addColorStop(0, 'rgba(226,254,255,' + (0.38 * lightOn).toFixed(3) + ')');
          core.addColorStop(0.12, 'rgba(156,244,255,' + (0.22 * lightOn).toFixed(3) + ')');
          core.addColorStop(0.45, 'rgba(72,186,220,' + (0.075 * lightOn).toFixed(3) + ')');
          core.addColorStop(1, 'rgba(30,88,120,0)');
          ctx.fillStyle = core;
          ctx.beginPath();
          ctx.arc(hubPoint.x, hubPoint.y, coreRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(240,255,255,' + (0.78 * lightOn).toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(hubPoint.x, hubPoint.y, 2.8, 0, Math.PI * 2);
          ctx.fill();
        };

        const drawScan = function (ctx, project, scanZ, scanPos, hubPoint, lightOn) {
          if (scanZ > 0) {
            const line = project({ x: 0, y: -40, z: scanZ });
            if (line) {
              ctx.save();
              ctx.setLineDash([2, 7]);
              ctx.strokeStyle = 'rgba(140,235,255,0.2)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(0, line.y);
              ctx.lineTo(width, line.y);
              ctx.stroke();
              ctx.restore();
            }
          }
          if (scanPos >= 0 && hubPoint) {
            const radius = scanPos * Math.max(width, height) * 0.62;
            ctx.strokeStyle = 'rgba(140,235,255,' + ((1 - scanPos) * 0.13 * lightOn).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(hubPoint.x, hubPoint.y, radius, 0, Math.PI * 2);
            ctx.stroke();
          }
        };

        const draw = function (now) {
          if (!alive) return;
          const time = reduced ? 2600 : Math.max(0, now - started);
          const t = reduced ? 0.34 : Math.min(1, time / DURATION_MS);
          const eased = acbEase(t);
          const cam = {
            x: Math.sin(t * 0.9) * 34 + (eased - 0.5) * 18,
            y: -46 - eased * 18,
            z: 130 + eased * 58,
          };
          const lightOn = reduced ? 1 : Math.min(1, Math.max(0, (time - 500) / 1200));
          const scanPos = reduced ? -1 : time > 1200 ? (((time - 1200) % 5600) / 5600) : -1;
          const scanZ = scanPos >= 0 ? 380 + scanPos * 1900 : -1;
          const project = function (point) {
            return acbProject(point, cam, width, height);
          };
          const hubPoint = project(field.hub);

          const farCtx = far.getContext('2d');
          if (farCtx) {
            farCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            farCtx.clearRect(0, 0, width, height);
            drawGrid(farCtx, project, 'far');
            drawPoints(farCtx, field.far, project, field.hub, lightOn, time, false, scanZ);
          }
          const midCtx = mid.getContext('2d');
          if (midCtx) {
            midCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            midCtx.clearRect(0, 0, width, height);
            drawGrid(midCtx, project, 'mid');
            drawPoints(midCtx, field.mid, project, field.hub, lightOn, time, true, scanZ);
            drawNodes(midCtx, project, hubPoint, lightOn, time);
            drawScan(midCtx, project, scanZ, scanPos, hubPoint, lightOn);
          }
        };

        const loop = function (now) {
          if (!alive) return;
          if (!document.hidden) draw(now);
          raf = requestAnimationFrame(loop);
        };

        resize();
        window.addEventListener('resize', resize);
        if (reduced) {
          draw(performance.now());
        } else {
          raf = requestAnimationFrame(loop);
        }
        return function () {
          alive = false;
          cancelAnimationFrame(raf);
          window.removeEventListener('resize', resize);
        };
      }, []);

      return h('div', { className: 'acb-space', 'aria-hidden': true }, [
        h('canvas', { key: 'far', ref: farRef, className: 'acb-space-canvas acb-space-far' }),
        h('canvas', { key: 'mid', ref: midRef, className: 'acb-space-canvas acb-space-mid' }),
        h(
          'div',
          { key: 'light', className: 'acb-light-rig', 'aria-hidden': true },
          h('i', { key: 'haze', className: 'acb-light-haze' }),
          h('i', { key: 'wide', className: 'acb-light-wide' }),
          h('i', { key: 'shaft-a', className: 'acb-light-shaft acb-light-shaft-a' }),
          h('i', { key: 'shaft-b', className: 'acb-light-shaft acb-light-shaft-b' }),
          h('i', { key: 'near', className: 'acb-light-near' }),
          h('i', { key: 'core', className: 'acb-light-core' }),
        ),
      ]);
    }

    const FALLBACK_WORKSPACES = [
      { title: 'DEEPSEEK', sessions: 4 },
      { title: 'PHClub-web', sessions: 3 },
      { title: 'NeteaseWorld', sessions: 2 },
      { title: 'LOCAL PROFILE', sessions: 2 },
      { title: 'PLUGINS', sessions: 1 },
      { title: 'SESSIONS', sessions: 1 },
    ];

    function readAcbWorkspaces() {
      try {
        const raw = window.__ACB_WORKSPACES;
        const list = Array.isArray(raw) ? raw : raw && Array.isArray(raw.list) ? raw.list : [];
        const rows = list
          .filter(function (item) {
            return item && typeof item.title === 'string';
          })
          .map(function (item) {
            return {
              title: String(item.title).trim(),
              path: typeof item.path === 'string' ? item.path : '',
              sessions: Number.isFinite(Number(item.sessions)) ? Math.max(0, Number(item.sessions)) : 0,
            };
          })
          .filter(function (item) {
            return item.title;
          })
          .sort(function (a, b) {
            return b.sessions - a.sessions || a.title.localeCompare(b.title);
          });
        return rows.length ? rows : FALLBACK_WORKSPACES.slice();
      } catch (error) {
        return FALLBACK_WORKSPACES.slice();
      }
    }

    const TAC_STAGES = [
      { at: 3200, en: 'PROFILE READ', code: 'TGT-01', key: 'stage.profile', x: 190, y: 560 },
      { at: 4300, en: 'SERVICE START', code: 'TGT-02', key: 'stage.service', x: 360, y: 470 },
      { at: 6200, en: 'WORKSPACE INDEX', code: 'TGT-03', key: 'stage.workspace', x: 520, y: 555 },
      { at: 7700, en: 'ACCOUNT AUTH', code: 'TGT-04', key: 'stage.auth', x: 690, y: 440 },
      { at: 9200, en: 'SESSION LINK', code: 'TGT-05', key: 'stage.session', x: 860, y: 520 },
      { at: 10700, en: 'DISPLAY SYNC', code: 'TGT-06', key: 'stage.display', x: 1020, y: 380 },
    ];

    const TAC_WAYPOINTS = TAC_STAGES.map((stage) => ({ x: stage.x, y: stage.y, code: stage.code }));
    const TAC_ROUTE_D = TAC_WAYPOINTS.map((p) => p.x + ' ' + p.y).join(' L');

    const SUBTITLES = [
      {
        at: 4300,
        cps: 46,
        text: 'AT 0000 HOURS, THE COMBAT INFORMATION NETWORK RE-ESTABLISHES CONTROL OF THE LOCAL THEATER.',
      },
      {
        at: 6600,
        cps: 44,
        text: 'PRIMARY OBJECTIVE: RESTORE THE WORKSPACE INDEX, VERIFY THE CREDENTIAL CHAIN, AND LINK ALL ACTIVE SESSIONS.',
      },
    ];

    const LOG_LINES = [
      { at: 1200, text: 'CORE/BOOT ......... OK' },
      { at: 3200, text: 'PROFILE/READ ...... OK' },
      { at: 4300, text: 'SERVICE/START ..... UP' },
      { at: 6200, text: 'WORKSPACE/INDEX ... 4' },
      { at: 7700, text: 'AUTH/CREDENTIAL ... CACHED' },
      { at: 9200, text: 'SESSION/LINK ...... ESTABLISHED' },
      { at: 10700, text: 'DISPLAY/SYNC ...... READY' },
    ];

    const ICONS = [
      'M6 3h9l4 4v14H6z M15 3v4h4 M9 12h7 M9 16h7',
      'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M18.4 5.6l-2.1 2.1 M7.7 16.3l-2.1 2.1',
      'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z',
      'M14 9a4 4 0 1 1-4 4 M14 9l6 6 M17 12l3 3 M14 9l2-2',
      'M9 15l6-6 M8 17l-2 2a3 3 0 0 1-4-4l2-2 M16 7l2-2a3 3 0 0 1 4 4l-2 2',
      'M3 5h18v12H3z M8 21h8 M12 17v4',
    ];


    function TacticalPanel(props) {
      const visible = true;
      return h(
        'section',
        {
          className: 'acbT-panel ' + (props.className || '') + (visible ? ' is-in' : ''),
          style: props.style,
        },
        h(
          'div',
          { className: 'acbT-panel-h' },
          h('span', null, props.title),
          props.right === undefined || props.right === null ? null : h('span', null, props.right),
        ),
        props.children,
      );
    }

    function TerrainSvg() {
      return h(
        'svg',
        {
          className: 'acbT-terrain',
          viewBox: '0 0 1200 760',
          preserveAspectRatio: 'xMidYMid slice',
          'aria-hidden': true,
        },
        h(
          'defs',
          { key: 'defs' },
          h(
            'filter',
            { id: 'acbRelief', x: '-10%', y: '-10%', width: '120%', height: '120%' },
            h('feTurbulence', {
              type: 'fractalNoise',
              baseFrequency: '0.0085 0.014',
              numOctaves: 6,
              seed: 17,
              stitchTiles: 'stitch',
              result: 'noise',
            }),
            h(
              'feDiffuseLighting',
              {
                in: 'noise',
                surfaceScale: 13,
                diffuseConstant: 1.35,
                lightingColor: '#d8fbff',
                result: 'light',
              },
              h('feDistantLight', { azimuth: 235, elevation: 46 }),
            ),
            h('feColorMatrix', {
              in: 'light',
              type: 'matrix',
              values:
                '0.3 0 0 0 0.01  0 0.62 0 0 0.05  0 0 0.78 0 0.09  0 0 0 1 0',
              result: 'tint',
            }),
            h('feComposite', { in: 'tint', in2: 'SourceGraphic', operator: 'in' }),
          ),
          h(
            'linearGradient',
            { id: 'acbSea', x1: 0, y1: 0, x2: 0, y2: 1 },
            h('stop', { offset: '0%', stopColor: '#041018', stopOpacity: 0.05 }),
            h('stop', { offset: '58%', stopColor: '#031018', stopOpacity: 0.5 }),
            h('stop', { offset: '100%', stopColor: '#010508', stopOpacity: 0.98 }),
          ),
          h(
            'radialGradient',
            { id: 'acbMapVignette' },
            h('stop', { offset: '42%', stopColor: '#000000', stopOpacity: 0 }),
            h('stop', { offset: '100%', stopColor: '#000000', stopOpacity: 0.62 }),
          ),
          h(
            'pattern',
            { id: 'acbMapGrid', width: 42, height: 42, patternUnits: 'userSpaceOnUse' },
            h('path', {
              d: 'M42 0H0V42',
              fill: 'none',
              stroke: 'rgba(127,231,255,0.065)',
              strokeWidth: 1,
            }),
          ),
        ),
        h('rect', { width: 1200, height: 760, fill: '#02090e' }),
        h('rect', { width: 1200, height: 760, filter: 'url(#acbRelief)', opacity: 0.9 }),
        h(
          'g',
          { fill: 'none', stroke: 'rgba(160,235,255,0.15)', strokeWidth: 1 },
          h('path', { d: 'M-40 212 C 170 160, 280 262, 440 224 C 600 186, 680 268, 840 224 C 980 186, 1090 238, 1240 200' }),
          h('path', { d: 'M-40 284 C 170 232, 280 334, 440 296 C 600 258, 680 340, 840 296 C 980 258, 1090 310, 1240 272' }),
          h('path', { d: 'M-40 356 C 170 304, 280 406, 440 368 C 600 330, 680 412, 840 368 C 980 330, 1090 382, 1240 344' }),
          h('path', { d: 'M-40 428 C 170 376, 280 478, 440 440 C 600 402, 680 484, 840 440 C 980 402, 1090 454, 1240 416' }),
          h('path', { d: 'M-40 500 C 170 448, 280 550, 440 512 C 600 474, 680 556, 840 512 C 980 474, 1090 526, 1240 488' }),
          h('path', { d: 'M120 -40 C 180 150, 120 300, 230 470 C 300 580, 280 680, 340 800' }),
          h('path', { d: 'M310 -40 C 370 150, 310 300, 420 470 C 490 580, 470 680, 530 800' }),
          h('path', { d: 'M760 -40 C 820 150, 760 300, 870 470 C 940 580, 920 680, 980 800' }),
          h('path', { d: 'M950 -40 C 1010 150, 950 300, 1060 470 C 1130 580, 1110 680, 1170 800' }),
        ),
        h('rect', { width: 1200, height: 760, fill: 'url(#acbSea)' }),
        h('rect', { width: 1200, height: 760, fill: 'url(#acbMapGrid)' }),
        h('path', {
          d: 'M-20 604 C 160 548, 244 632, 388 592 C 532 552, 616 630, 764 588 C 912 546, 1016 604, 1220 532',
          fill: 'none',
          stroke: 'rgba(210,250,255,0.5)',
          strokeWidth: 1.4,
        }),
        h('path', {
          d: 'M-20 632 C 160 576, 252 660, 396 620 C 540 580, 624 658, 772 616 C 920 574, 1024 632, 1220 560',
          fill: 'none',
          stroke: 'rgba(127,231,255,0.22)',
          strokeWidth: 1,
        }),
        h('path', {
          d: 'M 828 500 C 866 480, 906 492, 934 514 C 962 536, 984 520, 1008 506 L 1010 580 C 972 596, 936 584, 908 566 C 880 548, 850 556, 826 570 Z',
          fill: 'none',
          stroke: 'rgba(127,231,255,0.18)',
          strokeWidth: 1,
        }),
        h('path', {
          d: 'M 442 190 C 468 178, 494 184, 506 202 C 518 220, 506 240, 484 244 C 462 248, 442 238, 436 220 C 432 208, 434 198, 442 190 Z',
          fill: 'none',
          stroke: 'rgba(127,231,255,0.14)',
          strokeWidth: 1,
        }),
        h('rect', { width: 1200, height: 760, fill: 'url(#acbMapVignette)' }),
      );
    }

    function TacticalMapOverlay({ now, reduced }) {
      const statuses = TAC_STAGES.map((stage) => stageStatus(now, stage, reduced));
      const route = reduced
        ? 1
        : clamp((now - TAC_STAGES[0].at) / (TAC_STAGES[TAC_STAGES.length - 1].at - TAC_STAGES[0].at), 0, 1);
      const locked = reduced || now >= 7600;
      const reached = statuses.map((status) => status === 'ok');
      const current = reached.lastIndexOf(true);

      return h(
        'svg',
        {
          className: 'acbT-map-overlay',
          viewBox: '0 0 1200 760',
          preserveAspectRatio: 'xMidYMid slice',
          'aria-hidden': true,
        },
        h(
          'g',
          { fill: 'none', stroke: 'rgba(255,90,77,0.32)', strokeWidth: 1 },
          h('circle', { cx: 438, cy: 330, r: 78, strokeDasharray: '5 9', className: 'acbT-threat' }),
          h('circle', { cx: 438, cy: 330, r: 46, strokeDasharray: '3 7', className: 'acbT-threat acbT-threat-b' }),
          h('circle', { cx: 918, cy: 622, r: 56, strokeDasharray: '5 9', className: 'acbT-threat acbT-threat-c' }),
          h('circle', { cx: 712, cy: 238, r: 38, strokeDasharray: '3 7', className: 'acbT-threat acbT-threat-b' }),
        ),
        h('path', {
          d: 'M' + TAC_ROUTE_D,
          fill: 'none',
          stroke: 'rgba(127,231,255,0.14)',
          strokeWidth: 7,
          strokeLinejoin: 'round',
        }),
        h('path', {
          className: 'acbT-route',
          d: 'M' + TAC_ROUTE_D,
          fill: 'none',
          stroke: '#7fe7ff',
          strokeWidth: 1.8,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          pathLength: 1,
          strokeDasharray: '1 1',
          strokeDashoffset: 1 - route,
        }),
        h(
          'g',
          { className: 'acbT-lock' + (locked ? ' acbT-locked' : '') },
          h('path', { d: 'M 648 418 V 400 H 666', fill: 'none', stroke: '#ffb648', strokeWidth: 1.6 }),
          h('path', { d: 'M 736 400 H 752 V 418', fill: 'none', stroke: '#ffb648', strokeWidth: 1.6 }),
          h('path', { d: 'M 648 462 V 480 H 666', fill: 'none', stroke: '#ffb648', strokeWidth: 1.6 }),
          h('path', { d: 'M 736 480 H 752 V 462', fill: 'none', stroke: '#ffb648', strokeWidth: 1.6 }),
          h(
            'text',
            { x: 648, y: 392, fill: '#ffb648', fontSize: 10, letterSpacing: 1.6 },
            'PRIMARY // DSH CORE',
          ),
        ),
        h(
          'g',
          null,
          TAC_WAYPOINTS.map((wp, index) => {
            const on = reached[index];
            const isCurrent = index === current;
            return h(
              'g',
              {
                key: wp.code,
                className: 'acbT-wp' + (on ? ' acbT-on' : '') + (isCurrent ? ' acbT-current' : ''),
              },
              h('circle', {
                cx: wp.x,
                cy: wp.y,
                r: 10,
                fill: 'none',
                stroke: on ? '#7fe7ff' : 'rgba(127,231,255,0.3)',
                strokeWidth: 1,
              }),
              h('circle', {
                cx: wp.x,
                cy: wp.y,
                r: 2.8,
                fill: on ? '#7fe7ff' : 'rgba(127,231,255,0.4)',
              }),
              h(
                'text',
                {
                  x: wp.x + 14,
                  y: wp.y - 8,
                  fill: on ? '#dff6ff' : 'rgba(127,231,255,0.42)',
                  fontSize: 9,
                  letterSpacing: 1.2,
                },
                wp.code,
              ),
            );
          }),
        ),
        h(
          'text',
          { x: 1040, y: 352, fill: 'rgba(255,182,72,0.9)', fontSize: 9, letterSpacing: 1.6 },
          'SORTIE',
        ),
        h(
          'text',
          { x: 44, y: 44, fill: 'rgba(127,231,255,0.52)', fontSize: 10, letterSpacing: 2 },
          'TACTICAL MAP // SECTOR 08',
        ),
        h(
          'text',
          { x: 1156, y: 44, textAnchor: 'end', fill: 'rgba(127,231,255,0.38)', fontSize: 9, letterSpacing: 1.4 },
          '142°30′E',
        ),
        h(
          'text',
          { x: 44, y: 720, fill: 'rgba(127,231,255,0.32)', fontSize: 8, letterSpacing: 1.2 },
          'GRID 07-13 // SCALE 1:250 000',
        ),
        h(
          'text',
          { x: 1156, y: 720, textAnchor: 'end', fill: 'rgba(127,231,255,0.32)', fontSize: 8, letterSpacing: 1.2 },
          'WIND 270/12 // VIS 40',
        ),
      );
    }

    const WORKSPACE_MAP_ANCHORS = [
      [600, 430],
      [330, 340],
      [820, 330],
      [980, 440],
      [800, 540],
      [420, 530],
      [570, 250],
      [930, 560],
    ];

    function acbBuildContinentPath() {
      const points = [];
      const count = 104;
      for (let index = 0; index < count; index += 1) {
        const angle = (index / count) * Math.PI * 2;
        const base =
          1 +
          0.14 * Math.sin(angle * 3 + 1.2) +
          0.075 * Math.sin(angle * 7 - 0.6) +
          0.035 * Math.sin(angle * 13 + 2.1) +
          0.018 * Math.sin(angle * 23 + 0.4) +
          0.009 * Math.sin(angle * 37 + 1.7);
        const peninsula = Math.pow(Math.max(0, Math.cos(angle - 2.15)), 6) * 0.24;
        const bay = -Math.pow(Math.max(0, Math.cos(angle - 4.35)), 10) * 0.13;
        const rx = 468 * (base + peninsula + bay);
        const ry = 256 * (base + peninsula * 0.72 + bay);
        points.push([
          600 + Math.cos(angle) * rx,
          388 + Math.sin(angle) * ry,
        ]);
      }
      return (
        'M ' +
        points
          .map(function (point) {
            return point[0].toFixed(1) + ' ' + point[1].toFixed(1);
          })
          .join(' L ') +
        ' Z'
      );
    }

    const WORKSPACE_MAP_CONTINENT = acbBuildContinentPath();

    const WORKSPACE_MAP_ISLANDS = [
      'M 176 300 C 198 282 228 288 236 306 C 244 326 220 344 196 340 C 172 336 160 316 176 300 Z',
      'M 206 610 C 230 592 262 600 270 622 C 278 644 250 662 224 656 C 200 650 190 628 206 610 Z',
      'M 960 610 C 988 592 1022 602 1030 626 C 1038 650 1008 666 980 658 C 956 650 942 630 960 610 Z',
      'M 1060 280 C 1080 264 1108 270 1114 288 C 1120 306 1098 322 1078 316 C 1058 310 1048 294 1060 280 Z',
    ];

    const WORKSPACE_MAP_RELAYS = [
      [742, 238],
      [1010, 332],
      [300, 580],
      [742, 612],
    ];

    function acbClipRegion(polygon, ax, ay, bx, by) {
      const nx = bx - ax;
      const ny = by - ay;
      const c = (bx * bx + by * by - ax * ax - ay * ay) / 2;
      const inside = function (point) {
        return nx * point[0] + ny * point[1] <= c;
      };
      const out = [];
      for (let index = 0; index < polygon.length; index += 1) {
        const current = polygon[index];
        const next = polygon[(index + 1) % polygon.length];
        const currentIn = inside(current);
        const nextIn = inside(next);
        if (currentIn) out.push(current);
        if (currentIn !== nextIn) {
          const denom = nx * (next[0] - current[0]) + ny * (next[1] - current[1]);
          if (Math.abs(denom) > 1e-6) {
            const t = (c - (nx * current[0] + ny * current[1])) / denom;
            out.push([
              current[0] + t * (next[0] - current[0]),
              current[1] + t * (next[1] - current[1]),
            ]);
          }
        }
      }
      return out;
    }

    function acbVoronoiCell(seed, seeds) {
      let polygon = [
        [-200, -200],
        [1400, -200],
        [1400, 900],
        [-200, 900],
      ];
      for (let index = 0; index < seeds.length; index += 1) {
        const other = seeds[index];
        if (Math.abs(other[0] - seed[0]) < 0.01 && Math.abs(other[1] - seed[1]) < 0.01) continue;
        polygon = acbClipRegion(polygon, seed[0], seed[1], other[0], other[1]);
        if (polygon.length < 3) break;
      }
      return polygon;
    }

    function workspaceShortTitle(title) {
      const clean = String(title || 'LOCAL WORKSPACE')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return clean.length > 18 ? clean.slice(0, 17) + '…' : clean;
    }

    function WorkspaceMap(props) {
      const source =
        Array.isArray(props.workspaces) && props.workspaces.length
          ? props.workspaces
          : FALLBACK_WORKSPACES;
      let entries = source.slice(0, 8).map(function (item) {
        return {
          title: String((item && item.title) || 'LOCAL WORKSPACE'),
          sessions: Math.max(0, Number(item && item.sessions) || 0),
        };
      });
      if (source.length > 8) {
        const rest = source.slice(7);
        const sum = rest.reduce(function (total, item) {
          return total + Math.max(0, Number(item && item.sessions) || 0);
        }, 0);
        entries = entries.slice(0, 7);
        entries.push({
          title: 'OTHER WORKSPACES',
          sessions: sum,
        });
      }
      const maxSessions = Math.max(1, entries.reduce(function (max, item) {
        return Math.max(max, item.sessions);
      }, 1));
      const totalSessions = entries.reduce(function (total, item) {
        return total + item.sessions;
      }, 0);
      const idleCount = entries.filter(function (item) {
        return item.sessions === 0;
      }).length;
      const regions = entries.map(function (entry, index) {
        const anchor = WORKSPACE_MAP_ANCHORS[index] || WORKSPACE_MAP_ANCHORS[WORKSPACE_MAP_ANCHORS.length - 1];
        const ratio = Math.min(1, entry.sessions / maxSessions);
        const heat = Math.pow(ratio, 1.12);
        const primary = index === 0 && entry.sessions > 0;
        const base = primary ? 192 : 112;
        const stretch = primary ? 132 : 70;
        return {
          entry: entry,
          index: index,
          x: anchor[0],
          y: anchor[1],
          ratio: ratio,
          heat: heat,
          primary: primary,
          rx: base + stretch * ratio,
          ry: (primary ? 142 : 88) + (primary ? 78 : 54) * ratio,
          angle: index * 17 - 16,
          color: primary ? '#d24a91' : '#3fd0e8',
          core: primary ? 'rgba(255,164,207,.95)' : 'rgba(180,248,255,.9)',
        };
      });
      const regionSeeds = regions.map(function (region) {
        return [region.x, region.y];
      });
      const primaryRegion = regions[0];
      const linkTargets = primaryRegion
        ? regions
            .slice(1)
            .map(function (region) {
              return [region.x, region.y];
            })
            .concat(WORKSPACE_MAP_RELAYS)
        : [];
      const networkLinks = linkTargets.map(function (point, index) {
        return h('line', {
          key: 'link-' + index,
          x1: primaryRegion ? primaryRegion.x : 600,
          y1: primaryRegion ? primaryRegion.y : 410,
          x2: point[0],
          y2: point[1],
          stroke: 'rgba(96,214,238,0.34)',
          strokeWidth: 1.05,
          strokeDasharray: '2 7',
          className: 'acbT-workspace-link',
          style: { animationDelay: (1.42 + index * 0.045).toFixed(2) + 's' },
        });
      });
      const nodeBursts = regions.map(function (region) {
        const rays = [];
        const rayCount = region.primary ? 22 : 14;
        for (let index = 0; index < rayCount; index += 1) {
          const angle = (index / rayCount) * Math.PI * 2 + region.index * 0.17;
          const inner = region.primary ? 6 : 4.5;
          const outer = (region.primary ? 62 : 34) + (index % 3) * 10;
          rays.push(
            h('line', {
              key: 'ray-' + index,
              x1: region.x + Math.cos(angle) * inner,
              y1: region.y + Math.sin(angle) * inner,
              x2: region.x + Math.cos(angle) * outer,
              y2: region.y + Math.sin(angle) * outer,
              stroke: region.primary ? 'rgba(255,196,230,0.6)' : 'rgba(188,246,255,0.55)',
              strokeWidth: 0.7,
            }),
          );
        }
        return h(
          'g',
          {
            key: 'node-' + region.index,
            className: 'acbT-workspace-node' + (region.primary ? ' is-primary' : ''),
            style: { animationDelay: (1.34 + region.index * 0.06).toFixed(2) + 's' },
          },
          h('circle', {
            cx: region.x,
            cy: region.y,
            r: region.primary ? 44 : 26,
            fill: region.primary ? 'url(#acbWNodeGlowP)' : 'url(#acbWNodeGlow)',
          }),
          rays,
          h('circle', {
            cx: region.x,
            cy: region.y,
            r: region.primary ? 2.9 : 2.1,
            fill: region.core,
          }),
        );
      });
      const relayBursts = WORKSPACE_MAP_RELAYS.map(function (point, index) {
        const rays = [];
        for (let ray = 0; ray < 8; ray += 1) {
          const angle = (ray / 8) * Math.PI * 2 + index * 0.4;
          rays.push(
            h('line', {
              key: 'relay-ray-' + ray,
              x1: point[0] + Math.cos(angle) * 4,
              y1: point[1] + Math.sin(angle) * 4,
              x2: point[0] + Math.cos(angle) * (17 + (ray % 2) * 5),
              y2: point[1] + Math.sin(angle) * (17 + (ray % 2) * 5),
              stroke: 'rgba(150,238,255,0.34)',
              strokeWidth: 0.65,
            }),
          );
        }
        return h(
          'g',
          {
            key: 'relay-' + index,
            className: 'acbT-workspace-node',
            style: { animationDelay: (1.52 + index * 0.06).toFixed(2) + 's' },
          },
          h('circle', {
            cx: point[0],
            cy: point[1],
            r: 12,
            fill: 'url(#acbWNodeGlow)',
          }),
          rays,
          h('circle', {
            cx: point[0],
            cy: point[1],
            r: 1.5,
            fill: 'rgba(206,252,255,0.85)',
          }),
        );
      });

      const landGradient = h(
        'radialGradient',
        { key: 'land', id: 'acbWLand', cx: '48%', cy: '44%', r: '66%' },
        h('stop', { offset: '0%', stopColor: '#031019' }),
        h('stop', { offset: '48%', stopColor: '#020a0f' }),
        h('stop', { offset: '100%', stopColor: '#010406' }),
      );
      const seaDots = h(
        'pattern',
        { key: 'dots', id: 'acbWSeaDots', width: 30, height: 30, patternUnits: 'userSpaceOnUse' },
        h('circle', { cx: 1.5, cy: 1.5, r: 0.9, fill: 'rgba(92,190,220,0.1)' }),
      );
      const coastGlow = h(
        'filter',
        { key: 'coast', id: 'acbWCoast', x: '-8%', y: '-8%', width: '116%', height: '116%' },
        h('feGaussianBlur', { stdDeviation: 4.6, result: 'blur' }),
        h(
          'feMerge',
          null,
          h('feMergeNode', { in: 'blur' }),
          h('feMergeNode', { in: 'SourceGraphic' }),
        ),
      );
      const regionDefs = regions.map(function (region) {
        return h(
          'radialGradient',
          { key: 'rg' + region.index, id: 'acbWRegion' + region.index },
          h('stop', { offset: '0%', stopColor: region.color, stopOpacity: region.primary ? 0.58 : 0.35 }),
          h('stop', { offset: '36%', stopColor: region.color, stopOpacity: region.primary ? 0.28 : 0.16 }),
          h('stop', { offset: '72%', stopColor: region.color, stopOpacity: 0.055 }),
          h('stop', { offset: '100%', stopColor: region.color, stopOpacity: 0 }),
        );
      });
      const relief = h(
        'filter',
        { key: 'relief', id: 'acbWRelief', x: '-10%', y: '-10%', width: '120%', height: '120%' },
        h('feTurbulence', {
          type: 'fractalNoise',
          baseFrequency: '0.008 0.014',
          numOctaves: 5,
          seed: 17,
          stitchTiles: 'stitch',
          result: 'noise',
        }),
        h(
          'feDiffuseLighting',
          {
            in: 'noise',
            surfaceScale: 9,
            diffuseConstant: 1.1,
            lightingColor: '#c4f9ff',
            result: 'light',
          },
          h('feDistantLight', { azimuth: 235, elevation: 54 }),
        ),
        h('feColorMatrix', {
          in: 'light',
          type: 'matrix',
          values: '0.07 0 0 0 0.002  0 0.16 0 0 0.012  0 0 0.24 0 0.03  0 0 0 1 0',
          result: 'tint',
        }),
        h('feComposite', { in: 'tint', in2: 'SourceGraphic', operator: 'in' }),
      );
      const landLight = h(
        'radialGradient',
        { key: 'landlight', id: 'acbWLandLight', cx: '50%', cy: '46%', r: '65%' },
        h('stop', { offset: '0%', stopColor: '#123b48', stopOpacity: 0.12 }),
        h('stop', { offset: '55%', stopColor: '#031017', stopOpacity: 0.2 }),
        h('stop', { offset: '100%', stopColor: '#000205', stopOpacity: 0.72 }),
      );
      const seaGrid = h(
        'pattern',
        { key: 'seagrid', id: 'acbWSeaGrid', width: 48, height: 48, patternUnits: 'userSpaceOnUse' },
        h('path', {
          d: 'M 48 0 L 0 0 0 48',
          fill: 'none',
          stroke: 'rgba(90,180,210,0.07)',
          strokeWidth: 0.8,
        }),
      );
      const shelf = h(
        'filter',
        { key: 'shelf', id: 'acbWShelf' },
        h('feGaussianBlur', { stdDeviation: 9 }),
      );
      const nodeGlow = h(
        'radialGradient',
        { key: 'nodeglow', id: 'acbWNodeGlow' },
        h('stop', { offset: '0%', stopColor: 'rgba(224,254,255,0.9)' }),
        h('stop', { offset: '32%', stopColor: 'rgba(92,210,240,0.16)' }),
        h('stop', { offset: '100%', stopColor: 'rgba(46,140,175,0)' }),
      );
      const nodeGlowP = h(
        'radialGradient',
        { key: 'nodeglowp', id: 'acbWNodeGlowP' },
        h('stop', { offset: '0%', stopColor: 'rgba(255,204,236,0.82)' }),
        h('stop', { offset: '34%', stopColor: 'rgba(204,66,136,0.16)' }),
        h('stop', { offset: '100%', stopColor: 'rgba(120,30,80,0)' }),
      );

      return h(
        'svg',
        {
          className: 'acbT-workspace-map',
          viewBox: '0 0 1200 760',
          preserveAspectRatio: 'xMidYMid meet',
          'aria-hidden': true,
        },
        h(
          'defs',
          { key: 'defs' },
          landGradient,
          seaDots,
          seaGrid,
          coastGlow,
          relief,
          landLight,
          shelf,
          nodeGlow,
          nodeGlowP,
          h(
            'clipPath',
            { key: 'clip', id: 'acbWLandClip' },
            h('path', { d: WORKSPACE_MAP_CONTINENT }),
          ),
          regionDefs,
        ),
        h('rect', { key: 'sea', width: 1200, height: 760, fill: 'url(#acbWSeaDots)', opacity: 0.45 }),
        h('rect', { key: 'seagrid', width: 1200, height: 760, fill: 'url(#acbWSeaGrid)', opacity: 0.55 }),
        h('path', {
          key: 'shelf',
          d: WORKSPACE_MAP_CONTINENT,
          fill: 'none',
          stroke: 'rgba(36,118,148,0.2)',
          strokeWidth: 30,
          filter: 'url(#acbWShelf)',
        }),
        h('path', {
          key: 'land',
          d: WORKSPACE_MAP_CONTINENT,
          fill: 'url(#acbWLand)',
          stroke: 'rgba(40,92,112,0.3)',
          strokeWidth: 0.8,
        }),
        h(
          'g',
          { key: 'terrain', clipPath: 'url(#acbWLandClip)' },
          h('rect', {
            width: 1200,
            height: 760,
            fill: '#ffffff',
            filter: 'url(#acbWRelief)',
            opacity: 0.32,
          }),
          h('rect', {
            width: 1200,
            height: 760,
            fill: 'url(#acbWLandLight)',
          }),
        ),
        h(
          'g',
          { key: 'islands' },
          WORKSPACE_MAP_ISLANDS.map(function (d, index) {
            return h('path', {
              key: 'island-' + index,
              d: d,
              fill: '#031017',
              stroke: 'rgba(84,170,196,0.32)',
              strokeWidth: 0.9,
            });
          }),
        ),
        h(
          'g',
          {
            key: 'regions',
            className: 'acbT-workspace-regions',
            clipPath: 'url(#acbWLandClip)',
          },
          regions.map(function (region) {
            const cell = acbVoronoiCell([region.x, region.y], regionSeeds);
            const cellPoints = cell
              .map(function (point) {
                return point[0].toFixed(1) + ',' + point[1].toFixed(1);
              })
              .join(' ');
            return h(
              'g',
              { key: 'region-' + region.index },
              h('polygon', {
                points: cellPoints,
                fill: region.color,
                fillOpacity: region.primary ? 0.48 : 0.02 + 0.56 * region.heat,
                stroke: 'none',
              }),
              h('ellipse', {
                cx: region.x,
                cy: region.y,
                rx: region.rx * 0.82,
                ry: region.ry * 0.82,
                fill: 'url(#acbWRegion' + region.index + ')',
                transform:
                  'rotate(' + region.angle + ' ' + region.x + ' ' + region.y + ')',
                opacity: region.primary ? 0.9 : 0.1 + 0.78 * region.heat,
              }),
              h('circle', {
                cx: region.x,
                cy: region.y,
                r: region.primary ? 2.8 : 2,
                fill: region.core,
                opacity: 0.82,
              }),
            );
          }),
        ),
        h(
          'g',
          { key: 'links', className: 'acbT-workspace-links' },
          networkLinks,
        ),
        h(
          'g',
          { key: 'nodes', className: 'acbT-workspace-nodes' },
          nodeBursts,
          relayBursts,
        ),
        h('path', {
          key: 'coast-glow',
          d: WORKSPACE_MAP_CONTINENT,
          fill: 'none',
          stroke: 'rgba(124,232,255,0.48)',
          strokeWidth: 6.2,
          filter: 'url(#acbWCoast)',
        }),
        h('path', {
          key: 'coast',
          d: WORKSPACE_MAP_CONTINENT,
          fill: 'none',
          stroke: 'rgba(218,253,255,0.96)',
          strokeWidth: 1.4,
        }),
        h(
          'g',
          { key: 'labels', className: 'acbT-workspace-labels' },
          regions.map(function (region) {
            const label = workspaceShortTitle(region.entry.title);
            const width = Math.max(88, Math.min(154, label.length * 6.4 + 22));
            const fill = region.primary ? '#ffc0dd' : '#c9f8ff';
            return h(
              'g',
              {
                key: 'label-' + region.index,
                transform: 'translate(' + region.x + ',' + (region.y - 10) + ')',
              },
              h('rect', {
                x: -width / 2,
                y: -22,
                width: width,
                height: 46,
                rx: 2,
                fill: 'rgba(0,4,8,0.42)',
              }),
              h(
                'text',
                {
                  x: 0,
                  y: -8,
                  textAnchor: 'middle',
                  fill: region.primary ? 'rgba(255,177,215,0.9)' : 'rgba(116,220,244,0.72)',
                  fontSize: 7,
                  letterSpacing: 1.5,
                },
                (region.primary ? 'PRIMARY // ' : 'WS-0' + (region.index + 1) + ' // ') +
                  String(region.entry.sessions).padStart(2, '0') +
                  ' SESSIONS',
              ),
              h(
                'text',
                {
                  x: 0,
                  y: 6,
                  textAnchor: 'middle',
                  fill: fill,
                  fontSize: 10,
                  letterSpacing: 0.6,
                  fontWeight: 600,
                },
                label.toUpperCase(),
              ),
              h('circle', {
                cx: 0,
                cy: 17,
                r: 1.8,
                fill: region.core,
                opacity: 0.9,
              }),
            );
          }),
        ),
        h(
          'g',
          { key: 'legend', transform: 'translate(820,648)' },
          h('rect', {
            x: -10,
            y: -17,
            width: 352,
            height: 48,
            rx: 2,
            fill: 'rgba(0,3,6,0.5)',
          }),
          h('text', {
            x: 0,
            y: 0,
            fill: 'rgba(150,204,220,0.65)',
            fontSize: 8,
            letterSpacing: 2,
          }, 'WORKSPACE SESSIONS'),
          h('circle', { cx: 0, cy: 18, r: 3, fill: '#d24a91' }),
          h('text', { x: 9, y: 21, fill: 'rgba(255,192,221,0.8)', fontSize: 7 },
            'PRIMARY // ' + (entries[0] ? entries[0].sessions : 0)),
          h('circle', { cx: 112, cy: 18, r: 3, fill: '#47c9e6' }),
          h('text', { x: 121, y: 21, fill: 'rgba(185,240,255,0.7)', fontSize: 7 },
            'ACTIVE // ' + totalSessions),
          h('circle', { cx: 232, cy: 18, r: 3, fill: '#163541' }),
          h('text', { x: 241, y: 21, fill: 'rgba(136,176,190,0.55)', fontSize: 7 },
            'IDLE // ' + idleCount),
        ),
        h('text', {
          key: 'theater',
          x: 48,
          y: 42,
          fill: 'rgba(144,206,224,0.58)',
          fontSize: 8,
          letterSpacing: 2.2,
        }, 'LOCAL THEATER // WORKSPACE OVERVIEW'),
      );
    }

    function TacticalMap3D({ workspaces }) {
      return h(
        'div',
        { className: 'acbT-map3d' },
        h('div', { key: 'base', className: 'acbT-map-base', 'aria-hidden': true }),
        h(
          'div',
          { key: 'plane', className: 'acbT-map3d-plane' },
          h(WorkspaceMap, { key: 'workspace-map', workspaces: workspaces }),
        ),
        h('div', { key: 'bloom', className: 'acbT-map-bloom', 'aria-hidden': true }),
        h('div', { key: 'flash', className: 'acbT-map-flash', 'aria-hidden': true }),
        h('div', { key: 'streak', className: 'acbT-map-streak', 'aria-hidden': true }),
        h(
          'div',
          { key: 'light', className: 'acbT-map-light', 'aria-hidden': true },
          h('i', { key: 'wide', className: 'acbT-map-wide' }),
          h('i', { key: 'halo', className: 'acbT-map-halo' }),
          h('i', { key: 'shaft', className: 'acbT-map-shaft' }),
          h('i', { key: 'core', className: 'acbT-map-core' }),
        ),
        h('div', { key: 'vig', className: 'acbT-map3d-vignette', 'aria-hidden': true }),
      );
    }

    function ContactMiniMap() {
      return h(
        'div',
        { className: 'acbT-mini' },
        h(
          'svg',
          { viewBox: '0 0 240 120', preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': true },
          h('rect', { width: 240, height: 120, fill: 'rgba(2,10,15,0.6)' }),
          h(
            'g',
            { stroke: 'rgba(127,231,255,0.1)', strokeWidth: 1 },
            h('path', { d: 'M0 30H240 M0 60H240 M0 90H240 M40 0V120 M80 0V120 M120 0V120 M160 0V120 M200 0V120' }),
          ),
          h('path', {
            d: 'M24 84 C 54 58, 84 66, 108 44 C 132 22, 166 34, 206 20',
            fill: 'none',
            stroke: 'rgba(127,231,255,0.45)',
            strokeWidth: 1,
            strokeDasharray: '4 4',
          }),
          h('circle', { cx: 78, cy: 52, r: 24, fill: 'none', stroke: 'rgba(255,90,77,0.7)', strokeDasharray: '4 6' }),
          h('circle', { cx: 162, cy: 74, r: 17, fill: 'none', stroke: 'rgba(255,90,77,0.5)', strokeDasharray: '3 5' }),
          h('circle', { cx: 78, cy: 52, r: 2, fill: '#ff5a4d' }),
          h('circle', { cx: 162, cy: 74, r: 2, fill: '#ff5a4d' }),
          h('text', { x: 8, y: 14, fill: 'rgba(127,231,255,0.42)', fontSize: 7, letterSpacing: 1 }, 'CONTACT ZONE'),
          h('text', { x: 232, y: 110, textAnchor: 'end', fill: 'rgba(255,182,72,0.65)', fontSize: 7, letterSpacing: 1 }, 'AA-07'),
        ),
      );
    }

    function SatGlobe() {
      const rings = [];
      for (let i = 0; i < 9; i += 1) {
        rings.push(
          h('i', {
            key: 'v' + i,
            className: 'acbT-globe-ring',
            style: { transform: 'rotateY(' + i * 20 + 'deg)' },
          }),
        );
      }
      const latitudes = [-2, -1, 0, 1, 2];
      for (const index of latitudes) {
        const scale = Math.cos((index / 3.4) * Math.PI);
        rings.push(
          h('i', {
            key: 'h' + index,
            className: 'acbT-globe-ring acbT-globe-lat',
            style: {
              transform: 'rotateX(90deg) translateZ(' + index * 15 + 'px) scale(' + scale.toFixed(3) + ')',
            },
          }),
        );
      }
      return h(
        'div',
        { className: 'acbT-globe', 'aria-hidden': true },
        h('div', { className: 'acbT-globe-core' }, rings),
        h('span', { className: 'acbT-globe-orbit' }),
        h('span', { className: 'acbT-globe-dot' }),
        h('span', { className: 'acbT-globe-axis' }),
      );
    }

    function tacticalStageIcon(index) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
        },
        h('path', { d: ICONS[index] || ICONS[0] }),
      );
    }


    function Scene(props) {
      const state = props.active ? 'active' : props.past ? 'past' : 'future';
      return h(
        'section',
        {
          className: 'acb-scene acb-scene-' + props.id + ' is-' + state,
          'data-scene': props.id,
          'aria-hidden': props.active ? undefined : 'true',
        },
        props.children,
      );
    }

    function LogoScene(props) {
      return h(
        Scene,
        { id: 'logo', active: props.active, past: props.past },
        h(
          'div',
          { className: 'acb-logo-wrap' },
          h(
            'div',
            { className: 'acb-logo-reticle', 'aria-hidden': true },
            h('i'), h('i'), h('i'), h('i'),
          ),
          h('div', { className: 'acb-logo-orbit', 'aria-hidden': true }, h('i', null)),
          h('div', { className: 'acb-logo-sweep', 'aria-hidden': true }),
          h(
            'div',
            { className: 'acb-logo-hudtop' },
            h('span', null, 'TACTICAL UPLINK'),
            h('span', null, 'CH 06 // SECURE'),
          ),
          h('div', { className: 'acb-logo-kicker' }, props.t('logo.kicker')),
          h(
            'h1',
            { className: 'acb-wordmark', 'aria-label': 'DEEPSEEK' },
            h('span', { className: 'acb-wordmark-main', 'data-text': 'DEEPSEEK' }, 'DEEPSEEK'),
          ),
          h(
            'div',
            { className: 'acb-wordmark-sub' },
            h('span', null, 'HARNESS'),
            h('i', { 'aria-hidden': true }),
          ),
          h('div', { className: 'acb-logo-op' }, 'OPERATION // FIRST LIGHT'),
          h('div', { className: 'acb-rule', 'aria-hidden': true }, h('i', null)),
          h('p', { className: 'acb-logo-tag' }, props.t('logo.tagline')),
          props.zh ? h('p', { className: 'acb-logo-zh' }, props.t('logo.zh')) : null,
          h(
            'div',
            { className: 'acb-logo-meter', 'aria-hidden': true },
            h('span', null, 'UPLINK'),
            h('i', null),
            h('b', null, 'LOCKED'),
          ),
          h(
            'div',
            { className: 'acb-dots', 'aria-hidden': true },
            [0, 1, 2].map(function (index) {
              return h('span', { key: index, style: { animationDelay: index * 0.16 + 's' } });
            }),
          ),
        ),
      );
    }

    function tacticalDate() {
      const now = new Date();
      return now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate());
    }

    function tacticalTime() {
      const now = new Date();
      return pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds());
    }

    function stageStatus(now, stage, reduced) {
      if (reduced || now >= stage.at) return 'ok';
      if (now >= stage.at - 800) return 'sync';
      return '--';
    }

    const TACTICAL_BOOT_ROWS = [
      { code: 'TGT-01', en: 'PROFILE READ', zh: 'boot.row1.zh' },
      { code: 'TGT-02', en: 'SERVICE START', zh: 'boot.row2.zh' },
      { code: 'TGT-03', en: 'WORKSPACE INDEX', zh: 'boot.row3.zh' },
      { code: 'TGT-04', en: 'SESSION LINK', zh: 'boot.row4.zh' },
    ];

    function tacticalReadouts() {
      return [
        { k: 'OPERATION', v: 'FIRST LIGHT' },
        { k: 'MISSION', v: '06 / INIT' },
        { k: 'DATE', v: tacticalDate() },
        { k: 'TIME', v: tacticalTime() },
        { k: 'AREA', v: 'LOCAL THEATER' },
        { k: 'CALLSIGN', v: 'DSH-01' },
        { k: 'THREAT', v: 'LOW' },
      ];
    }

    function LoginCard(props) {
      return h(
        'div',
        { className: 'acb-login-card' },
        h('i', { className: 'acb-login-scan', 'aria-hidden': true }),
        h(
          'div',
          { className: 'acb-login-stripe' },
          h('span', null, 'LOCAL ACCESS'),
          h('span', null, 'AUTH // 06'),
        ),
        h(
          'div',
          { className: 'acb-login-head' },
          h('span', { className: 'acb-login-kicker' }, props.t('login.kicker')),
          h('span', { className: 'acb-login-badge' }, props.t('login.badge')),
        ),
        h(
          'div',
          { className: 'acb-login-body' },
          h(
            'div',
            { className: 'acb-avatar', 'aria-hidden': true },
            h('i', { className: 'acb-avatar-ring' }),
            h('span', { className: 'acb-avatar-mark' }, 'DSH'),
            h('i', { className: 'acb-avatar-scan' }),
          ),
          h(
            'div',
            { className: 'acb-login-copy' },
            h('div', { className: 'acb-eyebrow' }, props.t('login.eyebrow')),
            h('h2', { className: 'acb-h2 acb-welcome' }, props.t('login.title')),
            h('p', { className: 'acb-sub' }, props.t('login.subtitle')),
            h(
              'ul',
              { className: 'acb-login-list' },
              LOGIN_ROWS.map(function (row, index) {
                return h(
                  'li',
                  { key: row.en, className: 'acb-login-row', style: { '--acb-i': index } },
                  h('i', { className: 'acb-check', 'aria-hidden': true }),
                  h(
                    'span',
                    { className: 'acb-login-row-copy' },
                    h('b', null, props.t(row.en)),
                    props.zh ? h('em', null, props.t(row.zh)) : null,
                  ),
                );
              }),
            ),
          ),
        ),
        h(
          'div',
          { className: 'acb-login-foot' },
          h(
            'div',
            { className: 'acb-auth' },
            h(
              'span',
              { className: 'acb-auth-pending' },
              props.t('login.pending'),
              h('i', null),
              h('i', null),
              h('i', null),
            ),
            h('span', { className: 'acb-auth-granted' }, props.t('login.granted')),
          ),
          h('div', { className: 'acb-login-bar', 'aria-hidden': true }, h('i', null)),
        ),
      );
    }

    function BriefingConsole(props) {
      const t = props.t;
      const login = props.mode === 'login';
      const readouts = tacticalReadouts();
      const logs = LOG_LINES.slice(login ? -2 : -4).map(function (line) {
        return line.text;
      });
      const stateText = login ? 'ALL SYSTEMS NOMINAL' : 'BOOT 100%';
      return h(
        'div',
        { className: 'acbT-frame', 'aria-hidden': login ? undefined : true },
        h(
          'header',
          { className: 'acbT-command' },
          h(
            'div',
            { className: 'acbT-command-left' },
            h('span', { className: 'acbT-rec' }, '● REC'),
            h('span', { className: 'acbT-command-title' }, 'TACTICAL BRIEFING'),
            h(
              'span',
              { className: 'acbT-command-op' },
              login ? 'OPERATION // OPERATOR AUTH' : 'OPERATION // FIRST LIGHT',
            ),
            h(
              'span',
              { className: 'acbT-command-mis' },
              login ? 'SESSION 06 // LOCAL ACCESS' : 'MISSION 06 // SYSTEM INITIALIZATION',
            ),
          ),
          h(
            'div',
            { className: 'acbT-command-right' },
            h('span', { className: 'acbT-class' }, 'SECRET // DSH COMMAND'),
            h('span', { className: 'acbT-tc' }, tacticalTime()),
          ),
        ),
        h(
          'div',
          { className: 'acbT-grid' },
          h(
            'aside',
            { className: 'acbT-col acbT-left' },
            h(
              TacticalPanel,
              { title: 'TGT INFO', right: '04 / 04', className: 'acbT-tgt' },
              h(
                'div',
                { className: 'acbT-tgt-rows' },
                TACTICAL_BOOT_ROWS.map(function (row) {
                  return h(
                    'div',
                    { key: row.code, className: 'acbT-tgt-row is-ok' },
                    h('span', { className: 'acbT-tgt-code' }, row.code),
                    h(
                      'span',
                      { className: 'acbT-tgt-name' },
                      h('span', { className: 'acbT-tgt-en' }, row.en),
                      props.zh ? h('span', { className: 'acbT-tgt-zh' }, t(row.zh)) : null,
                    ),
                    h('span', { className: 'acbT-tgt-dot' }),
                    h('span', { className: 'acbT-tgt-stat' }, 'OK'),
                  );
                }),
              ),
            ),
            h(
              TacticalPanel,
              { title: 'MISSION DATA', right: '06', className: 'acbT-mdata' },
              h(
                'div',
                { className: 'acbT-mdata-rows' },
                readouts.map(function (row) {
                  return h(
                    'div',
                    { key: row.k, className: 'acbT-mdata-row' },
                    h('span', { className: 'acbT-mdata-k' }, row.k),
                    h('span', { className: 'acbT-mdata-v' }, row.v),
                  );
                }),
              ),
            ),
            h(
              TacticalPanel,
              { title: 'OPERATION INFO', right: '100%', className: 'acbT-opinfo' },
              h(
                'div',
                { className: 'acbT-opinfo-body' },
                h(
                  'div',
                  { className: 'acbT-meter' },
                  h('span', null, 'BOOT SEQUENCE'),
                  h('div', { className: 'acbT-progress' }, h('i', { style: { width: '100%' } })),
                ),
                h(
                  'div',
                  { className: 'acbT-meter' },
                  h('span', null, 'ROUTE 100%'),
                  h('div', { className: 'acbT-progress' }, h('i', { style: { width: '100%' } })),
                ),
                h(
                  'div',
                  { className: 'acbT-oplogs' },
                  logs.map(function (line) {
                    return h('div', { key: line }, line);
                  }),
                ),
                h('div', { className: 'acbT-opstate is-ok' }, stateText),
              ),
            ),
          ),
          h(
            'main',
            { className: 'acbT-col acbT-center' },
            h(
              'div',
              { className: 'acbT-map-frame' },
              h(
                'div',
                { className: 'acbT-map-head' },
                h('span', null, 'WORKSPACE THEATER'),
                h('span', null, 'SESSIONS // LOCAL'),
              ),
              h(TacticalMap3D, { now: 99999, reduced: true, workspaces: props.workspaces }),
              h(
                'div',
                { className: 'acbT-map-foot' },
                h('span', null, 'WORKSPACE INDEX // DSH'),
                h(
                  'span',
                  null,
                  'REGIONS // ' +
                    (Array.isArray(props.workspaces)
                      ? String(Math.min(8, props.workspaces.length)).padStart(2, '0')
                      : '--'),
                ),
              ),
              login
                ? h('div', { className: 'acbT-login-overlay' }, props.children)
                : null,
            ),
            h(
              'div',
              { className: 'acbT-subtitle' },
              h(
                'div',
                { className: 'acbT-sub-line' },
                login
                  ? 'CREDENTIAL CHAIN VERIFIED. LOCAL OPERATOR CLEARED FOR WORKSPACE ACCESS.'
                  : 'BOOT LINK ESTABLISHED. PROFILE, SERVICES, WORKSPACE, AND SESSION CHAIN NOMINAL.',
              ),
              props.zh
                ? h(
                    'div',
                    { className: 'acbT-sub-zh' },
                    login ? '身份与凭据校验通过，正在进入工作区。' : '启动链路已建立，正在恢复本地工作环境。',
                  )
                : null,
            ),
          ),
        ),
        h(
          'footer',
          { className: 'acbT-footer' },
          h(
            'div',
            { className: 'acbT-ticker' },
            logs.map(function (line) {
              return h('span', { key: line }, line);
            }),
          ),
          h(
            'div',
            { className: 'acbT-sortie' },
            h('span', null, 'BOOT'),
            h('span', { className: 'acbT-sortie-count' }, '04 / 04'),
            h('div', { className: 'acbT-sortie-bar' }, h('i', { style: { width: '100%' } })),
            h('span', { className: 'acbT-phase' }, login ? 'CLEARED' : 'NOMINAL'),
          ),
        ),
      );
    }

    function TitleHud(props) {
      const t = props.t;
      const readouts = tacticalReadouts();
      return h(
        'div',
        { className: 'acbT-title-hud', 'aria-hidden': true },
        h(
          'header',
          { className: 'acbT-command acbT-title-command' },
          h(
            'div',
            { className: 'acbT-command-left' },
            h('span', { className: 'acbT-rec' }, '● REC'),
            h('span', { className: 'acbT-command-title' }, 'TACTICAL BRIEFING'),
            h('span', { className: 'acbT-command-op' }, 'OPERATION // FIRST LIGHT'),
            h('span', { className: 'acbT-command-mis' }, 'MISSION 06 // SYSTEM READY'),
          ),
          h(
            'div',
            { className: 'acbT-command-right' },
            h('span', { className: 'acbT-class' }, 'SECRET // DSH COMMAND'),
            h('span', { className: 'acbT-tc' }, tacticalTime()),
          ),
        ),
        h(
          'aside',
          { className: 'acbT-title-side acbT-title-left' },
          h(
            TacticalPanel,
            { title: 'MISSION DATA', right: '06', className: 'acbT-mdata' },
            h(
              'div',
              { className: 'acbT-mdata-rows' },
              readouts.map(function (row) {
                return h(
                  'div',
                  { key: row.k, className: 'acbT-mdata-row' },
                  h('span', { className: 'acbT-mdata-k' }, row.k),
                  h('span', { className: 'acbT-mdata-v' }, row.v),
                );
              }),
            ),
          ),
          h(
            TacticalPanel,
            { title: 'OPERATION INFO', right: '100%', className: 'acbT-opinfo' },
            h(
              'div',
              { className: 'acbT-opinfo-body' },
              h(
                'div',
                { className: 'acbT-meter' },
                h('span', null, 'BOOT SEQUENCE'),
                h('div', { className: 'acbT-progress' }, h('i', { style: { width: '100%' } })),
              ),
              h('div', { className: 'acbT-opstate is-ok' }, 'SORTIE AUTHORIZED'),
            ),
          ),
        ),
        h(
          'footer',
          { className: 'acbT-footer acbT-title-footer' },
          h(
            'div',
            { className: 'acbT-ticker' },
            LOG_LINES.slice(-3).map(function (line) {
              return h('span', { key: line.text }, line.text);
            }),
          ),
          h(
            'div',
            { className: 'acbT-sortie' },
            h('span', null, 'SORTIE'),
            h('span', { className: 'acbT-sortie-count' }, '04 / 04'),
            h('div', { className: 'acbT-sortie-bar' }, h('i', { style: { width: '100%' } })),
            h('span', { className: 'acbT-phase' }, 'READY'),
          ),
        ),
      );
    }

    function BootScene(props) {
      return h(
        Scene,
        { id: 'boot', active: props.active, past: props.past },
        h(BriefingConsole, { mode: 'boot', t: props.t, zh: props.zh, workspaces: props.workspaces }),
      );
    }

    function LoginScene(props) {
      return h(
        Scene,
        { id: 'login', active: props.active, past: props.past },
        h(
          BriefingConsole,
          { mode: 'login', t: props.t, zh: props.zh, workspaces: props.workspaces },
          h(LoginCard, { t: props.t, zh: props.zh }),
        ),
      );
    }

    function TitleScene(props) {
      return h(
        Scene,
        { id: 'title', active: props.active, past: props.past },
        h(TitleHud, { t: props.t, zh: props.zh }),
        h('div', { className: 'acb-title-flare', 'aria-hidden': true }),
        h(
          'div',
          { className: 'acb-title-wrap' },
          h('div', { className: 'acb-ghost', 'aria-hidden': true }, '06'),
          h('div', { className: 'acb-title-kicker' }, props.t('title.kicker')),
          h(
            'h2',
            { className: 'acb-title', 'aria-label': 'DEEPSEEK HARNESS' },
            h('span', { className: 'acb-title-main' }, 'DEEPSEEK'),
            h('span', { className: 'acb-title-sub' }, 'HARNESS'),
          ),
          h('div', { className: 'acb-title-rule', 'aria-hidden': true }, h('i', null)),
          h('p', { className: 'acb-title-note' }, props.t('title.subtitle')),
          h(
            'div',
            { className: 'acb-chips' },
            ['title.chip1', 'title.chip2', 'title.chip3'].map(function (key, index) {
              return h('span', { key: key, style: { '--acb-i': index } }, props.t(key));
            }),
          ),
          h(
            'div',
            { className: 'acb-prompt' },
            h('span', { className: 'acb-prompt-key', 'aria-hidden': true }, '↵'),
            h('span', null, props.t('title.prompt')),
            h('i', { className: 'acb-prompt-caret', 'aria-hidden': true }),
          ),
          h(
            'div',
            { className: 'acb-auto', 'aria-hidden': true },
            h('span', null, props.t('title.auto')),
            h('div', { className: 'acb-auto-track' }, h('i', null)),
          ),
        ),
      );
    }

    function BootHost({ t, getActive, subscribeLocale }) {
      const [runId, setRunId] = useState(0);
      const [workspaces, setWorkspaces] = useState(function () {
        return readAcbWorkspaces();
      });
      // Decided once per page load; the visibility handler must not replay a
      // run that already belongs to this launch.
      const bootAllowedRef = useRef(false);

      const start = useCallback(() => {
        const rt = runtime();
        if (rt.running) return;
        rt.running = true;
        rt.hasPlayed = true;
        rt.lastStartedAt = Date.now();
        markBootPlayed();
        setRunId((value) => value + 1);
      }, []);

      const finish = useCallback(() => {
        const rt = runtime();
        rt.running = false;
        rt.lastFinishedAt = Date.now();
      }, []);

      useEffect(() => {
        let alive = true;
        try {
          fetch('/acb/workspaces', {
            credentials: 'same-origin',
            headers: { accept: 'application/json' },
          })
            .then(function (response) {
              return response && response.ok ? response.json() : null;
            })
            .then(function (payload) {
              if (!alive || !payload || !Array.isArray(payload.list)) return;
              const rows = payload.list
                .filter(function (item) {
                  return item && typeof item.title === 'string';
                })
                .map(function (item) {
                  return {
                    title: String(item.title).trim(),
                    path: typeof item.path === 'string' ? item.path : '',
                    sessions: Number.isFinite(Number(item.sessions))
                      ? Math.max(0, Number(item.sessions))
                      : 0,
                  };
                })
                .filter(function (item) {
                  return item.title;
                })
                .sort(function (a, b) {
                  return b.sessions - a.sessions || a.title.localeCompare(b.title);
                });
              if (rows.length) setWorkspaces(rows);
            })
            .catch(function () {
              /* keep the startup snapshot or fallback */
            });
        } catch (error) {
          /* keep the startup snapshot or fallback */
        }
        return function () {
          alive = false;
        };
      }, []);

      useEffect(() => {
        const rt = runtime();
        // A remount can interrupt a run before it finishes — the shell may
        // replace slot renderers while the client modules finish loading. In
        // that case `hasPlayed` is already true but `lastFinishedAt` is still
        // zero, and the animation must be allowed to start again instead of
        // leaving the page stuck without its overlay.
        const interrupted = rt.hasPlayed && rt.lastStartedAt > 0 && rt.lastFinishedAt === 0;
        rt.running = false;

        // The opening sequence belongs to the application launch, not to every
        // surface that mounts afterwards. A window restored from the tray or a
        // page woken from sleep reloads the same window session, where the
        // sessionStorage flag is already set, so the sequence is not replayed.
        // Waking the machine without a reload does not remount this component
        // at all — and the listeners below no longer restart a finished run.
        // A plugin hot refresh is the one explicit preview replay.
        const played = bootAlreadyPlayed();
        const allowed = ACB_HOT_RELOAD || !played || interrupted;
        bootAllowedRef.current = allowed;

        if (!allowed) {
          // The Host injects its pre-boot splash into every page; a page that
          // will not play the sequence must not keep the splash on screen.
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
          // Only the first visible moment of a launch that has not shown its
          // sequence yet (the app can start hidden to the tray) may begin
          // here. A finished run stays finished for the whole session.
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
        h(BootSequence, {
          key: 'run-' + runId,
          t: t,
          getActive: getActive,
          subscribeLocale: subscribeLocale,
          onDone: finish,
          workspaces: workspaces,
        }),
      ]);
    }

    function BootSequence({ t, getActive, subscribeLocale, onDone, workspaces }) {
      const reduced = useState(function () {
        try {
          return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        } catch (error) {
          return false;
        }
      })[0];

      const duration = reduced ? REDUCED_MS : DURATION_MS;
      const phaseTimes = reduced ? REDUCED_PHASES : PHASE_TIMES;
      const fadeAt = duration - (reduced ? 420 : FADE_MS);

      const [phase, setPhase] = useState(0);
      const [leaving, setLeaving] = useState(false);
      const [quick, setQuick] = useState(false);
      const [gone, setGone] = useState(false);

      const phaseRef = useRef(0);
      const stopped = useRef(false);
      const doneRef = useRef(false);
      const fadeStarted = useRef(false);
      const skipTimer = useRef(null);
      const rootRef = useRef(null);
      const localeTickState = useState(0);
      const localeTick = localeTickState[0];
      const forceLocale = localeTickState[1];

      let translate = function (key) {
        try {
          const value = t(key);
          if (typeof value === 'string' && value !== key) return value;
        } catch (error) {
          /* fall through */
        }
        let active = '';
        try {
          active = getActive() || '';
        } catch (error) {
          active = '';
        }
        const dict = /^zh/i.test(active) ? ZH : EN;
        return Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : key;
      };

      let activeLocale = '';
      try {
        activeLocale = getActive() || '';
      } catch (error) {
        activeLocale = '';
      }
      const zh = /^zh/i.test(activeLocale);

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
        [finish, setGone, setLeaving, setQuick],
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
        [duration, fadeAt, finish, phaseTimes, setGone, setLeaving, setPhase],
      );

      useEffect(
        function () {
          if (typeof subscribeLocale !== 'function') return undefined;
          try {
            return subscribeLocale(function () {
              forceLocale(function (value) {
                return value + 1;
              });
            });
          } catch (error) {
            return undefined;
          }
        },
        [forceLocale, subscribeLocale],
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
      const clock = clockLabel();

      const root = h(
        'div',
        {
          ref: rootRef,
          className:
            'acb-root' +
            (leaving ? ' acb-leaving' : '') +
            (quick ? ' acb-quick' : '') +
            (reduced ? ' acb-static' : ''),
          'data-phase': phaseId,
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': translate('aria.label'),
          onPointerDown: skip,
        },
        h(Backdrop, null),
        h(
          'div',
          { className: 'acb-chrome', 'aria-hidden': true },
          h(
            'div',
            { className: 'acb-brand' },
            h('span', { className: 'acb-brand-mark' }),
            h('b', null, 'DEEPSEEK'),
            h('em', null, 'HARNESS'),
          ),
          h('div', { className: 'acb-chrome-mid' }, translate('chrome.boot')),
          h(
            'div',
            { className: 'acb-chrome-right' },
            h('span', null, 'DESKTOP 06'),
            h('span', { className: 'acb-clock' }, clock),
          ),
        ),
        h(
          'div',
          { className: 'acb-brackets', 'aria-hidden': true },
          h('i', { className: 'acb-bracket tl' }),
          h('i', { className: 'acb-bracket tr' }),
          h('i', { className: 'acb-bracket bl' }),
          h('i', { className: 'acb-bracket br' }),
        ),
        h(
          'div',
          { className: 'acb-stage' },
          h(LogoScene, {
            t: translate,
            zh: zh,
            active: phase === 0,
            past: phase > 0,
            key: 'logo-' + localeTick,
          }),
          h(BootScene, {
            t: translate,
            zh: zh,
            workspaces: workspaces,
            active: phase === 1,
            past: phase > 1,
            key: 'boot-' + localeTick,
          }),
          h(LoginScene, {
            t: translate,
            zh: zh,
            workspaces: workspaces,
            active: phase === 2,
            past: phase > 2,
            key: 'login-' + localeTick,
          }),
          h(TitleScene, {
            t: translate,
            zh: zh,
            active: phase === 3,
            past: phase > 3,
            key: 'title-' + localeTick,
          }),
        ),
        phase > 0
          ? h('div', { key: 'sweep-' + phase, className: 'acb-sweep', 'aria-hidden': true })
          : null,
        leaving ? h('div', { key: 'flash', className: 'acb-flash', 'aria-hidden': true }) : null,
        h(
          'div',
          { className: 'acb-foot', 'aria-hidden': true },
          h('span', null, translate('chrome.build')),
          h('span', null, 'BOOT // 15S'),
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'acb-skip',
            'aria-label': translate('aria.skip'),
            onClick: function (event) {
              event.stopPropagation();
              skip(event);
            },
          },
          translate('skip.label') + ' // ESC',
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
        try {
          console.error('[ac-boot] animation crashed', error);
        } catch (nested) {
          /* ignore */
        }
      }

      render() {
        return this.state.failed ? null : this.props.children;
      }
    }

    const CSS = String.raw`
@property --acb-unused{syntax:"<number>";inherits:false;initial-value:0;}
.acb-root{
  --acb-bg:#020509;
  --acb-ink:#eaf7ff;
  --acb-mute:rgba(174,218,236,.56);
  --acb-faint:rgba(127,231,255,.16);
  --acb-cyan:#7fe7ff;
  --acb-cyan-soft:rgba(127,231,255,.34);
  --acb-amber:#ffb648;
  --acb-ease-out:cubic-bezier(.23,1,.32,1);
  --acb-ease-in-out:cubic-bezier(.77,0,.175,1);
  position:fixed;inset:0;z-index:2147483650;overflow:hidden;pointer-events:auto;
  background:var(--acb-bg);color:var(--acb-ink);
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Cascadia Mono",monospace;
  font-size:12px;line-height:1.5;letter-spacing:.04em;
  opacity:1;transition:opacity .8s var(--acb-ease-out);
  isolation:isolate;contain:layout paint;user-select:none;
}
.acb-root.acb-leaving{opacity:0;}
.acb-root.acb-leaving .acb-stage{transform:scale(1.014);}
.acb-root.acb-quick{transition-duration:.22s;}
.acb-root.acb-static{transition-duration:.3s;}
.acb-root.acb-static *{animation:none!important;}

/* ---------- backdrop ---------- */
.acb-stars{position:absolute;inset:-4%;pointer-events:none;}
.acb-stars span{position:absolute;display:block;border-radius:50%;background:#dff8ff;
  box-shadow:0 0 4px rgba(127,231,255,.65);animation-name:acb-twinkle;
  animation-timing-function:ease-in-out;animation-iteration-count:infinite;animation-direction:alternate;}
@keyframes acb-twinkle{from{opacity:.08;transform:scale(.7)}to{opacity:.95;transform:scale(1)}}
.acb-aurora{position:absolute;inset:-12%;pointer-events:none;
  background:
    radial-gradient(48% 38% at 18% 16%,rgba(30,145,190,.14),transparent 68%),
    radial-gradient(42% 34% at 82% 28%,rgba(88,62,140,.10),transparent 70%),
    radial-gradient(60% 48% at 52% 104%,rgba(127,231,255,.10),transparent 66%);
  animation:acb-aurora 16s var(--acb-ease-in-out) infinite alternate;}
@keyframes acb-aurora{from{transform:translate3d(-1.2%,-1%,0) scale(1)}
  to{transform:translate3d(1.4%,1.2%,0) scale(1.04)}}
.acb-planet{position:absolute;left:50%;bottom:-172vw;width:200vw;height:200vw;
  transform:translateX(-50%);opacity:0;
  transition:opacity 1.6s var(--acb-ease-out),transform 2s var(--acb-ease-out);pointer-events:none;}
.acb-planet-sphere{position:absolute;inset:0;border-radius:50%;
  background:
    radial-gradient(120% 24% at 50% 0%,rgba(160,240,255,.34),rgba(44,120,150,.10) 42%,transparent 60%),
    radial-gradient(100% 100% at 50% 0%,#092231 0%,#061520 22%,#030b12 52%,#010408 100%);
  box-shadow:0 0 160px 12px rgba(127,231,255,.10),inset 0 60px 140px rgba(127,231,255,.07);}
.acb-planet-sphere::after{content:"";position:absolute;inset:0;border-radius:50%;opacity:.55;
  background-image:
    repeating-linear-gradient(0deg,transparent 0 39px,rgba(127,231,255,.055) 39px 40px),
    repeating-linear-gradient(90deg,transparent 0 39px,rgba(127,231,255,.045) 39px 40px);
  -webkit-mask-image:linear-gradient(to bottom,#000 0,rgba(0,0,0,.55) 22%,transparent 44%);
  mask-image:linear-gradient(to bottom,#000 0,rgba(0,0,0,.55) 22%,transparent 44%);}
.acb-planet-rim{position:absolute;left:50%;top:-1px;width:72%;height:2px;transform:translateX(-50%);
  background:linear-gradient(90deg,transparent,rgba(210,250,255,.95),transparent);
  box-shadow:0 0 34px 8px rgba(127,231,255,.38);}
.acb-beams{position:absolute;left:0;top:0;width:100%;height:64%;pointer-events:none;
  background:
    linear-gradient(108deg,transparent 24%,rgba(127,231,255,.05) 33%,transparent 42%),
    linear-gradient(74deg,transparent 58%,rgba(127,231,255,.035) 66%,transparent 75%);
  animation:acb-beams 9s var(--acb-ease-in-out) infinite alternate;}
@keyframes acb-beams{from{opacity:.45;transform:translate3d(-1%,0,0)}
  to{opacity:.9;transform:translate3d(1.4%,-1%,0)}}
.acb-orbit{position:absolute;left:50%;bottom:9vh;width:152vw;height:34vw;z-index:1;
  transform:translateX(-50%) rotate(-6deg);border:1px solid rgba(127,231,255,.14);
  border-radius:50%;opacity:0;pointer-events:none;
  transition:opacity 1.4s var(--acb-ease-out);}
.acb-orbit i{position:absolute;left:50%;top:-3px;width:5px;height:5px;border-radius:50%;
  background:#cff8ff;box-shadow:0 0 14px 2px rgba(127,231,255,.7);}
.acb-flare{position:absolute;left:50%;bottom:39vh;width:92vw;height:24vh;
  transform:translateX(-50%);pointer-events:none;opacity:0;
  background:radial-gradient(50% 50% at 50% 50%,rgba(150,240,255,.16),rgba(127,231,255,.04) 46%,transparent 72%);
  transition:opacity 1.4s var(--acb-ease-out);}
.acb-root[data-phase="login"] .acb-orbit{opacity:.12;}
.acb-root[data-phase="title"] .acb-orbit{opacity:.42;}
.acb-root[data-phase="title"] .acb-flare{opacity:1;}
.acb-gridfloor{position:absolute;left:-14%;right:-14%;bottom:-16%;height:58%;opacity:0;
  transform-origin:50% 100%;transform:perspective(760px) rotateX(63deg) rotateZ(-6deg);
  background-image:
    linear-gradient(rgba(127,231,255,.18) 1px,transparent 1px),
    linear-gradient(90deg,rgba(127,231,255,.18) 1px,transparent 1px);
  background-size:58px 58px;
  -webkit-mask-image:linear-gradient(to top,#000 8%,rgba(0,0,0,.5) 52%,transparent 92%);
  mask-image:linear-gradient(to top,#000 8%,rgba(0,0,0,.5) 52%,transparent 92%);
  transition:opacity 1.2s var(--acb-ease-out);pointer-events:none;}
.acb-scanlines{position:absolute;inset:-10% 0;pointer-events:none;opacity:.3;
  background:repeating-linear-gradient(0deg,rgba(150,235,255,.05) 0 1px,transparent 1px 3px);
  animation:acb-scan 8s linear infinite;}
@keyframes acb-scan{from{transform:translate3d(0,0,0)}to{transform:translate3d(0,6px,0)}}
.acb-vignette{position:absolute;inset:0;pointer-events:none;
  background:
    radial-gradient(72% 62% at 50% 44%,transparent 38%,rgba(0,0,0,.55) 100%),
    linear-gradient(180deg,rgba(0,0,0,.42),transparent 18%,transparent 82%,rgba(0,0,0,.5));}

.acb-root[data-phase="boot"] .acb-planet{opacity:.18;transform:translateX(-50%) translateY(18%);}
.acb-root[data-phase="login"] .acb-planet{opacity:.16;transform:translateX(-50%) translateY(16%);}
.acb-root[data-phase="title"] .acb-planet{opacity:1;transform:translateX(-50%);}
.acb-root[data-phase="boot"] .acb-gridfloor{opacity:.42;}
.acb-root[data-phase="title"] .acb-gridfloor{opacity:.16;}

/* ---------- chrome ---------- */
.acb-chrome{position:absolute;left:0;right:0;top:0;z-index:6;display:flex;align-items:center;
  justify-content:space-between;gap:20px;padding:20px 30px;pointer-events:none;
  font-size:9px;letter-spacing:.26em;color:rgba(174,218,236,.62);text-transform:uppercase;
  transition:opacity .8s var(--acb-ease-out);}
.acb-brand{display:flex;align-items:center;gap:9px;letter-spacing:.18em;color:#dff6ff;}
.acb-brand b{font-weight:600;letter-spacing:.24em;}
.acb-brand em{font-style:normal;color:rgba(174,218,236,.48);letter-spacing:.3em;}
.acb-brand-mark{width:14px;height:14px;border:1px solid rgba(127,231,255,.7);
  transform:rotate(45deg);box-shadow:0 0 12px rgba(127,231,255,.25);position:relative;}
.acb-brand-mark::after{content:"";position:absolute;inset:3px;border:1px solid rgba(255,182,72,.65);}
.acb-chrome-mid{position:absolute;left:50%;transform:translateX(-50%);color:rgba(174,218,236,.4);}
.acb-chrome-right{display:flex;align-items:center;gap:18px;}
.acb-clock{color:#dff6ff;font-variant-numeric:tabular-nums;letter-spacing:.16em;}
.acb-root[data-phase="title"] .acb-chrome{opacity:.3;}
.acb-brackets{position:absolute;inset:14px;z-index:6;pointer-events:none;}
.acb-bracket{position:absolute;width:26px;height:26px;border:1px solid rgba(127,231,255,.28);}
.acb-bracket.tl{left:0;top:0;border-right:0;border-bottom:0;}
.acb-bracket.tr{right:0;top:0;border-left:0;border-bottom:0;}
.acb-bracket.bl{left:0;bottom:0;border-right:0;border-top:0;}
.acb-bracket.br{right:0;bottom:0;border-left:0;border-top:0;}
.acb-foot{position:absolute;left:30px;right:30px;bottom:20px;z-index:6;display:flex;
  justify-content:space-between;gap:16px;pointer-events:none;
  font-size:8px;letter-spacing:.26em;color:rgba(174,218,236,.36);text-transform:uppercase;}
.acb-skip{position:absolute;left:30px;bottom:44px;z-index:9;cursor:pointer;
  appearance:none;border:1px solid rgba(127,231,255,.22);background:rgba(4,12,18,.5);
  color:rgba(174,218,236,.62);font:inherit;font-size:9px;letter-spacing:.22em;
  padding:7px 12px;text-transform:uppercase;
  transition:color .18s ease,border-color .18s ease,background-color .18s ease,transform .16s var(--acb-ease-out);}
.acb-skip:hover{color:#eaf7ff;border-color:rgba(127,231,255,.5);background:rgba(10,30,40,.7);}
.acb-skip:active{transform:scale(.97);}

/* ---------- stage / scenes ---------- */
.acb-stage{position:absolute;inset:0;z-index:4;
  transition:transform .8s var(--acb-ease-out);}
.acb-scene{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  padding:7vh 6vw;opacity:0;pointer-events:none;
  transition:opacity .7s var(--acb-ease-out),transform .9s var(--acb-ease-out);}
.acb-scene.is-future{transform:translate3d(0,22px,0) scale(.994);}
.acb-scene.is-past{transform:translate3d(0,-16px,0) scale(1.004);
  transition-duration:.3s,.45s;}
.acb-scene.is-active{opacity:1;transform:none;pointer-events:auto;}

/* ---------- logo ---------- */
.acb-logo-wrap{position:relative;display:flex;flex-direction:column;align-items:center;
  text-align:center;transform:translateY(-2vh);}
.acb-logo-orbit{position:absolute;left:50%;top:50%;width:min(62vw,760px);aspect-ratio:1;
  transform:translate(-50%,-52%);border-radius:50%;pointer-events:none;
  border:1px solid rgba(127,231,255,.10);}
.acb-logo-orbit::before{content:"";position:absolute;inset:9%;border-radius:50%;
  border:1px dashed rgba(127,231,255,.09);}
.acb-logo-orbit i{position:absolute;left:50%;top:-2px;width:5px;height:5px;border-radius:50%;
  background:#bff6ff;box-shadow:0 0 12px 2px rgba(127,231,255,.7);
  animation:acb-spin 20s linear infinite;transform-origin:0 50%;}
@keyframes acb-spin{to{transform:rotate(360deg)}}
.acb-logo-sweep{position:absolute;left:50%;top:19%;width:min(88vw,1040px);
  height:clamp(76px,10vw,136px);transform:translateX(-50%);overflow:hidden;
  pointer-events:none;z-index:2;}
.acb-logo-sweep::after{content:"";position:absolute;inset:-30% -12%;
  background:linear-gradient(104deg,transparent 34%,rgba(190,248,255,.12) 46%,
    rgba(255,255,255,.52) 50%,rgba(190,248,255,.12) 54%,transparent 66%);
  transform:translateX(-140%);animation:acb-shine 1.7s var(--acb-ease-out) .7s forwards;}
@keyframes acb-shine{to{transform:translateX(140%)}}
.acb-logo-kicker{font-size:10px;letter-spacing:.46em;color:rgba(174,218,236,.62);
  text-transform:uppercase;opacity:0;transform:translateY(10px);
  animation:acb-rise .8s var(--acb-ease-out) .06s forwards;}
.acb-scene-logo:not(.is-active) .acb-logo-kicker{animation-play-state:paused;}
.acb-wordmark{margin:18px 0 0;font-family:"Segoe UI",system-ui,-apple-system,sans-serif;
  font-weight:650;font-size:clamp(42px,7.6vw,112px);line-height:.92;letter-spacing:.2em;
  padding:0 .1em;white-space:nowrap;}
.acb-wordmark-main{display:inline-block;
  background:linear-gradient(180deg,#ffffff 0%,#f2fdff 24%,#a8ecff 44%,#3d7f93 52%,#d9f8ff 62%,#ffffff 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 16px 44px rgba(0,0,0,.65)) drop-shadow(0 0 30px rgba(90,220,255,.12));
  clip-path:inset(0 100% 0 0);opacity:0;
  animation:acb-wordmark 1.15s var(--acb-ease-out) .16s forwards;}
@keyframes acb-wordmark{from{clip-path:inset(0 100% 0 0);opacity:0;transform:translateY(.12em)}
  to{clip-path:inset(0 0 0 0);opacity:1;transform:none}}
.acb-scene-logo:not(.is-active) .acb-wordmark-main{animation-play-state:paused;}
.acb-wordmark-sub{display:flex;align-items:center;gap:18px;margin-top:14px;
  opacity:0;transform:translateY(8px);
  animation:acb-rise .9s var(--acb-ease-out) .62s forwards;}
.acb-wordmark-sub span{font-size:clamp(11px,1.35vw,17px);letter-spacing:.72em;color:#cfefff;
  padding-left:.72em;}
.acb-wordmark-sub i{display:block;width:clamp(28px,4vw,64px);height:1px;
  background:linear-gradient(90deg,rgba(255,182,72,.85),transparent);}
@keyframes acb-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.acb-rule{width:min(320px,38vw);height:1px;margin:30px 0 0;overflow:hidden;
  background:rgba(127,231,255,.14);}
.acb-rule i{display:block;height:100%;width:100%;transform-origin:left;transform:scaleX(0);
  background:linear-gradient(90deg,transparent,rgba(127,231,255,.9),transparent);
  animation:acb-rule 1.1s var(--acb-ease-out) .8s forwards;}
@keyframes acb-rule{to{transform:scaleX(1)}}
.acb-logo-tag{margin:18px 0 0;font-size:10px;letter-spacing:.34em;color:rgba(174,218,236,.66);
  text-transform:uppercase;opacity:0;animation:acb-rise .8s var(--acb-ease-out) .86s forwards;}
.acb-logo-zh{margin:10px 0 0;font-size:11px;letter-spacing:.28em;color:rgba(255,182,72,.7);
  opacity:0;animation:acb-rise .8s var(--acb-ease-out) 1s forwards;}
.acb-dots{display:flex;gap:9px;margin-top:34px;opacity:0;
  animation:acb-rise .7s var(--acb-ease-out) 1.1s forwards;}
.acb-dots span{width:4px;height:4px;border-radius:50%;background:rgba(127,231,255,.35);
  animation:acb-dot 1.5s var(--acb-ease-in-out) infinite;}
@keyframes acb-dot{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1.15)}}

/* ---------- boot ---------- */
.acb-boot-wrap{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(240px,.72fr);
  align-items:center;gap:clamp(30px,7vw,110px);width:min(1080px,100%);}
.acb-boot-copy{min-width:0;}
.acb-eyebrow{font-size:9px;letter-spacing:.42em;color:rgba(127,231,255,.55);
  text-transform:uppercase;opacity:0;animation:acb-rise .6s var(--acb-ease-out) .05s forwards;}
.acb-scene-boot:not(.is-active) .acb-eyebrow{animation-play-state:paused;}
.acb-h2{margin:14px 0 0;font-family:"Segoe UI",system-ui,-apple-system,sans-serif;
  font-size:clamp(30px,4.6vw,58px);font-weight:600;line-height:1.02;letter-spacing:.1em;
  color:#eaf7ff;text-shadow:0 0 40px rgba(80,210,255,.16);opacity:0;transform:translateY(12px);
  animation:acb-rise .8s var(--acb-ease-out) .12s forwards;}
.acb-scene-boot:not(.is-active) .acb-h2{animation-play-state:paused;}
.acb-sub{margin:14px 0 0;font-size:11px;letter-spacing:.16em;color:rgba(174,218,236,.62);
  opacity:0;animation:acb-rise .7s var(--acb-ease-out) .2s forwards;}
.acb-meter{margin-top:34px;max-width:520px;opacity:0;animation:acb-rise .7s var(--acb-ease-out) .28s forwards;}
.acb-meter-head{display:flex;justify-content:space-between;gap:16px;
  font-size:8px;letter-spacing:.26em;color:rgba(174,218,236,.46);text-transform:uppercase;}
.acb-bar{position:relative;height:2px;margin-top:9px;background:rgba(127,231,255,.13);overflow:hidden;}
.acb-bar i{display:block;height:100%;transform-origin:left;transform:scaleX(0);
  background:linear-gradient(90deg,rgba(127,231,255,.25),#9fefff);
  box-shadow:0 0 16px rgba(127,231,255,.5);
  animation:acb-fill 2.55s var(--acb-ease-in-out) .25s forwards;}
@keyframes acb-fill{to{transform:scaleX(1)}}
.acb-boot-list{list-style:none;margin:30px 0 0;padding:0;display:flex;flex-direction:column;gap:0;}
.acb-boot-row{display:grid;grid-template-columns:34px 1fr 42px;align-items:center;gap:14px;
  padding:9px 0;border-bottom:1px solid rgba(127,231,255,.07);opacity:0;
  transform:translateX(-12px);
  animation:acb-row-in .6s var(--acb-ease-out) forwards;
  animation-delay:calc(.55s + var(--acb-i) * .22s);}
@keyframes acb-row-in{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:none}}
.acb-boot-idx{font-size:8px;letter-spacing:.14em;color:rgba(127,231,255,.38);}
.acb-boot-label{display:flex;align-items:baseline;gap:10px;min-width:0;}
.acb-boot-label b{font-size:10px;font-weight:600;letter-spacing:.2em;color:#dcf6ff;}
.acb-boot-label em{font-style:normal;font-size:9px;letter-spacing:.08em;color:rgba(174,218,236,.44);}
.acb-boot-state{font-size:8px;letter-spacing:.18em;color:rgba(127,231,255,.8);text-align:right;}
.acb-boot-state::before{content:"";display:inline-block;width:5px;height:5px;margin-right:7px;
  border-radius:50%;background:#7fe7ff;box-shadow:0 0 8px rgba(127,231,255,.8);vertical-align:1px;}
.acb-gauge-wrap{display:flex;flex-direction:column;align-items:center;gap:18px;
  opacity:0;transform:scale(.96);animation:acb-gauge-in 1s var(--acb-ease-out) .2s forwards;}
@keyframes acb-gauge-in{to{opacity:1;transform:none}}
.acb-gauge{position:relative;width:min(34vw,290px);aspect-ratio:1;}
.acb-gauge-ticks{position:absolute;inset:0;border-radius:50%;
  background:repeating-conic-gradient(from 0deg,rgba(127,231,255,.5) 0 1deg,transparent 1deg 7deg);
  -webkit-mask-image:radial-gradient(farthest-side,transparent calc(100% - 9px),#000 calc(100% - 8px));
  mask-image:radial-gradient(farthest-side,transparent calc(100% - 9px),#000 calc(100% - 8px));
  animation:acb-rotate 46s linear infinite;}
.acb-gauge-arc{position:absolute;inset:16px;border-radius:50%;
  background:conic-gradient(from -90deg,rgba(127,231,255,0) 0deg,rgba(127,231,255,.95) 78deg,rgba(127,231,255,0) 92deg);
  -webkit-mask-image:radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 2px));
  mask-image:radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 2px));
  filter:drop-shadow(0 0 8px rgba(127,231,255,.5));
  animation:acb-rotate 1.7s linear infinite;}
@keyframes acb-rotate{to{transform:rotate(360deg)}}
.acb-gauge-core{position:absolute;inset:22%;border-radius:50%;display:flex;
  flex-direction:column;align-items:center;justify-content:center;gap:5px;
  border:1px solid rgba(127,231,255,.16);
  background:radial-gradient(circle at 50% 42%,rgba(14,44,58,.72),rgba(2,7,11,.9) 72%);
  box-shadow:inset 0 0 40px rgba(127,231,255,.07);}
.acb-gauge-mark{font-family:"Segoe UI",system-ui,sans-serif;font-size:clamp(20px,2.4vw,30px);
  letter-spacing:.22em;padding-left:.22em;color:#e8fbff;text-shadow:0 0 24px rgba(127,231,255,.4);}
.acb-gauge-caption{font-size:8px;letter-spacing:.28em;color:rgba(174,218,236,.5);}
.acb-gauge-ready{font-size:9px;letter-spacing:.44em;color:#9fefff;padding-left:.44em;
  opacity:0;animation:acb-granted .5s var(--acb-ease-out) 2.4s forwards;}

/* ---------- login ---------- */
.acb-login-orbit{position:absolute;left:50%;top:50%;width:min(78vw,820px);aspect-ratio:1;
  transform:translate(-50%,-50%);border:1px solid rgba(127,231,255,.07);border-radius:50%;
  opacity:0;pointer-events:none;transition:opacity .9s var(--acb-ease-out);}
.acb-login-orbit::before{content:"";position:absolute;inset:8%;border-radius:50%;
  border:1px dashed rgba(127,231,255,.075);animation:acb-rotate 44s linear infinite;}
.acb-login-orbit i{position:absolute;left:50%;top:-2px;width:4px;height:4px;border-radius:50%;
  background:#bff6ff;box-shadow:0 0 12px 2px rgba(127,231,255,.6);
  transform-origin:0 50%;animation:acb-rotate 18s linear infinite;}
.acb-scene-login.is-active .acb-login-orbit{opacity:1;}
.acb-login-card{position:relative;z-index:2;width:min(620px,94vw);padding:0;
  border:1px solid rgba(127,231,255,.18);
  background:
    linear-gradient(155deg,rgba(11,31,42,.94),rgba(4,12,18,.9) 48%,rgba(3,9,14,.94));
  box-shadow:0 40px 120px rgba(0,0,0,.6),inset 0 1px 0 rgba(208,247,255,.14),
    inset 0 0 80px rgba(20,70,90,.12);
  opacity:0;transform:translateY(24px) scale(.985);
  animation:acb-card-in .9s var(--acb-ease-out) .05s forwards;overflow:hidden;}
@keyframes acb-card-in{to{opacity:1;transform:none}}
.acb-login-card::before,.acb-login-card::after{content:"";position:absolute;width:30px;height:30px;
  border:1px solid rgba(127,231,255,.55);pointer-events:none;z-index:2;}
.acb-login-card::before{left:-1px;top:-1px;border-right:0;border-bottom:0;}
.acb-login-card::after{right:-1px;bottom:-1px;border-left:0;border-top:0;}
.acb-login-head{display:flex;align-items:center;justify-content:space-between;gap:16px;
  padding:14px 20px;border-bottom:1px solid rgba(127,231,255,.12);
  background:linear-gradient(180deg,rgba(18,48,62,.5),transparent);}
.acb-login-kicker{font-size:9px;letter-spacing:.34em;color:#cfefff;text-transform:uppercase;}
.acb-login-badge{font-size:8px;letter-spacing:.22em;color:rgba(255,182,72,.72);}
.acb-login-body{display:grid;grid-template-columns:auto 1fr;align-items:center;
  gap:26px;padding:30px 28px 24px;}
.acb-avatar{position:relative;width:92px;height:92px;border-radius:50%;display:flex;
  align-items:center;justify-content:center;overflow:hidden;
  border:1px solid rgba(127,231,255,.3);
  background:radial-gradient(circle at 50% 35%,rgba(34,95,116,.55),rgba(3,12,18,.9) 72%);
  box-shadow:0 0 40px rgba(127,231,255,.12),inset 0 0 26px rgba(127,231,255,.08);}
.acb-avatar-ring{position:absolute;inset:-1px;border-radius:50%;
  border:1px solid rgba(127,231,255,.22);}
.acb-avatar-ring::after{content:"";position:absolute;inset:8px;border-radius:50%;
  border:1px dashed rgba(127,231,255,.16);animation:acb-rotate 26s linear infinite;}
.acb-avatar-mark{font-family:"Segoe UI",system-ui,sans-serif;font-size:17px;font-weight:600;
  letter-spacing:.16em;padding-left:.16em;color:#eafcff;text-shadow:0 0 20px rgba(127,231,255,.45);}
.acb-avatar-scan{position:absolute;left:-20%;right:-20%;height:2px;
  background:linear-gradient(90deg,transparent,rgba(180,248,255,.9),transparent);
  box-shadow:0 0 14px rgba(127,231,255,.6);
  animation:acb-avatar-scan 2.4s var(--acb-ease-in-out) infinite;}
@keyframes acb-avatar-scan{0%{transform:translateY(-46px);opacity:0}
  12%{opacity:1}88%{opacity:1}100%{transform:translateY(46px);opacity:0}}
.acb-login-copy{min-width:0;}
.acb-welcome{margin-top:10px;font-size:clamp(26px,3.5vw,42px);letter-spacing:.06em;line-height:1.08;}
.acb-login-list{list-style:none;margin:22px 0 0;padding:0;display:flex;flex-direction:column;gap:9px;}
.acb-login-row{display:flex;align-items:center;gap:10px;opacity:0;transform:translateX(-8px);
  animation:acb-row-in .5s var(--acb-ease-out) forwards;
  animation-delay:calc(.5s + var(--acb-i) * .12s);}
.acb-check{width:6px;height:6px;border-radius:50%;background:#7fe7ff;
  box-shadow:0 0 8px rgba(127,231,255,.7);flex:0 0 auto;}
.acb-login-row-copy{display:flex;align-items:baseline;gap:9px;min-width:0;}
.acb-login-row-copy b{font-size:9px;font-weight:600;letter-spacing:.16em;color:rgba(220,246,255,.9);}
.acb-login-row-copy em{font-style:normal;font-size:9px;letter-spacing:.06em;color:rgba(174,218,236,.42);}
.acb-login-foot{display:flex;align-items:center;justify-content:space-between;gap:20px;
  padding:14px 22px 18px;border-top:1px solid rgba(127,231,255,.1);}
.acb-auth{position:relative;height:16px;min-width:180px;font-size:9px;letter-spacing:.24em;}
.acb-auth-pending{position:absolute;inset:0;display:flex;align-items:center;gap:7px;
  color:rgba(255,182,72,.85);animation:acb-pending-out .3s ease-out 1.5s forwards;}
.acb-auth-pending i{width:3px;height:3px;border-radius:50%;background:currentColor;
  animation:acb-dot 1.1s var(--acb-ease-in-out) infinite;}
.acb-auth-pending i:nth-child(2){animation-delay:.14s}
.acb-auth-pending i:nth-child(3){animation-delay:.28s}
@keyframes acb-pending-out{to{opacity:0}}
.acb-auth-granted{position:absolute;inset:0;display:flex;align-items:center;
  color:#9fefff;opacity:0;animation:acb-granted .4s var(--acb-ease-out) 1.62s forwards;}
@keyframes acb-granted{to{opacity:1}}
.acb-login-bar{flex:1;height:1px;background:rgba(127,231,255,.12);overflow:hidden;max-width:200px;}
.acb-login-bar i{display:block;height:100%;transform-origin:left;transform:scaleX(0);
  background:linear-gradient(90deg,transparent,#9fefff);animation:acb-fill 2.2s var(--acb-ease-in-out) .5s forwards;}

/* ---------- title ---------- */
.acb-title-wrap{position:relative;display:flex;flex-direction:column;align-items:center;
  text-align:center;transform:translateY(-7vh);width:100%;}
.acb-ghost{position:absolute;right:-4vw;top:-16vh;font-family:"Segoe UI",system-ui,sans-serif;
  font-weight:700;font-size:clamp(180px,30vw,420px);line-height:1;letter-spacing:-.04em;
  color:transparent;-webkit-text-stroke:1px rgba(127,231,255,.08);
  user-select:none;pointer-events:none;}
.acb-title-kicker{font-size:9px;letter-spacing:.52em;color:rgba(174,218,236,.56);
  text-transform:uppercase;padding-left:.52em;opacity:0;
  animation:acb-rise .7s var(--acb-ease-out) .1s forwards;}
.acb-title{margin:20px 0 0;font-family:"Segoe UI",system-ui,-apple-system,sans-serif;
  font-weight:650;line-height:.85;letter-spacing:.14em;padding-left:.14em;}
.acb-title-main{display:block;font-size:clamp(44px,9vw,132px);
  background:linear-gradient(180deg,#ffffff 0%,#f4feff 26%,#a9edff 46%,#3d8094 54%,#dcf9ff 68%,#ffffff 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 22px 60px rgba(0,0,0,.6)) drop-shadow(0 0 40px rgba(90,220,255,.12));
  clip-path:inset(0 100% 0 0);opacity:0;
  animation:acb-wordmark 1.2s var(--acb-ease-out) .18s forwards;}
.acb-title-sub{display:block;margin-top:.36em;font-size:clamp(13px,1.8vw,24px);
  font-weight:500;letter-spacing:.9em;padding-left:.9em;color:rgba(214,246,255,.82);
  opacity:0;transform:translateY(8px);animation:acb-rise .9s var(--acb-ease-out) .6s forwards;}
.acb-title-rule{width:min(460px,52vw);height:1px;margin:30px 0 0;background:rgba(127,231,255,.14);
  overflow:hidden;}
.acb-title-rule i{display:block;height:100%;transform-origin:center;transform:scaleX(0);
  background:linear-gradient(90deg,transparent,rgba(255,182,72,.85),rgba(127,231,255,.9),transparent);
  animation:acb-title-rule 1.2s var(--acb-ease-out) .8s forwards;}
@keyframes acb-title-rule{to{transform:scaleX(1)}}
.acb-title-note{margin:12px 0 0;font-size:11px;letter-spacing:.24em;color:rgba(174,218,236,.7);
  text-shadow:0 1px 12px rgba(0,0,0,.8);opacity:0;animation:acb-rise .8s var(--acb-ease-out) .95s forwards;}
.acb-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:18px;}
.acb-chips span{font-size:8px;letter-spacing:.24em;color:rgba(174,218,236,.58);
  padding:6px 10px;border:1px solid rgba(127,231,255,.14);background:rgba(6,18,26,.42);
  opacity:0;transform:translateY(8px);
  animation:acb-rise .6s var(--acb-ease-out) forwards;
  animation-delay:calc(1.05s + var(--acb-i) * .08s);}
.acb-prompt{display:flex;align-items:center;gap:12px;margin-top:30px;
  font-size:10px;letter-spacing:.3em;color:rgba(234,247,255,.82);text-transform:uppercase;
  opacity:0;animation:acb-rise .7s var(--acb-ease-out) 1.4s forwards;}
.acb-prompt-key{display:inline-flex;align-items:center;justify-content:center;
  width:22px;height:22px;border:1px solid rgba(127,231,255,.4);font-size:11px;color:#bff6ff;}
.acb-prompt-caret{width:1px;height:12px;background:#8feaff;margin-left:2px;
  animation:acb-blink 1.1s steps(1) infinite;}
@keyframes acb-blink{0%,49%{opacity:1}50%,100%{opacity:.15}}
.acb-auto{display:flex;align-items:center;gap:12px;margin-top:16px;
  font-size:8px;letter-spacing:.3em;color:rgba(174,218,236,.36);}
.acb-auto-track{width:min(240px,26vw);height:1px;background:rgba(127,231,255,.12);overflow:hidden;}
.acb-auto-track i{display:block;height:100%;transform-origin:left;transform:scaleX(0);
  background:linear-gradient(90deg,rgba(127,231,255,.2),#9fefff);animation:acb-auto 5s linear forwards;}
@keyframes acb-auto{to{transform:scaleX(1)}}

/* ---------- transitions ---------- */
.acb-sweep{position:absolute;inset:0;z-index:7;pointer-events:none;
  background:linear-gradient(100deg,transparent 42%,rgba(190,245,255,.10) 50%,transparent 58%);
  animation:acb-sweep 1.1s var(--acb-ease-out) forwards;}
@keyframes acb-sweep{from{transform:translate3d(-60%,0,0);opacity:0}
  22%{opacity:1}to{transform:translate3d(60%,0,0);opacity:0}}
.acb-flash{position:absolute;inset:0;z-index:8;pointer-events:none;
  background:radial-gradient(58% 46% at 50% 52%,rgba(180,245,255,.22),transparent 70%);
  animation:acb-flash .7s ease-out both;}
@keyframes acb-flash{0%{opacity:.95}100%{opacity:0}}


.acbT-root{position:fixed;inset:0;z-index:2147483650;overflow:hidden;pointer-events:auto;
  background:radial-gradient(130% 100% at 50% 38%,#07151d 0%,#040a0f 55%,#020406 100%);
  color:#cfefff;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Cascadia Mono",monospace;
  font-size:11px;line-height:1.5;letter-spacing:.05em;opacity:1;transition:opacity .8s ease;isolation:isolate;}
.acbT-root.acbT-leaving{opacity:0;}
.acbT-root.acbT-quick{transition-duration:.2s;}
.acbT-static{transition-duration:.35s;}
.acbT-static *{animation:none!important;}
.acbT-vignette{position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(75% 65% at 50% 45%,transparent 40%,rgba(0,0,0,.58) 100%);}
.acbT-scanlines{position:absolute;inset:-10% 0;pointer-events:none;opacity:.5;
  background:repeating-linear-gradient(0deg,rgba(127,231,255,.05) 0 1px,transparent 1px 3px);
  animation:acbT-scan 9s linear infinite;}
@keyframes acbT-scan{from{transform:translateY(0)}to{transform:translateY(6px)}}
.acbT-letterbox{position:absolute;left:0;right:0;height:3.4vh;background:#010305;z-index:3;pointer-events:none;}
.acbT-letterbox.top{top:0;border-bottom:1px solid rgba(127,231,255,.12);}
.acbT-letterbox.bottom{bottom:0;border-top:1px solid rgba(127,231,255,.12);}
.acbT-frame{position:absolute;left:2.5vw;right:2.5vw;top:4.4vh;bottom:4.4vh;z-index:2;
  display:flex;flex-direction:column;gap:7px;}
.acbT-frame:before,.acbT-frame:after{content:"";position:absolute;width:34px;height:34px;
  border:1px solid rgba(127,231,255,.55);pointer-events:none;}
.acbT-frame:before{left:-1px;top:-1px;border-right:0;border-bottom:0;}
.acbT-frame:after{right:-1px;bottom:-1px;border-left:0;border-top:0;}
.acbT-command{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:14px;
  padding:6px 10px;border:1px solid rgba(127,231,255,.18);
  background:linear-gradient(180deg,rgba(7,24,32,.9),rgba(3,10,15,.65));}
.acbT-command-left{display:flex;align-items:baseline;gap:14px;min-width:0;flex-wrap:wrap;}
.acbT-rec{font-size:9px;letter-spacing:.2em;color:#ff5a4d;animation:acbT-blink 1.4s steps(1) infinite;}
.acbT-command-title{font-family:"Segoe UI",system-ui,sans-serif;font-weight:600;
  font-size:clamp(13px,1.25vw,21px);letter-spacing:.2em;color:#eafaff;white-space:nowrap;}
.acbT-command-op{font-size:9px;letter-spacing:.2em;color:#ffb648;white-space:nowrap;}
.acbT-command-mis{font-size:8px;letter-spacing:.16em;color:rgba(127,231,255,.5);white-space:nowrap;}
.acbT-command-right{display:flex;align-items:center;gap:14px;flex:0 0 auto;}
.acbT-class{font-size:8px;letter-spacing:.24em;color:#ff8a80;border:1px solid rgba(255,90,77,.6);
  padding:2px 6px;white-space:nowrap;}
.acbT-tc{font-size:9px;letter-spacing:.14em;color:#e8f7ff;font-variant-numeric:tabular-nums;}
@keyframes acbT-blink{0%,49%{opacity:1}50%,100%{opacity:.3}}
.acbT-grid{flex:1;min-height:0;display:grid;gap:8px;
  grid-template-columns:minmax(190px,.72fr) minmax(0,2.2fr) minmax(232px,.86fr);}
.acbT-col{min-width:0;min-height:0;display:flex;flex-direction:column;gap:7px;}
.acbT-left{transform:perspective(1600px) rotateY(2deg);transform-origin:left center;}
.acbT-right{transform:perspective(1600px) rotateY(-2deg);transform-origin:right center;}
.acbT-panel{position:relative;min-height:0;overflow:hidden;padding:6px 8px;
  border:1px solid rgba(127,231,255,.18);
  background:linear-gradient(180deg,rgba(6,21,29,.82),rgba(3,10,15,.7));
  box-shadow:0 0 18px rgba(0,0,0,.35),inset 0 0 24px rgba(8,36,48,.2);
  opacity:0;transform:translateY(8px);transition:opacity .5s ease,transform .5s ease;}
.acbT-panel.is-in{opacity:1;transform:none;}
.acbT-panel-h{display:flex;justify-content:space-between;gap:8px;padding-bottom:3px;
  margin-bottom:4px;border-bottom:1px solid rgba(127,231,255,.15);
  font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:rgba(127,231,255,.58);}
.acbT-panel-h span:last-child{color:rgba(255,182,72,.7);}
.acbT-tgt{flex:0 0 auto;}
.acbT-tgt-rows{display:flex;flex-direction:column;}
.acbT-tgt-row{display:grid;grid-template-columns:42px 1fr 7px 30px;align-items:center;gap:5px;
  padding:3px 0;border-bottom:1px dotted rgba(127,231,255,.1);opacity:.38;transition:opacity .35s ease;}
.acbT-tgt-row.is-sync,.acbT-tgt-row.is-ok{opacity:1;}
.acbT-tgt-code{font-size:7px;letter-spacing:.12em;color:rgba(127,231,255,.42);}
.acbT-tgt-name{min-width:0;overflow:hidden;}
.acbT-tgt-en{display:block;font-size:9px;letter-spacing:.08em;color:#dff6ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.acbT-tgt-zh{display:block;font-size:8px;letter-spacing:.02em;color:rgba(127,231,255,.48);}
.acbT-tgt-dot{width:5px;height:5px;border-radius:50%;background:rgba(127,231,255,.22);}
.acbT-tgt-row.is-sync .acbT-tgt-dot{background:#ffb648;box-shadow:0 0 7px rgba(255,182,72,.8);
  animation:acbT-blink .8s steps(1) infinite;}
.acbT-tgt-row.is-ok .acbT-tgt-dot{background:#7fe7ff;box-shadow:0 0 7px rgba(127,231,255,.8);}
.acbT-tgt-stat{font-size:7px;letter-spacing:.08em;text-align:right;color:rgba(127,231,255,.4);}
.acbT-tgt-row.is-ok .acbT-tgt-stat{color:#7fe7ff;}
.acbT-tgt-row.is-sync .acbT-tgt-stat{color:#ffb648;}
.acbT-mdata{flex:0 0 auto;}
.acbT-mdata-rows{display:flex;flex-direction:column;}
.acbT-mdata-row{display:grid;grid-template-columns:52px 1fr;gap:6px;padding:2px 0;
  border-bottom:1px dotted rgba(127,231,255,.08);}
.acbT-mdata-k{font-size:7px;letter-spacing:.14em;color:rgba(127,231,255,.4);}
.acbT-mdata-v{font-size:9px;letter-spacing:.04em;color:#dff6ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.acbT-opinfo{flex:1;}
.acbT-opinfo-body{display:flex;flex-direction:column;gap:5px;height:100%;}
.acbT-meter{display:flex;flex-direction:column;gap:2px;font-size:7px;letter-spacing:.14em;color:rgba(127,231,255,.55);}
.acbT-progress{position:relative;height:3px;background:rgba(127,231,255,.12);overflow:hidden;}
.acbT-progress i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#2f7f99,#7fe7ff);
  box-shadow:0 0 7px rgba(127,231,255,.6);transition:width .4s linear;}
.acbT-oplogs{margin-top:2px;border-top:1px solid rgba(127,231,255,.1);padding-top:3px;
  font-size:7px;line-height:1.55;color:rgba(127,231,255,.4);overflow:hidden;flex:1;min-height:0;}
.acbT-opstate{margin-top:auto;font-size:8px;letter-spacing:.14em;color:#ffb648;}
.acbT-opstate.is-ok{color:#7fe7ff;text-shadow:0 0 8px rgba(127,231,255,.5);}
.acbT-center{overflow:hidden;}
.acbT-map-frame{position:relative;flex:1;min-height:0;border:1px solid rgba(127,231,255,.25);
  background:#02090e;overflow:hidden;box-shadow:0 0 30px rgba(0,0,0,.55),inset 0 0 44px rgba(4,20,28,.65);}
.acbT-map-head,.acbT-map-foot{position:absolute;left:10px;right:10px;display:flex;justify-content:space-between;
  gap:10px;z-index:5;pointer-events:none;font-size:7px;letter-spacing:.22em;color:rgba(127,231,255,.55);
  text-transform:uppercase;}
.acbT-map-head{top:8px;}
.acbT-map-foot{bottom:8px;color:rgba(127,231,255,.4);}
.acbT-map3d{position:absolute;inset:0;perspective:1350px;perspective-origin:50% 44%;overflow:hidden;}
.acbT-map3d-plane{position:absolute;left:50%;top:54%;width:108%;height:102%;
  transform:translate(-50%,-50%) rotateX(var(--acbT-cam-x,56deg)) rotateZ(var(--acbT-cam-z,-7deg))
    scale(var(--acbT-cam-scale,1));
  transform-origin:50% 50%;transform-style:preserve-3d;will-change:transform;
  border:1px solid rgba(127,231,255,.55);background:#031018;
  box-shadow:0 0 55px rgba(127,231,255,.22),inset 0 0 70px rgba(127,231,255,.08);}
.acbT-terrain,.acbT-map-overlay{position:absolute;inset:0;display:block;width:100%;height:100%;}
.acbT-map-overlay text{font-family:inherit;letter-spacing:.1em;}
.acbT-map-scan{position:absolute;left:0;right:0;height:2px;opacity:.4;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(127,231,255,.8),transparent);
  box-shadow:0 0 18px rgba(127,231,255,.35);
  animation:acbT-mapscan 5.5s linear infinite;}
@keyframes acbT-mapscan{from{top:-2%}to{top:102%}}
.acbT-map3d-vignette{position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(70% 65% at 50% 45%,transparent 45%,rgba(0,0,0,.5) 100%);}
.acbT-route{transition:stroke-dashoffset .5s linear;filter:drop-shadow(0 0 2px rgba(127,231,255,.65));}
.acbT-wp circle:first-child{transition:stroke .3s ease;}
.acbT-wp.acbT-current circle:first-child{animation:acbT-pulse 1.2s ease-in-out infinite;}
.acbT-lock{opacity:.18;transition:opacity .5s ease;}
.acbT-lock.acbT-locked{opacity:1;}
.acbT-threat{animation:acbT-threat 3s ease-in-out infinite;}
.acbT-threat-b{animation-delay:.8s;}
.acbT-threat-c{animation-delay:1.5s;}
@keyframes acbT-threat{0%,100%{opacity:.25}50%{opacity:.9}}
@keyframes acbT-pulse{0%,100%{opacity:.45}50%{opacity:1}}
.acbT-map-intro{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);z-index:6;
  display:flex;align-items:center;gap:8px;font-size:8px;letter-spacing:.32em;
  color:rgba(127,231,255,.65);opacity:0;transition:opacity .35s ease;white-space:nowrap;pointer-events:none;}
.acbT-map-intro.is-in{opacity:1;}
.acbT-subtitle{flex:0 0 auto;min-height:62px;display:flex;flex-direction:column;justify-content:center;gap:2px;
  padding:5px 10px;border:1px solid rgba(127,231,255,.14);background:rgba(2,8,12,.68);}
.acbT-sub-line{font-size:9px;letter-spacing:.055em;line-height:1.45;color:#d8f4ff;max-width:100ch;}
.acbT-sub-zh{font-size:9px;letter-spacing:.03em;color:rgba(255,182,72,.85);}
.acbT-cursor{display:inline-block;width:.55em;height:.95em;margin-left:2px;vertical-align:-1px;
  background:#7fe7ff;animation:acbT-blink .9s steps(1) infinite;}
.acbT-right-row{flex:0 0 auto;display:grid;grid-template-columns:1fr 1fr;gap:7px;height:150px;}
.acbT-contact,.acbT-sat{display:flex;flex-direction:column;}
.acbT-mini{position:relative;flex:1;min-height:0;overflow:hidden;border:1px solid rgba(127,231,255,.1);}
.acbT-mini svg{position:absolute;inset:0;width:100%;height:100%;}
.acbT-sat-body{display:flex;flex-direction:column;gap:3px;min-height:0;flex:1;}
.acbT-globe{position:relative;flex:1;min-height:58px;display:flex;align-items:center;justify-content:center;
  perspective:620px;overflow:hidden;}
.acbT-globe-core{position:relative;width:74px;height:74px;transform-style:preserve-3d;
  animation:acbT-globe-spin 18s linear infinite;}
.acbT-globe-ring{position:absolute;inset:0;border:1px solid rgba(127,231,255,.3);border-radius:50%;}
.acbT-globe-lat{border-color:rgba(127,231,255,.22);}
.acbT-globe-orbit{position:absolute;left:50%;top:50%;width:112px;height:112px;margin:-56px 0 0 -56px;
  border:1px solid rgba(255,182,72,.35);border-radius:50%;
  transform:rotateX(68deg) rotateZ(22deg);}
.acbT-globe-orbit:after{content:"";position:absolute;left:-2px;top:50%;width:4px;height:4px;border-radius:50%;
  background:#ffb648;box-shadow:0 0 6px rgba(255,182,72,.9);}
.acbT-globe-dot{position:absolute;left:50%;top:50%;width:3px;height:3px;margin:-1.5px 0 0 -1.5px;
  border-radius:50%;background:#7fe7ff;box-shadow:0 0 6px rgba(127,231,255,.9);}
.acbT-globe-axis{position:absolute;left:50%;top:50%;width:1px;height:120px;margin:-60px 0 0;
  background:linear-gradient(transparent,rgba(127,231,255,.25),transparent);}
@keyframes acbT-globe-spin{to{transform:rotateY(360deg)}}
.acbT-sat-rows{display:flex;flex-direction:column;gap:1px;font-size:7px;letter-spacing:.08em;
  color:rgba(127,231,255,.5);}
.acbT-sighting{flex:0 0 auto;height:196px;}
.acbT-sight-grid{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);
  gap:3px;height:calc(100% - 16px);min-height:0;}
.acbT-sight{display:flex;flex-direction:column;gap:1px;min-width:0;padding:3px;
  border:1px solid rgba(127,231,255,.14);background:rgba(4,14,20,.78);
  opacity:.3;transform:translateY(6px);transition:opacity .4s ease,transform .4s ease;}
.acbT-sight.is-in{opacity:1;transform:none;}
.acbT-sight-icon{display:flex;color:rgba(127,231,255,.75);}
.acbT-sight-icon svg{width:18px;height:18px;}
.acbT-sight-k{font-size:6px;letter-spacing:.1em;color:rgba(127,231,255,.42);}
.acbT-sight-n{font-size:7px;letter-spacing:.02em;color:#dff6ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.acbT-login{flex:1;}
.acbT-login-body{display:flex;gap:8px;height:100%;min-height:0;}
.acbT-login-avatar{flex:0 0 52px;height:52px;display:flex;align-items:center;justify-content:center;
  border:1px solid rgba(127,231,255,.28);color:#7fe7ff;font-size:12px;letter-spacing:.1em;
  background:radial-gradient(circle at 40% 30%,rgba(127,231,255,.15),rgba(3,11,16,.4));}
.acbT-login-rows{display:flex;flex-direction:column;gap:2px;font-size:7px;letter-spacing:.08em;
  color:rgba(127,231,255,.55);min-width:0;}
.acbT-login-status{margin-top:auto;color:#ffb648;font-size:8px;letter-spacing:.12em;}
.acbT-footer{flex:0 0 auto;display:flex;align-items:center;gap:12px;padding-top:4px;
  border-top:1px solid rgba(127,231,255,.15);font-size:7px;letter-spacing:.05em;color:rgba(127,231,255,.42);}
.acbT-ticker{flex:1;min-width:0;overflow:hidden;white-space:nowrap;}
.acbT-ticker span{margin-right:18px;}
.acbT-sortie{display:flex;align-items:center;gap:7px;flex:0 0 auto;}
.acbT-sortie-count{color:rgba(127,231,255,.75);}
.acbT-sortie-bar{position:relative;width:100px;height:3px;background:rgba(127,231,255,.12);overflow:hidden;}
.acbT-sortie-bar i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#2f7f99,#7fe7ff);
  box-shadow:0 0 6px rgba(127,231,255,.6);transition:width .4s linear;}
.acbT-phase{color:#ffb648;letter-spacing:.12em;}
.acbT-skip{position:absolute;left:2.5vw;bottom:1.1vh;padding:4px 9px;z-index:10;
  border:1px solid rgba(127,231,255,.28);background:rgba(2,8,12,.5);
  color:rgba(127,231,255,.6);font:inherit;font-size:8px;letter-spacing:.18em;text-transform:uppercase;
  cursor:pointer;pointer-events:auto;}
.acbT-skip:hover,.acbT-skip:focus-visible{color:#eafaff;border-color:rgba(127,231,255,.7);outline:none;
  box-shadow:0 0 10px rgba(127,231,255,.25);}
.acbT-stamp{position:absolute;left:50%;top:48%;padding:12px 28px;text-align:center;z-index:9;
  transform:translate(-50%,-50%) rotate(-3deg);border:2px solid rgba(255,182,72,.85);
  background:rgba(2,8,12,.74);box-shadow:0 0 40px rgba(255,182,72,.18),inset 0 0 24px rgba(255,182,72,.08);
  animation:acbT-stamp .5s cubic-bezier(.2,1.4,.3,1) both;}
.acbT-stamp-k{display:block;font-size:8px;letter-spacing:.4em;color:#ffb648;}
.acbT-stamp-t{display:block;margin:3px 0 2px;font-family:"Segoe UI",system-ui,sans-serif;font-weight:700;
  font-size:clamp(20px,2.6vw,40px);letter-spacing:.2em;color:#fff3d6;}
.acbT-stamp-s{display:block;font-size:8px;letter-spacing:.22em;color:rgba(255,243,214,.75);}
@keyframes acbT-stamp{0%{opacity:0;transform:translate(-50%,-50%) scale(1.45) rotate(-3deg)}
  60%{opacity:1}100%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(-3deg)}}
.acbT-flash{position:absolute;inset:0;pointer-events:none;z-index:8;
  background:radial-gradient(60% 50% at 50% 50%,rgba(234,250,255,.3),transparent 70%);
  animation:acbT-flash .45s ease-out both;}
@keyframes acbT-flash{0%{opacity:.9}100%{opacity:0}}
@media (max-width:1250px){
  .acbT-grid{grid-template-columns:minmax(170px,.8fr) minmax(0,2fr) minmax(210px,.9fr);}
  .acbT-sighting{height:170px;}
}
@media (max-width:1060px){
  .acbT-grid{grid-template-columns:minmax(170px,.8fr) minmax(0,2fr);}
  .acbT-right{display:none;}
  .acbT-mdata{display:none;}
}
@media (max-width:820px){
  .acbT-command-mis,.acbT-class{display:none;}
  .acbT-grid{grid-template-columns:1fr;}
  .acbT-left{display:none;}
  .acbT-command-title{font-size:13px;}
  .acbT-frame{left:14px;right:14px;top:4vh;bottom:4vh;}
  .acbT-subtitle{min-height:54px;}
}
@media (max-height:700px){
  .acbT-sighting{display:none;}
  .acbT-right-row{height:120px;}
  .acbT-command{padding:4px 8px;}
  .acbT-subtitle{min-height:52px;}
}
@media (prefers-reduced-motion:reduce){
  .acbT-root *{animation:none!important;}
}

/* ---------- tactical briefing integration ---------- */
.acb-scene-boot,.acb-scene-login{padding:0;}
.acb-root[data-phase="boot"] .acb-chrome,
.acb-root[data-phase="login"] .acb-chrome,
.acb-root[data-phase="title"] .acb-chrome,
.acb-root[data-phase="boot"] .acb-foot,
.acb-root[data-phase="login"] .acb-foot,
.acb-root[data-phase="title"] .acb-foot{opacity:0;}

.acb-scene-boot .acbT-frame,
.acb-scene-login .acbT-frame{opacity:0;transform:translateY(10px) scale(.995);
  transition:opacity .55s var(--acb-ease-out),transform .8s var(--acb-ease-out);}
.acb-scene-boot.is-active .acbT-frame,
.acb-scene-login.is-active .acbT-frame{opacity:1;transform:none;}

.acbT-login-overlay{position:absolute;inset:0;z-index:8;display:grid;place-items:center;
  padding:2.4vh 3%;pointer-events:none;
  background:radial-gradient(56% 58% at 50% 50%,rgba(2,7,11,.9) 0%,rgba(2,7,11,.62) 52%,transparent 78%);}
.acbT-login-overlay .acb-login-card{width:min(560px,92%);pointer-events:auto;
  box-shadow:0 40px 120px rgba(0,0,0,.72),inset 0 1px 0 rgba(208,247,255,.16);}

.acbT-title-hud{position:absolute;inset:0;z-index:5;pointer-events:none;}
.acbT-title-command{position:absolute;left:2.5vw;right:2.5vw;top:4.4vh;}
.acbT-title-side{position:absolute;top:15vh;width:min(250px,18vw);display:flex;
  flex-direction:column;gap:8px;}
.acbT-title-left{left:2.5vw;}
.acbT-title-right{right:2.5vw;}
.acbT-title-side .acbT-panel{background:linear-gradient(180deg,rgba(5,19,27,.66),rgba(2,8,12,.62));
  border-color:rgba(127,231,255,.15);box-shadow:0 0 24px rgba(0,0,0,.35);}
.acbT-title-footer{position:absolute;left:2.5vw;right:2.5vw;bottom:4.4vh;}
.acbT-title-right .acbT-contact{height:140px;}
.acbT-title-right .acbT-contact .acbT-mini{height:104px;}
.acbT-title-right .acbT-sat{height:190px;}

.acb-root[data-phase="boot"] .acb-skip,
.acb-root[data-phase="login"] .acb-skip,
.acb-root[data-phase="title"] .acb-skip{bottom:10px;left:2.5vw;}

@media (max-width:1100px){
  .acbT-title-side{display:none;}
  .acbT-title-hud .acbT-title-command{padding:5px 8px;}
  .acbT-login-overlay .acb-login-card{width:min(520px,96%);}
}

/* ---------- per-screen entry ----------
   Each later screen's entry motion starts only when that screen becomes
   active. Without this, animations would already be spent while the screen
   sits hidden, and the viewer would see an assembled screen instead of the
   reveal. */
.acb-scene-boot .acb-eyebrow,
.acb-scene-boot .acb-h2,
.acb-scene-boot .acb-sub,
.acb-scene-boot .acb-meter,
.acb-scene-boot .acb-bar i,
.acb-scene-boot .acb-boot-row,
.acb-scene-boot .acb-gauge-wrap,
.acb-scene-boot .acb-gauge-ready,
.acb-scene-login .acb-login-card,
.acb-scene-login .acb-login-row,
.acb-scene-login .acb-auth-pending,
.acb-scene-login .acb-auth-granted,
.acb-scene-login .acb-login-bar i,
.acb-scene-title .acb-title-kicker,
.acb-scene-title .acb-title-main,
.acb-scene-title .acb-title-sub,
.acb-scene-title .acb-title-rule i,
.acb-scene-title .acb-title-note,
.acb-scene-title .acb-chips span,
.acb-scene-title .acb-prompt,
.acb-scene-title .acb-auto-track i{animation:none;}

.acb-scene-boot.is-active .acb-eyebrow{animation:acb-rise .6s var(--acb-ease-out) .05s forwards;}
.acb-scene-boot.is-active .acb-h2{animation:acb-rise .8s var(--acb-ease-out) .12s forwards;}
.acb-scene-boot.is-active .acb-sub{animation:acb-rise .7s var(--acb-ease-out) .2s forwards;}
.acb-scene-boot.is-active .acb-meter{animation:acb-rise .7s var(--acb-ease-out) .28s forwards;}
.acb-scene-boot.is-active .acb-bar i{animation:acb-fill 2.55s var(--acb-ease-in-out) .25s forwards;}
.acb-scene-boot.is-active .acb-boot-row{animation:acb-row-in .6s var(--acb-ease-out) forwards;
  animation-delay:calc(.55s + var(--acb-i) * .22s);}
.acb-scene-boot.is-active .acb-gauge-wrap{animation:acb-gauge-in 1s var(--acb-ease-out) .2s forwards;}
.acb-scene-boot.is-active .acb-gauge-ready{animation:acb-granted .5s var(--acb-ease-out) 2.4s forwards;}

.acb-scene-login.is-active .acb-login-card{animation:acb-card-in .9s var(--acb-ease-out) .05s forwards;}
.acb-scene-login.is-active .acb-login-row{animation:acb-row-in .5s var(--acb-ease-out) forwards;
  animation-delay:calc(.5s + var(--acb-i) * .12s);}
.acb-scene-login.is-active .acb-auth-pending{animation:acb-pending-out .3s ease-out 1.5s forwards;}
.acb-scene-login.is-active .acb-auth-granted{animation:acb-granted .4s var(--acb-ease-out) 1.62s forwards;}
.acb-scene-login.is-active .acb-login-bar i{animation:acb-fill 2.2s var(--acb-ease-in-out) .5s forwards;}

.acb-scene-title.is-active .acb-title-kicker{animation:acb-rise .7s var(--acb-ease-out) .1s forwards;}
.acb-scene-title.is-active .acb-title-main{animation:acb-wordmark 1.2s var(--acb-ease-out) .18s forwards;}
.acb-scene-title.is-active .acb-title-sub{animation:acb-rise .9s var(--acb-ease-out) .6s forwards;}
.acb-scene-title.is-active .acb-title-rule i{animation:acb-title-rule 1.2s var(--acb-ease-out) .8s forwards;}
.acb-scene-title.is-active .acb-title-note{animation:acb-rise .8s var(--acb-ease-out) .95s forwards;}
.acb-scene-title.is-active .acb-chips span{animation:acb-rise .6s var(--acb-ease-out) forwards;
  animation-delay:calc(1.05s + var(--acb-i) * .08s);}
.acb-scene-title.is-active .acb-prompt{animation:acb-rise .7s var(--acb-ease-out) 1.4s forwards;}
.acb-scene-title.is-active .acb-auto-track i{animation:acb-auto 5s linear forwards;}

/* ---------- reduced motion ---------- */
@media (prefers-reduced-motion:reduce){
  .acb-root *{animation:none!important;}
  .acb-stars span{opacity:.55!important;}
  .acb-scene{transition-duration:.2s;}
  .acb-wordmark-main,.acb-title-main{clip-path:none!important;opacity:1!important;}
  .acb-logo-kicker,.acb-wordmark-sub,.acb-rule i,.acb-logo-tag,.acb-logo-zh,.acb-dots,
  .acb-eyebrow,.acb-h2,.acb-sub,.acb-meter,.acb-bar i,.acb-boot-row,.acb-boot-row,
  .acb-gauge-wrap,.acb-gauge-ready,.acb-login-card,.acb-login-row,.acb-auth-granted,
  .acb-title-kicker,.acb-title-sub,.acb-title-rule i,.acb-title-note,.acb-chips span,
  .acb-prompt{opacity:1!important;transform:none!important;clip-path:none!important;}
  .acb-auth-pending{display:none!important;}
  .acb-auto-track i{transform:scaleX(1)!important;}
  .acb-bar i,.acb-login-bar i{transform:scaleX(1)!important;}
}

/* ---------- responsive ---------- */
@media (max-width:900px){
  .acb-boot-wrap{grid-template-columns:1fr;gap:30px;}
  .acb-gauge-wrap{display:none;}
  .acb-logo-orbit{width:86vw;}
  .acb-chrome{padding:14px 18px;font-size:8px;}
  .acb-chrome-mid{display:none;}
  .acb-brackets{inset:8px;}
  .acb-foot{left:18px;right:18px;bottom:14px;}
  .acb-skip{left:18px;bottom:38px;}
  .acb-scene{padding:9vh 6vw 12vh;}
  .acb-login-body{grid-template-columns:1fr;justify-items:center;text-align:center;padding:24px 20px;}
  .acb-login-list{align-items:flex-start;}
  .acb-ghost{right:-10vw;top:-8vh;font-size:52vw;}
}
@media (max-width:560px){
  .acb-wordmark{font-size:13vw;letter-spacing:.12em;}
  .acb-wordmark-sub span{letter-spacing:.5em;}
  .acb-boot-row{grid-template-columns:28px 1fr 36px;}
  .acb-boot-label em{display:none;}
  .acb-chips{gap:6px;}
}

/* =====================================================================
   v5 — deep-space tactical grade
   Near-black levels, ice/cyan key light, ember rim light, holographic
   projection layers, film grain and an AC-style HUD frame.
   ===================================================================== */
.acb-root{
  --acb-bg:#010204;
  --acb-ink:#f4fcff;
  --acb-mute:rgba(196,230,242,.6);
  --acb-faint:rgba(111,231,255,.14);
  --acb-cyan:#6fe7ff;
  --acb-cyan-soft:rgba(111,231,255,.32);
  --acb-amber:#ff9e3d;
  --acb-ember:#ff6a1f;
  --acb-red:#ff4b3e;
  background:
    radial-gradient(120% 100% at 50% 28%,#031019 0%,#01060b 54%,#000203 100%);
}
.acb-root::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;
  background:
    linear-gradient(90deg,rgba(255,106,31,.05),transparent 16%,transparent 84%,rgba(255,106,31,.04)),
    radial-gradient(58% 42% at 50% 110%,rgba(111,231,255,.06),transparent 72%);}
.acb-stars span{background:#ecfdff;box-shadow:0 0 5px rgba(111,231,255,.72);}
.acb-aurora{background:
    radial-gradient(48% 38% at 16% 18%,rgba(12,92,128,.24),transparent 66%),
    radial-gradient(42% 34% at 84% 26%,rgba(66,34,112,.18),transparent 70%),
    radial-gradient(60% 46% at 50% 108%,rgba(255,106,31,.08),transparent 62%);
  filter:saturate(1.18);}
.acb-ember{position:absolute;left:-22%;bottom:-40%;width:96vw;height:92vh;z-index:0;
  pointer-events:none;mix-blend-mode:screen;filter:blur(30px);
  background:radial-gradient(50% 50% at 50% 50%,rgba(255,106,31,.22),rgba(110,32,6,.06) 56%,transparent 74%);
  animation:acb-emberPulse 13s ease-in-out infinite alternate;}
@keyframes acb-emberPulse{from{transform:translate3d(-2%,2%,0) scale(.94);opacity:.62}
  to{transform:translate3d(2%,-1%,0) scale(1.05);opacity:1}}
.acb-haze{position:absolute;inset:-12%;z-index:0;pointer-events:none;filter:blur(34px);
  background:
    radial-gradient(46% 34% at 52% 62%,rgba(36,118,148,.08),transparent 70%),
    linear-gradient(180deg,transparent 44%,rgba(0,2,4,.44) 100%);
  animation:acb-hazeDrift 18s ease-in-out infinite alternate;}
@keyframes acb-hazeDrift{from{transform:translate3d(-1.4%,0,0) scale(1)}
  to{transform:translate3d(1.6%,-1.2%,0) scale(1.04)}}
.acb-holo-globe{position:absolute;left:50%;top:46%;width:78vmin;height:78vmin;z-index:0;
  pointer-events:none;opacity:.17;mix-blend-mode:screen;transform-style:preserve-3d;
  transform:translate(-50%,-50%) rotateX(18deg) rotateZ(-12deg) scale(.96);
  animation:acb-holoDrift 20s ease-in-out infinite alternate;}
@keyframes acb-holoDrift{from{transform:translate(-50%,-50%) rotateX(18deg) rotateZ(-12deg) scale(.95)}
  to{transform:translate(-50%,-47%) rotateX(14deg) rotateZ(-5deg) scale(1.03)}}
.acb-holo-globe i{position:absolute;inset:0;border-radius:50%;
  border:1px solid rgba(111,231,255,.42);
  box-shadow:0 0 9px rgba(111,231,255,.12);}
.acb-holo-globe .acb-holo-lat{border-color:rgba(255,158,61,.32);}
.acb-holo-orbit{position:absolute;inset:-9%;border-radius:50%;
  border:1px solid rgba(255,154,60,.5);
  transform:rotateX(72deg) rotateZ(18deg);
  box-shadow:0 0 36px rgba(255,106,31,.16);}
.acb-lens{position:absolute;left:0;top:36%;width:100%;height:1px;z-index:3;
  pointer-events:none;mix-blend-mode:screen;opacity:.66;filter:blur(.4px);
  background:linear-gradient(90deg,transparent,rgba(111,231,255,.06) 8%,rgba(111,231,255,.62) 34%,#fff 50%,rgba(255,154,60,.5) 64%,transparent 92%);
  box-shadow:0 0 26px 3px rgba(111,231,255,.16);
  animation:acb-lens 7s ease-in-out infinite alternate;}
@keyframes acb-lens{from{transform:translate3d(-1.5%,0,0) scaleX(.96);opacity:.36}
  to{transform:translate3d(1.5%,0,0) scaleX(1.04);opacity:.78}}
.acb-beam{position:absolute;top:-22%;left:62%;width:18vw;height:140%;z-index:1;
  pointer-events:none;filter:blur(8px);transform:skewX(-12deg);
  background:linear-gradient(90deg,transparent,rgba(111,231,255,.025),rgba(111,231,255,.075),transparent);
  animation:acb-beamSweep 15s ease-in-out infinite alternate;}
@keyframes acb-beamSweep{from{transform:skewX(-12deg) translate3d(-9vw,0,0);opacity:.4}
  to{transform:skewX(-12deg) translate3d(7vw,0,0);opacity:.82}}
.acb-grain{position:absolute;inset:-18%;z-index:30;pointer-events:none;opacity:.06;
  mix-blend-mode:overlay;
  background-image:
    repeating-radial-gradient(circle at 17% 32%,rgba(255,255,255,.6) 0 .5px,transparent .8px 3px),
    repeating-radial-gradient(circle at 73% 61%,rgba(255,255,255,.45) 0 .5px,transparent .8px 4px);
  background-size:5px 5px,7px 7px;
  animation:acb-grainShift 1.4s steps(3) infinite;}
@keyframes acb-grainShift{0%{transform:translate3d(0,0,0)}33%{transform:translate3d(-1.4%,1%,0)}
  66%{transform:translate3d(1.1%,-.7%,0)}100%{transform:translate3d(0,0,0)}}
.acb-cine{position:absolute;inset:14px;z-index:29;pointer-events:none;
  border:1px solid rgba(111,231,255,.1);}
.acb-cine::before,.acb-cine::after{content:"";position:absolute;width:42px;height:42px;
  border:1px solid rgba(255,154,60,.62);}
.acb-cine::before{left:-1px;top:-1px;border-right:0;border-bottom:0;}
.acb-cine::after{right:-1px;bottom:-1px;border-left:0;border-top:0;}
.acb-scanlines{z-index:28;opacity:.42;
  background:repeating-linear-gradient(0deg,rgba(111,231,255,.045) 0 1px,transparent 1px 4px);}
.acb-vignette{z-index:27;
  background:radial-gradient(68% 60% at 50% 45%,transparent 30%,rgba(0,0,0,.8) 100%);}
.acb-planet-sphere{background:
    radial-gradient(120% 22% at 50% 0%,rgba(190,250,255,.46),rgba(28,108,138,.1) 34%,transparent 56%),
    radial-gradient(100% 100% at 50% 0%,#04131d 0%,#020a11 24%,#010507 56%,#000102 100%);
  box-shadow:0 0 190px 18px rgba(111,231,255,.1),inset 0 80px 160px rgba(111,231,255,.05);}
.acb-planet-rim{background:linear-gradient(90deg,transparent,rgba(255,190,120,.9) 22%,rgba(224,251,255,.96) 50%,rgba(255,112,44,.78) 78%,transparent);
  box-shadow:0 0 44px 10px rgba(255,112,44,.24);}
.acb-flare{background:radial-gradient(44% 32% at 50% 17%,rgba(111,231,255,.13),transparent 70%);}
.acb-chrome{background:linear-gradient(180deg,rgba(0,2,4,.94),rgba(0,2,4,.18));border-bottom:1px solid rgba(111,231,255,.16);}
.acb-chrome-title{color:#f4fcff;text-shadow:0 0 26px rgba(111,231,255,.3);}
.acb-chrome .acb-rec,.acb-rec{color:#ffb877;}
.acb-foot{border-top:1px solid rgba(111,231,255,.2);color:rgba(196,230,242,.52);
  background:linear-gradient(0deg,rgba(0,2,4,.92),transparent);}
.acb-skip{background:rgba(0,2,4,.72);border-color:rgba(111,231,255,.32);color:#dff8ff;}

/* logo */
.acb-logo-reticle{position:absolute;left:50%;top:50%;width:min(66vw,760px);aspect-ratio:1;
  transform:translate(-50%,-50%);border:1px solid rgba(111,231,255,.13);border-radius:50%;
  pointer-events:none;}
.acb-logo-reticle::before{content:"";position:absolute;inset:9%;border-radius:50%;
  border:1px dashed rgba(111,231,255,.1);animation:acb-rotate 60s linear infinite;}
.acb-logo-reticle::after{content:"";position:absolute;left:50%;top:-7%;width:1px;height:14%;
  background:linear-gradient(180deg,rgba(255,154,60,.7),transparent);}
.acb-logo-reticle i{position:absolute;width:9px;height:9px;border:1px solid rgba(255,154,60,.62);}
.acb-logo-reticle i:nth-child(1){left:0;top:0;border-right:0;border-bottom:0;}
.acb-logo-reticle i:nth-child(2){right:0;top:0;border-left:0;border-bottom:0;}
.acb-logo-reticle i:nth-child(3){left:0;bottom:0;border-right:0;border-top:0;}
.acb-logo-reticle i:nth-child(4){right:0;bottom:0;border-left:0;border-top:0;}
.acb-logo-hudtop{position:absolute;left:0;right:0;top:-15vh;display:flex;align-items:center;
  justify-content:space-between;font-size:8px;letter-spacing:.3em;color:rgba(196,230,242,.42);}
.acb-logo-hudtop span:last-child{color:rgba(255,154,60,.62);}
.acb-logo-op{margin-top:12px;font-size:9px;letter-spacing:.42em;color:rgba(255,158,61,.82);
  text-shadow:0 0 24px rgba(255,106,31,.3);}
.acb-logo-meter{display:flex;align-items:center;gap:10px;margin-top:22px;width:min(300px,42vw);
  font-size:7px;letter-spacing:.26em;color:rgba(196,230,242,.4);}
.acb-logo-meter i{flex:1;height:1px;position:relative;overflow:hidden;background:rgba(111,231,255,.14);}
.acb-logo-meter i::after{content:"";position:absolute;inset:0;transform-origin:left;
  background:linear-gradient(90deg,transparent,#9fefff,#ffb877);
  animation:acb-meter 2.2s var(--acb-ease-in-out) .3s forwards;}
@keyframes acb-meter{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.acb-logo-meter b{color:#9fefff;font-weight:500;}
.acb-wordmark-main{position:relative;display:inline-block;
  background:linear-gradient(180deg,#fff 0%,#f4fdff 22%,#c9f7ff 42%,#4d93a8 52%,#9feaff 60%,#fff 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  text-shadow:0 0 34px rgba(111,231,255,.24),0 0 90px rgba(111,231,255,.1);}
.acb-wordmark-main::before,.acb-wordmark-main::after{content:attr(data-text);position:absolute;
  inset:0;-webkit-background-clip:initial;background-clip:initial;background:none;
  -webkit-text-fill-color:currentColor;color:rgba(111,231,255,.72);
  clip-path:inset(18% 0 62% 0);mix-blend-mode:screen;opacity:.68;pointer-events:none;
  animation:acb-glitch 6.4s steps(1) infinite;}
.acb-wordmark-main::after{color:rgba(255,106,31,.6);clip-path:inset(58% 0 22% 0);
  animation-delay:.7s;}
@keyframes acb-glitch{0%,88%,100%{transform:translate3d(0,0,0);opacity:0}
  89%{transform:translate3d(-5px,0,0);opacity:.72}91%{transform:translate3d(4px,0,0);opacity:.5}
  93%{transform:translate3d(0,0,0);opacity:0}}
.acb-wordmark-sub{color:#ffb877;text-shadow:0 0 28px rgba(255,106,31,.28);}
.acb-rule i{background:linear-gradient(90deg,transparent,rgba(255,154,60,.9),rgba(111,231,255,.9),transparent);}
.acb-logo-tag{color:rgba(196,230,242,.58);}
.acb-dots span{background:rgba(255,154,60,.75);box-shadow:0 0 8px rgba(255,106,31,.5);}

/* login — dark hologram card, not a pale modal */
.acb-login-card{
  border:1px solid rgba(111,231,255,.4);
  background:linear-gradient(150deg,rgba(2,9,14,.985),rgba(0,3,6,.99) 52%,rgba(1,5,8,.99));
  box-shadow:0 50px 140px rgba(0,0,0,.82),0 0 70px rgba(111,231,255,.1),
    inset 0 1px 0 rgba(220,250,255,.16),inset 0 0 90px rgba(255,106,31,.035);
  clip-path:polygon(0 0,calc(100% - 26px) 0,100% 26px,100% 100%,26px 100%,0 calc(100% - 26px));}
.acb-login-card::before,.acb-login-card::after{width:42px;height:42px;border-color:rgba(255,154,60,.66);}
.acb-login-scan{position:absolute;left:0;right:0;top:0;height:1px;z-index:3;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(190,250,255,.92),transparent);
  box-shadow:0 0 22px rgba(111,231,255,.55);animation:acb-loginScan 3.8s var(--acb-ease-in-out) infinite;}
@keyframes acb-loginScan{0%{transform:translateY(0);opacity:0}
  8%{opacity:.9}86%{opacity:.9}100%{transform:translateY(360px);opacity:0}}
.acb-login-stripe{display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:5px 14px;font-size:7px;letter-spacing:.28em;font-weight:600;
  color:#070a0c;background:linear-gradient(90deg,rgba(255,158,61,.95),rgba(255,106,31,.82));}
.acb-login-head{background:linear-gradient(180deg,rgba(2,10,16,.92),rgba(0,3,6,.5));
  border-bottom:1px solid rgba(111,231,255,.16);}
.acb-login-kicker{color:#f2fbff;text-shadow:0 0 24px rgba(111,231,255,.3);}
.acb-login-badge{color:rgba(255,158,61,.9);}
.acb-welcome{color:#f4fcff;text-shadow:0 0 34px rgba(111,231,255,.24);}
.acb-eyebrow{color:rgba(255,158,61,.86);}
.acb-sub{color:rgba(196,230,242,.62);}
.acb-avatar{border-color:rgba(255,154,60,.4);
  background:radial-gradient(circle at 50% 35%,rgba(10,42,56,.9),rgba(0,3,6,.98) 72%);
  box-shadow:0 0 46px rgba(111,231,255,.12),0 0 26px rgba(255,106,31,.1),inset 0 0 26px rgba(111,231,255,.06);}
.acb-avatar-ring{border-color:rgba(111,231,255,.34);}
.acb-avatar-ring::after{border-color:rgba(255,154,60,.26);}
.acb-avatar-mark{color:#f4fcff;text-shadow:0 0 20px rgba(111,231,255,.5),0 0 40px rgba(255,106,31,.2);}
.acb-check{background:#9fefff;box-shadow:0 0 9px rgba(111,231,255,.8);}
.acb-login-row-copy b{color:rgba(236,252,255,.94);}
.acb-login-row-copy em{color:rgba(196,230,242,.42);}
.acb-login-foot{border-top-color:rgba(111,231,255,.14);
  background:linear-gradient(0deg,rgba(0,2,4,.5),transparent);}
.acb-auth-pending{color:rgba(255,158,61,.95);}
.acb-auth-granted{color:#8affd1;text-shadow:0 0 18px rgba(111,255,190,.6);}
.acb-login-bar{background:rgba(111,231,255,.14);}
.acb-login-bar i{background:linear-gradient(90deg,transparent,#9fefff,#ffb877);}

/* tactical console — deeper blacks, amber rim */
.acbT-frame{background:transparent;}
.acbT-command{background:linear-gradient(180deg,rgba(0,2,4,.97),rgba(0,2,4,.56));
  border-bottom:1px solid rgba(111,231,255,.22);
  box-shadow:0 1px 0 rgba(255,106,31,.14);}
.acbT-command-title{color:#fff;text-shadow:0 0 26px rgba(111,231,255,.32);letter-spacing:.16em;}
.acbT-command-op{color:rgba(255,158,61,.86);}
.acbT-command-mis{color:rgba(196,230,242,.5);}
.acbT-rec{color:#ffb877;text-shadow:0 0 12px rgba(255,106,31,.6);}
.acbT-class{color:#ffd7a8;border-color:rgba(255,158,61,.45);background:rgba(255,106,31,.08);}
.acbT-tc{color:#eafcff;text-shadow:0 0 16px rgba(111,231,255,.35);}
.acbT-panel{background:linear-gradient(180deg,rgba(1,6,10,.94),rgba(0,3,6,.96));
  border:1px solid rgba(111,231,255,.24);
  box-shadow:inset 0 0 32px rgba(111,231,255,.03),0 10px 30px rgba(0,0,0,.36);}
.acbT-panel-h{border-bottom-color:rgba(111,231,255,.16);color:#ecfcff;
  background:linear-gradient(180deg,rgba(10,30,40,.38),transparent);
  text-shadow:0 0 16px rgba(111,231,255,.22);}
.acbT-panel-h span:last-child{color:rgba(255,158,61,.88);}
.acbT-map-frame{background:#000305;border:1px solid rgba(111,231,255,.3);
  box-shadow:inset 0 0 70px rgba(0,0,0,.82),0 0 36px rgba(111,231,255,.05);}
.acbT-map-head{background:linear-gradient(180deg,rgba(0,2,4,.92),transparent);
  border-bottom:1px solid rgba(111,231,255,.12);color:rgba(196,230,242,.62);}
.acbT-map3d{background:radial-gradient(80% 70% at 50% 42%,#020b10 0%,#000305 68%,#000 100%);}
.acbT-map3d-plane{background:#000406;border:1px solid rgba(255,154,60,.38);
  box-shadow:0 0 50px rgba(111,231,255,.16),0 0 88px rgba(255,106,31,.055),
    inset 0 0 60px rgba(111,231,255,.04);}
.acbT-map3d-plane::after{content:"";position:absolute;inset:6px;pointer-events:none;
  border:1px solid rgba(111,231,255,.16);}
.acbT-terrain{filter:contrast(1.16) brightness(.74) saturate(1.3);}
.acbT-map3d-vignette{background:radial-gradient(70% 60% at 50% 48%,transparent 28%,rgba(0,0,0,.72) 100%);}
.acbT-map-frame::after{content:"";position:absolute;inset:0;z-index:3;pointer-events:none;
  background:
    linear-gradient(90deg,transparent 49.9%,rgba(111,231,255,.1) 50%,transparent 50.1%),
    linear-gradient(0deg,transparent 49.9%,rgba(111,231,255,.08) 50%,transparent 50.1%);
  mix-blend-mode:screen;}
.acbT-map-scan{background:linear-gradient(180deg,transparent,rgba(180,248,255,.12),transparent);
  opacity:.8;}
.acbT-oplogs{color:rgba(196,230,242,.48);}
.acbT-opstate.is-ok{color:#8affd1;text-shadow:0 0 16px rgba(111,255,190,.3);}
.acbT-progress{background:rgba(111,231,255,.12);}
.acbT-progress i{background:linear-gradient(90deg,rgba(111,231,255,.35),#9fefff,#ffb877);}
.acbT-meter span{color:rgba(196,230,242,.55);}
.acbT-sight{background:rgba(1,6,10,.86);border-color:rgba(111,231,255,.18);}
.acbT-sight-icon{color:rgba(255,158,61,.8);}
.acbT-mini rect{fill:rgba(1,5,8,.82);}
.acbT-globe{filter:drop-shadow(0 0 18px rgba(111,231,255,.12));}
.acbT-tgt-row{border-bottom-color:rgba(111,231,255,.08);}
.acbT-tgt-en{color:#eafcff;}
.acbT-tgt-code{color:rgba(255,158,61,.8);}
.acbT-title-side .acbT-panel{background:linear-gradient(180deg,rgba(1,6,10,.88),rgba(0,3,6,.92));}
.acbT-title-command{background:linear-gradient(180deg,rgba(0,2,4,.94),rgba(0,2,4,.4));}
.acbT-footer{background:linear-gradient(0deg,rgba(0,2,4,.94),transparent);
  border-top:1px solid rgba(111,231,255,.16);}
.acbT-sortie-bar{background:rgba(111,231,255,.14);}
.acbT-sortie-bar i{background:linear-gradient(90deg,#9fefff,#ffb877);}

/* title */
.acb-title-flare{position:absolute;left:50%;top:41%;width:120vw;height:42vh;z-index:1;
  transform:translate(-50%,-50%);pointer-events:none;mix-blend-mode:screen;filter:blur(22px);
  background:
    radial-gradient(50% 50% at 50% 50%,rgba(255,106,31,.17),transparent 66%),
    linear-gradient(90deg,transparent,rgba(111,231,255,.08),transparent);}
.acb-title-main{background:linear-gradient(180deg,#fff 0%,#f3fdff 24%,#c9f7ff 44%,#4d93a8 52%,#9feaff 58%,#fff 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 18px 50px rgba(0,0,0,.7));}
.acb-title-sub{color:#ffb877;text-shadow:0 0 36px rgba(255,106,31,.3);}
.acb-title-kicker{color:rgba(196,230,242,.56);}
.acb-title-rule i{background:linear-gradient(90deg,transparent,rgba(255,154,60,.9),rgba(111,231,255,.9),transparent);}
.acb-title-note{color:rgba(196,230,242,.72);}
.acb-ghost{color:rgba(111,231,255,.045);text-shadow:0 0 80px rgba(111,231,255,.06);}
.acb-chips span{border-color:rgba(255,158,61,.3);background:rgba(1,5,8,.66);
  color:rgba(220,246,255,.72);}
.acb-prompt{color:rgba(244,252,255,.84);}
.acb-prompt-key{border-color:rgba(255,154,60,.5);color:#ffcf9e;}
.acb-prompt-caret{background:#ffb877;}
.acb-auto{color:rgba(196,230,242,.4);}
.acb-auto-track{background:rgba(111,231,255,.14);}
.acb-auto-track i{background:linear-gradient(90deg,rgba(111,231,255,.25),#9fefff,#ffb877);}

@media (max-width:900px){
  .acb-holo-globe{opacity:.1;}
  .acb-grain{opacity:.04;}
  .acb-logo-hudtop{top:-10vh;font-size:7px;}
  .acb-login-card{clip-path:none;}
}
@media (prefers-reduced-motion:reduce){
  .acb-ember,.acb-haze,.acb-holo-globe,.acb-lens,.acb-beam,.acb-grain,
  .acb-login-scan,.acb-logo-meter i::after,.acb-wordmark-main::before,
  .acb-wordmark-main::after{animation:none!important;}
  .acb-ember,.acb-haze,.acb-holo-globe,.acb-lens,.acb-beam{opacity:.3;}
  .acb-grain{display:none;}
  .acb-login-scan{display:none;}
}

/* =====================================================================
   v6 — spatial field, layered light, map depth
   ===================================================================== */
.acb-space{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden;}
.acb-space-canvas{position:absolute;inset:0;display:block;width:100%;height:100%;}
.acb-space-far{filter:blur(1.15px) saturate(.9);opacity:.72;}
.acb-space-mid{opacity:.94;}
.acb-light-rig{position:absolute;inset:0;z-index:2;pointer-events:none;
  mix-blend-mode:screen;contain:layout paint;}
.acb-light-rig i{position:absolute;left:50%;top:47%;border-radius:50%;
  pointer-events:none;transform:translate(-50%,-50%);}
.acb-light-core{width:8px;height:8px;background:#f4ffff;
  box-shadow:0 0 18px 6px rgba(190,250,255,.95),0 0 70px 24px rgba(111,231,255,.42),
    0 0 150px 60px rgba(60,160,200,.18);
  opacity:0;animation:acbLightCore 15s var(--acb-ease-in-out) both;}
.acb-light-near{width:30vmin;height:30vmin;filter:blur(18px);
  background:radial-gradient(circle,rgba(170,246,255,.34),rgba(78,188,226,.1) 42%,transparent 72%);
  opacity:0;animation:acbLightNear 15s var(--acb-ease-in-out) both;}
.acb-light-wide{width:105vmin;height:105vmin;filter:blur(38px);
  background:radial-gradient(circle,rgba(80,188,230,.13),rgba(38,100,135,.045) 44%,transparent 70%);
  opacity:0;animation:acbLightWide 15s var(--acb-ease-in-out) both;}
.acb-light-haze{width:150vmin;height:120vmin;filter:blur(52px);
  background:radial-gradient(ellipse at center,rgba(58,150,190,.08),transparent 66%);
  opacity:0;animation:acbLightHaze 15s var(--acb-ease-in-out) both;}
.acb-light-shaft{width:130vmin;height:4.8vmin;border-radius:40%;
  background:linear-gradient(90deg,transparent,rgba(148,240,255,.1),rgba(148,240,255,.02),transparent);
  filter:blur(15px);opacity:0;}
.acb-light-shaft-a{transform:translate(-50%,-50%) rotate(24deg);
  animation:acbLightShaftA 15s var(--acb-ease-in-out) both;}
.acb-light-shaft-b{transform:translate(-50%,-50%) rotate(-28deg);
  animation:acbLightShaftB 15s var(--acb-ease-in-out) both;}
@keyframes acbLightCore{
  0%,5%{opacity:0;transform:translate(-50%,-50%) scale(.45)}
  12%{opacity:.9;transform:translate(-50%,-50%) scale(1)}
  26%{opacity:.58;transform:translate(-50%,-50%) scale(.86)}
  40%{opacity:.82;transform:translate(-50%,-50%) scale(1.08)}
  55%{opacity:.46;transform:translate(-50%,-50%) scale(.94)}
  66%{opacity:1;transform:translate(-50%,-50%) scale(1.12)}
  86%{opacity:.62;transform:translate(-50%,-50%) scale(.9)}
  100%{opacity:.32;transform:translate(-50%,-50%) scale(.8)}
}
@keyframes acbLightNear{
  0%,8%{opacity:0;transform:translate(-50%,-50%) scale(.7)}
  16%{opacity:.62;transform:translate(-50%,-50%) scale(1)}
  36%{opacity:.38;transform:translate(-50%,-50%) scale(1.08)}
  48%{opacity:.66;transform:translate(-50%,-50%) scale(.96)}
  68%{opacity:.5;transform:translate(-50%,-50%) scale(1.12)}
  100%{opacity:.26;transform:translate(-50%,-50%) scale(.88)}
}
@keyframes acbLightWide{
  0%,12%{opacity:0;transform:translate(-50%,-50%) scale(.82)}
  23%{opacity:.27;transform:translate(-50%,-50%) scale(.98)}
  40%{opacity:.16;transform:translate(-50%,-50%) scale(1.08)}
  56%{opacity:.23;transform:translate(-50%,-50%) scale(1)}
  76%{opacity:.14;transform:translate(-50%,-50%) scale(1.14)}
  100%{opacity:.08;transform:translate(-50%,-50%) scale(1)}
}
@keyframes acbLightHaze{
  0%,10%{opacity:0;transform:translate(-50%,-50%) scale(.92)}
  30%{opacity:.5;transform:translate(-50%,-50%) scale(1)}
  58%{opacity:.38;transform:translate(-50%,-50%) scale(1.04)}
  100%{opacity:.22;transform:translate(-50%,-50%) scale(1)}
}
@keyframes acbLightShaftA{
  0%,18%{opacity:0}
  30%{opacity:.32}
  46%{opacity:.18}
  62%{opacity:.36}
  82%{opacity:.16}
  100%{opacity:.08}
}
@keyframes acbLightShaftB{
  0%,22%{opacity:0}
  34%{opacity:.24}
  52%{opacity:.14}
  68%{opacity:.28}
  86%{opacity:.12}
  100%{opacity:.06}
}

/* map depth: a second, slower plane + a local key light */
.acbT-map-base{position:absolute;left:50%;top:52%;width:118%;height:110%;z-index:0;
  transform-origin:50% 50%;border:1px solid rgba(111,231,255,.1);
  background-image:
    repeating-linear-gradient(90deg,rgba(111,231,255,.075) 0 1px,transparent 1px 46px),
    repeating-linear-gradient(0deg,rgba(111,231,255,.055) 0 1px,transparent 1px 46px);
  box-shadow:inset 0 0 90px rgba(0,0,0,.72);
  filter:blur(1.4px);opacity:.34;
  transform:translate(-50%,-50%) rotateX(63deg) rotateZ(-10deg) scale(1.01);
  animation:acbTBaseCam 16s var(--acb-ease-in-out) both;}
@keyframes acbTBaseCam{
  from{transform:translate(-50%,-50%) rotateX(64deg) rotateZ(-10deg) scale(1)}
  to{transform:translate(-50%,-50%) rotateX(58deg) rotateZ(-4deg) scale(1.07)}
}
.acbT-map3d-plane{animation:acbTPlaneCam 16s var(--acb-ease-in-out) both;}
@keyframes acbTPlaneCam{
  from{transform:translate(-50%,-50%) rotateX(58deg) rotateZ(-8deg) scale(.985)}
  to{transform:translate(-50%,-50%) rotateX(51deg) rotateZ(-3deg) scale(1.045)}
}
.acbT-map-light{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden;}
.acbT-map-light i{position:absolute;left:50%;top:50%;border-radius:50%;
  transform:translate(-50%,-50%);mix-blend-mode:screen;pointer-events:none;}
.acbT-map-wide{width:120%;height:120%;filter:blur(30px);
  background:radial-gradient(circle,rgba(76,190,230,.17),rgba(28,88,120,.05) 44%,transparent 70%);
  opacity:0;animation:acbMapWide 15s var(--acb-ease-in-out) both;}
.acbT-map-halo{width:46%;height:46%;filter:blur(16px);
  background:radial-gradient(circle,rgba(180,246,255,.3),rgba(70,180,215,.08) 44%,transparent 72%);
  opacity:0;animation:acbMapHalo 15s var(--acb-ease-in-out) both;}
.acbT-map-core{width:10px;height:10px;background:#f2ffff;
  box-shadow:0 0 22px 8px rgba(190,250,255,.9),0 0 70px 26px rgba(111,231,255,.35);
  opacity:0;animation:acbMapCore 15s var(--acb-ease-in-out) both;}
.acbT-map-shaft{width:160%;height:10%;left:50%;top:50%;filter:blur(14px);
  background:linear-gradient(90deg,transparent,rgba(148,240,255,.075),transparent);
  transform:translate(-50%,-50%) rotate(-16deg);opacity:0;
  animation:acbMapShaft 15s var(--acb-ease-in-out) both;}
@keyframes acbMapWide{
  0%,8%{opacity:0;transform:translate(-50%,-50%) scale(.85)}
  24%{opacity:.4;transform:translate(-50%,-50%) scale(1)}
  46%{opacity:.24;transform:translate(-50%,-50%) scale(1.06)}
  66%{opacity:.34;transform:translate(-50%,-50%) scale(1)}
  100%{opacity:.16;transform:translate(-50%,-50%) scale(1.08)}
}
@keyframes acbMapHalo{
  0%,10%{opacity:0;transform:translate(-50%,-50%) scale(.7)}
  22%{opacity:.55;transform:translate(-50%,-50%) scale(1)}
  44%{opacity:.32;transform:translate(-50%,-50%) scale(1.1)}
  64%{opacity:.48;transform:translate(-50%,-50%) scale(1)}
  100%{opacity:.22;transform:translate(-50%,-50%) scale(.92)}
}
@keyframes acbMapCore{
  0%,6%{opacity:0;transform:translate(-50%,-50%) scale(.4)}
  18%{opacity:.9;transform:translate(-50%,-50%) scale(1)}
  34%{opacity:.5;transform:translate(-50%,-50%) scale(.85)}
  52%{opacity:.8;transform:translate(-50%,-50%) scale(1.1)}
  74%{opacity:.5;transform:translate(-50%,-50%) scale(.92)}
  100%{opacity:.3;transform:translate(-50%,-50%) scale(.8)}
}
@keyframes acbMapShaft{
  0%,20%{opacity:0}
  34%{opacity:.3}
  52%{opacity:.16}
  68%{opacity:.26}
  100%{opacity:.08}
}

@media (max-width:900px){
  .acb-space-far{opacity:.5;}
  .acb-light-wide{width:130vmin;height:130vmin;}
  .acb-light-haze{width:180vmin;}
  .acbT-map-base{opacity:.22;}
}
@media (prefers-reduced-motion:reduce){
  .acb-light-core,.acb-light-near,.acb-light-wide,.acb-light-haze,
  .acb-light-shaft-a,.acb-light-shaft-b,.acbT-map-wide,.acbT-map-halo,
  .acbT-map-core,.acbT-map-shaft,.acbT-map-base,.acbT-map3d-plane{animation:none!important;}
  .acb-light-core{opacity:.85;}
  .acb-light-near{opacity:.5;}
  .acb-light-wide{opacity:.2;}
  .acb-light-haze{opacity:.4;}
  .acb-light-shaft-a{opacity:.16;}
  .acb-light-shaft-b{opacity:.12;}
  .acbT-map-wide{opacity:.32;}
  .acbT-map-halo{opacity:.46;}
  .acbT-map-core{opacity:.86;}
  .acbT-map-shaft{opacity:.2;}
  .acbT-map-base{transform:translate(-50%,-50%) rotateX(60deg) rotateZ(-7deg) scale(1.02);}
  .acbT-map3d-plane{transform:translate(-50%,-50%) rotateX(55deg) rotateZ(-6deg) scale(1.01);}
}
.acb-root.acb-static .acb-light-core{opacity:.85;}
.acb-root.acb-static .acb-light-near{opacity:.5;}
.acb-root.acb-static .acb-light-wide{opacity:.2;}
.acb-root.acb-static .acb-light-haze{opacity:.4;}
.acb-root.acb-static .acb-light-shaft-a{opacity:.16;}
.acb-root.acb-static .acb-light-shaft-b{opacity:.12;}
.acb-root.acb-static .acbT-map-wide{opacity:.32;}
.acb-root.acb-static .acbT-map-halo{opacity:.46;}
.acb-root.acb-static .acbT-map-core{opacity:.86;}
.acb-root.acb-static .acbT-map-shaft{opacity:.2;}

/* =====================================================================
   v7 — deep interior tonal hierarchy
   Four explicit tones: void black -> black-blue -> deep navy -> teal.
   Cyan is only information light; amber is only warning/key accent.
   ===================================================================== */
.acb-root{
  --acb-bg:#000103;
  --acb-deep:#000205;
  --acb-navy:#01060b;
  --acb-navy-2:#020d14;
  --acb-teal:#06202a;
  --tone-line:rgba(76,148,174,.24);
  --tone-dim:#6f96a5;
  --tone-text:#e9faff;
  --tone-amber:#ff9e3d;
  background:
    radial-gradient(120% 90% at 50% 24%,#020b12 0%,#010408 52%,#000102 100%);
}
.acb-space-far{opacity:.55;filter:blur(1.15px) saturate(.8) brightness(.82);}
.acb-space-mid{opacity:.82;filter:saturate(.95) brightness(.92) contrast(1.08);}
.acb-holo-globe{opacity:.11;}
.acb-aurora{filter:saturate(1.08) brightness(.86);}
.acbT-frame{
  --tone-void:#000103;
  --tone-black:#01060b;
  --tone-navy:#020d14;
  --tone-teal:#06202a;
  --tone-line:rgba(76,148,174,.24);
  --tone-dim:#6f96a5;
  --tone-text:#e9faff;
  --tone-amber:#ff9e3d;
  background:
    radial-gradient(120% 100% at 50% 32%,rgba(1,7,11,.16) 0%,rgba(0,1,3,.46) 66%,rgba(0,1,3,.72) 100%);
}
.acbT-command{
  background:linear-gradient(180deg,rgba(0,2,4,.99),rgba(0,3,6,.78));
  border-bottom:1px solid var(--tone-line);
  box-shadow:0 1px 0 rgba(255,106,31,.1);
}
.acbT-command-title{color:#f5feff;text-shadow:0 0 26px rgba(76,180,210,.25);}
.acbT-command-op{color:rgba(255,158,61,.82);}
.acbT-command-mis{color:var(--tone-dim);}
.acbT-rec{color:rgba(255,158,61,.72);}
.acbT-class{color:rgba(255,200,140,.86);border-color:rgba(255,158,61,.34);
  background:rgba(255,106,31,.06);}
.acbT-tc{color:#dcf6ff;text-shadow:0 0 14px rgba(76,180,210,.25);}
.acbT-panel{
  background:linear-gradient(180deg,rgba(0,5,9,.985),rgba(0,2,4,.995));
  border:1px solid var(--tone-line);
  box-shadow:inset 0 0 28px rgba(0,0,0,.6),0 12px 34px rgba(0,0,0,.4);
}
.acbT-panel-h{
  background:linear-gradient(180deg,rgba(3,15,21,.95),rgba(0,4,7,.66));
  border-bottom:1px solid var(--tone-line);
  color:#e9faff;text-shadow:0 0 14px rgba(76,180,210,.16);
}
.acbT-panel-h span:last-child{color:rgba(255,158,61,.8);}
.acbT-tgt-row{border-bottom-color:rgba(76,148,174,.085);}
.acbT-tgt-code{color:rgba(127,231,255,.5);}
.acbT-tgt-en{color:#e4f8ff;}
.acbT-tgt-zh{color:rgba(111,150,165,.52);}
.acbT-mdata-k{color:rgba(111,150,165,.62);}
.acbT-mdata-v{color:#dcf6ff;}
.acbT-oplogs{color:rgba(111,150,165,.5);}
.acbT-opstate{color:rgba(255,158,61,.78);}
.acbT-opstate.is-ok{color:#69e3cf;text-shadow:0 0 14px rgba(80,220,190,.25);}
.acbT-meter span{color:var(--tone-dim);}
.acbT-progress{background:rgba(76,148,174,.12);}
.acbT-progress i{background:linear-gradient(90deg,#1d6a83,#6fe7ff,#ffb877);}
.acbT-map-frame{
  background:#000204;
  border-color:var(--tone-line);
  box-shadow:inset 0 0 110px rgba(0,0,0,.92),0 0 0 1px rgba(0,0,0,.6),
    0 0 34px rgba(0,0,0,.55);
}
.acbT-map-head,.acbT-map-foot{color:rgba(111,150,165,.52);}
.acbT-map3d{
  background:radial-gradient(80% 70% at 50% 42%,#01090e 0%,#000205 62%,#000 100%);
}
.acbT-map3d-plane{
  background:#000204;
  border-color:rgba(255,154,60,.28);
  box-shadow:0 0 40px rgba(30,95,120,.14),0 0 80px rgba(255,106,31,.03),
    inset 0 0 80px rgba(0,0,0,.68);
}
.acbT-terrain{filter:brightness(.52) contrast(1.34) saturate(1.45);}
.acbT-map3d-vignette{
  background:radial-gradient(66% 60% at 50% 46%,transparent 22%,rgba(0,1,3,.9) 100%);
}
.acbT-map-base{
  opacity:.2;
  border-color:rgba(76,148,174,.08);
  background-image:
    repeating-linear-gradient(90deg,rgba(76,148,174,.06) 0 1px,transparent 1px 46px),
    repeating-linear-gradient(0deg,rgba(76,148,174,.04) 0 1px,transparent 1px 46px);
}
.acbT-map-wide{
  background:radial-gradient(circle,rgba(30,102,138,.11),rgba(8,38,55,.03) 44%,transparent 70%);
}
.acbT-map-halo{
  background:radial-gradient(circle,rgba(160,235,255,.2),rgba(35,110,140,.045) 44%,transparent 72%);
}
.acbT-map-core{
  box-shadow:0 0 18px 6px rgba(210,252,255,.9),0 0 64px 22px rgba(88,200,238,.28);
}
.acbT-map-shaft{
  background:linear-gradient(90deg,transparent,rgba(130,225,255,.06),transparent);
}
.acbT-map-scan{opacity:.55;}
.acbT-route{filter:drop-shadow(0 0 2px rgba(80,190,220,.6));}
.acbT-subtitle{
  background:rgba(0,3,6,.9);
  border-color:var(--tone-line);
}
.acbT-sub-line{color:#dcf6ff;}
.acbT-sub-zh{color:rgba(255,158,61,.82);}
.acbT-mini{
  background:#000204;
  border-color:rgba(76,148,174,.16);
}
.acbT-mini svg{filter:brightness(.68) contrast(1.2) saturate(1.12);}
.acbT-sight{background:rgba(0,4,7,.92);border-color:rgba(76,148,174,.14);}
.acbT-sight-icon{color:rgba(255,158,61,.64);}
.acbT-globe{filter:brightness(.72) contrast(1.14);}
.acbT-globe-ring{border-color:rgba(76,148,174,.2);}
.acbT-globe-lat{border-color:rgba(76,148,174,.14);}
.acbT-globe-orbit{border-color:rgba(255,158,61,.26);}
.acbT-sat-rows{color:rgba(111,150,165,.55);}
.acbT-login-avatar{
  border-color:rgba(76,148,174,.24);
  background:radial-gradient(circle at 40% 30%,rgba(20,70,88,.28),rgba(0,3,6,.72));
  color:rgba(127,231,255,.8);
}
.acbT-title-side .acbT-panel{
  background:linear-gradient(180deg,rgba(0,5,9,.95),rgba(0,2,4,.98));
}
.acbT-footer{
  background:linear-gradient(0deg,rgba(0,2,4,.98),rgba(0,2,4,.3));
  border-top-color:var(--tone-line);
}
.acbT-ticker{color:rgba(111,150,165,.45);}
.acbT-sortie{color:rgba(111,150,165,.55);}
.acbT-sortie-bar{background:rgba(76,148,174,.13);}
.acbT-sortie-bar i{background:linear-gradient(90deg,#1d6a83,#9fefff,#ffb877);}
.acbT-title-command{background:linear-gradient(180deg,rgba(0,2,4,.96),rgba(0,2,4,.48));}
.acb-login-card{
  background:linear-gradient(150deg,rgba(0,6,10,.995),rgba(0,2,4,1) 52%,rgba(0,3,6,1));
  border-color:rgba(76,148,174,.34);
  box-shadow:0 50px 140px rgba(0,0,0,.88),0 0 60px rgba(50,150,180,.06),
    inset 0 1px 0 rgba(180,240,255,.1),inset 0 0 90px rgba(0,0,0,.4);
}
.acb-login-head{background:linear-gradient(180deg,rgba(1,8,12,.98),rgba(0,2,4,.6));}
.acb-login-row-copy em{color:rgba(111,150,165,.42);}
.acb-chips span{background:rgba(0,3,6,.8);border-color:rgba(76,148,174,.2);}
@media (prefers-reduced-motion:reduce){
  .acb-space-far{opacity:.4;}
  .acb-space-mid{opacity:.7;}
}

/* =====================================================================
   v8 — workspace theater map
   A complete continent silhouette, no internal route/terrain lines.
   Boot: 45° tilt -> top-down, then a whole-map bloom reveal.
   Regions are live workspace session occupancy from the Host snapshot.
   ===================================================================== */
.acbT-map3d-plane{
  left:50%;top:50%;width:106%;height:100%;
  animation:none!important;
  transform:translate(-50%,-50%) rotateX(0deg) rotateZ(0deg) scale(1);
  background:#000204;
  border-color:rgba(255,154,60,.22);
  box-shadow:0 0 48px rgba(31,95,120,.12),inset 0 0 90px rgba(0,0,0,.7);
}
.acbT-map-base{
  animation:none!important;
  transform:translate(-50%,-50%) rotateX(0deg) rotateZ(0deg) scale(1);
  opacity:.14;
  filter:blur(1.6px);
}
.acbT-workspace-map{
  display:block;width:100%;height:100%;overflow:visible;
  opacity:0;filter:brightness(1.6);
}
.acb-scene-login .acbT-workspace-map,
.acb-scene-boot.is-past .acbT-workspace-map{opacity:1;filter:none;}
.acb-scene-boot.is-active .acbT-map3d-plane{
  animation:acbWorkspaceTilt 1.35s cubic-bezier(.18,.8,.22,1) both!important;
}
@keyframes acbWorkspaceTilt{
  0%{transform:translate(-50%,-50%) rotateX(45deg) rotateZ(-5deg) scale(.9);}
  66%{transform:translate(-50%,-50%) rotateX(7deg) rotateZ(-1deg) scale(.99);}
  100%{transform:translate(-50%,-50%) rotateX(0deg) rotateZ(0deg) scale(1);}
}
.acb-scene-boot.is-active .acbT-map-base{
  animation:acbWorkspaceBaseTilt 1.7s cubic-bezier(.18,.8,.22,1) both!important;
}
@keyframes acbWorkspaceBaseTilt{
  0%{transform:translate(-50%,-50%) rotateX(52deg) rotateZ(-6deg) scale(1.04);opacity:.22;}
  100%{transform:translate(-50%,-50%) rotateX(0deg) rotateZ(0deg) scale(1);opacity:.14;}
}
.acb-scene-boot.is-active .acbT-workspace-map{
  animation:acbWorkspaceReveal .9s ease 1.35s both;
}
@keyframes acbWorkspaceReveal{
  0%{opacity:0;filter:brightness(2.9);}
  22%{opacity:1;filter:brightness(1.75);}
  100%{opacity:1;filter:brightness(1);}
}
.acbT-map-flash{
  position:absolute;inset:0;z-index:5;pointer-events:none;mix-blend-mode:screen;opacity:0;
  background:
    radial-gradient(circle at 50% 50%,rgba(255,255,255,.92),rgba(168,246,255,.34) 16%,rgba(66,178,216,.09) 40%,transparent 62%);
}
.acb-scene-boot.is-active .acbT-map-flash{
  animation:acbWorkspaceFlash 1.15s ease 1.3s both;
}
@keyframes acbWorkspaceFlash{
  0%{opacity:0;}
  15%{opacity:.72;}
  34%{opacity:.3;}
  100%{opacity:0;}
}
.acbT-map3d-vignette{
  background:
    radial-gradient(66% 60% at 50% 46%,transparent 22%,rgba(0,1,3,.9) 100%),
    linear-gradient(180deg,rgba(0,2,4,.5),transparent 18%,transparent 82%,rgba(0,2,4,.55));
}
.acbT-map-head,.acbT-map-foot{letter-spacing:.24em;}
.acbT-map-frame{background:#000204;}
@media (prefers-reduced-motion:reduce){
  .acb-scene-boot.is-active .acbT-map3d-plane,
  .acb-scene-boot.is-active .acbT-map-base{
    animation:none!important;
    transform:translate(-50%,-50%) rotateX(0deg) rotateZ(0deg) scale(1)!important;
  }
  .acbT-workspace-map{opacity:1!important;filter:none!important;animation:none!important;}
  .acbT-map-flash{display:none!important;}
}
.acb-root.acb-static .acbT-map3d-plane,
.acb-root.acb-static .acbT-map-base{
  animation:none!important;
  transform:translate(-50%,-50%) rotateX(0deg) rotateZ(0deg) scale(1)!important;
}
.acb-root.acb-static .acbT-workspace-map{opacity:1;filter:none;animation:none!important;}
.acb-root.acb-static .acbT-map-flash{display:none;}

/* =====================================================================
   v9 — full-bleed map and a harder light bloom
   Right info column is gone. The map is the interface; the left intel
   column floats over it. The reveal gets a white-hot core, a wide bloom,
   rotating rays, an anamorphic streak and a much brighter coast glow.
   ===================================================================== */
.acbT-grid{
  position:relative;display:block;flex:1;min-height:0;gap:0;
}
.acbT-center{
  position:absolute;inset:0;z-index:3;display:block;overflow:hidden;min-width:0;
}
.acbT-left{
  position:absolute;left:18px;top:22px;bottom:18px;width:268px;z-index:7;
  display:flex;flex-direction:column;gap:8px;pointer-events:none;
}
.acbT-left .acbT-panel{pointer-events:auto;}
.acbT-map-frame{position:absolute;inset:0;}
.acbT-map-head{left:300px;right:24px;top:10px;}
.acbT-map-foot{left:300px;right:24px;bottom:88px;}
.acbT-subtitle{
  position:absolute;left:50%;bottom:18px;transform:translateX(-50%);
  width:min(1120px,84vw);z-index:8;min-height:0;
  background:linear-gradient(90deg,transparent,rgba(0,4,8,.88) 7%,rgba(0,4,8,.88) 93%,transparent);
  border-color:rgba(76,148,174,.24);
  box-shadow:0 12px 34px rgba(0,0,0,.4);
}
.acbT-map3d-plane{width:100%;height:100%;top:50%;}
.acbT-map-bloom{
  position:absolute;left:50%;top:50%;width:138%;height:138%;
  transform:translate(-50%,-50%);z-index:2;pointer-events:none;
  mix-blend-mode:screen;opacity:.5;filter:blur(16px);
  background:radial-gradient(circle at center,
    rgba(205,252,255,.22),rgba(96,220,248,.1) 30%,rgba(38,132,170,.035) 52%,transparent 70%);
}
.acbT-map-flash{
  z-index:6;filter:blur(1.5px);
  background:radial-gradient(circle at 50% 50%,
    #ffffff 0%,rgba(238,255,255,.98) 5%,rgba(183,250,255,.82) 10%,
    rgba(94,214,244,.36) 23%,rgba(36,124,162,.1) 43%,transparent 62%);
}
.acb-scene-boot.is-active .acbT-map-flash{
  animation:acbWorkspaceFlash 1.35s cubic-bezier(.16,.84,.26,1) 1.28s both;
}
@keyframes acbWorkspaceFlash{
  0%{opacity:0;transform:scale(.78);}
  9%{opacity:.98;transform:scale(1);}
  19%{opacity:.74;transform:scale(1.04);}
  38%{opacity:.24;transform:scale(1.08);}
  100%{opacity:0;transform:scale(1.12);}
}
.acbT-map-rays{
  position:absolute;left:50%;top:50%;width:155vmax;height:155vmax;
  transform:translate(-50%,-50%);z-index:5;pointer-events:none;
  mix-blend-mode:screen;opacity:0;
  background:repeating-conic-gradient(from 0deg,
    rgba(228,254,255,.22) 0deg 0.45deg,
    rgba(140,238,255,.06) 0.45deg 1.15deg,
    transparent 1.15deg 10.5deg);
  -webkit-mask-image:radial-gradient(circle,transparent 0 9%,#000 19%,#000 40%,transparent 70%);
  mask-image:radial-gradient(circle,transparent 0 9%,#000 19%,#000 40%,transparent 70%);
}
.acb-scene-boot.is-active .acbT-map-rays{
  animation:acbWorkspaceRays 1.65s ease 1.26s both, acbRaysSpin 34s linear infinite;
}
@keyframes acbWorkspaceRays{
  0%{opacity:0;}
  10%{opacity:.62;}
  28%{opacity:.38;}
  100%{opacity:.16;}
}
@keyframes acbRaysSpin{
  from{transform:translate(-50%,-50%) rotate(0deg);}
  to{transform:translate(-50%,-50%) rotate(360deg);}
}
.acbT-map-streak{
  position:absolute;left:50%;top:50%;width:165%;height:2px;
  transform:translate(-50%,-50%);z-index:6;pointer-events:none;
  mix-blend-mode:screen;opacity:0;filter:blur(.35px);
  background:linear-gradient(90deg,transparent,
    rgba(150,242,255,.1) 18%,rgba(240,255,255,.92) 49%,rgba(160,246,255,.12) 82%,transparent);
  box-shadow:0 0 34px 8px rgba(104,225,255,.45);
}
.acb-scene-boot.is-active .acbT-map-streak{
  animation:acbWorkspaceStreak 1.25s ease 1.3s both;
}
@keyframes acbWorkspaceStreak{
  0%{opacity:0;transform:translate(-50%,-50%) scaleX(.6);}
  12%{opacity:.94;transform:translate(-50%,-50%) scaleX(1.05);}
  34%{opacity:.42;transform:translate(-50%,-50%) scaleX(1);}
  100%{opacity:0;transform:translate(-50%,-50%) scaleX(.94);}
}
.acb-scene-login .acbT-map-bloom{opacity:.38;}
.acb-scene-login .acbT-map-rays{opacity:.1;animation:acbRaysSpin 38s linear infinite;}
.acbT-map-core{
  width:12px;height:12px;
  box-shadow:
    0 0 22px 8px rgba(255,255,255,.98),
    0 0 72px 26px rgba(120,238,255,.55),
    0 0 160px 70px rgba(48,162,205,.2);
}
.acbT-map-halo{
  width:52%;height:52%;
  background:radial-gradient(circle,rgba(200,250,255,.34),rgba(58,168,204,.08) 42%,transparent 70%);
  filter:blur(20px);
}
.acbT-map-wide{
  width:118%;height:118%;
  background:radial-gradient(circle,rgba(76,200,236,.16),rgba(20,80,110,.045) 44%,transparent 70%);
  filter:blur(42px);
}
.acbT-map-light{opacity:.9;}
.acbT-map-shaft{opacity:1;}
.acbT-map-scan{display:none;}
@media (max-width:900px){
  .acbT-left{width:232px;left:10px;top:12px;bottom:12px;}
  .acbT-map-head,.acbT-map-foot{left:254px;right:12px;}
  .acbT-subtitle{width:92vw;bottom:10px;}
}
@media (prefers-reduced-motion:reduce){
  .acbT-map-rays,.acbT-map-streak,.acbT-map-flash,.acbT-map-bloom{
    animation:none!important;
  }
  .acbT-map-rays,.acbT-map-streak{display:none!important;}
  .acbT-map-bloom{opacity:.35;}
}
.acb-root.acb-static .acbT-map-rays,
.acb-root.acb-static .acbT-map-streak{display:none;}
.acb-root.acb-static .acbT-map-bloom{opacity:.35;}

/* =====================================================================
   v10 — multi-node activation and terrain situation
   Nodes and links flare at several points across the map; the Voronoi
   territory fills and terrain shading load after the node network.
   ===================================================================== */
.acbT-workspace-regions,
.acbT-workspace-labels,
.acbT-workspace-links{opacity:0;}
.acb-scene-boot.is-active .acbT-workspace-links{
  animation:acbMapGroupIn .55s ease 1.42s both;
}
.acb-scene-boot.is-active .acbT-workspace-regions{
  animation:acbMapGroupIn .7s ease 1.56s both;
}
.acb-scene-boot.is-active .acbT-workspace-labels{
  animation:acbMapGroupIn .6s ease 1.74s both;
}
@keyframes acbMapGroupIn{
  from{opacity:0;}
  to{opacity:1;}
}
.acbT-workspace-node{
  opacity:0;
  transform-box:fill-box;
  transform-origin:center;
}
.acb-scene-boot.is-active .acbT-workspace-node{
  animation:acbNodeBurst .95s cubic-bezier(.16,.84,.26,1) both;
}
@keyframes acbNodeBurst{
  0%{opacity:0;transform:scale(.55);}
  16%{opacity:1;transform:scale(1.16);}
  44%{opacity:.86;transform:scale(1);}
  100%{opacity:.58;transform:scale(1);}
}
.acbT-workspace-link{
  opacity:0;
}
.acb-scene-boot.is-active .acbT-workspace-link{
  animation:acbMapGroupIn .6s ease both;
}
.acb-scene-login .acbT-workspace-node,
.acb-scene-boot.is-past .acbT-workspace-node{
  opacity:.58;
  animation:none;
}
.acb-scene-login .acbT-workspace-regions,
.acb-scene-login .acbT-workspace-labels,
.acb-scene-login .acbT-workspace-links,
.acb-scene-boot.is-past .acbT-workspace-regions,
.acb-scene-boot.is-past .acbT-workspace-labels,
.acb-scene-boot.is-past .acbT-workspace-links{opacity:1;}
.acb-scene-login .acbT-workspace-link,
.acb-scene-boot.is-past .acbT-workspace-link{opacity:.7;animation:none;}
@media (prefers-reduced-motion:reduce){
  .acbT-workspace-node{opacity:.58!important;animation:none!important;}
}
.acb-root.acb-static .acbT-workspace-node{opacity:.58;animation:none!important;}
.acb-root.acb-static .acbT-workspace-regions,
.acb-root.acb-static .acbT-workspace-labels,
.acb-root.acb-static .acbT-workspace-links{opacity:1;animation:none!important;}
.acb-root.acb-static .acbT-workspace-link{opacity:1;animation:none!important;}
`;

    function apply(ctx) {
      let translate;
      try {
        translate = ctx.locale.bind(NS);
      } catch (error) {
        console.warn('[ac-boot] locale binding unavailable; bundled copy will be used', error);
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
