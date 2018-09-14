// npm packages
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request'); 
const path = require ('path');
const pug = require('pug');
const moment = require('moment');
const async = require("async");

const GOOGLE_API_KEY = "AIzaSyAOJES7dS4BKe9gh_KNEanb3n5GfkkO8Sg";
var GEOCODE_BASE_URL = "https://maps.googleapis.com/maps/api/geocode/json?address=";
var FOURSQUARE_BASE_URL = "https://api.foursquare.com/v2/venues/";
var FLICKR_BASE_URL = "https://api.flickr.com/services/rest/?";

app.use(bodyParser());
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

let searchResult = [];
let searchPlacesResult = [];


let foursquare = {
  client_id: 'H0TRQUAJC44AQR23WO24D3JY5VFN3AAF3WTH351N3LGY5VCD',
  client_secret: '45YD0XGX3XHY4AB2ZVM3TT3SYAE5F41ZPC3WRYKUMXG41YSQ',
  v: moment().format("YYYYMMDD")
};

let flickr = {
  method: ['flickr.photos.search', 'flickr.photos.getInfo'],
  api_key: "b877e510c45d81358e70ea76e6a15894", 
  format: "json", 
  nojsoncallback: 1
};

app.get('/',function(req,res){
  res.render('layout', {title: "traverise"});
});

app.get('/search/places', function(req, res) {
  res.redirect('/');
});

app.post('/search/places', function(req, res) {
  
  console.log("get place name");

  let foursquare_data = [];

  var placeName = req.body.searchInput;
  var searchType = req.body.searchType;
  var placeLimit = req.body.placeLimit || 25;  

  var geocode_url = GEOCODE_BASE_URL + placeName + "&key=" + GOOGLE_API_KEY;

  request(geocode_url, function(error, response, body) {
    // ------------------- get placename and convert it to lat lng
    if(!error && response.statusCode == 200) {
      var geocode = JSON.parse(body);
      var lat = geocode['results'][0].geometry.location.lat;
      var lng = geocode['results'][0].geometry.location.lng;

      placeName = geocode['results'][0].formatted_address; 

      // ------------------- get foursquare data    
      var foursquare_url = FOURSQUARE_BASE_URL + "explore?ll="+ lat + "," + lng + "&q="+ searchType +"&client_id=" 
                            + foursquare.client_id + "&client_secret=" + foursquare.client_secret + "&limit=" + placeLimit +"&v=" + foursquare.v;
      
      if (searchType == "attraction") {
        foursquare_url += "&near=" + placeName;
      }

      request(foursquare_url, function(foursquareErr, foursquareRes, foursquareBody) {
        if(!foursquareErr && foursquareRes.statusCode == 200) {
          
          console.log("get place data");
          
          let body = [];
          body.push(foursquareBody);
          
          let bodyString = body.join('');
          var json = JSON.parse(bodyString);
          foursquare_data = json["response"]["groups"][0]['items'];

          searchResult={
            title: 'traverise: ' + placeName + " " + searchType,
            centre_latlng: {"lat": lat, "lng": lng}, 
            selected_limit: placeLimit, 
            type: searchType, 
            search: placeName, 
            data: foursquare_data
          };

          res.render('content', {
            title: 'traverise: ' + placeName + " " + searchType,
            centre_latlng: {lat: lat, lng: lng}, 
            selected_limit: placeLimit, 
            type: searchType, 
            search: placeName, 
            data: foursquare_data
          });
        } else {
          res.send("FOURSQUARE PLACES DATA ERROR: "+foursquareErr);
        }
      });    
    // else geocode not found
    } else {
      res.send("GEOCODE ERROR: "+error);
    }
  });  
});

app.post('/search/places/photos', function(req, res) {

  searchPlacesResult={
    id: req.body.id,
    name: req.body.name,
    add: req.body.address,
    input: req.body.placeInput,
    type: req.body.searchType,
    lat: req.body.lat,
    lng: req.body.lng
  };

});

// get photos from flickr based on requested place 
app.get('/search/places/photos', function(req, res) {

  let photoData = [];
  let foursquarePhoto = [];

  var requestedPlaceID = searchPlacesResult.id; // for foursquare
  var requestedPlace = searchPlacesResult.name; // for flickr 

  var requestedPhotoOption = req.query.photoSortBy || "Most Recent";
  var requestedPhotoPerPage = req.query.photoPerPage || 25;
  
  var flickr_url = FLICKR_BASE_URL + `method=${flickr.method[0]}` + `&api_key=${flickr.api_key}` + `&text=` + requestedPlace 
                    + `&per_page=${requestedPhotoPerPage}` +`&format=${flickr.format}` + `&nojsoncallback=${flickr.nojsoncallback}`;


  request(flickr_url, function(error, response, flickrBody) {
    if(!error && response.statusCode == 200) {

      console.log("get photos from flickr");

      let body = [];
      body.push(flickrBody);
      
      let bodyString = body.join('');
      var json = JSON.parse(bodyString);
      photoData = json["photos"]["photo"];

      async.times(photoData.length, function(i, callback) {
        var photoInfoUrl = FLICKR_BASE_URL + `method=${flickr.method[1]}` + `&api_key=${flickr.api_key}` + `&photo_id=${photoData[i].id}` 
        + `&per_page=${requestedPhotoPerPage}` + `&format=${flickr.format}` + `&nojsoncallback=${flickr.nojsoncallback}`;

        request(photoInfoUrl, function(error, response, html) {
          if (!error && response.statusCode == 200) {
            let body = [];
            body.push(html);
            let bodyString = body.join('');
            var json = JSON.parse(bodyString);
            var result = json;

            callback(null, result);
          }          
        })
      }, 
      function(err, results) {
        var foursquare_url = FOURSQUARE_BASE_URL + `${requestedPlaceID}?` + "client_id=" 
                            + foursquare.client_id + "&client_secret=" + foursquare.client_secret + "&v=" + foursquare.v;

        // if there is no flickr photo available, then show foursquare photo
        if (photoData.length == 0) {
          request(foursquare_url, function(fsErr, fsRes, fsBody) {
            if (!fsErr && fsRes.statusCode == 200) {

              console.log("get photo from foursquare");

              let body = [];
              body.push(fsBody);
              
              let bodyString = body.join('');
              var json = JSON.parse(bodyString);
              foursquarePhoto = json["response"];

              res.render('photo', {
                title: 'traverise: ' + searchPlacesResult.name,
                centre_latlng: {lat: searchPlacesResult.lat, lng: searchPlacesResult.lng},
                requestedPlace: JSON.stringify(searchPlacesResult), 
                selected_limit: searchResult.selected_limit, 
                type: searchResult.type, 
                search: searchResult.search, 
                data: searchResult.data,
                fsPhoto: foursquarePhoto 
              });
            } else {
              res.send("foursquare photo: " + fsErr);
            }
          })
        } else {
          res.render('photo', {
            title: 'traverise: ' + searchPlacesResult.name,
            centre_latlng: {lat: searchPlacesResult.lat, lng: searchPlacesResult.lng},
            requestedPlace: JSON.stringify(searchPlacesResult), 
            selected_limit: searchResult.selected_limit, 
            type: searchResult.type, 
            search: searchResult.search, 
            data: searchResult.data,
            flickr_data: photoData,
            flickr_data_info: results,
            photoperpage: requestedPhotoPerPage,
            photoOption: requestedPhotoOption
          });
        }
      });      
    } else {
      res.send("FLICKR ERROR: "+ error);
    }
  });  
})

app.listen(3000, () => {
    console.log("App listening at http://localhost:3000");
});