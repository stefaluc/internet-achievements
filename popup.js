window.onload() = function() {
    document.body.innerHTML = '';

    // load achievements json file
    $.getJSON("achievements.json", function(json) {
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
                document.body.innerHMTL += '<b>' + keys[i] + '</b>';
            } else {
                document.body.innerHTML += keys[i];
        }
    });
}

// reinitialize page when new achievement message is received
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message.sender == "bg") {
            init();
        }
    }
);
