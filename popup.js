var json = {
    "pageLoads1": {
        "image": "assets/images/1.jpg",
        "description": "pageLoads1"
    },
    "pageLoads2": {
        "image": "assets/images/2.jpg",
        "description": "pageLoads2"
    },
    "pageLoads3": {
        "image": "assets/images/3.jpg",
        "description": "pageLoads3"
    },
    "wiki": {
        "image": "assets/images/4.jpg",
        "description": "wiki"
    }
}

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

    // load achievements json file
    //var json = JSON.parse(achievements);
    console.log(json);
    var keys = Object.keys(json);
    for(var i=0; i < keys.length; i++) {
        var achieved = false;
        // check what achievements have been achieved
        chrome.storage.sync.get(keys[i], function(result) {
            if (result[keys[i]]) {
                achieved = true;
            }
        });
        if (achieved) {
            document.body.innerHMTL += '<b>' + keys[i]+ '</b>';
        } else {
            document.body.innerHTML += keys[i];
        }
    }
}
