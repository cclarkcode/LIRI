
//Outside file/package requirements
var {twitterKeys, spotifykeys} = require('./keys.js');
var Twitter = require('twitter');
var moment = require('moment');
var SpotifyWebApi = require('spotify-web-api-node');
var request = require('request');
var fs = require('fs');

//Define variables from command line arguments
var command = process.argv[2];
var clidata = process.argv.slice(3).join(' ');

var actions = {
	'my-tweets': myTweets,
	'spotify-this-song': spotify,
	'movie-this': movieapi,
	'do-what-it-says': datafile,
	'help': help
}

//Run program, passing all relevant data
if (actions[command] === undefined) {
	
	actions['help'](command);
}
else {
	actions[command](clidata);
}



function myTweets (handle) { 

	if (handle === '') {
		handle='pattonoswalt';
		var output = '\n\nGetting tweets for ' + handle + '(default)\n\n';
	}
	else {
		var output = '\n\nGetting tweets for ' + handle + '\n\n';
	}


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
     	output+= date + ': ' + tweets[i].text + '\n';
     }
     console.log(output);
     write(output);
  }
  else {
  	console.log(error);
  }
});

}

function spotify(song) {
	if (song==='') {
		song="The Sign Ace of Base";
		var output = "Searching for " + song + '(default)';
	}
	else {
		var output = 'Searching for ' + song;
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
		  	
		    output+='\n\nArtist(s): ' + data.body.tracks.items[0].artists[0].name + '\n';
		    output+='Song name: ' + data.body.tracks.items[0].name +'\n';
		    output+='Album: ' + data.body.tracks.items[0].album.name + '\n';
		    output+='Link to song: ' + data.body.tracks.items[0].external_urls.spotify+ '\n';
		    output+='\nIf you didn\'t get the song you were looking for, try adding the artist\'s name to the command line search\n';
		    console.log(output);
		    write(output);
		  }, function(err) {
		    console.error(err);
		  });
		  }, 
		  function(err) {
		        console.log('Something went wrong when retrieving an access token', err);

				
	});
	
}

function movieapi (movie) {

	if (movie === '') {
		movie = 'Mr. Nobody';
	}

	var queryURL = "https://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=40e9cece";

	request(queryURL, function (error, response, body) {
	  	var movieobject = JSON.parse(body);
	  	var output = '\nRunning movie search on ' + movie;
	  	output+='\nMovie: ' + movieobject.Title + '\n';
	  	output+='Released: ' + movieobject.Year + '\n';
	  	output+='IMDB Rating: ' + movieobject.Ratings[0].Value + '\n';
	  	output+='Rotten Tomatoes Rating: ' + movieobject.Ratings[1].Value +'\n';
	  	output+='Produced in: ' + movieobject.Country + '\n';
	  	output+='Synopsis: " ' + movieobject.Plot + '\n';
	  	output+='Actors: ' + movieobject.Actors + '\n';

	  	console.log(output);
	  	write(output);
	 
	  	});
	 
	  

}

function datafile (filename) {

	if (filename === '') {
		filename = 'random.txt';
	}

	fs.readFile(filename, "utf8", function(err, data) {
    if (err) {
      return console.log(err);
    }

    
    var command = data.substr(0,data.indexOf(','));
    var data = data.substr(data.indexOf(',')+1,data.length).replace(/"/g,'');

    console.log('\nPerforming ' + command + ' command on ' + data+ '\n\n');
    
    if (actions[command] === undefined) {
    	actions['help']();
    }
    else {
    	actions[command](data);
    }
    

  });
}


function help (command) {

	if (command === help) {
		var output = '\nRunning help command\n';
	}
	else {
		var output = '\nI\'m sorry, ' + command + ' is not a valid command.';
	}
	output+='Here is a list of valid commands:\n\n';
	output+='my-tweets <username>\n';
	output+='my-tweets <username>\n';
	output+='--Will provide the last 20 tweets for the username provided\n\n';
	output+='spotify-this-song <song> (artist(s) optional)\n';
	output+='--Will provide song data, including spotify link to song, for song and artist provided\n\n';
	output+='movie-this <movie name>\n';
	output+='--Will provide movie data for movie name provided\n\n';
	output+='do-what-it-says <filename optional>\n';
	output+='--Will run this program off a specified datafile. Default is random.txt\n\n';
	output+='help\n';
	output+='--Will display these instructions.\n';

	console.log(output);

	write(output);
}


function write(output) {

	fs.appendFile('log.txt', output,function(err) {
    if (err) {
      return console.log(err);
  	}
    })
}