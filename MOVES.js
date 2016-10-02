/*
███╗   ███╗ ██████╗ ██╗   ██╗███████╗███████╗        ██╗███████╗
████╗ ████║██╔═══██╗██║   ██║██╔════╝██╔════╝        ██║██╔════╝
██╔████╔██║██║   ██║██║   ██║█████╗  ███████╗        ██║███████╗
██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██╔══╝  ╚════██║   ██   ██║╚════██║
██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ███████╗███████║██╗╚█████╔╝███████║
╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝╚══════╝╚═╝ ╚════╝ ╚══════╝
*/

var MOVES = MOVES || {};

/*
MOVES.loadjson ( url , onDataReceived ) : load a storyline.json

RETURNS : moves object
*/
MOVES.loadjson = function( url , onDataReceived ) {

    if ( (typeof url === 'undefined') || (typeof onDataReceived === 'function') === false )  {
        console.log('MOVES.loadjson requires : ( url , onDataReceived )')
        return ;
    }

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            onDataReceived(JSON.parse(xmlhttp.responseText));
        }
    }

    xmlhttp.open("GET", url, true);
    xmlhttp.send();

}


/* 
MOVES.collectFullSummary(moves) : get a summary of all summaries
RETURNS : {totalDistance: number, totalDuration: number, totalCalories: number, totalSteps: number, summaries : [ summary, ... ] }

summary : {activity: "activity type", group : "activity group", duration : number, distance : number , calories : number, steps : number}
*/
MOVES.collectFullSummary = function(moves) {

    var allSummaries = [];
    var summaryOfSummaries = {totalDistance: 0, totalDuration: 0, totalCalories: 0, totalSteps: 0, summaries : allSummaries };
    for ( var m = 0 ; m < moves.length ; m++ ) {
        var summaries = moves[m].summary;

        for ( var s = 0; s < summaries.length; s++) {
            var found = false;
            for ( var f =0; f < allSummaries.length; f++ ){
                if ( summaries[s].activity == allSummaries[f].activity) {

                    found = true;
                    allSummaries[f].duration += summaries[s].duration;
                    summaryOfSummaries.totalDuration += summaries[s].duration;
                    allSummaries[f].distance += summaries[s].distance;
                    summaryOfSummaries.totalDistance += summaries[s].distance;

                    if ( summaries[s].hasOwnProperty('steps') ) {
                        allSummaries[f].steps += summaries[s].steps;
                    }

                    if ( summaries[s].hasOwnProperty('calories')  ) {
                        allSummaries[f].calories += summaries[s].calories;
                    }

                    break;
                }
            }

            if ( found == false ) {
                allSummaries.push(summaries[s]);
                
                summaryOfSummaries.totalDuration += summaries[s].duration;
                summaryOfSummaries.totalDistance += summaries[s].distance;
                if (summaries[s].hasOwnProperty('steps') ) {
                    summaryOfSummaries.totalSteps += summaries[s].steps;
                } else {
                    summaries[s].steps = 0;

                }
                if ( summaries[s].hasOwnProperty('calories') ) {
                    summaryOfSummaries.totalCalories += summaries[s].calories;
                } else {
                    summaries[s].calories = 0;
                }

            }

        }

    }
    return summaryOfSummaries;
}




/*  
MOVES.collectAllByDay(moves)
RETURNS : [day, ...]

day : {date: "AAAAMMJJ", activities: [activity, ...], places: [place,...] }

activity : { activity : "type", startTime : "AAAAMMJJTHHMMSSFFFFF", endTime: "AAAAMMJJTHHMMSSFFFFF", duration : seconds, distance : meters, trackPoints [trackPoint,...] }
trackPoint : {lat: latitude, lon: longitude, time : "AAAAMMJJTHHMMSSFFFFF"}

place : {id: number, location: {lat: latitude, long: longitude}, type : "unknow", name : "unknown", duration : seconds  }

*/
MOVES.collectAllByDay = function(moves) {

    var days = [];

    for (var movesIndex = 0; movesIndex < moves.length ; movesIndex++) {

        var day = {date: moves[movesIndex].date, activities : [], places : [] };

        days.push(day);

        var segments = moves[movesIndex].segments;

        for (var segmentsIndex = 0; segmentsIndex < segments.length ; segmentsIndex++) {

            var segment = segments[segmentsIndex];

            if ( segment.type == "move" ) { 

                var activities = segment.activities;

                for (var activitiesIndex = 0; activitiesIndex < activities.length ; activitiesIndex++) {
                    day.activities.push(activities[activitiesIndex]);
                }
            } else {
                MOVES.addPlaceById(segment, day.places );
            }
        }
    }

    return days;

}


/* 
MOVES.collectAllPlacesById (moves)
RETURNS [place, ...]
place : {id: number, location: {lat: latitude, long: longitude}, type : "unknow", name : "unknown", , duration : seconds  }
*/
MOVES.collectAllPlacesById = function(moves) {
    var placeSegmentsById = [];

    for (var movesIndex = 0; movesIndex < moves.length ; movesIndex++) {
        var segments = moves[movesIndex].segments;
        for (var segmentsIndex = 0; segmentsIndex < segments.length ; segmentsIndex++) {
            var segment = segments[segmentsIndex];
            if ( segment.type == "place" ) {
                MOVES.addPlaceById(segment, placeSegmentsById);
            }
        }
    }

    return placeSegmentsById;
}

/*
$$$$$$$\  $$$$$$$\  $$$$$$\ $$\    $$\  $$$$$$\ $$$$$$$$\ $$$$$$$$\ 
$$  __$$\ $$  __$$\ \_$$  _|$$ |   $$ |$$  __$$\\__$$  __|$$  _____|
$$ |  $$ |$$ |  $$ |  $$ |  $$ |   $$ |$$ /  $$ |  $$ |   $$ |      
$$$$$$$  |$$$$$$$  |  $$ |  \$$\  $$  |$$$$$$$$ |  $$ |   $$$$$\    
$$  ____/ $$  __$$<   $$ |   \$$\$$  / $$  __$$ |  $$ |   $$  __|   
$$ |      $$ |  $$ |  $$ |    \$$$  /  $$ |  $$ |  $$ |   $$ |      
$$ |      $$ |  $$ |$$$$$$\    \$  /   $$ |  $$ |  $$ |   $$$$$$$$\ 
\__|      \__|  \__|\______|    \_/    \__|  \__|  \__|   \________|
 */                                                                  
                                                                    
                                                                    
MOVES.addPlaceById = function (segment, placeArray) {
    
    var place = segment.place;
    var found = false;
    for ( var i = 0 ; i < placeArray.length ; i++ ) {
        if ( placeArray[i].id == place.id ) {
            //placeArray[i].segments.push(segment);
             placeArray[i].duration += (MOVES.ISODateToDate(segment.endTime) - MOVES.ISODateToDate(segment.startTime)) / 1000;
            found = true;
            break;
        }
    }
    if ( found == false ) {
        var entry = { };
        entry.id = place.id;
        entry.type = place.type;
        if ( place.type != "unknown") {
            entry.name = place.name;
        } else {
            entry.name = "unknown";
        }
        entry.location = {};
        entry.location.lat = place.location.lat;
        entry.location.lon = place.location.lon;
        entry.duration = (MOVES.ISODateToDate(segment.endTime) - MOVES.ISODateToDate(segment.startTime)) / 1000;
        //entry.mentions = [];
        //entry.segments[0] = segment;
        placeArray.push(entry);    

    }
}



// Return an Array of all places
MOVES.collectAllPlaceSegments = function(moves) {
    var segmentArray = [];
    for (var movesIndex = 0; movesIndex < moves.length ; movesIndex++) {
        var segments = moves[movesIndex].segments;
        for (var segmentsIndex = 0; segmentsIndex < segments.length ; segmentsIndex++) {
            if ( segments[segmentsIndex].type == "place" ) segmentArray.push(segments[segmentsIndex]);
        }
    }
    return segmentArray;
}

// Convert the Moves date into a JavaScript Date object
// Based on https://github.com/matiasdoyle/moves-date
MOVES.ISODateToDate =  function (str) {
    var date = '';

    if (str instanceof Date) return str;

    date += str.substr(0, 4) + '-';
    date += str.substr(4, 2) + '-';
    date += str.substr(6, 2);

    if (str.indexOf('T') > -1) {
        date += 'T' + str.substr(9, 2) + ':';
        date += str.substr(11, 2) + ':';
        date += str.substr(13, 2);
        date += str.substr(15);
    }

    return new Date(date);
}







// Return an object with the min and max of latitude and longitude of ALL trackpoints
MOVES.analyseLocations = function(moves) {

    var analysis = { lat : {min:0, max:0, center:0} , lon : {min:0, max:0,center:0} };
    var first = true;


    for (var movesIndex = 0; movesIndex < moves.length ; movesIndex++) {

        var segments = moves[movesIndex].segments;

        for (var segmentsIndex = 0; segmentsIndex < segments.length ; segmentsIndex++) {

            var segment = segments[segmentsIndex];

            if ( segment.type == "move" ) { 

                var activities = segment.activities;
                for (var activitiesIndex = 0; activitiesIndex < activities.length ; activitiesIndex++) {
                    var entry = activities[activitiesIndex];
                    var trackPoints = activities[activitiesIndex].trackPoints;

                    for ( var trackPointIndex = 0 ; trackPointIndex < trackPoints.length; trackPointIndex++) {
                        var trackPoint  = trackPoints[trackPointIndex];
                        if ( first ) {
                            first = false;   
                            analysis.lat.max = analysis.lat.min = trackPoint.lat;
                            analysis.lon.max = analysis.lon.min = trackPoint.lon;
                        } else {
                            if ( trackPoint.lat < analysis.lat.min ) analysis.lat.min = trackPoint.lat;
                            if ( trackPoint.lat > analysis.lat.max ) analysis.lat.max = trackPoint.lat;
                            if (  trackPoint.lon < analysis.lon.min ) analysis.lon.min =  trackPoint.lon;
                            if (  trackPoint.lon > analysis.lon.max ) analysis.lon.max =  trackPoint.lon;
                        }
                    }

                }
            } else if ( segment.type == "place" ) {

                if ( first ) {
                    first = false;   
                    analysis.lat.max = analysis.lat.min = segment.place.location.lat;
                    analysis.lon.max = analysis.lon.min = segment.place.location.lon;
                } else {
                    if ( segment.place.location.lat < analysis.lat.min ) analysis.lat.min = segment.place.location.lat;
                    if ( segment.place.location.lat > analysis.lat.max ) analysis.lat.max = segment.place.location.lat;
                    if ( segment.place.location.lon < analysis.lon.min ) analysis.lon.min = segment.place.location.lon;
                    if ( segment.place.location.lon > analysis.lon.max ) analysis.lon.max = segment.place.location.lon;
                }
            }
        }
    }

    analysis.lat.center = (analysis.lat.max + analysis.lat.min) * 0.5;
    analysis.lon.center = (analysis.lon.max + analysis.lon.min) * 0.5;

    return analysis;
}


// SORT BY NUMBER OF ENTRIES
/*
    if ( placeSegmentsById.length > 1 ) {
        function sortFunction(a,b) {
            if ( a.segments.length > b.segments.length ) return -1;
            if ( a.segments.length < b.segments.length ) return 1;
            else return 0;
        }
        placeSegmentsById.sort(sortFunction);
    }
*/