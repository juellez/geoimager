// testing url - "https://www.filepicker.io/api/file/g2fRJbUSTi7pV6hbYofg"
var gm = Meteor.require('gm'),
  fileRequest = Meteor.require("request");

//Functions to run after the script tag has loaded
var geoimagerLoadCallback = function(){
  // stuff
  console.log('geoimagerLoadCallback');
};

//If the script doesn't load
var geoimagerErrorCallback = function(error){
  console.log('geoimagerErrorCallback');
  if(typeof console != undefined) {
      console.log(error);
  }
};

//Generate a script tag
var script = document.createElement('script');
script.type = 'text/javascript';
script.async = true;
script.defer = true;
script.text = '
  alert("callback client side");
';
script.onload = geoimagerLoadCallback;
script.onerror = geoimagerErrorCallback;

//Load the script tag
document.head.appendChild(script);
// var head = document.getElementsByTagName('head')[0];
// head.appendChild(script);
// document.body.appendChild(script);

function getGeoExif( fileUrl ){
  var myImg = fileRequest( fileUrl );
  gm(myImg).identify( 
    // note : value may be undefined
    // console.log(err); 
    // console.log(value);
    console.log(value);
    geoData = value['Profile-EXIF'];
    console.log("Latitude: "+geoData["GPS Latitude"]);
    console.log("Longitude: "+geoData["GPS Longitude"]);
    if( typeof( geoData["GPS Info"] ) != undefined ){
      // we have some geo data to work with.
      console.log("GEO Data Received:");
      // body += geoData["GPS Latitude"]+geoData["GPS Latitude Ref"]+"<br />"+geoData["GPS Longitude"]+geoData["GPS Longitude Ref"]+"<br />";

      dms = geoData["GPS Longitude"].split(',');
      var myLong = LocationFormatter.DMSToDecimal( eval(dms[0]), eval(dms[1]), eval(dms[2]), geoData["GPS Longitude Ref"]);
      // body += "Decimal Longitude: "+myLong;
      console.log("Decimal Long: "+myLong);

      dms = geoData["GPS Latitude"].split(',');
      var myLat = LocationFormatter.DMSToDecimal( eval(dms[0]), eval(dms[1]), eval(dms[2]), geoData["GPS Latitude Ref"]);
      // body += "Decimal Latitude: "+myLat;
      console.log("Decimal Lat: "+myLat);

      var n = 2 ^ 10;
      var xtile = ((myLong + 180) / 360) * n;
      var ytile = (1 - (Math.log(Math.tan(myLat) + (1/Math.cos(myLat))) )) / 2 * n;
      console.log("xtile: "+xtile+" + ytile: "+ytile);

      // body = "<script>\n\
      // var geocoder = L.mapbox.geocoder('examples.map-vyofok3q'),\n\
      //     map = L.mapbox.map('map', 'examples.map-vyofok3q').setView(["+myLat+", "+myLong+"], 13);\n\
      // L.mapbox.markerLayer({\n\
      //     type: 'Feature',\n\
      //     geometry: {\n\
      //         type: 'Point',\n\
      //         coordinates: ["+myLong+", "+myLat+"]\n\
      //     },\n\
      //     properties: {\n\
      //         title: 'A Single Marker',\n\
      //         description: 'Just one of me',\n\
      //         // one can customize markers by adding simplestyle properties\n\
      //         // http://mapbox.com/developers/simplestyle/\n\
      //         'marker-size': 'large',\n\
      //         'marker-color': '#f0a'\n\
      //     }\n\
      // }).addTo(map);\n\
      // </script>"+body;
    }
  });
}

