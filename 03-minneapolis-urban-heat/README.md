# Urban Heat Islands, Ecosystem Services & Environmental Equity (Minneapolis, MN)

## Project Context
Urban heat islands disproportionately expose low-income neighborhoods and communities of color to extreme heat due to historical disparities in tree canopy and green space investment. This project evaluates how different green-infrastructure interventions affect local air temperatures in Minneapolis, Minnesota, and assesses whether those cooling benefits equitably reach marginalized census tracts. This project was prepared for Integrated Valuation of Ecosystem Services and Tradeoffs, taught by Dr. Gretchen Daily and Stacie Wolny during Fall 2022 at Stanford University. Data, including LULC .tif files, were provided by the teaching team for analysis.

## Tools & Workflow
* **InVEST (Urban Cooling Model):** Parameterized shade, albedo, evapotranspiration efficiency, and building intensity across three land-use scenarios—current baseline conditions, converting high/medium-intensity developed blocks into a City Park, and converting those blocks into a forested Natural Area—to model spatial air temperature anomalies.
* **QGIS & U.S. Census Data:** Overlaid modeled urban cooling plumes onto Minneapolis census tract boundaries joined with U.S. Census demographic variables (BIPOC population share and poverty-level ratios) to evaluate distributional equity (`minneapolis_urban_heat_island.pdf`).

## Key Findings
* Converting developed urban land into a forested Natural Area generates substantially stronger localized cooling than a traditional turf-dominated City Park.
* Spatial equity overlays demonstrate that greater aggregate cooling does not guarantee equitable distribution: a single centralized greening intervention reaches only the top 12.5% of census tracts with the highest BIPOC and low-income populations, underscoring the need for distributed, neighborhood-scale urban forestry.
