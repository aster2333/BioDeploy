// Every candidate, trace, QC value and provenance record here is synthetic.
const fitAt = (time, scale) => {
  const association = 84 * (1 - Math.exp(-Math.max(time - 12, 0) / 20));
  const dissociation = 84 * (1 - Math.exp(-108 / 20)) * Math.exp(-Math.max(time - 120, 0) * 0.006);
  return (time <= 120 ? association : dissociation) * scale;
};
const makeTraces = (kind) => [1, 0.67].map((scale, index) => ({
  id: `trace_${index + 1}`,
  points: Array.from({ length: 71 }, (_, point) => {
    const time = point * 3;
    const response = kind === 'negative' ? Math.sin(point * 0.9 + index) * 0.6
      : kind === 'flagged' ? fitAt(time, scale) + Math.sin(point * 0.44) * 7 + time * 0.13
        : fitAt(time, scale) + (kind === 'raw' ? Math.sin(point * 1.7 + index) * 0.8 : 0);
    return { time_s: time, response_ru: Number(response.toFixed(3)) };
  }),
}));
const raw = makeTraces('raw');
const fitted = makeTraces('fit');
const errors = raw.flatMap((trace, index) => trace.points.map((point, i) => Math.abs(point.response_ru - fitted[index].points[i].response_ru)));
const provenance = { synthetic: true, lab_id: 'DEMO-LAB-01', protocol_id: 'DEMO-SPR-01', protocol_version: '0.2', batch_id: 'DEMO-BATCH-01', instrument_family: 'SPR — illustrative' };

export const sampleData = {
  schema_version: '0.2', synthetic: true,
  disclaimer: 'All sequences, measurements, fits, QC and provenance are illustrative. Not experimental results.',
  assay: { method: 'SPR', response_unit: 'RU', time_unit: 's' },
  candidates: [
    { id: 'binder_001', expression: 'detected', binding: 'detected', outcome: 'binder', reason_key: 'reasonBinder',
      illustrative_estimate: { kd: 12.4, unit: 'nM' }, raw_traces: raw, fitted_traces: fitted,
      qc: { synthetic: true, status: 'pass_example', mae_ru: Number((errors.reduce((sum, x) => sum + x, 0) / errors.length).toFixed(3)) }, provenance: { ...provenance } },
    { id: 'binder_002', expression: 'detected', binding: 'not_detected', outcome: 'negative', reason_key: 'reasonNegative',
      illustrative_estimate: { kd: null, unit: 'nM' }, raw_traces: makeTraces('negative'), fitted_traces: [],
      qc: { synthetic: true, status: 'negative_example', mae_ru: null }, provenance: { ...provenance } },
    { id: 'binder_003', expression: 'not_detected', binding: 'not_measured', outcome: 'unexpressed', reason_key: 'reasonUnexpressed',
      illustrative_estimate: { kd: null, unit: 'nM' }, raw_traces: [], fitted_traces: [],
      qc: { synthetic: true, status: 'not_measured', mae_ru: null }, provenance: { ...provenance } },
    { id: 'binder_004', expression: 'detected', binding: 'unknown', outcome: 'flagged', reason_key: 'reasonFlagged',
      illustrative_estimate: { kd: null, unit: 'nM' }, raw_traces: makeTraces('flagged'), fitted_traces: [],
      qc: { synthetic: true, status: 'review_example', mae_ru: null }, provenance: { ...provenance } },
  ],
};

export function sampleCsv(data = sampleData) {
  const header = 'schema_version,synthetic,sequence_id,outcome,expression,binding,qc_status,kind,trace_id,time_s,response_ru,kd_nM,protocol_id,batch_id';
  const rows = data.candidates.flatMap((candidate) => {
    const prefix = [data.schema_version, true, candidate.id, candidate.outcome, candidate.expression, candidate.binding, candidate.qc.status];
    const suffix = [candidate.illustrative_estimate.kd ?? '', candidate.provenance.protocol_id, candidate.provenance.batch_id];
    const measurements = ['raw', 'fitted'].flatMap((kind) => candidate[`${kind}_traces`].flatMap((trace) => trace.points.map((point) => [...prefix, kind, trace.id, point.time_s, point.response_ru, ...suffix].join(','))));
    return measurements.length ? measurements : [[...prefix, '', '', '', '', ...suffix].join(',')];
  });
  return `${header}\r\n${rows.join('\r\n')}\r\n`;
}
