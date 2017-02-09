  /**
 * Created by ck111 on 2/8/2017.
 */

/** Global Variables
* weather: current weather at your location, default is sunny if no weather data is found
*/

var user_location;
var weather = 'Sunny';

$(document).ready(initialize);

/** function: initialize
* function to add click handers, called on document ready
*/
function initialize() {
  $('#zip_code_submit').click(store_zip);
  get_geo_location();
}

/** function: connect_spotify
* make ajax call to spotify
*
*/
function connect_spotify() {

}

/** function: connect_open_weather
* ajax call to open weather's api
* stores weather in a global variable, weather
* @param: location - the location of the user, either a user entered zipcode, or an object holding latitude and longitude
*/
function connect_open_weather() {
  if(typeof user_location == 'object') {
    $.ajax({
      dataType: 'json',
      data: {'appid': 'be0e3cebb6fe11227cc9ee172503e502', 'lat': user_location.latitude, 'lon': user_location.longitude},
      url: 'http://api.openweathermap.org/data/2.5/weather',
      method: 'get',
      success: function(response) {
        weather = response.weather[0].main;
        connect_flickr();
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
      }
    });
  }
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
    data: {'method': 'flickr.photos.search', 'format': 'json', 'api_key': '861fb3b1066db30a72c4220085edcade', 'nojsoncallback': '1', 'text': weather+'', 'extras': 'url_l', 'content-type': '1', 'privacy_filter': '1', 'safe_search': '2', 'per_page': '10'},
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
