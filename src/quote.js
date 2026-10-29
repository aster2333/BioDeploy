// Planning estimates only; no experiment is submitted and no commercial quote is issued.
export const demoCatalog = {
  kinetics: { service: 'kinetics', includedReplicates: 3, baseUnitCents: 11000, pointsPerPanel: 8, nameKey: 'kineticsName', scopeKey: 'kineticsDepth', methodKey: 'kineticsMethod' },
  matrix: { service: 'matrix', includedReplicates: 3, baseUnitCents: 8500, pointsPerPanel: 6, nameKey: 'matrixName', scopeKey: 'matrixDepth', methodKey: 'matrixMethod' },
  expressionQc: { service: 'expressionQc', includedReplicates: 1, baseUnitCents: 3500, pointsPerPanel: 1, nameKey: 'expressionQcName', scopeKey: 'expressionQcDepth', methodKey: 'expressionQcMethod' },
};
export const turnaroundTiers = { standard: { days: 21, surchargePercent: 0 }, rush: { days: 14, surchargePercent: 25 } };

export function calculateDemoQuote({ mode, quantity, panels = 1, tier = 'standard' }) {
  if (!Object.hasOwn(demoCatalog, mode)) return { valid: false, errorKey: 'invalidMode' };
  if (!Number.isInteger(quantity) || quantity < 24 || quantity > 384) return { valid: false, errorKey: 'newInvalidQuantity' };
  if (!Object.hasOwn(turnaroundTiers, tier)) return { valid: false, errorKey: 'newInvalidTier' };
  const entry = demoCatalog[mode];
  const panelCount = mode === 'matrix' ? panels : 1;
  if (!Number.isInteger(panelCount) || panelCount < 1 || panelCount > 4) return { valid: false, errorKey: 'newInvalidPanels' };
  const baseCents = entry.baseUnitCents * quantity * panelCount;
  const rushCents = Math.round(baseCents * turnaroundTiers[tier].surchargePercent / 100);
  return {
    valid: true, schema_version: '2.0', synthetic: true, not_a_quote: true, currency: 'USD',
    pricing_basis: 'illustrative_target_prices_not_supplier_verified',
    configuration: { service: entry.service, mode, quantity, panels: panelCount, tier, replicates: entry.includedReplicates },
    scope: { points_per_panel: entry.pointsPerPanel, replicate_type: mode === 'expressionQc' ? 'single_culture' : 'technical', controls_included: mode !== 'expressionQc', prepared_enzyme_required: mode !== 'expressionQc', ready_expression_plasmid_required: mode === 'expressionQc' },
    included_replicates: entry.includedReplicates,
    unit_cents: entry.baseUnitCents, base_cents: baseCents, rush_cents: rushCents,
    total_cents: baseCents + rushCents,
    sample_measurement_count: quantity * panelCount * entry.pointsPerPanel * entry.includedReplicates,
    measurement_count_basis: mode === 'expressionQc' ? 'cultures_not_time_series_points' : 'sample_reaction_wells_excluding_controls_not_time_series_points',
    illustrative_days: [turnaroundTiers[tier].days, turnaroundTiers[tier].days],
    assumptions: { rush_surcharge_percent: turnaroundTiers[tier].surchargePercent, volume_discount_percent: 0, supplier_costs_verified: false, schedule_requires_confirmation: true },
    exclusions: ['gene_synthesis', 'cloning', 'purification', 'active_site_quantification', 'assay_development', 'specialty_reagents', 'pichia_expression', 'capillary_analysis', 'taxes', 'shipping', 'physical_protein'],
  };
}
