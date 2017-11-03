var {twitterKeys, spotifykeys} = require('./keys.js');
var Twitter = require('twitter');
var moment = require('moment');
var SpotifyWebApi = require('spotify-web-api-node');

var command = process.argv[2];

if (command === 'my-tweets') {
	myTweets(process.argv[3]);
}

if (command === 'spotify-this-song') {
	var songTitle= process.argv.slice(3).join();
	spotify(songTitle);
}



 
// credentials are optional

function myTweets (handle='pattonoswalt') { 

	// if (handle === ) {
	// 	handle='pattonoswalt';
	// }
	var client = new Twitter({
	consumer_key: twitterKeys.consumer_key,
	consumer_secret: twitterKeys.consumer_secret,
	access_token_key: twitterKeys.access_token_key,
	access_token_secret: twitterKeys.access_token_secret
});


var params = {screen_name: handle};

client.get('statuses/user_timeline', params, function(error, tweets, response) {
  if (!error) {
     for (var i = 0; i < tweets.length; i++) {
     	var date = tweets[i].created_at.substr(4,15);
     	console.log(date + ': ' + tweets[i].text);
     }
  }
  else {
  	console.log(error);
  }
});

}

function spotify(song) {
	if (song==='') {
		song="The Sign Ace of Base";
	}

	var spotifyApi = new SpotifyWebApi({
		clientId : spotifykeys.client_ID,
  		clientSecret : spotifykeys.client_secret
	});
	
	spotifyApi.clientCredentialsGrant()
	  .then(function(data) {
	    
	    // Save the access token so that it's used in future calls
		spotifyApi.setAccessToken(data.body['access_token']);

		//Perform song search
		spotifyApi.searchTracks(song)
		  .then(function(data) {
		    console.log('Artist(s): ' + data.body.tracks.items[0].artists[0].name);
		    console.log('Song name: ' + data.body.tracks.items[0].name)
		    console.log('Album: ' + data.body.tracks.items[0].album.name);
		    console.log('Link to song: ' + data.body.tracks.items[0].external_urls.spotify)
		    console.log('\nIf you didn\'t get the song you were looking for, try adding the artists name to the command line search');
		  }, function(err) {
		    console.error(err);
		  });
		  }, 
		  function(err) {
		        console.log('Something went wrong when retrieving an access token', err);

				
	});
	
}
