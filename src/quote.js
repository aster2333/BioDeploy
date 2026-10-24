// Illustrative USD pricing only. This module never submits an experiment.
export const demoCatalog = {
  expression: { service: 'expression', includedReplicates: 2, baseUnitCents: 4500, days: [21, 21], nameKey: 'expressionName', scopeKey: 'quoteExpressionScope', methodKey: 'expressionMethod' },
  screening: { service: 'binding', includedReplicates: 2, baseUnitCents: 8900, days: [21, 21], nameKey: 'screeningName', scopeKey: 'quoteScreeningScope', methodKey: 'binderMethod' },
  affinity: { service: 'binding', includedReplicates: 2, baseUnitCents: 13900, days: [21, 21], nameKey: 'affinityName', scopeKey: 'quoteAffinityScope', methodKey: 'binderMethod' },
  thermostability: { service: 'thermostability', includedReplicates: 1, baseUnitCents: 9900, days: [21, 21], nameKey: 'thermostabilityName', scopeKey: 'quoteThermostabilityScope', methodKey: 'thermostabilityMethod' },
};

export function calculateDemoQuote({ mode, quantity, replicates, targets, conditions = 1 }) {
  if (!Object.hasOwn(demoCatalog, mode)) return { valid: false, errorKey: 'invalidMode' };
  const entry = demoCatalog[mode];
  if (!Number.isInteger(quantity) || quantity < 8 || quantity > 800) return { valid: false, errorKey: 'invalidQuantity' };
  if (!Number.isInteger(replicates) || replicates < entry.includedReplicates || replicates > 4) return { valid: false, errorKey: mode === 'thermostability' ? 'invalidThermalReplicates' : 'invalidReplicates' };
  const targetCount = entry.service === 'binding' ? targets : 1;
  if (![1, 2, 3].includes(targetCount)) return { valid: false, errorKey: 'invalidTargets' };
  const conditionCount = mode === 'thermostability' ? conditions : 1;
  if (![1, 2, 3, 4].includes(conditionCount)) return { valid: false, errorKey: 'invalidConditions' };
  const bandFactor = quantity < 48 ? 1.15 : quantity < 96 ? 1.08 : quantity < 192 ? 1 : 0.92;
  const unitCents = Math.round(entry.baseUnitCents * bandFactor);
  const baseCents = unitCents * quantity * targetCount * conditionCount;
  const extraReplicateCents = Math.round(baseCents * 45 * (replicates - entry.includedReplicates) / 100);
  return {
    valid: true, synthetic: true, not_a_quote: true, currency: 'USD',
    configuration: { service: entry.service, mode, quantity, replicates, targets: targetCount, conditions: conditionCount },
    included_replicates: entry.includedReplicates,
    unit_cents: unitCents, base_cents: baseCents,
    extra_replicate_cents: extraReplicateCents, total_cents: baseCents + extraReplicateCents,
    illustrative_days: [...demoCatalog[mode].days],
    exclusions: ['target_materials', 'taxes', 'shipping', 'physical_protein'],
  };
}
