# MODIS & Eddy Covariance Evapotranspiration Modeling (Mead, Nebraska)

## Project Context
Accurately estimating agricultural evapotranspiration (ET) across irrigated and rainfed croplands is vital for regional water-resource management. This project develops an end-to-end Python remote sensing pipeline comparing satellite-derived vegetation indices and NASA's operational Penman-Monteith ET product (`MOD16`) against ground-based AmeriFlux eddy covariance flux tower observations across three agricultural sites in Mead, Nebraska (Ne1 irrigated continuous maize, Ne2 irrigated maize-soybean rotation, and Ne3 rainfed maize-soybean rotation). This project was prepared for Remote Sensing of Hydrology, taught by Dr. Alexandra Konings at Stanford University during Winter 2026.

## Data
All input data in `DATA Nebraska Evapotranspiration/` were provided by Dr. Alexandra Konings for Remote Sensing of Hydrology (Stanford University, Winter 2026):
* **AmeriFlux eddy covariance data:** daily flux tower latent heat flux (LE) and reference ET for sites US-Ne1, US-Ne2 and US-Ne3 (Mead, NE). Ne1 covers 2008–2012; Ne2 and Ne3 cover 2011–2012.
* **NASA MODIS:** `MOD13` 16-day NDVI (250 m) for all three sites and `MOD16` 8-day ET (500 m) for Ne2, with quality-assurance flags.

## Tools & Workflow
* **Python (`pandas`, `numpy`, `matplotlib`, `pathlib`):** Implemented in `nebraska_evapotranspiration_model.py` 
* **Remote Sensing QA Filtering & Temporal Alignment:** Filtered 16-day MODIS NDVI (`MOD13`, 250 m) and 8-day MODIS ET (`MOD16`, 500 m) records using quality-assurance bit flags to exclude snow, ice, and cloud-contaminated pixels. Converted Julian Day-of-Year (DOY) composite dates to align satellite overpasses with daily flux tower latent heat flux and reference evapotranspiration.
* **Empirical Calibration & Cross-Site Validation:** Calibrated site-specific linear regression models relating evaporative fraction ($ET_oF = LE / ET_o$) to NDVI, evaluated cross-site transferability from irrigated Field 1 to Fields 2 and 3 (2011–2012), and benchmarked model accuracy (RMSE and Pearson correlation $r$) against NASA `MOD16` estimates.

## Key Findings
* **NDVI alone explains only part of the variation in evaporative fraction.** Site-specific linear fits of $ET_oF$ against NDVI gave correlations of $r$ = 0.50 (Field 1), 0.36 (Field 2) and 0.45 (Field 3), so NDVI accounts for roughly 13–25% of the variance in $ET_oF$. These are in-sample values (each model is evaluated on the data used to fit it).
* **The Field 1 model transfers to the other fields with moderate error.** Applying the Field 1 regression to independent sites in 2011–2012 and multiplying by reference ET gave $r$ = 0.79 and RMSE = 45.8 W/m² at irrigated Field 2, and $r$ = 0.76 and RMSE = 51.7 W/m² at rainfed Field 3. The higher correlations than in the $ET_oF$ fits largely reflect the shared seasonal cycle carried by reference ET, not NDVI skill alone.
* **Error is larger at the rainfed field**, consistent with water stress there that canopy greenness does not capture.
* **The simple NDVI model was closer to the flux tower than MOD16 at Field 2.** Over matching 8-day periods, MOD16 ET had RMSE = 57.9 W/m² and $r$ = 0.74 against the flux tower, while the Field 1 NDVI model had RMSE = 47.8 W/m². The two satellite-based estimates differed from each other by RMSE = 77.4 W/m².
* **Limitations:** results rest on three nearby fields and two years of cross-site data, and a single 500 m MODIS pixel can include land beyond the field each flux tower measures.
