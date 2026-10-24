// Illustrative USD pricing only. This module never submits an experiment.
export const demoCatalog = {
  expression: { baseUnitCents: 4500, days: [14, 21], nameKey: 'expressionName', scopeKey: 'quoteExpressionScope' },
  screening: { baseUnitCents: 8900, days: [14, 21], nameKey: 'screeningName', scopeKey: 'quoteScreeningScope' },
  affinity: { baseUnitCents: 13900, days: [21, 28], nameKey: 'affinityName', scopeKey: 'quoteAffinityScope' },
};

export function calculateDemoQuote({ mode, quantity, replicates, targets }) {
  if (!Object.hasOwn(demoCatalog, mode)) return { valid: false, errorKey: 'invalidMode' };
  if (!Number.isInteger(quantity) || quantity < 8 || quantity > 384) return { valid: false, errorKey: 'invalidQuantity' };
  if (![2, 3, 4].includes(replicates)) return { valid: false, errorKey: 'invalidReplicates' };
  const targetCount = mode === 'expression' ? 1 : targets;
  if (![1, 2, 3].includes(targetCount)) return { valid: false, errorKey: 'invalidTargets' };
  const bandFactor = quantity < 48 ? 1.15 : quantity < 96 ? 1.08 : quantity < 192 ? 1 : 0.92;
  const unitCents = Math.round(demoCatalog[mode].baseUnitCents * bandFactor);
  const baseCents = unitCents * quantity * targetCount;
  const extraReplicateCents = Math.round(baseCents * 45 * (replicates - 2) / 100);
  return {
    valid: true, synthetic: true, not_a_quote: true, currency: 'USD',
    configuration: { mode, quantity, replicates, targets: targetCount },
    unit_cents: unitCents, base_cents: baseCents,
    extra_replicate_cents: extraReplicateCents, total_cents: baseCents + extraReplicateCents,
    illustrative_days: [...demoCatalog[mode].days],
    exclusions: ['target_materials', 'taxes', 'shipping', 'physical_protein'],
  };
}
