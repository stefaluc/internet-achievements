window.onload = function() {
    var tab_url = window.location.href;
    var tab_location = window.location.host;
    var tab_html = document.body.innerHTML;
    var message = {url: tab_url, location: tab_location, html: tab_html};
    // send message to background.js
    chrome.runtime.sendMessage(message, function() {
        console.log("sent data from content_script.js");
    });
}
