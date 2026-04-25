# DSP Research Protocol

## Multi-Level Research Methodology

### Level 1: Identify & Gather
- Parse the research request to identify the target circuit, gear, or algorithm
- Search for schematics, datasheets, published measurements
- Identify existing open-source implementations for reference
- Document all sources

### Level 2: Mathematical Modeling
- Derive component-level equations from first principles
- Identify and characterize nonlinearities
- Determine operating points and bias conditions
- Map component interactions (loading, feedback)

### Level 3: Discrete-Time Approximation
- Choose discretization method (trapezoidal, bilinear, etc.)
- Analyze oversampling requirements based on nonlinearity
- Verify stability of discrete-time system
- Define safe parameter ranges

### Level 4: Validation Criteria
- Define measurable targets: THD, frequency response, gain, dynamic behavior
- Specify tolerances for each metric
- Describe measurement methodology
- Reference comparison targets if available

### Level 5: Implementation Recommendations
- Recommended solver architecture (MNA, WDF, direct form)
- Minimum oversampling ratio
- State variable inventory
- CPU complexity estimate
- Real-time safety considerations

## Research Sources (Priority Order)
1. Original schematics (manufacturer documentation)
2. Published measurements (magazine reviews, academic papers)
3. Community measurements (forums, YouTube teardowns)
4. SPICE simulation results
5. Competitor analysis (how other plugins model the same gear)
