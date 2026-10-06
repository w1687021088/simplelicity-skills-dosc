# 前端 UI Skills 与 Codex 使用文档纪要

> 日期：2026-10-01  
> 主题：前端 UI Skills 推荐、原理、Codex 调用与团队协作  
> 适用：Codex 等 AI 编程助手

---

## 一、推荐的前端 UI Skills

### 1.1 设计品味与审美

| 技能                    | 说明                                                         |
| :---------------------- | :----------------------------------------------------------- |
| `design-taste-frontend` | 优先安装。通过 `DESIGN_VARIANCE`、`MOTION_INTENSITY`、`VISUAL_DENSITY` 三个参数控制布局变化度、动效强度和信息密度，内置反模板规则。 |
| `ui-ux-pro-max`         | 覆盖 50 种设计风格、21 套配色方案、50 组字体搭配，从设计语言到组件生态全链路约束。 |
| `frontend-design`       | Anthropic 官方出品，目标是让 UI“不像 AI 生成的”，对 Codex 兼容。 |
| `ux-ui-design-taste`    | 专注于产品设计师级别的判断力，框架无关，支持 React、HTML/CSS、shadcn/ui 等。 |

### 1.2 组件库与设计系统

| 技能                    | 说明                                                         |
| :---------------------- | :----------------------------------------------------------- |
| `@teamhelper/ui`        | React 组件库，内置 AI 接入文档，附带本地 MCP server。        |
| `dembrandt-skills`      | 覆盖品牌视觉、设计 Token、排版比例、组件交互，可从真实网站提取设计 Token。 |
| `ui-design-aitool-plus` | 提供完整组件库，支持多风格横向对比。                         |
| daisyUI Codex 插件      | 为 Codex 提供 Tailwind CSS 组件命名和主题规则。              |

### 1.3 布局、动效与质量保障

| 类别 | 技能                                                         |
| :--- | :----------------------------------------------------------- |
| 布局 | `adaptive-structure-architect`、`layout-design-engine`、`advanced-color-synthesizer` |
| 动效 | `interaction-motion-designer`、`scroll-driven-animation`     |
| 质量 | `better-interface`、`better-accessibility`、`web-design-guidelines`、`frontend-quality-auditor` |
| 实现 | `frontend-implementation`                                    |

### 1.4 推荐组合策略

1. 先装 `design-taste-frontend`，建立基本审美底线。  
2. 按技术栈接入组件库技能。  
3. 叠加 `better-interface` 或 `frontend-quality-auditor`，在交付前做可访问性与质量审查。

---

## 二、技能包原理

- **核心载体**：`SKILL.md`，采用 YAML Frontmatter + Markdown 正文。
- **渐进式披露**：
  - 层级一：仅加载元数据，约 100 tokens。
  - 层级二：匹配后加载完整 `SKILL.md`，通常 ≤ 5000 tokens。
  - 层级三：`references/` 等文件按需加载。
- **设计约束**：可调参数、MUST/NEVER 反模板规则、语义层约束。
- **验证闭环**：Playwright 像素对比、浏览器响应式验证。
- **分发方式**：`npx skills` CLI，符号链接，支持 29+ AI 代理，分项目级与全局级。

---

## 三、调用机制

| 方式     | 语法             | 可靠性         | 说明                 |
| :------- | :--------------- | :------------- | :------------------- |
| 显式调用 | `$技能名 + 任务` | 100% 生效      | Codex 中推荐         |
| 隐式调用 | 纯自然语言       | 取决于描述匹配 | 自动触发，不一定成功 |

- 自动触发由 `SKILL.md` 的 `description` 决定。
- 可通过 `agents/openai.yaml` 中 `policy.allow_implicit_invocation: true/false` 控制是否允许自动调用。
- 其他工具：Claude Code 用 `/skill`，Cursor 用 `/`，Gemini CLI 用 `gemini skills activate`。

示例：

```text
$ui-design 帮我做一个 SaaS 产品的落地页
```

---

## 四、Codex 使用流程

1. **安装**：

   ```bash
   $skill-installer install <GitHub 地址>
   ```

   或从精选列表安装：

   ```bash
   $skill-installer gh-address-comments
   ```

2. **重启 Codex**：技能仅在启动时扫描，安装后必须重启。

3. **调用**：

   ```text
   $ui-design 帮我做一个 SaaS 产品的落地页
   ```

4. **排查**：

   - `/skills` 查看已加载技能。
   - 检查技能名拼写。
   - 检查 `SKILL.md` 的 `name` 字段是否与 `$` 后名称一致。
   - 检查项目是否被 Codex 信任。
   - 检查文件大小是否超限。

5. **MCP**：部分技能需配置 MCP server：

   ```bash
   codex mcp add skills -- npx universal-skills mcp
   ```

---

## 五、安装范围与团队协作

| 范围           | 路径                                          | 作用         | 协作                |
| :------------- | :-------------------------------------------- | :----------- | :------------------ |
| 用户级（本机） | `~/.agents/skills/` 或旧版 `~/.codex/skills/` | 所有项目可用 | 仅个人              |
| 项目级（仓库） | `<项目>/.agents/skills/`                      | 仅当前项目   | 提交 Git 后团队共享 |

**关键结论**：

- `$skill-installer` **默认安装到本机用户级**，不装进项目。
- 多人协作应把技能放入项目 `.agents/skills/`，并提交 Git。
- `$skill-installer` 默认做不到项目级安装，需要手动放或指定项目级安装。

---

## 六、安装到项目的方法

1. **手动复制**：  
   把技能文件夹放入项目 `.agents/skills/`，然后：

   ```bash
   git add .agents/skills
   git commit -m "add frontend UI skills"
   ```

2. **使用 `codex-template`**：  

   ```bash
   npx codex-template@latest --skill creative-design/frontend-design --project
   ```

3. **使用 `npx skills add`**：  

   ```bash
   npx skills add <技能仓库地址> --project
   ```

4. **使用 `@alexandrealvaro/agentic`**：  

   ```bash
   npx --yes @alexandrealvaro/agentic@latest init --scope project --yes
   ```

5. **进阶 symlink**：  
   先把技能仓库克隆到中立目录，如 `~/.ai-agents/skills`，再软链接到项目 `.agents/skills/`。

> 注意：安装后需提交 `.agents/skills/` 到 Git，并确保项目被 Codex 信任。

---

## 七、`npx skills add` 与 Codex 识别

- Codex 读取路径：

  - 项目级：`./.agents/skills/`
  - 全局级：`~/.agents/skills/`

- `npx skills add` 默认可能装到 `./.codex/skills/` 或 `./.agents/skills/`。

- 稳妥安装：

  ```bash
  npx skills add <owner>/<repo> -a codex -g
  ```

- 项目级安装后，确认技能在 `./.agents/skills/`，否则手动移动。

- 安装后**重启 Codex**，再用 `$技能名` 调用。

- 检查 `SKILL.md` 中 `name` 字段与 `$` 后名称一致。

---

## 八、常见问题排查

| 问题               | 原因与解决                                          |
| :----------------- | :-------------------------------------------------- |
| 安装后技能不生效   | 最常见原因是未重启 Codex。                          |
| `$技能名` 没有反应 | 检查技能名拼写，运行 `/skills` 查看已加载技能。     |
| 技能加载报错       | 检查文件夹命名、`SKILL.md` 大小写。                 |
| 项目级技能不加载   | 项目可能未被 Codex 信任。                           |
| 技能内容被截断     | `SKILL.md` 过大，优先把详细资料放入 `references/`。 |
| 自动触发不成功     | 手动使用 `$技能名` 兜底。                           |

---

## 九、关键结论速览

- 技能安装后**对话可用**，但显式 `$技能名` 最可靠。
- 自然语言可自动触发，但依赖 `description` 匹配，不保证成功。
- Codex 技能默认装在**本机**，团队共享必须用**项目级 + Git**。
- `npx skills add` 后能否被 Codex 识别，取决于是否在 `.agents/skills/`。
- 推荐组合：**审美技能 → 组件库技能 → 质量审查技能**。