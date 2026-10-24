// Synthetic fixture only. No file contents or experiment data leave this browser.
export const sampleData = {
  schema_version: '0.1',
  synthetic: true,
  disclaimer: 'Illustrative data, not experimental measurements.',
  sequence_id: 'binder_001',
  assay: { method: 'SPR', response_unit: 'RU', time_unit: 's', qc_status: 'not_assessed' },
  illustrative_estimate: { kd: 12.4, unit: 'nM' },
  traces: [1, 0.67].map((scale, index) => ({
    id: `example_trace_${index + 1}`,
    points: Array.from({ length: 71 }, (_, point) => {
      const time = point * 3;
      const association = 84 * (1 - Math.exp(-Math.max(time - 12, 0) / 20));
      const dissociation = 84 * (1 - Math.exp(-108 / 20)) * Math.exp(-Math.max(time - 120, 0) * 0.006);
      return { time_s: time, response_ru: Number(((time <= 120 ? association : dissociation) * scale).toFixed(3)) };
    }),
  })),
};
