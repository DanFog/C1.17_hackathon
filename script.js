/**
 * Created by ck111 on 2/8/2017.
 */

/** Global Variables
* weather: current weather at your location, default is sunny if no weather data is found
*/

var user_location;
var weather_data;
var track_name;
var artist_name;
var lyrics = [];

$(document).ready(initialize);

/** function: initialize
* function to add click handers, called on document ready
* adds on keypress event handler for zip code input, checks if the input is a number or enter and does the appropriate action
*/
function initialize() {
  $('#zip_code_submit').click(store_zip);
  get_geo_location();
  $("#zip_code_input").on('keypress', function(e){
    if (e.which === 13 || e.keyCode === 13){
      e.preventDefault();
      store_zip();

    }
    if (e.which < 48 || e.which > 57){
      return false;
    }
  });
  $('.dropdown-toggle').on('click', add_song_titles_to_menu);
  $('.dropdown-menu li').on('click', add_song_to_dom);
}

/**
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
      var url = 'https://embed.spotify.com/?uri=' + uri;
      $('#spotify_player')[0].src = url;

      validate_song_is_different(url);

    });
}

/**
 * It checks to see if the last song is the same as the current song. This is not used.
 *.@function
 * @param {string} url
 */
function validate_song_is_different(url) {
  var settings = {
        "async": true,
        "crossDomain": true,
        "url": 'proxy.php?url='+encodeURI(url),
        "method": "GET",
        "headers": {
          "cache-control": "no-cache",
          "postman-token": "5e9a334c-48f9-52dc-d0eb-949193be7e1f"
        }
      };

      $.ajax(settings).done(function (response) {
        var current_track_name = response.replace(/[\w\W]*<div id\=\"track\-name\" class\=\"name\"><a.+?>(.+?)<[\w\W]*/, "$1");
        var current_artist_name = response.replace(/[\w\W]*<div id\=\"track\-artists\" class\=\"creator\"><span.+?><a.+?>(.+?)<[\w\W]*/, "$1");
        get_scraped_data(response);

        track_name = current_track_name;
        artist_name = current_artist_name;
        get_song_id(track_name, artist_name);

      });
}

/**
 * Takes an array and populates it with the artist name, song name, and index. We grab this data from spotify. We scrape it.
 * @function
 * @params {html} response
 */

function get_scraped_data(response) {
  var matches = response.match(/track\-artist\">([\w\W]+?)</g).reduce(function(firstItem, secondItem) {
    firstItem.push({artist: secondItem.replace(/.*\">(.*)<.*/, "$1")});
    return firstItem;
  }, []);

  var matches_track = response.match(/track\-row\-info \"([\w\W]+?)</g);
  var matches_row = response.match(/track\-row\-number\"\>(.+?)<\//g);

  matches_row = matches_row.reduce(function(firstItem, secondItem) {
    firstItem.push(secondItem.replace(/[\w\W]*>(\d+)<\//, "$1"));
    return firstItem;
  }, []);

  for (let i = 0; i < matches.length; i++) {
    matches[i].song = matches_track[i].replace(/track\-row\-info \">\W+(.+?)\W+</, "$1");
    matches[i].index = matches_row[i];
  }
  lyrics = [];
  get_all_lyrics(matches);
}
/**
 * Grabs the song name and song artist as the page loads.
 * @function
 *
 */
// function get_song_information() {
//   var track_name = document.getElementById("track-name");
//   var track_artist = document.getElementById("track-arist");
//   console.log(track_name);
//   console.log(track_artist);
// }

/** function: connect_open_weather
* ajax call to open weather's api
* stores weather in a global variable, weather
* Uses and if statement to tell if the location if an object with latitude and longitude or a string of the zipcode
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
        weather_data = response;
        add_weather_data_to_dom(weather_data);
      }
    });
  }
}

/** function: add_weather_data_to_dom
* uses the data available from the data object and uses jquery to display it on the document
* @param data: the object returned from the open_weather api
**/
function add_weather_data_to_dom(data){
  $('.weather_img').attr('src', "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
  $('.weather_description').text(data.weather[0].description);
  $('.wind').text("Wind Speed: " + (data.wind.speed * 2.23).toFixed(1) + ' MPH');
  $('.humidity').text(data.main.humidity + "% Humidity");
  temp_in_farenheit = (((data.main.temp * 9/5) - 459.67)).toFixed(1);
  $('.temperature h2').text(temp_in_farenheit + String.fromCharCode(176) + 'F');
}

/** function: get_song_id
* @param: track_name: the name of the song that is being requested
* @param: artist_name: the name of the artist who wrote the song
* uses jquery and ajax to recieve an onject full of data about the song, mainly the lyrics
*/

function get_song_id(track_name, artist_name) {
  $.ajax({
    dataType: 'jsonp',
    data: {'apikey': 'f23652a89052539aab022e77903e1dff', 'q_track': track_name, 'q_artist': artist_name, 'format': 'jsonp'},
    url: 'http://api.musixmatch.com/ws/1.1/matcher.lyrics.get',
    method: 'get',
    success: function(response) {
      if(typeof response.message.body.lyrics.lyrics_body != 'undefined'){
        var temp_obj = {'track': track_name, 'artist': artist_name, 'lyrics': response.message.body.lyrics.lyrics_body};
        lyrics.push(temp_obj);
      }
    }
  });

}

/** function: get_all_lyrics
* @param: song_array: array of objects with song name and artist name
* loops through the array, and calls get_song_id to get the lyrics of each one
*/
function get_all_lyrics(song_array) {
  for(var i = 0; i < song_array.length-1 && i < 20; i++) {
    get_song_id(song_array[i].song, song_array[i].artist);
  }
  add_song_titles_to_menu();
  add_song_to_dom();
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
* stores the zip code from the input in the global variable user_location
*/
function store_zip() {
  user_location = $('#zip_code_input').val();
  connect_open_weather();
  connect_spotify();
}

/**
 * Chooses a background image based on weather condition. Such as cloudy, clear, snowy, rainy.
 * Uses a switch to change the background-image depending on the value that was passed in
 * @function
 * @params {string} weather
 */
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
      }
}
/**
 * adds the songs titles to the a dropdown menu when the "get lyrics" button is pressed
**/
function add_song_titles_to_menu(){
  var lyric_buttons = $(".dropdown-menu").find('a');
  $(".dropdown-menu a").text('');
  for (var i = 0; i < lyrics.length-1; i++){
    $(lyric_buttons[i]).text(decodeURIComponent(lyrics[i].track));
  }
}
/**
 * loads the lyrics to the display when the corresponding button is pressed
 * on the dropdown menu.
**/
function add_song_to_dom(){
  var lyrics_button = $('.dropdown-menu').find('li');
  lyrics_button.on('click', function(e){
    var lyrics_index = $(this).index();
    $('.lyrics_display').text(decodeURIComponent(lyrics[lyrics_index].lyrics));
  });
}
