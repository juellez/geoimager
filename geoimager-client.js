var mbDivLoaded = mbScriptsLoaded = false;

// Subscribe to markers for changing the map view 
Meteor.subscribe("attachments");
Meteor.subscribe("markers");

// Pull all / close attachments to start
Meteor.startup( function () {
  Deps.autorun( function () { 
      var countposts = Attachments.find().count();       
      console.log('attachments: '+countposts);
  });
});

// Initialize Mapbox After Mapbox is Loaded - both in script and in the DOM
var geoimagerLoadCallback = function(){
  // stuff
  console.log('geoimager script/link loaded');
  mbScriptsLoaded = true;
  if( mbScriptsLoaded && mbDivLoaded ){
    initializeMap();    
  }
  // Meteor.render( function() {
  //   return Template.mapbox();
  // });
};

// Error Check
var geoimagerErrorCallback = function(error){
  console.log('geoimager scripts load failed');
  if(typeof console != undefined) {
      console.log(error);
  }
};

// Loading Mapbox
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'http://api.tiles.mapbox.com/mapbox.js/v1.3.1/mapbox.js';
// var link = document.createElement('link');
// link.rel = 'stylesheet';
// link.src = 'http://api.tiles.mapbox.com/mapbox.js/v1.3.1/mapbox.css';
script.onload = geoimagerLoadCallback;
script.onerror = geoimagerErrorCallback;
document.getElementsByTagName('head')[0].appendChild(script);


///////////////////////////////////////////////////////////////////////////////
// Mapbox map display - requires use of >>mapbox template including a <div id="map"> in the html

Template.mapbox.rendered = function () {
  // Config it
  console.log('rendering mapbox');
  mbDivLoaded = true;
  if( mbScriptsLoaded && mbDivLoaded ){
    initializeMap();    
  }
}

function initializeMap(){
  // @todo - initialize on viewer person's location

  var geocoder = L.mapbox.geocoder('examples.map-vyofok3q'),
      map = L.mapbox.map('map', 'examples.map-vyofok3q').setView([45.50199, -122.60882], 13);

  // @todo - have these load in their own file
  // var markerLayer = L.mapbox.markerLayer()
  //   .loadURL('/mapbox.js/assets/example-single.geojson')
  //   .addTo(map);

  // TEST ONE
  // L.mapbox.markerLayer({
  //   type: 'Feature',
  //   geometry: {
  //       type: 'Point',
  //       coordinates: [-122.60882, 45.50199]
  //   },
  //   properties: {
  //       title: 'A Single Marker',
  //       description: 'Just one of me',
  //       // one can customize markers by adding simplestyle properties
  //       // http://mapbox.com/developers/simplestyle/
  //       'marker-size': 'large',
  //       'marker-color': '#f0a'
  //   }
  // }).addTo(map);

  // LOAD 'EM FOR REAL'
  if( Meteor.userId() ){
    console.log('attempting to load points');
    Attachments.find({owner:Meteor.userId()}).forEach( function(post){
      console.log(post);
      L.mapbox.markerLayer({
        type: 'Feature',
        geometry: post.point,
        properties: {
            title: '',
            description: 'taken by '+post.owner+' with '+post.Make+' '+post.Model,
            'marker-size': 'small',
            'marker-color': '#f0a'
        }
      }).addTo(map);

    });
  }

}

///////////////////////////////////////////////////////////////////////////////
// Filepicker display - requires use of >>filepicker template 

Template.filepicker.rendered = function () {
  // Config it
  console.log('filepicker rendered');
}

var constructor = function() {
    this.files = ''; 
}
filepickerResults = constructor;
filepickerResults.process = function(fpfiles){
  var out='';
  for(var i=0;i<fpfiles.length;i++){
    out+=fpfiles[i].url;
    out+=' ';
    console.log('calling start post');
    Meteor.call('processGeoExif', {fileUrl:fpfiles[i].url} );
    //Meteor.call('getGeoData', {fileUrl:fpfiles[i].url} );
  }
  console.log(out);
}


        // var n = 2 ^ 10;
        // var xtile = ((myLong + 180) / 360) * n;
        // var ytile = (1 - (Math.log(Math.tan(myLat) + (1/Math.cos(myLat))) )) / 2 * n;
        // console.log("xtile: "+xtile+" + ytile: "+ytile);

