var cardContainer = document.getElementsByClassName('container')[1];

document.onload = function() {
    console.log('reached');
    init();
}

// reinitialize page when new achievement message is received
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        console.log('popup.js receive message. sender: ' + sender);
        if (message.sender == "bg") {
            getJSON('achievements.json').then(function(json) {
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
            }, function(status) { // Promise rejected
                alert('Error in xhr request, status of: ' + status);
            });
            init();
        }
    }
);

// creates xhr promise to get a url
var getJSON = function(url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', chrome.extension.getURL(url), true);
        xhr.responseType = 'json';
        xhr.onload = function() {
            if (xhr.status == 200) {
                resolve(xhr.response);
            } else {
                reject(xhr.status);
            }
        };
        xhr.send();
    });
}

function init() {
    // get achievements.json data
    getJSON('achievements.json').then(function(json) {
        // clear dynamic content to reinit
        cardContainer.innerHTML = '';
        document.getElementById('points').innerHTML = '';

        var keys = Object.keys(json);
        var points = 0;
        // get gained achievements
        chrome.storage.sync.get(keys, function(result) {
            console.log(result[keys[0]]);
            console.log(result);
            cardContainer.innerHTML += '<div id="achieved" class="row"></div>';
            cardContainer.innerHTML += '<div id="unachieved" class="row"></div>';
            // display all achievements
            for(var i = 0; i < keys.length; i++) {
                if(result[keys[i]] && result[keys[i]].achieved) { // achieved
                    console.log(json[keys[i]].points);
                    points += json[keys[i]].points;
                    document.getElementById('achieved').innerHTML += '<div class="col s12 m3"><div class="animated fadeIn card small white hoverable"><div class="card-content blue-text text-darken-1"><span class="card-title">' + json[keys[i]].title + '</span><p class="grey-text text-darken-3">' + json[keys[i]].description + '</p><p class="grey-text date">' + result[keys[i]].date + '</p></div><div class="card-action"><svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg><div class="points-card grey-text">' + json[keys[i]].points + ' pts</div></div></div></div>';
                } else { // not achieved
                    document.getElementById('unachieved').innerHTML += '<div class="col s12 m3"><div class="animated fadeIn card small grey lighten-3 hoverable"><div class="card-content blue-text text-darken-1"><span class="card-title">' + json[keys[i]].title + '</span><p class="grey-text text-darken-3">' + json[keys[i]].description + '</p></div><div class="card-action"><i class="animated rotateIn material-icons" style="font-size:40px; color:red">not_interested</i><div class="points-card grey-text">' + json[keys[i]].points + ' pts</div></div></div></div>';
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
    }, function(status) { // Promise rejected
        alert('Error in xhr request, status of: ' + status);
    });
}

var cards;
var fadeInCount;
function fadeIn() {
    // remove hide class
    cards[fadeInCount].className = cards[fadeInCount].className.slice(0, cards[fadeInCount].className.length - 5)
    fadeInCount++;
}
