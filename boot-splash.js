/**
 * Pre-boot splash strings injected by the Host half.
 *
 * The desktop shell caches `ctx.webServer.collectIndexInjections()` when the
 * Host process starts and applies these rows before it creates the
 * `Loading plugins…` boot card. The first painted frame is therefore already
 * the tactical uplink; the client removes this node on its first layout pass.
 *
 * The splash is intentionally self-contained: original HTML/CSS only, no
 * scripts, no external assets, and an 8 second CSS fail-safe so a missing
 * client plugin can never leave a permanent cover.
 */

export const EARLY_CSS = String.raw`
#acb-boot-splash{position:fixed;inset:0;z-index:2147483646;overflow:hidden;pointer-events:none;
  background:radial-gradient(90% 70% at 50% 46%,#081720 0%,#030a0f 54%,#010407 100%);
  color:#eef8fd;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Cascadia Mono",monospace;
  font-size:11px;line-height:1.5;letter-spacing:.08em;opacity:1;
  animation:acbEOut .9s ease 8s forwards;}
@keyframes acbEOut{to{opacity:0;visibility:hidden}}
#acb-boot-splash *{box-sizing:border-box;}
#acb-boot-splash::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;
  background:
    linear-gradient(90deg,rgba(255,120,30,.05),transparent 18%,transparent 82%,rgba(255,120,30,.04)),
    repeating-linear-gradient(0deg,rgba(127,233,255,.03) 0 1px,transparent 1px 4px);}
.acbE-frame{position:absolute;inset:14px;z-index:6;border:1px solid rgba(127,233,255,.1);}
.acbE-frame i{position:absolute;width:44px;height:44px;border:1px solid rgba(255,171,74,.55);}
.acbE-frame i:nth-child(1){left:-1px;top:-1px;border-right:0;border-bottom:0;}
.acbE-frame i:nth-child(2){right:-1px;top:-1px;border-left:0;border-bottom:0;}
.acbE-frame i:nth-child(3){left:-1px;bottom:-1px;border-right:0;border-top:0;}
.acbE-frame i:nth-child(4){right:-1px;bottom:-1px;border-left:0;border-top:0;}
.acbE-top{position:absolute;left:30px;right:30px;top:24px;z-index:7;display:flex;
  align-items:center;justify-content:space-between;gap:16px;font-size:8px;letter-spacing:.3em;
  color:rgba(196,230,242,.5);text-transform:uppercase;}
.acbE-top b{font-weight:500;color:#ffb877;}
.acbE-center{position:absolute;left:50%;top:50%;z-index:8;width:min(760px,90vw);
  transform:translate(-50%,-52%);text-align:center;}
.acbE-kicker{font-size:9px;letter-spacing:.44em;color:rgba(255,171,74,.8);text-transform:uppercase;}
.acbE-word{display:block;margin-top:20px;font-family:"Segoe UI",system-ui,-apple-system,sans-serif;
  font-weight:700;font-size:clamp(38px,6.8vw,96px);line-height:.9;letter-spacing:.2em;
  padding-left:.2em;color:#f4fcff;text-shadow:0 18px 50px rgba(0,0,0,.7),0 0 40px rgba(127,233,255,.14);
  clip-path:inset(0 100% 0 0);animation:acbEWord 1.1s cubic-bezier(.23,1,.32,1) .05s forwards;}
@keyframes acbEWord{to{clip-path:inset(0 0 0 0)}}
.acbE-sub{margin-top:12px;font-size:clamp(11px,1.4vw,16px);letter-spacing:.85em;padding-left:.85em;
  color:#ffb877;text-shadow:0 0 28px rgba(255,106,31,.3);}
.acbE-op{margin-top:18px;font-size:9px;letter-spacing:.4em;color:rgba(196,230,242,.55);}
.acbE-bar{width:min(320px,44vw);height:2px;margin:26px auto 0;background:rgba(127,233,255,.14);overflow:hidden;}
.acbE-bar i{display:block;height:100%;transform-origin:left;transform:scaleX(0);
  background:linear-gradient(90deg,transparent,#9fefff,#ffb877);animation:acbEBar 2.6s cubic-bezier(.77,0,.175,1) .2s forwards;}
@keyframes acbEBar{to{transform:scaleX(1)}}
.acbE-bottom{position:absolute;left:30px;right:30px;bottom:24px;z-index:7;display:flex;
  justify-content:space-between;gap:16px;font-size:8px;letter-spacing:.26em;
  color:rgba(196,230,242,.4);text-transform:uppercase;}
.acbE-bottom b{color:rgba(255,171,74,.8);font-weight:500;}
@media (max-width:760px){
  .acbE-top{left:18px;right:18px;top:16px;font-size:7px;}
  .acbE-bottom{left:18px;right:18px;bottom:16px;font-size:7px;}
}
@media (prefers-reduced-motion:reduce){
  #acb-boot-splash *{animation:none!important;}
  .acbE-word{clip-path:none!important;}
  .acbE-bar i{transform:scaleX(1)!important;}
}
`;

export const EARLY_HTML = String.raw`
<div id="acb-boot-splash" data-acb-boot-splash aria-hidden="true">
  <div class="acbE-frame"><i></i><i></i><i></i><i></i></div>
  <div class="acbE-top">
    <span>TACTICAL UPLINK // <b>PRE-BOOT</b></span>
    <span>OPERATION // FIRST LIGHT</span>
    <span>LOCAL THEATER // 06</span>
  </div>
  <div class="acbE-center">
    <div class="acbE-kicker">DEEPSEEK SYSTEMS // LOCAL COMMAND</div>
    <div class="acbE-word">DEEPSEEK</div>
    <div class="acbE-sub">HARNESS</div>
    <div class="acbE-op">MISSION UPLINK · ESTABLISHING COMMAND LINK</div>
    <div class="acbE-bar"><i></i></div>
  </div>
  <div class="acbE-bottom">
    <span>DESKTOP <b>06</b></span>
    <span>LOCAL // SECURE BOOT</span>
    <span>BUILD <b>19.0</b></span>
  </div>
</div>
`;
