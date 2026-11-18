import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from pathlib import Path

########################################################################################################################
# LOADING IN THE DATA
# Data provided by Dr. Alexandra Konings for Remote Sensing of Hydrology (Stanford, Winter 2026):
# AmeriFlux eddy covariance flux tower and reference ET records for Ne1, Ne2 and Ne3
# (Mead, NE), plus MODIS MOD13 NDVI and MOD16 ET extracts for the same sites.

# finding the folder where THIS script is saved (sometimes I move stuff on my computer, especially
# after the end of the quarter, but I don't want my code to break)
folder_path = Path(__file__).parent

# The data folder sits in the same folder as this script
csv_path = folder_path / "DATA Nebraska Evapotranspiration"

ne1_flux_and_ref_ET = pd.read_csv(csv_path / 'ne1_flux_and_ref_ET.csv')
ne2_flux_and_ref_ET = pd.read_csv(csv_path / 'ne2_flux_and_ref_ET.csv')
ne3_flux_and_ref_ET = pd.read_csv(csv_path / 'ne3_flux_and_ref_ET.csv')

ne1_ndvi = pd.read_csv(csv_path / 'ne1_ndvi.csv')
ne2_ndvi = pd.read_csv(csv_path / 'ne2_ndvi.csv')
ne3_ndvi = pd.read_csv(csv_path / 'ne3_ndvi.csv')

# print(ne1_flux_and_ref_ET.head()) #use this to check if the data loaded correctly
# print(ne1_ndvi.head())
########################################################################################################################
# 1. QA FILTERING OF MODIS NDVI
# Filter out any observations where there is snow, ice or clouds
# in the pixel using the QA flags provided.

NDVIs = [ne1_ndvi, ne2_ndvi, ne3_ndvi]
cleaned_datasets = []

for df in NDVIs:
    cleaned_rows = []

    for index, row in df.iterrows():
        snow = row['_250m_16_days_VI_Quality_Possible_snow/ice_Description']
        clouds = row['_250m_16_days_VI_Quality_Adjacent_cloud_detected_Description']

        if snow == 'No' and clouds == 'No':
            cleaned_rows.append(row)

    df_cleaned = pd.DataFrame(cleaned_rows)
    df_cleaned['Date'] = pd.to_datetime(df_cleaned['Date'])
    df_cleaned['MeasurementDate'] = pd.to_datetime(
        df_cleaned['Date'].dt.year * 1000 + df_cleaned['_250m_16_days_composite_day_of_the_year'].astype(int),
        format='%Y%j').dt.date
    cleaned_datasets.append(df_cleaned)

ne1_clean = cleaned_datasets[0]
ne2_clean = cleaned_datasets[1]
ne3_clean = cleaned_datasets[2]

#########################################################################################################################
# 2. NDVI TIME SERIES
# Plot all three NDVI timeseries on the same axes.

plt.figure(figsize=(20,10)) # Figure 1

plt.plot(ne1_clean['Date'], ne1_clean['_250m_16_days_NDVI'], label='Field 1 (Irrigated)')
plt.plot(ne2_clean['Date'], ne2_clean['_250m_16_days_NDVI'], label='Field 2 (Irrigated)')
plt.plot(ne3_clean['Date'], ne3_clean['_250m_16_days_NDVI'], label='Field 3 (Rainfed)')

plt.xlabel('Year')
plt.ylabel('NDVI')
plt.title('NDVI across Fields in Nebraska')
plt.legend()

#plt.show()

########################################################################################################################
# 3. EVAPORATIVE FRACTION (EToF) AND SITE-SPECIFIC NDVI-EToF CALIBRATION

# Adding ET actual
ne1_flux_and_ref_ET['EToF_actual'] = ne1_flux_and_ref_ET['Ne1_flux_twr_LE'] / ne1_flux_and_ref_ET['Ne1_ref_ET']
ne2_flux_and_ref_ET['EToF_actual'] = ne2_flux_and_ref_ET['Ne2_flux_twr_LE'] / ne2_flux_and_ref_ET['Ne2_ref_ET']
ne3_flux_and_ref_ET['EToF_actual'] = ne3_flux_and_ref_ET['Ne3_flux_twr_LE'] / ne3_flux_and_ref_ET['Ne3_ref_ET']

# Cleaning flux and ref dates
fluxes_and_refs = [ne1_flux_and_ref_ET, ne2_flux_and_ref_ET, ne3_flux_and_ref_ET]

for df in fluxes_and_refs:
    df['datetime'] = pd.to_datetime(df['datetime'], format='mixed')

# Merging dfs
# Fixing dates to be in datetime like the fluxes csv
ne1_clean['MeasurementDate'] = pd.to_datetime(ne1_clean['MeasurementDate'])
ne2_clean['MeasurementDate'] = pd.to_datetime(ne2_clean['MeasurementDate'])
ne3_clean['MeasurementDate'] = pd.to_datetime(ne3_clean['MeasurementDate'])
# Now ready to merge
merged_ne1 = pd.merge(ne1_clean, ne1_flux_and_ref_ET, left_on='MeasurementDate', right_on='datetime')
merged_ne2 = pd.merge(ne2_clean, ne2_flux_and_ref_ET, left_on='MeasurementDate', right_on='datetime')
merged_ne3 = pd.merge(ne3_clean, ne3_flux_and_ref_ET, left_on='MeasurementDate', right_on='datetime')

mergers = [merged_ne1, merged_ne2,merged_ne3]

# Getting and Printing Coefficients

coefficients = {}
site_names = ['ne1', 'ne2', 'ne3']

for i, df in enumerate(mergers):
    x = df['_250m_16_days_NDVI']
    y = df['EToF_actual']
    a, b = np.polyfit(x, y, 1)

    coefficients[site_names[i]] = {'a': a, 'b': b}

    print(f"  a (slope)     = {a:.4f}")
    print(f"  b (intercept) = {b:.4f}")

# 3b. Scatterplot of EToF vs. NDVI with fitted lines for each field
# Making Scatterplot
plt.figure(figsize=(20,10)) # Figure 2


# Scatter
plt.scatter(merged_ne1['_250m_16_days_NDVI'], merged_ne1['EToF_actual'], color= '#E67E22', label='Data for Field 1 (Irrigated)')
plt.scatter(merged_ne2['_250m_16_days_NDVI'], merged_ne2['EToF_actual'], color='#27AE60', label='Data for Field 2 (Irrigated)')
plt.scatter(merged_ne3['_250m_16_days_NDVI'], merged_ne3['EToF_actual'], color= '#2980B9', label='Data for Field 3 (Rainfed)')

# Lines
plt.plot(merged_ne1['_250m_16_days_NDVI'], (coefficients['ne1']['a'])*(merged_ne1['_250m_16_days_NDVI'])+ (coefficients['ne1']['b']), color= '#FFB347', label='Line of Best Fit for Field 1 (Irrigated)')
plt.plot(merged_ne2['_250m_16_days_NDVI'], (coefficients['ne2']['a'])*(merged_ne2['_250m_16_days_NDVI'])+ (coefficients['ne2']['b']), color= '#77DD77', label='Line of Best Fit for Field 2 (Irrigated)')
plt.plot(merged_ne3['_250m_16_days_NDVI'], (coefficients['ne3']['a'])*(merged_ne3['_250m_16_days_NDVI'])+ (coefficients['ne3']['b']), color= '#85C1E9', label='Line of Best Fit for Field 3 (Rainfed)')

plt.xlabel('NDVI')
plt.ylabel('Evaporative Fraction')
plt.title('ET across NDVI conditions in Nebraska')
plt.legend()

#plt.show()

# 3c. Observed vs. predicted EToF time series (Field 1)
# Making TimeSeries
# first, sorting all my merged dfs by date
merged_ne1 = merged_ne1.sort_values('MeasurementDate')
merged_ne2 = merged_ne2.sort_values('MeasurementDate')
merged_ne3 = merged_ne3.sort_values('MeasurementDate')

plt.figure(figsize=(15,9)) # Figure 3

plt.scatter(merged_ne1['MeasurementDate'], merged_ne1['EToF_actual'], color= '#E67E22', label='Actual ET for Field 1 (Irrigated)')
plt.plot(merged_ne1['MeasurementDate'], (coefficients['ne1']['a'])*(merged_ne1['_250m_16_days_NDVI'])+ (coefficients['ne1']['b']), color= '#FFB347', label='Predicted ET for Field 1 (Irrigated)')


plt.xlabel('Year')
plt.ylabel('ET')
plt.title('Evaporative Fraction in Nebraska')
plt.legend()

#plt.show()

# 3d. Calibration accuracy (in-sample): RMSE and correlation for each field
# Calculating RMSE
# first making predicted ET a stored column in my dataframe instead of calculating it on the fly as I did for my graphs
merged_ne1['EToF_predicted'] = (coefficients['ne1']['a'] * merged_ne1['_250m_16_days_NDVI']) + coefficients['ne1']['b']
merged_ne2['EToF_predicted'] = (coefficients['ne2']['a'] * merged_ne2['_250m_16_days_NDVI']) + coefficients['ne2']['b']
merged_ne3['EToF_predicted'] = (coefficients['ne3']['a'] * merged_ne3['_250m_16_days_NDVI']) + coefficients['ne3']['b']

rmse1 = np.sqrt(((merged_ne1['EToF_actual'] - merged_ne1['EToF_predicted']) ** 2).mean())
rmse2 = np.sqrt(((merged_ne2['EToF_actual'] - merged_ne2['EToF_predicted']) ** 2).mean())
rmse3 = np.sqrt(((merged_ne3['EToF_actual'] - merged_ne3['EToF_predicted']) ** 2).mean())

print(f"  RMSE 1     = {rmse1:.4f}")
print(f"  RMSE 2     = {rmse2:.4f}")
print(f"  RMSE 3     = {rmse3:.4f}")

# Calculating correlation
# Standard Deviation first
PredictedET1_std = np.std(merged_ne1['EToF_predicted'])
PredictedET2_std = np.std(merged_ne2['EToF_predicted'])
PredictedET3_std = np.std(merged_ne3['EToF_predicted'])
ActualET1_std = np.std(merged_ne1['EToF_actual'])
ActualET2_std = np.std(merged_ne2['EToF_actual'])
ActualET3_std = np.std(merged_ne3['EToF_actual'])

# Now correlations
Corr1_matrix = (np.cov(merged_ne1['EToF_actual'], merged_ne1['EToF_predicted']))/(PredictedET1_std * ActualET1_std)
Corr2_matrix = (np.cov(merged_ne2['EToF_actual'], merged_ne2['EToF_predicted']))/(PredictedET2_std * ActualET2_std)
Corr3_matrix = (np.cov(merged_ne3['EToF_actual'], merged_ne3['EToF_predicted']))/(PredictedET3_std * ActualET3_std)

Corr1 = Corr1_matrix[0, 1]
Corr2 = Corr2_matrix[0, 1]
Corr3 = Corr3_matrix[0, 1]

# Print
print(f"  Correlation 1     = {Corr1:.4f}")
print(f"  Correlation 2     = {Corr2:.4f}")
print(f"  Correlation 3     = {Corr3:.4f}")

########################################################################################################################
# 4. CROSS-SITE TRANSFER: FIELD 1 MODEL APPLIED TO FIELD 2 (IRRIGATED), 2011-2012

filtered_ne2_dates = []

mask = merged_ne2['MeasurementDate'].dt.year.isin([2011, 2012])
filtered_ne2 = merged_ne2.loc[mask].copy()

plt.figure(figsize=(15, 8)) # Figure 4

plt.plot(filtered_ne2['MeasurementDate'], ((coefficients['ne1']['a']*filtered_ne2['_250m_16_days_NDVI']) + (coefficients['ne1']['b']))*filtered_ne2['Ne2_ref_ET'], color= '#FFB347', label='Predicted ET for Field 2 (Irrigated)')
plt.scatter(filtered_ne2['MeasurementDate'], (filtered_ne2['EToF_actual']*filtered_ne2['Ne2_ref_ET']), color='#E67E22', label='Flux Tower ET for Field 2 (Irrigated)')

plt.xlabel('Month and Year')
plt.ylabel('ET (W/m2)')
plt.title('ET in Nebraska')
plt.legend()

#plt.show()

# 4b. Accuracy of the Field 1 model at Field 2
ne2_flux_tower_ET = filtered_ne2['EToF_actual']*filtered_ne2['Ne2_ref_ET']
ne2_model1_predicted_ET = ((coefficients['ne1']['a']*filtered_ne2['_250m_16_days_NDVI']) + (coefficients['ne1']['b']))*filtered_ne2['Ne2_ref_ET']

rmse_ne2_model1 = np.sqrt(((ne2_flux_tower_ET - ne2_model1_predicted_ET) ** 2).mean())
print(f"  RMSE for Field 2 Using Model 1 (W/m2)   = {rmse_ne2_model1:.4f}")

PredictedET_ne2_model1_std = np.std(ne2_model1_predicted_ET)
ActualET_ne2_model1_std = np.std(ne2_flux_tower_ET)
Corr_ne2_model1_matrix = np.cov(ne2_flux_tower_ET, ne2_model1_predicted_ET)/(PredictedET_ne2_model1_std * ActualET_ne2_model1_std)
Corr_ne2_model1 = Corr_ne2_model1_matrix[0, 1]

print(f"  Correlation for Field 2 Using Model 1     = {Corr_ne2_model1:.4f}")

########################################################################################################################
# 5. CROSS-SITE TRANSFER: FIELD 1 MODEL APPLIED TO FIELD 3 (RAINFED), 2011-2012

filtered_ne3_dates = []

mask = merged_ne3['MeasurementDate'].dt.year.isin([2011, 2012])
filtered_ne3 = merged_ne3.loc[mask].copy()

plt.figure(figsize=(15, 8)) # Figure 5

plt.plot(filtered_ne3['MeasurementDate'], ((coefficients['ne1']['a']*filtered_ne3['_250m_16_days_NDVI']) + (coefficients['ne1']['b']))*filtered_ne3['Ne3_ref_ET'], color= '#85C1E9', label='Predicted ET for Field 3 (Rainfed)')
plt.scatter(filtered_ne3['MeasurementDate'], (filtered_ne3['EToF_actual']*filtered_ne3['Ne3_ref_ET']), color='#2980B9', label='Flux Tower ET for Field 3 (Rainfed)')

plt.xlabel('Month and Year')
plt.ylabel('ET (W/m2)')
plt.title('ET in Nebraska')
plt.legend()

#plt.show()

# 5b. Accuracy of the Field 1 model at Field 3
ne3_flux_tower_ET = filtered_ne3['EToF_actual']*filtered_ne3['Ne3_ref_ET']
ne3_model1_predicted_ET = ((coefficients['ne1']['a']*filtered_ne3['_250m_16_days_NDVI']) + (coefficients['ne1']['b']))*filtered_ne3['Ne3_ref_ET']

rmse_ne3_model1 = np.sqrt(((ne3_flux_tower_ET - ne3_model1_predicted_ET) ** 2).mean())
print(f"  RMSE for Field 3 Using Model 1 (W/m2)   = {rmse_ne3_model1:.4f}")

PredictedET_ne3_model1_std = np.std(ne3_model1_predicted_ET)
ActualET_ne3_model1_std = np.std(ne3_flux_tower_ET)
Corr_ne3_model1_matrix = np.cov(ne3_flux_tower_ET, ne3_model1_predicted_ET)/(PredictedET_ne3_model1_std * ActualET_ne3_model1_std)
Corr_ne3_model1 = Corr_ne3_model1_matrix[0, 1]

print(f"  Correlation for Field 3 Using Model 1     = {Corr_ne3_model1:.4f}")

########################################################################################################################
# 6. BENCHMARK AGAINST MODIS MOD16 ET (FIELD 2)
# QA-filter MOD16 for clear-sky composites and aggregate flux tower data to matching 8-day periods

MODIS_raw_csv = pd.read_csv(csv_path / 'ne2_pm_mod.csv')

MODIS_cleaned_rows = []

for index, row in MODIS_raw_csv.iterrows():
    clouds = row['ET_QC_500m_CloudState_Description']

    if clouds == 'Significant clouds NOT present (clear)':
        MODIS_cleaned_rows.append(row)

MODIS_cleaned = pd.DataFrame(MODIS_cleaned_rows)

# Aggregating flux tower data
MODIS_cleaned['Date'] = pd.to_datetime(MODIS_cleaned['Date'])

aggregated_data = []

for mod_date in MODIS_cleaned['Date'].unique():
    start_date = mod_date
    end_date = mod_date + pd.Timedelta(days=7)

    mask = (merged_ne2['MeasurementDate'] >= start_date) & (merged_ne2['MeasurementDate'] <= end_date)
    eight_day_data = {
        'MeasurementDate': start_date,
        'Flux_ET_8day_avg': merged_ne2.loc[mask, 'Ne2_flux_twr_LE'].mean(),
        'Ref_ET_8day': merged_ne2.loc[mask, 'Ne2_ref_ET'].mean(),
        'NDVI_8day': merged_ne2.loc[mask, '_250m_16_days_NDVI'].mean()
    }
    aggregated_data.append(eight_day_data)

ne2_flux_8day_df = pd.DataFrame(aggregated_data)

# Timeseries

# Ne2 ETactual
plt.figure() # Figure 6

plt.scatter(ne2_flux_8day_df['MeasurementDate'], ne2_flux_8day_df['Flux_ET_8day_avg'],
            color='#27AE60', label='Flux Tower ET')
# MOD16 ET estimates
# convert from J/m2/day to W/m2
plt.plot(MODIS_cleaned['Date'], (MODIS_cleaned['LE_500m']*(1/(24*60*60))),
         color= '#77DD77', label='MODIS ET')

plt.xlabel('Month and Year')
plt.ylabel('ET (W/m2)')
plt.title('Flux Tower and MODIS ET for Field 2 (Irrigated) in Nebraska')
plt.legend()

#plt.show()

# 6b. Agreement between flux tower ET and MOD16 ET
# RMSE

Ne2_vs_MODIS_comparison_df = pd.merge(MODIS_cleaned, ne2_flux_8day_df, left_on='Date', right_on='MeasurementDate').dropna(subset=['Flux_ET_8day_avg', 'LE_500m']).sort_values('MeasurementDate')
Ne2_vs_MODIS_comparison_df['MODIS_W_m2'] = Ne2_vs_MODIS_comparison_df['LE_500m'] * (1/(24*60*60))

rmse_ne2_vs_MODIS = np.sqrt(((Ne2_vs_MODIS_comparison_df['Flux_ET_8day_avg'] - Ne2_vs_MODIS_comparison_df['MODIS_W_m2']) ** 2).mean())
print(f"  RMSE: Ne2 Data v MODIS (W/m2)   = {rmse_ne2_vs_MODIS:.4f}")

# Correlation
ET_MODIS_std = np.std(Ne2_vs_MODIS_comparison_df['MODIS_W_m2'])
ET_ne2_flux_8day_std = np.std(Ne2_vs_MODIS_comparison_df['Flux_ET_8day_avg'])

Corr_ne2_vs_MODIS_matrix = np.cov(Ne2_vs_MODIS_comparison_df['Flux_ET_8day_avg'], Ne2_vs_MODIS_comparison_df['MODIS_W_m2'])/(ET_MODIS_std * ET_ne2_flux_8day_std)
Corr_ne2_vs_MODIS = Corr_ne2_vs_MODIS_matrix[0, 1]

print(f"  Correlation between Ne2 Data and MODIS Data     = {Corr_ne2_vs_MODIS:.4f}")

########################################################################################################################
# 7. COMPARISON: FLUX TOWER vs. NDVI-BASED MODEL vs. MOD16 (FIELD 2)
plt.figure() # Figure 7

# Actual ET
plt.scatter(Ne2_vs_MODIS_comparison_df['MeasurementDate'], Ne2_vs_MODIS_comparison_df['Flux_ET_8day_avg'],
            color='#27AE60', label='Flux Tower ET')

# Modeled ET
a = coefficients['ne1']['a']
b = coefficients['ne1']['b']

Ne2_vs_MODIS_comparison_df['Simple_Model_ET'] = ((a * Ne2_vs_MODIS_comparison_df['NDVI_8day'] + b) * Ne2_vs_MODIS_comparison_df['Ref_ET_8day'])
plt.plot(Ne2_vs_MODIS_comparison_df['MeasurementDate'], Ne2_vs_MODIS_comparison_df['Simple_Model_ET'],
         color= '#000000', label='Modeled ET')

# MODIS ET
plt.plot(Ne2_vs_MODIS_comparison_df['MeasurementDate'], Ne2_vs_MODIS_comparison_df['MODIS_W_m2'],
         color= '#77DD77', label='MODIS ET')


plt.xlabel('Month and Year')
plt.ylabel('ET (W/m2)')
plt.title('Actual, Modeled, MODIS ET for Field 2 (Irrigated) in Nebraska')
plt.legend()

plt.show()

# 7b. Summary RMSE between all three ET estimates
rmse_ne2_vs_MODIS = np.sqrt(((Ne2_vs_MODIS_comparison_df['Flux_ET_8day_avg'] - Ne2_vs_MODIS_comparison_df['MODIS_W_m2']) ** 2).mean())
rmse_ne2_vs_model = np.sqrt(((Ne2_vs_MODIS_comparison_df['Flux_ET_8day_avg'] - Ne2_vs_MODIS_comparison_df['Simple_Model_ET']) ** 2).mean())
rmse_model_vs_MODIS = np.sqrt(((Ne2_vs_MODIS_comparison_df['Simple_Model_ET'] - Ne2_vs_MODIS_comparison_df['MODIS_W_m2']) ** 2).mean())


print(f"  RMSE: Ne2 Data v MODIS (W/m2)   = {rmse_ne2_vs_MODIS:.4f}")
print(f"  RMSE: Ne2 Data v Simple Model (W/m2)   = {rmse_ne2_vs_model:.4f}")
print(f"  RMSE: Simple Model v MODIS (W/m2)   = {rmse_model_vs_MODIS:.4f}")
