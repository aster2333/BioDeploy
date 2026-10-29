# Biodeploy 产品需求文档

版本：0.4 · 更新：2026-10-29 · 定位来源：[New-intro.md](New-intro.md)

## 1. 愿景与产品定位

**The physical bedrock for bio-intelligence: Converting wet-lab reality into fuel for generative biology.**

生物智能的物理基石：将湿实验的真实结果转化为生成式生物学的燃料。

Biodeploy 是轻资产湿实验编排平台，连接 AI 原生酶 / 蛋白质设计团队与亚洲及全球高通量湿实验设施。核心价值是采集功能性实验真值，尤其是动态酶动力学 kcat、KM、kcat/KM、底物特异性及稳定性数据，将实验现实转化为可供模型训练与迭代使用的数据。

结合亲和力属于可选验证能力，不再作为核心产品叙事。酶催化动力学与结合动力学（Kd、kon、koff）必须明确区分，不能将现有结合示例改名后作为酶动力学数据。

## 2. 目标用户

- AI 原生蛋白质与工业酶设计初创企业。
- 生物基础模型与催化扩散模型研发团队。
- 缺乏自动化湿实验设施的高校计算生物学实验室。

## 3. 文档要求与实现状态

本文定义新目标产品。当前仍是无交易后端的四语言静态演示：工作台使用 binder 合成数据，报价器支持表达、结合与热稳定性、8–800 个候选、21 天演示周期。

本轮同步新定位文档、首页愿景、页面元信息与网络叙事；酶动力学工作台、新套餐报价引擎、24–384 数量范围、Rush 档和 Parquet 下载是后续实现要求，不以修改文档视为已经上线。现有技术状态以源码和 [QA.md](QA.md) 的历史记录为准。

所有科学示例、价格与周期仍须标注演示；真实上传、下单、支付、实验路由、API 和履约尚未实现。询价预览不发送邮件；邮箱仅存在当前页面及用户主动下载的草稿中。

## 4. 页面架构与首屏

顺序：首屏 → 酶动力学工作台 → 核心套餐 → 愿景 → 费用与周期估算 → 实验流程 → 联邦式湿实验网络 → API / 数据契约 → FAQ。

目标首屏：

- Headline：`Ground-Truth Enzyme Kinetics for Generative Biology.`
- Subheadline：`From FASTA to high-throughput catalytic validation (kcat, KM). Get ML-ready functional assay data at 1/4 the cost of Western robotic foundries, delivered in 14–21 days.`
- 主 CTA：`Estimate Kinetics Assay`。
- 次 CTA：`Explore Sample Kinetics Dataset (.parquet / .json)`。
- 双卡视觉：FASTA / 底物 SMILES 输入；Michaelis–Menten 曲线与 ML schema 预览。

1/4 成本和 14–21 天是新定位提出的目标文案。对外作为可兑现承诺前，需要成本基准和排期依据；当前演示不能将它们写成已验证业绩。未实现的格式下载不得显示成功。

首屏愿景采用本文件第 1 节原文。独立 `Why we do this` 区块标题为 `Intelligence needs physics.`，正文为 `We make complex enzyme kinetics as frictionless as cloud computing. By unlocking accessible wet-lab validation for computational teams, we convert real-world catalytic reality into continuous training fuel for generative biology.`。四语言同步，英文保持用户原句。

## 5. 产品工作台目标

路径由 `workspace/binder-validation` 转为 `workspace/enzyme-kinetics`（当前仅为目标工作台标识，不表示已建立真实路由）。

| 标签 | 内容 |
| --- | --- |
| Sequence & Substrates | FASTA 与底物 SMILES / 名称；保持候选和底物关联 |
| Continuous Kinetic Traces | 不同底物浓度下的连续吸光度 / 荧光时间序列 |
| Fitted Parameters | kcat、KM、kcat/KM、R²、QC 标记与不可拟合原因 |
| ML Data Export | JSON / Parquet，完整条件、原始数据、拟合与来源 |

连续轨迹图的横轴为时间；Michaelis–Menten 图的横轴为底物浓度、纵轴为初始反应速度。二者不能混用。kcat 的有效计算需要活性酶浓度依据；没有有效数据时保留 null 与原因，不伪造拟合。

## 6. 三类核心套餐（2026-10-29 审核修订）

采用 [PACKAGES_REVIEW.md](PACKAGES_REVIEW.md) 的范围和价格口径，覆盖 New-intro 第 3.3 节初稿。首页已实现三卡与详情弹窗，四语言同步；工作台和新报价引擎仍待实施。

| 套餐 | 基础范围 | USD 目标起价 |
| --- | --- | --- |
| Enzyme Kinetics Profiling | 已制备酶，1 底物 × 8 浓度 × 3 次技术重复，单缓冲液、单温度；空白 / 参考对照，非线性拟合及 QC | 110 / variant |
| Catalytic Matrix Screening | 已制备酶，6 底物或条件 × 3 次技术重复；一次改变一个因素，交付相对活性、热图与 QC | 85 / variant / panel |
| High-Throughput Expression QC | 现成质粒，E. coli 单宿主、单诱导条件、单培养；组分分离与 SDS-PAGE，产量估算及 QC | 35 / sequence |

起价假设 96 个标准化变体，尚非经供应商核算的商业价格。合成、克隆、纯化、方法开发、特殊试剂另计；Pichia 与毛细管分析、T50 与失活时间序列、完整全因子矩阵另行报价。kcat 与 kcat/KM 仅在活性酶浓度可靠时提供；不以 Lineweaver–Burk 线性拟合推导最终参数。周期经样品和方法审核确认。

## 7. 费用与周期计算器目标

- Number of Variants：24–384，手输与滑轨联动。
- Assay Type：Enzyme Kinetics (kcat / KM)、Substrate Matrix、Binding Affinity、Expression Only。
- Turnaround Tier：Standard（21 Days）与 Rush（14 Days）。
- 实时输出 USD 估算与连续时间序列数据点数，例如 `Yields 768 continuous time-series data points`。

新定位没有规定 Rush 加价、数量折扣、每条时间轨迹采样点数及 condition set 的具体构成。实现前须定义可追溯的演示规则，不从目标价格区间推导正式报价；数据点数按底物浓度 × 重复 × 采样点数等实际配置计算，不能固定显示 768。

沿用整数美分计算、无效输入清空旧金额、禁用下载、切换语言不改变金额的原则。现有 `src/quote.js` 的旧价格和 8–800 契约仅描述旧演示，不作为新计算器验收标准。

## 8. 数据与质量契约

目标数据应包含序列 / 底物关联、浓度及单位、时间及读数单位、初始反应速度、拟合参数及单位、R²、QC 和不可用原因，以及 pH、温度、buffer、batch ID、control blanks、方法版本与实验来源。

保留阴性、未表达、未测量和 QC 失败记录；未知量使用 null，不以 0 代替。原始数据、拟合和 QC 共同交付，图形与导出读取相同来源。JSON / Parquet 为新目标；现有 JSON / CSV binder 示例仍标为合成结合数据。

API 仅为设计预览，使用保留 `.example` 域名；不发起实验请求，不声称已有可调用服务。

## 9. 联邦式湿实验网络

对外名称：**The Federated Wet-Lab Mesh**。

目标为安全编排亚太与全球生物科技枢纽的高通量设施。设施审核与 GLP 合规性应逐一验证；标准化 SOP 包括校准板、每次运行的盲化阳性 / 阴性对照。DNA 与序列在下发前采用假名标识，结合访问控制和映射隔离保护 IP；不能将假名化视为序列完全匿名或绝对保密。

**Adaptyv Bio 不得作为供应商、网络节点名称或合作背书出现。** 瑞士地区可保留待确认占位。其他现有名称仅表示展示清单，不自动构成已确认合作、认证或可用容量。异常协调、复测、数据访问、保留和跨地区使用须在真实项目中确认。

## 10. 战略定位与发布边界

内部定位是轻资产编排、复杂催化实验、按样本计费与 ML 优先格式。New-intro 中的 `Why Biodeploy vs Foundries` 比较表本阶段不加入页面。

竞品成本、硬件投入和能力范围不能直接写成未经核实的事实；历史设计参考不构成供应关系。

## 11. 国际化与验收

保留 en / zh-CN / zh-TW / ja、语言偏好、键盘操作、焦点返回、减少动效支持和响应式约束。

本轮验收：首页静态英文与运行时四语言愿景一致，旧愿景被替换；没有 Adaptyv 供应商身份；文档明确新方向和实现差距；静态检查与构建通过。

后续产品验收：四个工作台标签与正确单位、三套餐范围、24 / 384 边界与非法输入、Standard / Rush、费用和数据点数来源、JSON / Parquet 负结果保留、四语言状态保持与 360 / 768 / 1440px 浏览器验证。旧 binder 检查通过不能替代酶动力学验收。
