/**
 * Pre-boot splash strings injected by the Host half.
 *
 * The desktop shell caches `ctx.webServer.collectIndexInjections()` when the
 * Host process starts; the frontend applies these rows *before* it creates the
 * `Loading plugins…` boot card. The first painted frame is therefore already
 * the tactical uplink splash, and the client animation removes this node on its
 * first layout pass.
 *
 * The splash is intentionally self-contained: original HTML/CSS only, no
 * scripts, no external assets, and an 8 second CSS fail-safe so a missing
 * client plugin can never leave a permanent cover.
 */

export const EARLY_CSS = String.raw`
#acb-boot-splash{position:fixed;inset:0;z-index:2147483646;overflow:hidden;
  pointer-events:none;background:radial-gradient(120% 100% at 50% 38%,#03121b 0%,#01070c 52%,#000203 100%);
  color:#f4fcff;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Cascadia Mono",monospace;
  font-size:11px;line-height:1.5;letter-spacing:.05em;opacity:1;
  animation:acbEOut .9s ease 8s forwards;}
@keyframes acbEOut{to{opacity:0;visibility:hidden}}
#acb-boot-splash *{box-sizing:border-box;}
#acb-boot-splash::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;
  background:
    linear-gradient(90deg,rgba(255,106,31,.055),transparent 16%,transparent 84%,rgba(255,106,31,.04)),
    radial-gradient(55% 44% at 50% 110%,rgba(111,231,255,.07),transparent 70%);}
.acbE-stars{position:absolute;inset:-4%;z-index:0;opacity:.75;
  background-image:
    radial-gradient(1px 1px at 12% 22%,#ecfdff 50%,transparent 51%),
    radial-gradient(1px 1px at 28% 68%,#9feaff 50%,transparent 51%),
    radial-gradient(1px 1px at 44% 14%,#ffffff 50%,transparent 51%),
    radial-gradient(1px 1px at 62% 82%,#cff7ff 50%,transparent 51%),
    radial-gradient(1px 1px at 76% 34%,#9feaff 50%,transparent 51%),
    radial-gradient(1px 1px at 88% 62%,#ffffff 50%,transparent 51%),
    radial-gradient(1.5px 1.5px at 36% 44%,#dffaff 50%,transparent 51%),
    radial-gradient(1.5px 1.5px at 70% 16%,#dffaff 50%,transparent 51%);
  animation:acbETwinkle 5s ease-in-out infinite alternate;}
@keyframes acbETwinkle{from{opacity:.4}to{opacity:.9}}
.acbE-ember{position:absolute;left:-24%;bottom:-38%;width:100vw;height:88vh;z-index:0;
  mix-blend-mode:screen;filter:blur(28px);
  background:radial-gradient(50% 50% at 50% 50%,rgba(255,106,31,.24),rgba(110,32,6,.06) 56%,transparent 74%);
  animation:acbEEmber 12s ease-in-out infinite alternate;}
@keyframes acbEEmber{from{transform:translate3d(-2%,2%,0) scale(.94);opacity:.6}
  to{transform:translate3d(2%,-1%,0) scale(1.05);opacity:1}}
.acbE-haze{position:absolute;inset:-10%;z-index:0;filter:blur(30px);
  background:radial-gradient(46% 34% at 52% 62%,rgba(36,118,148,.08),transparent 70%);}
.acbE-globe{position:absolute;left:50%;top:47%;width:64vmin;height:64vmin;z-index:0;
  opacity:.18;mix-blend-mode:screen;transform-style:preserve-3d;
  transform:translate(-50%,-50%) rotateX(18deg) rotateZ(-12deg);
  animation:acbEGlobe 18s ease-in-out infinite alternate;}
@keyframes acbEGlobe{from{transform:translate(-50%,-50%) rotateX(18deg) rotateZ(-12deg) scale(.96)}
  to{transform:translate(-50%,-47%) rotateX(14deg) rotateZ(-4deg) scale(1.04)}}
.acbE-globe i{position:absolute;inset:0;border-radius:50%;
  border:1px solid rgba(111,231,255,.42);box-shadow:0 0 10px rgba(111,231,255,.1);}
.acbE-globe i:nth-child(3n){border-color:rgba(255,158,61,.34);}
.acbE-orbit{position:absolute;left:50%;top:47%;width:74vmin;height:74vmin;z-index:0;
  transform:translate(-50%,-50%) rotateX(72deg) rotateZ(18deg);border-radius:50%;
  border:1px solid rgba(255,154,60,.45);box-shadow:0 0 40px rgba(255,106,31,.14);}
.acbE-grid{position:absolute;left:50%;bottom:-18vh;width:160vw;height:70vh;z-index:0;
  transform:translateX(-50%) perspective(600px) rotateX(68deg);transform-origin:50% 100%;
  opacity:.2;background:
    repeating-linear-gradient(90deg,rgba(111,231,255,.22) 0 1px,transparent 1px 64px),
    repeating-linear-gradient(0deg,rgba(111,231,255,.16) 0 1px,transparent 1px 64px);
  -webkit-mask-image:linear-gradient(180deg,transparent,#000 42%,transparent 94%);
  mask-image:linear-gradient(180deg,transparent,#000 42%,transparent 94%);}
.acbE-scan{position:absolute;inset:-10% 0;z-index:4;opacity:.4;
  background:repeating-linear-gradient(0deg,rgba(111,231,255,.05) 0 1px,transparent 1px 4px);
  animation:acbEScan 8s linear infinite;}
@keyframes acbEScan{from{transform:translateY(0)}to{transform:translateY(7px)}}
.acbE-vignette{position:absolute;inset:0;z-index:5;
  background:radial-gradient(68% 60% at 50% 45%,transparent 30%,rgba(0,0,0,.8) 100%);}
.acbE-frame{position:absolute;inset:14px;z-index:6;border:1px solid rgba(111,231,255,.1);}
.acbE-frame i{position:absolute;width:44px;height:44px;border:1px solid rgba(255,154,60,.62);}
.acbE-frame i:nth-child(1){left:-1px;top:-1px;border-right:0;border-bottom:0;}
.acbE-frame i:nth-child(2){right:-1px;top:-1px;border-left:0;border-bottom:0;}
.acbE-frame i:nth-child(3){left:-1px;bottom:-1px;border-right:0;border-top:0;}
.acbE-frame i:nth-child(4){right:-1px;bottom:-1px;border-left:0;border-top:0;}
.acbE-top{position:absolute;left:30px;right:30px;top:24px;z-index:7;display:flex;
  align-items:center;justify-content:space-between;gap:16px;font-size:8px;letter-spacing:.3em;
  color:rgba(196,230,242,.5);text-transform:uppercase;}
.acbE-top b{font-weight:500;color:#ffb877;}
.acbE-top .acbE-secret{color:rgba(255,216,168,.9);border:1px solid rgba(255,158,61,.4);
  padding:4px 8px;background:rgba(255,106,31,.08);}
.acbE-center{position:absolute;left:50%;top:47%;z-index:8;width:min(820px,88vw);
  transform:translate(-50%,-50%);text-align:center;}
.acbE-kicker{font-size:9px;letter-spacing:.44em;color:rgba(255,158,61,.8);text-transform:uppercase;}
.acbE-word{display:block;margin-top:18px;font-family:"Segoe UI",system-ui,-apple-system,sans-serif;
  font-weight:650;font-size:clamp(40px,7.6vw,108px);line-height:.9;letter-spacing:.2em;
  padding-left:.2em;background:linear-gradient(180deg,#ffffff 0%,#f4fdff 24%,#c9f7ff 44%,#4d93a8 52%,#9feaff 58%,#ffffff 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 18px 50px rgba(0,0,0,.72)) drop-shadow(0 0 34px rgba(111,231,255,.16));
  clip-path:inset(0 100% 0 0);animation:acbEWord 1.1s cubic-bezier(.23,1,.32,1) .05s forwards;}
@keyframes acbEWord{to{clip-path:inset(0 0 0 0)}}
.acbE-sub{margin-top:12px;font-size:clamp(11px,1.4vw,16px);letter-spacing:.72em;padding-left:.72em;
  color:#ffb877;text-shadow:0 0 28px rgba(255,106,31,.3);}
.acbE-op{margin-top:14px;font-size:9px;letter-spacing:.4em;color:rgba(196,230,242,.62);}
.acbE-rule{width:min(360px,44vw);height:1px;margin:24px auto 0;
  background:linear-gradient(90deg,transparent,rgba(255,154,60,.9),rgba(111,231,255,.9),transparent);}
.acbE-tag{margin-top:14px;font-size:9px;letter-spacing:.3em;color:rgba(196,230,242,.54);}
.acbE-bar{width:min(300px,40vw);height:1px;margin:22px auto 0;background:rgba(111,231,255,.16);overflow:hidden;}
.acbE-bar i{display:block;height:100%;transform-origin:left;transform:scaleX(0);
  background:linear-gradient(90deg,transparent,#9fefff,#ffb877);animation:acbEBar 2.6s cubic-bezier(.77,0,.175,1) .2s forwards;}
@keyframes acbEBar{to{transform:scaleX(1)}}
.acbE-bottom{position:absolute;left:30px;right:30px;bottom:24px;z-index:7;display:flex;
  justify-content:space-between;gap:16px;font-size:8px;letter-spacing:.26em;
  color:rgba(196,230,242,.4);text-transform:uppercase;}
.acbE-bottom b{color:rgba(255,158,61,.8);font-weight:500;}
@media (max-width:760px){
  .acbE-top{left:18px;right:18px;top:16px;font-size:7px;}
  .acbE-top .acbE-secret{display:none;}
  .acbE-bottom{left:18px;right:18px;bottom:16px;font-size:7px;}
  .acbE-center{width:92vw;}
  .acbE-globe{width:78vmin;height:78vmin;}
}
@media (prefers-reduced-motion:reduce){
  #acb-boot-splash *{animation:none!important;}
  .acbE-word{clip-path:none!important;}
  .acbE-bar i{transform:scaleX(1)!important;}
  .acbE-scan{display:none;}
}
`;

export const EARLY_HTML = String.raw`
<div id="acb-boot-splash" data-acb-boot-splash aria-hidden="true">
  <div class="acbE-stars"></div>
  <div class="acbE-ember"></div>
  <div class="acbE-haze"></div>
  <div class="acbE-globe" aria-hidden="true">
    <i style="transform:rotateY(0deg)"></i><i style="transform:rotateY(15deg)"></i>
    <i style="transform:rotateY(30deg)"></i><i style="transform:rotateY(45deg)"></i>
    <i style="transform:rotateY(60deg)"></i><i style="transform:rotateY(75deg)"></i>
    <i style="transform:rotateY(90deg)"></i><i style="transform:rotateY(105deg)"></i>
    <i style="transform:rotateY(120deg)"></i><i style="transform:rotateY(135deg)"></i>
    <i style="transform:rotateY(150deg)"></i><i style="transform:rotateY(165deg)"></i>
  </div>
  <div class="acbE-orbit"></div>
  <div class="acbE-grid"></div>
  <div class="acbE-scan"></div>
  <div class="acbE-vignette"></div>
  <div class="acbE-frame"><i></i><i></i><i></i><i></i></div>
  <div class="acbE-top">
    <span>TACTICAL BRIEFING // <b>PRE-BOOT</b></span>
    <span class="acbE-secret">SECRET // DSH COMMAND</span>
    <span>CH 06 // LOCAL</span>
  </div>
  <div class="acbE-center">
    <div class="acbE-kicker">DEEPSEEK SYSTEMS // TACTICAL UPLINK</div>
    <div class="acbE-word">DEEPSEEK</div>
    <div class="acbE-sub">HARNESS</div>
    <div class="acbE-op">OPERATION // FIRST LIGHT</div>
    <div class="acbE-rule"></div>
    <div class="acbE-tag">ESTABLISHING LOCAL COMMAND LINK</div>
    <div class="acbE-bar"><i></i></div>
  </div>
  <div class="acbE-bottom">
    <span>DESKTOP <b>06</b></span>
    <span>LOCAL // SECURE BOOT</span>
    <span>BUILD <b>06.0</b></span>
  </div>
</div>
`;
