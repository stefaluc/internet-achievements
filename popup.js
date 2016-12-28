var container = document.getElementsByClassName('container')[1];

window.onload = function() {
    init();
}

// reinitialize page when new achievement message is received
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        console.log('popup.js receive message. sender: ' + sender);
        if (message.sender == "bg") {
            // display rich notification for new achievement
            for(var i = 0; i < message.achievements.length; i++) {
                var key = json[message.achievements[i]];
                var opt = {
                    type: "basic",
                    title: key.title,
                    message: key.description,
                    iconUrl: 'temp.png'
                }
                chrome.notifications.create(opt);
            }
            init();
        }
    }
);

function init() {
    container.innerHTML = '';

    var keys = Object.keys(json);
    console.log(keys);
    var achieved = false;
    var points = 0;
    // get gained achievements
    chrome.storage.sync.get(keys, function(result) {
        console.log(result);
        container.innerHTML += '<div id="points"></div><br/>';
        container.innerHTML += '<div class="row"></div>';
        container.innerHTML += '<div class="row"></div>';
        // display all achievements
        for(var i = 0; i < keys.length; i++) {
            if(result[keys[i]]) { // achieved
                console.log(json[keys[i]].points);
                points += json[keys[i]].points;
                document.getElementsByClassName('row')[1].innerHTML += '<div class="col s12 m3"><div class="card hoverable"><div class="card-content blue-text text-darken-1"><span class="card-title">'+keys[i]+'</span><p>'+json[keys[i]].description+'</p></div><div class="card-action">10</div></div></div>';
            } else { // not achieved
                document.getElementsByClassName('row')[2].innerHTML += '<div class="col s12 m3"><div class="card white darken-3 hoverable"><div class="card-content blue-text text-darken-1"><span class="card-title">'+keys[i]+'</span><p>'+json[keys[i]].description+'</p></div><div class="card-action">unachieved</div></div></div>';
            }
        }
        document.getElementById('points').innerHTML += '<b>Points: </b>' + points;
    });
}

var json = {
    "pageLoads1": {
        "title": "pageLoads1",
        "description": "pageLoads1",
        "image": "assets/images/1.jpg",
        "points": 10
    },
    "pageLoads2": {
        "title": "pageLoads1",
        "description": "pageLoads2",
        "image": "assets/images/2.jpg",
        "points": 25
    },
    "pageLoads3": {
        "title": "pageLoads1",
        "description": "pageLoads3",
        "image": "assets/images/3.jpg",
        "points": 50
    },
    "wiki1": {
        "title": "pageLoads1",
        "description": "wiki1",
        "image": "assets/images/4.jpg",
        "points": 10
    },
    "wiki2": {
        "title": "pageLoads1",
        "description": "wiki2",
        "image": "assets/images/4.jpg",
        "points": 25
    },
    "wiki3": {
        "title": "pageLoads1",
        "description": "wiki3",
        "image": "assets/images/4.jpg",
        "points": 10
    },
    "redditAccount": {
        "title": "pageLoads1",
        "description": "redditAccount",
        "image": "assets/images/4.jpg",
        "points": 10
    },
    "rickRoll": {
        "title": "pageLoads1",
        "description": "rickRoll",
        "image": "assets/images/4.jpg",
        "points": 10
    }
}
