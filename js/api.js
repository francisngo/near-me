const GOOGLE_API = {
  GEOCODING: {
    url : 'https://maps.googleapis.com/maps/api/geocode/json',
    key : 'AIzaSyAG82AWa5_lJcwQyDvRaCDV4RSoPs4TAB0'
  }
};

const ACCUWEATHER_API = {
  citySearchUrl : 'https://dataservice.accuweather.com/locations/v1/geoposition/search',
  foreCastUrl   : 'https://dataservice.accuweather.com/forecasts/v1/daily/5day/',
  key           : '1oRIW7Ipv8Vn6QW1dxmRGgqYqGvF8Olm'
};

exports = {
  GOOGLE_API      : GOOGLE_API,
  ACCUWEATHER_API : ACCUWEATHER_API
}
