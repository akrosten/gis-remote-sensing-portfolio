// Define Area of Interest (Portage Manor)

// Function to Mask Clouds using Sentinel-2 Cloud Probability Band
function maskClouds(image) {
  var cloudProb = image.select('MSK_CLDPRB'); // Cloud Probability Band
  var cloudMask = cloudProb.lt(10); // Keep pixels with low cloud probability
  return image.updateMask(cloudMask);
}

// Standard Sentinel-2 Band Selection to Avoid Processing Errors
var selectedBands = ['B2', 'B3', 'B4', 'B8', 'B11']; // Blue, Green, Red, NIR, SWIR

// Load in AOI using GEE geometry
var aoi = 
    /* color: #98ff00 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-86.26072423150993, 41.73047682223577],
          [-86.29402653863883, 41.73002844204808],
          [-86.29368321588493, 41.708310284421295],
          [-86.25875012567496, 41.70850251269511]]]);
          
// Load Sentinel-2 Collection and Apply Cloud Mask
var sentinelImage = ee.ImageCollection('COPERNICUS/S2_SR')
  .filterBounds(aoi)
  .filterDate('2024-04-01', '2025-07-31') // Select Summer 2023
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 5)) // Strict cloud filter
  .map(maskClouds) // Apply Cloud Mask Function
  .select(selectedBands) // Standardize Band Selection
  .median()
  .clip(aoi);
  

// Determine Which Data Source is Used
var sentinelBands = sentinelImage.bandNames().size(); // Get Sentinel-2 band count
var dataSource = ee.Algorithms.If(sentinelBands.gt(0), 'Sentinel-2', 'Planet NICFI');


// Choose Sentinel-2 (10m resolution) if Available, Otherwise Use Planet NICFI (5m)
//var finalImage = ee.Algorithms.If(sentinelBands.gt(0), sentinelImage, planetImage);


// Select Bands for Display (Ensure Correct Band Names)
var imageToShow = ee.Image(sentinelImage).select(['B4', 'B3', 'B2']); // True Color
// Display Image
Map.centerObject(aoi, 15);
Map.addLayer(imageToShow, {min: 0, max: 3000}, 'Cloud-Free High-Resolution South Bend');

////////////////////////////////////////////////////////////
// Image Preprocessing
////////////////////////////////////////////////////////////

var bandsToUse = ['B4', 'B3', 'B2']; // RGB bands

var clippedImage = ee.Image(sentinelImage).clip(aoi);
// final image as selected above 

// Add NDVI, NDWI, NDBI to assist clustering
var ndvi = clippedImage.normalizedDifference(['B8', 'B4']).rename('NDVI');
var ndwi = clippedImage.normalizedDifference(['B3', 'B11']).rename('NDWI');
var ndbi = clippedImage.normalizedDifference(['B11', 'B8']).rename('NDBI');

// Combine original and derived bands
var inputForClustering = clippedImage.addBands([ndvi, ndwi, ndbi]);

var training = inputForClustering.sample({
  region: aoi,
  scale: 30,
  numPixels: 3000,
  seed: 42,
  tileScale: 4
});

var clusterer = ee.Clusterer.wekaKMeans(7).train(training);
var classified = inputForClustering.cluster(clusterer);

var visParams = {min: 0, max: 3000, bands: bandsToUse }; 
// mins and maxes I've used for RGB analysis in the past

Map.addLayer(clippedImage, visParams, 'Portage Manor Property');

////////////////////////////
//UNSUPERVISED k-means Study Area 1
/////////////////////////

// Sample Image Pixels for Clustering
  var training = clippedImage.sample({
    region: aoi, 
    scale: 30, 
    numPixels: 3000, 
    // Reduce sample size to prevent memory issues
    seed: 42,
    tileScale: 4
  });

  // Train the k-Means Clusterer
  var clusterer = ee.Clusterer.wekaKMeans(8).train(training);
  // Increasing number of clusters to account for reflective steel and river. 

  
  // Apply Clustering to the Image
  var classified = clippedImage.cluster(clusterer);
  
  // Define Visualization Parameters
  var visParams = {
    min: 0,
    max: 7, // number of clusters
    palette: ['#00008B', // Water
      'FFFFFF', // Steel reflective 
      '#c97f3d', // Shrubland/Transitional
      '#66c2a5', // Lowland forest
      '#778899', // Built
      '#e6d5a3', // Early successional/fallow field
      '#2c5f2d',  // Upland Forest
      '#a8d08d', // Lawn
    ]
  };

  
// determining by manually comparing to the satellite image

  // Add to Map
  Map.addLayer(classified, visParams, 'K means study area 1');
  
Map.centerObject(aoi)

Export.image.toDrive({
  image: classified.toInt16(),  // or toByte() or toFloat(), depending on your data type
  description: 'LULC_export_surroundings',        // Name in Tasks tab
  folder: 'GEE_exports',             // Folder in your Google Drive
  fileNamePrefix: 'lulc_portage_surroundings',    // File name prefix
  region: aoi,                       // Define your export boundary (ee.Geometry)
  scale: 30,                         // Pixel size in meters (match resolution to your source imagery)
  crs: 'EPSG:26916',                 // Optional: CRS (NAD83 / UTM zone 16N for Northern Indiana)
  maxPixels: 1e13                    // Required for large exports
});


var singleFeature = ee.Feature(aoi); // turn geometry into a Feature
var oneFeatureFC  = ee.FeatureCollection([singleFeature]); // wrap in a collection

Export.table.toDrive({
  collection: oneFeatureFC,
  description: 'Surrounding Area',
  fileFormat: 'SHP'
});
