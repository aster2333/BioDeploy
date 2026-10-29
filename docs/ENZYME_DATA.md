# 酶动力学合成示例数据契约

更新：2026-10-29。实现：`src/sample-data.js`、`src/kinetics-chart.js`、`src/kinetics-copy.js`。替代旧 binder / SPR 示例；本文件定义当前演示，不代表真实实验能力。

## 1. 范围与来源

`sampleData` 是工作台图形、候选表、首页小图、JSON / CSV 下载和组件参考页共同使用的科学数据源。数据类型 `enzyme_kinetics`，独立数据 schema 1.0；费用 / 询价 schema 2.0 保持独立。

序列、底物、校准、读数、对照、拟合、QC、实验室和批次均为合成。短序列为占位示例，不是经验证的酶；底物名为 fictional Synthetic fluorogenic substrate A，SMILES 为 null，不虚构化学结构。每个候选有自己的 ID、序列与 sequence_status；输入视图展示 enzyme_001。

## 2. 实验示例

- 连续荧光检测：时间 0–120 s，步长 5 s，共 25 个点。
- 底物浓度：5 / 10 / 20 / 40 / 80 / 160 / 320 / 640 µM，每浓度 3 次技术重复，每个已测候选 24 条轨迹。
- pH 7.5，25 °C，50 mM HEPES / 150 mM NaCl；仅为示例条件。
- 原始信号 RFU；校准斜率 1000 RFU/µM，模拟截距 100 RFU。每条轨迹关联一个底物匹配空白；扣除对应空白后换算产物 µM。负读数保留，不裁剪成零。
- 共用 8 条空白、1 条阳性参考，每条 25 个点，保留在 JSON 与 CSV 中。阳性参考底物 80 µM。

## 3. 从信号到参数

每条轨迹使用 0–60 s 的点，以带截距线性回归计算初始速度（µM/s）。拟合使用全部 24 个初速，直接最小化 Michaelis–Menten 模型 `v = Vmax * S / (KM + S)` 的无权残差平方和。

实现对 KM 作有界黄金分割搜索（0.01–2000 µM），每个 KM 下解析计算 Vmax。用于此受控合成模型，不是通用实验分析软件；真实测量需要更完整的模型选择、权重、误差与适用性验证。

有效例的模拟真值：KM 60 µM、Vmax 0.01 µM/s，活性位点浓度 0.002 µM。拟合后约为 KM 59.997 µM、Vmax 0.00999986 µM/s、kcat 4.99993 s⁻¹、kcat/KM 83,335.7 M⁻¹s⁻¹、R² 0.999649。

`kcat = Vmax / active_enzyme_concentration_uM`；效率计算先将 KM 转成 M。活性浓度是**已知模拟输入**，不是由总蛋白读数推算的真实活性浓度。标准误由初速拟合的局部 Jacobian 协方差估计，不包含酶浓度不确定性；不将其当作完整置信区间。

连续曲线横轴时间、纵轴扣空白产物；拟合图横轴底物浓度、纵轴初速。散点来自相同 initial_rates，线来自相同 fitted_curve。不得把 KM 称作结合亲和常数，或用 Lineweaver–Burk 线性拟合计算参数。

## 4. 四种候选状态

| ID | 状态 | 原始数据 | 可信拟合 |
| --- | --- | --- | --- |
| enzyme_001 | active / 活性可检出 | 24 × 25 个点 | 65 点 Michaelis–Menten 曲线；参数有效 |
| enzyme_002 | negative / 低于检测限 | 24 × 25 个点，含负噪声 | 参数全为 null；不声称零活性 |
| enzyme_003 | unexpressed / 未表达 | 无测量；原始和初速数组为空 | 参数全为 null |
| enzyme_004 | flagged / 初速窗口非线性漂移 | 24 × 25 个点与初速保留 | 不发布可信拟合，参数全为 null |

QC 包括状态、flags、初速拟合 RMSE、最大底物消耗比例、最大技术重复 CV、示例初速检测限 0.00001 µM/s。有效例消耗 <2%、重复 CV <2%；这些阈值与标签只用于合成示例，不是经过认证的实验验收。

## 5. 导出

文件名：`biodeploy-synthetic-enzyme-kinetics.json` / `.csv`。两者导出完整四候选数据，不因当前所选候选或视图丢弃阴性 / 异常记录。当前支持 JSON / CSV；不展示未实现的 Parquet 下载。

JSON 保留输入、实验条件、校准、对照、全部候选的 raw_traces、initial_rates、fitted_curve、fitted_parameters、QC 和来源。

CSV 是长表，2163 条记录（不含表头）：1800 raw + 72 initial_rate + 65 fitted_MM + 1 not_measured + 200 control_blank + 25 control_positive。字段包含序列 / 底物、单位、读数、初速、参数、标准误、活性浓度依据、QC、pH、温度、buffer、校准、方法版本、实验室与批次。空字段表示 null；数值 0 与负值保留；buffer 含逗号，按 CSV 标准引用，不能用简单逗号拆分解析。

## 6. 页面、语言与验证

工作台采用序列与底物 → 动力学范围 → 动力学结果；结果内含连续曲线 / 拟合参数 / 质控与来源三个视图。四语言更新轴、状态、原因、空态、元数据、FAQ 与关联说明；候选 ID、技术键、单位保持稳定。语言和候选切换保留所选结果视图。

首页小图同样使用有效例 Michaelis–Menten 数据；API 请求与 QC 异常事件使用相同 schema / 字段。组件参考页采用相同酶结果，按 kcat 排序和筛选。

自动验证检查参数与独立真值、单位换算、初速量级、扣空白一致性、时间单调性、低于检测限与未表达边界、CSV 引用与零 / null、四语言键以及旧结合数据是否移除。浏览器验证图形、四候选、三视图、键盘恢复、四语言与 360 / 768 / 1440px，另核对实际生成的导出内容。

科学依据：[GraphPad Michaelis–Menten 模型](https://www.graphpad.com/guides/prism/latest/curve-fitting/reg_michaelis_menten_enzyme.htm)。该来源支持模型与活性位点浓度关系，不验证本项目的合成读数或真实实验能力。
