// PebbleKit JS (pkjs)

var myAPIKey = '5ae4d297761d24a5e8f6be0af8fff507';
var ICONS = {
  '01d': 'a',
  '02d': 'b',
  '03d': 'c',
  '04d': 'd',
  '09d': 'e',
  '10d': 'f',
  '11d': 'g',
  '13d': 'h',
  '50d': 'i',
  '01n': 'a',
  '02n': 'b',
  '03n': 'c',
  '04n': 'd',
  '09n': 'e',
  '10n': 'f',
  '11n': 'g',
  '13n': 'h',
  '50n': 'i',
};

function parseIcon(icon) {
  return ICONS[icon];
}

function getLocalStorageItem(key) {
  var item = localStorage.getItem(key);
  if (item != 'null' && item != null && item != 'undefined' && item != 'None' &&
      item != '') {
    return item;
  }
  return false;
}

Pebble.on('message', function(event) {
  // Get the message that was passed
  var message = event.data;

  if (message.fetch) {
    navigator.geolocation.getCurrentPosition(
        function(pos) {
          // Construct URL
          var units = getLocalStorageItem('UNITS') ? '&units=imperial' :
                                                     '&units=metric';
          var loc = getLocalStorageItem('LOCATION') ?
              'q=' + getLocalStorageItem('LOCATION') :
              'lat=' + pos.coords.latitude + '&lon=' + pos.coords.longitude;
          var url = 'http://api.openweathermap.org/data/2.5/weather?' + loc +
              '&cnt=1&appid=' + myAPIKey + units;
          console.log('url: ' + url);

          request(url, 'GET', function(respText) {
            var weatherData = JSON.parse(respText);

            var icon = parseIcon(weatherData.weather[0].icon);
            console.log('Icon ' + icon);
            console.log('Condition ' + weatherData.weather[0].main);

            Pebble.postMessage({
              'weather': {
                'icon': icon,
                // Convert from Kelvin
                'celcius': Math.round(weatherData.main.temp - 273.15),
                'fahrenheit':
                    Math.round((weatherData.main.temp - 273.15) * 9 / 5 + 32),
                'desc': weatherData.weather[0].main
              }
            });
          });
        },
        function(err) { console.error('Error getting location'); },
        {timeout: 15000, maximumAge: 60000});
  }
});

function request(url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() { callback(this.responseText); };
  xhr.open(type, url);
  xhr.send();
}