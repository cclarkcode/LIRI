
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


//Object function with commany keys
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


//Function to handle all calls to twitter API
function myTweets (handle) { 

	//Default logic, output variable for simplified console.log + log file outputting
	if (handle === '') {
		handle='pattonoswalt';
		var output = '\n\nGetting tweets for ' + handle + '(default)\n\n';
	}
	else {
		var output = '\n\nGetting tweets for ' + handle + '\n\n';
	}

	//Create twitter client with specified keys
	var client = new Twitter({
	consumer_key: twitterKeys.consumer_key,
	consumer_secret: twitterKeys.consumer_secret,
	access_token_key: twitterKeys.access_token_key,
	access_token_secret: twitterKeys.access_token_secret
});


var params = {screen_name: handle};

//Call Twitter api
client.get('statuses/user_timeline', params, function(error, tweets, response) {
  if (!error) {
     for (var i = 0; i < tweets.length; i++) {
     	var date = tweets[i].created_at.substr(4,15);
     	output+= date + ': ' + tweets[i].text + '\n';
     }
     //Send output to console and to log file
     console.log(output);
     write(output);
  }
  else {
  	console.log(error);
  }
});

}

//Call spotify api
function spotify(song) {

	//Default logic, output variable for simplified console.log + log file outputting
	if (song==='') {
		song="The Sign Ace of Base";
		var output = "Searching for " + song + '(default)';
	}
	else {
		var output = 'Searching for ' + song;
	}

	//Create Spotify client with specified authorization keys
	var spotifyApi = new SpotifyWebApi({
		clientId : spotifykeys.client_ID,
  		clientSecret : spotifykeys.client_secret
	});
	
	//Call spotify API
	spotifyApi.clientCredentialsGrant()
	  .then(function(data) {
	    
	    // Save the access token so that it's used in future calls
		spotifyApi.setAccessToken(data.body['access_token']);

		//Perform song search
		spotifyApi.searchTracks(song)
		  .then(function(data) {
		  	
		  	//Create output for console and log file
		    output+='\n\nArtist(s): ' + data.body.tracks.items[0].artists[0].name + '\n';
		    output+='Song name: ' + data.body.tracks.items[0].name +'\n';
		    output+='Album: ' + data.body.tracks.items[0].album.name + '\n';
		    output+='Link to song: ' + data.body.tracks.items[0].external_urls.spotify+ '\n';
		    output+='\nIf you didn\'t get the song you were looking for, try adding the artist\'s name to the command line search\n';
		    
		    //Write output to console and log file
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

	//Handle default logic, output variable for simplified console and log file output
	if (movie === '') {
		movie = 'Mr. Nobody';
		var output = '\nRunning movie search on ' + movie + '(default)\n';
	}
	else {
		var output = '\nRunning movie search on ' + movie + '\n';
	}

	//Create url for OMDB api call
	var queryURL = "https://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=40e9cece";

	//Make api call
	request(queryURL, function (error, response, body) {
	  	var movieobject = JSON.parse(body);
	  	
	  	//Create output for console and log file
	  	output+='\nMovie: ' + movieobject.Title + '\n';
	  	output+='Released: ' + movieobject.Year + '\n';
	  	output+='IMDB Rating: ' + movieobject.Ratings[0].Value + '\n';
	  	output+='Rotten Tomatoes Rating: ' + movieobject.Ratings[1].Value +'\n';
	  	output+='Produced in: ' + movieobject.Country + '\n';
	  	output+='Synopsis: " ' + movieobject.Plot + '\n';
	  	output+='Actors: ' + movieobject.Actors + '\n';


	  	//Write to console and to log file
	  	console.log(output);
	  	write(output);
	 
	  	});
	 
	  

}

//Function to run program off text file
function datafile (filename) {

	//Handle default logic
	if (filename === '') {
		filename = 'random.txt';
	}

	//Read file
	fs.readFile(filename, "utf8", function(err, data) {
    if (err) {
      return console.log(err);
    }

    //Parse command and data necessary to execute command
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

//Function which displays all available commands with instructions
//Function runs by default if invalid command given
function help (command) {

	//Determines whether help was specified or invalid command given
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

	//Write output to console and to log file
	console.log(output);
	write(output);
}

//Function which writes output to log file
function write(output) {

	fs.appendFile('log.txt', output,function(err) {
    if (err) {
      return console.log(err);
  	}
    })
}