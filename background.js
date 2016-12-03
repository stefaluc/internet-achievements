// create popup tab, if already created, switch focus to it
function openPopup() {
    var popupUrl = chrome.extension.getURL('popup.html');
    console.log('reached');
    chrome.tabs.query({}, function(extensionTabs) {
        var found = false;
        for (var i=0; i < extensionTabs.length; i++) {
            console.log('popup url:' + popupUrl);
            console.log('tab url:' + extensionTabs[i].url);
            if (popupUrl == extensionTabs[i].url) {
                found = true;
                console.log("tab id: " + extensionsTabs[i].id);
                chrome.tabs.update(extensionTabs[i].id, {"selected":true});
            }
        }
        if (!found) {
            chrome.tabs.create({url: "popup.html"});
        }
    });
}

chrome.extension.onConnect.addListener(function(port) {
    var tab = port.sender.tab;
    // this will get called by the content script we execute in
    // the tab as a result of the user pressing the browser action.
    port.onMessage.addListener(function(info) {
        var max_length = 1024;
        if (info.selection.length > max_length) {
            info.selection = info.selection.substring(0, max_length);
            openPopup();
        }
    });
});

// called when the user clicks on the browser action icon
chrome.browserAction.onClicked.addListener(function(tab) {
    openPopup();
});
