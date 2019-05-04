/* Magic Mirror Config Sample
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 *
 * For more information how you can configurate this file
 * See https://github.com/MichMich/MagicMirror#configuration
 *
 */

var config = {
	address: "localhost", // Address to listen on, can be:
	                      // - "localhost", "127.0.0.1", "::1" to listen on loopback interface
	                      // - another specific IPv4/6 to listen on a specific interface
	                      // - "", "0.0.0.0", "::" to listen on any interface
	                      // Default, when address config is left out, is "localhost"
	port: 8080,
	ipWhitelist: [], // Set [] to allow all IP addresses
	                                                       // or add a specific IPv4 of 192.168.1.5 :
	                                                       // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
	                                                       // or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
	                                                       // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	language: "en",
	timeFormat: 24,
	units: "metric",
modules : [ { module: 'alert' },
  { module: 'updatenotification', position: 'top_bar' },
  { module: 'MM-MagicMirrorMe', position: 'bottom_left' },
  { module: 'MMM-Dynamic-Modules' },
  { module: 'MMM-Stock', position: 'top_left' },
  { module: 'calendar',
    position: 'top_right',
    header: 'SWE Holidays',
    config:
     { calendars:
        [ { symbol: 'calendar-check',
            url:
             'https://www.calendarlabs.com/ical-calendar/ics/71/Sweden_Holidays.ics' } ] } },
  { module: 'compliments', position: 'bottom_left' },
  { module: 'currentweather',
    position: 'bottom_right',
    config:
     { location: 'Karlstad',
       locationID: '2701680',
       appid: '2ea660f74981297e2329a05d0e9b0fd9' } } ]
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {module.exports = config;}
