/**
 * Created by ck111 on 2/8/2017.
 */

/** Global Variables
* weather: current weather at your location, default is sunny if no weather data is found
*/

var location;
var weather = 'Sunny';

$(document).ready(initialize);

/** function: initialize
* function to add click handers, called on document ready
*/
function initialize() {

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
function connect_open_weather(location) {

}

/** function: connect_flickr
* connect to flickr with an ajax call, recieve images relating to the music playing
* @param: weather - used to pull weather specific images im so background of the page relates to the music that is playing
*/
function connect_flickr(weather) {

}

/** function: get_geo_location
* uses html5 to get the geolocation of the user and stores latitude and longitude in an object
*/
function get_geo_location() {

}
