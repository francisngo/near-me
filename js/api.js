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

const FOURSQUARE_API = {
  url           : 'https://api.foursquare.com/v2/venues/search',
  client_id     : '2JYGYIWS3VKO4ADZ35USVKIYKVLWNXLQELPPPVNLFSSO2PIS',
  client_secret : 'N0WSY1LWQL4MHY05C202VXXNCH54RPGELZCCTPMJAIMUNMTY'
}

exports = {
  GOOGLE_API      : GOOGLE_API,
  ACCUWEATHER_API : ACCUWEATHER_API,
  FOURSQUARE_API  : FOURSQUARE_API
}
