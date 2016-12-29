var interval = setInterval(sniff, 1000);
function sniff() {
    var tab_url = window.location.href;
    var tab_location = window.location.host;
    var tab_html = document.body.innerHTML;
    var message = {url: tab_url, location: tab_location, html: tab_html};
    // send message to background.js
    chrome.runtime.sendMessage(message, function() {
        console.log("sent data from content_script.js");
    });
    clearInterval(interval);
}

// detect user typing smile
var smileProgress = false;
document.onkeydown = function(e) {
    if (e.key == 'Shift') return;
    if (smileProgress) {
        if (e.key == ')') {
            chrome.runtime.sendMessage({"smile": true}, function() {
                console.log('smile typed, sending message to background.js');
            });
        } else {
            smileProgress = false;
        }
    } else if (e.key == ':') {
        smileProgress = true;
    }
}
