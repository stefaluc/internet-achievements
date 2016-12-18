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
    console.log(keys);
    var achieved = false;
    // check what achievements have been achieved
    chrome.storage.sync.get(keys, function(result) {
        console.log(result);
        // display gained achievements
        for(var i = 0; i < Object.keys(result).length; i++) {
            document.body.innerHTML += '<b>' + keys[i]+ '</b>';
        }
        // non-gained achievements
        document.body.innerHTML += keys[i];
    });
}

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
