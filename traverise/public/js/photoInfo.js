function placeMarkers(map) {
    Array.prototype.forEach.call(data_fs, function(data){        
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(data.lat, data.lng),
            map: map,
            title: data.name.replace('&amp;', '&'),
            url: '/search/places/photos'
        });

        marker.addListener('click', function() {
            document.getElementById('guide').style.display = 'hidden';
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

function showInfo() {
    var requestedPlace = JSON.parse(document.getElementById('requestedPlace').innerHTML);
    // var centerlatlng = JSON.parse(document.getElementById('centerMap').innerHTML);    
    map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(requestedPlace.lat, requestedPlace.lng),
        zoom: 13,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        draggableCursor: 'default', 
        draggingCursor: 'pointer'
    });

    //placeMarkers(map);

    alert('show info');

    var contentString = "<div class='ui cards'><div class='card'><div class='content'><div class='header'>"+ 
    requestedPlace.name.replace('&amp;', '&') +"</div>";

    for (var i=0; i < requestedPlace.add.length; i++) {
        contentString += 
            "<p class='description'>"+ requestedPlace.add[i] +"</p></div></div></div>";
    }

    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(requestedPlace.lat, requestedPlace.lng),
        map: map
    });

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
     });
     
     infowindow.open(map,marker);    
}

$(function(){ 

    // document.getElementById('searchBtn').onclick = function() {
    //     alert('HELLO');
    // };
    
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
    
    
    if (document.getElementById('flickrData').innerHTML != null) {
        var flickrPhoto = JSON.parse(document.getElementById('flickrData').innerHTML);
        var displayPhoto = document.getElementById('showPhoto');
        displayPhoto.style.display = "inline-block";

        var content_string ="";
        
        for (var i = 0; i < flickrPhoto.length; i++) {
            var photo = flickrPhoto[i];
            var t_url = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_z.jpg`;
            var p_url = `https://www.flickr.com/photos/${photo.owner}/${photo.id}`;

            content_string += 
            `<div class="ui card"><a class="image" href="${p_url}"><img alt="${photo.title}" src="${t_url}"/></a>` +
            `<div class="content"><p class="header">${photo.title}</p></div></div>`
        }
        displayPhoto.innerHTML = content_string;
    }

    

/*     if (document.getElementById('userProfile').innerHTML != null) {
        var flickrProfile = JSON.parse(document.getElementById('userProfile').innerHTML);
        var displayUser = document.getElementById('flickrUser');
        displayUser.style.display = "block";

        for (var i = 0; i < flickrProfile.length; i++) {
            displayUser.innerHTML += 
            '<p>'+ flickrProfile[i]['person']['username']._content +'</p>';
            console.log(flickrProfile[i])
        }
    } */

});
