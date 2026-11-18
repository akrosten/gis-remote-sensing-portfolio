// Define Area of Interest (Portage Manor)

// Function to Mask Clouds using Sentinel-2 Cloud Probability Band
function maskClouds(image) {
  var cloudProb = image.select('MSK_CLDPRB'); // Cloud Probability Band
  var cloudMask = cloudProb.lt(10); // Keep pixels with low cloud probability
  return image.updateMask(cloudMask);
}

// Standard Sentinel-2 Band Selection to Avoid Processing Errors
var selectedBands = ['B2', 'B3', 'B4', 'B8', 'B11']; // Blue, Green, Red, NIR, SWIR

// Load AOI using GEE geometry
var aoi = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-86.28584810358818, 41.722088911279286],
          [-86.28230758768852, 41.71621091247687],
          [-86.28185697657402, 41.71573039834105],
          [-86.28153511149223, 41.71542607086358],
          [-86.2811703310662, 41.715522174433204],
          [-86.28050514323051, 41.71590658727466],
          [-86.2798184977227, 41.715874552958994],
          [-86.27865978342827, 41.71600269012575],
          [-86.2767929659539, 41.71590658727466],
          [-86.27475448710258, 41.71621091247687],
          [-86.27269455057915, 41.71611480993708],
          [-86.27009817225273, 41.716435151177464],
          [-86.26990505320366, 41.71664337212751],
          [-86.26981922251518, 41.71728404774259],
          [-86.27016254526909, 41.71914197090965],
          [-86.27069898707207, 41.72224906720999]]]);

// Load Sentinel-2 Collection and Apply Cloud Mask
var sentinelImage = ee.ImageCollection('COPERNICUS/S2_SR')
  .filterBounds(aoi)
  .filterDate('2024-04-01', '2025-07-31') // Select Summer 2024
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

var PortageManorProperty = aoi
// Select Bands for Display (Ensure Correct Band Names)
var imageToShow = ee.Image(sentinelImage).select(['B4', 'B3', 'B2']); // True Color
// Display Image
Map.centerObject(PortageManorProperty, 15);
Map.addLayer(imageToShow, {min: 0, max: 3000}, 'Cloud-Free High-Resolution South Bend');

////////////////////////////////////////////////////////////
// Image Preprocessing
////////////////////////////////////////////////////////////

var bandsToUse = ['B4', 'B3', 'B2']; // RGB bands

var clippedImage = ee.Image(sentinelImage).clip(PortageManorProperty);
// final image as selected above 

// Add NDVI, NDWI, NDBI to assist clustering
var ndvi = clippedImage.normalizedDifference(['B8', 'B4']).rename('NDVI');
var ndwi = clippedImage.normalizedDifference(['B3', 'B11']).rename('NDWI');
var ndbi = clippedImage.normalizedDifference(['B11', 'B8']).rename('NDBI');

// Combine original and derived bands
var inputForClustering = clippedImage.addBands([ndvi, ndwi, ndbi]);

var training = inputForClustering.sample({
  region: PortageManorProperty,
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
    region: PortageManorProperty, 
    scale: 30, 
    numPixels: 3000, 
    // Reduce sample size to prevent memory issues
    seed: 42,
    tileScale: 4
  });

  // Train the k-Means Clusterer
  var clusterer = ee.Clusterer.wekaKMeans(6).train(training);
  
  // Apply Clustering to the Image
  var classified = clippedImage.cluster(clusterer);
  
  // Define Visualization Parameters
  var visParams = {
    min: 0,
    max: 5, // number of clusters
    palette: ['#66c2a5', // Lowland forest 
    '#2c5f2d',  // Upland Forest
    '#778899', // Built
    '#a8d08d', // Lawn
    '#e6d5a3', // Early successional/fallow field
    '#c97f3d', // Shrubland/Transitional
  ]
  };
// determining by manually comparing to the satellite image
// aka I decided what's lowland, built, etc 

  // Add to Map
  Map.addLayer(classified, visParams, 'K means study area 1');
  
Map.centerObject(PortageManorProperty)

Export.image.toDrive({
  image: classified.toInt16(),  // or toByte() or toFloat(), depending on your data type
  description: 'LULC_export',        // Name in Tasks tab
  folder: 'GEE_exports',             // Folder in your Google Drive
  fileNamePrefix: 'lulc_portage',    // File name prefix
  region: aoi,                       // Define your export boundary (ee.Geometry)
  scale: 30,                         // Pixel size in meters (match resolution for source imagery)
  crs: 'EPSG:26916',                 // Optional: CRS (NAD83 / UTM zone 16N for Northern Indiana)
  maxPixels: 1e13                    // Required for large exports
});


var singleFeature = ee.Feature(PortageManorProperty); // turn geometry into a Feature
var oneFeatureFC  = ee.FeatureCollection([singleFeature]); // wrap in a collection

Export.table.toDrive({
  collection: oneFeatureFC,
  description: 'PortageManorProperty',
  fileFormat: 'SHP'
});
