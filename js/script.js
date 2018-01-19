const NM_HTML = {
  goButton             : '.js-nm-go-button',
  banner               : '.js-nm-main-header',
  contentAreaContainer : '.js-nm-content-area-container',
};

let nmUserLocation = {
  longitude : undefined,
  latitude  : undefined,
  city      : undefined
};

// ================================================================
// Initialize
// ================================================================
$(onReady);

function onReady() {
  $(NM_HTML.goButton).on('click', getUserLocation);
}

// ================================================================
// DOM Manipulation
// ================================================================
function showDashboard() {
 $(NM_HTML.banner).fadeOut();
}

function showWeatherInfo() {
 $(NM_HTML.contentAreaContainer).append(`
    <div class="container title-header">
      <h2>Weather Forecast</h2>
    </div>
  `);
  $(NM_HTML.contentAreaContainer).append(renderWeatherDataHTML());
}

 // ================================================================
 // Geo Location
 // ================================================================
function getUserLocation() {
  let geolocationOps = {
    enableHighAccuracy : true,
    maximumAge         : 30000,
    timeout            : 27000
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition( getUserLocality, handleLocationError, geolocationOps);
  } else {
    reject('Geolocation unavailable');
  }
}

function getUserLocality(position) {
  nmUserLocation.longitude = position.coords.longitude;
  nmUserLocation.latitude = position.coords.latitude;

  let params = {
    latlng : nmUserLocation.latitude + ',' + nmUserLocation.longitude,
    key    : GOOGLE_API.GEOCODING.key
  };

  $.getJSON(GOOGLE_API.GEOCODING.url, params)
    .then(function(res) {
      if (res.results) {
        let cities = res.results.map(
          function(item) {
            console.log('item', item);
            if (item.formatted_address && 'locality' === item.types[0]) {
              return item.formatted_address;
            }
          }
        ).filter(
          function(item) {
            if (item) return item;
          }
        );

        nmUserLocation.city = cities[0];
        console.log(`User location updated: ${nmUserLocation.city}`);
        showDashboard();
      } else {
        console.log('User location could not be determined.');
      }
    })
    .catch(function(err) {
      console.log(err);
    })
}

function handleLocationError() {
  console.log('Error retrieving geolocation');
};
