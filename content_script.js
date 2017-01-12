var interval = setInterval(sniff, 1000);
function sniff() {
    var tab_url = window.location.href;
    var tab_location = window.location.host;
    var tab_html = document.body.innerHTML;
    var message = {url: tab_url, location: tab_location, html: tab_html};
    // send message to background.js
    chrome.runtime.sendMessage(message, function() {});
    clearInterval(interval);
}

// detect user typing a smile or the Konami Code
var konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
var kcPos = 0;
var smileProgress = false;
document.onkeydown = function(e) {
    if (e.key == 'Shift') return;
    if (smileProgress) {
        if (e.key == ')') {
            chrome.runtime.sendMessage({"smile": true}, function() {});
        } else {
            smileProgress = false;
        }
    } else if (e.key == ':') {
        smileProgress = true;
    } else if (e.key == konamiCode[kcPos]) {
        if (kcPos == konamiCode.length - 1) {
            chrome.runtime.sendMessage({"konamiCode": true}, function() {});
        }
        kcPos++;
    } else {
        kcPos = 0;
    }
}
