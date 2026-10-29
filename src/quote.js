// Planning estimates only; no experiment is submitted and no commercial quote is issued.
export const demoCatalog = {
  kinetics: { service: 'kinetics', includedReplicates: 3, baseUnitCents: 11000, pointsPerPanel: 8, nameKey: 'kineticsName', scopeKey: 'kineticsDepth', methodKey: 'kineticsMethod' },
  matrix: { service: 'matrix', includedReplicates: 3, baseUnitCents: 8500, pointsPerPanel: 6, nameKey: 'matrixName', scopeKey: 'matrixDepth', methodKey: 'matrixMethod' },
  expressionQc: { service: 'expressionQc', includedReplicates: 1, baseUnitCents: 8000, pointsPerPanel: 1, nameKey: 'expressionQcName', scopeKey: 'expressionQcDepth', methodKey: 'expressionQcMethod' },
};
export const substrateCatalog = [
  { id: 'pnpa', label: 'pNPA / pNPB / pNPP · esterases & lipases · 405 nm' },
  { id: 'nitrocefin', label: 'Nitrocefin · β-lactamases · 486 nm' },
  { id: 'peptides', label: 'Suc-AAPF-pNA / AMC-peptides · proteases · absorbance / fluorescence' },
  { id: 'redox', label: 'ABTS / Guaiacol · oxidoreductases · absorbance' },
  { id: 'glycosides', label: 'pNP-Gal / pNP-Glc · glycosidases · 405 nm' },
  { id: 'nadh', label: 'NADH / NADPH coupling · compatible reactions · 340 nm' },
];
// Unverified planning targets, not supplier costs or a commercial offer.
export const stageOnePricing = { synthesisUnitCents: 4500, proteinGateUnitCents: 3500 };
export const turnaroundTiers = { standard: { days: 21, surchargePercent: 0 }, rush: { days: 14, surchargePercent: 25 } };

export function calculateDemoQuote({ mode, quantity, panels = 1, tier = 'standard', passedQuantity = quantity, substrateId = 'pnpa' }) {
  if (!Object.hasOwn(demoCatalog, mode)) return { valid: false, errorKey: 'invalidMode' };
  if (!Number.isInteger(quantity) || quantity < 24 || quantity > 384) return { valid: false, errorKey: 'newInvalidQuantity' };
  if (!Object.hasOwn(turnaroundTiers, tier)) return { valid: false, errorKey: 'newInvalidTier' };
  if (!substrateCatalog.some((item) => item.id === substrateId)) return { valid: false, errorKey: 'invalidSubstrate' };
  if (!Number.isInteger(passedQuantity) || passedQuantity < 0 || passedQuantity > quantity) return { valid: false, errorKey: 'invalidPassedQuantity' };
  const entry = demoCatalog[mode];
  const panelCount = mode === 'matrix' ? panels : 1;
  if (!Number.isInteger(panelCount) || panelCount < 1 || panelCount > 4) return { valid: false, errorKey: 'newInvalidPanels' };
  const synthesisCents = stageOnePricing.synthesisUnitCents * quantity;
  const proteinGateCents = stageOnePricing.proteinGateUnitCents * quantity;
  const stageTwoCents = mode === 'expressionQc' ? 0 : entry.baseUnitCents * passedQuantity * panelCount;
  const baseCents = synthesisCents + proteinGateCents + stageTwoCents;
  const rushCents = Math.round(baseCents * turnaroundTiers[tier].surchargePercent / 100);
  return {
    valid: true, schema_version: '3.0', synthetic: true, not_a_quote: true, currency: 'USD',
    pricing_basis: 'illustrative_target_prices_not_supplier_verified',
    configuration: { service: entry.service, mode, quantity, panels: panelCount, tier, substrate_id: substrateId, estimated_passed_quantity: mode === 'expressionQc' ? 0 : passedQuantity, replicates: entry.includedReplicates },
    scope: { points_per_panel: entry.pointsPerPanel, replicate_type: mode === 'expressionQc' ? 'single_culture' : 'technical', controls_included: mode !== 'expressionQc', digital_fasta_input: true, gene_synthesis_and_cloning_included: true, purification_and_concentration_included: true, stage_two_requires_gate_pass: true, gate_thresholds_require_project_agreement: true },
    included_replicates: entry.includedReplicates,
    unit_cents: mode === 'expressionQc' ? 8000 : entry.baseUnitCents, synthesis_cents: synthesisCents, protein_gate_cents: proteinGateCents, stage_two_cents: stageTwoCents, base_cents: baseCents, rush_cents: rushCents,
    total_cents: baseCents + rushCents,
    sample_measurement_count: (mode === 'expressionQc' ? quantity : passedQuantity) * panelCount * entry.pointsPerPanel * entry.includedReplicates,
    measurement_count_basis: mode === 'expressionQc' ? 'cultures_not_time_series_points' : 'sample_reaction_wells_excluding_controls_not_time_series_points',
    illustrative_days: [turnaroundTiers[tier].days, turnaroundTiers[tier].days],
    assumptions: { rush_surcharge_percent: turnaroundTiers[tier].surchargePercent, volume_discount_percent: 0, supplier_costs_verified: false, schedule_requires_confirmation: true },
    exclusions: ['active_site_quantification', 'assay_development', 'specialty_reagents', 'pichia_expression', 'capillary_analysis', 'taxes', 'shipping', 'physical_protein'],
  };
}
