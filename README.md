# 战术简报开机序列 · DSH Tactical Briefing Boot

DeepSeek Harness Web UI 的电影感开机序列：四段式**战术任务简报**开场——全息指挥桌上行、全域全息战区图、操作员权限与系统检查、任务开始大标题。

这一版把"任务简报界面"本身做成主角：黑底全息战区地图、经纬网格、左右两列卫星数据链 / 图版数据、多节点长射线爆发、品红高亮战区、城市标签与底部任务字幕。地图、网格、数据、HUD 全部由代码绘制，Agnes 只负责两张抽象底材（地形浮雕 + 全息指挥桌）；没有战机、甲板或云海日落照片。默认约 15 秒，四段自动衔接，结束淡入工作区。

序列只属于**一次应用启动**：冷启动播放一次；休眠唤醒、托盘恢复、页面刷新都不会重播。

当前版本：**0.15.1**

> 0.15.0：战区段重做成完整的任务简报界面——程序化海岸线 + 经纬网格 + `SAT DATA LINK` / `PLATE` 数据栏 + 多节点长射线 + 品红 `LOCAL THEATER` 高亮 + 底部任务字幕。

> 0.15.1：射线爆发加密——每个节点从密集的亮核向外分三层（细 / 中 / 长）散开，另加四向十字长射线，密度大幅提高。

| 简报上行 | 战区态势 |
| --- | --- |
| ![简报上行](docs/boot-brief.jpg) | ![战区态势](docs/boot-theater.jpg) |
| **操作员权限** | **任务开始** |
| ![操作员权限](docs/boot-console.jpg) | ![任务开始](docs/boot-title.jpg) |

## 这一版是什么

1. **简报 / BRIEF（0–2.8s）**：暗场里一张全息指挥桌缓慢呼吸，左侧轨道环，右侧 `DEEPSEEK / HARNESS` 字标划开；`OPERATION // FIRST LIGHT`、加密上行状态、简报准备进度，右侧 `BRIEFING DATA`（TGT / GRID / UPLINK / STATUS）。
2. **战区 / THEATER（2.8–7.2s）**：全幅全息战区图。程序化海岸线 + 青色发光描边，经纬网格与坐标刻度；左右两列数据栏——`SAT DATA LINK / UPLOAD STATUS / NODE STATUS` 与 `PLATE 06 // LOCAL / THEATER GRID`；12 个数据节点从密集亮核向外分三层（细 / 中 / 长）散开，另有四向十字长射线，4 个主节点更亮；品红 `LOCAL THEATER` 高亮区、城市标签与底部双语任务字幕。
3. **权限 / CONSOLE（7.2–10.8s）**：战区图退暗，左侧 `OPERATOR ACCESS` 卡片逐条校验身份、凭据、本机配置并盖 `ACCESS GRANTED`；右侧系统检查列表、雷达扫描与遥测；背景是低透明度的 `CLASSIFIED` 分类水印。
4. **标题 / TITLE（10.8–15s）**：地图线稿淡出，`DEEPSEEK` 大标题、`MISSION START` 任务开始章、三枚状态 chip、`按 Enter 继续` 与自动继续进度。

构图与信息密度参考空战任务简报界面（黑底全息地图、数据链侧栏、节点射线、底部字幕），但**地图形状、城市、数据与文案全部原创虚构**，不映射现实地理，也不读取真实工作区数据。

## 画面资产（Agnes）

两张抽象底材由 Agnes 图像模型 `agnes-image-2.5-flash` 生成，JPEG 合计约 396 KB：

| 文件 | 用途 |
| --- | --- |
| `assets/terrain.jpg` | 俯视地形浮雕，作为 SVG 大陆轮廓内的 `<pattern>` 填充 |
| `assets/holo.jpg` | 全息指挥桌，作为简报 / 权限段的暗底与景深 |

提示词只描述抽象材质（地形、全息地图与数据面板），不包含战机、人物或文字；完整提示词与请求参数见 [docs/agnes-prompts.md](docs/agnes-prompts.md)。

Host 半侧把它们挂在 `/acb/assets/<name>.jpg` 下只读输出；客户端按 `?v=<ART_VERSION>` 取图并预加载。换图时把 `client.js` 里的 `ART_VERSION` 加一，再刷新插件即可，不需要重启 Host。

## v0.13.0 启动兼容性修复（本版沿用）

v0.12.0 之后 DSH 出现过一次启动失败（`Host startup exceeded 60 seconds`），启动日志里 ac-boot 留下了报错：

```
[ac-boot] workspace data route was not registered
Error: cannot get property "webServer" without inject
```

原因是 Host 半侧在没有声明 `inject` 的情况下读取了 `webServer` / `workspaceRegistry`；而且旧版的"实时工作区数据"从未成功，地图一直用的是内置示例。

现在的 Host 半侧被收窄到最小：

- 显式导出 `name` 与 `inject = ['webServer']`，不再读取 `workspaceRegistry`；
- 不注册 `/acb/workspaces`，不做工作区快照；
- 注入表只保留首帧 splash 的 `html` + `style` 两行；
- 唯一新增的常驻内容是 `/acb/assets/` 只读静态路由；
- 所有回调都包在 `try/catch` 里，激活阶段没有 await、没有网络请求、没有同步重活。

也就是说，这个插件现在**没有能力拖慢或打断 Host 启动**；最坏情况只是图片路由缺失，客户端退回纯代码线稿地图。

## 安装

这是一个 DSH bundle/plugin（`package.json` 的 `dsh.bundle` + `dsh.client`），不是独立网页，也不是 npm 公共包。

### 1. 放到 profile 的 node_modules

以桌面端默认 `desktop` profile 为例。

Windows PowerShell：

```powershell
$profileRoot = "$env:USERPROFILE\.dsh\profiles\desktop"
$target = Join-Path $profileRoot "node_modules\@local\dsh-ac-boot"
New-Item -ItemType Directory -Force (Split-Path $target) | Out-Null

# 先 clone 到任意源码目录
git clone https://github.com/MosesMuxiXie/dsh-ac-boot.git "$env:USERPROFILE\src\dsh-ac-boot"

# 如果 target 已存在，先确认它不是要保留的真实目录
New-Item -ItemType SymbolicLink -Path $target -Target "$env:USERPROFILE\src\dsh-ac-boot"
```

macOS / Linux：

```bash
profileRoot="$HOME/.dsh/profiles/desktop"
mkdir -p "$profileRoot/node_modules/@local"
git clone https://github.com/MosesMuxiXie/dsh-ac-boot.git "$HOME/src/dsh-ac-boot"
ln -s "$HOME/src/dsh-ac-boot" "$profileRoot/node_modules/@local/dsh-ac-boot"
```

也可以直接把仓库内容复制到 `node_modules/@local/dsh-ac-boot`，不建符号链接。

### 2. 启用插件

在 DSH 的「设置 → 插件」里启用 **开机序列 · 启动动画**（此前被临时禁用的，在这里重新打开）。如果插件没有自动出现在列表中，把仓库根目录的 `cordis.patch.yml` 合并到 profile 的 `cordis.patch.yml`：

```yaml
- insert:
    - id: ac-boot
      name: '@local/dsh-ac-boot'
```

`package.json` 已经声明：

- `dsh.bundle.patch` → `./cordis.patch.yml`
- `dsh.client.platform` → `web`
- `dsh.client.immediately` → `true`

### 3. 重启边界

- **首次安装 / 重新启用**：需要完整退出 DSH（托盘 → 退出，或应用菜单退出）再启动一次。桌面端会在 Host 进程启动时缓存 `webserver/index-inject` 的注入结果，因此首帧 splash 和 `/acb/assets` 这类 Host 侧内容必须等一次应用级重启。
- **之后的客户端更新**（地图、面板、文案、时序）：可以用 DSH 的**插件刷新 / Unlag 刷新**重载客户端，不必完整退出应用。见下面的「热加载」。
- **换底材**：更新 `assets/*.jpg`，把 `client.js` 的 `ART_VERSION` 加一，再刷新插件；图片路由每次请求都读磁盘，不需要重启 Host。

## 启动行为

开机序列只属于一次应用启动：

- 冷启动 DSH（完全退出后重新启动）播放一次；
- 休眠 / 睡眠唤醒、锁屏恢复、托盘窗口重新打开、同一窗口内页面重载都不会自动重播；
- 播放开始时客户端往 `sessionStorage` 写入 `acb-boot-played` 标记。同一窗口会话内再加载页面时，客户端直接跳过序列并移除 Host 注入的 splash；
- 手动重播始终可用：`Ctrl+Alt+Shift+B` 或控制台 `window.__ACB_REPLAY()`；同一窗口内插件模块热替换（HMR）仍会自动重播一次，方便预览；
- 想再看一次冷启动效果：把 DSH 完全退出（托盘 → 退出）再启动。

> 为什么用 `sessionStorage`：它跟着窗口会话走。页面重载、休眠唤醒、Electron 渲染进程重载都保留它，所以不会重播；真正退出应用时窗口会话销毁，标记随之消失，下次启动重新播放。

## 热加载

客户端模块带 build fingerprint。同一窗口内模块被热替换时，新的 `BootHost` 会检测到新 build 并自动重播整个开场，不需要退出应用。整页重载（Unlag 的界面重建走页面重载）不会自动重播，用下面的手动入口预览。

手动重播：

- 按 `Ctrl+Alt+Shift+B`
- 或在控制台执行：

  ```js
  window.__ACB_REPLAY()
  ```

推荐工作流：

1. 修改 `client.js` / HUD / 地图 / 文案；
2. 在 DSH 里触发插件刷新（Unlag / 插件管理器重载）；
3. 如果新模块是同一窗口热替换，会自动重播；整页重载则按上面的快捷键手动预览。

只有改 Host 半侧（`index.js`、`boot-splash.js`、`/acb/assets` 路由、splash 注入）才需要应用级重启。

## 文件

| 文件 | 说明 |
| --- | --- |
| `index.js` | Host 半侧：首帧 splash 注入、`/acb/assets/` 只读图库路由；`inject = ['webServer']` |
| `boot-splash.js` | 首帧 splash 的 HTML/CSS，无脚本、8 秒淡出兜底 |
| `client.js` | 四段战术简报、SVG 战区图、HUD、启动去重、热重播、i18n、跳过与减少动态 |
| `assets/terrain.jpg` | Agnes 地形浮雕（裁进大陆轮廓做填充） |
| `assets/holo.jpg` | Agnes 全息指挥桌（简报 / 权限段暗底） |
| `cordis.patch.yml` | bundle 插入 `ac-boot` 插件行 |
| `locale/*.json` | 插件管理页标题与描述 |
| `icon.svg` | 插件图标 |
| `docs/boot-*.jpg` | 四段画面预览 |
| `docs/agnes-prompts.md` | 两张底材的原始 Agnes 提示词与请求参数 |
| `scripts/agnes-gen.mjs` | Agnes 生图辅助脚本（开发用，从 `AGNES_API_KEY` 读 Key） |

## 调参

- 总时长：`client.js` 顶部 `DURATION_MS`（默认 `15000`）
- 四段切换：`PHASES`（默认 `0 / 2800 / 7200 / 10800 ms`）
- 减少动态效果时长：`REDUCED_MS`（默认 `5200`）
- 淡入淡出：`FADE_MS`（默认 `800`）
- 覆盖层级：`ORDER`（默认 `9000`）
- 背景图版本：`ART_VERSION`（默认 `14`，换图时 +1）
- 启动去重标记：`sessionStorage['acb-boot-played']`（清掉它可让下一次页面重载重新播放）
- 战区形状：`LANDS`（`blobPath()` 程序化海岸线，种子固定）；高亮区：`HIGHLIGHTS`；节点：`NODES`；城市：`CITIES`；经纬网格：`GRATICULE_X` / `GRATICULE_Y`
- 数据栏文案：`SAT_ROWS` / `NODE_ROWS` / `PLATE_ROWS` / `GRID_ROWS`；底部字幕：`theater.caption` / `theater.caption.zh`
- 地图倾角：`.acb-map-plane` 的四段 `rotateX`（简报 17° → 战区 5° → 权限 10° → 标题 12°）

## 交互

- 点击任意处 / `Esc` / `Enter` / `Space` 跳过；
- 动画中隐藏窗口，回来会继续，不会从头重播；
- 播放结束后隐藏 / 重新打开窗口、休眠唤醒都不会重播；需要重看用上面的手动重播；
- `prefers-reduced-motion` 下使用较短时序的静态版，保留信息、去掉位移与强光；
- 覆盖层使用 `shell.overlay` 槽位，遮住桌面宠物等底层元素。

## 设计说明

- 战区轮廓、分区、航线、航点、徽章与全部 HUD 文字都是原创代码绘制；地形浮雕与全息底材由 Agnes 依据原创提示词生成，不含任何游戏素材、字体、音频、商标或真实机徽。
- 这片大陆是虚构剧场，不映射现实地理，也不包含任何真实国家轮廓。
- 动画只对 `transform` / `opacity` / `stroke-dashoffset` / `clip-path` 等合成属性做过渡；React 只切换阶段，不写逐帧样式。
- 已知限制：DSH 桌面端缓存 Host 注入是平台行为，无法从插件侧绕过；因此 splash 和 `/acb/assets` 路由的更新始终需要一次应用级重启。

## 生成记录

- 图像模型：Agnes `agnes-image-2.5-flash`，尺寸 1280×720（上游返回 1312×736）。
- `terrain.jpg`：俯视地形浮雕（深海蓝绿岩体、琥珀谷地、青色山脊高光），提示词要求 no text / no labels / no roads / no borders / no coastlines。
- `holo.jpg`：黑底全息指挥桌（半透明地图网格、等高线、读数面板、青色与琥珀光），提示词要求 no text / no letters / no aircraft / no people。
- v0.14.0 移除了 v0.13.0 的四张战机写实键 art（仅保留在 git 历史与 `v0.13.0` 标签里），因为这一版明确采用战术简报界面语言。

## License

仓库目前未声明开源许可证。如需 MIT / Apache-2.0 或私有使用说明，请先补充 LICENSE 再重新发布。
