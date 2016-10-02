Moves-JavaScript
================

Tools for working with Moves (http://moves-app.com/)

MOVES.loadjson ( url , onDataReceived ) // load a storyline.json
RETURNS : moves

MOVES.collectFullSummary(moves) // get a summary of all summaries
RETURNS : {
        totalDistance: number,
        totalDuration: number,
        totalCalories: number,
        totalSteps: number,
        summaries: [ summary, ... ]
}

summary: {
        activity: "activity type",
        group : "activity group",
        duration : number,
        distance : number ,
        calories : number,
        steps : number
}


MOVES.collectAllByDay(moves) // Collect activities and places by date
RETURNS : [day, ...]

day : {
        date: "AAAAMMJJ",
        activities: [activity, ...],
        places: [place,...]
}

place : {
        id: number,
        location: {lat: latitude, long: longitude},
        type : "unknow",
        name : "unknown",
        duration : seconds
}

activity : {
        activity : "type",
        startTime : "AAAAMMJJTHHMMSSFFFFF",
        endTime: "AAAAMMJJTHHMMSSFFFFF",
        duration : seconds,
        distance : meters,
        trackPoints [trackPoint,...] }

trackPoint : {
        lat: latitude,
        lon: longitude,
        time : "AAAAMMJJTHHMMSSFFFFF"}

MOVES.collectAllPlacesById (moves) // Collect all places by id
RETURNS [place, ...]

place : {
        id: number,
        location: {lat: latitude, long: longitude},
        type : "unknow",
        name : "unknown",
        duration : seconds
}
