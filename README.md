# Biodeploy

专业产品演示外壳 v0.2：Sequence in. Discovery out.

## 当前交付

- 硅谷开发者平台风格的响应式首页：首屏、产品工作台预览、验证套餐、全球交付网络。
- 右上角完整语言切换：English、简体中文、繁體中文、日本語。默认英文，刷新保留手动偏好。
- 语言与交付地区独立；中国、美国、澳大利亚分别提供网络示意视图。
- 可切换的输入 / 实验 / 结果预览，四个合成候选及 Raw / Fit / QC 视图。
- 表达、结合初筛、亲和力表征规格，USD 演示报价器与演示估算 JSON 下载。
- 五阶段可检查里程碑、跨实验室交付原则、API 契约预览与六组 FAQ。
- 合成示例 JSON / CSV 下载，保留阴性、未表达与 QC 异常。
- 字体本地提供，运行时无第三方请求和生产依赖。

当前是网站外壳。真实上传、自动预检、商业报价、登录、下单和实验交付尚未实现。演示报价完全在浏览器本地计算，不是正式报价；保存只下载 JSON，不提交实验。API 使用保留的 `.example` 域名，不调用网络服务。所有实验数据均为合成示例，地区图不表示已确认的实验室或可用容量。

## 本地运行

要求 Node.js 20 或更新版本，无需安装依赖。

```sh
npm run dev
```

访问 <http://127.0.0.1:4173>。如端口被占用：`PORT=4174 npm run dev`。

```sh
npm run check
npm run build
npm run preview
```

构建结果在 `dist/`，可部署到支持静态文件的网站服务。`preview` 和 `dev` 默认使用同一端口，先停止其中一个，或给另一进程指定不同的 `PORT`。

## 文档与源码

- [产品需求文档](docs/PRD.md)
- [设计规范与参考锁定](docs/DESIGN_SPEC.md)
- `index.html`：语义化页面与 SVG 图形。
- `src/styles.css`：设计令牌、组件、响应式和 CJK 排版。
- `src/locales.js`：四语言完整文案矩阵。
- `src/app.js`：语言、预览阶段、地区、弹窗及本地导出。
- `src/sample-data.js`：图表与导出共同使用的四类合成候选与 CSV 序列化。
- `src/quote.js`：以整数美分计算的纯演示报价模块。
- `src/experience-copy.js`：本轮新增模块的四语言文案。
- `scripts/`：本地服务、静态构建与结构/国际化检查。
- `public/fonts/`：Geist / Geist Mono 及 SIL Open Font License。

语言偏好键为 `biodeploy.locale`。浏览器禁止持久化时，当前会话仍可正常切换。四语言共用一个 URL；后续可增加语言路由和 SEO 页面。

## 设计来源

前期通过 Refero 检索并分析 Vercel、SST、Axiom、Mapbox、Steel、Clay、Mercury 和 Weights & Biases。具体采用范围及链接见设计规范。v0.2 根据 Adaptyv 研究补充套餐深度、报价、数据质量和交付责任；商业价格与服务承诺仍需另行确认。
