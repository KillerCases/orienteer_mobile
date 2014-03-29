/******************************************
/* ON PAGE LOAD            
/*******************************************/

// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, false);

// Cordova is ready
//
function onDeviceReady() {
    // Empty
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

// alert dialog dismissed
function alertDismissed() {
    // do something
}

/******************************************
/* INDEX             
/*******************************************/
// Global Variables
// Create Pages
// Generate maps
// ****************************************
// DOCUMENT READY
// Page transition & Logic
// Load courses
// Start button & timer
// ****************************************
// Facebook login
// Score result calculation
// Allow user to log checkpoints
// Post results back to server


/******************************************
/* GLOBAL VARIABLES               
/*******************************************/

var fullName = '';
var firstName = '';
var userEmail = '';
var userScore =0;
var checkpointTolerance = 0.001 // 0.001 = 100m, 0.0001= 10m
var confirmedTolerance = 0.0021 // Has to be  slightly higher than checkpointTolerance
var correctCheckpoints =[]; // Array to hold location of correct checkpoints
var userCheckpoints=[]; // Array to hold any GPS location that the user logs, nomatter whether it is correct
var confirmed = []; // Array to hold GPS locations that have been validated and are associated with a correctCheckpoint
var result = 0;
var map_id =3; // Default to map id 1

//var mapUrl;
//var count;

/******************************************
/* CREATE PAGES       
/*******************************************/

// NOTES: pageshow event is fired every time the page loads, not just once. showCanvas needs to be called after pageShow as needs heigh dimensions

$(document).on("pagecreate", "#page_splash", function () { 
// alert('splash');
});
$(document).on("pageshow", "#coursePage", function () { 
//alert('start');
});
$(document).on("pageshow", "#startPage", function () { 
showCanvas(map_id);
});
$(document).on("pageshow", "#playPage", function () { 
//alert('play');
showCanvasAgain(map_id);
});

/******************************************
/* GENERATE MAPS     
/*******************************************/


function showCanvas(map_id){
    $('#map_canvas').gmap(
        { 'center': correctCheckpoints[0].latitude+','+correctCheckpoints[0].longitude, 'zoom':10  , 'callback':function() {
            var self = this;
            $.getJSON( 'http://www.orienteer.it/map_points', {map_id: map_id}, function(data) { 
                    // alert(data);
                    $.each( data, function(i, m) {
                        self.addMarker( { 'position': new google.maps.LatLng(m.latitude, m.longitude), 'bounds':true } );
                    }); 
                }
                )
        }
    });
};


function showCanvasAgain(map_id){
	$('#map_canvas2').gmap(
		{ 'center': correctCheckpoints[0].latitude+','+correctCheckpoints[0].longitude, 'zoom':10  , 'callback':function() {
			var self = this;
			$.getJSON( 'http://www.orienteer.it/map_points', {map_id: map_id}, function(data) { 
				$.each( data, function(i, m) {
					self.addMarker( { 'position': new google.maps.LatLng(m.latitude, m.longitude), 'bounds':true } );
				}); 
			}
			)
		}
	});

};


/***************************************************************************************************************************************************
/* START DOCUMENT.READY              
/****************************************************************************************************************************************************/


$(document).ready(function(e){


/******************************************
/* PAGE TRANSITIONS & LOGIC              
/*******************************************/

//Check Facebook login
$('#registerFacebook').on('click', function(e){
    console.log('clicked registerFacebook')
    var location = $("#location_selector :selected").val()
    if (!location || !location.length){
        alert ('Please select your location')
    }
    else{
        getCourses();
        checkFacebookLogin();
    }
    
});

//Logout of Facebook
$('#test').on('click', function(e){
    logoutFacebook();
});

//Load latest course into correctCheckpoints

$('#continue').on('click', function(){
    var location = $("#location_selector :selected").val()
    if (!location || !location.length){
        alert ('Please select your location')
    }
    else{
        getCourses();
        $.mobile.changePage('#coursePage'); //Transition to course page
    }
});


// Alert to indicate when positioned is logged
$('#logButton').on("click", function(e){
	positionLog(userCheckpoints, function(){
		setTimeout(
			function(){
				last = userCheckpoints.length -1
				//alert('currentlatitude is' + userCheckpoints[last].latitude);
				//alert('currentlongitude is' + userCheckpoints[last].longitude);
				//Recenter map at current position (in case google maps goes crazy)
				$('#map_canvas2').gmap('option', 'center', new google.maps.LatLng(userCheckpoints[last].latitude,userCheckpoints[last].longitude));
				$('#map_canvas2').gmap('option', 'zoom', 17);
				//Alert based on whether a valid checkpoint was found
				validate(userCheckpoints[last], correctCheckpoints);
		 		// Log position in userCheckpoints array
         }, 750);
	});	
});

//Navigate back to start page and clear userCheckpoints array
$('.startAgain').on('click', function(e){
	userCheckpoints.length = 0; // Empty the previous array and start again
	confirmed.length = 0;
	userScore = 0; //Reset userscore 
	result = 0; // Reset Result
	$.mobile.changePage('#startPage'); //Transition to start page
	$('#counter').html('30');
	setTimeout( function(){
		$('#map_canvas2').gmap('option', 'center', new google.maps.LatLng(correctCheckpoints[0].latitude,correctCheckpoints[0].longitude));
		$('#map_canvas2').gmap('option', 'zoom', 10)
	},1000);
});

$('#back_location').on('click', function(){
	$('#course').empty();
	$.mobile.changePage('#page_splash');
})
  

/******************************************
/* LOAD COURSES             
/*******************************************/

function getCorrectCheckpoints(map_id){
    $.getJSON("http://www.orienteer.it/map_points", {map_id: map_id}, function(data){
        correctCheckpoints=data;
    }).error(function(){
        navigator.notification.alert("There was an error.",function(){},"Error")
    })
};

function getCourses(){
 // alert('getCourses');
 var location = $("#location_selector :selected").val()
 $.getJSON( 'http://www.orienteer.it/map', {city: location}, function(data) { 
     $.each( data, function(i, m) {
         // alert(m.name);
         $( "#courses" ).append( 
            "<div class ='course_wrapper buttonStyle' id='"+m.id+"'>"+
            // "<div class ='map_wrapper' id='map_wrapper'>"+
            // "</div>"+
            // "<div class='description_wrapper' id='description_wrapper'>"+
            "<div class='text_wrapper' id='text_wrapper'>"+
            "<p>"+m.name+"</p>"+
            "</div>"+ 
            "<div class = 'arrow_wrapper'>"+
            "<div class='arrow_right'></div>"+
            "</div>"+ 
            // "</div>"+                
            "</div>"
            )
         $('#courses').on('click', '.course_wrapper', function() {
            map_id = $(this).attr('id');
            $('#map_canvas').gmap('destroy');
            $.when(getCorrectCheckpoints(map_id)).done($.mobile.changePage('#startPage'));  
        }); 
     });
 }); 
};

$('#courseBack').on('click', function(){
    $.mobile.changePage('#coursePage')
})


/******************************************
/* START BUTTON & TIMER              
/*******************************************/

$('#startButton').on('click', function(e){
	//Reset timer to full time
	var remaining = 0;

	//GetUserName & Email
	getFacebookName();
	getFacebookEmail();

	//Change toplay page
	$.mobile.changePage('#playPage');

	//Timer function background friendly
	date = new Date();
	milliseconds = date.getTime();
	startTime = milliseconds / 1000;

	var timer = $.timer(function() {
		var currentDate = new Date ();
		var currentTime = currentDate.getTime()/1000; // Give time in seconds
		remaining = parseInt(15 + (startTime - currentTime)); //3600 seconds = 1 hour
		if(remaining >=0){	
			$('#counter').html(Math.ceil(remaining/60));	
		}
		else{
			userScore = resultCalculation(userCheckpoints); //Calculate result
			timer.stop();
			$.mobile.changePage('#resultPage'); //Transition to resul page
			$('#userName').html(firstName); //Show first name
			$('#userResult').html(userScore); //Show result
			// alert('fullName: '+fullName+', userEmail: '+userEmail+', userScore: '+userScore)
			postResult(fullName, userEmail, userScore, userCheckpoints); //Post results to server
		}
	});

	timer.set({ time : 10000, autostart : true }); // time:60000 millisecs is 1 min, time:1000 millisecs is 1 second

});

}); // End Document Ready

/*************************************************************************************************************************************/



/******************************************
/* FACEBOOK LOGIN                 
/*******************************************/

//Get Facebook name
function getFacebookName(){
	FB.api('/me', function(response) {
		fullName = response.name;
		firstName = response.first_name;
	//alert(firstName);
});
}

//Get Facebook email
function getFacebookEmail(){
	FB.api('/me', function(response) {
		userEmail = response.email;
	//alert(userEmail);
});
}

//Login to facebook if not already
function promptFacebookLogin() {
	//alert('starting login')
    console.log('Starting Facebook login')
	FB.login(
		function(response) {
			if (response.session) {
				console.log('logged in');
			} else {
				//alert('not logged in');
			}
		},
		{ scope: "email" }
		);
}

// Check whether user is logged in and execute logic based on this
function checkFacebookLogin(){
	console.log('about to check login status')
	FB.getLoginStatus(function(response) {
		if (response.status == 'connected') {
            console.log('Connected to Facebook')
    // the user is logged in and has authenticated your
    // app, and response.authResponse supplies
    // the user's ID, a valid access token, a signed
    // request, and the time the access token 
    // and signed request each expire
    var uid = response.authResponse.userID;
    var accessToken = response.authResponse.accessToken;
    //getFacebookName();
    //getFacebookEmail();
   //alert("Connected");
   $.mobile.changePage('#coursePage');
} else if (response.status == 'not_authorized') {
    // the user is logged in to Facebook, 
    // but has not authenticated your app
    $.mobile.changePage('#coursePage');
    alert("Not_authorized");
} else {
    // the user isn't logged in to Facebook.
    alert('Not connected to Facebook')
    promptFacebookLogin();
    $.mobile.changePage('#coursePage');
}
});
}

//Log user out of Facebook
function logoutFacebook(){
	FB.logout(function(response) {
		alert('logged out of Facebook')
  // user is now logged out

});
}

/******************************************
/* SCORE RESULT CALCULATION                  
/*******************************************/

//Test checkpoints to use for debugging

var testCorrectCheckpoints = [
{Ref:1, latitude: 36.785834, longitude: -122.406417},
{Ref:2, latitude: 37.775443, longitude: 37.775443},
{Ref:3, latitude: 38.775023, longitude: -123.406417},
{Ref:4, latitude: 39.775023, longitude: -123.555417},
{Ref:5, latitude: 39.775022, longitude: -123.555415},
{Ref:5, latitude: 39.775024, longitude: -123.555416},
];

var testUserCheckpoints = [
{Ref:1, latitude: 36.785834, longitude: -122.406417},
{Ref:2, latitude: 37.775443, longitude: 37.775443},
{Ref:3, latitude: 38.775023, longitude: -123.406417},
{Ref:4, latitude: 39.775023, longitude: -123.555417},
{Ref:5, latitude: 39.775022, longitude: -123.555415},
{Ref:5, latitude: 39.775024, longitude: -123.555416},
];



//Compare to see if checkpoint is in the list of correct points
function compare(a, b){
	var match =0;
	for(var j=0; j<b.length; j++)
	{
		var latMax = parseFloat(b[j].latitude) + checkpointTolerance;
		var latMin = parseFloat(b[j].latitude) - checkpointTolerance;
		var longMax = parseFloat(b[j].longitude) + checkpointTolerance;
		var longMin = parseFloat(b[j].longitude) - checkpointTolerance;
		if((parseFloat(a.latitude) > latMin) && (parseFloat(a.latitude) < latMax))
		{
			if((parseFloat(a.longitude) >longMin) && (parseFloat(a.longitude) <longMax)){
				match++;
			}
		}
	}
	return match;
}

//Check that this checkpoint has not already been logged
function dedup(a, c){
	var dup =0
	for(var k=0; k<c.length; k++){
		var latMax = parseFloat(c[k].latitude) + confirmedTolerance;
		var latMin = parseFloat(c[k].latitude) - confirmedTolerance;
		var longMax = parseFloat(c[k].longitude) + confirmedTolerance;
		var longMin = parseFloat(c[k].longitude) - confirmedTolerance;
		if((parseFloat(a.latitude) >=latMin) && (parseFloat(a.latitude) <=latMax)){
			if((parseFloat(a.longitude) >=longMin) && (parseFloat(a.longitude) <=longMax)){
				dup++;
			}	
		}
	}
	return dup;
}

//Send messages to validate whether user is logging a correct checkpoint
function validate(d, b) {
	var resultofCompare = compare(d, b)
	if(resultofCompare){
		logAlert('Success!','You logged a checkpoint','OK');
	}
	else{
		logAlert('Warning','Not a valid checkpoint','OK');
	}
}

// Same as above but without messages
function check(a, b, c){
	for (var i=0;i<a.length; i++){
		var resultofCompare = compare(a[i],b);
		var resultofDedup = dedup(a[i],c);
		if( resultofCompare && !resultofDedup){
			confirmed.push({latitude: parseFloat(a[i].latitude), longitude: parseFloat(a[i].longitude)});
			result++;

		}
	}
}

//Calculate result
function resultCalculation(a){
	
	check(a, correctCheckpoints, confirmed);
	return result;
};

/******************************************
/* ALLOW USER TO LOG CHECKPOINTS               
/*******************************************/

//Timer Function
var timer = $.timer(function() {
	++count;
});


//Alert to Indicate position is logged
function logAlert(title, message, button) {
	navigator.notification.alert(
        message,  // message
        alertDismissed,         // callback
        title,            // title
        button                  // buttonName
        );
}	

// Log latitude & longitude to array

function positionLog(a, callback){
	if(navigator.geolocation) {
    // This is the specific PhoneGap API call
    navigator.geolocation.getCurrentPosition(function(p) {
    	//alert('My lat is '+p.coords.latitude);
    	//alert('My long is '+p.coords.longitude);
        // p is the object returned
        a.push({latitude: p.coords.latitude, longitude: p.coords.longitude});
        //alert('p coord' + p.coords.latitude)   
    }, function(error){
    	logAlert('Warning','Failed to get GPS location','OK');
    }, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
} else {
  logAlert('Warning','Failed to get GPS location','OK');
}
	//alert('In array' + a[0].latitude)
	if (callback && typeof(callback) === "function") {  
        callback();  
    }  
}


/******************************************
/* POST RESULTS BACK TO SERVER                 
/*******************************************/


function createUser(name, email){
	$.post("http://www.orienteer.it/mobile_user",{email: email, name: name, password: '42345678'}, function(data, success){
			// alert("CREATE USER: " + data[0].id + "\nStatus: " + status);
       });
};

function postScore(email, score, user_checkpoints, map_id){
	$.post("http://www.orienteer.it/result",{score: score, map_id: map_id, email: email},function(data, status){
			// alert("RESULT POST: " + data + "\nStatus: " + status);
       });
}

function postResult(name, email, score, user_checkpoints){
	if (!name && !email){
		name = "The crafty tester"
		email = 'test@123.com'
	}
	$.when(createUser(name, email)).done(postScore(email, score, user_checkpoints))
};


/////////////////////////////

/* DO NOT TOUCH THIS WORKS!!!!!!!!!

function createUser(name, email, score, user_checkpoints, map_id){
	$.post("http://www.orienteer.it/mobile_user",{email: 'jo@523.com', name: 'Unregistered User', password: '42345678'}, function(data, success){
			alert("CREATE USER: " + data[0].id + "\nStatus: " + status);
	});
};

function postScore(name, email, score, user_checkpoints){
	$.post("http://www.orienteer.it/result",{score: '4003', map_id: '1', email: "jo@23.com"},function(data, status){
			alert("RESULT POST: " + data + "\nStatus: " + status);
	});
}

function postResult(name, email, score, user_checkpoints, map_id){
	$.when(createUser()).done(postScore())
};

*/



