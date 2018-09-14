"use strict"

var data_fs = [];
var map;

window.onload = function() {
    initMap();
}

//place map markers
function initMap() {
    var centerlatlng = JSON.parse(document.getElementById('centerMap').innerHTML);    
    map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(centerlatlng.lat, centerlatlng.lng),
        zoom: 9,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        draggableCursor: 'default', 
        draggingCursor: 'pointer'
    });
    showAllPlaceMarkers(data_fs, map);

    if (document.getElementById('requestedPlace').innerHTML != null) {
        var requestedPlace = JSON.parse(document.getElementById('requestedPlace').innerHTML);
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(requestedPlace.lat, requestedPlace.lng),
            map: map
        });
        map.zoom = 13;
        map.setCenter(marker.getPosition());
        showInfo(requestedPlace, map, marker);
    }    
}

function showInfo(requestedPlace, map, marker) {
    var contentString = "<div><h3>"+ 
    requestedPlace.name.replace('&amp;', '&') +"</h3>";

    for (var i=0; i < requestedPlace.add.length; i++) {
        contentString += 
            "<p>"+ requestedPlace.add[i] +"<p></div>";
    }

    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });
     
    infowindow.open(map,marker);
}


function showAllPlaceMarkers(foursquareData, map) {    
    Array.prototype.forEach.call(foursquareData, function(data) {
        var marker = new google.maps.Marker({
			position: new google.maps.LatLng(data.lat, data.lng),
            map: map,
            title: data.name.replace('&amp;', '&'),
            url: '/search/places/photos'
        });

        marker.addListener('click', function() {
            $.ajax({
                url: '/search/places/photos',
                type: 'POST',
                data: {
                    id: data.id,
                    name: data.name,
                    address: data.address,
                    placeInput: searchInput.value,
                    searchType: searchType.value,
                    lat: data.lat,
                    lng: data.lng
                }
            });
            window.location.href = this.url;
        });
    });

}


$(function(){

    if (document.getElementById('hiddenPlaceData').innerHTML != null) {
        var placeData = JSON.parse(document.getElementById('hiddenPlaceData').innerHTML);
        for(var i = 0; i < placeData.length; i++){  
            data_fs.push({
                'id': placeData[i].venue['id'],
                'name': placeData[i].venue['name'],
                'lat': placeData[i].venue['location'].lat, 
                'lng': placeData[i].venue['location'].lng,
                'address': placeData[i].venue['location'].formattedAddress              
            });
        }     
    }

    var selectedLimit = document.getElementById('selectedLimit').innerHTML;
    if (selectedLimit != null) {
        var sel = document.getElementById('placeLimit');
        for ( var i = 0; i < sel.options.length; i++ ) {
            if ( sel.options[i].text == selectedLimit ) {
                sel.options[i].selected = true;
            }    
        }
    }

    var selectedType = document.getElementById('selectedType').innerHTML;
    if (selectedType != null) {
        var sel = document.getElementById('searchType');
        for ( var i = 0; i < sel.options.length; i++ ) {
            if ( sel.options[i].text == selectedType ) {
                sel.options[i].selected = true;
            }    
        }
    }
    
    var selectedPhotoLimit = document.getElementById('ppp').innerHTML;
    if (selectedPhotoLimit != null) {
        var sel = document.getElementById('perPage');
        for ( var i = 0; i < sel.options.length; i++ ) {
            if ( sel.options[i].text == selectedPhotoLimit ) {
                sel.options[i].selected = true;
            }    
        }
    }

    var selectedPhotoOption = document.getElementById('pOpt').innerHTML;
    if (selectedPhotoOption != null) {
        var sel = document.getElementById('sortBy');
        for ( var i = 0; i < sel.options.length; i++ ) {
            if ( sel.options[i].text == selectedPhotoOption ) {
                sel.options[i].selected = true;
            }    
        }
    }
    
    if (document.getElementById('flickrData').innerHTML != "") {
        document.getElementById('sortBy').style.visibility = 'visible';
        document.getElementById('perPage').style.visibility = 'visible';

        var flickrPhoto = JSON.parse(document.getElementById('flickrData').innerHTML);
        var flickrPhotoInfo = JSON.parse(document.getElementById('flickrDataInfo').innerHTML);  
        
        
        var displayPhoto = document.getElementById('showPhoto');
        displayPhoto.style.display = "inline-block";

        var content_string ="";

        if(document.getElementById('sortBy').value == "Most Recent") {
            flickrPhotoInfo = flickrPhotoInfo.sort(function(a, b) {
                return new Date(b['photo']['dates'].taken) - new Date(a['photo']['dates'].taken);
            })
        } else if (document.getElementById('sortBy').value == "Most Views"){
            flickrPhotoInfo = flickrPhotoInfo.sort(function(a, b) {
                return b['photo'].views - a['photo'].views;
            })
        }

        // flickrPhoto.sort(function (a) {
        //     flickrPhotoInfo.forEach(function(b) { b['photo'].id = a.id; })
        // });
        
        for (var i = 0; i < flickrPhotoInfo.length; i++) {
        // for (var j = 0; j < flickrPhotoInfo.length; j++) {
            var photo = flickrPhotoInfo[i]['photo'];
            var t_url = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_m.jpg`;
            var p_url = `https://www.flickr.com/photos/${photo['owner'].nsid}/${photo.id}`;

            // if (flickrPhotoInfo[i]['photo'].id === photo.id) {
                content_string += 
                `<div class="ui card">
                    <div class="content">
                        <i class="user icon"></i> ${photo["owner"].username}
                    </div>
                    <a class="image" href="${p_url}"><img alt="${photo.title}" src="${t_url}"/></a>
                    <div class="content">
                        <p class="header">${photo.title._content}</p>
                        <span class="right floated">
                            <i class="eye icon"></i>
                            ${photo.views}
                        </span>
                        <p id="date">${photo["dates"].taken}</p>
                    </div>
                </div>`;
            // }
            
        // }            
        }

        displayPhoto.innerHTML = content_string;


    } else if (document.getElementById('foursquarePhotoData').innerHTML != "") {

        var foursquarePhoto = JSON.parse(document.getElementById('foursquarePhotoData').innerHTML);
        var displayPhoto = document.getElementById('showPhoto');
        displayPhoto.style.display = "inline-block";

        var venue = foursquarePhoto['venue']['name'];
        var foursquareURL = foursquarePhoto['venue']['canonicalUrl'];
        var photo = foursquarePhoto['venue']['photos']['groups'];

        for (var i = 0; i < photo.length; i++) {
            for (var j = 0; j < photo.length; j++) {
                if (photo[i].type == "venue") {
                    var prefix = photo[i]['items'][j].prefix;
                    var suffix = photo[i]['items'][j].suffix;
                    var size = "300x500" ;
                    var photo_url = prefix + size + suffix;

                     var content_string = 
                    `<div class="ui card"><a class="image" href="${foursquareURL}"><img alt="${venue}" src="${photo_url}"/></a>` +
                    `<div class="content"><p class="header">${venue}</p></div></div>`

                    displayPhoto.innerHTML = content_string;
                }
            }            
        }
    }
});


