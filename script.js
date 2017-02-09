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
  $("#zip_code_input").on('keypress', function(e){
    console.log(e.which);
    if (e.which === 13 || e.keyCode === 13){
      e.preventDefault();
      store_zip();
    }
    if (e.which < 48 || e.which > 57){
      return false;
    }
  });
  //get_song_id();
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

/**
 * Grabs the song name and song artist as the page loads.
 * @function
 *
 */
function get_song_information() {
  var track_name = document.getElementById("track-name");
  var track_artist = document.getElementById("track-arist");
  console.log(track_name);
  console.log(track_artist);
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
        connect_spotify();
        display_background_according_to_weather(weather);
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
        display_background_according_to_weather(weather);
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
  $('.weather_img').attr('src', "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
  $('.weather_description').text(data.weather[0].description);
  $('.wind').text("Wind Speed " + (data.wind.speed * 2.23).toFixed(1) + ' MPH');
  $('.humidity').text(data.main.humidity + "% Humidity");
  temp_in_farenheit = (((data.main.temp * 9/5) - 459.67)).toFixed(1);
  $('.temperature h2').text(temp_in_farenheit + String.fromCharCode(176) + 'F');
}

function get_song_id() {
  $.ajax({
    dataType: 'jsonp',
    data: {'apikey': '9852c0888f48a68d74dfe23ef83f360b', 'q_track': track_name, 'q_artist': artist_name, 'format': 'jsonp'},
    url: 'http://api.musixmatch.com/ws/1.1/matcher.lyrics.get',
    method: 'get',
    success: function(response) {
      console.log(response.message.body.lyrics.lyrics_body);
    },
    error: function(response) {
      console.log(response);
    }
  });
}

function get_lyrics_with_song_id() {
  $.ajax({

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

function display_background_according_to_weather(weather){
  switch (weather){
      case "Clear":
        $(".parallax").css("background-image", "url(assets/weather_clear.jpg)");
        break;
      case "Clouds":
        $(".parallax").css("background-image", "url(assets/weather_clouds.jpg)");
        break;
      case "Extreme":
        $(".parallax").css("background-image", "url(assets/weather_extreme.jpg)");
        break;
      case "Atmosphere":
        $(".parallax").css("background-image", "url(assets/weather_atmosphere.jpg)");
        break;
      case "Snow":
        $(".parallax").css("background-image", "url(assets/weather_snow.jpg)");
        break;
      case "Rain":
        $(".parallax").css("background-image", "url(assets/weather_rain.jpg)");
        break;
      case "Drizzle":
        $(".parallax").css("background-image", "url(assets/weather_drizzle.jpg)");
        break;
      case "Thunderstorm":
        $(".parallax").css("background-image", "url(assets/weather_thunderstorm.jpg)");
        break;
      case "Additional":
        $(".parallax").css("background-image", "url(assets/weather_additional.jpg)");
        break;
      default:
        $(".parallax").css("background-image", "url(assets/weather_default.jpg)");
  }
}
