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
    var points = 0;
    // get gained achievements
    chrome.storage.sync.get(keys, function(result) {
        console.log(result);
        container.innerHTML += '<div id="achieved" class="row"></div>';
        container.innerHTML += '<div id="unachieved" class="row"></div>';
        // display all achievements
        for(var i = 0; i < keys.length; i++) {
            if(result[keys[i]]) { // achieved
                console.log(json[keys[i]].points);
                points += json[keys[i]].points;
                document.getElementById('achieved').innerHTML += '<div class="col s12 m3"><div class="animated fadeIn card white hoverable"><div class="card-content blue-text text-darken-1"><span class="card-title">' + json[keys[i]].title + '</span><p class="grey-text text-darken-3">' + json[keys[i]].description + '</p></div><div class="card-action"><svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg><div class="points-card grey-text">' + json[keys[i]].points + ' pts</div></div></div></div>';
            } else { // not achieved
                document.getElementById('unachieved').innerHTML += '<div class="col s12 m3"><div class="animated fadeIn card grey lighten-2 hoverable"><div class="card-content blue-text text-darken-1"><span class="card-title">' + json[keys[i]].title + '</span><p class="grey-text text-darken-3">' + json[keys[i]].description + '</p></div><div class="card-action"><i class="animated rotateIn material-icons" style="font-size:40px; color:red">not_interested</i><div class="points-card grey-text">' + json[keys[i]].points + ' pts</div></div></div></div>';
            }
        }
        document.getElementById('points').innerHTML += '<span class="right-align"><i class="material-icons yellow-text text-darken-1">star</i> Your Points: ' + points + '</span>';

        // set cards to hidden and have them incrementally fade in
        cards = document.getElementsByClassName('fadeIn');
        fadeInCount = 0;
        for (var i = 0; i < cards.length; i++) {
            cards[i].className += ' hide';
            setTimeout(fadeIn, 150*i);
        }
    });
}

var cards;
var fadeInCount;
function fadeIn() {
    // remove hide class
    cards[fadeInCount].className = cards[fadeInCount].className.slice(0, cards[fadeInCount].className.length - 5)
    fadeInCount++;
}

var json = {
    "pageLoads1": {
        "title": "Beginner Browser",
        "description": "Achieve 10 page loads",
        "image": "assets/images/1.jpg",
        "points": 10
    },
    "pageLoads2": {
        "title": "Newbie",
        "description": "Achieve 100 page loads",
        "image": "assets/images/2.jpg",
        "points": 15
    },
    "pageLoads3": {
        "title": "Up-and-Comer",
        "description": "Achieve 1000 page loads",
        "image": "assets/images/3.jpg",
        "points": 20
    },
    "pageLoads4": {
        "title": "Internet Addict",
        "description": "Achieve 10000 page loads",
        "image": "assets/images/3.jpg",
        "points": 25
    },
    "wiki1": {
        "title": "Thirst for Knowledge",
        "description": "Read 10 Wikipedia articles",
        "image": "assets/images/4.jpg",
        "points": 10
    },
    "wiki2": {
        "title": "Casual Researcher",
        "description": "Read 100 Wikipedia articles",
        "image": "assets/images/4.jpg",
        "points": 25
    },
    "wiki3": {
        "title": "Scholar",
        "description": "Read 1000 Wikipedia articles",
        "image": "assets/images/4.jpg",
        "points": 10
    },
    "redditAccount": {
        "title": "Redditor",
        "description": "Create a reddit account",
        "image": "assets/images/4.jpg",
        "points": 10
    },
    "rickRoll": {
        "title": "Rick Rolled",
        "description": "Got bamboozled by someone",
        "image": "assets/images/4.jpg",
        "points": 10
    }
}
