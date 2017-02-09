  /**
 * Created by ck111 on 2/8/2017.
 */

/** Global Variables
* weather: current weather at your location, default is sunny if no weather data is found
*/

var user_location;
var weather_data;

$(document).ready(initialize);

/** function: initialize
* function to add click handers, called on document ready
*/
function initialize() {
  $('#zip_code_submit').click(store_zip);
  get_geo_location();
  $(document).on('keypress', function(e){
    if (e.which === 13 || e.keyCode === 13){
      store_zip();
    }
  });
}

/** function: connect_spotify
* make ajax call to spotify. It takes and returns nothing. When this is called, 
* Uses the global param: weather to search for "cloudy music" or "sunny music". 
* Then plays a random search result.
* @function
*/
function connect_spotify() {
    var settings = {
      "url": "https://api.spotify.com/v1/search?q=" + weather + "+music&type=playlist",
      "method": "GET",
    };

    $.ajax(settings).done(function (response) {
      var randomIndex = parseInt(Math.random() * response.playlists.items.length);
      var uri = response.playlists.items[randomIndex].uri;
      $('#spotify_player')[0].src = 'https://embed.spotify.com/?uri=' + uri;
    });
}

/** function: connect_open_weather
* ajax call to open weather's api
* stores weather in a global variable, weather
* @param: location - the location of the user, either a user entered zipcode, or an object holding latitude and longitude
*/
function connect_open_weather() {
  var weahter_data;
  if(typeof user_location == 'object') {
    $.ajax({
      dataType: 'json',
      data: {'appid': 'be0e3cebb6fe11227cc9ee172503e502', 'lat': user_location.latitude, 'lon': user_location.longitude},
      url: 'http://api.openweathermap.org/data/2.5/weather',
      method: 'get',
      success: function(response) {
        weather = response.weather[0].main;
        connect_flickr();
        console.log(response);
        weather_data = response;
        add_weather_data_to_dom(weather_data);
      }
    });
  } else if(typeof user_location == 'string' && user_location.length === 5) {
    $.ajax({
      dataType: 'json',
      data: {'appid': 'be0e3cebb6fe11227cc9ee172503e502', 'zip': user_location+',us'},
      url: 'http://api.openweathermap.org/data/2.5/weather',
      method: 'get',
      success: function(response) {
        weather=response.weather[0].main;
        connect_flickr();
        console.log(response);
        weather_data = response;
        add_weather_data_to_dom(weather_data);
      }
    });
  }
}

/**
* function that takes the data from connect_open_weather and appends that data to the DOM.
**/
function add_weather_data_to_dom(data){
  console.log(data.weather[0].icon);
  $('.weather_img').attr('src', "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
  $('.weather_description').text(data.weather[0].main);
  $('.wind').text("Wind Speed" + (data.wind.speed * 2.23).toFixed(1) + ' MPH');
  $('.humidity').text(data.main.humidity + "% Humidity");
  temp_in_farenheit = (((data.main.temp * 9/5) - 459.67)).toFixed(1);
  $('.temperature h2').text(temp_in_farenheit + String.fromCharCode(176) + 'F');
}

/** function: connect_flickr
* connect to flickr with an ajax call, recieve images relating to the music playing
* @param: weather - used to pull weather specific images im so background of the page relates to the music that is playing
*/
function connect_flickr() {
  console.log(weather);
  $.ajax({
    dataType: 'json',
    url: 'https://api.flickr.com/services/rest',
    data: {'method': 'flickr.photos.search', 'format': 'json', 'api_key': '861fb3b1066db30a72c4220085edcade', 'nojsoncallback': '1', 'text': weather+' weather, nature, outside, landscape', 'extras': 'url_s', 'content-type': '1', 'privacy_filter': '1', 'safe_search': '2', 'per_page': '10'},
    method: 'get',
    success: function(response) {
      console.log(response);
    },
    error: function(response){
      console.log(response);
    }
  });
}

/** function: get_geo_location
* uses html5 to get the geolocation of the user and stores latitude and longitude in an object
*/
function get_geo_location() {
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(position) {
    store_geo_location(position.coords.latitude, position.coords.longitude);
  });
  } else {
    console.log("not supported on this browser");
  }
}

/** function: store_geo_location
* stores the latitude and longitude in user_location
* calls connect_open_weather which will get the weather at the latitude and longitude of the location
*/

function store_geo_location(lat, long) {
  user_location = {'latitude': lat, 'longitude': long};
  connect_open_weather();
}

/** function: store_zip
*
*/
function store_zip() {
  console.log('clicked');
  user_location = $('#zip_code_input').val();
  console.log(user_location);
  connect_open_weather();
}
