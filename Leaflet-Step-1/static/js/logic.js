// Store earthquake data from past 7 days
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Create a function to select the color of a marker based on the magnitude of an earthquake
function getColor(magnitude) {
    return magnitude > 5 ? "#EA2C2C" :
    magnitude > 4  ? "#EA822C" :
    magnitude > 3  ? "#EE9C00" :
    magnitude > 2  ? "#EECC00" :
    magnitude > 1  ? "#D4EE00" :
                     "#98EE00";
};

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

// Define a function we want to run once for each feature in the features array
function createFeatures(earthquakeData) {
    // Give each feature a popup describing the place and time of the earthquake
    
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function (feature, layer) {
    layer.bindPopup(`<h3> ${feature.properties.place} </h3>
        <hr>
        <p> ${new Date(feature.properties.time)} </p>
        <p> Magnitude: ${feature.properties.mag} </p>`)
    },
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: (feature.properties.mag)*4,
          fillColor: getColor(feature.properties.mag),
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        })
    }
  });

  // Sending our earthquake layer to the createMap function
  createMap(earthquakes);
};

// Creating the map
function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  let streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  let darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold base layers
  let baseMaps = {
      "Street Map": streetmap,
      "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  let overlayMaps = {
      Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquake layers to display on load
  let myMap = L.map("map-id", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [streetmap, earthquakes]
  });

  // Create the legend and add it to the map. Code used from Stack Overflow answer.
  let legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'info legend'),
  grades = [0, 1, 2, 3, 4, 5],
  labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  };

  return div;
  };

  legend.addTo(myMap);

  // Create layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
  }).addTo(myMap);
};

// Another method of solving. L.marker needs to be changed to circle, and radius and color
// methods added, but will do the same. Downside is slowness due to the forEach loop.
// Would be great for smaller data sets.

// function createMap(earthquakes) {

//     // Create the tile layer that will be the background of our map
//     let lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
//         attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
//         maxZoom: 18,
//         id: "light-v10",
//         accessToken: API_KEY
//       });

//       // Create a baseMaps object to hold the lightmap object
//       let baseMaps = {
//           "Light Map": lightmap
//       };

//       // Create an overlayMaps object to hold the earthquake layer
//       let overlayMaps = {
//           "Earthquakes": earthquakes
//       };

//       // Create the map object with options
//       let map = L.map("map-id", {
//           center: [37.09, -95.71],
//           zoom: 5,
//           layers: [lightmap, earthquakes]
//       });

//       // Create a layer control, pass in the baseMaps and overlayMaps. Add to the map
//       L.control.layers(baseMaps, overlayMaps, {
//           collapsed: false
//       }).addTo(map);
// };

// function createMarkers(earthquakeData) {
   
//     // Pull the earthquake info from the query
//     // console.log(earthquakeData.features);
//     let earthquakes = earthquakeData.features;

//     // Initialize an array to hold the earthquake markers
//     let earthquakeMarkers = [];

//     // Loop through the earthquake data
//     earthquakes.forEach(function(earthquake) {
//         // Create a marker and bind a popup with the earthquake information
//         let earthquakeMarker = L.marker([earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]])
//             .bindPopup(`<h3> ${earthquake.properties.place} </h3><hr>
//             <p> ${new Date(earthquake.properties.time)} </p>
//             <p> Magnitude: ${earthquake.properties.mag} </p>`);

//         // Add the marker to the array
//         earthquakeMarkers.push(earthquakeMarker);
//     });
    
//     createMap(L.layerGroup(earthquakeMarkers));

//     // console.log(earthquakeMarkers);
// };

// // Store earthquake data from past 7 days
// let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// // Perform an API call and get the information. Call createMarkers when complete
// d3.json(queryUrl, createMarkers);