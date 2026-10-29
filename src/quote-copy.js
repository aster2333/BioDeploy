// Columns: en, zh-CN, zh-TW, ja. Current functional-assay estimate flow.
export const quoteMessages = {
  "packageCalculatorNote": [
    "Plan a batch using our target assay prices. Final scope, price and lab availability require review.",
    "按目标实验价格规划批次。最终范围、价格与实验室可用性需确认。",
    "依目標實驗價格規劃批次。最終範圍、價格與實驗室可用性須確認。",
    "目標アッセイ価格でバッチを計画。最終範囲・価格・ラボの提供状況は要確認。"
  ],
  "quoteQuantity": [
    "Number of variants (24–384)",
    "变体数量（24–384）",
    "變體數量（24–384）",
    "変異体数（24〜384）"
  ],
  "quantitySlider": [
    "Number of variants",
    "变体数量",
    "變體數量",
    "変異体数"
  ],
  "newBatchCount": [
    "{count} variants",
    "{count} 个变体",
    "{count} 個變體",
    "{count} 変異体"
  ],
  "newPanelCount": [
    "{count} panels",
    "{count} 个面板",
    "{count} 個面板",
    "{count} パネル"
  ],
  "newPanels": [
    "Six-condition panels per variant",
    "每变体的六条件面板数",
    "每變體的六條件面板數",
    "変異体あたりの 6 条件パネル数"
  ],
  "newIncludedReplicates": [
    "Included measurements",
    "所含测量",
    "所含量測",
    "含まれる測定"
  ],
  "newTier": [
    "Turnaround tier",
    "周期档位",
    "時程方案",
    "納期プラン"
  ],
  "newStandard": [
    "Standard · 21 days",
    "标准 · 21 天",
    "標準 · 21 天",
    "標準・21 日"
  ],
  "newRush": [
    "Rush · 14 days · +25% demo",
    "加急 · 14 天 · 演示加价 25%",
    "急件 · 14 天 · 示範加價 25%",
    "急行・14 日・デモ加算 25%"
  ],
  "newRushSurcharge": [
    "Rush surcharge (demo)",
    "加急附加费（演示）",
    "急件附加費（示範）",
    "急行加算（デモ）"
  ],
  "newUnitPanel": [
    "Base / variant / panel",
    "基础单价 / 变体 / 面板",
    "基礎單價 / 變體 / 面板",
    "基本額 / 変異体 / パネル"
  ],
  "newUnitVariant": [
    "Base / variant",
    "基础单价 / 变体",
    "基礎單價 / 變體",
    "基本額 / 変異体"
  ],
  "newUnitSequence": [
    "Base / sequence",
    "基础单价 / 序列",
    "基礎單價 / 序列",
    "基本額 / 配列"
  ],
  "newBase": [
    "Assays at included scope",
    "套餐范围内实验",
    "套組範圍內實驗",
    "基本範囲のアッセイ"
  ],
  "newCultures": [
    "Cultures in batch",
    "批次培养份数",
    "批次培養份數",
    "バッチ内の培養数"
  ],
  "newReactionWells": [
    "Sample reaction wells · excludes controls",
    "样品反应孔数 · 不含对照",
    "樣品反應孔數 · 不含對照",
    "試料反応ウェル数・対照は別"
  ],
  "newInvalidQuantity": [
    "Enter a whole number from 24 to 384.",
    "请输入 24–384 之间的整数。",
    "請輸入 24–384 之間的整數。",
    "24〜384 の整数を入力してください。"
  ],
  "newInvalidPanels": [
    "Choose 1 to 4 six-condition panels.",
    "请选择 1–4 个六条件面板。",
    "請選擇 1–4 個六條件面板。",
    "6 条件パネルを 1〜4 個選択してください。"
  ],
  "newInvalidTier": [
    "Choose Standard or Rush.",
    "请选择标准或加急档。",
    "請選擇標準或急件方案。",
    "標準または急行を選択してください。"
  ],
  "priceRules": [
    "Demo assumptions: $110 per kinetics variant (8 concentrations × 3 technical replicates); $85 per matrix variant per six-condition panel (3 technical replicates); $35 per expression sequence (1 culture). Multiply by batch size and panels. No volume discount. Rush adds 25%. These are planning rules, not verified supplier prices. Reaction-well counts exclude controls and are not time-series data-point counts.",
    "演示规则：动力学每变体 $110（8 浓度 × 3 次技术重复）；矩阵每变体、每六条件面板 $85（3 次技术重复）；表达每序列 $35（1 份培养）。按数量和面板数相乘，无批量折扣；加急加收 25%。这些是规划规则，非已核实的供应商报价。反应孔数不含对照，也不是时间序列数据点数。",
    "示範規則：動力學每變體 $110（8 濃度 × 3 次技術重複）；矩陣每變體、每六條件面板 $85（3 次技術重複）；表現每序列 $35（1 份培養）。依數量與面板數相乘，無批量折扣；急件加收 25%。這些是規劃規則，非已核實的供應商報價。反應孔數不含對照，也不是時間序列資料點數。",
    "デモ規則：速度論は変異体あたり $110（8 濃度 × 技術的反復 3 回）、マトリクスは変異体・6 条件パネルあたり $85（技術的反復 3 回）、発現は配列あたり $35（1 培養）。数量とパネル数を乗算し、数量割引は適用しません。急行は 25% 加算。計画用の規則であり、確認済みの供給価格ではありません。反応ウェル数は対照を含まず、時系列のデータ点数ではありません。"
  ],
  "inquiryScopeNote": [
    "Prepared enzyme is required for kinetics and matrix assays; expression QC requires ready-to-express plasmids. Synthesis, cloning, purification, active-site quantification, assay development, specialty reagents, Pichia expression, capillary analysis, tax, shipping and physical protein delivery are excluded.",
    "动力学与矩阵实验需已制备酶；表达质控需现成表达质粒。不含合成、克隆、纯化、活性位点定量、方法开发、特殊试剂、毕赤酵母表达、毛细管分析、税费、运输与蛋白实物交付。",
    "動力學與矩陣實驗需已製備酶；表現品管需現成表現質體。不含合成、選殖、純化、活性位點定量、方法開發、特殊試劑、畢赤酵母表現、毛細管分析、稅費、運輸與蛋白實物交付。",
    "速度論・マトリクスには調製済み酵素、発現 QC には発現用プラスミドが必要です。合成・クローニング・精製・活性部位定量・測定系開発・特殊試薬・Pichia 発現・キャピラリー解析・税・配送・タンパク質実物の納品は対象外。"
  ],
  "inquiryTimeline": [
    "Planning schedule after project confirmation and sample acceptance. Standard 21 days; Rush 14 days, subject to lab availability. Procurement or reruns may add time.",
    "项目确认与样品验收后的规划周期：标准 21 天，加急 14 天，须确认实验室排期。采购或复测可能延长时间。",
    "專案確認與樣品驗收後的規劃時程：標準 21 天，急件 14 天，須確認實驗室排程。採購或重測可能延長時間。",
    "案件確定・試料受領後の計画日程。標準 21 日、急行 14 日。ラボの空き状況を要確認。調達・再測定により延長する場合があります。"
  ],
  "faq7Copy": [
    "This calculator uses planning schedules of 21 calendar days for Standard and 14 for Rush after project confirmation and sample acceptance. Actual assay feasibility and lab availability must be confirmed; procurement and reruns may add time.",
    "计算器采用项目确认与样品验收后的规划周期：标准 21 个日历日，加急 14 天。实际实验可行性和实验室排期需确认；采购与复测可能延长时间。",
    "計算器採用專案確認與樣品驗收後的規劃時程：標準 21 個日曆日，急件 14 天。實際實驗可行性與實驗室排程須確認；採購與重測可能延長時間。",
    "計算機の計画日程は案件確定・試料受領後、標準 21 暦日、急行 14 日です。実施可否とラボの空き状況は要確認。調達や再測定で延長する場合があります。"
  ]
};
