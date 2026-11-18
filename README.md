# Geospatial Analysis, Remote Sensing & Ecosystem Modeling Portfolio

A portfolio of applied remote sensing, spatial modeling, and hydrologic data science projects integrating Google Earth Engine (JavaScript), Python (`pandas`, `numpy`, `matplotlib`, `pathlib`), QGIS, and the Natural Capital Project's InVEST software suite.

Additional tools & libraries I have experience with, which aren't showcased in this specific portfolio: Python geospatial libraries (`rasterio`, `geopandas`, `xarray`)

---

## Repository Structure & Projects

1. **[01-portage-manor-lulc](./01-portage-manor-lulc)** — *LULC Classification (South Bend, IN)*
   * **Tools:** Google Earth Engine (Sentinel-2, Weka K-means), QGIS
   * **Focus:** Unsupervised K-means land-cover classification of Sentinel-2 imagery for a 120-acre former county facility and its surrounding area, producing land-cover maps that can serve as the precursor to valuing the parcel's natural capital.

2. **[02-camp-fire-lulc](./02-camp-fire-lulc)** — *Post-Wildfire LULC & Soil Moisture Dynamics (Paradise, CA)* — group project
   * **My part:** Google Earth Engine (Sentinel-2 Harmonized, Random Forest) — supervised Random Forest land-cover classification (7 classes, 427 training points) of pre- and post-fire imagery. The model was trained on point geometry, validated using Google Earth Street View.
   * **Group mates' part:** MTBS burn perimeters, NASA SMAP, Python — intersecting the land-cover map with MTBS fire severity boundaries and analyzing SMAP soil moisture drydown curves before, during, and after the 2018 Camp Fire.

3. **[03-minneapolis-urban-heat](./03-minneapolis-urban-heat)** — *Urban Heat Islands & Environmental Equity (Minneapolis, MN)*
   * **Tools:** InVEST (Urban Cooling Model), QGIS, U.S. Census Demographic Data (ran locally through QGIS User Interface, so no code to provide)
   * **Focus:** Spatial scenario modeling comparing urban cooling from converting developed blocks into a City Park versus a forested Natural Area, evaluated against census tract BIPOC and low-income distributions.

4. **[04-nebraska-evapotranspiration](./04-nebraska-evapotranspiration)** — *MODIS & Eddy Covariance Evapotranspiration Modeling (Nebraska)*
   * **Tools:** Python (`pandas`, `numpy`, `matplotlib`), NASA MODIS (`MOD13` NDVI & `MOD16` Penman-Monteith ET), AmeriFlux Eddy Covariance Data
   * **Focus:** QA-filtered remote sensing time-series pipeline calibrating an empirical evaporative fraction ($ET_oF$) model across irrigated and rainfed agricultural fields and benchmarking against NASA MOD16 estimates.
   * **Data:** AmeriFlux flux tower data (US-Ne1, US-Ne2, US-Ne3) and MODIS extracts provided by Dr. Alexandra Konings for Remote Sensing of Hydrology at Stanford University.
