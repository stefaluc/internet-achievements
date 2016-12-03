var achievements = ['pageLoads', 'wiki'];

//--------Handle popup.html opening--------//
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

//--------Handle messaging and storage updates--------//
// called when the user clicks on the browser action icon
chrome.browserAction.onClicked.addListener(function(tab) {
    openPopup();
});

// receive info from content_script.js
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('background.js received message');
        console.log(request);
        updateKey('pageLoads');
    }
);

// updates storage key
function updateKey(key, newVal) {
    var value;
    // get current val
    chrome.storage.sync.get(key, function(result) {
        console.log(result);
        console.log(result.pageLoads);
        value = result.pageLoads;
        // if value is not undefined update, else init 
        if (value) { // update
            if (typeof(value) == 'number') {
                chrome.storage.sync.set({key: value++}); 
            } else {
                chrome.storage.sync.set({key: newVal}); 
            }
        } else { // init
            chrome.storage.sync.set({key: 1});
            console.log("initialized value");
        }
    });
}

// listens for changes in storage
chrome.storage.onChanged.addListener(function(changes, namespace) {
    var newAchievements = [];
    for (key in changes) {
        var change = changes[key];
        console.log("Storage key %s changed. Old val: %s, new val: %s", key, change.oldValue, change.newValue);
        console.log('onChanged change: ' + change);
        console.log('key: ' + key);
        // new achievement, or empty string if nothing updated
        var achievement = checkAchievement(key);
        if (achievement) {
            newAchievements.push(achievement);
        }
    }
    // send message to popup to update
    if (newAchievements) {
        var message = {sender: "bg", achievements: newAchievements};
        chrome.runtime.sendMessage(message, function() {
            console.log('sending message to popup.js');
        }
    }
});

// check if an achievement is gained
function checkAchievement(achievement) {
    switch achievement {
        case 'pageLoads':
            return pageLoads();
        case 'wiki':
            return wiki();
    }
    console.log("Should not have reached (checkAcievement: %s)", achievement);
}

//--------Achievement checking functions--------//
function pageLoads() {
    var numPageLoads;
    chrome.storage.sync.get('numPageLoads', function(result) {
        numPageLoads = result.pageLoads;
        if (numPageLoads > 10000) {
            // set achievement to true if hasn't been achieved already
            chrome.storage.sync.get('pagesLoad3' function(result) {
                if (result.pageLodsAch1) { return ''; }
                chrome.storage.sync.set(('pageLoads3': true));
                return 'pageLoads3';
            });
        }
        else if (numPageLoads > 1000) {
            // set achievement to true if hasn't been achieved already
            chrome.storage.sync.get('pagesLoads2' function(result) {
                if (result.pageLodsAch1) { return ''; }
                chrome.storage.sync.set(('pageLoads2': true));
                return 'pageLoads2;
            });
        }
        else if (numPageLoads > 100) {
            // set achievement to true if hasn't been achieved already
            chrome.storage.sync.get('pagesLoads1' function(result) {
                if (result.pageLodsAch1) { return ''; }
                chrome.storage.sync.set(('pageLoads1': true));
                return 'pageLoads1';
            });
        }
    });
}

function wiki() {
    return '';
}
