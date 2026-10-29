// Synthetic enzyme activity examples. No sequence, assay, instrument or fit is experimental evidence.
const round = (value) => Number(value.toPrecision(10));
const demoSequence = 'MKTAYIAKQRQISFVKSHFSRQDILDLWIYHTQGYFPQGQGQKVEVIKPAGVETLKE';
const substrates = [5, 10, 20, 40, 80, 160, 320, 640];
const times = Array.from({ length: 25 }, (_, i) => i * 5);
const enzymeConcentration = 0.002; // µM active sites; known only inside this simulation.
const calibration = { slope_rfu_per_uM: 1000, intercept_rfu: 100, synthetic: true };
const velocity = (substrate, km = 60, vmax = 0.01) => vmax * substrate / (km + substrate);
const blankSignal = (time, index) => 100 + 0.2 * Math.sin(time / 11 + index);
const provenance = { synthetic: true, lab_id: 'DEMO-LAB-01', protocol_id: 'DEMO-ENZ-FL-01', protocol_version: '1.0', batch_id: 'DEMO-ENZ-BATCH-01', instrument_family: 'fluorescence microplate reader — illustrative' };
const controls = {
  blanks: substrates.map((substrate, index) => ({ id: `blank_${index + 1}`, substrate_uM: substrate, points: times.map((time) => ({ time_s: time, signal_rfu: round(blankSignal(time, index)) })) })),
  positive_reference: { id: 'reference_positive', substrate_uM: 80, points: times.map((time) => ({ time_s: time, signal_rfu: round(blankSignal(time, 4) + velocity(80) * time * 1000) })) },
};
function makeTraces(kind) {
  return substrates.flatMap((substrate, index) => [1, 2, 3].map((replicate) => ({
    id: `s${index + 1}_r${replicate}`, substrate_uM: substrate, replicate, blank_id: `blank_${index + 1}`,
    points: times.map((time, point) => {
      const rate = kind === 'negative' ? 0 : velocity(substrate) * (1 + (replicate - 2) * 0.012);
      const product = rate * time + (kind === 'flagged' ? 0.00002 * time * time : 0) + Math.sin(point * 1.7 + replicate + index) * 0.00015;
      const signal = round(blankSignal(time, index) + product * calibration.slope_rfu_per_uM);
      return { time_s: time, signal_rfu: signal, blank_corrected_product_uM: round((signal - controls.blanks[index].points[point].signal_rfu) / calibration.slope_rfu_per_uM) };
    }),
  })));
}
function initialRate(trace) {
  const points = trace.points.filter(({ time_s }) => time_s <= 60);
  const meanX = points.reduce((sum, p) => sum + p.time_s, 0) / points.length;
  const meanY = points.reduce((sum, p) => sum + p.blank_corrected_product_uM, 0) / points.length;
  const slope = points.reduce((sum, p) => sum + (p.time_s - meanX) * (p.blank_corrected_product_uM - meanY), 0) / points.reduce((sum, p) => sum + (p.time_s - meanX) ** 2, 0);
  return { trace_id: trace.id, substrate_uM: trace.substrate_uM, replicate: trace.replicate, velocity_uM_s: round(slope), window_start_s: 0, window_end_s: 60 };
}
// Fit v = Vmax*S/(KM+S) directly to initial rates. At each KM, Vmax is the
// least-squares solution; a bounded golden-section search minimizes rate SSE.
function fitMichaelisMenten(rates) {
  const at = (km) => {
    const fractions = rates.map((p) => p.substrate_uM / (km + p.substrate_uM));
    const vmax = fractions.reduce((sum, f, i) => sum + f * rates[i].velocity_uM_s, 0) / fractions.reduce((sum, f) => sum + f * f, 0);
    return { km, vmax, sse: fractions.reduce((sum, f, i) => sum + (rates[i].velocity_uM_s - vmax * f) ** 2, 0) };
  };
  let lo = 0.01, hi = 2000;
  const phi = (Math.sqrt(5) - 1) / 2;
  let left = hi - phi * (hi - lo), right = lo + phi * (hi - lo);
  for (let i = 0; i < 100; i++) {
    if (at(left).sse < at(right).sse) { hi = right; right = left; left = hi - phi * (hi - lo); }
    else { lo = left; left = right; right = lo + phi * (hi - lo); }
  }
  const fit = at((lo + hi) / 2);
  const mean = rates.reduce((sum, p) => sum + p.velocity_uM_s, 0) / rates.length;
  const sst = rates.reduce((sum, p) => sum + (p.velocity_uM_s - mean) ** 2, 0);
  const jacobian = rates.map((p) => ({ v: p.substrate_uM / (fit.km + p.substrate_uM), k: -fit.vmax * p.substrate_uM / (fit.km + p.substrate_uM) ** 2 }));
  const a = jacobian.reduce((sum, d) => sum + d.v ** 2, 0);
  const b = jacobian.reduce((sum, d) => sum + d.v * d.k, 0);
  const c = jacobian.reduce((sum, d) => sum + d.k ** 2, 0);
  const residualVariance = fit.sse / (rates.length - 2);
  const kmSe = Math.sqrt(residualVariance * a / (a * c - b * b));
  const vmaxSe = Math.sqrt(residualVariance * c / (a * c - b * b));
  const parameters = { km_uM: round(fit.km), vmax_uM_s: round(fit.vmax), kcat_s_1: round(fit.vmax / enzymeConcentration), catalytic_efficiency_M_1_s_1: round(fit.vmax / enzymeConcentration / (fit.km * 1e-6)), r_squared: round(1 - fit.sse / sst), km_se_uM: round(kmSe), vmax_se_uM_s: round(vmaxSe) };
  return { parameters, rmse: round(Math.sqrt(fit.sse / rates.length)), points: Array.from({ length: 65 }, (_, i) => ({ substrate_uM: i * 10, velocity_uM_s: round(velocity(i * 10, fit.km, fit.vmax)) })) };
}
const nullParameters = () => ({ km_uM: null, vmax_uM_s: null, kcat_s_1: null, catalytic_efficiency_M_1_s_1: null, r_squared: null, km_se_uM: null, vmax_se_uM_s: null });
function makeCandidate(index, outcome, reason, kind) {
  const traces = outcome === 'unexpressed' ? [] : makeTraces(kind);
  const rates = traces.map(initialRate);
  const fit = outcome === 'active' ? fitMichaelisMenten(rates) : null;
  const replicateCvs = outcome === 'active' ? substrates.map((substrate) => {
    const values = rates.filter((p) => p.substrate_uM === substrate).map((p) => p.velocity_uM_s);
    const mean = values.reduce((sum, n) => sum + n, 0) / values.length;
    return Math.sqrt(values.reduce((sum, n) => sum + (n - mean) ** 2, 0) / (values.length - 1)) / mean * 100;
  }) : [];
  const maxDepletion = traces.length ? Math.max(...traces.flatMap((trace) => trace.points.map((p) => p.blank_corrected_product_uM / trace.substrate_uM))) * 100 : null;
  return {
    id: `enzyme_00${index}`, sequence_id: `enzyme_00${index}`, sequence: demoSequence.slice(0, -1) + ['E', 'A', 'G', 'S'][index - 1], sequence_status: 'synthetic_placeholder_not_a_validated_enzyme', substrate_id: 'DEMO-SUBSTRATE-A', expression: outcome === 'unexpressed' ? 'not_detected' : 'detected',
    activity: outcome === 'active' ? 'detected' : outcome === 'negative' ? 'not_detected' : outcome === 'unexpressed' ? 'not_measured' : 'unreliable', outcome, reason_key: reason,
    nominal_enzyme_concentration_uM: outcome === 'unexpressed' ? null : enzymeConcentration,
    active_enzyme_concentration_uM: outcome === 'active' ? enzymeConcentration : null,
    active_concentration_basis: outcome === 'active' ? 'known_simulation_input_not_measured' : 'not_established',
    raw_traces: traces, initial_rates: rates, fitted_curve: fit?.points ?? [], fitted_parameters: fit?.parameters ?? nullParameters(),
    qc: { synthetic: true, status: outcome === 'active' ? 'pass_example' : outcome === 'negative' ? 'below_detection_example' : outcome === 'unexpressed' ? 'not_measured' : 'review_example', flags: outcome === 'active' ? [] : [outcome === 'negative' ? 'below_rate_detection_limit' : outcome === 'unexpressed' ? 'expression_not_detected' : 'nonlinear_initial_rate_window'], fit_rmse_uM_s: fit?.rmse ?? null, max_substrate_depletion_percent: maxDepletion === null ? null : round(maxDepletion), max_replicate_cv_percent: replicateCvs.length ? round(Math.max(...replicateCvs)) : null, rate_detection_limit_uM_s: 0.00001 },
    provenance: { ...provenance },
  };
}
export const sampleData = {
  schema_version: '1.0', dataset_type: 'enzyme_kinetics', synthetic: true,
  disclaimer: 'All sequences, substrates, signals, calibration, controls, fits, QC and provenance are synthetic. Not experimental results or a validated assay.',
  assay: { method: 'continuous_fluorescence', signal_unit: 'RFU', product_unit: 'uM', time_unit: 's', substrate_unit: 'uM', velocity_unit: 'uM/s', pH: 7.5, temperature_C: 25, buffer: '50 mM HEPES, 150 mM NaCl — synthetic example', substrate_concentrations_uM: substrates, technical_replicates: 3, initial_rate_window_s: [0, 60], calibration, fit_model: 'nonlinear_Michaelis_Menten', weighting: 'unweighted_initial_rate_least_squares' },
  input: { sequence_id: 'enzyme_001', sequence: demoSequence, sequence_status: 'synthetic_placeholder_not_a_validated_enzyme', substrate_id: 'DEMO-SUBSTRATE-A', substrate_name: 'Synthetic fluorogenic substrate A', substrate_smiles: null, substrate_status: 'fictional_example_no_chemical_structure_claimed' },
  controls,
  candidates: [makeCandidate(1, 'active', 'reasonActive', 'active'), makeCandidate(2, 'negative', 'reasonNegative', 'negative'), makeCandidate(3, 'unexpressed', 'reasonUnexpressed'), makeCandidate(4, 'flagged', 'reasonFlagged', 'flagged')],
};

// Long-form CSV includes sample signals, derived rates, fits, missing measurements
// and shared controls. Empty fields represent null; zero and negative values survive.
export function sampleCsv(data = sampleData) {
  const columns = ['schema_version','synthetic','record_type','sequence_id','sequence','sequence_status','substrate_id','substrate_name','substrate_smiles','assay_method','signal_unit','product_unit','outcome','expression','activity','reason_key','qc_status','qc_flags','trace_id','replicate','substrate_uM','time_s','signal_rfu','blank_corrected_product_uM','velocity_uM_s','km_uM','vmax_uM_s','kcat_s_1','catalytic_efficiency_M_1_s_1','r_squared','km_se_uM','vmax_se_uM_s','max_replicate_cv_percent','active_enzyme_concentration_uM','pH','temperature_C','buffer','protocol_id','protocol_version','batch_id','lab_id','blank_id','calibration_slope_rfu_per_uM','initial_rate_window_start_s','initial_rate_window_end_s','fit_rmse_uM_s','rate_detection_limit_uM_s','max_substrate_depletion_percent','active_concentration_basis'];
  const csvCell = (value) => { const s = value == null ? '' : String(value); return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s; };
  const rows = [];
  const common = { schema_version: data.schema_version, synthetic: true, substrate_id: data.input.substrate_id, substrate_name: data.input.substrate_name, substrate_smiles: data.input.substrate_smiles, assay_method: data.assay.method, signal_unit: data.assay.signal_unit, product_unit: data.assay.product_unit, pH: data.assay.pH, temperature_C: data.assay.temperature_C, buffer: data.assay.buffer, calibration_slope_rfu_per_uM: data.assay.calibration.slope_rfu_per_uM, initial_rate_window_start_s: data.assay.initial_rate_window_s[0], initial_rate_window_end_s: data.assay.initial_rate_window_s[1] };
  const push = (record) => rows.push(columns.map((key) => csvCell(record[key])).join(','));
  for (const c of data.candidates) {
    const base = { ...common, ...c.provenance, sequence_id: c.id, sequence: c.sequence, sequence_status: c.sequence_status, outcome: c.outcome, expression: c.expression, activity: c.activity, reason_key: c.reason_key, qc_status: c.qc.status, qc_flags: c.qc.flags.join('|'), ...c.fitted_parameters, active_enzyme_concentration_uM: c.active_enzyme_concentration_uM, fit_rmse_uM_s: c.qc.fit_rmse_uM_s, max_replicate_cv_percent: c.qc.max_replicate_cv_percent, rate_detection_limit_uM_s: c.qc.rate_detection_limit_uM_s, max_substrate_depletion_percent: c.qc.max_substrate_depletion_percent, active_concentration_basis: c.active_concentration_basis };
    for (const trace of c.raw_traces) for (const point of trace.points) push({ ...base, record_type: 'raw', trace_id: trace.id, replicate: trace.replicate, substrate_uM: trace.substrate_uM, blank_id: trace.blank_id, ...point });
    for (const rate of c.initial_rates) push({ ...base, record_type: 'initial_rate', ...rate });
    for (const point of c.fitted_curve) push({ ...base, record_type: 'fitted_MM', ...point });
    if (!c.raw_traces.length) push({ ...base, record_type: 'not_measured' });
  }
  for (const blank of data.controls.blanks) for (const point of blank.points) push({ ...common, ...provenance, record_type: 'control_blank', trace_id: blank.id, substrate_uM: blank.substrate_uM, ...point });
  for (const point of data.controls.positive_reference.points) push({ ...common, ...provenance, record_type: 'control_positive', trace_id: data.controls.positive_reference.id, substrate_uM: data.controls.positive_reference.substrate_uM, ...point });
  return `${columns.join(',')}\r\n${rows.join('\r\n')}\r\n`;
}
