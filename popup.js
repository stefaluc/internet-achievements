window.onload = function() {
    init();
}

// reinitialize page when new achievement message is received
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        console.log('popup.js receive message. sender: ' + sender);
        if (message.sender == "bg") {
            init();
        }
    }
);

function init() {
    document.body.innerHTML = '';

    var keys = Object.keys(json);
    console.log(keys);
    var achieved = false;
    var points = 0;
    // get gained achievements
    chrome.storage.sync.get(keys, function(result) {
        console.log(result);
        document.body.innerHTML += '<div id="points"></div><br/>';
        document.body.innerHTML += '<div class="row"></div>';
        document.body.innerHTML += '<div class="row"></div>';
        // display all achievements
        for(var i = 0; i < keys.length; i++) {
            if(result[keys[i]]) { // achieved
                console.log(json[keys[i]].points);
                points += json[keys[i]].points;
                document.getElementsByClassName('row')[0].innerHTML += '<div class="col s12 m6"><div class="card blue-grey darken-1"><div class="card-content white-text"><span class="card-title">'+keys[i]+'</span><p>'+json[keys[i]].description+'</p></div><div class="card-action">10</div></div></div>';
            } else { // not achieved
                document.getElementsByClassName('row')[1].innerHTML += '<div class="col s12 m6"><div class="card blue-grey darken-3"><div class="card-content white-text"><span class="card-title">'+keys[i]+'</span><p>'+json[keys[i]].description+'</p></div><div class="card-action">unachieved</div></div></div>';
            }
        }
        document.getElementById('points').innerHTML += '<b>Points: </b>' + points;
    });
}

var json = {
    "pageLoads1": {
        "image": "assets/images/1.jpg",
        "description": "pageLoads1",
        "points": 10
    },
    "pageLoads2": {
        "image": "assets/images/2.jpg",
        "description": "pageLoads2",
        "points": 25
    },
    "pageLoads3": {
        "image": "assets/images/3.jpg",
        "description": "pageLoads3",
        "points": 50
    },
    "wiki1": {
        "image": "assets/images/4.jpg",
        "description": "wiki1",
        "points": 10
    },
    "wiki2": {
        "image": "assets/images/4.jpg",
        "description": "wiki2",
        "points": 25
    },
    "wiki3": {
        "image": "assets/images/4.jpg",
        "description": "wiki3",
        "points": 10
    },
    "redditAccount": {
        "image": "assets/images/4.jpg",
        "description": "redditAccount",
        "points": 10
    }
}
