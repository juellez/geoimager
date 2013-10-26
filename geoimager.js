// testing url - "https://www.filepicker.io/api/file/g2fRJbUSTi7pV6hbYofg"
var gm = Meteor.require('gm'),
  fileRequest = Meteor.require("request");
var Future = Npm.require('fibers/future'), wait = Future.wait;

Meteor.publish("attachments", function () {
  return Attachments.find(); // everything
});

var constructor = function() {
    myGeoData = false; 
};

if (typeof Meteor === 'undefined') {
   // Export it node style
   Geoimager = exports = module.exports = constructor; // Limit scope to this nodejs file
} else {
   // Export it meteor style
   Geoimager = constructor; // Make it a global
}

/*
 * @todo - move this and give credit
 * http://uihacker.blogspot.com/2011/07/javascript-formatting-latitudelongitude.html

// A static class for converting between Decimal and DMS formats for a location
// ported from: http://andrew.hedges.name/experiments/convert_lat_long/
// Decimal Degrees = Degrees + minutes/60 + seconds/3600
// more info on formats here: http://www.maptools.com/UsingLatLon/Formats.html
// use: LocationFormatter.DMSToDecimal( 45, 35, 38, 'S' );
// or:  LocationFormatter.decimalToDMS( -45.59389 );
*/

var LocationFormatter = function(){};

LocationFormatter.prototype.roundToDecimal = function( inputNum, numPoints ) {
 var multiplier = Math.pow( 10, numPoints );
 return Math.round( inputNum * multiplier ) / multiplier;
};

LocationFormatter.prototype.decimalToDMS = function( location, hemisphere ){
 if( location < 0 ) location *= -1; // strip dash '-'
 
 var degrees = Math.floor( location );          // strip decimal remainer for degrees
 var minutesFromRemainder = ( location - degrees ) * 60;       // multiply the remainer by 60
 var minutes = Math.floor( minutesFromRemainder );       // get minutes from integer
 var secondsFromRemainder = ( minutesFromRemainder - minutes ) * 60;   // multiply the remainer by 60
 var seconds = this.roundToDecimal( secondsFromRemainder, 2 ); // get minutes by rounding to integer

 return degrees + '° ' + minutes + "' " + seconds + '" ' + hemisphere;
};

LocationFormatter.prototype.decimalLatToDMS = function( location ){
 var hemisphere = ( location < 0 ) ? 'S' : 'N'; // south if negative
 return this.decimalToDMS( location, hemisphere );
};

LocationFormatter.prototype.decimalLongToDMS = function( location ){
 var hemisphere = ( location < 0 ) ? 'W' : 'E';  // west if negative
 return this.decimalToDMS( location, hemisphere );
};

LocationFormatter.prototype.DMSToDecimal = function( degrees, minutes, seconds, hemisphere ){
 var ddVal = degrees + minutes / 60 + seconds / 3600;
 ddVal = ( hemisphere == 'S' || hemisphere == 'W' ) ? ddVal * -1 : ddVal;
 return this.roundToDecimal( ddVal, 5 );  
};
// exports.formatter = LocationFormatter;


Meteor.methods({

  processGeoExif: function(options){
    check(options, {
      fileUrl: String,
    });

    options.owner = this.userId;
    console.log('processGeoExif called by user: '+options.owner+' - file: '+options.fileUrl);

    // Using futures to ensure we're not doing an update until the data 
    // calculating is complete.
    function getGeo(fileUrl) {
        console.log('testGetGeo start');

        var formatter = new LocationFormatter();
        var future = new Future;

        // fetch myImg object from fileUrl for image magic
        var myImg = fileRequest( fileUrl );
        gm(myImg).identify(function(err, value){
          console.log('getGeoExif innerloop 1');
          // note : value may be undefined
          // console.log(err); 
          // console.log(value);
          var myGeoData = false;
          if( typeof( value ) != undefined && value.hasOwnProperty('Profile-EXIF') ){
            console.log('getGeoExif innerloop 2');
            var geoData = value['Profile-EXIF'];
            if( geoData.hasOwnProperty('GPS Info') ){
              console.log('getGeoExif innerloop 3');
              myGeoData = new Object();

              myGeoData.Make = geoData.Make;
              myGeoData.Model = geoData.Model;
              myGeoData.GPSLat = geoData['GPS Latitude'];
              myGeoData.GPSLong = geoData['GPS Longitude'];
              myGeoData.GPSLatRef = geoData['GPS Latitude Ref'];
              myGeoData.GPSLongRef = geoData['GPS Longitude Ref'];
              // 'GPS Altitude Ref': '.', 'GPS Altitude': '31320/497', 'GPS Time Stamp': '7/1,35/1,3301/100',
              // 'GPS Img Direction Ref': 'M', 'GPS Img Direction': '36058/279' }

              dms = geoData["GPS Longitude"].split(',');
              var myLong = formatter.DMSToDecimal( eval(dms[0]), eval(dms[1]), eval(dms[2]), geoData["GPS Longitude Ref"]);
              myGeoData.decimalLong = myLong;
              geoData.decimalLong = myLong;

              dms = geoData["GPS Latitude"].split(',');
              var myLat = formatter.DMSToDecimal( eval(dms[0]), eval(dms[1]), eval(dms[2]), geoData["GPS Latitude Ref"]);
              myGeoData.decimalLat = myLat;
              geoData.decimalLat = myLat;

              myGeoData.point = { type: "Point", coordinates: [myLong, myLat] };
              myGeoData.attachmentUrl = fileUrl;
            }
          }
          console.log(myGeoData);
          console.log('future.return(myGeoData)');
          future.return(myGeoData);
        });
        console.log('testGetGeo end: return future');
        return future;
    }

    // You can create functions which automatically run in their own fiber and
    // return futures that resolve when the fiber returns (this probably sounds
    // confusing.. just play with it to understand).
    var savePost = function(options) {
      // @todo - see if file already exists & update the record vs creating a new one
      console.log('testInsert start');
      var myGeoDataResults = getGeo(options.fileUrl).wait();
      myGeoDataResults.owner = options.owner;
      var myId = Attachments.insert( myGeoDataResults );
      console.log('testInsert end');
      return myId;
    }.future(); // <-- important!

    // And futures also include node-friendly callbacks if you don't want to use
    // wait()
    savePost(options).resolve(
      function(err, val) {
        console.log(options);
        console.log('inside resolve: '+ val);
        console.log('err: '+ err);
      });

  }
});

/*
todo - find a way to chain these. that is, pulish the information to something that can then listen and write to the db.
tried sessions, but they're not getting set properly.
other chaining not working
*/

// Proceed defining methods / properties as usual.
// Geoimager.prototype.getGeoExif = function( fileUrl ) { 

