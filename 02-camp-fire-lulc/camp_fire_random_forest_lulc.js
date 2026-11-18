// 1. Set AOI and Training Points
var aoi = ee.Geometry.Polygon(
        [[[-122.02, 39.57],
          [-121.08, 39.56],
          [-121.09, 40.01],
          [-122.02, 40.01]]]);
/* 
Code for Training points included at the bottom of the script
61 points per LULC were used 
7 LULC categories were classified based on the 2016 pre-fire Sentinel-2 image
Built, Grassland, Water, Shrubland, Forest, Sparse Forest/Orchard, and Snow
This aligns with Alwosheel et al. 2018, who suggested 50x the data points than 
the number of categories. In our model, this threshold is exceeded by 22%.
*/


// 2. Cloud and Snow Masking Function 
function maskClouds(image) {
  var cloudBand = image.select('QA60');
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  // All flags should be set to zero
  var mask = cloudBand.bitwiseAnd(cloudBitMask).eq(0)
    .and(cloudBand.bitwiseAnd(cirrusBitMask).eq(0))
  return image.updateMask(mask)
}

// 3. Load Sentinel-2 Harmonized for 2016 image 
// and to serve as training data  
var sentinelImage2016 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(aoi)
  .filterDate('2016-10-29', '2016-12-5') // DATES! doing end of Oct 
  // through early Dec gets me the most images, and ensures I 
  // don't have anything too cloudy left in
  // the fire dates were 11/08-11/25, but revisit time doesn't ensure 
  // a complete picture of the AOI during this timeframe alone
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 5)) // setting a lowcloudy pixel percentage
  .map(maskClouds)
  .median()
  .clip(aoi);

// 4. Calculate Spectral Indices for better classification
var ndvi2016 = sentinelImage2016.normalizedDifference(['B8', 'B4']).rename('NDVI');
var ndwi2016 = sentinelImage2016.normalizedDifference(['B3', 'B11']).rename('NDWI');
var nbr2016 = sentinelImage2016.normalizedDifference(['B8', 'B12']).rename('NBR'); 
// NBR helps distingush burn area from urban area
var finalImage2016 = sentinelImage2016.addBands([ndvi2016, ndwi2016, nbr2016]);

// 5. Update Prediction Bands
// Sentinel-2 bands: B2(B), B3(G), B4(R), B8(NIR), B11(SWIR), B12 (SWIR)
var predictionBands = ['B2', 'B3', 'B4', 'B8', 'B11', 'B12', 'NDVI', 'NDWI', 'NBR'];

// 6. Training 

// Training Variables Below
// Collapse in GEE using side arrows to view the scrip more cleanly

  var Built = 
    /* color: #525252 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-121.84572708629443, 39.765626515779516]),
            {
              "class": 0,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.8452174665816, 39.76578320682645]),
            {
              "class": 0,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.84553396724536, 39.764888413683515]),
            {
              "class": 0,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.8436135055907, 39.76506984733439]),
            {
              "class": 0,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.84301805518939, 39.765189428342886]),
            {
              "class": 0,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.84301805518939, 39.76535436732419]),
            {
              "class": 0,
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.842406511534, 39.76473584410704]),
            {
              "class": 0,
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.84212219737842, 39.76522653964815]),
            {
              "class": 0,
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.84217047714068, 39.76517705790336]),
            {
              "class": 0,
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.8419398071654, 39.76520592225879]),
            {
              "class": 0,
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.84203100227191, 39.76547807130086]),
            {
              "class": 0,
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.88890651543798, 39.77496849062577]),
            {
              "class": 0,
              "system:index": "11"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.88903257926168, 39.77486335675444]),
            {
              "class": 0,
              "system:index": "12"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.88887701113882, 39.77483655789881]),
            {
              "class": 0,
              "system:index": "13"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.88849881966772, 39.774844803701654]),
            {
              "class": 0,
              "system:index": "14"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.88822255213918, 39.774888094150384]),
            {
              "class": 0,
              "system:index": "15"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.8883512981719, 39.775131344736835]),
            {
              "class": 0,
              "system:index": "16"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.88795969565572, 39.775114853198815]),
            {
              "class": 0,
              "system:index": "17"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.88788727601232, 39.77513546762074]),
            {
              "class": 0,
              "system:index": "18"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.88945636828603, 39.77446755721036]),
            {
              "class": 0,
              "system:index": "19"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.88949928363027, 39.77452940103916]),
            {
              "class": 0,
              "system:index": "20"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.88929543574514, 39.774618043763525]),
            {
              "class": 0,
              "system:index": "21"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.8890728123969, 39.77441189771693]),
            {
              "class": 0,
              "system:index": "22"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.87422866588524, 39.750736611568534]),
            {
              "class": 0,
              "system:index": "23"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.87379951244286, 39.7509428285042]),
            {
              "class": 0,
              "system:index": "24"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.87387461429527, 39.75067887071593]),
            {
              "class": 0,
              "system:index": "25"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.87313432460716, 39.75039841445774]),
            {
              "class": 0,
              "system:index": "26"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.87280173068932, 39.749911737652916]),
            {
              "class": 0,
              "system:index": "27"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85023762962368, 39.741910972268506]),
            {
              "class": 0,
              "system:index": "28"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85083844444301, 39.74163873009799]),
            {
              "class": 0,
              "system:index": "29"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85143925926235, 39.741733602491635]),
            {
              "class": 0,
              "system:index": "30"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.8510530211642, 39.74268644407119]),
            {
              "class": 0,
              "system:index": "31"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85179867527035, 39.74236470682933]),
            {
              "class": 0,
              "system:index": "32"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85187377712276, 39.74254207498178]),
            {
              "class": 0,
              "system:index": "33"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85178258201626, 39.74270294337643]),
            {
              "class": 0,
              "system:index": "34"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85178258201626, 39.741420110606654]),
            {
              "class": 0,
              "system:index": "35"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85172357341793, 39.741576856727406]),
            {
              "class": 0,
              "system:index": "36"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85164847156551, 39.741440735116605]),
            {
              "class": 0,
              "system:index": "37"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.84900634606964, 39.74104853590987]),
            {
              "class": 0,
              "system:index": "38"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.84862547238953, 39.74106916053104]),
            {
              "class": 0,
              "system:index": "39"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83466909757328, 39.747506564604414]),
            {
              "class": 0,
              "system:index": "40"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83422921529484, 39.74744469650274]),
            {
              "class": 0,
              "system:index": "41"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83386443486881, 39.74717660075342]),
            {
              "class": 0,
              "system:index": "42"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83331189981175, 39.74676826830003]),
            {
              "class": 0,
              "system:index": "43"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83296857705784, 39.74653729129519]),
            {
              "class": 0,
              "system:index": "44"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85147187436577, 39.804273188650754]),
            {
              "class": 0,
              "system:index": "45"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85526988233086, 39.802937927013915]),
            {
              "class": 0,
              "system:index": "46"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85827395642754, 39.801998282911086]),
            {
              "class": 0,
              "system:index": "47"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85554883206841, 39.80405888914723]),
            {
              "class": 0,
              "system:index": "48"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85049555028435, 39.79997882888882]),
            {
              "class": 0,
              "system:index": "49"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.86403534139153, 39.803242896462685]),
            {
              "class": 0,
              "system:index": "50"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.86240455831047, 39.80339125948923]),
            {
              "class": 0,
              "system:index": "51"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.8618681165075, 39.800918500586846]),
            {
              "class": 0,
              "system:index": "52"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.86068794454094, 39.79922048798074]),
            {
              "class": 0,
              "system:index": "53"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85901424611565, 39.79922048798074]),
            {
              "class": 0,
              "system:index": "54"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83974943567034, 39.78495740008539]),
            {
              "class": 0,
              "system:index": "55"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.84275350976702, 39.785039845943345]),
            {
              "class": 0,
              "system:index": "56"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.8426784079146, 39.78527893837276]),
            {
              "class": 0,
              "system:index": "57"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.84036097932574, 39.78650736568534]),
            {
              "class": 0,
              "system:index": "58"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83971724916216, 39.78579009871084]),
            {
              "class": 0,
              "system:index": "59"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83837614465472, 39.7850480905237]),
            {
              "class": 0,
              "system:index": "60"
            })
            ]);

  var Grassland = 
    /* color: #ffca45 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-121.85652831223402, 39.82463049694738]),
            {
              "class": 1,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85506919052992, 39.82575110535937]),
            {
              "class": 1,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85300925400648, 39.82387242795191]),
            {
              "class": 1,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85270884659681, 39.82225738350674]),
            {
              "class": 1,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85309508469496, 39.82044453329978]),
            {
              "class": 1,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.8545971217433, 39.81589571678382]),
            {
              "class": 1,
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85433962967787, 39.81470901948081]),
            {
              "class": 1,
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.84408837087632, 39.812596085176125]),
            {
              "class": 1,
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83730774648667, 39.82581382392737]),
            {
              "class": 1,
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83657818563462, 39.82578086514738]),
            {
              "class": 1,
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83435984373284, 39.81358659035624]),
            {
              "class": 1,
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.84077568769646, 39.81477330703847]),
            {
              "class": 1,
              "system:index": "11"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83438396834484, 39.801776972246934]),
            {
              "class": 1,
              "system:index": "12"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.93966993117769, 39.841441871262305]),
            {
              "class": 1,
              "system:index": "13"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.94795259261568, 39.85126064877833]),
            {
              "class": 1,
              "system:index": "14"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.95465676872234, 39.85666469492617]),
            {
              "class": 1,
              "system:index": "15"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.9548284300993, 39.85930016174692]),
            {
              "class": 1,
              "system:index": "16"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.7944199664906, 39.737250312963695]),
            {
              "class": 1,
              "system:index": "17"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.79248877599987, 39.739659359738795]),
            {
              "class": 1,
              "system:index": "18"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.78648062780651, 39.738009336787066]),
            {
              "class": 1,
              "system:index": "19"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.7808587177113, 39.73715130924002]),
            {
              "class": 1,
              "system:index": "20"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.77725382879528, 39.735006193639165]),
            {
              "class": 1,
              "system:index": "21"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.8951351482312, 39.86621866892591]),
            {
              "class": 1,
              "system:index": "22"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.90328906363648, 39.85916927921673]),
            {
              "class": 1,
              "system:index": "23"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.90075705832642, 39.86243053550725]),
            {
              "class": 1,
              "system:index": "24"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.89777444190186, 39.862414064905316]),
            {
              "class": 1,
              "system:index": "25"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.8956930477063, 39.86420933724596]),
            {
              "class": 1,
              "system:index": "26"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.8992764789502, 39.86516460062844]),
            {
              "class": 1,
              "system:index": "27"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.89343999213379, 39.864374038778045]),
            {
              "class": 1,
              "system:index": "28"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.89693759268921, 39.86531282996129]),
            {
              "class": 1,
              "system:index": "29"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.88751767462891, 39.8524650989887]),
            {
              "class": 1,
              "system:index": "30"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.88650916403931, 39.85393117960235]),
            {
              "class": 1,
              "system:index": "31"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.88809703177613, 39.855907867933055]),
            {
              "class": 1,
              "system:index": "32"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.88153153565763, 39.85651372194776]),
            {
              "class": 1,
              "system:index": "33"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.88380604890226, 39.857502036040074]),
            {
              "class": 1,
              "system:index": "34"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.90100251723308, 39.84334059810172]),
            {
              "class": 1,
              "system:index": "35"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.89804135848064, 39.84505399558659]),
            {
              "class": 1,
              "system:index": "36"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.89812718916912, 39.84195666891944]),
            {
              "class": 1,
              "system:index": "37"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.89216195632, 39.84564708475405]),
            {
              "class": 1,
              "system:index": "38"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.89040242720623, 39.844395001613954]),
            {
              "class": 1,
              "system:index": "39"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.8934065013029, 39.8439007519837]),
            {
              "class": 1,
              "system:index": "40"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.89186154891033, 39.84119879111898]),
            {
              "class": 1,
              "system:index": "41"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.90782605696697, 39.841066985430245]),
            {
              "class": 1,
              "system:index": "42"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.90924226332683, 39.84432910186882]),
            {
              "class": 1,
              "system:index": "43"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.91327630568523, 39.84492219729807]),
            {
              "class": 1,
              "system:index": "44"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.95341161095763, 39.85397560360458]),
            {
              "class": 1,
              "system:index": "45"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.95341161095763, 39.854733340369606]),
            {
              "class": 1,
              "system:index": "46"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.95047190987731, 39.852674253553616]),
            {
              "class": 1,
              "system:index": "47"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.93903583893578, 39.85961789152182]),
            {
              "class": 1,
              "system:index": "48"
            }),
        ee.Feature(
            ee.Geometry.Point([-122.01634510555738, 39.918566286537256]),
            {
              "class": 1,
              "system:index": "49"
            }),
        ee.Feature(
            ee.Geometry.Point([-122.01892002621167, 39.92087024419941]),
            {
              "class": 1,
              "system:index": "50"
            }),
        ee.Feature(
            ee.Geometry.Point([-122.01007946529859, 39.912443965254226]),
            {
              "class": 1,
              "system:index": "51"
            }),
        ee.Feature(
            ee.Geometry.Point([-122.00252636471265, 39.905991894701216]),
            {
              "class": 1,
              "system:index": "52"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.99617489376539, 39.898749050830965]),
            {
              "class": 1,
              "system:index": "53"
            }),
        ee.Feature(
            ee.Geometry.Point([-122.00080975094312, 39.902831475163126]),
            {
              "class": 1,
              "system:index": "54"
            }),
        ee.Feature(
            ee.Geometry.Point([-122.0038138250398, 39.905201803483905]),
            {
              "class": 1,
              "system:index": "55"
            }),
        ee.Feature(
            ee.Geometry.Point([-122.00059517422193, 39.90441170315512]),
            {
              "class": 1,
              "system:index": "56"
            }),
        ee.Feature(
            ee.Geometry.Point([-122.00759037533277, 39.910403069873226]),
            {
              "class": 1,
              "system:index": "57"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.98986764159459, 39.894944368487224]),
            {
              "class": 1,
              "system:index": "58"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.99094052520054, 39.89606382925001]),
            {
              "class": 1,
              "system:index": "59"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.99282880034703, 39.89757836470683]),
            {
              "class": 1,
              "system:index": "60"
            })
            ]);

  var Water = 
    /* color: #2139c9 */
    /* shown: false */
    
    
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-121.77859858745182, 39.76760262860722]),
            {
              "class": 2,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.77854226106251, 39.767988159345286]),
            {
              "class": 2,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.77974882480582, 39.766653185630624]),
            {
              "class": 2,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.78011360523185, 39.76662844527533]),
            {
              "class": 2,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.780140427322, 39.7665480390592]),
            {
              "class": 2,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.78052142195202, 39.766604289540446]),
            {
              "class": 2,
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.78085401586986, 39.766604289540446]),
            {
              "class": 2,
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.78189916147517, 39.76637312627291]),
            {
              "class": 2,
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.78611949496988, 39.765441792098805]),
            {
              "class": 2,
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.78647622876886, 39.765316026321045]),
            {
              "class": 2,
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.78790952666175, 39.765193616443526]),
            {
              "class": 2,
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.78875866691939, 39.76523674300502]),
            {
              "class": 2,
              "system:index": "11"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.78885522644393, 39.765212002140736]),
            {
              "class": 2,
              "system:index": "12"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.78902688782088, 39.76525736038511]),
            {
              "class": 2,
              "system:index": "13"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.7894439713227, 39.76528416297002]),
            {
              "class": 2,
              "system:index": "14"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.78950432102553, 39.76521097127121]),
            {
              "class": 2,
              "system:index": "15"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.49936172019729, 39.63938817786491]),
            {
              "class": 2,
              "system:index": "16"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.49560662757644, 39.636165920098826]),
            {
              "class": 2,
              "system:index": "17"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.49249909617248, 39.62856345400573]),
            {
              "class": 2,
              "system:index": "18"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.4910614321405, 39.624596956360946]),
            {
              "class": 2,
              "system:index": "19"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.48037551142517, 39.627175205694435]),
            {
              "class": 2,
              "system:index": "20"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.48222087122741, 39.62909230317851]),
            {
              "class": 2,
              "system:index": "21"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.48295306795575, 39.598564086347686]),
            {
              "class": 2,
              "system:index": "22"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.47351169222333, 39.59118963537865]),
            {
              "class": 2,
              "system:index": "23"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.52040304339111, 39.66134981920131]),
            {
              "class": 2,
              "system:index": "24"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.5283093648468, 39.663887445450044]),
            {
              "class": 2,
              "system:index": "25"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.53735163947283, 39.66726044605087]),
            {
              "class": 2,
              "system:index": "26"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.54391694441826, 39.67035690473576]),
            {
              "class": 2,
              "system:index": "27"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.54327321425468, 39.671199246837055]),
            {
              "class": 2,
              "system:index": "28"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.550757409168, 39.67500973387191]),
            {
              "class": 2,
              "system:index": "29"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.55350399119925, 39.67634747642247]),
            {
              "class": 2,
              "system:index": "30"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.55742212507671, 39.67783944453967]),
            {
              "class": 2,
              "system:index": "31"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.56113430235332, 39.67909455971832]),
            {
              "class": 2,
              "system:index": "32"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.56332298490948, 39.67921016128497]),
            {
              "class": 2,
              "system:index": "33"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.55393831844928, 39.68119980788894]),
            {
              "class": 2,
              "system:index": "34"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.56098276071478, 39.6982826911553]),
            {
              "class": 2,
              "system:index": "35"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.5655961602204, 39.69749020976432]),
            {
              "class": 2,
              "system:index": "36"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.56037347788653, 39.70726129801468]),
            {
              "class": 2,
              "system:index": "37"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.49341366352925, 39.66909962081873]),
            {
              "class": 2,
              "system:index": "38"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.47813580098043, 39.677820000493526]),
            {
              "class": 2,
              "system:index": "39"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.46182797016988, 39.67504545364465]),
            {
              "class": 2,
              "system:index": "40"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.44655010762105, 39.670685226277214]),
            {
              "class": 2,
              "system:index": "41"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.4192559486855, 39.67583819268842]),
            {
              "class": 2,
              "system:index": "42"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.41135952534566, 39.69301197113161]),
            {
              "class": 2,
              "system:index": "43"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.52583408399563, 39.76621455087969]),
            {
              "class": 2,
              "system:index": "44"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.5211992268179, 39.767270137815785]),
            {
              "class": 2,
              "system:index": "45"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.51875305219632, 39.77366928714053]),
            {
              "class": 2,
              "system:index": "46"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.52051258131009, 39.77591214714166]),
            {
              "class": 2,
              "system:index": "47"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.51549148603421, 39.7729436403163]),
            {
              "class": 2,
              "system:index": "48"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.513901738791, 39.779460295805855]),
            {
              "class": 2,
              "system:index": "49"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.5102965286314, 39.780235697565466]),
            {
              "class": 2,
              "system:index": "50"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.50956696777935, 39.78335229614068]),
            {
              "class": 2,
              "system:index": "51"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.84922034236268, 39.833278476741505]),
            {
              "class": 2,
              "system:index": "52"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85554029656697, 39.829341480742805]),
            {
              "class": 2,
              "system:index": "53"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85523452473927, 39.829582478965804]),
            {
              "class": 2,
              "system:index": "54"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85624232746487, 39.828536860990376]),
            {
              "class": 2,
              "system:index": "55"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.79857366293993, 39.736142254418404]),
            {
              "class": 2,
              "system:index": "56"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.79896258324709, 39.73638976708454]),
            {
              "class": 2,
              "system:index": "57"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.79931843509127, 39.73654940554746]),
            {
              "class": 2,
              "system:index": "58"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.80410581893348, 39.737724121547394]),
            {
              "class": 2,
              "system:index": "59"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.80401462382697, 39.73780559269491]),
            {
              "class": 2,
              "system:index": "60"
            })
            ]);
            
  var Shrubland = 
    /* color: #8fa65e */
    /* shown: false */
    
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-121.69569442179119, 39.845297837252666]),
            {
              "class": 3,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.69663855936443, 39.84422697263839]),
            {
              "class": 3,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.69590420415793, 39.844868661134775]),
            {
              "class": 3,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.69587469985876, 39.84496545060305]),
            {
              "class": 3,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.69522539736188, 39.84534467776799]),
            {
              "class": 3,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.69495181204236, 39.84570300156887]),
            {
              "class": 3,
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.72797097919725, 39.78277552799032]),
            {
              "class": 3,
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.72586812732958, 39.78633721194581]),
            {
              "class": 3,
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.72496690510057, 39.78818393844987]),
            {
              "class": 3,
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.72621145008348, 39.78989871153229]),
            {
              "class": 3,
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.7226494765117, 39.78960192694207]),
            {
              "class": 3,
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.7232073759868, 39.787194626844474]),
            {
              "class": 3,
              "system:index": "11"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.72406568287157, 39.785677654752675]),
            {
              "class": 3,
              "system:index": "12"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.725224397166, 39.78429256406696]),
            {
              "class": 3,
              "system:index": "13"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.72711267231249, 39.780730774271895]),
            {
              "class": 3,
              "system:index": "14"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.72822847126268, 39.780829715366785]),
            {
              "class": 3,
              "system:index": "15"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.73076047657274, 39.780862695700144]),
            {
              "class": 3,
              "system:index": "16"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.72921026913318, 39.77941121988002]),
            {
              "class": 3,
              "system:index": "17"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.7287274715105, 39.779320522012306]),
            {
              "class": 3,
              "system:index": "18"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.72737563816699, 39.780169779184014]),
            {
              "class": 3,
              "system:index": "19"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.72450031010302, 39.780895349824725]),
            {
              "class": 3,
              "system:index": "20"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.72441447941455, 39.78018626951081]),
            {
              "class": 3,
              "system:index": "21"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71831202921138, 39.799488263529874]),
            {
              "class": 3,
              "system:index": "22"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71850514826045, 39.79952123491921]),
            {
              "class": 3,
              "system:index": "23"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71735716280207, 39.79941407784608]),
            {
              "class": 3,
              "system:index": "24"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71874118265376, 39.79925334192331]),
            {
              "class": 3,
              "system:index": "25"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71899867471919, 39.79906787693019]),
            {
              "class": 3,
              "system:index": "26"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71920788702235, 39.79929455629828]),
            {
              "class": 3,
              "system:index": "27"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71955120977626, 39.79954596345085]),
            {
              "class": 3,
              "system:index": "28"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.7188216489242, 39.800312543520846]),
            {
              "class": 3,
              "system:index": "29"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71833885130152, 39.800320786270866]),
            {
              "class": 3,
              "system:index": "30"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71861780103907, 39.80001992525518]),
            {
              "class": 3,
              "system:index": "31"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71787214693293, 39.800366121378275]),
            {
              "class": 3,
              "system:index": "32"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71704602655635, 39.800312543520846]),
            {
              "class": 3,
              "system:index": "33"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71718013700709, 39.800048774998686]),
            {
              "class": 3,
              "system:index": "34"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71671879705653, 39.79976851983535]),
            {
              "class": 3,
              "system:index": "35"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71678853449092, 39.79995810433553]),
            {
              "class": 3,
              "system:index": "36"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83785783965476, 39.797798590104534]),
            {
              "class": 3,
              "system:index": "37"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83839428145774, 39.79772852412828]),
            {
              "class": 3,
              "system:index": "38"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83782565314658, 39.79757602734494]),
            {
              "class": 3,
              "system:index": "39"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83609294612296, 39.7977821039989]),
            {
              "class": 3,
              "system:index": "40"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83620023448356, 39.79807473178656]),
            {
              "class": 3,
              "system:index": "41"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83482150032376, 39.797303055711374]),
            {
              "class": 3,
              "system:index": "42"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83452109291409, 39.79760805015048]),
            {
              "class": 3,
              "system:index": "43"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83420459225033, 39.797941893864355]),
            {
              "class": 3,
              "system:index": "44"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.833786167644, 39.798168576943844]),
            {
              "class": 3,
              "system:index": "45"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83353940441464, 39.79805317474219]),
            {
              "class": 3,
              "system:index": "46"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83337310745571, 39.79778939755412]),
            {
              "class": 3,
              "system:index": "47"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83362523510311, 39.79739785142515]),
            {
              "class": 3,
              "system:index": "48"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.83412412597988, 39.7973154203771]),
            {
              "class": 3,
              "system:index": "49"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71164303023417, 39.81400196428865]),
            {
              "class": 3,
              "system:index": "50"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.7115571995457, 39.81517219186308]),
            {
              "class": 3,
              "system:index": "51"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71177177626689, 39.81189220790168]),
            {
              "class": 3,
              "system:index": "52"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71162157256205, 39.810688958466045]),
            {
              "class": 3,
              "system:index": "53"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71138279309164, 39.819464369742846]),
            {
              "class": 3,
              "system:index": "54"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71082489361655, 39.82299119373912]),
            {
              "class": 3,
              "system:index": "55"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.7057701885257, 39.830922899028636]),
            {
              "class": 3,
              "system:index": "56"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.70301620452702, 39.837878138580585]),
            {
              "class": 3,
              "system:index": "57"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.70200769393742, 39.839163292930294]),
            {
              "class": 3,
              "system:index": "58"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.69932548492253, 39.84028366427917]),
            {
              "class": 3,
              "system:index": "59"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.69812385528385, 39.84201361354675]),
            {
              "class": 3,
              "system:index": "60"
            })
            ]);
            
  var Forest = 
    /* color: #2a7d0c */
    /* shown: false */
    
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-121.63304738815931, 39.937599769796655]),
            {
              "class": 4,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.63502149399427, 39.94477270225426]),
            {
              "class": 4,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.62995748337416, 39.946088755006954]),
            {
              "class": 4,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.62678174790052, 39.94115342664919]),
            {
              "class": 4,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.61656789597181, 39.94279857565773]),
            {
              "class": 4,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.6222756367555, 39.934539528517114]),
            {
              "class": 4,
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.62695340927748, 39.932071492325754]),
            {
              "class": 4,
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.67807334528418, 39.93303786827528]),
            {
              "class": 4,
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.6794466362998, 39.93501227647092]),
            {
              "class": 4,
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.67871707544775, 39.939915143805706]),
            {
              "class": 4,
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.68176406488867, 39.94014547121625]),
            {
              "class": 4,
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.69566522138064, 39.93698434458663]),
            {
              "class": 4,
              "system:index": "11"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.70077214734499, 39.937445018361885]),
            {
              "class": 4,
              "system:index": "12"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.70523534314577, 39.93843216600935]),
            {
              "class": 4,
              "system:index": "13"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71375935135919, 39.93874989115466]),
            {
              "class": 4,
              "system:index": "14"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71090192955555, 39.94602662283308]),
            {
              "class": 4,
              "system:index": "15"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71442098778309, 39.94921794852282]),
            {
              "class": 4,
              "system:index": "16"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.7062553184145, 39.95850785686271]),
            {
              "class": 4,
              "system:index": "17"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71595418621236, 39.958935490903066]),
            {
              "class": 4,
              "system:index": "18"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.69994676281148, 39.957948639082524]),
            {
              "class": 4,
              "system:index": "19"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.69958897236359, 39.96466616452781]),
            {
              "class": 4,
              "system:index": "20"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.69006176594269, 39.96450170399778]),
            {
              "class": 4,
              "system:index": "21"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.68109245899689, 39.96726458839657]),
            {
              "class": 4,
              "system:index": "22"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.67748757008087, 39.968382867004166]),
            {
              "class": 4,
              "system:index": "23"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.6792041838504, 39.970750926020756]),
            {
              "class": 4,
              "system:index": "24"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.57452760847661, 39.783484749667124]),
            {
              "class": 4,
              "system:index": "25"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.57366930159185, 39.78344352581881]),
            {
              "class": 4,
              "system:index": "26"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.58311127128161, 39.7817782414198]),
            {
              "class": 4,
              "system:index": "27"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.5829288810686, 39.78219048876824]),
            {
              "class": 4,
              "system:index": "28"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.69573926988456, 39.80341520860228]),
            {
              "class": 4,
              "system:index": "29"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.69539594713065, 39.80409108032578]),
            {
              "class": 4,
              "system:index": "30"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.6940011984429, 39.80351411707435]),
            {
              "class": 4,
              "system:index": "31"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.69443035188529, 39.80417350325223]),
            {
              "class": 4,
              "system:index": "32"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.69380807939383, 39.80486585193345]),
            {
              "class": 4,
              "system:index": "33"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.69252061906668, 39.80540983529219]),
            {
              "class": 4,
              "system:index": "34"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.7049255313832, 39.79780730512862]),
            {
              "class": 4,
              "system:index": "35"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.70522593879286, 39.79856566161997]),
            {
              "class": 4,
              "system:index": "36"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.70569800757949, 39.79902726582482]),
            {
              "class": 4,
              "system:index": "37"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.69926070594374, 39.79302616949318]),
            {
              "class": 4,
              "system:index": "38"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.6997756900746, 39.79223477705457]),
            {
              "class": 4,
              "system:index": "39"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.69773721122328, 39.79413080621429]),
            {
              "class": 4,
              "system:index": "40"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.79074335193671, 39.76356962666317]),
            {
              "class": 4,
              "system:index": "41"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.79108131027259, 39.76307067210186]),
            {
              "class": 4,
              "system:index": "42"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.79117786979712, 39.76283150251786]),
            {
              "class": 4,
              "system:index": "43"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.7923128668483, 39.76299275776781]),
            {
              "class": 4,
              "system:index": "44"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.79239333311875, 39.76244431531784]),
            {
              "class": 4,
              "system:index": "45"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.79413879659545, 39.76302219330003]),
            {
              "class": 4,
              "system:index": "46"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.79357553270232, 39.76310054183137]),
            {
              "class": 4,
              "system:index": "47"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.7972396846643, 39.76069248792972]),
            {
              "class": 4,
              "system:index": "48"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.79705729445129, 39.76045743384867]),
            {
              "class": 4,
              "system:index": "49"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.79747571905762, 39.760568775355495]),
            {
              "class": 4,
              "system:index": "50"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.80216958483368, 39.75969271101341]),
            {
              "class": 4,
              "system:index": "51"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.80272748430878, 39.76041024997828]),
            {
              "class": 4,
              "system:index": "52"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.80498270386248, 39.75818982797875]),
            {
              "class": 4,
              "system:index": "53"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.80482713573961, 39.75843726145207]),
            {
              "class": 4,
              "system:index": "54"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.80461792343645, 39.75863933146253]),
            {
              "class": 4,
              "system:index": "55"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.74417000362226, 39.86178253892256]),
            {
              "class": 4,
              "system:index": "56"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.67965223596521, 39.86805859006616]),
            {
              "class": 4,
              "system:index": "57"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.67845060632654, 39.868437381745835]),
            {
              "class": 4,
              "system:index": "58"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.67892267511316, 39.869063206895106]),
            {
              "class": 4,
              "system:index": "59"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.67836477563806, 39.869474930853414]),
            {
              "class": 4,
              "system:index": "60"
            })
            ]);

  var SparseForestandOrchard = 
    /* color: #89bc00 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-121.9393913869369, 39.777441094196526]),
            {
              "class": 5,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.94218088431239, 39.780376426502464]),
            {
              "class": 5,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.94239546103358, 39.78416908621134]),
            {
              "class": 5,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.94256712241054, 39.78799451379502]),
            {
              "class": 5,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.91372801108241, 39.79172080339005]),
            {
              "class": 5,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.91681791586757, 39.78674137990861]),
            {
              "class": 5,
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.927160513829, 39.78027748475584]),
            {
              "class": 5,
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.93964887900233, 39.770514532987214]),
            {
              "class": 5,
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.93621565146327, 39.773944917086524]),
            {
              "class": 5,
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.94806028647304, 39.77354911226114]),
            {
              "class": 5,
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.92411352438808, 39.76642423621799]),
            {
              "class": 5,
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.96376730246425, 39.766457223454275]),
            {
              "class": 5,
              "system:index": "11"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.96702886862636, 39.76683657553534]),
            {
              "class": 5,
              "system:index": "12"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.93625856680751, 39.77678145173091]),
            {
              "class": 5,
              "system:index": "13"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.93578649802089, 39.7685353874765]),
            {
              "class": 5,
              "system:index": "14"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.92102361960292, 39.77625373320631]),
            {
              "class": 5,
              "system:index": "15"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.92162443442226, 39.780607290024705]),
            {
              "class": 5,
              "system:index": "16"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.92027439890711, 39.6611595694374]),
            {
              "class": 5,
              "system:index": "17"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.92027439890711, 39.65871474214954]),
            {
              "class": 5,
              "system:index": "18"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.91624035654871, 39.65871474214954]),
            {
              "class": 5,
              "system:index": "19"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.91615452586024, 39.66287750443979]),
            {
              "class": 5,
              "system:index": "20"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.91074719248621, 39.664661468662935]),
            {
              "class": 5,
              "system:index": "21"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.91074719248621, 39.66254713564068]),
            {
              "class": 5,
              "system:index": "22"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.90551152048914, 39.664132891472306]),
            {
              "class": 5,
              "system:index": "23"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.90551152048914, 39.65970589877115]),
            {
              "class": 5,
              "system:index": "24"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.90717276644254, 39.65075016540334]),
            {
              "class": 5,
              "system:index": "25"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.90459784578825, 39.65068408017584]),
            {
              "class": 5,
              "system:index": "26"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.8595250033446, 39.65462532754995]),
            {
              "class": 5,
              "system:index": "27"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.86521479779447, 39.57254143581767]),
            {
              "class": 5,
              "system:index": "28"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.87980601483548, 39.57359998604191]),
            {
              "class": 5,
              "system:index": "29"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.8724245756265, 39.579024802247936]),
            {
              "class": 5,
              "system:index": "30"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.88169428998197, 39.57955402987904]),
            {
              "class": 5,
              "system:index": "31"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85165354901517, 39.589079436209545]),
            {
              "class": 5,
              "system:index": "32"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.85182521039212, 39.58180320222841]),
            {
              "class": 5,
              "system:index": "33"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.84169718915189, 39.571482869430106]),
            {
              "class": 5,
              "system:index": "34"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.82727763348782, 39.57611397804408]),
            {
              "class": 5,
              "system:index": "35"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.82384440594876, 39.579024802247936]),
            {
              "class": 5,
              "system:index": "36"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.77371928387845, 39.58352310830366]),
            {
              "class": 5,
              "system:index": "37"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.7658228605386, 39.58696279240024]),
            {
              "class": 5,
              "system:index": "38"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.75895640546048, 39.59238656271381]),
            {
              "class": 5,
              "system:index": "39"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.77251765423978, 39.58868257042058]),
            {
              "class": 5,
              "system:index": "40"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.86263987714017, 39.602703782754006]),
            {
              "class": 5,
              "system:index": "41"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.86263987714017, 39.59701627460389]),
            {
              "class": 5,
              "system:index": "42"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.87396952801907, 39.60336509059894]),
            {
              "class": 5,
              "system:index": "43"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.89165064984525, 39.57849557057579]),
            {
              "class": 5,
              "system:index": "44"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.89920375043118, 39.57082125722995]),
            {
              "class": 5,
              "system:index": "45"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.8976587980386, 39.60653928034786]),
            {
              "class": 5,
              "system:index": "46"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.94859937253183, 39.84775651971304]),
            {
              "class": 5,
              "system:index": "47"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.94673255505747, 39.8480695273129]),
            {
              "class": 5,
              "system:index": "48"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.92623746866953, 39.76833627310368]),
            {
              "class": 5,
              "system:index": "49"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.92246091837656, 39.76823731404837]),
            {
              "class": 5,
              "system:index": "50"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.90756929392587, 39.77344896409566]),
            {
              "class": 5,
              "system:index": "51"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.9450343894459, 39.780210327026445]),
            {
              "class": 5,
              "system:index": "52"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.94589269633066, 39.78400299588988]),
            {
              "class": 5,
              "system:index": "53"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.95633720113305, 39.81639088669169]),
            {
              "class": 5,
              "system:index": "54"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.95631817801038, 39.81556456090945]),
            {
              "class": 5,
              "system:index": "55"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.95631817801038, 39.81480639189862]),
            {
              "class": 5,
              "system:index": "56"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.95636109335462, 39.813949321207055]),
            {
              "class": 5,
              "system:index": "57"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.95644692404309, 39.819025661021755]),
            {
              "class": 5,
              "system:index": "58"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.95648983938733, 39.82199217952847]),
            {
              "class": 5,
              "system:index": "59"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.95644692404309, 39.8207726263109]),
            {
              "class": 5,
              "system:index": "60"
            })
            ]);
            
  var Snow = 
    /* color: #ffffff */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-121.55069635622405, 39.98264025842372]),
            {
              "class": 6,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.54846475832366, 39.98264025842372]),
            {
              "class": 6,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.54297159426116, 39.98546817379759]),
            {
              "class": 6,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.53979585878753, 39.972774521026466]),
            {
              "class": 6,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.53868005983733, 39.972248308358225]),
            {
              "class": 6,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.53129862062835, 39.96685439493101]),
            {
              "class": 6,
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.53413103334807, 39.96902516736615]),
            {
              "class": 6,
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.50194452516936, 39.974418909502944]),
            {
              "class": 6,
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.50228784792327, 39.97652366902161]),
            {
              "class": 6,
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.49524973146819, 39.97356383243269]),
            {
              "class": 6,
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.45250160750983, 39.97835723580146]),
            {
              "class": 6,
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.4493258720362, 39.97750220800634]),
            {
              "class": 6,
              "system:index": "11"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.44185860213874, 39.97973841194813]),
            {
              "class": 6,
              "system:index": "12"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.44031364974616, 39.98250068049028]),
            {
              "class": 6,
              "system:index": "13"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.41910046898879, 39.995305617631246]),
            {
              "class": 6,
              "system:index": "14"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.41403645836867, 39.99556863569285]),
            {
              "class": 6,
              "system:index": "15"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.40717000329055, 39.99313567997245]),
            {
              "class": 6,
              "system:index": "16"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.40545338952101, 39.99089991451804]),
            {
              "class": 6,
              "system:index": "17"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.40176266991652, 39.98787493888702]),
            {
              "class": 6,
              "system:index": "18"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.40021771752394, 39.982284957543875]),
            {
              "class": 6,
              "system:index": "19"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.35820129481873, 39.99067979816991]),
            {
              "class": 6,
              "system:index": "20"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.35657051173767, 39.9894303639257]),
            {
              "class": 6,
              "system:index": "21"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.35107734767517, 39.99008796374519]),
            {
              "class": 6,
              "system:index": "22"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.34858825770935, 39.99508551548144]),
            {
              "class": 6,
              "system:index": "23"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.35039070216736, 39.99692662657422]),
            {
              "class": 6,
              "system:index": "24"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.33940437404236, 40.00113469411358]),
            {
              "class": 6,
              "system:index": "25"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.33794525233826, 39.99929369647403]),
            {
              "class": 6,
              "system:index": "26"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.3337395486029, 40.00356736486142]),
            {
              "class": 6,
              "system:index": "27"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.30865330218134, 40.00156796626963]),
            {
              "class": 6,
              "system:index": "28"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.30642170428095, 40.00419786010411]),
            {
              "class": 6,
              "system:index": "29"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.30427593706904, 39.99926672606698]),
            {
              "class": 6,
              "system:index": "30"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.29904026507197, 40.0003187312116]),
            {
              "class": 6,
              "system:index": "31"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.29646534441767, 40.000515980371816]),
            {
              "class": 6,
              "system:index": "32"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.29363293169794, 39.998806468719636]),
            {
              "class": 6,
              "system:index": "33"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.29861111162958, 39.98835121632866]),
            {
              "class": 6,
              "system:index": "34"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.29655117510615, 39.99085010144082]),
            {
              "class": 6,
              "system:index": "35"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.29586452959833, 39.99091586034086]),
            {
              "class": 6,
              "system:index": "36"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.31938213824091, 40.001633714850094]),
            {
              "class": 6,
              "system:index": "37"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.31732220171747, 40.00511829901383]),
            {
              "class": 6,
              "system:index": "38"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.31852383135615, 40.006827652637256]),
            {
              "class": 6,
              "system:index": "39"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.32032627581415, 40.00794528378812]),
            {
              "class": 6,
              "system:index": "40"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.32745022295771, 39.994664012993304]),
            {
              "class": 6,
              "system:index": "41"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.34023899554072, 39.994598257701895]),
            {
              "class": 6,
              "system:index": "42"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.34255642412958, 39.991441929262]),
            {
              "class": 6,
              "system:index": "43"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.33972401140986, 39.98109507111574]),
            {
              "class": 6,
              "system:index": "44"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.32976765154658, 39.97984546156762]),
            {
              "class": 6,
              "system:index": "45"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.3337158632165, 39.97675422397521]),
            {
              "class": 6,
              "system:index": "46"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.32727856158075, 39.97445214769463]),
            {
              "class": 6,
              "system:index": "47"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.32024044512568, 39.97188688563767]),
            {
              "class": 6,
              "system:index": "48"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.31637806414423, 39.97359707104024]),
            {
              "class": 6,
              "system:index": "49"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.31251568316279, 39.97603072264292]),
            {
              "class": 6,
              "system:index": "50"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.34153001534786, 39.961882433980776]),
            {
              "class": 6,
              "system:index": "51"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.34144418465938, 39.95898775301097]),
            {
              "class": 6,
              "system:index": "52"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.3314878247961, 39.95300063766866]),
            {
              "class": 6,
              "system:index": "53"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.3326036237463, 39.95076355897551]),
            {
              "class": 6,
              "system:index": "54"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.33517854440059, 39.9471446002994]),
            {
              "class": 6,
              "system:index": "55"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.37143881855185, 39.93656885647699]),
            {
              "class": 6,
              "system:index": "56"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.3716104799288, 39.92281294178065]),
            {
              "class": 6,
              "system:index": "57"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.37843073087896, 39.91593647029801]),
            {
              "class": 6,
              "system:index": "58"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.38675630766119, 39.915146493776746]),
            {
              "class": 6,
              "system:index": "59"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.39396608549322, 39.91508066198864]),
            {
              "class": 6,
              "system:index": "60"
            })]); 
            
var trainingFeatures = ee.FeatureCollection([Built, Grassland, Water, Shrubland, Forest, SparseForestandOrchard, Snow
]).flatten();
// 0 = Built
// 1 = Grassland
// 2 = Water
// 3 = Shrubland
// 4 = Forest
// 5 = SparseForestandOrchard
// 6 = Snow


var classifierTraining = finalImage2016.select(predictionBands)
  .sampleRegions({
    collection: trainingFeatures,
    properties: ['class'],
    scale: 30
  });

// 7. Random Forest Classifier 
var RFclassifier = ee.Classifier.smileRandomForest(100).train({
  features: classifierTraining,
  classProperty: 'class',
  inputProperties: predictionBands
});

//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////EDIT HERE FOR EACH IMAGE!///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

// 8. Load Sentinel-2 Harmonized for given test year  
var sentinelImage_testyear = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(aoi)
  .filterDate('2021-10-29', '2021-12-5') // DATES! doing end of Oct 
  // through early Dec gets me the most images, and ensures I 
  // don't have anything too cloudy left in  
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 5))
  .map(maskClouds)
  .median()
  .clip(aoi);

var ndvi_testyear = sentinelImage_testyear.normalizedDifference(['B8', 'B4']).rename('NDVI');
var ndwi_testyear = sentinelImage_testyear.normalizedDifference(['B3', 'B11']).rename('NDWI');
var nbr_testyear = sentinelImage_testyear.normalizedDifference(['B8', 'B12']).rename('NBR'); 
var finalImage_testyear = sentinelImage_testyear.addBands([ndvi_testyear, ndwi_testyear, nbr_testyear]);

// 9. Classified Images
var RFclassified2016 = finalImage2016.select(predictionBands).classify(RFclassifier);
var RFclassified_testyear = finalImage_testyear.select(predictionBands).classify(RFclassifier);


//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

// 10. Visualization
Map.centerObject(aoi, 10);

Map.addLayer(finalImage2016, {bands:['B4', 'B3', 'B2'], min:0, max: 3000}, 'Sentinel True Color 2016');
Map.addLayer(finalImage_testyear, {bands:['B4', 'B3', 'B2'], min:0, max: 3000}, 'Sentinel True Color 2021');

var classVis = {
  min: 0, 
  max: 6, 
  palette: ['#525252', // Urban and Built 
  '#ffca45', // Grassland
  '#2139c9', // Water
  '#8fa65e', // Shrubland
  '#2a7d0c', // Forest
  '#89bc00', // Sparse Forest and Orchards
  '#FFFFFF', // Snow
  ]
};

Map.addLayer(RFclassified2016, classVis, 'LULC Classification 2016');
Map.addLayer(RFclassified_testyear, classVis, 'LULC Classification 2021');

// Map.addLayer(finalImage2018, {bands:['B12', 'B8', 'B4'], min:0, max: 4000}, 'Smoke-Piercing View');
// Google gemini came up with this when I told it the model was struggling to 
// classify smoke. It isn't part of our final output at all but it is helpful to 
// see, to understand where the fire burned 

// 11. Export
Export.image.toDrive({
  image: RFclassified_testyear.toInt16(), // make sure to update!
  description: 'CampFire_LULC_2021', // make sure to update! 
  folder: 'RSH Final Project Rasters',
  fileNamePrefix: 'campfire_lulc_Fall2021_Created02242026', // make sure to update!
  region: aoi,
  scale: 30, // 30 m rather than Sentinel-2's native 10 m, to match the scale used in the group's SMAP soil moisture analysis
  crs: 'EPSG:26910', // Updated to California UTM Zone 10N
  maxPixels: 1e13
});
