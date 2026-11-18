# Post-Wildfire Land Cover & Soil Moisture Dynamics: 2018 Camp Fire (Paradise, CA)

## Project Context
Wildfires rapidly alter watershed hydrology by removing forest canopy and reducing plant transpiration, yet post-fire soil moisture trajectories vary across vegetation types and recovery stages. Using the November 2018 Camp Fire near Paradise, California as a natural experiment, this project classifies pre-fire land cover and tracks soil moisture drydown behavior across burned and unburned forest and shrubland landscapes. This group project was done for completion of Remote Sensing of Hydrology, taught by Professor Alexandra Konings at Stanford University in Winter 2026. I possessed ownership over the land use and land cover classification elements of the project.

## Tools & Workflow
* **Google Earth Engine (JavaScript):** Built a cloud-masked pre-fire baseline composite from 2016 Sentinel-2 Harmonized imagery (`COPERNICUS/S2_SR_HARMONIZED`) using QA60 bitmasking and spectral indices (NDVI, NDWI, NBR). Trained a 100-tree supervised Random Forest classifier (`ee.Classifier.smileRandomForest` in `camp_fire_random_forest_lulc.js`) using 427 manually verified training points across 7 classes (Built, Grassland, Water, Shrubland, Forest, Sparse Forest/Orchard, and Snow).

## Group Mates' Work:
* **MTBS & NASA SMAP (Python):** Intersected Monitoring Trends in Burn Severity (MTBS) fire perimeters with the GEE land-cover map to isolate Burned Forest, Burned Shrubland, Unburned Forest, and Unburned Shrubland zones, then analyzed daily NASA SMAP (`SPL3SMP_E`) soil moisture drydown rates across pre-fire (2016), fire-year (2018), and post-fire recovery (2021) periods.

## Key Findings
* Soil moisture drydown curve analysis reveals significantly slower 7-day soil moisture loss in burned pixels during 2018 due to the loss of canopy transpiration, with hydrologic drydown rates trending back toward unburned baseline conditions by 2021.