# Product Requirements Document (PRD): Biodeploy Web Redesign

## 1. Executive Summary & Value Proposition
Biodeploy is an asset-light wet-lab orchestration platform that connects AI-native enzyme/protein design startups with cost-effective, high-throughput wet labs across Asia and globally. 
Unlike heavy-CapEx automated foundries (Adaptyv Bio, Ginkgo) that focus narrowly on static binding affinity (Kd), Biodeploy specializes in **functional ground-truth data collection**—specifically **dynamic enzyme kinetics (kcat, KM, catalytic efficiency, substrate specificity)** and stability profiles, delivering ML-ready tokens directly to Dry-lab models.

## 2. Target Audience
- AI-native protein and industrial enzyme design startups
- Foundation model biotech labs (e.g., ESM/EvolutionaryScale builders, catalytic diffusion modelers)
- Academic computational biology labs without automated wet-lab infrastructure

## 3. Core Page Architecture & Component Updates

### 3.1 Hero Section
- **Headline**: "Ground-Truth Enzyme Kinetics for Generative Biology."
- **Subheadline**: "From FASTA to high-throughput catalytic validation ($k_{cat}, K_M$). Get ML-ready functional assay data at 1/4 the cost of Western robotic foundries, delivered in 14-21 days."
- **CTAs**: 
  - Primary: "Estimate Kinetics Assay"
  - Secondary: "Explore Sample Kinetics Dataset (.parquet / .json)"
- **Hero Visual**: Dual-card layout:
  - Left: Input fasta / SMILES substrate.
  - Right: Interactive dynamic Michaelis-Menten curve (Velocity vs. [Substrate]) and exported ML schema preview.

### 3.2 Product Preview / Data Inspector (`workspace/binder-validation` -> `workspace/enzyme-kinetics`)
- Update the mock tabs:
  - Tab 1: `Sequence & Substrates` (FASTA sequence + Substrate SMILES/Name)
  - Tab 2: `Continuous Kinetic Traces` (Absorbance/Fluorescence over time at multiple substrate concentrations)
  - Tab 3: `Fitted Parameters` ($k_{cat}$, $K_M$, $k_{cat}/K_M$, $R^2$, QC Flags)
  - Tab 4: `ML Data Export` (Download structured JSON/Parquet with full experimental metadata: pH, temp, buffer, batch ID, control blanks)

### 3.3 Core Packages & Assays Grid
Replace the generic 3 packages with:
1. **Dynamic Enzyme Kinetics ($k_{cat} / K_M$)**
   - *Scope*: Multi-concentration substrate titrations, continuous spectrophotometric/fluorometric assays.
   - *Deliverables*: Reaction velocities, Michaelis-Menten curves, fitted kinetic constants, assay QC.
   - *Target Price Demo*: ~$120–$180 / variant (96-well format).
2. **Substrate Specificity & Multi-condition Matrix**
   - *Scope*: Screen enzyme variants across panels of alternate substrates, varied pH (5.0–9.0), and thermal gradients.
   - *Deliverables*: Relative activity heatmaps, tolerance thresholds, inhibitor sensitivity.
   - *Target Price Demo*: ~$90–$140 / condition set.
3. **High-Throughput Expression & Solubility Screen**
   - *Scope*: E. coli or Pichia pastoris cell-free / micro-scale expression confirmation.
   - *Deliverables*: Yield estimates, soluble vs. insoluble fraction quantification.
   - *Target Price Demo*: ~$35–$50 / sequence.

### 3.4 Competitive Moat & Strategic Positioning (这个部分先不要加: "Why Biodeploy vs Foundries")
Create a 3-column comparative table:
- **Biodeploy**: Asset-light router, focuses on complex kinetics & biocatalysis, 3-5x lower cost, pay-per-sample, ML-first data formats.
- **In-House / High-CapEx Foundries (e.g., Adaptyv Bio / Ginkgo)**: $10M+ hardware CapEx, optimized for static binding/affinity (Kd), rigid microfluidic setups, high lock-in.
- **Traditional CROs**: Slow PDF reports, opaque manual quoting, manual back-and-forth, zero ML data standardizations.

### 3.5 Global Execution Network (`Lab delivery network`)
- **CRITICAL**: Remove any reference to Adaptyv Bio as a supplier.
- Frame as **"The Federated Wet-Lab Mesh"**:
  - Securely orchestrating jobs across vetted, GLP-compliant high-throughput facilities in APAC and global bio-hubs.
  - Standardized SOPs: Rigorous calibration plates, blinded negative/positive controls in every run.
  - End-to-end IP protection: Synthetic DNA and sequences pseudonymized before lab dispatch.

### 3.6 Interactive Cost & Turnaround Calculator
- Update input parameters:
  - `Number of Variants` (Slider: 24 to 384)
  - `Assay Type`: [Enzyme Kinetics ($k_{cat}/K_M$), Substrate Matrix, Binding Affinity, Expression Only]
  - `Turnaround Tier`: Standard (21 Days) vs Rush (14 Days)
- Live calculations adjusting estimated USD and data point count (e.g., "Yields 768 continuous time-series data points").
