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
  getWeatherData();
}

function showWeatherInfo() {
 $(NM_HTML.contentAreaContainer).append(`
    <div class="container title-header">
      <h2>Weather Forecast</h2>
    </div>
  `);
  $(NM_HTML.contentAreaContainer).append(renderWeatherDataHTML());
}

function showLocalFood() {
  $(NM_HTML.contentAreaContainer).append(`
    <div class="container title-header">
      <h2>Local Restaurants</h2>
    </div>
  `);
  $(NM_HTML.contentAreaContainer).append(renderLocalFoodHTML());

  let mapInfoWindows = [];

  let mapCenter = {
    lat : nmUserLocation.latitude,
    lng : nmUserLocation.longitude
  };

  let foodMap = new google.maps.Map(document.getElementById('nm-localfood-map'), {
    center : mapCenter,
    zoom   : 12
  });

  let foodRequest = {
    location : mapCenter,
    radius   : '5000',
    type     : ['restaurant']
  };

  let service = new google.maps.places.PlacesService(foodMap);
  service.textSearch(foodRequest, function(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (let i = 0; i < results.length; i++) {
        let place = results[i];
        let infoWindowContent = `<h6>${place.name}</h6>
                                 <p>${place.formatted_address.replace(',', '<br>')}</p>`;

        let infoWindow = new google.maps.InfoWindow({
          content: infoWindowContent
        });

        let marker = new google.maps.Marker({
          map       : foodMap,
          position  : place.geometry.location
        });

        mapInfoWindows.push(infoWindow);
        marker.addListener('click', function() {
          infoWindow.open(foodMap, marker);
          mapInfoWindows.forEach(function(item) {
            if (item != infoWindow) item.close();
          });
        });
      }
    }
  });
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
    navigator.geolocation.getCurrentPosition( getUserLocality, handleError, geolocationOps);
  } else {
    console.info('INFO - Geolocation unavailable');
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
        console.info(`INFO - User location updated: ${nmUserLocation.city}`);
        showDashboard();
      } else {
        console.info('INFO - User location could not be determined.');
      }
    })
    .catch(handleError);
}

function handleError() {
  console.error('ERROR - Unable to retrieve data');
};

// ================================================================
// Weather API
// ================================================================
function getWeatherData() {
  let params = {
    q      : `${nmUserLocation.latitude},${nmUserLocation.longitude}`,
    apikey : ACCUWEATHER_API.key
  };

  $.getJSON(ACCUWEATHER_API.citySearchUrl, params)
    .then(getWeatherLocationKey)
    .catch(handleError);
}

function getWeatherLocationKey(res) {
  if (res[0]) {
    let weatherLocationKey = res[0].Key;

    let params = {
      apikey : ACCUWEATHER_API.key
    };

    $.getJSON(ACCUWEATHER_API.foreCastUrl + weatherLocationKey, params)
        .then(function(res) {
          nmUserLocation.weather = res.DailyForecasts;
          nmUserLocation.weather.pop();
          console.log(`User location updated: Temp ${nmUserLocation.weather[0].Temperature.Maximum.Value}°F`);
          showWeatherInfo();
          showLocalFood();
        })
        .catch(function(err) {
          console.error('ERROR - getting weather forecast and/or local restaurants.');
          alert('There was an error getting weather and/or local restaurant data. Sorry!');
        });
  } else {
      console.error("ERROR - getting weather location key.");
      alert('There was an error while getting weather data. Sorry!');
  }
}

function formatDate(dtVal) {
  let weekday = new Array(7);
      weekday[0] =  "Sunday";
      weekday[1] = "Monday";
      weekday[2] = "Tuesday";
      weekday[3] = "Wednesday";
      weekday[4] = "Thursday";
      weekday[5] = "Friday";
      weekday[6] = "Saturday";
  let dt = new Date(dtVal * 1000);
  let dtString = `${weekday[dt.getDay()]}, ${dt.getMonth()+1}/${dt.getDate()}/${dt.getFullYear()}`;
  return dtString;
}

function renderWeatherDataHTML() {
  let element = $('<div class="row"></div>');
  let count = 0;
  nmUserLocation.weather.map(
    function(item) {
      item.Day.Icon = item.Day.Icon <= 9 ? '0' + item.Day.Icon : item.Day.Icon;
      element.append(
        `<div class="col-sm-12 col-md-3 col-lg-3">
          <div class="card text-center">
            <div class="card-header">
              ${formatDate(item.EpochDate)}
            </div>
            <img class="card-img" src="https://developer.accuweather.com/sites/default/files/${item.Day.Icon}-s.png"/>
            <div class="card-body">
              <h2 class="card-title">${item.Temperature.Maximum.Value}°F</h3>
              <h4 class="card-text">${item.Day.IconPhrase}</h5>
              <p><i class="fa fa-arrow-down" aria-hidden="true"></i> low: ${item.Temperature.Minimum.Value}°F <i class="fa fa-arrow-up" aria-hidden="true"></i> high: ${item.Temperature.Maximum.Value}°F</p>
            </div>
        </div>`
      )
    }
  );
  return element;
}

// ================================================================
// Foursquare API
// ================================================================
function getLocalFood() {
  let mapInfoWindows = [];

  let mapCenter = {
    lat : nmUserLocation.latitude,
    lng : nmUserLocation.longitude
  };

  let foodMap = new google.maps.Map(document.getElementById('nm-localfood-map'), {
    center : mapCenter,
    zoom   : 12
  });

  let foodRequest = {
    location : mapCenter,
    radius   : '5000',
    type     : ['restaurant']
  };

  let service = new google.maps.places.PlacesService(foodMap);
  service.textSearch(foodRequest, function(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (let i = 0; i < results.length; i++) {
        let place = results[i];
        let infoWindowContent = `<h6>${place.name}</h6>
                                 <p>${place.formatted_address.replace(',', '<br>')}</p>`;

        let infoWindow = new google.maps.InfoWindow({
          content: infoWindowContent
        });

        let marker = new google.maps.Marker({
          map       : foodMap,
          position  : place.geometry.location
        });

        mapInfoWindows.push(infoWindow);
        marker.addListener('click', function() {
          infoWindow.open(foodMap, marker);
          mapInfoWindows.forEach(function(item) {
            if (item != infoWindow) item.close();
          });
        });
      }
    }
  });
}

function renderLocalFoodHTML() {
  let element = $('<div class="row"></div>');
  element.append(
    `<div class="col-sm-12">
      <div class="card">
        <div class="card-body">
          <div id="nm-localfood-map"></div>
        </div>
        <div class="card-header">
          Restaurants in ${nmUserLocation.city}
        </div>
      </div>
    </div>`
  )
  return element;
}
