# Digital-to-protein workflow (2026-10-29)

This scope supersedes older prepared-enzyme / supplied-plasmid package and calculator descriptions in PRD.md, DESIGN_SPEC.md and PACKAGES_REVIEW.md.

Customers provide digital FASTA and receive data; physical enzyme/plasmid input is not required. The site remains a planning demo: inquiry drafts and estimates download locally and are not submitted to a laboratory. Automatic progression describes the proposed service, not a live execution integration.

- Stage 1 is mandatory for every sequence: de novo synthesis and cloning, E. coli expression, 96-well affinity magnetic-bead purification, purity and concentration QC. Planning targets: USD 45 synthesis/cloning plus USD 35 expression/purification/QC per sequence, USD 80 total. These are unverified assumptions, including the expanded purification scope; supplier costs, construct length, thresholds and feasibility must be confirmed.
- Four negative-result categories: construct QC failure, no detectable expression, insoluble protein, purification/concentration below agreed thresholds. Report evidence and stop failed variants.
- Stage 2 kinetics: USD 110 per passing variant, one substrate, eight concentrations, three technical replicates. Optional matrix route: USD 85 per passing variant per six-condition panel, three technical replicates. Both always include Stage 1 in the estimate. Only gate-passing variants incur Stage 2 charges. The pass-count input is a scenario assumption, initially all variants, and is not an experimental result.
- Protein purity and concentration do not establish active-site concentration. kcat and kcat/KM remain conditional on reliable active enzyme quantification; active-site quantification and custom assay development require separate scope.
- V1 selection is limited to six assay families: pNP esters, Nitrocefin, pNA/AMC peptides, ABTS/Guaiacol, pNP glycosides, and NAD(P)H coupling. This is a proposed supported-family catalog, not evidence of laboratory prevalidation or stocked reagents. Exact substrate, coupling controls, wavelength, stock and enzyme compatibility require qualification. pNP ester activity does not establish PET degradation. Custom SMILES and LC-MS are outside V1.
- Standard 21 days / Rush 14 days are planning targets after digital design, synthesis feasibility, reagents and laboratory schedule confirmation. Rush adds 25% to the whole estimate; no unconditional delivery guarantee is made.

Estimate JSON schema 3.0 includes substrate family ID, estimated passing count, separate synthesis, protein gate and Stage 2 amounts. Inquiry envelope remains 2.0 and embeds the new estimate. The synthetic fluorescence dataset retains its fictional substrate metadata to avoid presenting fabricated results as a validated catalog assay.

Verification: npm run check and npm run build; browser checks cover all/partial/zero passes, substrate review and gate-only selection.
